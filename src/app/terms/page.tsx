import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Terms of Service for Tao Creative Labs LLC — the terms and conditions governing use of our website and services.",
};

const sections = [
    {
        title: "1. Acceptance of Terms",
        content: [
            "By accessing or using the website and services provided by Tao Creative Labs LLC (\"we,\" \"us,\" or \"our\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you should not use our website or services.",
            "We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the updated terms.",
        ],
    },
    {
        title: "2. Description of Services",
        content: [
            "Tao Creative Labs builds and operates consumer AI applications, enterprise automation systems, and provides AI consulting services. Our website provides information about our company, products, and services.",
            "We reserve the right to modify, suspend, or discontinue any part of our services at any time without prior notice.",
        ],
    },
    {
        title: "3. Intellectual Property",
        content: [
            "All content on this website — including text, graphics, logos, images, software, and design elements — is the property of Tao Creative Labs LLC or its licensors and is protected by copyright, trademark, and other intellectual property laws.",
            "You may not reproduce, distribute, modify, or create derivative works from any content on this website without our express written permission.",
        ],
    },
    {
        title: "4. User Conduct",
        content: [
            "You agree not to use our website or services for any unlawful purpose or in any way that could damage, disable, or impair the website or interfere with any other party's use.",
            "You agree not to attempt to gain unauthorized access to any systems, accounts, or data associated with our services.",
            "You agree not to use automated tools (bots, scrapers, crawlers) to access our website without our prior written consent.",
        ],
    },
    {
        title: "5. Consulting & Professional Services",
        content: [
            "Any consulting or professional services provided by Tao Creative Labs are subject to separate agreements executed between the parties. These Terms of Service apply to website usage and general interactions.",
            "Statements on our website are for informational purposes only and do not constitute professional advice. You should consult qualified professionals for specific business decisions.",
        ],
    },
    {
        title: "6. Products & Applications",
        content: [
            "Our consumer applications and products may be subject to their own terms of service and privacy policies. Please review the specific terms for each product before use.",
            "We do not guarantee uninterrupted or error-free operation of any product. We are not liable for data loss or service interruptions.",
        ],
    },
    {
        title: "7. Limitation of Liability",
        content: [
            "To the fullest extent permitted by law, Tao Creative Labs LLC and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services.",
            "Our total liability for any claim arising from these terms shall not exceed the amount you paid to us, if any, in the twelve (12) months preceding the claim.",
        ],
    },
    {
        title: "8. Indemnification",
        content: [
            "You agree to indemnify and hold harmless Tao Creative Labs LLC from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your violation of these terms or your use of our services.",
        ],
    },
    {
        title: "9. Third-Party Links",
        content: [
            "Our website may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of any third-party sites. Visiting linked sites is at your own risk.",
        ],
    },
    {
        title: "10. Governing Law",
        content: [
            "These Terms of Service shall be governed by and construed in accordance with the laws of the United States. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the appropriate courts.",
        ],
    },
    {
        title: "11. Severability",
        content: [
            "If any provision of these terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.",
        ],
    },
    {
        title: "12. Contact Us",
        content: [
            "If you have any questions about these Terms of Service, please contact us at:",
        ],
    },
];

export default function TermsPage() {
    return (
        <div className="relative z-[1] section-bg pt-32 pb-24 px-6 lg:px-12">
            <div className="mx-auto max-w-4xl">
                <FadeIn>
                    <SectionHeading
                        title="Terms of Service"
                        subtitle="Last updated: February 12, 2026"
                    />
                </FadeIn>

                <FadeIn delay={0.1}>
                    <p className="text-[15px] font-light leading-relaxed text-ink-light text-center mb-16 max-w-2xl mx-auto">
                        Please read these Terms of Service carefully before
                        using our website or services. By accessing or using our
                        services, you agree to be bound by these terms.
                    </p>
                </FadeIn>

                <Stagger className="flex flex-col gap-6">
                    {sections.map((section) => (
                        <StaggerItem key={section.title}>
                            <GlassCard>
                                <h3 className="font-grotesk text-lg font-light text-brand-cyan mb-4">
                                    {section.title}
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {section.content.map((paragraph, i) => (
                                        <p
                                            key={i}
                                            className="text-[14px] font-light leading-relaxed text-ink-light"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                                {section.title === "12. Contact Us" && (
                                    <div className="mt-4 liquid-glass rounded-xl p-4">
                                        <p className="text-[14px] font-light text-ink">
                                            Tao Creative Labs LLC
                                        </p>
                                        <p className="text-[14px] font-light text-brand-cyan mt-1">
                                            contact@taocreativelabs.com
                                        </p>
                                    </div>
                                )}
                            </GlassCard>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </div>
    );
}
