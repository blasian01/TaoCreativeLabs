"use client";

import { useState, useTransition } from "react";
import { Button } from "./Button";
import { submitContactForm } from "@/app/contact/action";

export function ContactForm() {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const result = await submitContactForm(formData);
                if (result.success) {
                    setStatus("success");
                    (e.target as HTMLFormElement).reset();
                } else {
                    setStatus("error");
                    setErrorMessage(result.error || "Something went wrong. Please try again.");
                }
            } catch {
                setStatus("error");
                setErrorMessage("Something went wrong. Please try again.");
            }
        });
    };

    if (status === "success") {
        return (
            <div className="glass rounded-2xl p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-200">
                    <svg className="h-5 w-5 text-ink" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                <h3 className="font-grotesk text-lg font-light text-ink">Message received</h3>
                <p className="mt-2 text-[14px] font-light text-ink-muted">
                    We will get back to you within 24 hours.
                </p>
                <button
                    onClick={() => setStatus("idle")}
                    className="mt-6 text-[13px] font-light text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label htmlFor="name" className="block text-[12px] font-medium uppercase tracking-[0.15em] text-ink-muted mb-2">
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="w-full rounded-xl border border-surface-300 bg-white/60 px-4 py-3 text-[14px] font-light text-ink placeholder:text-ink-muted/50 focus:border-ink-muted focus:outline-none focus:ring-0 transition-colors"
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-[12px] font-medium uppercase tracking-[0.15em] text-ink-muted mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-xl border border-surface-300 bg-white/60 px-4 py-3 text-[14px] font-light text-ink placeholder:text-ink-muted/50 focus:border-ink-muted focus:outline-none focus:ring-0 transition-colors"
                        placeholder="you@company.com"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="company" className="block text-[12px] font-medium uppercase tracking-[0.15em] text-ink-muted mb-2">
                    Company
                </label>
                <input
                    id="company"
                    name="company"
                    type="text"
                    className="w-full rounded-xl border border-surface-300 bg-white/60 px-4 py-3 text-[14px] font-light text-ink placeholder:text-ink-muted/50 focus:border-ink-muted focus:outline-none focus:ring-0 transition-colors"
                    placeholder="Company name (optional)"
                />
            </div>
            <div>
                <label htmlFor="message" className="block text-[12px] font-medium uppercase tracking-[0.15em] text-ink-muted mb-2">
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full rounded-xl border border-surface-300 bg-white/60 px-4 py-3 text-[14px] font-light text-ink placeholder:text-ink-muted/50 focus:border-ink-muted focus:outline-none focus:ring-0 transition-colors resize-none"
                    placeholder="Tell us about your project or inquiry"
                />
            </div>

            {status === "error" && (
                <p className="text-[13px] font-light text-red-500">{errorMessage}</p>
            )}

            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                {isPending ? "Sending..." : "Send Message"}
            </Button>
        </form>
    );
}
