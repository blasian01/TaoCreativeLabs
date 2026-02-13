import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/ui/ContactForm";
import { FadeIn } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
    title: "Contact",
    description:
        "Get in touch with Tao Creative Labs — request a consultation, discuss a project, or learn how AI can work for your business.",
};

export default function ContactPage() {
    return (
        <div className="relative z-[1] bg-surface-50 pt-32 pb-24 px-6 lg:px-12">
            <div className="mx-auto max-w-2xl">
                <FadeIn>
                    <SectionHeading
                        title="Contact Us"
                        subtitle="Whether you have a project in mind or want to explore possibilities, we are here to help."
                    />
                </FadeIn>

                <FadeIn delay={0.15}>
                    <div className="glass rounded-2xl p-8 md:p-12">
                        <ContactForm />
                    </div>
                </FadeIn>

                <FadeIn delay={0.3}>
                    <div className="mt-16 text-center">
                        <p className="text-[13px] font-light text-ink-muted">
                            You can also reach us directly at{" "}
                            <a
                                href="mailto:hello@fortaify.com"
                                className="text-ink underline underline-offset-4 transition-colors hover:text-ink-light"
                            >
                                hello@fortaify.com
                            </a>
                        </p>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
