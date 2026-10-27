import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client untuk akses backend
// Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah ada di .env.local lo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // 1. Tangkap data dari frontend
    const { prompt, userId } = await req.json(); 
    
    // ... (kode cek kuota Supabase pakai .eq('email', userId) tetap di sini) ...

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Langsung lempar variabel 'prompt' ke Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }], // <-- PERHATIKAN BAGIAN INI
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      })
    });
// ...

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