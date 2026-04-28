import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Симулятор тонировки — ZE Studio",
    description:
        "Интерактивный 3D-симулятор тонировки автомобиля. Подберите материал и процент светопропускания, посмотрите результат на машине в реальном времени.",
    metadataBase: new URL("https://3d.ze-studio48.ru"),
    openGraph: {
        title: "Симулятор тонировки — ZE Studio",
        description:
            "Подберите материал плёнки и процент светопропускания на интерактивной 3D-модели.",
        url: "https://3d.ze-studio48.ru",
        siteName: "ZE Studio",
        locale: "ru_RU",
        type: "website",
    },
    icons: { icon: "/favicon.ico" },
};

export const viewport = {
    themeColor: "#0F0F0F",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
            <body>{children}</body>
        </html>
    );
}
