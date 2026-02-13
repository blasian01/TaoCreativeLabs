import { GlassCard } from "./GlassCard";
import Image from "next/image";

// Product-specific accent colors
const productColors: Record<string, string> = {
    ReelChef: "from-orange-400 to-red-400",
    Aura: "from-brand-violet to-brand-cyan",
    LucidDreamz: "from-purple-500 to-pink-400",
    Notica: "from-emerald-400 to-teal-500",
    PocketManga: "from-rose-400 to-amber-400",
    Fortaify: "from-brand-cyan to-blue-500",
};

interface ProductCardProps {
    name: string;
    description: string;
    href: string;
    image?: string;
}

export function ProductCard({ name, description, href, image }: ProductCardProps) {
    const gradient = productColors[name] || "from-brand-violet to-brand-cyan";

    return (
        <GlassCard className="flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <span className="font-grotesk text-[11px] font-medium text-white">
                            {name.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <h3 className="font-grotesk text-lg font-light tracking-tight text-ink">
                        {name}
                    </h3>
                </div>
                {image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                        <Image
                            src={image}
                            alt={`${name} preview`}
                            width={400}
                            height={200}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}
                <p className="text-[14px] font-light leading-relaxed text-ink-light">
                    {description}
                </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-200">
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[13px] font-light text-brand-violet transition-colors hover:text-brand-cyan"
                >
                    Visit product
                    <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                        />
                    </svg>
                </a>
            </div>
        </GlassCard>
    );
}
