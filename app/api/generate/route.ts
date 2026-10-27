import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client untuk akses backend
// Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah ada di .env.local lo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // Menangkap data yang dikirim dari halaman depan
    const { prompt, userId } = await req.json(); 
    
    // Pastikan user sedang login
    if (!userId) {
      return NextResponse.json({ error: 'Gagal memverifikasi akun. Silakan masuk (login) terlebih dahulu.' }, { status: 401 });
    }

    // 1. CEK SISA KUOTA USER DI DATABASE SUPABASE
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('kuota')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'Data akun tidak ditemukan di database.' }, { status: 404 });
    }

    if (userData.kuota <= 0) {
      return NextResponse.json({ error: 'Kuota habis. Silakan berlangganan paket Guru Pro untuk melanjutkan.' }, { status: 403 });
    }

    // 2. PERSIAPKAN API KEY GEMINI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key Gemini belum disetting di server.' }, { status: 500 });
    }

    // 3. PANGGIL GOOGLE GEMINI DARI DALAM SERVER
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }], // Idealnya ke depan prompt dirakit di sini agar anti-hijack
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || 'Gagal terhubung ke AI' }, { status: response.status });
    }

    const data = await response.json();
    
    // 4. POTONG KUOTA USER (-1) SETELAH AI BERHASIL MENJAWAB
    const { error: updateError } = await supabase
      .from('users')
      .update({ kuota: userData.kuota - 1 })
     .eq('email', userId)
      
    if (updateError) {
      console.error("Peringatan: Gagal memotong kuota user di database:", updateError);
    }

    // 5. KIRIM HASIL KE HALAMAN DEPAN
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}