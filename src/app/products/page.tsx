import { publicProducts as products } from "@/data/publicPortfolio";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/PageTransition";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
    alternates: { canonical: "/products" },
    openGraph: { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Tao Creative Labs" }], title: "Product Portfolio | Tao Creative Labs", description: "Explore products from Tao Creative Labs. Find official product websites and review current capabilities, availability and terms.", url: "/products" },
    twitter: { card: "summary_large_image", title: "Product Portfolio | Tao Creative Labs", description: "Explore products from Tao Creative Labs. Find official product websites and review current capabilities, availability and terms.", images: ["/opengraph-image"] },
    title: "Product Portfolio",
    description:
        "Explore products from Tao Creative Labs. Find official product websites and review current capabilities, availability and terms.",
};


export default function ProductsPage() {
    return (
        <div className="relative z-[1] section-bg pt-32 pb-24 px-6 lg:px-12">

            <div className="mx-auto max-w-7xl relative">
                <FadeIn>
                    <SectionHeading as="h1"
                        title="Explore our products"
                        subtitle="Explore products from Tao Creative Labs. Visit each product site for current capabilities, availability and terms."
                    />
                </FadeIn>

                <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <StaggerItem key={product.name}>
                            <ProductCard
                                name={product.name}
                                description={product.description}
                                href={product.href}
                                icon={product.icon}
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
