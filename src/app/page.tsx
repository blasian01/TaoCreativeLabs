import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/ui/ProductCard";
import { ContactForm } from "@/components/ui/ContactForm";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/PageTransition";

const services = [
    {
        title: "AI Automation",
        description:
            "We build automation systems for companies: workflows, agents, integrations, and internal copilots that reduce operational overhead and accelerate decision-making.",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        color: "text-brand-violet",
        bgColor: "bg-brand-violet/10",
    },
    {
        title: "AI Consulting",
        description:
            "We help businesses adopt AI safely and effectively, including internal knowledge systems, custom model deployments, and strategic implementation roadmaps.",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
        ),
        color: "text-brand-cyan",
        bgColor: "bg-brand-cyan/10",
    },
    {
        title: "AI Products",
        description:
            "We operate and maintain real consumer AI applications used by everyday users — from recipe generation to virtual try-on to creative storytelling tools.",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
        ),
        color: "text-brand-amber",
        bgColor: "bg-brand-amber/10",
    },
];

const products = [
    {
        name: "ReelChef",
        description:
            "AI cooking assistant that converts social media food videos into structured recipes and meal plans.",
        href: "https://www.reelchef.app/",
    },
    {
        name: "Aura",
        description:
            "AI virtual try-on and wardrobe assistant that helps users visualize outfits and clothing.",
        href: "https://www.wearaura.app/",
    },
    {
        name: "LucidDreamz",
        description:
            "AI character roleplay and conversational storytelling platform.",
        href: "https://www.luciddreamz.app/",
    },
    {
        name: "Notica",
        description:
            "Offline-first private AI notes and local LLM workspace.",
        href: "https://www.getnotica.com/",
    },
    {
        name: "PocketManga",
        description:
            "AI manga and comic creation platform.",
        href: "https://www.pocketmanga.app/",
    },
    {
        name: "Fortaify",
        description:
            "The infrastructure and parent platform powering Tao Creative Labs applications.",
        href: "https://fortaify.com/",
    },
];

const businessServices = [
    "AI workflow automation",
    "Document processing and extraction",
    "Enterprise knowledge bases",
    "Custom chatbots and conversational AI",
    "Local private AI deployments",
    "Custom internal copilots",
];

const serviceColors = [
    "bg-brand-violet",
    "bg-brand-cyan",
    "bg-brand-amber",
    "bg-brand-rose",
    "bg-brand-violet-light",
    "bg-brand-cyan-light",
];

export default function HomePage() {
    return (
        <>
            {/* ─── Hero ─── */}
            <section className="relative flex min-h-screen items-center justify-center">
                <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                    {/* Liquid glass backdrop */}
                    <div className="liquid-glass rounded-3xl px-10 py-16 md:px-16 md:py-20">
                        <FadeIn>
                            <p className="font-grotesk text-[11px] font-medium uppercase tracking-[0.35em] text-brand-violet/70">
                                Applied Artificial Intelligence
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.15}>
                            <h1 className="mt-8 font-grotesk text-5xl font-light tracking-tight gradient-text md:text-7xl lg:text-8xl">
                                Tao Creative Labs
                            </h1>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <p className="mt-6 text-lg font-light leading-relaxed text-black/80 md:text-xl">
                                Applied Artificial Intelligence for Real Systems.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.4}>
                            <p className="mt-3 text-[15px] font-light text-black/50">
                                We design and deploy intelligent software for people and businesses.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.55}>
                            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                                <Button href="/products">View Our Products</Button>
                                <Button href="/contact" variant="secondary">
                                    Request Consultation
                                </Button>
                            </div>
                        </FadeIn>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-50/80 to-transparent" />
            </section>

            {/* ─── What We Do ─── */}
            <section id="services" className="relative z-[1] section-bg py-32 px-6 lg:px-12">
                <div className="mx-auto max-w-7xl">
                    <FadeIn>
                        <SectionHeading
                            title="What We Do"
                            subtitle="Three pillars of applied artificial intelligence — from automation infrastructure to consumer-facing products."
                        />
                    </FadeIn>

                    <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {services.map((service) => (
                            <StaggerItem key={service.title}>
                                <GlassCard className="h-full">
                                    <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${service.bgColor} ${service.color}`}>
                                        {service.icon}
                                    </div>
                                    <h3 className="font-grotesk text-lg font-light tracking-tight text-ink">
                                        {service.title}
                                    </h3>
                                    <p className="mt-3 text-[14px] font-light leading-relaxed text-ink-light">
                                        {service.description}
                                    </p>
                                </GlassCard>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </section>

            {/* ─── Products ─── */}
            <section id="products" className="relative z-[1] section-bg py-32 px-6 lg:px-12">
                {/* Products background image */}
                <div className="absolute right-0 top-0 w-1/2 h-full opacity-40 pointer-events-none overflow-hidden flex items-start justify-end pr-10 pt-10">
                    <div className="rounded-image overflow-hidden">
                        <Image
                            src="/products-nano-banana.png"
                            alt=""
                            width={600}
                            height={600}
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>

                <div className="mx-auto max-w-7xl relative">
                    <FadeIn>
                        <SectionHeading
                            title="Our Products"
                            subtitle="Consumer AI applications designed for everyday use — each solving a distinct problem with intelligent software."
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
                </div>
            </section>

            {/* ─── Business Solutions ─── */}
            <section id="solutions" className="relative z-[1] section-bg py-32 px-6 lg:px-12">
                {/* Solutions background image */}
                <div className="absolute left-0 bottom-0 w-1/3 h-2/3 opacity-40 pointer-events-none overflow-hidden flex items-end justify-start pl-10 pb-10">
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
                    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
                        <FadeIn>
                            <div>
                                <SectionHeading
                                    title="Business Solutions"
                                    subtitle="Enterprise-grade AI systems tailored to your operations."
                                    align="left"
                                />
                                <p className="text-[15px] font-light leading-relaxed text-ink-light">
                                    Companies hire Tao Creative Labs to integrate AI into their
                                    existing workflows. We build systems that are private, reliable,
                                    and designed to operate within your infrastructure.
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <GlassCard hover={false}>
                                <ul className="space-y-4">
                                    {businessServices.map((service, i) => (
                                        <li
                                            key={service}
                                            className="flex items-center gap-3 text-[14px] font-light text-ink-light"
                                        >
                                            <div className={`h-2 w-2 rounded-full ${serviceColors[i]} flex-shrink-0`} />
                                            {service}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 pt-6 border-t border-surface-200">
                                    <Button href="/contact">Request an AI Consultation</Button>
                                </div>
                            </GlassCard>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* ─── About ─── */}
            <section id="about" className="relative z-[1] section-bg py-32 px-6 lg:px-12">
                {/* About background image */}
                <div className="absolute right-0 bottom-0 w-1/3 h-2/3 opacity-40 pointer-events-none overflow-hidden flex items-end justify-end pr-10 pb-10">
                    <div className="rounded-image overflow-hidden">
                        <Image
                            src="/about-nano-banana.png"
                            alt=""
                            width={500}
                            height={500}
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>

                <div className="mx-auto max-w-3xl text-center relative">
                    <FadeIn>
                        <SectionHeading title="About" />
                    </FadeIn>
                    <FadeIn delay={0.15}>
                        <p className="text-[16px] font-light leading-[1.8] text-ink-light">
                            Tao Creative Labs is an AI venture studio focused on practical,
                            applied artificial intelligence. We build privacy-respecting systems
                            that work in the real world — not demonstrations, not prototypes.
                            Every product we release is designed for deployment, maintained for
                            reliability, and engineered for scale.
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.3}>
                        <div className="mt-12 grid grid-cols-3 gap-8">
                            <div>
                                <p className="font-grotesk text-2xl font-light gradient-text">6+</p>
                                <p className="mt-1 text-[12px] font-light uppercase tracking-[0.15em] text-ink-muted">
                                    Products
                                </p>
                            </div>
                            <div>
                                <p className="font-grotesk text-2xl font-light gradient-text">AI-first</p>
                                <p className="mt-1 text-[12px] font-light uppercase tracking-[0.15em] text-ink-muted">
                                    Engineering
                                </p>
                            </div>
                            <div>
                                <p className="font-grotesk text-2xl font-light gradient-text">Private</p>
                                <p className="mt-1 text-[12px] font-light uppercase tracking-[0.15em] text-ink-muted">
                                    by Design
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ─── Contact ─── */}
            <section id="contact" className="relative z-[1] section-bg py-32 px-6 lg:px-12">
                <div className="mx-auto max-w-2xl">
                    <FadeIn>
                        <SectionHeading
                            title="Get in Touch"
                            subtitle="Have a project in mind, or want to explore how AI can work for your business? We'd like to hear from you."
                        />
                    </FadeIn>
                    <FadeIn delay={0.15}>
                        <ContactForm />
                    </FadeIn>
                </div>
            </section>
        </>
    );
}
