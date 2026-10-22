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
{/* FOOTER */}
      <footer className="mt-20 py-10 border-t border-surface_border bg-surface text-center">
        <div className="flex flex-col items-center justify-center gap-4 px-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <h3 className="text-xl font-bold text-white">Modul Ajar Guru Hebat</h3>
          </div>
          
          <p className="text-slate-400 text-sm max-w-md">
            Platform asisten AI untuk guru Indonesia. Membantu merancang perangkat ajar, LKPD, dan soal evaluasi Kurikulum Merdeka secara otomatis dan efisien.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-slate-500 mt-4 font-medium">
            <button className="hover:text-brand-500 transition-colors">Kebijakan Privasi</button>
            <button className="hover:text-brand-500 transition-colors">Syarat & Ketentuan</button>
            <button className="hover:text-brand-500 transition-colors">Hubungi Kami</button>
          </div>
          
          <p className="text-xs text-slate-600 mt-6">
            © {new Date().getFullYear()} Modul Ajar Guru Hebat. Dibuat dengan ❤️ untuk Pendidikan Indonesia.
          </p>
        </div>
      </footer>