"use client";

import { useState } from "react";
import { TINT_CONFIG, type MaterialKey } from "./glass-material";

interface ControlPanelProps {
    frontMaterial: MaterialKey;
    frontVlt: number;
    rearMaterial: MaterialKey;
    rearVlt: number;
    splitX: number;
    onFrontMaterialChange: (m: MaterialKey) => void;
    onFrontVltChange: (v: number) => void;
    onRearMaterialChange: (m: MaterialKey) => void;
    onRearVltChange: (v: number) => void;
    onSplitChange: (v: number) => void;
}

const MATERIAL_KEYS: MaterialKey[] = Object.keys(TINT_CONFIG) as MaterialKey[];

/** Подпись над группой контролов: «Зона», «Плёнка», «Светопропускание» */
function GroupLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/40 select-none">
            {children}
        </span>
    );
}

export function ControlPanel({
    frontMaterial,
    frontVlt,
    rearMaterial,
    rearVlt,
    splitX,
    onFrontMaterialChange,
    onFrontVltChange,
    onRearMaterialChange,
    onRearVltChange,
    onSplitChange,
}: ControlPanelProps) {
    const [zone, setZone] = useState<"front" | "rear">("rear");
    const [infoOpen, setInfoOpen] = useState(false);

    const activeMaterial       = zone === "front" ? frontMaterial  : rearMaterial;
    const activeVlt            = zone === "front" ? frontVlt       : rearVlt;
    const handleVltChange      = zone === "front" ? onFrontVltChange : onRearVltChange;
    const handleMaterialChange = zone === "front" ? onFrontMaterialChange : onRearMaterialChange;

    const config = TINT_CONFIG[activeMaterial];
    const level  = config.levels.find((l) => l.vlt === activeVlt) ?? config.levels[0];

    // Третья метрика: Блики или ИК
    const thirdValue = config.thirdSpec === "ir" ? level.irRejection : level.glareReduction;
    const thirdLabel = config.thirdSpec === "ir" ? "ИК" : "Блики";

    return (
        <>
            {/* ─── Слайдер До/После — сверху по центру ─── */}
            <style>{`
                .tint-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 28px; background: transparent; cursor: ew-resize; outline: none; touch-action: none; margin: 0; padding: 0; }
                .tint-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 9999px; background: rgba(255,255,255,0.18); }
                .tint-slider::-moz-range-track { height: 4px; border-radius: 9999px; background: rgba(255,255,255,0.18); border: none; }
                .tint-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 28px; height: 28px; margin-top: -12px; border-radius: 50%; background: #23a592; cursor: grab; box-shadow: 0 2px 8px rgba(35,165,146,0.55); border: 3px solid #0a0a0a; }
                .tint-slider::-moz-range-thumb { width: 28px; height: 28px; border-radius: 50%; background: #23a592; cursor: grab; border: 3px solid #0a0a0a; box-shadow: 0 2px 8px rgba(35,165,146,0.55); }
                .tint-slider:focus { outline: none; }
            `}</style>
            <div className="absolute top-12 sm:top-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center w-[220px]">
                <input
                    type="range"
                    min={0} max={100}
                    value={splitX}
                    onChange={(e) => onSplitChange(Number(e.target.value))}
                    className="tint-slider"
                />
                <div className="flex w-full justify-between mt-0.5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/55">Без плёнки</span>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/55">С плёнкой</span>
                </div>
            </div>

            {/* ─── Floating UI — низ экрана ─── */}
            <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center pb-6 pointer-events-none">

                {/* ─── Выдвижной инфо-блок ─── */}
                <div
                    className="pointer-events-auto w-[calc(100%-32px)] max-w-[520px] overflow-hidden transition-all duration-300 ease-out"
                    style={{
                        maxHeight: infoOpen ? "320px" : "0px",
                        opacity:   infoOpen ? 1 : 0,
                        marginBottom: infoOpen ? "12px" : "0px",
                    }}
                >
                    <div className="rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-5 py-4">

                        {/* ─── Шапка: название + спеки ─── */}
                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-3">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[22px] font-bold leading-none text-[#23a592]">
                                    {level.vlt}%
                                </span>
                                <span className="text-[13px] font-medium text-white/90">
                                    {level.title}
                                </span>
                            </div>

                            <div className="hidden sm:block w-px h-5 bg-white/15" />

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] font-semibold text-[#23a592]">
                                        {level.tser}%
                                    </span>
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/50">
                                        Тепло
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] font-semibold text-white/90">
                                        {level.uvProtection}%
                                    </span>
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/50">
                                        УФ
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] font-semibold text-white/90">
                                        {thirdValue}%
                                    </span>
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/50">
                                        {thirdLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-[12px] leading-relaxed text-white/70 mb-3">
                            {level.description}
                        </p>

                        <div className="flex flex-col gap-1.5">
                            {level.characteristics.map((c, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full shrink-0 bg-[#23a592]" />
                                    <span className="text-[11px] text-white/65">
                                        {c}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Основная панель контролов ─── */}
                <div className="pointer-events-auto flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-[calc(100vw-16px)]">

                    {/* ── Ряд 1: Зона + Материал ── */}
                    <div className="flex items-end justify-center gap-3 sm:gap-4">
                        {/* ── 1. ЗОНА ── */}
                        <div className="flex flex-col items-center gap-1.5">
                            <GroupLabel>Зона</GroupLabel>
                            <div className="flex gap-1 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-lg p-0.5">
                                {(["front", "rear"] as const).map((z) => {
                                    const active = zone === z;
                                    const label  = z === "front" ? "Перед" : "Зад";
                                    return (
                                        <button
                                            key={z}
                                            onClick={() => setZone(z)}
                                            className="min-w-[64px] px-3.5 py-2 rounded-md text-[11px] font-semibold uppercase tracking-[0.1em] transition-all duration-200"
                                            style={{
                                                background: active ? "#ffffff" : "transparent",
                                                color:      active ? "#0a0a0a" : "rgba(255,255,255,0.55)",
                                                boxShadow:  active ? "0 2px 8px rgba(0,0,0,0.4)" : "none",
                                            }}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── 2. ПЛЁНКА ── */}
                        {MATERIAL_KEYS.length > 1 && (
                            <div className="flex flex-col items-center gap-1.5">
                                <GroupLabel>Плёнка</GroupLabel>
                                <div className="flex gap-1 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-lg p-0.5">
                                    {MATERIAL_KEYS.map((key) => {
                                        const mat    = TINT_CONFIG[key];
                                        const active = activeMaterial === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => handleMaterialChange(key)}
                                                className="min-w-[88px] sm:min-w-[100px] px-3 py-2 rounded-md text-[12px] font-semibold transition-all duration-200"
                                                style={{
                                                    background: active ? "#23a592" : "transparent",
                                                    color:      active ? "#ffffff" : "rgba(255,255,255,0.55)",
                                                    boxShadow:  active ? "0 2px 10px rgba(35,165,146,0.45)" : "none",
                                                }}
                                            >
                                                {mat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Разделитель — только на десктопе */}
                    <div className="hidden sm:block w-px h-10 bg-white/12 self-center" />

                    {/* ── 3. СВЕТО% ── */}
                    <div className="flex flex-col items-center gap-1.5">
                        <GroupLabel>Светопропускание</GroupLabel>
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                            {config.levels.map((lvl) => {
                                const active = activeVlt === lvl.vlt;
                                return (
                                    <button
                                        key={lvl.vlt}
                                        onClick={() => handleVltChange(lvl.vlt)}
                                        className="relative flex items-center justify-center min-w-[48px] px-3 py-1.5 rounded-lg transition-all duration-200"
                                        style={{
                                            background: active ? "rgba(35,165,146,0.22)" : "transparent",
                                            border:     active ? "1.5px solid rgba(35,165,146,0.85)" : "1.5px solid rgba(255,255,255,0.08)",
                                        }}
                                    >
                                        <span
                                            className="text-[13px] font-bold transition-colors"
                                            style={{ color: active ? "#23a592" : "rgba(255,255,255,0.65)" }}
                                        >
                                            {lvl.vlt}%
                                        </span>
                                    </button>
                                );
                            })}

                            {/* Info toggle — тот же стиль что у VLT-кнопок, иконка-«i» вместо процентов */}
                            <button
                                onClick={() => setInfoOpen((o) => !o)}
                                className="flex items-center justify-center px-2 py-1.5 rounded-lg transition-all duration-200 ml-0.5"
                                style={{
                                    background: infoOpen ? "rgba(35,165,146,0.22)" : "transparent",
                                    border:     infoOpen ? "1.5px solid rgba(35,165,146,0.85)" : "1.5px solid rgba(255,255,255,0.08)",
                                }}
                                aria-label="Информация о плёнке"
                            >
                                <svg
                                    width="14" height="14" viewBox="0 0 16 16" fill="none"
                                    style={{ color: infoOpen ? "#23a592" : "rgba(255,255,255,0.65)" }}
                                >
                                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                                    <path d="M8 7v4M8 5.5v0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
