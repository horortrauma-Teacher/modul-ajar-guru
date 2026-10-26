import { NextResponse } from 'next/server';
// TODO: Lo harus import konfigurasi Supabase Client untuk server di sini

export async function POST(req: Request) {
  try {
    // 1. TERIMA DATA DARI FRONTEND (Jangan terima full prompt, terima variabelnya saja)
    const { mataPelajaran, kelas, materi, userId } = await req.json();

    // 2. VALIDASI OTENTIKASI & KUOTA DI DATABASE SUPABASE
    // (Cek apakah userId ini beneran login dan tokennya valid)
    // const { data: userData } = await supabase.from('users').select('kuota').eq('id', userId).single();
    
    // if (userData.kuota <= 0) {
    //   return NextResponse.json({ error: 'Kuota habis, silakan berlangganan.' }, { status: 403 });
    // }

    // 3. RAKIT PROMPT DI SERVER (Hacker tidak bisa mengubah instruksi sistem ini)
    const securePrompt = `Bertindaklah sebagai Guru Ahli. Buat Modul Ajar Kurikulum Merdeka untuk mata pelajaran ${mataPelajaran} kelas ${kelas} dengan materi ${materi}.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key Gemini belum disetting di server.' }, { status: 500 });
    }

    // 4. PANGGIL GOOGLE GEMINI
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: securePrompt }] }], // Gunakan prompt yang dirakit di server
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || 'Gagal terhubung ke AI' }, { status: response.status });
    }

    const data = await response.json();
    
    // 5. POTONG KUOTA DI DATABASE (LAKUKAN DI SERVER SEBELUM MENGIRIM JAWABAN)
    // await supabase.rpc('kurangi_kuota', { user_id_param: userId });

    // 6. KEMBALIKAN HASIL KE FRONTEND
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}