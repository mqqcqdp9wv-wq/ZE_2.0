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
            className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
                isFinishing ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
            {/* Логотип ZE Studio */}
            <div className="mb-8 flex items-baseline gap-0 select-none animate-pulse">
                <span
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: "28px",
                        letterSpacing: "-0.01em",
                        color: "#343434",
                        lineHeight: 1,
                    }}
                >
                    ze
                </span>
                <span
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: "28px",
                        color: "#23a592",
                        lineHeight: 1,
                    }}
                >
                    .
                </span>
                <span
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: "28px",
                        letterSpacing: "-0.01em",
                        color: "#343434",
                        lineHeight: 1,
                    }}
                >
                    studio
                </span>
            </div>

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
