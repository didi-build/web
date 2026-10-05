export function createBookRedirectResponse(destination: string): Response {
  return Response.redirect(destination, 307);
}
