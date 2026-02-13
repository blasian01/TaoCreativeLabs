import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="text-center">
                <p className="font-grotesk text-[11px] font-medium uppercase tracking-[0.35em] text-ink-muted">
                    404
                </p>
                <h1 className="mt-4 font-grotesk text-4xl font-light text-ink">
                    Page not found
                </h1>
                <p className="mt-4 text-[15px] font-light text-ink-muted">
                    The page you are looking for does not exist or has been moved.
                </p>
                <div className="mt-8">
                    <Button href="/" variant="secondary">
                        Return Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
