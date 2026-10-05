import { createBookRedirectResponse } from "@/lib/book/book-redirect";
import { resolveBookRedirectDestination } from "@/lib/book/read-booking-url";

export function GET(): Response {
  return createBookRedirectResponse(resolveBookRedirectDestination());
}
