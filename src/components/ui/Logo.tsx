import Image from "next/image";

type LogoProps = {
    className?: string;
    priority?: boolean;
};

export function Logo({ className = "h-10 w-auto", priority = false }: LogoProps) {
    return (
        <Image
            src="/logo.png"
            alt="Tao Creative Labs"
            width={605}
            height={365}
            priority={priority}
            className={className}
        />
    );
}
