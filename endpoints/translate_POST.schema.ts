import { z } from "zod";

// Defines the schema for the translation request body.
export const schema = z.object({
  // The text to be translated. Must be a non-empty string.
  text: z.string().min(1, { message: "Text to translate cannot be empty." }),
});

// Infers the TypeScript type from the Zod schema for type safety.
export type InputType = z.infer<typeof schema>;

// Defines the successful output type for the endpoint.
// Note: We do not define a Zod schema for the output, only the TypeScript type.
export type OutputType = {
  translatedText: string;
};

/**
 * A type-checked client-side helper function to call the translation endpoint.
 * This function can be used in frontend components to request a translation.
 *
 * @param body The request body, containing the text to translate.
 * @param init Optional request initializations (e.g., for custom headers or signals).
 * @returns A promise that resolves to the translated text.
 * @throws An error if the request fails or the server returns an error.
 */
export const postTranslate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  // Validate input on the client-side before sending the request.
  const validatedInput = schema.parse(body);
  
  const result = await fetch(`/_api/translate`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = await result.json();
    // Throw an error to be caught by React Query's error handling or a try/catch block.
    throw new Error(errorObject.error || "Translation request failed");
  }

  return result.json();
};