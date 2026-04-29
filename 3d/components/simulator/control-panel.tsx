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
    const thirdColor = config.thirdSpec === "ir" ? "text-red-400" : "text-amber-400";

    return (
        <>
            {/* ─── Слайдер До/После — сверху по центру ─── */}
            <style>{`
                .tint-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 28px; background: transparent; cursor: ew-resize; outline: none; touch-action: none; margin: 0; padding: 0; }
                .tint-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 9999px; background: #e0e0e0; }
                .tint-slider::-moz-range-track { height: 4px; border-radius: 9999px; background: #e0e0e0; border: none; }
                .tint-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 28px; height: 28px; margin-top: -12px; border-radius: 50%; background: #23a592; cursor: grab; box-shadow: 0 2px 8px rgba(35,165,146,0.45); border: 3px solid #ffffff; }
                .tint-slider::-moz-range-thumb { width: 28px; height: 28px; border-radius: 50%; background: #23a592; cursor: grab; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(35,165,146,0.45); }
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
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#343434]/45">Без плёнки</span>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#343434]/45">С плёнкой</span>
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
                    <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-5 py-4">

                        {/* ─── Шапка: название + спеки ─── */}
                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-3">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[22px] font-bold leading-none text-[#23a592]">
                                    {level.vlt}%
                                </span>
                                <span className="text-[13px] font-medium text-[#343434]">
                                    {level.title}
                                </span>
                            </div>

                            <div className="hidden sm:block w-px h-5 bg-[#e0e0e0]" />

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] font-semibold text-[#23a592]">
                                        {level.tser}%
                                    </span>
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8a8a8a]">
                                        Тепло
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] font-semibold text-[#343434]">
                                        {level.uvProtection}%
                                    </span>
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8a8a8a]">
                                        УФ
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] font-semibold text-[#343434]">
                                        {thirdValue}%
                                    </span>
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8a8a8a]">
                                        {thirdLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-[12px] leading-relaxed text-[#555] mb-3">
                            {level.description}
                        </p>

                        <div className="flex flex-col gap-1.5">
                            {level.characteristics.map((c, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full shrink-0 bg-[#23a592]" />
                                    <span className="text-[11px] text-[#666]">
                                        {c}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Основная панель контролов ─── */}
                <div className="pointer-events-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] max-w-[calc(100vw-16px)]">

                    {/* ── Ряд 1: Зона + Материал ── */}
                    <div className="flex items-center justify-center gap-2">
                        {/* Zone toggle */}
                        <div className="flex gap-1 bg-white/40 backdrop-blur-md border border-white/50 rounded-lg p-0.5">
                            {(["front", "rear"] as const).map((z) => {
                                const active = zone === z;
                                const label  = z === "front" ? "Перед" : "Зад";
                                return (
                                    <button
                                        key={z}
                                        onClick={() => setZone(z)}
                                        className="min-w-[64px] px-3.5 py-2 rounded-md text-[11px] font-semibold uppercase tracking-[0.1em] transition-all duration-200"
                                        style={{
                                            background: active ? "rgba(255,255,255,0.95)" : "transparent",
                                            color:      active ? "#343434" : "#8a8a8a",
                                            boxShadow:  active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Material toggle — два равнозначных переключателя */}
                        {MATERIAL_KEYS.length > 1 && (
                            <div className="flex gap-1 bg-white/40 backdrop-blur-md border border-white/50 rounded-lg p-0.5">
                                {MATERIAL_KEYS.map((key) => {
                                    const mat    = TINT_CONFIG[key];
                                    const active = activeMaterial === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleMaterialChange(key)}
                                            className="min-w-[88px] sm:min-w-[100px] px-3 py-2 rounded-md text-[12px] font-semibold transition-all duration-200"
                                            style={{
                                                background: active ? "rgba(255,255,255,0.95)" : "transparent",
                                                color:      active ? "#23a592" : "#8a8a8a",
                                                boxShadow:  active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                            }}
                                        >
                                            {mat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Разделитель — только на десктопе */}
                    <div className="hidden sm:block w-px h-7 bg-[#e0e0e0]" />

                    {/* ── Ряд 2: VLT кнопки + Info ── */}
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                        {config.levels.map((lvl) => {
                            const active = activeVlt === lvl.vlt;
                            return (
                                <button
                                    key={lvl.vlt}
                                    onClick={() => handleVltChange(lvl.vlt)}
                                    className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200"
                                    style={{
                                        background: active ? "#23a59215" : "transparent",
                                        border:     active ? "1px solid #23a59250" : "1px solid transparent",
                                    }}
                                >
                                    <div
                                        className="w-2.5 h-2.5 rounded-full border border-[#e0e0e0] shrink-0"
                                        style={{ background: lvl.color }}
                                    />
                                    <span
                                        className="text-[13px] font-bold transition-colors"
                                        style={{ color: active ? "#23a592" : "#8a8a8a" }}
                                    >
                                        {lvl.vlt}%
                                    </span>
                                </button>
                            );
                        })}

                        {/* Info toggle */}
                        <button
                            onClick={() => setInfoOpen((o) => !o)}
                            className="flex items-center justify-center w-9 h-9 rounded-lg backdrop-blur-md transition-all duration-200 ml-1"
                            style={{
                                background: infoOpen ? "rgba(35,165,146,0.12)" : "rgba(255,255,255,0.5)",
                                border:     infoOpen ? "1px solid rgba(35,165,146,0.4)" : "1px solid rgba(255,255,255,0.5)",
                            }}
                            aria-label="Информация о плёнке"
                        >
                            <svg
                                width="14" height="14" viewBox="0 0 16 16" fill="none"
                                style={{ color: infoOpen ? "#23a592" : "#8a8a8a" }}
                            >
                                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M8 7v4M8 5.5v0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}
