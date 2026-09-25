import { siteContent } from "@/content/site";
import { loadOgVinesDataUri } from "@/lib/og-vines-data-uri";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = siteContent.meta.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontsDir = join(process.cwd(), "src/assets/fonts/figtree");

export default async function OpenGraphImage() {
  const { brand, meta } = siteContent;
  const [fontSemiBold, fontBold, vinesSrc] = await Promise.all([
    readFile(join(fontsDir, "Figtree-SemiBold.ttf")),
    readFile(join(fontsDir, "Figtree-Bold.ttf")),
    Promise.resolve(loadOgVinesDataUri()),
  ]);

  const { ogHeadline } = meta;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: 300,
        boxSizing: "border-box",
        overflow: "hidden",
        background: "#0F1612",
        fontFamily: "Figtree",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 760,
          top: -210,
          width: 640,
          height: 640,
          borderTopLeftRadius: 640,
          borderTopRightRadius: 70,
          borderBottomRightRadius: 640,
          borderBottomLeftRadius: 70,
          background: "#193124",
        }}
      />
      <img
        src={vinesSrc}
        alt=""
        width={1200}
        height={630}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          fontSize: 78,
          lineHeight: 1.05,
          fontWeight: 600,
          letterSpacing: "-2.34px",
          color: "#EEEFE9",
          whiteSpace: "nowrap",
        }}
      >
        <div>{ogHeadline[0]}</div>
        <div>{ogHeadline[1]}</div>
        <div style={{ color: "#8ED09C" }}>{ogHeadline[2]}</div>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 5,
            borderBottomRightRadius: 32,
            borderBottomLeftRadius: 5,
            background: "#8ED09C",
          }}
        />
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#EEEFE9",
            letterSpacing: "-0.36px",
          }}
        >
          {brand}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Figtree",
          data: fontSemiBold,
          weight: 600,
          style: "normal",
        },
        {
          name: "Figtree",
          data: fontBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
