import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json(); 
    
    if (!userId) {
      return NextResponse.json({ error: 'Gagal memverifikasi akun. Silakan login kembali.' }, { status: 401 });
    }

    // Cek sisa kuota berdasarkan email (dengan fallback aman jika database belum siap)
    let currentQuota = 10;
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('quota')
        .eq('email', userId)
        .single();

      if (userData && typeof userData.quota === 'number') {
        currentQuota = userData.quota;
      }
    } catch (dbErr) {
      console.warn('Pengecekan kuota database dilewati (mode fallback):', dbErr);
    }

    if (currentQuota <= 0) {
      return NextResponse.json({ error: 'Kuota habis. Silakan hubungi admin untuk isi ulang.' }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key Gemini belum disetting di server .env.local' }, { status: 500 });
    }

    // Model Google Gemini aktif dan teruji (fallback berurutan)
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite'
    ];

    let lastError = 'Gagal memproses AI';
    let data = null;

    for (const model of candidateModels) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
          })
        });

        if (response.ok) {
          data = await response.json();
          break; // Berhasil, keluar dari loop
        } else {
          const errorData = await response.json();
          lastError = errorData.error?.message || `Error status ${response.status} pada model ${model}`;
          console.warn(`[Gemini API - ${model}] Status ${response.status}: ${lastError}`);
        }
      } catch (err: any) {
        lastError = err.message || `Gagal fetch model ${model}`;
        console.warn(`[Gemini API - ${model}] Exception:`, lastError);
      }
    }

    if (!data) {
      return NextResponse.json({ error: `Gagal dari Gemini AI: ${lastError}` }, { status: 500 });
    }
    
    // Potong kuota di backend secara aman
    try {
      await supabase.from('users').update({ quota: Math.max(0, currentQuota - 1) }).eq('email', userId);
    } catch (e) {
      console.warn('Gagal memotong kuota di database (dilewati):', e);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
