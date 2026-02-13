import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tao Creative Labs — Applied Artificial Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "#fafafa",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                {/* Grid pattern */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            fontSize: 14,
                            fontWeight: 400,
                            letterSpacing: "0.35em",
                            color: "#8a8a8a",
                            textTransform: "uppercase",
                            marginBottom: 24,
                        }}
                    >
                        Applied Artificial Intelligence
                    </div>
                    <div
                        style={{
                            fontSize: 64,
                            fontWeight: 300,
                            color: "#1a1a1a",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Tao Creative Labs
                    </div>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 300,
                            color: "#8a8a8a",
                            marginTop: 20,
                        }}
                    >
                        Intelligent software for people and businesses.
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 32,
                        fontSize: 13,
                        fontWeight: 300,
                        color: "#bdbdbd",
                        letterSpacing: "0.1em",
                    }}
                >
                    fortaify.com
                </div>
            </div>
        ),
        { ...size }
    );
}
