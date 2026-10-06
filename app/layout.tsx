import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'] 
});

export const metadata: Metadata = {
  title: "ModulGen AI",
  description: "Generator Modul Ajar Kurikulum Merdeka",
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