import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "ひとへやLab | 空想インテリアギャラリー",
  description: "Interior design collection powered by Notion",
  icons: {
    icon: "/hitoheya_lab_icon_final.svg",
    apple: "/hitoheya_lab_icon_final.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable}`}>
        {children}
      </body>
    </html>
  );
}
