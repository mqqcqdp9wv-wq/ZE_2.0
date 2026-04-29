"use client";

import { useProgress } from "@react-three/drei";

interface SceneLoaderProps {
    visible: boolean;
}

export function SceneLoader({ visible }: SceneLoaderProps) {
    // useProgress даёт реальные проценты загрузки. Если вне Canvas он не обновляется
    // в каких-то браузерах — увидим 0%, не критично: лоадер всё равно скоро уйдёт по visible=false.
    const { progress, loaded, total } = useProgress();
    const pct = Math.round(progress);

    return (
        <div
            className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${
                visible ? "opacity-100" : "opacity-0 pointer-events-none"
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
                        color: "#f5f5f5",
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
                        color: "#f5f5f5",
                        lineHeight: 1,
                    }}
                >
                    studio
                </span>
            </div>

            {/* Прогресс-бар */}
            <div className="w-[220px] h-[3px] rounded-full bg-white/15 overflow-hidden">
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
                <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/55">
                    загрузка модели
                </span>
            </div>

            <p className="mt-3 text-[11px] text-white/55 max-w-[260px] text-center leading-relaxed">
                Подгружаем 3D-модель машины и сцену.
                {total > 0 && (
                    <>
                        <br />
                        <span className="font-mono text-[10px] text-white/30">
                            {loaded} из {total} ресурсов
                        </span>
                    </>
                )}
            </p>
        </div>
    );
}
