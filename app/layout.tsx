import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSettings } from "@/server/settings-service";
import { GlobalMusicPlayer } from "@/components/global-music-player";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lepidichoi.io.vn"),
  title: {
    template: "%s | Hôm Nay Ăn Gì? - Lê Pi đi chơi",
    default: "Hôm Nay Ăn Gì? - Lê Pi đi chơi (lepidichoi)",
  },
  description: "Trang web giải quyết câu hỏi khó nhất: Hôm nay ăn gì? Vòng quay đồ ăn ngẫu nhiên, khám phá ẩm thực Hà Nội, chọn địa điểm vui chơi cùng Lê Pi đi chơi (lepidichoi).",
  keywords: [
    "lepidichoi", 
    "Lê Pi đi chơi", 
    "Hà Nội ăn gì", 
    "hôm nay ăn gì", 
    "vòng quay đồ ăn", 
    "ăn gì tại hà nội", 
    "random ẩm thực hà nội", 
    "quán ngon hà nội", 
    "hẹn hò hà nội", 
    "địa điểm đi chơi hà nội"
  ],
  authors: [{ name: "Lê Pi" }],
  openGraph: {
    title: "Hôm Nay Ăn Gì? - Lê Pi đi chơi",
    description: "Vòng quay đồ ăn ngẫu nhiên, khám phá ẩm thực Hà Nội cùng Lê Pi đi chơi.",
    url: "https://lepidichoi.io.vn",
    siteName: "Lê Pi đi chơi",
    locale: "vi_VN",
    type: "website",
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ]
  },
  manifest: '/site.webmanifest'
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("date_auth")?.value === "true";

  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} grain flex min-h-screen flex-col font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <Navbar isAuthenticated={isAuthenticated} />
            <main className="flex-1">{children}</main>
            <Footer />
            <GlobalMusicPlayer initialEnabled={settings.musicEnabled} />
            <Toaster position="bottom-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
