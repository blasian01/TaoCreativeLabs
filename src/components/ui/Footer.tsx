import Link from "next/link";

const footerLinks = [
    { href: "/products", label: "Products" },
    { href: "/solutions", label: "Solutions" },
    { href: "/consulting", label: "Consulting" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

const productLinks = [
    { href: "https://www.reelchef.app/", label: "ReelChef" },
    { href: "https://www.wearaura.app/", label: "Aura" },
    { href: "https://www.luciddreamz.app/", label: "LucidDreamz" },
    { href: "https://www.getnotica.com/", label: "Notica" },
    { href: "https://www.pocketmanga.app/", label: "PocketManga" },
    { href: "https://fortaify.com/", label: "Fortaify" },
];

export function Footer() {
    return (
        <footer className="border-t border-surface-200 bg-surface-50/80 backdrop-blur-sm relative z-[1]">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    {/* Brand */}
                    <div>
                        <p className="font-grotesk text-sm font-light tracking-[0.15em] gradient-text">
                            TAO CREATIVE LABS
                        </p>
                        <p className="mt-4 text-[13px] font-light leading-relaxed text-ink-muted">
                            Applied artificial intelligence
                            <br />
                            for real systems.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <p className="font-grotesk text-[11px] font-medium uppercase tracking-[0.2em] text-brand-violet">
                            Navigation
                        </p>
                        <div className="mt-4 flex flex-col gap-3">
                            {footerLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-[13px] font-light text-ink-light transition-colors hover:text-brand-violet"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <p className="font-grotesk text-[11px] font-medium uppercase tracking-[0.2em] text-brand-cyan">
                            Products
                        </p>
                        <div className="mt-4 flex flex-col gap-3">
                            {productLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[13px] font-light text-ink-light transition-colors hover:text-brand-cyan"
                                >
                                    {link.label}
                                    <span className="ml-1 text-[10px] text-ink-muted">↗</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-16 border-t border-surface-200 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[12px] font-light text-ink-muted">
                        © {new Date().getFullYear()} Tao Creative Labs LLC. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/privacy"
                            className="text-[12px] font-light text-ink-muted transition-colors hover:text-brand-violet"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-[12px] font-light text-ink-muted transition-colors hover:text-brand-violet"
                        >
                            Terms of Service
                        </Link>
                        <div className="h-[2px] w-12 rounded-full gradient-bar" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
