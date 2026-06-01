import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dc2626" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "أبو الزهراء - لوحة التحكم",
    template: "%s | أبو الزهراء",
  },
  description: "لوحة التحكم المتكاملة للتحكم عن بعد بالأجهزة - Remote Device Management Dashboard with 200+ commands",
  keywords: ["Abu-Zahra", "Remote Control", "Device Management", "Android", "Security", "لوحة تحكم", "تحكم عن بعد"],
  authors: [{ name: "Abu-Zahra Team" }],
  applicationName: "أبو الزهراء",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "أبو الزهراء",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "أبو الزهراء - لوحة التحكم المتكاملة",
    description: "لوحة التحكم للتحكم عن بعد بالأجهزة مع أكثر من 200 أمر",
    type: "website",
    locale: "ar_SA",
    siteName: "أبو الزهراء",
  },
  twitter: {
    card: "summary_large_image",
    title: "أبو الزهراء",
    description: "لوحة التحكم للتحكم عن بعد بالأجهزة",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="أبو الزهراء" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered: ', registration.scope);
                    },
                    function(err) {
                      console.log('SW registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
