interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    align?: "left" | "center";
}

export function SectionHeading({
    title,
    subtitle,
    align = "center",
}: SectionHeadingProps) {
    return (
        <div className={`mb-16 ${align === "center" ? "text-center" : "text-left"}`}>
            <h2 className="font-grotesk text-3xl font-light tracking-tight text-ink md:text-4xl">
                {title}
            </h2>
            {subtitle && (
                <p className="mt-4 text-[15px] font-light leading-relaxed text-ink-muted max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
            <div
                className={`mt-6 h-[2px] w-16 rounded-full gradient-bar ${align === "center" ? "mx-auto" : ""
                    }`}
            />
        </div>
    );
}
