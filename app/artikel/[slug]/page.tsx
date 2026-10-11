"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DetailArtikel() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>("");

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        setArticle(data);
      }
      setLoading(false);
    }
    fetchArticle();
  }, [slug]);

  // Ekstrak heading untuk Daftar Isi setelah artikel dimuat
  useEffect(() => {
    if (!article) return;
    
    // Tunggu render DOM selesai
    setTimeout(() => {
      const articleContent = document.getElementById("article-content");
      if (!articleContent) return;

      const elements = Array.from(articleContent.querySelectorAll("h2, h3"));
      const extractedHeadings = elements.map((el, index) => {
        // Buat ID jika belum ada
        if (!el.id) {
          el.id = `heading-${index}`;
        }
        return {
          id: el.id,
          text: el.textContent || "",
          level: el.tagName.toLowerCase() === "h2" ? 2 : 3
        };
      });
      setHeadings(extractedHeadings);
    }, 100);
  }, [article]);

  // Observer untuk highlight Daftar Isi saat di-scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px", threshold: 0.1 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleShareWA = () => {
    const url = window.location.href;
    const text = `Baca artikel menarik ini: *${article?.title}*\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Tautan artikel berhasil disalin!");
  };

  if (loading) {
    return <div className="min-h-screen bg-background text-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Artikel Tidak Ditemukan</h1>
        <Link href="/" className="text-brand-500 hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  // Hitung perkiraan waktu baca (asumsi 200 kata per menit)
  const wordCount = article.content ? article.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="bg-background min-h-screen text-slate-200 font-sans antialiased pb-20">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-surface_border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">Modul Ajar Guru Hebat</span>
          </Link>
          <div className="flex gap-3">
             <Link href="/" className="text-slate-400 hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors">
               Kembali ke Beranda
             </Link>
             <Link href="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold py-1.5 px-4 rounded-full transition-colors hidden sm:block">
               Coba Gratis 10 Kuota
             </Link>
          </div>
        </div>
      </nav>

      {/* BREADCRUMBS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-400 transition-colors">Beranda</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">Blog & Tips Guru</span>
          <span className="mx-2">/</span>
          <span className="text-slate-300 truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 lg:gap-12 animate-fade items-start">
        
        {/* KOLOM 1: DAFTAR ISI (KIRI - KINI DISEMBUNYIKAN DI MOBILE) */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28">
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4">Daftar Isi</h3>
            {headings.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Tidak ada daftar isi.</p>
            ) : (
              <ul className="space-y-3">
                {headings.map((h) => (
                  <li 
                    key={h.id} 
                    className={`transition-all duration-300 ${h.level === 3 ? 'pl-4 border-l border-slate-700' : ''}`}
                  >
                    <a 
                      href={`#${h.id}`} 
                      className={`block text-sm leading-snug hover:text-brand-400 transition-colors ${activeHeading === h.id ? 'text-brand-400 font-bold translate-x-1' : 'text-slate-400'}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* KOLOM 2: ISI ARTIKEL UTAMA (TENGAH) */}
        <main className="flex-grow max-w-3xl w-full">
          
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
               <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                 {article.category}
               </span>
               <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold px-3 py-1 rounded-full">#kurikulummerdeka</span>
               <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold px-3 py-1 rounded-full">#rpp</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {article.title}
            </h1>
            
            {/* Meta Data Penulis */}
            <div className="flex items-center justify-between border-y border-surface_border py-4 mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white shadow-inner">
                   MH
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-200">Tim ModulGuruHebat</p>
                   <p className="text-xs text-slate-500">Diperbarui {new Date(article.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                 </div>
               </div>
               <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                 <span className="bg-slate-800 px-3 py-1.5 rounded-md"><i className="fa-solid fa-pen-nib mr-1.5"></i> {wordCount} kata</span>
                 <span className="bg-slate-800 px-3 py-1.5 rounded-md"><i className="fa-regular fa-clock mr-1.5"></i> {readTime} mnt baca</span>
               </div>
            </div>
          </div>

          <img 
            src={article.image_url} 
            alt={article.title} 
            className="w-full h-64 sm:h-80 md:h-[400px] object-cover rounded-3xl mb-12 border border-slate-700 shadow-xl"
          />

          {/* KONTEN ARTIKEL */}
          <article 
             id="article-content"
             className="prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-white prose-headings:font-bold prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2 prose-a:text-brand-400 hover:prose-a:text-brand-300 prose-img:rounded-xl"
             dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* BAGIAN BAWAH ARTIKEL (MOBILE SHARE) */}
          <div className="mt-16 pt-8 border-t border-surface_border lg:hidden">
             <h4 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider text-center">Bagikan Artikel Ini</h4>
             <div className="flex flex-col gap-3">
                <button onClick={handleShareWA} className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <i className="fa-brands fa-whatsapp text-lg"></i> Bagikan ke WhatsApp
                </button>
                <button onClick={handleCopyLink} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <i className="fa-solid fa-link"></i> Salin Tautan
                </button>
             </div>
          </div>
        </main>

        {/* KOLOM 3: WIDGET CTA & SHARE (KANAN) */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-28 mb-12 lg:mb-0">
          
          {/* Kotak Iklan CTA Utama */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-600 rounded-3xl p-6 shadow-[0_10px_30px_rgba(4,120,87,0.3)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"></div>
            
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2 block">PLATFORM GURU #1</span>
            <h3 className="text-xl font-extrabold text-white mb-4 leading-snug">Generate modul ajar, soal HOTS & LKPD otomatis dengan AI</h3>
            
            <div className="space-y-3 mb-6">
               <div className="flex items-start text-sm text-emerald-100">
                 <i className="fa-solid fa-check-circle text-emerald-400 mt-0.5 mr-2"></i> RPP sesuai CP Kemendikbud
               </div>
               <div className="flex items-start text-sm text-emerald-100">
                 <i className="fa-solid fa-check-circle text-emerald-400 mt-0.5 mr-2"></i> Parameter Taksonomi Bloom
               </div>
               <div className="flex items-start text-sm text-emerald-100">
                 <i className="fa-solid fa-check-circle text-emerald-400 mt-0.5 mr-2"></i> Hasil bisa diedit & diunduh
               </div>
            </div>

            <Link href="/login" className="block w-full text-center bg-white text-emerald-900 hover:bg-emerald-50 font-bold py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-1 mb-3">
               Coba Gratis Sekarang <i className="fa-solid fa-arrow-right ml-1"></i>
            </Link>
            <p className="text-center text-xs text-emerald-300 font-medium">✨ Langsung dapat 10 kuota gratis</p>
          </div>

          {/* Kotak Share Sosial Media (Sembunyi di HP, Tampil di PC) */}
          <div className="hidden lg:block bg-surface border border-surface_border rounded-3xl p-6 shadow-xl">
             <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4">Bagikan Artikel</h4>
             <div className="flex flex-col gap-3">
                <button onClick={handleShareWA} className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-start px-4 gap-3 text-sm">
                  <i className="fa-brands fa-whatsapp text-lg"></i> WhatsApp
                </button>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-start px-4 gap-3 text-sm">
                  <i className="fa-brands fa-facebook text-lg text-blue-500"></i> Facebook
                </button>
                <button onClick={handleCopyLink} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-start px-4 gap-3 text-sm">
                  <i className="fa-solid fa-link text-lg"></i> Salin Tautan
                </button>
             </div>
          </div>

        </aside>

      </div>
    </div>
  );
}