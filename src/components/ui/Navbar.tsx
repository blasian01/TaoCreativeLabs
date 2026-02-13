"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/solutions", label: "Business Solutions" },
    { href: "/consulting", label: "Consulting" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? "glass-nav shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                    : "bg-transparent"
                    }`}
            >
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="font-grotesk text-sm font-light tracking-[0.15em] text-ink transition-opacity hover:opacity-60"
                        >
                            TAO CREATIVE LABS
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-8 md:flex">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-[13px] font-light tracking-wide text-ink-light transition-colors hover:text-ink"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="flex flex-col gap-[5px] md:hidden"
                            aria-label="Toggle menu"
                        >
                            <motion.span
                                animate={isMobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                                className="block h-[1px] w-5 bg-ink"
                            />
                            <motion.span
                                animate={isMobileOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="block h-[1px] w-5 bg-ink"
                            />
                            <motion.span
                                animate={isMobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                                className="block h-[1px] w-5 bg-ink"
                            />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 glass-strong pt-20 md:hidden"
                    >
                        <div className="flex flex-col items-center gap-8 pt-12">
                            {navLinks.map((link) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className="font-grotesk text-lg font-light tracking-wide text-ink-light transition-colors hover:text-ink"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
