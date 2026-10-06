"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

// Import koneksi Supabase yang baru saja kita buat
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      // 1. Panggil pop-up Google Auth dari Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 2. Cek apakah user ini sudah ada di database Supabase kita
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', user.uid)
        .single();

      let finalQuota = 3; // Default kuota untuk pengguna baru

      // 3. Jika user belum ada di Supabase, masukkan data barunya
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              firebase_uid: user.uid,
              name: user.displayName,
              email: user.email,
              quota: 10
              
            }
          ]);
          
        if (insertError) {
          console.error("Gagal menyimpan ke Supabase:", insertError);
        }
      } else {
        // Jika user sudah ada, ambil sisa kuota dia dari database
        finalQuota = existingUser.quota;
      }
      
      // 4. Simpan sesi ke memori browser agar navbar langsung update
      localStorage.setItem('modulgen_dummy_user', JSON.stringify({
        uid: user.uid, // Simpan UID agar bisa dipakai untuk generate nanti
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        quota: finalQuota // Kuota sekarang mengambil data valid dari Supabase!
      }));
      
      // 5. Tendang ke Beranda
      router.push('/');
      
    } catch (error: any) {
      console.error("Gagal Login:", error.message);
      alert("Gagal memanggil Google Auth. Pastikan koneksi internet stabil.");
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans">
      
      {/* SISI KIRI - VISUAL & MOCKUP */}
      <div className="hidden lg:flex w-1/2 bg-emerald-700 text-white p-12 flex-col justify-between overflow-hidden relative">
        <div className="relative z-10">
          <Link href="/" className="font-bold text-xl mb-10 flex items-center gap-2 hover:text-emerald-200 transition-colors w-fit">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg> ModulGen AI
          </Link>
          
          <span className="bg-white/20 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">3 KREDIT GRATIS</span>
          <h1 className="text-4xl font-extrabold mt-6 leading-tight max-w-md">Modul ajar dan Soal HOTS lengkap dalam 1 menit</h1>
          
          {/* Gambar Mockup Aplikasi Melayang */}
          <div className="mt-12 bg-white rounded-t-xl p-6 shadow-2xl transform rotate-2 w-11/12 border border-slate-200 text-slate-800">
             <div className="flex gap-1.5 mb-6 border-b border-slate-100 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <h4 className="font-bold mb-4">Modul Ajar — Informatika Kelas 8</h4>
             <div className="flex gap-2 mb-6">
               <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">Bernalar Kritis</span>
               <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">Mandiri</span>
             </div>
             <div className="space-y-3">
               <div className="flex items-center gap-3"><span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded">Pendahuluan</span> <div className="h-2 bg-slate-100 rounded w-1/2"></div></div>
               <div className="flex items-center gap-3"><span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-1 rounded">Kegiatan Inti</span> <div className="h-2 bg-slate-100 rounded w-2/3"></div></div>
             </div>
          </div>
        </div>
        
        {/* Statistik Sosial */}
        <div className="flex gap-8 relative z-10">
          <div><h3 className="text-2xl font-bold">1.204</h3><p className="text-xs text-emerald-200">Guru Terdaftar</p></div>
          <div><h3 className="text-2xl font-bold">5.340</h3><p className="text-xs text-emerald-200">Dokumen Dibuat</p></div>
        </div>
      </div>

      {/* SISI KANAN - FORM PENDAFTARAN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 relative">
        <Link href="/" className="lg:hidden absolute top-6 left-6 text-slate-500 flex items-center gap-1 font-semibold text-sm">
           &larr; Kembali
        </Link>

        <div className="w-full max-w-md mt-10 lg:mt-0">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
            <button className="flex-1 py-2 text-sm font-semibold text-slate-500 rounded-md">Masuk</button>
            <button className="flex-1 py-2 text-sm font-semibold bg-white text-slate-800 shadow rounded-md">Daftar</button>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-2">Buat akun gratis</h2>
          <p className="text-slate-500 text-sm mb-6">Isi kolom di bawah, kredit 3x generate otomatis aktif.</p>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold p-4 rounded-lg flex gap-3 mb-6">
            <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            3 kredit gratis — cukup untuk 1 Modul Ajar, 1 LKPD, dan 1 Ujian.
          </div>

          <button type="button" onClick={handleGoogleLogin} className="w-full border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-colors mb-6">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Lanjutkan dengan Google
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Atau Pakai Email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form className="space-y-4" onSubmit={handleGoogleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" placeholder="nama@email.com" className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input type="password" placeholder="Minimal 6 karakter" className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800" />
            </div>
            <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors mt-4">
              Daftar & dapat 3 kredit
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}