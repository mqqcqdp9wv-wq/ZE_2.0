"use client";

import * as THREE from "three";

export interface TintLevel {
    vlt: number;
    label: string;
    color: string;
    transmission: number;
    roughness: number;
    gost: boolean;
    title: string;
    description: string;
    characteristics: string[];
    /** Total Solar Energy Rejected (%) */
    tser: number;
    /** UV Protection (%) */
    uvProtection: number;
    /** Glare Reduction (%) — для тонировочных плёнок */
    glareReduction?: number;
    /** IR Rejection (%) — для керамических / атермальных плёнок */
    irRejection?: number;
}

export interface TintMaterial {
    name: string;
    fullName: string;
    description: string;
    accentColor: string;
    /** Какую третью метрику показывать: "glare" → Блики, "ir" → ИК */
    thirdSpec: "glare" | "ir";
    levels: TintLevel[];
}

// Конфигурация плёнок — все физические параметры
// transmission здесь = opacity материала (0 = невидим, 1 = глухой)
// VLT 5%  → почти глухое стекло  → opacity ≈ 0.94
// VLT 50% → полупрозрачное       → opacity ≈ 0.50
export const TINT_CONFIG: Record<string, TintMaterial> = {
    monocarbon: {
        name: "MonoCarbon",
        fullName: "Rayno MonoCarbon",
        description: "Тонировочная плёнка на основе настоящего углерода (карбона), созданная с использованием передовой нанотехнологии Rayno, без красителей и металлов. Выцветание менее 1% за 10 лет.",
        accentColor: "#4A8FE7",
        thirdSpec: "glare",
        levels: [
            {
                vlt: 5, label: "5%", color: "#020202", transmission: 0.96, roughness: 0.05, gost: false,
                tser: 54, uvProtection: 99.9, glareReduction: 95,
                title: "Лимузинная",
                description: "Лимузинная тонировка с максимальным уровнем приватности и защиты. Почти полное затемнение стёкол создаёт эффект премиум-класса.",
                characteristics: [
                    "Максимальная приватность",
                    "Наивысшая защита от тепла и UV",
                    "Премиальный внешний вид",
                    "Только для задних стёкол",
                ],
            },
            {
                vlt: 15, label: "15%", color: "#0e0e0e", transmission: 0.78, roughness: 0.05, gost: false,
                tser: 45, uvProtection: 99.9, glareReduction: 80,
                title: "Насыщенная",
                description: "Тёмная тонировка для максимальной приватности и защиты от солнца. Высокий уровень защиты салона от выгорания и перегрева.",
                characteristics: [
                    "Высокая степень приватности",
                    "Эффективное снижение бликов",
                    "Защита салона от выгорания",
                    "Для задних боковых и заднего стекла",
                ],
            },
            {
                vlt: 35, label: "35%", color: "#1c1c1c", transmission: 0.56, roughness: 0.04, gost: false,
                tser: 35, uvProtection: 99.9, glareReduction: 59,
                title: "Комфорт",
                description: "Популярный выбор для комфортной тонировки с хорошим балансом приватности и видимости. Насыщенный чёрный оттенок без выгорания.",
                characteristics: [
                    "Оптимальный баланс приватности и видимости",
                    "Популярный выбор для боковых стёкол",
                    "Nano-Carbon технология",
                    "Комфортное вождение днём и ночью",
                ],
            },
            {
                vlt: 50, label: "50%", color: "#282828", transmission: 0.46, roughness: 0.04, gost: true,
                tser: 28, uvProtection: 99.9, glareReduction: 42,
                title: "Лёгкая",
                description: "Универсальная средняя тонировка. Отличная видимость днём и ночью. Соответствует ГОСТ для передних стёкол.",
                characteristics: [
                    "Без красителей — стабильный цвет",
                    "Выцветание менее 1% за 10 лет",
                    "Отличная видимость днём и ночью",
                    "Соответствует ГОСТ 33997-2016",
                ],
            },
        ],
    },
    centum: {
        name: "Centum",
        fullName: "Rayno Centum",
        description: "Атермальная керамическая плёнка без красителей и металлов. Nano-Ceramic технология для максимального светопропускания с мощным отражением солнечной энергии.",
        accentColor: "#22B8A0",
        thirdSpec: "ir",
        levels: [
            {
                vlt: 80, label: "80%", color: "#c0c8d0", transmission: 0.18, roughness: 0.02, gost: true,
                tser: 39, uvProtection: 99, irRejection: 80,
                title: "Атермальная",
                description: "Идеальна для лобового стекла. Максимальное светопропускание с защитой от тепла и UV. Соответствует ГОСТ.",
                characteristics: [
                    "Nano-Ceramic технология",
                    "Без красителей и металлов",
                    "Идеальна для лобового стекла",
                ],
            },
        ],
    },
};

export type MaterialKey = "monocarbon" | "centum";

// Базовое заводское стекло (левая сторона слайдера)
// opacity 0.22 → видно как стекло (голубой блик) но насквозь прозрачное
export const FACTORY_GLASS_PARAMS = {
    color: "#c8e8f4",
    transmission: 0.22,
    roughness: 0.0,
};

// Создаёт Three.js материал для стекла
// params.transmission используется как opacity (0 = прозрачный, 1 = глухой)
export function createGlassMaterial(params: {
    color: string;
    transmission: number; // здесь это opacity (непрозрачность)
    roughness: number;
    clippingPlanes?: THREE.Plane[];
}): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(params.color),
        metalness: 0.15,
        roughness: params.roughness,
        // PBR transmission отключён — используем простой alpha
        transmission: 0,
        opacity: params.transmission,
        transparent: true,
        envMapIntensity: 1.5,
        // Clearcoat снижен: иначе одинаковый блик на всех уровнях маскирует разницу opacity
        clearcoat: 0.25,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
        clippingPlanes: params.clippingPlanes ?? [],
    });
}
