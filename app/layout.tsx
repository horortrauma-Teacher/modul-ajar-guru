import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'] 
});

export const metadata: Metadata = {
  title: "Modul Ajar Guru Hebat | Generator AI Kurikulum Merdeka",
  description: "Platform AI asisten guru Indonesia. Buat Modul Ajar, RPP, LKPD, dan Soal HOTS Kurikulum Merdeka hanya dalam hitungan detik.",
  openGraph: {
    title: "Modul Ajar Guru Hebat - Solusi Cepat Bikin RPP",
    description: "Lelah begadang bikin administrasi? Biarkan AI yang menyusun Modul Ajar, LKPD, dan Soal HOTS untuk Anda. Coba gratis sekarang!",
    url: "https://modul-ajar-guru.vercel.app",
    siteName: "Modul Ajar Guru Hebat",
    images: [
      {
        url: "https://modul-ajar-guru.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Preview Modul Ajar Guru Hebat",
      }
    ],
    locale: "id_ID",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark scroll-smooth">
      <head>
        {/* Memuat FontAwesome & Script PDF */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" async></script>
      </head>
      <body className={plusJakartaSans.className}>
        {children}
      </body>
    </html>
  );
}