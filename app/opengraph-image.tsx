import { ImageResponse } from "next/og";

export const alt = "WebPreKandidata.sk – profesionálny volebný web bez programátora";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #102f52 0%, #163b65 58%, #0f766e 100%)",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: "76px 84px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <div style={{ color: "#8ce5d6", display: "flex", fontSize: 25, fontWeight: 700 }}>
            WebPreKandidata.sk
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-3px",
              lineHeight: 1.04,
              marginTop: 44,
            }}
          >
            Profesionálny web
            <span style={{ color: "#8ce5d6" }}>pre vašu kandidatúru.</span>
          </div>
          <div style={{ color: "#d8e6f1", display: "flex", fontSize: 27, marginTop: 34 }}>
            Náhľad zdarma. Platba až pri zverejnení.
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            background: "#ffffff",
            borderRadius: 38,
            color: "#163b65",
            display: "flex",
            fontSize: 112,
            fontWeight: 800,
            height: 240,
            justifyContent: "center",
            width: 240,
          }}
        >
          W
        </div>
      </div>
    ),
    size,
  );
}
