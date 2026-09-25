import { siteContent } from "@/content/site";
import { ImageResponse } from "next/og";

export const alt = siteContent.meta.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const { brand, meta } = siteContent;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "72px 80px",
        background: "#f8faf6",
        color: "#1e2e28",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "48px 8px 48px 8px",
            background: "#2d5f48",
          }}
        />
        <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.02em" }}>{brand}</span>
      </div>
      <p
        style={{
          margin: 0,
          maxWidth: 900,
          fontSize: 40,
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: "#2a5742",
        }}
      >
        {meta.openGraphDescription}
      </p>
    </div>,
    { ...size },
  );
}
