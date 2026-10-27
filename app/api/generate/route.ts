import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // 1. Tangkap prompt dan userId (email) dari frontend
    const { prompt, userId } = await req.json(); 
    
    if (!userId) {
      return NextResponse.json({ error: 'Gagal memverifikasi akun. Silakan login kembali.' }, { status: 401 });
    }

    // 2. Cek sisa kuota (pastikan kolom di database bernama 'quota')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('quota')
      .eq('email', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'Data akun tidak ditemukan.' }, { status: 404 });
    }

    if (userData.quota <= 0) {
      return NextResponse.json({ error: 'Kuota habis. Silakan berlangganan.' }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key Gemini belum disetting di server.' }, { status: 500 });
    }

    // 3. Panggil Gemini dan kirimkan prompt asli dari frontend
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }], // <-- Langsung pakai variabel prompt!
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || 'Gagal terhubung ke AI' }, { status: response.status });
    }

    const data = await response.json();
    
    // 4. Potong kuota (-1) di backend agar aman dari hacker
    await supabase.from('users').update({ quota: userData.quota - 1 }).eq('email', userId);

    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}