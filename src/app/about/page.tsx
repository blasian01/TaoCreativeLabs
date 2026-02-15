import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
    title: "About",
    description:
        "Tao Creative Labs is an AI venture studio focused on practical applied AI, privacy-respecting systems, and production-grade intelligent software.",
};

const values = [
    {
        title: "Engineering-driven",
        description:
            "Every decision starts with engineering rigor. We ship production systems, not proof-of-concepts. Our products run continuously, serve real users, and must be reliable.",
        color: "text-brand-violet",
    },
    {
        title: "Product-focused",
        description:
            "We build tools that people want to use. Beautiful interfaces, thoughtful UX, and clear utility. AI is the engine — the product is the experience.",
        color: "text-brand-cyan",
    },
    {
        title: "Deployment-oriented",
        description:
            "A model that doesn't ship has no value. We optimize for deployability: containerized services, edge-ready inference, local-first architectures, and monitored pipelines.",
        color: "text-brand-amber",
    },
    {
        title: "Privacy-respecting",
        description:
            "We believe AI should work for users, not surveil them. Local inference, minimal data collection, and transparent processing are core to how we build.",
        color: "text-brand-rose",
    },
];

export default function AboutPage() {
    return (
        <div className="relative z-[1] section-bg pt-32 pb-24 px-6 lg:px-12">

            <div className="mx-auto max-w-7xl relative">
                <FadeIn>
                    <SectionHeading title="About" />
                </FadeIn>

                {/* Mission */}
                <FadeIn delay={0.1}>
                    <div className="mx-auto max-w-3xl text-center mb-24">
                        <p className="text-[17px] font-light leading-[1.8] text-ink-light">
                            Tao Creative Labs is an applied artificial intelligence company and
                            venture studio. We design, build, and operate intelligent software —
                            from consumer applications to enterprise automation systems.
                        </p>
                        <p className="mt-6 text-[17px] font-light leading-[1.8] text-ink-light">
                            Founded on the principle that AI should be practical, private, and
                            accessible, we maintain a portfolio of production applications and
                            provide consulting services to businesses navigating AI adoption.
                        </p>
                    </div>
                </FadeIn>

                {/* Values */}
                <FadeIn>
                    <h3 className="font-grotesk text-xl font-light text-ink mb-12 text-center">
                        How We Work
                    </h3>
                </FadeIn>
                <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {values.map((value) => (
                        <StaggerItem key={value.title}>
                            <GlassCard className="h-full">
                                <h4 className={`font-grotesk text-lg font-light ${value.color}`}>
                                    {value.title}
                                </h4>
                                <p className="mt-3 text-[14px] font-light leading-relaxed text-ink-light">
                                    {value.description}
                                </p>
                            </GlassCard>
                        </StaggerItem>
                    ))}
                </Stagger>

                {/* Stats */}
                <FadeIn delay={0.2}>
                    <div className="mt-24 liquid-glass rounded-2xl p-12">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            <div className="text-center">
                                <p className="font-grotesk text-3xl font-light gradient-text">6+</p>
                                <p className="mt-2 text-[12px] font-light uppercase tracking-[0.15em] text-ink-muted">
                                    Live products
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="font-grotesk text-3xl font-light gradient-text">B2B + B2C</p>
                                <p className="mt-2 text-[12px] font-light uppercase tracking-[0.15em] text-ink-muted">
                                    Market focus
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="font-grotesk text-3xl font-light gradient-text">Full-stack</p>
                                <p className="mt-2 text-[12px] font-light uppercase tracking-[0.15em] text-ink-muted">
                                    AI capability
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="font-grotesk text-3xl font-light gradient-text">Private</p>
                                <p className="mt-2 text-[12px] font-light uppercase tracking-[0.15em] text-ink-muted">
                                    By default
                                </p>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={0.3}>
                    <div className="mt-16 text-center">
                        <Button href="/contact" variant="secondary">
                            Work with Us
                        </Button>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
