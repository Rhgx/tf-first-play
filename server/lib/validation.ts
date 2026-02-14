import { z } from "zod";
import { ApiError } from "./errors";

const lookupSchema = z.object({
  input: z.string().trim().min(1, "Input is required"),
});

export async function parseLookupRequest(request: Request): Promise<{ input: string }> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ApiError("Request body must be valid JSON", 400);
  }

  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message);
    throw new ApiError("Invalid lookup request", 400, details);
  }

  return {
    input: parsed.data.input,
  };
}
