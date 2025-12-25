import type { Metadata, Viewport } from "next";
import { Outfit, Cairo } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: "AissaPhone Cloud | نظام إدارة المبيعات",
  description: "المنصة المتكاملة لإدارة متاجر الهواتف، الديون، والمخزون بدقة واحترافية.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AissaPhone",
  },
  formatDetection: {
    telephone: false,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${cairo.variable} antialiased font-sans`}
      >
        {children}

      </body>
    </html>
  );
}
