"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Login Mandiri Guru (Langsung Sinkron ke Supabase Database)
  const handleTeacherLogin = async (e?: React.FormEvent, customName?: string, customEmail?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const finalEmail = (customEmail || emailInput).trim().toLowerCase();
    const finalName = (customName || nameInput || finalEmail.split('@')[0]).trim();

    if (!finalEmail) {
      setErrorMsg('Silakan masukkan alamat email guru.');
      setIsLoading(false);
      return;
    }

    try {
      let finalQuota = 10;

      // Cek apakah user sudah ada di tabel Supabase
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', finalEmail)
          .single();

        if (existingUser) {
          finalQuota = typeof existingUser.quota === 'number' ? existingUser.quota : 10;
        } else {
          // Buatkan data baru di Supabase dengan 10 kuota gratis
          await supabase.from('users').insert([
            {
              name: finalName,
              email: finalEmail,
              quota: 10
            }
          ]);
        }
      } catch (dbErr) {
        console.warn('Sinkronisasi Supabase dilewati (mode offline/fallback):', dbErr);
      }

      // Simpan sesi guru di browser
      localStorage.setItem('modulgen_dummy_user', JSON.stringify({
        name: finalName,
        email: finalEmail,
        quota: finalQuota
      }));

      // Arahkan langsung ke Beranda ModulGen
      router.push('/');
    } catch (err: any) {
      console.error('Gagal login:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Login via Google OAuth Supabase (Pintu Resmi Supabase)
  const handleGoogleOAuthSupabase = async () => {
    setIsLoading(true);
    setErrorMsg('');

    // Jika berjalan di localhost, hindari redirect ke Vercel dengan meminta email langsung
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const emailPrompt = prompt(
        'Agar tetap di localhost:3001 (tidak terlempar ke Vercel), silakan ketikkan alamat email Google Anda di sini:',
        emailInput || 'guru@gmail.com'
      );
      if (emailPrompt && emailPrompt.trim()) {
        const cleanEmail = emailPrompt.trim().toLowerCase();
        const autoName = cleanEmail.split('@')[0];
        const formattedName = autoName.charAt(0).toUpperCase() + autoName.slice(1);
        await handleTeacherLogin(undefined, formattedName, cleanEmail);
        return;
      }
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined
        }
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.warn('Supabase Google OAuth belum aktif di dashboard, gunakan login langsung guru:', err.message);
      // Fallback ramah jika Google OAuth di Supabase belum disetel client ID-nya
      handleTeacherLogin(undefined, 'Guru Pengampu CBT', 'guru.cbt@daarelqolam.sch.id');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-slate-50">
      
      {/* SISI KIRI - VISUAL & MOCKUP */}
      <div className="hidden lg:flex w-1/2 bg-emerald-700 text-white p-12 flex-col justify-between overflow-hidden relative">
        <div className="relative z-10">
          <Link href="/" className="font-bold text-xl mb-10 flex items-center gap-2 hover:text-emerald-200 transition-colors w-fit">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg> 
            <span>ModulGen AI • Kurikulum Merdeka</span>
          </Link>
          
          <span className="bg-white/20 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">10 KREDIT GENERATE GRATIS</span>
          <h1 className="text-4xl font-extrabold mt-6 leading-tight max-w-md">Modul Ajar, RPP & LKPD Lengkap Berbasis AI</h1>
          <p className="text-emerald-100 text-sm mt-3 max-w-md">Terhubung langsung dengan ekosistem Portal Ujian CBT SMPS Daar El-Qolam.</p>
          
          {/* Gambar Mockup Aplikasi */}
          <div className="mt-10 bg-white rounded-2xl p-6 shadow-2xl transform rotate-1 w-11/12 border border-slate-200 text-slate-800">
             <div className="flex gap-1.5 mb-5 border-b border-slate-100 pb-3">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
             </div>
             <h4 className="font-extrabold text-slate-900 mb-2">Modul Ajar — Informatika Fase D</h4>
             <div className="flex gap-2 mb-4">
               <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-md font-semibold">Bernalar Kritis</span>
               <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-semibold">Tersinkron CBT</span>
             </div>
             <div className="space-y-2.5 text-xs text-slate-600">
               <div className="flex items-center gap-2.5"><span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">Pendahuluan</span> <div className="h-2 bg-slate-100 rounded w-1/2"></div></div>
               <div className="flex items-center gap-2.5"><span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">Kegiatan Inti</span> <div className="h-2 bg-slate-100 rounded w-2/3"></div></div>
             </div>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="flex items-center gap-8 relative z-10 pt-6 border-t border-emerald-600/50">
          <div><h3 className="text-2xl font-bold">SMPS Daar El-Qolam</h3><p className="text-xs text-emerald-200">Terhubung ke Portal CBT</p></div>
          <div><h3 className="text-2xl font-bold">100% Supabase</h3><p className="text-xs text-emerald-200">Bebas Hambatan Firebase</p></div>
        </div>
      </div>

      {/* SISI KANAN - FORM LOGIN / MASUK GURU */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link href="/" className="lg:hidden absolute top-6 left-6 text-slate-500 flex items-center gap-1 font-semibold text-sm">
           &larr; Kembali
        </Link>

        <div className="w-full max-w-md mt-6 lg:mt-0 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Sesi Guru Pengampu
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">Masuk ke ModulGen AI</h2>
            <p className="text-slate-500 text-sm mt-1">Gunakan akun guru Anda untuk mulai menyusun modul ajar dan LKPD otomatis.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* OPSI 1: TOMBOL CEPAT LOGIN GURU SMPS DAAR EL-QOLAM / CBT */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">
                ⚡ Rekomendasi Praktis di Localhost:
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                1-Klik Masuk
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Langsung masuk menggunakan identitas guru terpadu tanpa hambatan popup Google Auth.
            </p>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleTeacherLogin(undefined, 'Guru Pengampu CBT', 'guru@daarelqolam.sch.id')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>🚀 Masuk sebagai Guru SMPS Daar El-Qolam</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-3 text-slate-400 text-xs font-bold uppercase tracking-wider">Atau Masuk dengan Akun Pribadi</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* OPSI 2: GOOGLE LOGIN VIA SUPABASE OAUTH */}
          <button 
            type="button" 
            disabled={isLoading}
            onClick={handleGoogleOAuthSupabase} 
            className="w-full border-2 border-slate-200 hover:bg-white bg-white text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>Lanjutkan dengan Akun Google (Supabase)</span>
          </button>

          {/* OPSI 3: FORM EMAIL MANUAL */}
          <form className="space-y-3.5 pt-2" onSubmit={handleTeacherLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Guru</label>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Contoh: Pak Heru / Ibu Guru" 
                className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 bg-white" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Guru</label>
              <input 
                type="email" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="nama.guru@sekolah.sch.id" 
                className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 bg-white" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors mt-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Memproses...' : 'Masuk & Dapatkan 10 Kredit Gratis'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-emerald-700 font-medium">
              Lewati login dan buka Beranda sebagai Tamu &rarr;
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}
