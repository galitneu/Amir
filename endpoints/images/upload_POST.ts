import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType, Image } from "./upload_POST.schema";

// Helper function to convert Uint8Array to base64 string
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

// Helper function to convert base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const uint8Array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  return uint8Array;
}

// Helper function to compare two Uint8Arrays
function uint8ArraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function toBase64(file: File): Promise<string> {
  try {
    console.log('=== toBase64 conversion started ===');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Get the binary data from the file
    console.log('Converting file to arrayBuffer...');
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('ArrayBuffer details:', {
      byteLength: arrayBuffer.byteLength,
      sizeMatches: arrayBuffer.byteLength === file.size
    });

    // Convert ArrayBuffer to Uint8Array
    console.log('Converting arrayBuffer to Uint8Array...');
    const uint8Array = new Uint8Array(arrayBuffer);

    // Log first few bytes of the arrayBuffer for debugging
    const firstBytes = Array.from(uint8Array.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log('First 16 bytes of arrayBuffer (hex):', firstBytes);
    console.log('First 16 bytes of arrayBuffer (decimal):', Array.from(uint8Array.slice(0, 16)));
    
    console.log('Uint8Array details:', {
      length: uint8Array.length,
      sizeMatches: uint8Array.length === arrayBuffer.byteLength
    });

    // Log first few bytes of the uint8Array for comparison
    const uint8FirstBytes = uint8Array.subarray(0, 16);
    console.log('First 16 bytes of Uint8Array (hex):', Array.from(uint8FirstBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
    console.log('First 16 bytes of Uint8Array (decimal):', Array.from(uint8FirstBytes));

    console.log('Converting Uint8Array to base64...');
    const base64String = uint8ArrayToBase64(uint8Array);
    
    console.log('Base64 conversion details:', {
      base64Length: base64String.length,
      expectedLength: Math.ceil((uint8Array.length * 4) / 3),
      first64Chars: base64String.substring(0, 64),
      last64Chars: base64String.substring(Math.max(0, base64String.length - 64))
    });

    // Verify round-trip conversion
    const testUint8Array = base64ToUint8Array(base64String);
    const roundTripMatches = uint8ArraysEqual(testUint8Array, uint8Array);
    console.log('Round-trip verification:', {
      originalUint8ArrayLength: uint8Array.length,
      decodedUint8ArrayLength: testUint8Array.length,
      roundTripMatches: roundTripMatches
    });

    if (!roundTripMatches) {
      console.error('CORRUPTION DETECTED: Round-trip conversion failed!');
      // Log more details about the mismatch
      const firstMismatchIndex = uint8Array.findIndex((byte, index) => byte !== testUint8Array[index]);
      console.error('First mismatch at index:', firstMismatchIndex);
      if (firstMismatchIndex >= 0) {
        console.error('Original byte at mismatch:', uint8Array[firstMismatchIndex]);
        console.error('Decoded byte at mismatch:', testUint8Array[firstMismatchIndex]);
      }
    }

    console.log('=== toBase64 conversion completed successfully ===');
    return base64String;
  } catch (error) {
    console.error('=== toBase64 conversion failed ===');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    throw new Error(`Failed to convert file to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handle(request: Request): Promise<Response> {
  try {
    console.log('=== Image upload request started ===');
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      console.log('Upload rejected: User not admin', { userId: user.id, userRole: user.role });
      return Response.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    console.log('Admin user authenticated:', { userId: user.id });

    const formData = await request.formData();
    console.log('FormData received, extracting fields...');
    
    // Extract fields from FormData to regular object
    const imageFromForm = formData.get('image') as File | null;
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    
    console.log('FormData fields extracted:', {
      hasImageFile: !!imageFromForm,
      imageName: imageFromForm?.name,
      imageSize: imageFromForm?.size,
      imageType: imageFromForm?.type,
      providedName: name,
      providedDescription: description
    });
    
    // Check that file exists before validation
    if (!imageFromForm) {
      console.error('Upload failed: No image file provided');
      return Response.json(
        { error: "Image file is required." },
        { status: 400 }
      );
    }
    
    // Prepare object for Zod validation
    const dataToValidate = {
      image: imageFromForm,
      name: name || undefined,
      description: description || undefined,
    };
    
    console.log('Starting Zod validation...');
    const result = schema.parse(dataToValidate);
    console.log('Zod validation passed');

    const imageFile = result.image;
    console.log('Processing image file:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      lastModified: imageFile.lastModified
    });

    console.log('Starting base64 conversion...');
    const imageData = await toBase64(imageFile);
    console.log('Base64 conversion completed, length:', imageData.length);

    // Generate automatic name if not provided
    const imageName = result.name || `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Final image name:', imageName);

    console.log('Inserting into database...');
    const [insertedImage] = await db
      .insertInto("images")
      .values({
        name: imageName,
        description: result.description,
        description_en: result.descriptionEn,
        image_data: imageData,
        mime_type: imageFile.type,
      })
      .returningAll()
      .execute();

    if (!insertedImage) {
      console.error('Database insertion failed: No image returned');
      throw new Error("Failed to save image to the database.");
    }
    
    console.log('Image successfully inserted into database:', {
      id: insertedImage.id,
      name: insertedImage.name,
      mimeType: insertedImage.mime_type,
      dataLength: insertedImage.image_data.length
    });
    
    const newImage: Image = {
        id: insertedImage.id,
        name: insertedImage.name,
        description: insertedImage.description,
        descriptionEn: insertedImage.description_en,
        mimeType: insertedImage.mime_type,
        createdAt: insertedImage.created_at,
    };

    console.log('=== Image upload completed successfully ===');
    return Response.json({ image: newImage } satisfies OutputType, { status: 201 });
  } catch (error) {
    console.error("=== Image upload failed ===");
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}