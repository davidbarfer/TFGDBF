import { ActionError } from "astro:actions";

export async function handleActionError (response: Response): Promise<never> {
  let errorMessage = "An unexpected error occurred";
  
  try {
    // Read the res.end() body stream from your backend API
    const errorData = await response.json();
    if (errorData && errorData.error) {
      errorMessage = errorData.error;
    }
  } catch (e) {
    // Fallback if backend didn't send JSON
    errorMessage = response.statusText || errorMessage;
  }
  // "never" return type because this function guarantees an exception is thrown
  throw new ActionError({
    code: ActionError.statusToCode(response.status),
    message: errorMessage,
  });
}