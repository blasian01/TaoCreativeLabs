import type { Metadata } from "next";
import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
    title: "Business Solutions",
    description:
        "Enterprise AI automation, knowledge systems, and custom deployments by Tao Creative Labs.",
};

const solutions = [
    {
        title: "AI Workflow Automation",
        description:
            "Automate repetitive business processes with intelligent agents. We design systems that integrate with your existing tools — from CRM to internal databases — to eliminate manual overhead.",
        capabilities: ["Process orchestration", "Multi-step agent pipelines", "Tool-use integration", "Scheduled automations"],
        accent: "from-brand-violet to-purple-400",
    },
    {
        title: "Document Processing",
        description:
            "Extract, classify, and route information from documents at scale. Our pipelines handle invoices, contracts, medical records, and unstructured text with high accuracy.",
        capabilities: ["OCR and extraction", "Classification pipelines", "Structured output", "Compliance-aware processing"],
        accent: "from-brand-cyan to-blue-400",
    },
    {
        title: "Knowledge Bases",
        description:
            "Build searchable, AI-powered knowledge systems from your internal data. We implement retrieval-augmented generation over your documents, wikis, and databases.",
        capabilities: ["RAG systems", "Embedding pipelines", "Semantic search", "Access-controlled queries"],
        accent: "from-emerald-400 to-teal-500",
    },
    {
        title: "Chatbots & Conversational AI",
        description:
            "Deploy custom chatbots trained on your data and tuned to your brand voice. Supports customer-facing deployments, internal help desks, and multi-channel distribution.",
        capabilities: ["Custom training data", "Brand voice tuning", "Multi-channel deployment", "Escalation workflows"],
        accent: "from-brand-amber to-orange-400",
    },
    {
        title: "Private AI Deployments",
        description:
            "Run AI models entirely within your infrastructure. We deploy and optimize local LLMs for organizations that require complete data sovereignty and air-gapped operation.",
        capabilities: ["On-premise deployment", "Model optimization", "Air-gapped operation", "Data sovereignty"],
        accent: "from-brand-rose to-pink-400",
    },
    {
        title: "Custom Internal Copilots",
        description:
            "Build AI assistants tailored to your team's specific workflows. From code review to sales enablement, we create copilots that understand your processes.",
        capabilities: ["Workflow-specific training", "Tool integration", "Context-aware assistance", "Usage analytics"],
        accent: "from-indigo-400 to-brand-violet",
    },
];

export default function SolutionsPage() {
    return (
        <div className="relative z-[1] section-bg pt-32 pb-24 px-6 lg:px-12">
            {/* Background image */}
            <div className="absolute left-10 top-20 w-1/3 h-1/2 opacity-40 pointer-events-none">
                <div className="rounded-image overflow-hidden">
                    <Image
                        src="/solutions-nano-banana.png"
                        alt=""
                        width={500}
                        height={500}
                        className="w-full h-auto object-contain"
                    />
                </div>
            </div>

            <div className="mx-auto max-w-7xl relative">
                <FadeIn>
                    <SectionHeading
                        title="Business Solutions"
                        subtitle="Enterprise AI systems designed to integrate with your infrastructure, respect your data, and deliver measurable results."
                    />
                </FadeIn>

                <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {solutions.map((solution) => (
                        <StaggerItem key={solution.title}>
                            <GlassCard className="h-full flex flex-col">
                                <h3 className="font-grotesk text-lg font-light tracking-tight text-ink">
                                    {solution.title}
                                </h3>
                                <p className="mt-3 text-[14px] font-light leading-relaxed text-ink-light flex-grow">
                                    {solution.description}
                                </p>
                                <div className="mt-5 pt-4 border-t border-surface-200">
                                    <div className="flex flex-wrap gap-2">
                                        {solution.capabilities.map((cap) => (
                                            <span
                                                key={cap}
                                                className={`rounded-full bg-gradient-to-r ${solution.accent} px-3 py-1 text-[11px] font-light text-white/90`}
                                            >
                                                {cap}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        </StaggerItem>
                    ))}
                </Stagger>

                <FadeIn delay={0.3}>
                    <div className="mt-24 text-center liquid-glass rounded-2xl p-12 max-w-2xl mx-auto">
                        <h3 className="font-grotesk text-2xl font-light gradient-text">
                            Ready to integrate AI?
                        </h3>
                        <p className="mt-4 text-[14px] font-light text-ink-light leading-relaxed">
                            Every engagement starts with a consultation to understand your
                            systems, constraints, and goals. No commitments — just a
                            conversation.
                        </p>
                        <div className="mt-8">
                            <Button href="/contact">Request an AI Consultation</Button>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
