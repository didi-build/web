import { createBookRedirectResponse } from "@/lib/hi/book-redirect";

export function GET(): Response {
  return createBookRedirectResponse();
}
