export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-50">
            <div className="flex flex-col items-center gap-6">
                <div className="relative h-10 w-10">
                    <div className="absolute inset-0 rounded-full border border-surface-300 opacity-30" />
                    <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-ink" style={{ animationDuration: "1.2s" }} />
                </div>
                <p className="font-grotesk text-xs tracking-[0.3em] text-ink-muted uppercase">
                    Loading
                </p>
            </div>
        </div>
    );
}
