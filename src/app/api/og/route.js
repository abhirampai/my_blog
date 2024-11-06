import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export const GET = (req) => {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Default Title";
  const keywords = searchParams.get("keywords") || ["Default Keywords"];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          color: "black",
          overflowY: "auto",
          padding: "0 4rem",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          background:
            "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2 style={{ fontSize: "5rem" }}>{title}</h2>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              fontSize: "2rem",
            }}
          >
            {keywords
              .split(",")
              .slice(0, 4)
              .map((keyword, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "1rem",
                    border: "1px solid white",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                  }}
                >
                  {keyword}
                </div>
              ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
};
