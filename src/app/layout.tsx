import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DersRotası AI - Üniversite Öğrencileri İçin Akıllı Ders Planlayıcısı",
    template: "%s | DersRotası AI",
  },
  description:
    "Üniversite öğrencileri için yapay zeka destekli akıllı ders, ödev, sınav ve çalışma planlayıcısı.",
};

// Sayfa ilk yüklenirken temanın (açık/koyu) parlamasını önlemek için head içine enjekte edilen inline script
const themeScript = `(function(){try{var key='dersrotasi-tema';var saved=localStorage.getItem(key);var isDark=saved?saved==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(isDark){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-main font-sans selection:bg-accent/20 selection:text-accent">
        {children}
      </body>
    </html>
  );
}
