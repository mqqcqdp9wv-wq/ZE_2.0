"use client";

import dynamic from "next/dynamic";

const TintingSimulator = dynamic(
    () => import("../components/simulator/tinting-simulator"),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-screen w-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-[1px] w-16 bg-[#23a592]/40 animate-pulse" />
                    <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#343434]/50">
                        Загружаем симулятор
                    </span>
                </div>
            </div>
        ),
    }
);

export default function SimulatorPage() {
    return (
        <div className="fixed inset-0 z-50 bg-white overflow-hidden">
            <a
                href="https://ze-studio48.ru"
                className="absolute top-5 left-5 z-50 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#343434] hover:text-[#23a592] transition-colors"
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
