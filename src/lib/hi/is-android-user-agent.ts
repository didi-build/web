/** True when the UA looks like Android (used for post-download vCard hint). */
export function isAndroidUserAgent(userAgent: string): boolean {
  return userAgent.includes("Android");
}
