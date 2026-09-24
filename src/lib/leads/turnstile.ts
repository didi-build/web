export type TurnstileVerifier = (token: string) => Promise<boolean>;

export function createTurnstileVerifier(secretKey: string): TurnstileVerifier {
  return async (token: string) => {
    if (!secretKey) {
      return false;
    }
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });
    if (!response.ok) {
      return false;
    }
    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  };
}
