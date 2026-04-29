"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { VehicleScene } from "./vehicle-scene";
import { ControlPanel } from "./control-panel";
import { SceneLoader } from "./scene-loader";
import { TINT_CONFIG, type MaterialKey } from "./glass-material";

const MODEL_PATH = "/models/crossover.glb";

export default function TintingSimulator() {
    // Передняя зона: лобовое + передние боковые
    const [frontMaterial, setFrontMaterial] = useState<MaterialKey>("monocarbon");
    const [frontVlt, setFrontVlt]           = useState(35);

    // Задняя зона: задние боковые + заднее стекло
    const [rearMaterial, setRearMaterial]   = useState<MaterialKey>("monocarbon");
    const [rearVlt, setRearVlt]             = useState(15);

    const [splitX, setSplitX]               = useState(50);
    const [hasModel, setHasModel]           = useState(false);
    const [isMobile, setIsMobile]           = useState(false);
    const [ready, setReady]                 = useState(false);

    useEffect(() => {
        fetch(MODEL_PATH, { method: "HEAD" })
            .then((r) => setHasModel(r.ok))
            .catch(() => setHasModel(false));
    }, []);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const handleReady = useCallback(() => setReady(true), []);

    const handleFrontMaterialChange = (key: MaterialKey) => {
        setFrontMaterial(key);
        setFrontVlt(
            TINT_CONFIG[key].levels[0].vlt === 80 ? 80
            : TINT_CONFIG[key].levels[1]?.vlt ?? TINT_CONFIG[key].levels[0].vlt
        );
    };

    const handleRearMaterialChange = (key: MaterialKey) => {
        setRearMaterial(key);
        setRearVlt(
            TINT_CONFIG[key].levels[0].vlt === 80 ? 80
            : TINT_CONFIG[key].levels[1]?.vlt ?? TINT_CONFIG[key].levels[0].vlt
        );
    };

    return (
        <div className="relative w-full h-full bg-white">
            <Canvas
                frameloop="always"
                shadows
                dpr={[1, 2]}
                camera={{
                    position: isMobile ? [13, 4.2, 13] : [4.5, 1.7, 4.5],
                    fov: isMobile ? 55 : 42,
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <Suspense fallback={null}>
                    <VehicleScene
                        frontMaterialKey={frontMaterial}
                        frontVlt={frontVlt}
                        rearMaterialKey={rearMaterial}
                        rearVlt={rearVlt}
                        splitX={splitX}
                        hasModel={hasModel}
                        onReady={handleReady}
                    />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    minDistance={0.8}
                    maxDistance={20}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2.05}
                    makeDefault
                />
            </Canvas>

            <SceneLoader visible={!ready} />

            {ready && (
                <ControlPanel
                    frontMaterial={frontMaterial}
                    frontVlt={frontVlt}
                    rearMaterial={rearMaterial}
                    rearVlt={rearVlt}
                    splitX={splitX}
                    onFrontMaterialChange={handleFrontMaterialChange}
                    onFrontVltChange={setFrontVlt}
                    onRearMaterialChange={handleRearMaterialChange}
                    onRearVltChange={setRearVlt}
                    onSplitChange={setSplitX}
                />
            )}

            {!hasModel && (
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3 opacity-30">
                    <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#343434]">
                        Модель недоступна
                    </span>
                </div>
            )}
        </div>
    );
}
