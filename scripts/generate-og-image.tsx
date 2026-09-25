import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import React from "react";
import { siteContent } from "../src/content/site";

const root = join(import.meta.dirname, "..");
const vinesSvg = readFileSync(join(root, "src/assets/og/og-vines.svg"), "utf8");
const vinesSrc = `data:image/svg+xml;base64,${Buffer.from(vinesSvg, "utf8").toString("base64")}`;
const figtreeSemiBoldFont = readFileSync(
  join(root, "src/assets/fonts/figtree/Figtree-SemiBold.ttf"),
);
const figtreeBoldFont = readFileSync(join(root, "src/assets/fonts/figtree/Figtree-Bold.ttf"));

const { brand, meta } = siteContent;
const { ogHeadline, ogImageAlt } = meta;

async function main() {
  const imageResponse = new ImageResponse(
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
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Figtree",
          data: figtreeSemiBoldFont,
          weight: 600,
          style: "normal",
        },
        {
          name: "Figtree",
          data: figtreeBoldFont,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );

  const pngBuffer = Buffer.from(await imageResponse.arrayBuffer());
  writeFileSync(join(root, "src/app/opengraph-image.png"), pngBuffer);
  writeFileSync(join(root, "src/app/opengraph-image.alt.txt"), ogImageAlt);
  console.log("Wrote src/app/opengraph-image.png and src/app/opengraph-image.alt.txt");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
