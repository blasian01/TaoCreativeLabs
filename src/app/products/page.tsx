import type { Metadata } from "next";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/PageTransition";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
    title: "Products",
    description:
        "Consumer AI applications by Tao Creative Labs — from AI cooking assistants to virtual try-on tools to creative storytelling platforms.",
};

const products = [
    {
        name: "ReelChef",
        description:
            "AI cooking assistant that converts social media food videos into structured recipes and meal plans. Supports multi-platform import, nutritional analysis, and weekly meal planning.",
        href: "https://www.reelchef.app/",
    },
    {
        name: "Aura",
        description:
            "AI virtual try-on and wardrobe assistant that helps users visualize outfits and clothing. Combines weather-aware recommendations with AI-powered body model generation.",
        href: "https://www.wearaura.app/",
    },
    {
        name: "LucidDreamz",
        description:
            "AI character roleplay and conversational storytelling platform. Features dynamic character progression, voice synthesis, and multi-modal interaction systems.",
        href: "https://www.luciddreamz.app/",
    },
    {
        name: "Notica",
        description:
            "Offline-first private AI notes and local LLM workspace. Run language models entirely on-device for private, secure note-taking and AI-assisted writing.",
        href: "https://www.getnotica.com/",
    },
    {
        name: "PocketManga",
        description:
            "AI manga and comic creation platform. Generate panels, characters, and storylines with identity-preserving AI and export publication-ready manga.",
        href: "https://www.pocketmanga.app/",
    },
    {
        name: "Fortaify",
        description:
            "The infrastructure and parent platform powering Tao Creative Labs applications. Shared authentication, billing, and AI orchestration layer.",
        href: "https://fortaify.com/",
    },
];

export default function ProductsPage() {
    return (
        <div className="relative z-[1] section-bg pt-32 pb-24 px-6 lg:px-12">

            <div className="mx-auto max-w-7xl relative">
                <FadeIn>
                    <SectionHeading
                        title="Products"
                        subtitle="Each product is a fully deployed, production AI application designed for real users."
                    />
                </FadeIn>

                <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <StaggerItem key={product.name}>
                            <ProductCard
                                name={product.name}
                                description={product.description}
                                href={product.href}
                            />
                        </StaggerItem>
                    ))}
                </Stagger>

                <FadeIn delay={0.3}>
                    <div className="mt-20 text-center">
                        <p className="text-[14px] font-light text-ink-muted mb-6">
                            Interested in how these products were built?
                        </p>
                        <Button href="/consulting" variant="secondary">
                            Learn About Our Process
                        </Button>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
