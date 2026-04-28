"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export function SceneLoader() {
    const { progress, active, loaded, total } = useProgress();
    const [hidden, setHidden] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Запоминаем что загрузка хоть раз была активной — иначе показывали бы оверлей и при ленивых
    // догрузках текстур уже после старта.
    useEffect(() => {
        if (active) setHasStarted(true);
    }, [active]);

    // После завершения — фейдим оверлей с задержкой, чтобы не мигало.
    useEffect(() => {
        if (!hasStarted) return;
        if (!active && progress >= 100) {
            const t = setTimeout(() => setHidden(true), 400);
            return () => clearTimeout(t);
        }
    }, [active, progress, hasStarted]);

    if (hidden) return null;

    const pct = Math.round(progress);
    const isFinishing = !active && progress >= 100;

    return (
        <div
            className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
                isFinishing ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
            {/* Силуэт машины — пульсирует */}
            <svg
                width="80"
                height="32"
                viewBox="0 0 120 48"
                fill="none"
                className="mb-6 animate-pulse"
                aria-hidden="true"
            >
                <path
                    d="M8 36 Q12 22 26 19 L48 18 Q60 14 76 17 L92 21 Q104 23 110 30 L112 34 Q113 38 109 38 L98 38 A6 6 0 0 1 86 38 L34 38 A6 6 0 0 1 22 38 L12 38 Q8 38 8 36 Z"
                    fill="#343434"
                    fillOpacity="0.85"
                />
                <path
                    d="M30 19 Q36 14 50 14 L70 14 Q82 14 88 19 L88 22 L30 22 Z"
                    fill="#23a592"
                    fillOpacity="0.18"
                />
                <circle cx="28" cy="38" r="6" fill="#1a1a1a" />
                <circle cx="92" cy="38" r="6" fill="#1a1a1a" />
                <circle cx="28" cy="38" r="2.5" fill="#23a592" />
                <circle cx="92" cy="38" r="2.5" fill="#23a592" />
            </svg>

            {/* Прогресс-бар */}
            <div className="w-[220px] h-[3px] rounded-full bg-[#e0e0e0] overflow-hidden">
                <div
                    className="h-full rounded-full bg-[#23a592] transition-[width] duration-200 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Подписи */}
            <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[20px] font-semibold tabular-nums text-[#23a592]">
                    {pct}%
                </span>
                <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#8a8a8a]">
                    загрузка модели
                </span>
            </div>

            <p className="mt-3 text-[11px] text-[#8a8a8a] max-w-[260px] text-center leading-relaxed">
                Подгружаем 3D-модель машины и сцену.
                {total > 0 && (
                    <>
                        <br />
                        <span className="font-mono text-[10px] text-[#bbb]">
                            {loaded} из {total} ресурсов
                        </span>
                    </>
                )}
            </p>
        </div>
    );
}
