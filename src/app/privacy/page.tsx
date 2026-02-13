import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Privacy Policy for Tao Creative Labs LLC — how we collect, use, and protect your information.",
};

const sections = [
    {
        title: "1. Information We Collect",
        content: [
            "We collect information you provide directly, such as your name, email address, and any messages you send through our contact forms.",
            "We automatically collect certain technical information when you visit our website, including your IP address, browser type, operating system, referring URLs, and pages viewed. This data is collected through standard server logs and analytics tools.",
            "We do not sell, rent, or share your personal information with third parties for their marketing purposes.",
        ],
    },
    {
        title: "2. How We Use Your Information",
        content: [
            "We use the information we collect to respond to your inquiries, provide our services, and improve the user experience of our website and products.",
            "Technical data is used in aggregate to analyze site traffic, diagnose technical issues, and optimize performance.",
            "If you subscribe to any communications, we will use your email address to send relevant updates. You can unsubscribe at any time.",
        ],
    },
    {
        title: "3. Cookies & Tracking",
        content: [
            "Our website may use cookies and similar technologies to enhance your browsing experience and collect analytics data.",
            "You can control cookie preferences through your browser settings. Disabling cookies may limit some functionality of the website.",
        ],
    },
    {
        title: "4. Data Security",
        content: [
            "We implement industry-standard security measures to protect your personal information, including encryption in transit (TLS/SSL) and secure server infrastructure.",
            "While we strive to protect your data, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.",
        ],
    },
    {
        title: "5. Third-Party Services",
        content: [
            "Our website and products may integrate with third-party services (e.g., analytics providers, payment processors, cloud infrastructure). These services have their own privacy policies governing the use of your information.",
            "We are not responsible for the privacy practices of third-party websites linked from our site.",
        ],
    },
    {
        title: "6. Data Retention",
        content: [
            "We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by law.",
            "You may request deletion of your personal data by contacting us at the address below.",
        ],
    },
    {
        title: "7. Your Rights",
        content: [
            "Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. You may also have the right to object to or restrict certain processing.",
            "To exercise any of these rights, please contact us using the information provided below.",
        ],
    },
    {
        title: "8. Children's Privacy",
        content: [
            "Our services are not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.",
        ],
    },
    {
        title: "9. Changes to This Policy",
        content: [
            "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this page periodically.",
        ],
    },
    {
        title: "10. Contact Us",
        content: [
            "If you have any questions about this Privacy Policy or your personal data, please contact us at:",
        ],
    },
];

export default function PrivacyPage() {
    return (
        <div className="relative z-[1] section-bg pt-32 pb-24 px-6 lg:px-12">
            <div className="mx-auto max-w-4xl">
                <FadeIn>
                    <SectionHeading
                        title="Privacy Policy"
                        subtitle="Last updated: February 12, 2026"
                    />
                </FadeIn>

                <FadeIn delay={0.1}>
                    <p className="text-[15px] font-light leading-relaxed text-ink-light text-center mb-16 max-w-2xl mx-auto">
                        Tao Creative Labs LLC (&quot;we,&quot; &quot;us,&quot;
                        or &quot;our&quot;) is committed to protecting your
                        privacy. This Privacy Policy describes how we collect,
                        use, and safeguard your information when you visit our
                        website or use our services.
                    </p>
                </FadeIn>

                <Stagger className="flex flex-col gap-6">
                    {sections.map((section) => (
                        <StaggerItem key={section.title}>
                            <GlassCard>
                                <h3 className="font-grotesk text-lg font-light text-brand-violet mb-4">
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
                                {section.title === "10. Contact Us" && (
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
