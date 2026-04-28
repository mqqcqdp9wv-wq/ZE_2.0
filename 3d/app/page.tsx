"use client";

import dynamic from "next/dynamic";

const TintingSimulator = dynamic(
    () => import("../components/simulator/tinting-simulator"),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-screen w-screen items-center justify-center bg-[#0F0F0F]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-[1px] w-16 bg-white/20 animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                        loading simulator
                    </span>
                </div>
            </div>
        ),
    }
);

export default function SimulatorPage() {
    return (
        <div className="fixed inset-0 z-50 bg-[#0F0F0F] overflow-hidden">
            <a
                href="https://ze-studio48.ru"
                className="absolute top-6 left-6 z-50 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors"
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M13 8H3M3 8L7 4M3 8L7 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                ZE Studio
            </a>

            <TintingSimulator />
        </div>
    );
}
