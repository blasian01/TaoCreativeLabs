import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
    title: "Consulting",
    description:
        "AI consulting services from Tao Creative Labs — strategy, implementation, and deployment guidance for businesses adopting artificial intelligence.",
};

const phases = [
    {
        step: "01",
        title: "Discovery",
        description:
            "We assess your current systems, data landscape, and business objectives. This phase identifies where AI creates the highest leverage with the least disruption.",
        color: "text-brand-violet",
    },
    {
        step: "02",
        title: "Architecture",
        description:
            "We design a technical roadmap: which models, what infrastructure, how data flows, and what integrations are needed. Every recommendation comes with a clear rationale.",
        color: "text-brand-cyan",
    },
    {
        step: "03",
        title: "Implementation",
        description:
            "We build and deploy the system — or work alongside your engineering team to do so. This includes model selection, prompt engineering, pipeline construction, and testing.",
        color: "text-brand-amber",
    },
    {
        step: "04",
        title: "Optimization",
        description:
            "Post-deployment, we monitor performance, refine outputs, and iterate. AI systems require tuning — we provide ongoing support to ensure sustained accuracy and reliability.",
        color: "text-brand-rose",
    },
];

const principles = [
    {
        title: "Privacy-first",
        description: "We design systems that respect data sovereignty. Local deployments, encrypted pipelines, and minimal data retention are defaults, not options.",
    },
    {
        title: "Practical, not theoretical",
        description: "We build systems that ship. Every recommendation is grounded in what we have built, deployed, and maintained in production.",
    },
    {
        title: "Technology-agnostic",
        description: "We recommend the right tool — not the trendy one. Open-source, proprietary, local, cloud. The architecture fits your constraints.",
    },
];

export default function ConsultingPage() {
    return (
        <div className="relative z-[1] section-bg pt-32 pb-24 px-6 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <FadeIn>
                    <SectionHeading
                        title="Consulting"
                        subtitle="Structured AI adoption for teams that need clarity, not hype."
                    />
                </FadeIn>

                {/* Process */}
                <div className="mb-32">
                    <FadeIn>
                        <h3 className="font-grotesk text-xl font-light text-ink mb-12 text-center">
                            Our Process
                        </h3>
                    </FadeIn>
                    <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {phases.map((phase) => (
                            <StaggerItem key={phase.step}>
                                <GlassCard className="h-full">
                                    <span className={`font-grotesk text-[13px] font-semibold tracking-[0.2em] ${phase.color}`}>
                                        {phase.step}
                                    </span>
                                    <h4 className="mt-3 font-grotesk text-lg font-light text-ink">
                                        {phase.title}
                                    </h4>
                                    <p className="mt-3 text-[13px] font-light leading-relaxed text-ink-light">
                                        {phase.description}
                                    </p>
                                </GlassCard>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>

                {/* Principles */}
                <FadeIn>
                    <h3 className="font-grotesk text-xl font-light text-ink mb-12 text-center">
                        Guiding Principles
                    </h3>
                </FadeIn>
                <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {principles.map((principle) => (
                        <StaggerItem key={principle.title}>
                            <GlassCard className="h-full">
                                <h4 className="font-grotesk text-lg font-light gradient-text inline-block">
                                    {principle.title}
                                </h4>
                                <p className="mt-3 text-[14px] font-light leading-relaxed text-ink-light">
                                    {principle.description}
                                </p>
                            </GlassCard>
                        </StaggerItem>
                    ))}
                </Stagger>

                <FadeIn delay={0.3}>
                    <div className="mt-24 text-center">
                        <Button href="/contact">Start a Conversation</Button>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
