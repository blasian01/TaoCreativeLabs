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
    metadataBase: new URL("https://taocreativelabs.com"),
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
        url: "https://taocreativelabs.com",
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

const jsonLd = [
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Tao Creative Labs LLC",
        url: "https://taocreativelabs.com",
        logo: "https://taocreativelabs.com/logo.svg",
        description:
            "Applied artificial intelligence company and venture studio building consumer AI applications and business automation systems.",
        sameAs: [],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: "hello@taocreativelabs.com",
            url: "https://taocreativelabs.com/contact",
        },
        knowsAbout: [
            "Artificial Intelligence",
            "Machine Learning",
            "AI Automation",
            "Natural Language Processing",
            "Computer Vision",
            "Local LLM Deployment",
            "Retrieval-Augmented Generation",
        ],
    },
    {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: "Tao Creative Labs AI Consulting",
        provider: {
            "@type": "Organization",
            name: "Tao Creative Labs LLC",
        },
        url: "https://taocreativelabs.com/consulting",
        description:
            "AI consulting services including strategy, implementation roadmaps, workflow automation, and custom model deployments for businesses.",
        serviceType: "AI Consulting",
        areaServed: "Worldwide",
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "AI Services",
            itemListElement: [
                {
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "Service",
                        name: "AI Workflow Automation",
                        description: "Automate business processes with intelligent agents, integrations, and internal copilots.",
                    },
                },
                {
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "Service",
                        name: "Enterprise Knowledge Bases",
                        description: "AI-powered RAG systems with semantic search over internal documents and databases.",
                    },
                },
                {
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "Service",
                        name: "Private AI Deployments",
                        description: "On-premise AI model deployment with complete data sovereignty and air-gapped operation.",
                    },
                },
            ],
        },
    },
    {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Tao Creative Labs Products",
        description: "Consumer AI applications built and operated by Tao Creative Labs.",
        url: "https://taocreativelabs.com/products",
        numberOfItems: 6,
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                item: {
                    "@type": "SoftwareApplication",
                    name: "ReelChef",
                    url: "https://www.reelchef.app/",
                    applicationCategory: "LifestyleApplication",
                    description: "AI cooking assistant that converts social media food videos into structured recipes and meal plans.",
                    operatingSystem: "iOS, Web",
                },
            },
            {
                "@type": "ListItem",
                position: 2,
                item: {
                    "@type": "SoftwareApplication",
                    name: "Aura",
                    url: "https://www.wearaura.app/",
                    applicationCategory: "LifestyleApplication",
                    description: "AI virtual try-on and wardrobe assistant that helps users visualize outfits and clothing.",
                    operatingSystem: "iOS",
                },
            },
            {
                "@type": "ListItem",
                position: 3,
                item: {
                    "@type": "SoftwareApplication",
                    name: "LucidDreamz",
                    url: "https://www.luciddreamz.app/",
                    applicationCategory: "EntertainmentApplication",
                    description: "AI character roleplay and conversational storytelling platform.",
                    operatingSystem: "Web",
                },
            },
            {
                "@type": "ListItem",
                position: 4,
                item: {
                    "@type": "SoftwareApplication",
                    name: "Notica",
                    url: "https://www.getnotica.com/",
                    applicationCategory: "BusinessApplication",
                    description: "Offline-first private AI notes and local LLM workspace.",
                    operatingSystem: "iOS",
                },
            },
            {
                "@type": "ListItem",
                position: 5,
                item: {
                    "@type": "SoftwareApplication",
                    name: "PocketManga",
                    url: "https://www.pocketmanga.app/",
                    applicationCategory: "EntertainmentApplication",
                    description: "AI manga and comic creation platform.",
                    operatingSystem: "iOS",
                },
            },
        ],
    },
];

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
