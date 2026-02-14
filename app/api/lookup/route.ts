import { handleLookup } from "@/server/routes/lookup";

export async function POST(request: Request): Promise<Response> {
  return handleLookup(request);
}
