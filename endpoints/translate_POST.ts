import { schema, OutputType } from "./translate_POST.schema";

// This is the server-side handler for the translation endpoint.
// It receives Hebrew text and returns English translation using Google Cloud Translation API v2 with MyMemory fallback.

export async function handle(request: Request): Promise<Response> {
  // 1. Check for POST method
  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    // 2. Parse and validate the request body
    const json = await request.json();
    const { text } = schema.parse(json);

    if (!text.trim()) {
      return Response.json({ error: "Text to translate cannot be empty." }, { status: 400 });
    }

    console.log(`Translation requested for text of ${text.length} characters`);
    
    // Debug: Show which API key is being used (masked for security)
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (apiKey) {
      console.log(`Using Google Translate API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    } else {
      console.log("⚠️ No Google Translate API key found in environment variables");
    }
    
    // 3. Try Google Cloud Translation API v2 first
    try {
      console.log("Attempting translation with Google Translate API...");
      
      if (!apiKey) {
        throw new Error("Google Translate API key not configured");
      }
      
      const googleTranslateUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      
      const requestBody = {
        q: text.trim(),
        source: "he",
        target: "en"
      };
      
      const googleResponse = await fetch(googleTranslateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      if (googleResponse.ok) {
        const responseData = await googleResponse.json();
        
        // Handle Google Translate API response
        if (responseData.data && responseData.data.translations && Array.isArray(responseData.data.translations) && responseData.data.translations.length > 0) {
          const translatedText = responseData.data.translations[0].translatedText;

          if (translatedText) {
            console.log(`✅ Translation completed successfully using Google Translate. Input length: ${text.length}, output length: ${translatedText.length}`);
            return Response.json({ translatedText } satisfies OutputType);
          }
        }
        
        console.error("Invalid Google Translate API response structure:", responseData);
        throw new Error("Invalid Google Translate response structure");
      } else {
        const errorText = await googleResponse.text();
        console.error(`Google Translate API HTTP error: ${googleResponse.status} ${googleResponse.statusText}`, errorText);
        
        // Enhanced error handling for API key issues
        if (googleResponse.status === 403) {
          console.error("❌ Google Translate API key appears to be invalid or lacks permissions");
          throw new Error("Google Translate API key authentication failed (403 Forbidden)");
        } else if (googleResponse.status === 400) {
          console.error("❌ Google Translate API request was malformed");
          throw new Error("Google Translate API request error (400 Bad Request)");
        } else if (googleResponse.status === 429) {
          console.error("❌ Google Translate API quota exceeded");
          throw new Error("Google Translate API quota exceeded (429 Too Many Requests)");
        }
        
        throw new Error(`Google Translate API error: ${googleResponse.status} ${googleResponse.statusText}`);
      }
    } catch (googleError) {
      console.log(`⚠️ Google Translate failed, attempting fallback to MyMemory API...`);
      console.error("Google Translate error:", googleError instanceof Error ? googleError.message : googleError);
      
      // 4. Fallback to MyMemory API
      try {
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=he|en`;
        
        const myMemoryResponse = await fetch(myMemoryUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Memorial Website Translation Service"
          }
        });

        if (!myMemoryResponse.ok) {
          const errorText = await myMemoryResponse.text();
          console.error(`MyMemory API HTTP error: ${myMemoryResponse.status} ${myMemoryResponse.statusText}`, errorText);
          throw new Error(`MyMemory API error: ${myMemoryResponse.status} ${myMemoryResponse.statusText}`);
        }

        const myMemoryData = await myMemoryResponse.json();
        
        // Handle MyMemory API response
        if (myMemoryData.responseStatus === 200 && myMemoryData.responseData && myMemoryData.responseData.translatedText) {
          const translatedText = myMemoryData.responseData.translatedText;
          
          console.log(`✅ Translation completed successfully using MyMemory API (fallback). Input length: ${text.length}, output length: ${translatedText.length}`);
          return Response.json({ translatedText } satisfies OutputType);
        } else {
          console.error("Invalid MyMemory API response:", myMemoryData);
          throw new Error("Invalid MyMemory response structure");
        }
      } catch (myMemoryError) {
        console.error("MyMemory API fallback also failed:", myMemoryError instanceof Error ? myMemoryError.message : myMemoryError);
        
        // Both services failed - provide specific error messages based on Google Translate failure
        let errorMessage: string;
        
        if (googleError instanceof Error) {
          if (googleError.message.includes("403") || googleError.message.includes("authentication failed")) {
            errorMessage = "Translation service unavailable: Google Translate API key authentication failed. Please check the API key configuration.";
          } else if (googleError.message.includes("not configured")) {
            errorMessage = "Translation service unavailable: Google Translate API key is not configured.";
          } else if (googleError.message.includes("429") || googleError.message.includes("quota exceeded")) {
            errorMessage = "Translation service temporarily unavailable: Google Translate API quota exceeded. Please try again later.";
          } else {
            errorMessage = "Translation failed. Both Google Translate and backup translation service are currently unavailable. Please try again later.";
          }
        } else {
          errorMessage = "Translation failed. Both Google Translate and backup translation service are currently unavailable. Please try again later.";
        }
          
        return Response.json({ 
          error: errorMessage
        }, { status: 502 });
      }
    }

  } catch (error) {
    // 5. Enhanced error handling
    if (error instanceof Error) {
      console.error("Translation endpoint error:", error.message);
      
      // Check if it's a validation error (Zod)
      if (error.message.includes("Text to translate cannot be empty")) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      
      // Other validation errors
      return Response.json({ error: error.message }, { status: 400 });
    }
    
    console.error("An unknown error occurred in the translation endpoint:", error);
    return Response.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}