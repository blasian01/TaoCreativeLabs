import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { AnimatedGrid } from "@/components/ui/AnimatedGrid";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://fortaify.com"),
    title: {
        default: "Tao Creative Labs — Applied Artificial Intelligence",
        template: "%s | Tao Creative Labs",
    },
    description:
        "Tao Creative Labs is an applied artificial intelligence company and venture studio. We build consumer AI applications, automation systems, and provide AI consulting for businesses.",
    keywords: [
        "artificial intelligence",
        "AI automation",
        "AI consulting",
        "venture studio",
        "AI products",
        "machine learning",
        "Tao Creative Labs",
    ],
    authors: [{ name: "Tao Creative Labs LLC" }],
    creator: "Tao Creative Labs LLC",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://fortaify.com",
        siteName: "Tao Creative Labs",
        title: "Tao Creative Labs — Applied Artificial Intelligence",
        description:
            "We design and deploy intelligent software for people and businesses.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Tao Creative Labs",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Tao Creative Labs — Applied Artificial Intelligence",
        description:
            "We design and deploy intelligent software for people and businesses.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tao Creative Labs LLC",
    url: "https://fortaify.com",
    logo: "https://fortaify.com/logo.svg",
    description:
        "Applied artificial intelligence company and venture studio building consumer AI applications and business automation systems.",
    sameAs: [],
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        url: "https://fortaify.com/contact",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="font-sans antialiased">
                <AnimatedGrid />
                <Navbar />
                <main className="min-h-screen">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
