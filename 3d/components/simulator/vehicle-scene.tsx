"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import {
    createGlassMaterial,
    TINT_CONFIG,
    type MaterialKey,
} from "./glass-material";

// mm_glass_windowtint → люк (sunroof)
// mm_glass_mphong2    → ВСЕ стёкла в одном меше (лобовое + боковые + заднее + фары)
// Разделяем mm_glass_mphong2 на переднюю / заднюю зону через clipping plane
const BODY_KEYWORDS = ["carpaint", "mm_carpaint"];

interface VehicleSceneProps {
    frontMaterialKey: MaterialKey;
    frontVlt: number;
    rearMaterialKey: MaterialKey;
    rearVlt: number;
    splitX: number; // 0–100
    hasModel: boolean;
    onReady?: () => void;
}

// ──────────────────────────────────────────────────────
// GLB модель — основной и единственный путь рендера машины
// ──────────────────────────────────────────────────────
function GLBCar({
    frontMaterialKey,
    frontVlt,
    rearMaterialKey,
    rearVlt,
    splitX,
    onReady,
}: Omit<VehicleSceneProps, "hasModel">) {
    const { scene } = useGLTF("/models/crossover.glb");
    const { gl } = useThree();
    gl.localClippingEnabled = true;

    const rearCloneRef = useRef<THREE.Mesh | null>(null);

    const frontConfig = TINT_CONFIG[frontMaterialKey];
    const frontLevel  = frontConfig.levels.find((l) => l.vlt === frontVlt) ?? frontConfig.levels[0];

    const rearConfig  = TINT_CONFIG[rearMaterialKey];
    const rearLevel   = rearConfig.levels.find((l) => l.vlt === rearVlt)  ?? rearConfig.levels[0];

    const { clipFactory, clipTint } = useMemo(() => ({
        clipFactory: new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
        clipTint:    new THREE.Plane(new THREE.Vector3( 1, 0, 0), 0),
    }), []);

    // Применяем материалы к стёклам
    useEffect(() => {
        // Убираем предыдущий клон задней зоны
        if (rearCloneRef.current) {
            rearCloneRef.current.parent?.remove(rearCloneRef.current);
            rearCloneRef.current = null;
        }

        scene.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const name = child.name.toLowerCase();

            // Люк (sunroof) → задняя зона
            if (name.includes("mm_glass_windowtint")) {
                child.material = createGlassMaterial({
                    color:        rearLevel.color,
                    transmission: rearLevel.transmission,
                    roughness:    rearLevel.roughness,
                    clippingPlanes: [clipTint],
                });
                child.castShadow    = false;
                child.receiveShadow = false;
                child.renderOrder   = 2;
                child.frustumCulled = false;
            }

            // ВСЕ стёкла (mm_glass_mphong2) → разрезаем clipping plane на перед/зад
            if (name.includes("mm_glass_mphong2")) {
                // Определяем ось длины авто по bounding box
                child.updateWorldMatrix(true, false);
                const box = new THREE.Box3().setFromObject(child);

                const sizeX = box.max.x - box.min.x;
                const sizeZ = box.max.z - box.min.z;
                const useX  = sizeX >= sizeZ;

                // Разрез ближе к B-стойке (~42% от min, чтобы задняя зона не залезала на перед)
                const splitVal = useX
                    ? box.min.x + (box.max.x - box.min.x) * 0.42
                    : box.min.z + (box.max.z - box.min.z) * 0.42;

                console.log(`[ZONE] axis=${useX ? "X" : "Z"}, range=[${
                    (useX ? box.min.x : box.min.z).toFixed(2)}, ${
                    (useX ? box.max.x : box.max.z).toFixed(2)}], split=${splitVal.toFixed(2)}`);

                // Плоскости разреза в world-space
                const frontNormal = useX
                    ? new THREE.Vector3(1, 0, 0)
                    : new THREE.Vector3(0, 0, 1);

                // front: visible when coord >= splitVal
                const zoneFrontPlane = new THREE.Plane(frontNormal.clone(), -splitVal);
                // rear:  visible when coord <= splitVal
                const zoneRearPlane  = new THREE.Plane(frontNormal.clone().negate(), splitVal);

                // ── Оригинальный меш → передняя зона ──
                child.material = createGlassMaterial({
                    color:        frontLevel.color,
                    transmission: frontLevel.transmission,
                    roughness:    frontLevel.roughness,
                    clippingPlanes: [clipTint, zoneFrontPlane],
                });
                child.castShadow    = false;
                child.receiveShadow = false;
                child.renderOrder   = 2;
                child.frustumCulled = false;

                // ── Клон → задняя зона ──
                const clone = child.clone();
                clone.material = createGlassMaterial({
                    color:        rearLevel.color,
                    transmission: rearLevel.transmission,
                    roughness:    rearLevel.roughness,
                    clippingPlanes: [clipTint, zoneRearPlane],
                });
                clone.castShadow    = false;
                clone.receiveShadow = false;
                clone.renderOrder   = 2;
                clone.frustumCulled = false;
                child.parent?.add(clone);
                rearCloneRef.current = clone;
            }

            // Кузов
            if (BODY_KEYWORDS.some((k) => name.includes(k))) {
                (child.material as THREE.MeshStandardMaterial).color?.set("#1a1a1a");
            }
        });

        return () => {
            if (rearCloneRef.current) {
                rearCloneRef.current.parent?.remove(rearCloneRef.current);
                rearCloneRef.current = null;
            }
        };
    }, [scene, frontLevel, rearLevel, clipTint]);

    // Сигнал родителю что сцена готова — материалы применены, можно показывать UI
    useEffect(() => {
        if (!scene) return;
        const id = requestAnimationFrame(() => onReady?.());
        return () => cancelAnimationFrame(id);
    }, [scene, onReady]);

    useFrame(() => {
        const x = (splitX / 100) * 4 - 2;
        clipFactory.constant = -x;
        clipTint.constant    =  x;
    });

    return (
        <group>
            <primitive object={scene} scale={0.5} position={[0, 0, 0]} />
            <ContactShadows position={[0, -0.01, 0]} opacity={0.8} scale={12} blur={2.5} far={4} />
        </group>
    );
}

// ──────────────────────────────────────────────────────
// Главный экспорт — рендерим машину только когда модель доступна
// ──────────────────────────────────────────────────────
export function VehicleScene({ hasModel, onReady, ...props }: VehicleSceneProps) {
    return (
        <>
            <Environment files="/hdr/potsdamer_platz_1k.hdr" />
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
            <directionalLight position={[-5, 4, -3]} intensity={0.4} />

            {hasModel && <GLBCar {...props} onReady={onReady} />}
        </>
    );
}
