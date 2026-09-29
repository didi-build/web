import sharp from "sharp";

const CAPTCHA_RESULT_CHALLENGE = new Set([
  "CAPTCHA_BLOCKING",
  "CAPTCHA_NEEDED",
  "CAPTCHA_UNMATCHED",
]);

export type ScreenshotChallengeInput = {
  captchaResult: string | null;
  finalDocumentHttpStatus: number | null;
  screenshotPath: string | null;
};

export type ScreenshotChallengeAssessment = {
  looksLikeChallenge: boolean;
  reasons: string[];
};

/**
 * Heuristic only: PSI captchaResult plus simple image stats (no OCR).
 */
export async function assessScreenshotChallenge(
  input: ScreenshotChallengeInput,
): Promise<ScreenshotChallengeAssessment> {
  const reasons: string[] = [];

  if (input.captchaResult && CAPTCHA_RESULT_CHALLENGE.has(input.captchaResult)) {
    reasons.push(`captchaResult=${input.captchaResult}`);
  }

  let imageReasons: string[] = [];
  if (input.screenshotPath) {
    imageReasons = await analyzeScreenshotPixels(input.screenshotPath);
  }

  const visualChallenge =
    imageReasons.includes("screenshot mostly single color") &&
    imageReasons.includes("screenshot very low color variance");

  if (input.finalDocumentHttpStatus === 202 && visualChallenge) {
    reasons.push(`document HTTP ${input.finalDocumentHttpStatus} with sparse screenshot`);
  }

  if (input.screenshotPath && visualChallenge && input.finalDocumentHttpStatus === 202) {
    reasons.push(...imageReasons);
  }

  return {
    looksLikeChallenge: reasons.length > 0,
    reasons,
  };
}

async function analyzeScreenshotPixels(filePath: string): Promise<string[]> {
  const reasons: string[] = [];
  const { data, info } = await sharp(filePath)
    .resize(64, 64, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const bucket = new Map<string, number>();
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
    bucket.set(key, (bucket.get(key) ?? 0) + 1);
  }

  const pixels = data.length / channels;
  const maxBucket = Math.max(...bucket.values());
  const dominantRatio = maxBucket / pixels;

  if (dominantRatio > 0.85) {
    reasons.push("screenshot mostly single color");
  }

  const stats = await sharp(filePath).stats();
  const channelSpread = stats.channels.map((c) => c.stdev).reduce((a, b) => a + b, 0);
  if (channelSpread < 10) {
    reasons.push("screenshot very low color variance");
  }

  return reasons;
}
