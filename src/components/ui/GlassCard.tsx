import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
    return (
        <div
            className={`glass rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden ${hover
                ? "transition-all duration-300 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] hover:translate-y-[-2px] group"
                : ""
                } ${className}`}
        >
            {/* Gradient top accent on hover */}
            {hover && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-violet to-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
            {children}
        </div>
    );
}
