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
                .tint-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 2px; background: rgba(255,255,255,0.12); border-radius: 9999px; cursor: ew-resize; outline: none; }
                .tint-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #ffffff; cursor: grab; box-shadow: 0 0 0 1px rgba(255,255,255,0.15); }
                .tint-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #ffffff; cursor: grab; border: none; }
            `}</style>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 w-[220px]">
                <input
                    type="range"
                    min={0} max={100}
                    value={splitX}
                    onChange={(e) => onSplitChange(Number(e.target.value))}
                    className="tint-slider"
                />
                <div className="flex w-full justify-between">
                    <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/20">Без плёнки</span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/20">С плёнкой</span>
                </div>
            </div>

            {/* ─── Floating UI — низ экрана ─── */}
            <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center pb-6 pointer-events-none">

                {/* ─── Выдвижной инфо-блок ─── */}
                <div
                    className="pointer-events-auto w-[calc(100%-40px)] max-w-[480px] overflow-hidden transition-all duration-300 ease-out"
                    style={{
                        maxHeight: infoOpen ? "280px" : "0px",
                        opacity:   infoOpen ? 1 : 0,
                        marginBottom: infoOpen ? "12px" : "0px",
                    }}
                >
                    <div className="rounded-2xl border border-white/[0.08] bg-black/80 backdrop-blur-2xl px-5 py-4">

                        {/* ─── Шапка: название + спеки в одну строку ─── */}
                        <div className="flex items-center gap-4 mb-3.5">
                            {/* VLT + название */}
                            <div className="flex items-baseline gap-2 shrink-0">
                                <span
                                    className="font-mono text-[22px] font-bold leading-none"
                                    style={{ color: config.accentColor }}
                                >
                                    {level.vlt}%
                                </span>
                                <span className="font-sans text-[12px] text-white/40 font-medium">
                                    {level.title}
                                </span>
                            </div>

                            {/* Разделитель */}
                            <div className="w-px h-5 bg-white/[0.08] shrink-0" />

                            {/* Спецификации в строку */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[13px] font-semibold" style={{ color: config.accentColor }}>
                                        {level.tser}%
                                    </span>
                                    <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/25">
                                        Тепло
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[13px] font-semibold text-purple-400">
                                        {level.uvProtection}%
                                    </span>
                                    <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/25">
                                        УФ
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`font-mono text-[13px] font-semibold ${thirdColor}`}>
                                        {thirdValue}%
                                    </span>
                                    <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/25">
                                        {thirdLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ─── Описание ─── */}
                        <p className="font-sans text-[12px] text-white/35 leading-relaxed mb-3">
                            {level.description}
                        </p>

                        {/* ─── Характеристики в столбик ─── */}
                        <div className="flex flex-col gap-1.5">
                            {level.characteristics.map((c, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div
                                        className="w-1 h-1 rounded-full shrink-0"
                                        style={{ background: config.accentColor, opacity: 0.4 }}
                                    />
                                    <span className="font-sans text-[11px] text-white/30">
                                        {c}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Основная строка контролов ─── */}
                <div className="pointer-events-auto flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-white/[0.06] bg-black/70 backdrop-blur-2xl">

                    {/* Zone toggle */}
                    <div className="flex bg-white/[0.04] rounded-lg p-0.5 mr-1">
                        {(["front", "rear"] as const).map((z) => {
                            const active = zone === z;
                            const label  = z === "front" ? "Перед" : "Зад";
                            return (
                                <button
                                    key={z}
                                    onClick={() => setZone(z)}
                                    className="px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-[0.1em] transition-all duration-200"
                                    style={{
                                        background: active ? "rgba(255,255,255,0.08)" : "transparent",
                                        color:      active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Разделитель */}
                    <div className="w-px h-6 bg-white/[0.08]" />

                    {/* Переключатель плёнки */}
                    {MATERIAL_KEYS.length > 1 && (
                        <>
                            <div className="flex bg-white/[0.04] rounded-lg p-0.5">
                                {MATERIAL_KEYS.map((key) => {
                                    const mat    = TINT_CONFIG[key];
                                    const active = activeMaterial === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleMaterialChange(key)}
                                            className="px-2.5 py-1.5 rounded-md font-sans text-[10px] font-medium transition-all duration-200"
                                            style={{
                                                background: active ? `${mat.accentColor}15` : "transparent",
                                                color:      active ? mat.accentColor : "rgba(255,255,255,0.25)",
                                                border:     active ? `1px solid ${mat.accentColor}30` : "1px solid transparent",
                                            }}
                                        >
                                            {mat.name}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="w-px h-6 bg-white/[0.08]" />
                        </>
                    )}

                    {/* VLT кнопки */}
                    {config.levels.map((lvl) => {
                        const active = activeVlt === lvl.vlt;
                        return (
                            <button
                                key={lvl.vlt}
                                onClick={() => handleVltChange(lvl.vlt)}
                                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
                                style={{
                                    background: active ? `${config.accentColor}15` : "transparent",
                                    border:     active ? `1px solid ${config.accentColor}40` : "1px solid transparent",
                                }}
                            >
                                {/* Цветовой индикатор */}
                                <div
                                    className="w-2.5 h-2.5 rounded-full border border-white/10 shrink-0"
                                    style={{ background: lvl.color }}
                                />
                                <span
                                    className="font-mono text-[13px] font-semibold transition-colors"
                                    style={{ color: active ? config.accentColor : "rgba(255,255,255,0.35)" }}
                                >
                                    {lvl.vlt}%
                                </span>
                            </button>
                        );
                    })}

                    {/* Разделитель */}
                    <div className="w-px h-6 bg-white/[0.08]" />

                    {/* Info toggle */}
                    <button
                        onClick={() => setInfoOpen((o) => !o)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
                        style={{
                            background: infoOpen ? `${config.accentColor}15` : "rgba(255,255,255,0.03)",
                            border:     infoOpen ? `1px solid ${config.accentColor}30` : "1px solid transparent",
                        }}
                    >
                        <svg
                            width="14" height="14" viewBox="0 0 16 16" fill="none"
                            style={{ color: infoOpen ? config.accentColor : "rgba(255,255,255,0.3)" }}
                        >
                            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" />
                            <path d="M8 7v4M8 5.5v0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

            </div>
        </>
    );
}
