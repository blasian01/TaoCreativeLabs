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
    metadataBase: new URL("https://www.taocreativelabs.com"),
    title: {
        default: "Tao Creative Labs | Apps and AI Services",
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
    authors: [{ name: "Tao Creative Labs" }],
    creator: "Tao Creative Labs",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://www.taocreativelabs.com",
        siteName: "Tao Creative Labs",
        title: "Tao Creative Labs | Apps and AI Services",
        description:
            "We design and deploy intelligent software for people and businesses.",
        images: [
            {
                url: "/opengraph-image",
                width: 1200,
                height: 630,
                alt: "Tao Creative Labs",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Tao Creative Labs | Apps and AI Services",
        description:
            "We design and deploy intelligent software for people and businesses.",
        images: ["/opengraph-image"],
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

const jsonLd = [
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://www.taocreativelabs.com/#organization",
        "name": "Tao Creative Labs",
        "url": "https://www.taocreativelabs.com/",
        "logo": "https://www.taocreativelabs.com/logo.png",
        "description": "Software studio developing consumer applications and offering AI consulting and implementation services."
    },
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://www.taocreativelabs.com/#website",
        "name": "Tao Creative Labs",
        "url": "https://www.taocreativelabs.com/",
        "publisher": {
            "@id": "https://www.taocreativelabs.com/#organization"
        }
    }
];

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
            <head>
                <link rel="icon" href="/favicon.png" type="image/png" />
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
