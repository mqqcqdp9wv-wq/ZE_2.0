"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import {
    createGlassMaterial,
    FACTORY_GLASS_PARAMS,
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
}

// ──────────────────────────────────────────────────────
// Процедурная машина — заглушка пока нет .glb модели
// ──────────────────────────────────────────────────────
function ProceduralCar({
    frontMaterialKey,
    frontVlt,
    rearMaterialKey,
    rearVlt,
    splitX,
}: Omit<VehicleSceneProps, "hasModel">) {
    const { gl } = useThree();
    gl.localClippingEnabled = true;

    const frontConfig = TINT_CONFIG[frontMaterialKey];
    const frontLevel  = frontConfig.levels.find((l) => l.vlt === frontVlt) ?? frontConfig.levels[0];

    const rearConfig  = TINT_CONFIG[rearMaterialKey];
    const rearLevel   = rearConfig.levels.find((l) => l.vlt === rearVlt)  ?? rearConfig.levels[0];

    // Clipping planes для слайдера До/После
    const { clipFactory, clipTint } = useMemo(() => ({
        clipFactory: new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
        clipTint:    new THREE.Plane(new THREE.Vector3( 1, 0, 0), 0),
    }), []);

    // Материалы
    const matFactory = useMemo(() =>
        createGlassMaterial({ ...FACTORY_GLASS_PARAMS, clippingPlanes: [clipFactory] }),
    [clipFactory]);

    const matFront = useMemo(() =>
        createGlassMaterial({
            color:        frontLevel.color,
            transmission: frontLevel.transmission,
            roughness:    frontLevel.roughness,
            clippingPlanes: [clipTint],
        }),
    [frontLevel, clipTint]);

    const matRear = useMemo(() =>
        createGlassMaterial({
            color:        rearLevel.color,
            transmission: rearLevel.transmission,
            roughness:    rearLevel.roughness,
            clippingPlanes: [clipTint],
        }),
    [rearLevel, clipTint]);

    // Синхронизируем плоскости с позицией слайдера
    useFrame(() => {
        const x = (splitX / 100) * 4 - 2;
        clipFactory.constant = -x;
        clipTint.constant    =  x;
    });

    const bodyMat = useMemo(() =>
        new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.3, metalness: 0.8 }),
    []);

    const rimMat = useMemo(() =>
        new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.2, metalness: 0.9 }),
    []);

    const tireMat = useMemo(() =>
        new THREE.MeshStandardMaterial({ color: "#080808", roughness: 0.9 }),
    []);

    return (
        <group position={[0, 0, 0]}>
            {/* ─── Кузов ─── */}
            <mesh castShadow receiveShadow material={bodyMat} position={[0, 0.35, 0]}>
                <boxGeometry args={[4.2, 0.75, 1.85]} />
            </mesh>
            {/* Крыша */}
            <mesh castShadow material={bodyMat} position={[-0.15, 0.9, 0]}>
                <boxGeometry args={[2.4, 0.55, 1.65]} />
            </mesh>
            {/* Капот скос */}
            <mesh castShadow material={bodyMat} position={[1.35, 0.62, 0]} rotation={[0, 0, -0.35]}>
                <boxGeometry args={[0.8, 0.12, 1.65]} />
            </mesh>
            {/* Багажник скос */}
            <mesh castShadow material={bodyMat} position={[-1.3, 0.62, 0]} rotation={[0, 0, 0.28]}>
                <boxGeometry args={[0.7, 0.12, 1.65]} />
            </mesh>

            {/* ─── Лобовое стекло — передняя зона ─── */}
            <mesh position={[0.98, 0.88, 0]} rotation={[0, 0, -0.62]} material={matFront}>
                <planeGeometry args={[0.78, 1.6]} />
            </mesh>
            <mesh position={[0.98, 0.88, 0]} rotation={[0, 0, -0.62]} material={matFactory}>
                <planeGeometry args={[0.78, 1.6]} />
            </mesh>

            {/* ─── Заднее стекло — задняя зона ─── */}
            <mesh position={[-1.28, 0.88, 0]} rotation={[0, 0, 0.5]} material={matRear}>
                <planeGeometry args={[0.72, 1.6]} />
            </mesh>
            <mesh position={[-1.28, 0.88, 0]} rotation={[0, 0, 0.5]} material={matFactory}>
                <planeGeometry args={[0.72, 1.6]} />
            </mesh>

            {/* ─── Передние боковые — правая сторона (передняя зона) ─── */}
            <group>
                <mesh position={[0.38, 0.91, 0.927]} material={matFront}>
                    <planeGeometry args={[0.88, 0.5]} />
                </mesh>
                <mesh position={[0.38, 0.91, 0.927]} material={matFactory}>
                    <planeGeometry args={[0.88, 0.5]} />
                </mesh>
            </group>

            {/* ─── Задние боковые — правая сторона (задняя зона) ─── */}
            <group>
                <mesh position={[-0.5, 0.91, 0.927]} material={matRear}>
                    <planeGeometry args={[0.88, 0.5]} />
                </mesh>
                <mesh position={[-0.5, 0.91, 0.927]} material={matFactory}>
                    <planeGeometry args={[0.88, 0.5]} />
                </mesh>
            </group>

            {/* ─── Передние боковые — левая сторона (передняя зона) ─── */}
            <group>
                <mesh position={[0.38, 0.91, -0.927]} rotation={[0, Math.PI, 0]} material={matFront}>
                    <planeGeometry args={[0.88, 0.5]} />
                </mesh>
                <mesh position={[0.38, 0.91, -0.927]} rotation={[0, Math.PI, 0]} material={matFactory}>
                    <planeGeometry args={[0.88, 0.5]} />
                </mesh>
            </group>

            {/* ─── Задние боковые — левая сторона (задняя зона) ─── */}
            <group>
                <mesh position={[-0.5, 0.91, -0.927]} rotation={[0, Math.PI, 0]} material={matRear}>
                    <planeGeometry args={[0.88, 0.5]} />
                </mesh>
                <mesh position={[-0.5, 0.91, -0.927]} rotation={[0, Math.PI, 0]} material={matFactory}>
                    <planeGeometry args={[0.88, 0.5]} />
                </mesh>
            </group>

            {/* ─── Колёса ─── */}
            {([ [-1.3, -0.08,  0.98], [1.3, -0.08,  0.98],
                [-1.3, -0.08, -0.98], [1.3, -0.08, -0.98],
            ] as [number, number, number][]).map((pos, i) => (
                <group key={i} position={pos}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={tireMat}>
                        <cylinderGeometry args={[0.38, 0.38, 0.26, 32]} />
                    </mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={rimMat}>
                        <cylinderGeometry args={[0.24, 0.24, 0.28, 16]} />
                    </mesh>
                </group>
            ))}

            {/* Тень */}
            <ContactShadows
                position={[0, -0.46, 0]}
                opacity={0.7}
                scale={12}
                blur={2.5}
                far={1}
                color="#000"
            />
        </group>
    );
}

// ──────────────────────────────────────────────────────
// GLB модель — подключается когда есть файл
// ──────────────────────────────────────────────────────
function GLBCar({
    frontMaterialKey,
    frontVlt,
    rearMaterialKey,
    rearVlt,
    splitX,
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
// Главный экспорт — выбирает версию в зависимости от наличия модели
// ──────────────────────────────────────────────────────
export function VehicleScene(props: VehicleSceneProps) {
    return (
        <>
            <Environment files="/hdr/potsdamer_platz_1k.hdr" />
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
            <directionalLight position={[-5, 4, -3]} intensity={0.4} />

            {props.hasModel
                ? <GLBCar {...props} />
                : <ProceduralCar {...props} />
            }
        </>
    );
}
