import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    href?: string;
    variant?: "primary" | "secondary" | "ghost";
    external?: boolean;
    type?: "button" | "submit";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}

export function Button({
    children,
    href,
    variant = "primary",
    external = false,
    type = "button",
    disabled = false,
    onClick,
    className = "",
}: ButtonProps) {
    const baseStyles =
        "inline-flex items-center justify-center rounded-full px-7 py-3 text-[13px] font-light tracking-wide transition-all duration-300";

    const variants = {
        primary:
            "bg-gradient-to-r from-brand-violet to-brand-cyan text-white shadow-[0_2px_12px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:scale-[1.02]",
        secondary:
            "bg-transparent text-ink border border-surface-300 hover:border-brand-violet hover:text-brand-violet hover:bg-brand-violet/5",
        ghost:
            "bg-transparent text-ink-light hover:text-brand-violet hover:bg-brand-violet/5",
    };

    const styles = `${baseStyles} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`;

    if (href && external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles}
            >
                {children}
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} className={styles}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={styles}
        >
            {children}
        </button>
    );
}
