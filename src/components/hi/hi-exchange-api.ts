export type HiExchangePayload = {
  name: string;
  email: string;
  phone?: string;
  countryCode: string;
  turnstileToken: string;
  website?: string;
};

export type HiDetailsPayload = {
  token: string;
  jobTitle?: string;
  company?: string;
  note?: string;
};

export async function postHiExchange(
  payload: HiExchangePayload,
): Promise<{ ok: true; token: string } | { ok: false; message: string }> {
  const response = await fetch("/api/hi/exchange", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as { ok?: boolean; token?: string; error?: string };
  if (!response.ok) {
    return { ok: false, message: data.error ?? "Something went wrong. Please try again." };
  }
  return { ok: true, token: data.token ?? "" };
}

export async function postHiDetails(
  payload: HiDetailsPayload,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch("/api/hi/details", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as { ok?: boolean; error?: string };
  if (!response.ok) {
    return { ok: false, message: data.error ?? "Something went wrong. Please try again." };
  }
  return { ok: true };
}
