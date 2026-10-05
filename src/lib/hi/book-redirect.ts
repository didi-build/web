/** Moxie scheduler URL for `didi.build/book` (update when the booking tool changes). */
export const PUBLIC_BOOKING_DESTINATION_URL =
  "https://diadem-shoukralla.moxieapp.com/public/diadem-shoukralla/free-30-min-consult";

export function createBookRedirectResponse(): Response {
  return Response.redirect(PUBLIC_BOOKING_DESTINATION_URL, 307);
}
