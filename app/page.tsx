"use client";
import { useState, useEffect, useRef } from "react";
import cpDatabase from './Data/capaian_pembelajaran.json';
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function ModulGenApp() {

  // --- DATA REFERENSI ---
  const kelasByJenjang: any = {
    'PAUD': ['TK A', 'TK B'], 'SD/MI': ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
    'SMP/MTs': ['Kelas 7', 'Kelas 8', 'Kelas 9'], 'SMA/MA': ['Kelas 10', 'Kelas 11', 'Kelas 12'],
    'SMK/MAK': ['Kelas 10', 'Kelas 11', 'Kelas 12']
  };
  const faseByKelas: any = {
    'TK A': 'Fase Fondasi', 'TK B': 'Fase Fondasi', 'Kelas 1': 'Fase A', 'Kelas 2': 'Fase A',
    'Kelas 3': 'Fase B', 'Kelas 4': 'Fase B', 'Kelas 5': 'Fase C', 'Kelas 6': 'Fase C',
    'Kelas 7': 'Fase D', 'Kelas 8': 'Fase D', 'Kelas 9': 'Fase D', 'Kelas 10': 'Fase E',
    'Kelas 11': 'Fase F', 'Kelas 12': 'Fase F'
  };
  
  const dplOptions = [
    "Keimanan dan Ketakwaan terhadap Tuhan YME", "Kewargaan", "Penalaran Kritis", "Kreativitas", 
    "Kolaborasi", "Kemandirian", "Kesehatan", "Komunikasi"
  ];
  
  const metodePembelajaranOptions = [
    "Diskusi Kelas", "Diskusi Kelompok", "Presentasi", "Tanya Jawab", 
    "Demonstrasi", "Penugasan", "Permainan", "Role Playing", 
    "Mind Mapping", "Studi Kasus", "Window Shopping"
  ];

  const mataPelajaranOptions = [
    "PAUD (Tematik/Umum)",
    "Pendidikan Agama Islam dan Budi Pekerti",
    "Pendidikan Agama Kristen dan Budi Pekerti",
    "Pendidikan Agama Katolik dan Budi Pekerti",
    "Pendidikan Agama Hindu dan Budi Pekerti",
    "Pendidikan Agama Buddha dan Budi Pekerti",
    "Pendidikan Agama Khonghucu dan Budi Pekerti",
    "Pendidikan Pancasila",
    "Bahasa Indonesia",
    "Bahasa Indonesia Tingkat Lanjut",
    "Matematika",
    "Matematika Tingkat Lanjut",
    "Bahasa Inggris",
    "Bahasa Inggris Tingkat Lanjut",
    "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
    "Ilmu Pengetahuan Alam (IPA)",
    "Fisika",
    "Kimia",
    "Biologi",
    "Ilmu Pengetahuan Sosial (IPS)",
    "Geografi",
    "Ekonomi",
    "Sosiologi",
    "Antropologi",
    "Sejarah",
    "Sejarah Tingkat Lanjut",
    "Informatika",
    "Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)",
    "Prakarya dan Kewirausahaan",
    "Seni Rupa",
    "Seni Musik",
    "Seni Tari",
    "Seni Teater",
    "Pendidikan Khusus",
    "Muatan Lokal",
    "Bahasa Daerah"
  ];

  const [activeTab, setActiveTab] = useState("beranda");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userQuota, setUserQuota] = useState(0);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [daftarDokumen, setDaftarDokumen] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    guru: '', sekolah: '', kepsek: '',
    jenjang: '', kelas: '', fase: '', semester: '',
    mapel: '', cp: '', tp: '', 
    topik: '', karakteristik: '',
    pertemuan: '', jp: '', model: ''
  });

  const getWaktu = () => {
    const jam = new Date().getHours();
    if (jam < 11) return 'pagi';
    if (jam < 15) return 'siang';
    if (jam < 18) return 'sore';
    return 'malam';
  };

  const [genState, setGenState] = useState<'A' | 'B' | 'C'>('A');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultHtml, setResultHtml] = useState("");
  const [activeDocType, setActiveDocType] = useState("Modul");

  const [selectedDPL, setSelectedDPL] = useState<string[]>([]);
  const [selectedMetode, setSelectedMetode] = useState<string[]>([]); 
  
  const [lkpdData, setLkpdData] = useState({ jenjang: '', kelas: '', fase: '', mapel: '', topik: '', cp: '' });
  
  const [ujianData, setUjianData] = useState({
    jenjang: '', kelas: '', fase: '', semester: 'Semester 1',
    mapel: '', indikator: '', topik: '',
    tipeSoal: 'Soal Umum', jenisAsesmen: 'Pilihan Ganda',
    jumlahOpsi: '5 Opsi (A, B, C, D, E)', tipePG: 'PG Tunggal (1 Benar)',
    taksonomi: 'Taksonomi Bloom', kesulitan: 'Kombinasi (LOTS + MOTS + HOTS)',
    jumlahSoal: 5
  });

  const [showCpModal, setShowCpModal] = useState(false);
  const [activeCpTarget, setActiveCpTarget] = useState<'modul' | 'ujian'>('modul');
  const [tempSelectedCp, setTempSelectedCp] = useState<string[]>([]);
  const [availableCps, setAvailableCps] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const loadingMessages = [
    "Membedah Capaian Pembelajaran...",
    "Menganalisis Target Karakteristik Siswa...",
    "Merancang Kegiatan Pembelajaran...",
    "Menyusun Rubrik Penilaian...",
    "Menyiapkan Lampiran Materi...",
    "Sedikit lagi selesai, mohon tunggu sebentar..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 4500);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, loadingMessages.length]);

  const filteredDokumen = daftarDokumen.filter(dok =>
    dok.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dok.doc_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ========================================================
  // LOGIKA AUTO-FILL CP CERDAS (DARI JSON VERSI TERBARU)
  // ========================================================
  const dbAsAny = cpDatabase as any;
  
  const handleMapelChange = (e: any, target: 'modul' | 'lkpd' | 'ujian') => {
    const selectedMapel = e.target.value;
    const tujuanObj = dbAsAny.Tujuan?.[selectedMapel] || '';
    
    if (target === 'modul') {
      setFormData(prev => ({ ...prev, mapel: selectedMapel, tp: tujuanObj, topik: '', cp: '' }));
    } else if (target === 'lkpd') {
      setLkpdData(prev => ({ ...prev, mapel: selectedMapel, topik: '', cp: '' }));
    } else {
      setUjianData(prev => ({ ...prev, mapel: selectedMapel, topik: '', indikator: '' }));
    }
  };

  const getTopikByFaseAndMapel = (fase: string, mapel: string) => {
    if (!fase || !mapel || !dbAsAny.Fase) return [];
    const namaFase = fase.includes('Fase') ? fase : `Fase ${fase}`;
    const faseData = dbAsAny.Fase[namaFase];
    if (!faseData) return [];

    if (mapel.includes("PAUD") && faseData["PAUD (Tematik/Umum)"]) return faseData["PAUD (Tematik/Umum)"];

    const dbSubjectKey = Object.keys(faseData).find(key =>
      mapel.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(mapel.toLowerCase())
    );
    return dbSubjectKey ? faseData[dbSubjectKey] : [];
  };

  const daftarTopikTersedia = getTopikByFaseAndMapel(formData.fase, formData.mapel);
  const handleTopikChange = (e: any) => {
    const selectedElemen = e.target.value;
    const dataCpDitemukan = daftarTopikTersedia.find((item: any) => item.elemen === selectedElemen);
    setFormData((prev: any) => ({ ...prev, topik: selectedElemen, cp: dataCpDitemukan ? dataCpDitemukan.deskripsi : '' }));
  };

  const daftarTopikLkpd = getTopikByFaseAndMapel(lkpdData.fase, lkpdData.mapel);
  const handleTopikLkpdChange = (e: any) => {
    const selectedElemen = e.target.value;
    const dataCpDitemukan = daftarTopikLkpd.find((item: any) => item.elemen === selectedElemen);
    setLkpdData((prev: any) => ({ ...prev, topik: selectedElemen, cp: dataCpDitemukan ? dataCpDitemukan.deskripsi : '' }));
  };

  const daftarTopikUjian = getTopikByFaseAndMapel(ujianData.fase, ujianData.mapel);
  const handleTopikUjianChange = (e: any) => {
    const selectedElemen = e.target.value;
    const dataCpDitemukan = daftarTopikUjian.find((item: any) => item.elemen === selectedElemen);
    setUjianData((prev: any) => ({ ...prev, topik: selectedElemen, indikator: dataCpDitemukan ? dataCpDitemukan.deskripsi : '' }));
  };

  const openCpModal = (target: 'modul' | 'ujian') => {
    setActiveCpTarget(target);
    setTempSelectedCp([]);
    const currentMapel = target === 'modul' ? formData.mapel : ujianData.mapel;
    const currentFase = target === 'modul' ? formData.fase : ujianData.fase;

    if (!currentMapel || !currentFase) {
      return showSystemModal("Validasi Gagal", "Silakan pilih Fase/Kelas dan Mata Pelajaran terlebih dahulu sebelum mencari CP.");
    }

    const namaFase = currentFase.includes('Fase') ? currentFase : `Fase ${currentFase}`;
    const faseData = dbAsAny.Fase?.[namaFase];

    if (faseData) {
      let dbSubjectKey = Object.keys(faseData).find(key =>
        currentMapel.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(currentMapel.toLowerCase())
      );
      
      if (currentMapel.includes("PAUD") && faseData["PAUD (Tematik/Umum)"]) dbSubjectKey = "PAUD (Tematik/Umum)";

      if (dbSubjectKey) {
        setAvailableCps(faseData[dbSubjectKey]);
        setShowCpModal(true);
        return;
      }
    }

    setAvailableCps([
      { elemen: 'Pemahaman Konsep Inti', deskripsi: `Pada akhir ${currentFase}, peserta didik mampu memahami konsep dasar, prinsip, dan teori terkait materi ${currentMapel} secara komprehensif.` },
      { elemen: 'Keterampilan Proses & Aplikasi', deskripsi: `Pada akhir ${currentFase}, peserta didik mampu menerapkan prinsip-prinsip ${currentMapel} untuk menganalisis dan memecahkan masalah kontekstual dalam kehidupan sehari-hari.` }
    ]);
    setShowCpModal(true);
  };

  const handleToggleCp = (descText: string) => {
    if (tempSelectedCp.includes(descText)) {
      setTempSelectedCp(tempSelectedCp.filter(item => item !== descText));
    } else {
      setTempSelectedCp([...tempSelectedCp, descText]);
    }
  };

  const applyCpSelection = () => {
    const joinedCp = tempSelectedCp.join('\n\n');
    if (activeCpTarget === 'modul') {
      setFormData({ ...formData, cp: joinedCp });
    } else {
      setUjianData({ ...ujianData, indikator: joinedCp });
    }
    setShowCpModal(false);
  };

  // 1. Fungsi penarik kuota dari Database Supabase
  const fetchUserQuota = async (email: string) => {
    const { data, error } = await supabase.from('users').select('quota').eq('email', email).single();
    if (data) {
      setUserQuota(data.quota);
    } else {
      // Jika user baru pertama kali login, buatkan data di tabel dan beri 10 kuota gratis
      const { error: insertError } = await supabase.from('users').insert([{ email: email, quota: 10 }]);
      if (!insertError) setUserQuota(10);
    }
  };

  // 2. Pendeteksi status Login Google (Otomatis jalan saat web dibuka)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setCurrentUser({ 
          name: session.user.user_metadata.full_name || session.user.email.split('@')[0], 
          email: session.user.email 
        });
        fetchUserQuota(session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setCurrentUser({ name: session.user.user_metadata.full_name || session.user.email.split('@')[0], email: session.user.email });
        fetchUserQuota(session.user.email);
      } else {
        setCurrentUser(null);
        setUserQuota(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Tombol Eksekutor Google Login & Logout
  const handleLoginGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) showSystemModal("Gagal Login", error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    switchTab('beranda');
  };

  const showSystemModal = (title: string, message: string) => setModal({ isOpen: true, title, message });
  const switchTab = (tab: string) => { setActiveTab(tab); setGenState('A'); window.scrollTo({ top: 0, behavior: 'smooth' }); if (tab === 'brankas') ambilDataBrankas(); };

  const ambilDataBrankas = async () => {
    if (!currentUser || !currentUser.email) return;
    const { data, error } = await supabase.from('documents').select('*').eq('user_email', currentUser.email).order('created_at', { ascending: false });
    if (error) console.error("Gagal mengambil brankas:", error);
    else if (data) setDaftarDokumen(data);
  };

  const handleDeleteDokumen = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini? Dokumen yang dihapus tidak dapat dikembalikan.")) return;
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) {
      console.error("Gagal menghapus", error);
      showSystemModal("Error", "Gagal menghapus dokumen dari server.");
    } else {
      setDaftarDokumen(daftarDokumen.filter(dok => dok.id !== id));
    }
  };

  const fetchAI = async (prompt: string, docType: string) => {
    if (!currentUser || !currentUser.email) return showSystemModal("Validasi Gagal", "Silakan login terlebih dahulu!");
    if (userQuota <= 0) return showSystemModal("Kuota Habis", "Kuota uji coba Anda telah habis. Silakan periksa paket langganan.");
    
    setGenState('C'); setIsGenerating(true); setActiveDocType(docType);

    try {
      // 1. Kurangi kuota user dulu di Supabase
      const sisaKuotaBaru = userQuota - 1;
      const { error: updateError } = await supabase.from('users').update({ quota: sisaKuotaBaru }).eq('email', currentUser.email);
      if (updateError) throw new Error("Gagal menghubungi database untuk sinkronisasi kuota.");

      setUserQuota(sisaKuotaBaru);
      localStorage.setItem('modulgen_dummy_user', JSON.stringify({ ...currentUser, quota: sisaKuotaBaru }));

      // 2. Tembak ke API Route Backend kita yang aman
      const response = await fetch('/api/generate', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Gagal API: ${response.status}`);
      }

      const data = await response.json();
      const outputText = data.candidates[0].content.parts[0].text;
      const cleanContent = outputText.replace(/```html/gi, '').replace(/```/gi, '');

      setResultHtml(cleanContent);

      // 3. Simpan hasil ke brankas Supabase
      const { error: insertError } = await supabase.from('documents').insert([
          { user_email: currentUser.email, title: docType + " - " + new Date().toLocaleDateString('id-ID'), doc_type: docType, content: cleanContent }
        ]);

      if (insertError) console.error("Gagal menyimpan dokumen ke brankas:", insertError);

    } catch (err: any) {
      showSystemModal("Peringatan Sistem", `Keterangan: ${err.message}`);
      setGenState('B');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateModul = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDPL.length === 0) return showSystemModal("Validasi Gagal", "Pilih minimal 1 Dimensi Profil Lulusan (DPL)!");
    if (!formData.cp) return showSystemModal("Validasi Gagal", "Capaian Pembelajaran tidak boleh kosong!");
    if (!formData.tp) return showSystemModal("Validasi Gagal", "Tujuan Pembelajaran tidak boleh kosong!");
    if (selectedMetode.length === 0) return showSystemModal("Validasi Gagal", "Pilih minimal 1 Metode Pembelajaran!");
    
    const currentYear = new Date().getFullYear();
    const dateString = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `Anda adalah ahli kurikulum pendidikan Indonesia. Buatkan Modul Ajar (RPP) yang SANGAT DETAIL berformat HTML murni.
Data: Guru: ${formData.guru} | Sekolah: ${formData.sekolah} | Kelas/Fase: ${formData.kelas}/${formData.fase} | Mapel: ${formData.mapel} | Topik: ${formData.topik} | CP: ${formData.cp} | Tujuan Pembelajaran: ${formData.tp} | Dimensi Profil Lulusan: ${selectedDPL.join(', ')} | Waktu: ${formData.pertemuan} Pertemuan (${formData.jp}) | Model: ${formData.model} | Metode: ${selectedMetode.join(', ')} | Karakteristik: ${formData.karakteristik}.

ATURAN MUTLAK:
1. Kembalikan HANYA tag HTML murni (tanpa \`\`\`html).
2. IKUTI CETAKAN TEMPLATE HTML INI 100%. Jangan merusak inline CSS. Ganti [KURUNG SIKU] dengan penjelasan materi yang panjang, padat, dan akademis!
3. PENTING: Untuk durasi waktu di tabel Kegiatan Pembelajaran, asumsikan 1 JP = 40 menit. Hitung total menit per pertemuan (misal 2 JP = 80 menit). Alokasikan 15 menit untuk Pendahuluan, 15 menit untuk Penutup, dan SISANYA untuk Kegiatan Inti. Jangan tulis "[..] Mnt", tuliskan angka pastinya!
4. Di bagian akhir, setelah tabel Refleksi, buatkan Bab "I. LAMPIRAN: BAHAN BACAAN / RINGKASAN MATERI". Tulis ringkasan materi secara komprehensif 3-4 paragraf yang sesuai dengan Topik Pembelajaran tersebut.

<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: black; max-width: 900px; margin: auto;">
    <h2 style="color: #16a34a; font-weight: bold; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">I. INFORMASI UMUM</h2>
    <h3 style="text-align: center; font-weight: bold; margin-bottom: 20px;">MODUL AJAR</h3>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: none;">
        <tr><td style="width: 30%; padding: 4px; border: none; vertical-align: top;">Nama Penyusun</td><td style="width: 70%; padding: 4px; border: none;">: ${formData.guru}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Institusi</td><td style="padding: 4px; border: none;">: ${formData.sekolah}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Tahun Pembuatan</td><td style="padding: 4px; border: none;">: ${currentYear}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Mata Pelajaran</td><td style="padding: 4px; border: none;">: ${formData.mapel}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Jenjang / Kelas</td><td style="padding: 4px; border: none;">: ${formData.jenjang} / ${formData.kelas}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Alokasi Waktu</td><td style="padding: 4px; border: none;">: ${formData.pertemuan} Pertemuan (${formData.jp})</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Fase</td><td style="padding: 4px; border: none;">: ${formData.fase}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Capaian Pembelajaran</td><td style="padding: 4px; border: none; text-align: justify;">: ${formData.cp}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Materi Pokok</td><td style="padding: 4px; border: none;">: ${formData.topik}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Dimensi Profil Lulusan</td><td style="padding: 4px; border: none;">: ${selectedDPL.join(', ')}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Kompetensi Awal</td><td style="padding: 4px; border: none; text-align: justify;">: [Sebutkan 2 kemampuan dasar yang harus dimiliki siswa sebelum materi ini]</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Target Peserta Didik</td><td style="padding: 4px; border: none;">: ${formData.karakteristik || '[Karakteristik peserta didik]'}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Model Pembelajaran</td><td style="padding: 4px; border: none;">: ${formData.model}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Metode Pembelajaran</td><td style="padding: 4px; border: none;">: ${selectedMetode.join(', ')}</td></tr>
    </table>

    <h4 style="color: #16a34a; margin-top: 15px;">Sarana dan Prasarana</h4>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid black; text-align: left;">
        <tr><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Materi</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Media</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Sumber</th></tr>
        <tr><td style="padding: 8px; border: 1px solid black; vertical-align: top;">[Sebutkan sub-materi]</td><td style="padding: 8px; border: 1px solid black; vertical-align: top;">Laptop, Proyektor, LKPD, Spidol</td><td style="padding: 8px; border: 1px solid black; vertical-align: top;">Buku Panduan, Internet</td></tr>
    </table>

    <h2 style="color: #16a34a; font-weight: bold; border-bottom: 2px solid #16a34a; padding-bottom: 5px; margin-top: 30px;">II. KOMPONEN INTI</h2>
    <p><strong>A. Tujuan Pembelajaran</strong><br>${formData.tp.replace(/\n/g, '<br>')}</p>
    <p><strong>B. Pemahaman Bermakna</strong><br>[Jelaskan esensi dan manfaat materi dalam kehidupan sehari-hari]</p>
    <p><strong>C. Pertanyaan Pemantik</strong><br>[Berikan 3 pertanyaan yang menggugah nalar siswa]</p>
    <p><strong>D. Persiapan Pembelajaran</strong><br>[Sebutkan 3 langkah persiapan guru]</p>
    <p><strong>E. Kegiatan Pembelajaran</strong></p>

    [BUAT TABEL KEGIATAN DI BAWAH INI SEBANYAK ${formData.pertemuan} KALI (Pertemuan 1, Pertemuan 2, dst)]
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
        <tr><th colspan="2" style="padding: 8px; background-color: #16a34a; color: white; text-align: left; border: 1px solid black;">PERTEMUAN [X]: [Judul Sub Topik]</th><th style="padding: 8px; background-color: #16a34a; color: white; text-align: center; border: 1px solid black; width: 15%;">Waktu</th></tr>
        <tr><td style="padding: 8px; border: 1px solid black; font-weight: bold; width: 20%;">Pendahuluan</td><td style="padding: 8px; border: 1px solid black; text-align: justify;">[Sebutkan 4 langkah: salam, doa, apersepsi, penyampaian tujuan]</td><td style="padding: 8px; border: 1px solid black; text-align: center;">15 Mnt</td></tr>
        <tr><td style="padding: 8px; border: 1px solid black; font-weight: bold;">Kegiatan Inti<br>(${formData.model})<br>Metode: ${selectedMetode.join(', ')}</td><td style="padding: 8px; border: 1px solid black; text-align: justify;">[Sebutkan sintaks model pembelajaran secara terurut (Orientasi, Penyelidikan, dst) dan terapkan metode yang dipilih. Sangat detail!]</td><td style="padding: 8px; border: 1px solid black; text-align: center;">[..] Mnt</td></tr>
        <tr><td style="padding: 8px; border: 1px solid black; font-weight: bold;">Penutup</td><td style="padding: 8px; border: 1px solid black; text-align: justify;">[Sebutkan refleksi, kesimpulan, dan arahan tugas]</td><td style="padding: 8px; border: 1px solid black; text-align: center;">15 Mnt</td></tr>
    </table>

    <h2 style="color: #16a34a; font-weight: bold; border-bottom: 2px solid #16a34a; padding-bottom: 5px; margin-top: 30px;">F. ASESMEN / PENILAIAN</h2>
    <p><strong>Lembar Observasi Kegiatan Pembelajaran</strong></p>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black; text-align: center;">
        <tr><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">No</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Aspek Yang Diamati</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Kurang (1)</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Cukup (2)</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Baik (3)</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Sangat Baik (4)</th></tr>
        <tr><td style="padding: 8px; border: 1px solid black;">1</td><td style="padding: 8px; border: 1px solid black; text-align: left;">Pendahuluan (Doa, mencermati penjelasan)</td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td></tr>
        <tr><td style="padding: 8px; border: 1px solid black;">2</td><td style="padding: 8px; border: 1px solid black; text-align: left;">Kegiatan Inti (Keaktifan, Kerjasama, Bertanya)</td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td></tr>
        <tr><td style="padding: 8px; border: 1px solid black;">3</td><td style="padding: 8px; border: 1px solid black; text-align: left;">Penutup (Refleksi, Mengerjakan Tugas)</td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td></tr>
    </table>

    <h2 style="color: #16a34a; font-weight: bold; border-bottom: 2px solid #16a34a; padding-bottom: 5px; margin-top: 30px;">G. REMEDIAL DAN PENGAYAAN</h2>
    <p><strong>Remedial:</strong> Peserta didik yang belum mencapai KKTP diberikan pembelajaran ulang atau bimbingan perorangan untuk konsep yang belum dikuasai dan diberikan kesempatan untuk mengerjakan ulang penugasan.</p>
    <p><strong>Pengayaan:</strong> Peserta didik yang telah mencapai KKTP diberikan tugas pendalaman berupa eksplorasi kasus nyata yang lebih kompleks atau menjadi tutor sebaya.</p>

    <h2 style="color: #16a34a; font-weight: bold; border-bottom: 2px solid #16a34a; padding-bottom: 5px; margin-top: 30px;">H. REFLEKSI</h2>
    <p><strong>Refleksi Siswa:</strong> [Buat 2 poin pertanyaan refleksi untuk siswa]</p>
    <p><strong>Refleksi Guru:</strong> [Buat 3 poin pertanyaan refleksi evaluasi mengajar untuk guru]</p>

    <table style="width: 100%; margin-top: 60px; border:none;">
        <tr><td style="width: 50%; border:none; text-align:center;">Mengetahui,<br>Kepala Sekolah<br><br><br><br><br><b>${formData.kepsek || '....................'}</b></td><td style="width: 50%; border:none; text-align:center;">...................., ${dateString}<br>Guru Mata Pelajaran<br><br><br><br><br><b>${formData.guru}</b></td></tr>
    </table>
    
    <h2 style="color: #16a34a; font-weight: bold; border-bottom: 2px solid #16a34a; padding-bottom: 5px; margin-top: 40px; page-break-before: always;">I. LAMPIRAN: BAHAN BACAAN / RINGKASAN MATERI</h2>
    <p>[Silakan AI isi dengan ringkasan materi secara lengkap...]</p>
    
    <hr style="margin-top: 50px; border: 0; border-top: 1px solid #ccc;" />
    <p style="font-size: 10pt; color: #666; font-style: italic; text-align: center;">*Dokumen modul hasil generate dari Modul Ajar Guru Hebat. Harap tinjau kembali kesesuaian materi.</p>
</div>`;
    fetchAI(prompt, `Modul_${formData.mapel.replace(/ /g, '_')}`);
  };

  const handleGenerateLKPD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lkpdData.cp) return showSystemModal("Validasi Gagal", "Capaian Pembelajaran/Topik tidak boleh kosong!");
    const prompt = `Anda adalah ahli pembuat Lembar Kerja Peserta Didik (LKPD). Buatkan LKPD interaktif berformat HTML murni.
Data: Mapel: ${lkpdData.mapel} | Kelas: ${lkpdData.kelas} | Topik/Praktikum: ${lkpdData.topik} | Capaian Pembelajaran: ${lkpdData.cp}.

ATURAN MUTLAK:
1. Kembalikan HANYA tag HTML murni (tanpa \`\`\`html).
2. IKUTI CETAKAN TEMPLATE HTML INI 100%. Ganti isi di dalam [KURUNG SIKU] dengan instruksi yang interaktif dan mengajak siswa berpikir!

<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: black; max-width: 900px; margin: auto;">
    <h2 style="color: #16a34a; font-weight: bold; text-align: center; text-transform: uppercase; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: none;">
        <tr><td style="width: 25%; padding: 4px; font-weight: bold; border: none;">Mata Pelajaran</td><td style="width: 75%; padding: 4px; border: none;">: ${lkpdData.mapel}</td></tr>
        <tr><td style="padding: 4px; font-weight: bold; border: none;">Kelas</td><td style="padding: 4px; border: none;">: ${lkpdData.kelas}</td></tr>
        <tr><td style="padding: 4px; font-weight: bold; border: none;">Materi / Topik</td><td style="padding: 4px; border: none;">: ${lkpdData.topik}</td></tr>
        <tr><td style="padding: 4px; font-weight: bold; border: none;">Nama Kelompok</td><td style="padding: 4px; border: none;">: .......................................................................</td></tr>
        <tr><td style="padding: 4px; font-weight: bold; vertical-align: top; border: none;">Nama Anggota</td><td style="padding: 4px; border: none;">: 1. .......................................................................<br>  2. .......................................................................<br>  3. .......................................................................<br>  4. .......................................................................</td></tr>
    </table>

    <h3 style="color: #16a34a;">A. Tujuan Kegiatan</h3>
    <ul>[Sebutkan 3 tujuan pembelajaran spesifik yang dicapai siswa setelah mengerjakan LKPD ini]</ul>

    <h3 style="color: #16a34a;">B. Alat dan Bahan</h3>
    <ul>[Sebutkan alat dan bahan nyata yang dibutuhkan siswa untuk kegiatan ini]</ul>

    <h3 style="color: #16a34a;">C. Langkah Kerja</h3>
    <ol>[Uraikan langkah-langkah kegiatan/praktikum secara runtut, detail, dan mudah dipahami siswa]</ol>

    <h3 style="color: #16a34a;">D. Tabel Pengamatan / Pengumpulan Data</h3>
    <p><i>Catatlah hasil pengamatan atau data yang kelompokmu temukan ke dalam tabel di bawah ini!</i></p>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black; text-align: left;">
        <tr><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb; width: 10%; text-align: center;">No</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">[Judul Kolom Pengamatan 1]</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">[Judul Kolom Pengamatan 2]</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">[Judul Kolom Pengamatan 3]</th></tr>
        <tr><td style="padding: 8px; border: 1px solid black; text-align: center;">1</td><td style="padding: 8px; border: 1px solid black; height: 35px;"></td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td></tr>
        <tr><td style="padding: 8px; border: 1px solid black; text-align: center;">2</td><td style="padding: 8px; border: 1px solid black; height: 35px;"></td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td></tr>
        <tr><td style="padding: 8px; border: 1px solid black; text-align: center;">3</td><td style="padding: 8px; border: 1px solid black; height: 35px;"></td><td style="padding: 8px; border: 1px solid black;"></td><td style="padding: 8px; border: 1px solid black;"></td></tr>
    </table>

    <h3 style="color: #16a34a;">E. Bahan Diskusi / Analisis (Soal HOTS)</h3>
    <ol>
        <li style="margin-bottom: 60px;">[Pertanyaan analisis mendalam nomor 1]</li>
        <li style="margin-bottom: 60px;">[Pertanyaan analisis mendalam nomor 2]</li>
        <li style="margin-bottom: 60px;">[Pertanyaan analisis mendalam nomor 3]</li>
    </ol>

    <h3 style="color: #16a34a;">F. Kesimpulan</h3>
    <p>Berdasarkan kegiatan dan diskusi yang telah kelompokmu lakukan, buatlah kesimpulan:</p>
    <div style="width: 100%; height: 120px; border: 1px dashed black; margin-top: 10px; margin-bottom: 30px;"></div>
</div>`;
    fetchAI(prompt, `LKPD_${lkpdData.mapel.replace(/ /g, '_')}`);
  };

  const handleJenjangChange = (e: any) => {
    const newJenjang = e.target.value;
    const firstKelas = kelasByJenjang[newJenjang][0];
    setUjianData({ ...ujianData, jenjang: newJenjang, kelas: firstKelas, fase: faseByKelas[firstKelas] });
  };
  const handleKelasChange = (e: any) => {
    const newKelas = e.target.value;
    setUjianData({ ...ujianData, kelas: newKelas, fase: faseByKelas[newKelas] });
  };

  const handleGenerateUjianPro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ujianData.indikator) return showSystemModal("Validasi Gagal", "Indikator/CP tidak boleh kosong!");
    const prompt = `Anda adalah Ahli Kurikulum dan Asesmen Pendidikan Profesional. Buatkan instrumen asesmen berformat HTML MURNI (tanpa markdown \`\`\`html).
    
DATA ASESMEN:
- Jenjang/Kelas/Fase: ${ujianData.jenjang} / ${ujianData.kelas} (${ujianData.fase})
- Semester/Mapel: ${ujianData.semester} / ${ujianData.mapel}
- Topik: ${ujianData.topik}
- Capaian/Indikator: ${ujianData.indikator}
- Tipe Soal: ${ujianData.tipeSoal}
- Jenis: ${ujianData.jenisAsesmen} ${ujianData.jenisAsesmen === 'Pilihan Ganda' ? `(${ujianData.jumlahOpsi}, ${ujianData.tipePG})` : ''}
- Taksonomi / Kesulitan: ${ujianData.taksonomi} / ${ujianData.kesulitan}
- Jumlah: ${ujianData.jumlahSoal} Butir Soal.
INSTRUKSI WAJIB: Buat soal HANYA berdasarkan Indikator di atas. DILARANG membuat soal umum/melenceng.
ATURAN MUTLAK (ANTI-HALU & ANTI-LATEX):
1. Output HANYA tag HTML (<div>, <table>, <ol>, <h3>, dll). Dilarang menyertakan teks sebelum/sesudah HTML.
2. Jika tipe "Soal Literasi", wajib berikan stimulus (teks/data) di setiap soal.
3. Level kognitif wajib sesuai tingkat kesulitan yang diminta.
4. PENTING UNTUK MATEMATIKA: Gunakan teks biasa untuk simbol matematika. DILARANG KERAS menggunakan format kode LaTeX (seperti \\frac atau $...$). Gunakan superskrip HTML <sup> atau subskrip <sub> jika perlu.

STRUKTUR HTML YANG WAJIB DIIKUTI:
<div style="font-family: Arial, sans-serif; max-width: 900px; margin: auto; color: black; line-height: 1.6;">
    <h2 style="color: #d97706; text-align: center;">INSTRUMEN ASESMEN & UJIAN</h2>
    
    <h3 style="border-bottom: 2px solid #d97706;">1. INFORMASI UMUM</h3>
    <p>Mapel: ${ujianData.mapel} | Kelas: ${ujianData.kelas} | Topik: ${ujianData.topik}</p>
    
    <h3 style="border-bottom: 2px solid #d97706; margin-top: 20px;">2. KISI-KISI SOAL</h3>
    <table border="1" style="width: 100%; border-collapse: collapse; text-align: left;">
        <tr><th style="padding: 8px; background: #fef3c7;">No</th><th style="padding: 8px; background: #fef3c7;">Indikator Soal</th><th style="padding: 8px; background: #fef3c7;">Level Kognitif</th><th style="padding: 8px; background: #fef3c7;">Bentuk Soal</th></tr>
        <!-- Buat baris tabel kisi-kisi di sini (sesuai jumlah soal) -->
    </table>

    <h3 style="border-bottom: 2px solid #d97706; margin-top: 20px;">3. NASKAH SOAL</h3>
    <ol style="padding-left: 20px;">
        <!-- Isi naskah soal lengkap dengan stimulus dan opsi (jika PG) di sini -->
    </ol>

    <h3 style="border-bottom: 2px solid #d97706; margin-top: 30px;">4. KUNCI JAWABAN & PEMBAHASAN</h3>
    <!-- Jelaskan pembahasan dan sebutkan kunci jawaban -->

    <h3 style="border-bottom: 2px solid #d97706; margin-top: 30px;">5. PEDOMAN PENSKORAN</h3>
    <!-- Berikan rubrik/kriteria penilaian (skor maksimal tiap soal) -->
</div>`;
    fetchAI(prompt, `Ujian_${ujianData.mapel.replace(/ /g, '_')}`);
  };

  const exportToWord = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (!element) return;
    const htmlDoc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Dokumen</title></head><body>${element.innerHTML}</body></html>`;
    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${activeDocType}_${Date.now()}.doc`;
    link.click(); URL.revokeObjectURL(url);
  };

  const exportToPDF = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (typeof window !== 'undefined' && (window as any).html2pdf && element) {
      const opt = { margin: [15, 15, 15, 15], filename: `${activeDocType}_${Date.now()}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
      const origStyle = element.getAttribute('style');
      element.style.backgroundColor = 'white'; element.style.color = 'black'; element.style.padding = '20px';
      (window as any).html2pdf().set(opt).from(element).save().then(() => {
        if (origStyle) element.setAttribute('style', origStyle);
        else element.removeAttribute('style');
      });
    } else showSystemModal("Mohon Tunggu", "Sistem PDF sedang dimuat browser.");
  };

  return (
    <div className="bg-background text-slate-200 font-sans antialiased min-h-screen selection:bg-brand-500/30 flex flex-col relative">
     <nav className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b border-surface_border transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => switchTab('beranda')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">Modul Ajar Guru Hebat</span>
            <span className="bg-gradient-to-r from-accent-500 to-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wider ml-1 shadow-sm">PRO</span>
          </div>

        <div className="flex items-center gap-3 md:gap-5 md:ml-6 overflow-x-auto whitespace-nowrap w-full pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full">
            {['beranda', 'generator', 'lkpd', 'soal', 'pricing', 'brankas', 'tentang kami', 'blog'].map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`h-full px-2 md:px-3 text-sm capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'text-white border-b-2 border-orange-500 font-bold' : 'text-slate-400 hover:text-white font-medium'}`}
              >
                {tab === 'generator' ? 'Modul Ajar' : tab === 'soal' ? 'Soal HOTS' : tab === 'pricing' ? 'Harga' : tab === 'lkpd' ? 'LKPD' : tab === 'brankas' ? 'Brankas' : tab === 'tentang kami' ? 'Tentang Kami' : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!currentUser ? (
             <button onClick={handleLoginGoogle} className="bg-white text-gray-900 flex items-center gap-2 text-xs md:text-sm font-bold py-1.5 px-3 md:px-4 rounded-full border border-gray-200 shadow-sm hover:bg-slate-100 transition-colors">
                <i className="fa-brands fa-google text-orange-500"></i> Masuk
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-300 hidden md:flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-surface_border shadow-inner">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${userQuota > 0 ? 'bg-green-400' : 'bg-red-400'}`}></span> Kuota: {userQuota}
                </span>
                <div className="relative group z-50">
                  <button className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer border-2 border-surface_border select-none focus:outline-none" tabIndex={0}>{currentUser.name.charAt(0)}</button>
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-surface_border rounded-xl shadow-xl hidden group-hover:block group-focus-within:block z-50 overflow-hidden">
                    <div className="p-3 border-b border-surface_border bg-slate-800/50">
                      <p className="text-sm text-white font-semibold truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                   <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-surface_border transition-colors font-medium border-t border-surface_border">
                      <i className="fa-solid fa-arrow-right-from-bracket"></i> Keluar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* BERANDA */}
        {activeTab === 'beranda' && (
          <>
            {currentUser ? (
              <div className="w-full animate-fade mb-16 mt-6">
                <div className="bg-[#0b7a5e] rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between border-2 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden mb-12">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                  <div className="relative z-10 mb-8 md:mb-0">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                      Selamat {getWaktu()}, {currentUser.name.split(' ')[0] || 'Guru Hebat'}
                    </h2>
                    <p className="text-emerald-100 text-base md:text-lg font-medium">
                      Mau menyiapkan perangkat ajar apa hari ini?
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center gap-10 md:gap-14">
                    <div className="text-left">
                      <div className="text-4xl md:text-5xl font-black text-white mb-1">0</div>
                      <div className="text-emerald-200 text-sm font-semibold">dokumen dibuat</div>
                    </div>
                    <div className="text-left">
                      <div className="text-4xl md:text-5xl font-black text-white mb-1">{userQuota}</div>
                      <div className="text-emerald-200 text-sm font-semibold">kredit tersisa</div>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-xl font-bold text-white mb-6">Bahan Ajar & Materi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'generator', title: 'Modul Ajar', desc: 'Modul ajar lengkap sesuai Kurikulum Merdeka.', icon: 'fa-book-open', iconColor: 'text-blue-600', bg: 'bg-[#bae6fd]', badge: 'Populer', badgeColor: 'bg-[#fbbd23]' },
                      { id: 'lkpd', title: 'LKPD', desc: 'Lembar Kerja Peserta Didik yang runtut.', icon: 'fa-file-lines', iconColor: 'text-amber-600', bg: 'bg-[#fef08a]' },
                      { id: 'soal', title: 'Bank Soal', desc: 'Soal pilihan ganda dan uraian lengkap.', icon: 'fa-file-circle-check', iconColor: 'text-emerald-600', bg: 'bg-[#bbf7d0]' }
                    ].map((item) => (
                      <div key={item.id} onClick={() => switchTab(item.id)} className={`${item.bg} p-6 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-pointer flex flex-col group`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-white border-2 border-slate-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className={`fa-solid ${item.icon} ${item.iconColor} text-lg`}></i>
                          </div>
                          {item.badge && <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 border-slate-900 text-slate-900 ${item.badgeColor}`}>{item.badge}</span>}
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h4>
                        <p className="text-slate-700 text-sm mb-6 flex-grow leading-relaxed">{item.desc}</p>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">Buka <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i></div>
                      </div>
                      
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade w-full pb-12 relative">
                <FeatureSection switchTab={switchTab} />
                <HowItWorksSection />
                <SimulationSection />
                <FAQSection />
                <ArticleSection />
              </div>
              
            )}
          </>
          
        )}
  
        {/* HALAMAN PRICING */}
        {activeTab === 'pricing' && (
          <section className="animate-fade max-w-5xl mx-auto pt-8 pb-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Harga Ramah untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Pahlawan Pendidikan</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">Kami memahami beban administrasi guru sangatlah berat. Modul Ajar Guru Hebat dirancang agar terjangkau oleh seluruh pengajar di Indonesia, tanpa menguras kantong.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              <div className="bg-surface border border-surface_border rounded-3xl p-8 shadow-lg hover:border-slate-500 transition-all flex flex-col">
                <div className="mb-6"><span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Uji Coba</span><h3 className="text-2xl font-bold text-white mt-4 mb-2">Gratis</h3></div>
                <div className="mb-8"><span className="text-4xl font-extrabold text-white">Rp 0</span></div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start text-slate-300 text-sm"><i className="fa-solid fa-check text-green-500 mt-1 mr-3"></i> 3x Kuota Generate AI</li>
                  <li className="flex items-start text-slate-300 text-sm"><i className="fa-solid fa-check text-green-500 mt-1 mr-3"></i> Akses Modul Ajar & LKPD</li>
                </ul>
                {/* Cari tombol Mulai Gratis di kartu Rp 0 dan ubah kodenya menjadi seperti ini */}
<button
  onClick={handleLoginGoogle}
  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors mt-6"
>
  Mulai Gratis
</button>
              </div>

              <div className="bg-gradient-to-b from-surface to-amber-900/20 border-2 border-amber-500 rounded-3xl p-8 relative flex flex-col transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">Paling Populer</div>
                <div className="mb-6 mt-2"><h3 className="text-2xl font-bold text-white mb-2">Guru Pro</h3></div>
                <div className="mb-8"><span className="text-4xl font-extrabold text-white">Rp 19.000</span><span className="text-slate-400 text-sm"> / bln</span></div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start text-slate-200 text-sm"><i className="fa-solid fa-check text-amber-500 mt-1 mr-3"></i> <b>100x</b> Kuota Generate / bulan</li>
                  <li className="flex items-start text-slate-200 text-sm"><i className="fa-solid fa-check text-amber-500 mt-1 mr-3"></i> Akses Penuh Semua Fitur</li>
                </ul>
                <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-1">Berlangganan Pro</button>
              </div>

              <div className="bg-surface border border-surface_border rounded-3xl p-8 shadow-lg hover:border-blue-500/50 transition-all flex flex-col">
                <div className="mb-6"><span className="bg-blue-900/50 text-blue-300 border border-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Tim & Instansi</span><h3 className="text-2xl font-bold text-white mt-4 mb-2">Sekolah</h3></div>
                <div className="mb-8"><span className="text-4xl font-extrabold text-white">Rp 99.000</span><span className="text-slate-400 text-sm"> / bln</span></div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start text-slate-300 text-sm"><i className="fa-solid fa-check text-blue-400 mt-1 mr-3"></i> Kuota <b>Tanpa Batas</b> (Unlimited)</li>
                  <li className="flex items-start text-slate-300 text-sm"><i className="fa-solid fa-check text-blue-400 mt-1 mr-3"></i> Multi-Device (Maks 15 Guru)</li>
                </ul>
                <button className="w-full bg-surface_border hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors border border-slate-600">Hubungi Admin</button>
              </div>
            </div>
          </section>
        )}

        {/* FORM MODUL AJAR (RPP) */}
        {activeTab === 'generator' && (
          <section className="animate-fade max-w-4xl mx-auto">
            {genState === 'A' && (
              <div className="bg-surface border border-surface_border rounded-3xl overflow-hidden shadow-2xl mt-10 flex flex-col md:flex-row">
                <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-bold tracking-wider rounded-full mb-4 w-fit uppercase border border-orange-500/30">Kurikulum Merdeka</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Modul Ajar (RPP)</h2>
                  <p className="text-slate-400 mb-8 text-sm leading-relaxed">Hasilkan dokumen RPP lengkap dengan Informasi Umum, Komponen Inti, Penilaian, hingga Rubrik P5 hanya dalam hitungan detik. Bebas pusing memikirkan sintaks model pembelajaran!</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-sm text-slate-300"><i className="fa-solid fa-check text-orange-500 mr-3"></i> Terintegrasi Profil Pelajar Pancasila</li>
                    <li className="flex items-center text-sm text-slate-300"><i className="fa-solid fa-check text-orange-500 mr-3"></i> Sintaks PBL, PjBL, & Discovery Otomatis</li>
                  </ul>
                  <button onClick={() => { if (!currentUser) { window.location.href = '/login'; } else { setGenState('B'); } }} className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 w-fit flex items-center gap-2">Mulai Isi Form <i className="fa-solid fa-arrow-right"></i></button>
                </div>
                <div className="hidden md:flex flex-1 bg-slate-800 relative items-center justify-center p-8 overflow-hidden border-l border-surface_border">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                  <div className="relative z-10 bg-white rounded-lg shadow-2xl p-5 w-full max-w-[280px] transform rotate-3 hover:rotate-0 transition-all duration-500 text-slate-800 text-[10px]">
                    <div className="border-b-2 border-green-600 pb-2 mb-3"><h3 className="font-bold text-center text-sm uppercase">Modul Ajar</h3></div>
                    <div className="flex justify-between mb-1"><span>Mapel: Informatika</span><span>Fase: D</span></div>
                    <div className="flex justify-between mb-3 border-b border-slate-200 pb-2"><span>Kelas: 8</span><span>Waktu: 2 JP</span></div>
                    <div className="bg-orange-50 text-orange-700 p-2 rounded mb-3 font-semibold border border-orange-200">Model: Problem Based Learning (PBL)</div>
                    <div className="font-bold mb-1">Kegiatan Inti:</div>
                    <div className="space-y-2 mb-3">
                      <div className="flex gap-2 items-center"><div className="w-4 h-4 bg-slate-200 rounded-full flex-shrink-0"></div><div className="h-2 bg-slate-200 rounded w-full"></div></div>
                      <div className="flex gap-2 items-center"><div className="w-4 h-4 bg-slate-200 rounded-full flex-shrink-0"></div><div className="h-2 bg-slate-200 rounded w-5/6"></div></div>
                    </div>
                    <div className="h-6 w-full bg-green-100 border border-green-300 rounded mt-4"></div>
                  </div>
                </div>
              </div>
            )}

            {genState === 'B' && (
              <div className="bg-surface border border-surface_border rounded-3xl p-6 sm:p-10 shadow-2xl mt-6">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-surface_border pb-4 flex items-center gap-3">
                  <i className="fa-solid fa-file-signature text-orange-500"></i> Detail Modul Ajar
                </h2>
                <form onSubmit={handleGenerateModul} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-brand-900/20 border border-brand-500/20 rounded-xl">
                    <div><label className="text-xs text-slate-300">Nama Guru Penyusun <span className="text-red-500">*</span></label><input required placeholder="Nama Lengkap dengan Gelar" className="w-full bg-background border border-surface_border rounded-lg px-3 py-2.5 mt-1 placeholder-slate-500" value={formData.guru} onChange={e => setFormData({ ...formData, guru: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-300">Sekolah <span className="text-red-500">*</span></label><input required placeholder="Contoh: SMP Negeri 1 Jakarta" className="w-full bg-background border border-surface_border rounded-lg px-3 py-2.5 mt-1 placeholder-slate-500" value={formData.sekolah} onChange={e => setFormData({ ...formData, sekolah: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-300">Kepala Sekolah</label><input placeholder="Nama Kepala Sekolah dengan Gelar" className="w-full bg-background border border-surface_border rounded-lg px-3 py-2.5 mt-1 placeholder-slate-500" value={formData.kepsek} onChange={e => setFormData({ ...formData, kepsek: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div><label className="text-xs text-slate-400">Satuan Pendidikan <span className="text-red-500">*</span></label><select required className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1" value={formData.jenjang} onChange={e => setFormData({ ...formData, jenjang: e.target.value, kelas: '' })}><option value="">Pilih...</option>{Object.keys(kelasByJenjang).map(j => <option key={j} value={j}>{j}</option>)}</select></div>
                    <div><label className="text-xs text-slate-400">Kelas / Fase <span className="text-red-500">*</span></label><select required disabled={!formData.jenjang} className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1" value={formData.kelas} onChange={e => setFormData({ ...formData, kelas: e.target.value, fase: faseByKelas[e.target.value] })}><option value="">Pilih...</option>{formData.jenjang && kelasByJenjang[formData.jenjang].map((k: string) => <option key={k} value={k}>{k}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs text-slate-400">Mata Pelajaran <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1 outline-none focus:border-brand-500 text-white" value={formData.mapel} onChange={(e) => handleMapelChange(e, 'modul')}>
                        <option value="" disabled>Pilih Mata Pelajaran...</option>
                        {mataPelajaranOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Topik Spesifik (Elemen CP) <span className="text-red-500">*</span></label>
                      <select
                        required
                        className="w-full bg-background border border-brand-500 rounded-lg px-4 py-3 mt-1 outline-none text-white focus:border-brand-500 ring-1 ring-brand-500"
                        value={formData.topik}
                        onChange={handleTopikChange}
                      >
                        <option value="" disabled>Pilih Topik / Elemen...</option>
                        {daftarTopikTersedia.map((item: any, index: number) => (
                          <option key={index} value={item.elemen}>
                            {item.elemen}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-background border border-surface_border rounded-xl p-4 col-span-2">
                      <label className="text-xs text-slate-400 font-semibold mb-2 block">Capaian Pembelajaran (CP) Resmi</label>
                      <button type="button" onClick={() => openCpModal('modul')} className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-500 rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        Lihat & Pilih Capaian Pembelajaran (CP)
                      </button>
                      <textarea required rows={4} placeholder="Atau ketik manual di sini..." className="w-full bg-surface border border-surface_border rounded-lg px-4 py-3 outline-none text-sm text-slate-300 placeholder-slate-500 mb-4" value={formData.cp} onChange={e => setFormData({ ...formData, cp: e.target.value })}></textarea>
                      
                      <label className="text-xs text-slate-400 font-semibold mb-2 block">Tujuan Pembelajaran (TP) <span className="text-red-500">*</span></label>
                      <textarea required rows={4} placeholder="Ketik Tujuan Pembelajaran berdasarkan CP di atas..." className="w-full bg-surface border border-surface_border rounded-lg px-4 py-3 outline-none text-sm text-slate-300 placeholder-slate-500" value={formData.tp} onChange={e => setFormData({ ...formData, tp: e.target.value })}></textarea>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-2">Metode Pembelajaran <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {metodePembelajaranOptions.map(opt => (
                          <div key={opt} onClick={() => { if (selectedMetode.includes(opt)) setSelectedMetode(selectedMetode.filter(i => i !== opt)); else setSelectedMetode([...selectedMetode, opt]); }} className={`cursor-pointer px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${selectedMetode.includes(opt) ? 'bg-orange-500 text-white border-orange-600' : 'bg-background text-slate-300 border-surface_border hover:border-slate-500'}`}>{opt}</div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-2">Dimensi Profil Lulusan (DPL) <span className="text-[10px] text-slate-500">(maks 3)</span> <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {dplOptions.map(opt => (
                          <div key={opt} onClick={() => { if (selectedDPL.includes(opt)) setSelectedDPL(selectedDPL.filter(i => i !== opt)); else if (selectedDPL.length < 3) setSelectedDPL([...selectedDPL, opt]); }} className={`cursor-pointer px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${selectedDPL.includes(opt) ? 'bg-brand-500 text-white border-brand-600' : 'bg-background text-slate-300 border-surface_border hover:border-slate-500'}`}>{opt}</div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-5 col-span-2">
                      <div><label className="text-xs text-slate-400">Pertemuan <span className="text-red-500">*</span></label><input required type="number" placeholder="Contoh: 2" className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1 placeholder-slate-500" value={formData.pertemuan} onChange={e => setFormData({ ...formData, pertemuan: e.target.value })} /></div>
                      <div><label className="text-xs text-slate-400">JP/Pertemuan <span className="text-red-500">*</span></label><input required placeholder="Contoh: 2 JP" className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1 placeholder-slate-500" value={formData.jp} onChange={e => setFormData({ ...formData, jp: e.target.value })} /></div>
                      <div><label className="text-xs text-slate-400">Model Pembelajaran <span className="text-red-500">*</span></label><select required className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })}><option value="Problem Based Learning (PBL)">PBL</option><option value="Project Based Learning (PjBL)">PjBL</option><option value="Discovery Learning">Discovery</option></select></div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-2">Target/Karakteristik Peserta Didik</label>
                      <input placeholder="Contoh: Peserta didik reguler, tidak ada kesulitan belajar." className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1 placeholder-slate-500" value={formData.karakteristik} onChange={e => setFormData({ ...formData, karakteristik: e.target.value })} />
                    </div>
                    <div className="pt-6 col-span-2">
                      <button type="submit" disabled={isGenerating} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-4 rounded-lg shadow-md transition-all flex justify-center items-center gap-2">
                        {isGenerating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menyusun Modul...</> : <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate Modul Ajar</>}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {/* FORM LKPD */}
        {activeTab === 'lkpd' && (
          <section className="animate-fade max-w-4xl mx-auto">
            {genState === 'A' && (
              <div className="bg-surface border border-surface_border rounded-3xl overflow-hidden shadow-2xl mt-10 flex flex-col md:flex-row">
                <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider rounded-full mb-4 w-fit uppercase border border-emerald-500/30">Lembar Kerja Siswa</div>
                  <h2 className="text-3xl font-bold text-white mb-4">LKPD Interaktif</h2>
                  <p className="text-slate-400 mb-8 text-sm leading-relaxed">Buat panduan praktikum dan lembar kerja kelompok yang merangsang siswa untuk bereksplorasi. Lengkap dengan tabel pengamatan dan analisis kasus.</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-sm text-slate-300"><i className="fa-solid fa-check text-emerald-500 mr-3"></i> Terstruktur & Mudah Dipahami Siswa</li>
                    <li className="flex items-center text-sm text-slate-300"><i className="fa-solid fa-check text-emerald-500 mr-3"></i> Tersedia Tabel Pengumpulan Data</li>
                  </ul>
                  <button onClick={() => { if (!currentUser) { window.location.href = '/login'; } else { setGenState('B'); } }} className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 w-fit flex items-center gap-2">Buat LKPD Sekarang <i className="fa-solid fa-flask"></i></button>
                </div>
                <div className="hidden md:flex flex-1 bg-slate-800 relative items-center justify-center p-8 overflow-hidden border-l border-surface_border">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
                  <div className="relative z-10 bg-white rounded-lg shadow-2xl p-5 w-full max-w-[280px] transform -rotate-3 hover:rotate-0 transition-all duration-500 text-slate-800 text-[10px]">
                    <h3 className="font-bold text-center text-sm uppercase text-emerald-700 mb-4">Lembar Kerja Siswa</h3>
                    <div className="space-y-1 mb-4 text-[9px] font-semibold text-slate-600">
                      <p>Nama Kelompok : ....................</p>
                      <p>Anggota 1 : ....................</p>
                      <p>Anggota 2 : ....................</p>
                    </div>
                    <div className="bg-slate-100 p-2 rounded mb-3">
                      <div className="font-bold mb-1 text-emerald-700">Tabel Pengamatan:</div>
                      <table className="w-full border-collapse border border-slate-300 text-[8px] text-center">
                        <thead><tr className="bg-slate-200"><th className="border border-slate-300 p-1">No</th><th className="border border-slate-300 p-1">Variabel A</th><th className="border border-slate-300 p-1">Hasil (B)</th></tr></thead>
                        <tbody>
                          <tr><td className="border border-slate-300 p-1">1</td><td className="border border-slate-300 p-1">-</td><td className="border border-slate-300 p-1">-</td></tr>
                          <tr><td className="border border-slate-300 p-1">2</td><td className="border border-slate-300 p-1">-</td><td className="border border-slate-300 p-1">-</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="h-10 w-full border border-dashed border-slate-400 rounded bg-slate-50 flex items-center justify-center text-[8px] text-slate-400">Area Kesimpulan</div>
                  </div>
                </div>
              </div>
            )}
            {genState === 'B' && (
              <div className="bg-surface border border-surface_border rounded-3xl p-6 sm:p-10 shadow-2xl mt-6">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-surface_border pb-4 flex items-center gap-3">
                  <i className="fa-solid fa-file-signature text-emerald-500"></i> Detail LKPD
                </h2>
                <form onSubmit={handleGenerateLKPD} className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs text-slate-400">Satuan Pendidikan <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-background border border-surface_border text-white rounded-lg px-4 py-3 mt-1 outline-none focus:border-brand-500" value={lkpdData.jenjang} onChange={e => setLkpdData({ ...lkpdData, jenjang: e.target.value, kelas: '' })}>
                        <option value="" disabled>Pilih...</option>
                        {Object.keys(kelasByJenjang).map(j => <option key={j} value={j}>{j}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Kelas / Fase <span className="text-red-500">*</span></label>
                      <select required disabled={!lkpdData.jenjang} className="w-full bg-background border border-surface_border text-white rounded-lg px-4 py-3 mt-1 outline-none focus:border-brand-500" value={lkpdData.kelas} onChange={e => setLkpdData({ ...lkpdData, kelas: e.target.value, fase: faseByKelas[e.target.value] })}>
                        <option value="" disabled>Pilih...</option>
                        {lkpdData.jenjang && kelasByJenjang[lkpdData.jenjang].map((k: string) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs text-slate-400">Mata Pelajaran <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-background border border-surface_border text-white rounded-lg px-4 py-3 mt-1 outline-none focus:border-brand-500" value={lkpdData.mapel} onChange={(e) => handleMapelChange(e, 'lkpd')}>
                        <option value="" disabled>Pilih Mata Pelajaran...</option>
                        {mataPelajaranOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Topik Praktikum (Elemen CP) <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-background border border-brand-500 text-white rounded-lg px-4 py-3 mt-1 outline-none ring-1 ring-brand-500 focus:border-brand-500" value={lkpdData.topik} onChange={handleTopikLkpdChange}>
                        <option value="" disabled>Pilih Topik / Elemen...</option>
                        {daftarTopikLkpd.map((item: any, index: number) => <option key={index} value={item.elemen}>{item.elemen}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-background border border-surface_border rounded-xl p-4">
                      <label className="text-xs text-slate-400 font-semibold mb-2 block">Capaian Pembelajaran (Otomatis)</label>
                      <textarea required rows={4} className="w-full bg-surface border border-surface_border rounded-lg px-4 py-3 outline-none text-sm text-slate-300 placeholder-slate-500" value={lkpdData.cp} onChange={e => setLkpdData({ ...lkpdData, cp: e.target.value })} placeholder="CP akan terisi otomatis saat topik dipilih..."></textarea>
                  </div>

                  <div className="pt-6">
                    <button type="submit" disabled={isGenerating} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-4 rounded-lg shadow-md transition-all flex justify-center items-center gap-2">
                      {isGenerating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menyusun LKPD...</> : <><i className="fa-solid fa-flask"></i> Generate LKPD Sekarang</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {/* FORM SOAL HOTS & UJIAN PRO */}
        {activeTab === 'soal' && (
          <section className="animate-fade max-w-4xl mx-auto">
            {genState === 'A' && (
              <div className="bg-surface border border-surface_border rounded-3xl overflow-hidden shadow-2xl mt-10 flex flex-col md:flex-row">
                <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold tracking-wider rounded-full mb-4 w-fit uppercase border border-amber-500/30">HOTS & Taksonomi Bloom</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Soal & Ujian Pro</h2>
                  <p className="text-slate-400 mb-8 text-sm leading-relaxed">Generator tercanggih kami. Cukup ketik Indikator Soal, dan AI akan merakit Kisi-kisi, Teks Stimulus Literasi, Naskah Soal, Kunci Jawaban, hingga Pedoman Penskoran.</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-sm text-slate-300"><i className="fa-solid fa-check text-amber-500 mr-3"></i> Parameter Level Kognitif Presisi</li>
                    <li className="flex items-center text-sm text-slate-300"><i className="fa-solid fa-check text-amber-500 mr-3"></i> Jaminan 100% Anti-Halu untuk Eksak</li>
                  </ul>
                  <button onClick={() => { if (!currentUser) { window.location.href = '/login'; } else { setGenState('B'); } }} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 w-fit flex items-center gap-2">Mulai Merakit Ujian <i className="fa-solid fa-graduation-cap"></i></button>
                </div>
                <div className="hidden md:flex flex-1 bg-slate-800 relative items-center justify-center p-8 overflow-hidden border-l border-surface_border">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                  <div className="relative z-10 bg-white rounded-lg shadow-2xl p-5 w-full max-w-[280px] transform rotate-2 hover:rotate-0 transition-all duration-500 text-slate-800 text-[10px]">
                    <h3 className="font-bold text-center text-sm uppercase text-amber-600 border-b-2 border-amber-500 pb-2 mb-3">Instrumen Asesmen</h3>
                    <div className="bg-amber-50 p-2 rounded mb-3 border border-amber-200">
                      <div className="font-bold text-[9px] mb-1">2. KISI-KISI SOAL</div>
                      <div className="h-8 w-full bg-white border border-amber-200 flex flex-col"><div className="h-3 bg-amber-100 w-full border-b border-amber-200"></div><div className="h-2 bg-slate-200 w-2/3 m-1 rounded"></div></div>
                    </div>
                    <div className="font-bold text-[9px] mb-2">3. NASKAH SOAL (PILIHAN GANDA)</div>
                    <div className="space-y-2 mb-4 pl-2">
                      <div className="flex gap-1 items-start"><span className="font-bold">1.</span><div className="h-2 bg-slate-200 rounded w-full mt-1"></div></div>
                      <div className="pl-3 space-y-1 text-[8px] text-slate-500 font-medium">
                        <p>A. Opsi Jawaban Pertama</p>
                        <p className="bg-green-100 text-green-700 w-fit px-1 rounded">B. Opsi Jawaban Benar</p>
                        <p>C. Opsi Jawaban Ketiga</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            )}

            {genState === 'B' && (
              <div className="bg-surface border border-surface_border rounded-3xl p-6 sm:p-10 shadow-2xl mt-6">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-surface_border pb-4 flex items-center gap-3">
                  <i className="fa-solid fa-file-signature text-amber-500"></i> Detail Instrumen Asesmen
                </h2>

                <form onSubmit={handleGenerateUjianPro} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">1. Satuan Pendidikan <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.jenjang} onChange={handleJenjangChange}>
                        <option value="" disabled>Pilih...</option>
                        {Object.keys(kelasByJenjang).map(j => <option key={j} value={j}>{j}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">2. Kelas <span className="text-red-500">*</span></label>
                      <select required disabled={!ujianData.jenjang} className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.kelas} onChange={handleKelasChange}>
                        <option value="" disabled>Pilih...</option>
                        {ujianData.jenjang && kelasByJenjang[ujianData.jenjang]?.map((k: string) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">Fase (Otomatis)</label>
                      <input readOnly className="w-full bg-slate-900 border border-surface_border rounded-lg p-3 text-slate-500 cursor-not-allowed" value={ujianData.fase} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">3. Semester <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.semester} onChange={e => setUjianData({ ...ujianData, semester: e.target.value })}>
                        <option value="Semester 1">Semester 1 (Ganjil)</option>
                        <option value="Semester 2">Semester 2 (Genap)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">4. Mata Pelajaran <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.mapel} onChange={(e) => handleMapelChange(e, 'ujian')}>
                        <option value="" disabled>Pilih Mata Pelajaran...</option>
                        {mataPelajaranOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">5. Topik Spesifik (Elemen CP) <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.topik} onChange={handleTopikUjianChange}>
                        <option value="" disabled>Pilih Topik / Elemen...</option>
                        {daftarTopikUjian.map((item: any, index: number) => <option key={index} value={item.elemen}>{item.elemen}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="bg-background border border-surface_border rounded-xl p-4">
                    <label className="text-xs text-slate-400 font-semibold mb-2 block">6. Indikator Soal / Capaian Pembelajaran</label>
                    <button type="button" onClick={() => openCpModal('ujian')} className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-500 rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      Lihat & Pilih Alternatif CP
                    </button>
                    <textarea required rows={4} placeholder="Indikator akan terisi otomatis saat topik dipilih..." className="w-full bg-surface border border-surface_border rounded-lg px-4 py-3 outline-none text-sm text-slate-300 placeholder-slate-500" value={ujianData.indikator} onChange={e => setUjianData({ ...ujianData, indikator: e.target.value })}></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-background border border-surface_border rounded-xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-3">7. Tipe Stimulus Soal <span className="text-red-500">*</span></label>
                      <select className="w-full bg-surface border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.tipeSoal} onChange={e => setUjianData({ ...ujianData, tipeSoal: e.target.value })}>
                        <option value="Soal Umum (Langsung)">Soal Umum (Kasus Singkat)</option>
                        <option value="Soal Literasi">Soal Literasi (Teks Panjang/Data)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-3">8. Bentuk Asesmen <span className="text-red-500">*</span></label>
                      <select className="w-full bg-surface border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.jenisAsesmen} onChange={e => setUjianData({ ...ujianData, jenisAsesmen: e.target.value })}>
                        <option value="Pilihan Ganda">Pilihan Ganda</option>
                        <option value="Isian Singkat">Isian Singkat</option>
                        <option value="Uraian (Essay)">Uraian (Essay)</option>
                      </select>
                    </div>
                  </div>

                  {ujianData.jenisAsesmen === 'Pilihan Ganda' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-fade">
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-200 mb-1">Jumlah Opsi <span className="text-red-500">*</span></label>
                        <select className="w-full bg-background border border-amber-500/30 rounded p-2 text-sm text-white outline-none" value={ujianData.jumlahOpsi} onChange={e => setUjianData({ ...ujianData, jumlahOpsi: e.target.value })}>
                          <option value="4 Opsi (A, B, C, D)">4 Opsi (A, B, C, D)</option>
                          <option value="5 Opsi (A, B, C, D, E)">5 Opsi (A, B, C, D, E)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-200 mb-1">Tipe PG <span className="text-red-500">*</span></label>
                        <select className="w-full bg-background border border-amber-500/30 rounded p-2 text-sm text-white outline-none" value={ujianData.tipePG} onChange={e => setUjianData({ ...ujianData, tipePG: e.target.value })}>
                          <option value="PG Tunggal (1 Benar)">PG Tunggal (1 Benar)</option>
                          <option value="PG Kompleks (Lebih dari 1 Benar)">PG Kompleks</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">9. Taksonomi <span className="text-red-500">*</span></label>
                      <select className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.taksonomi} onChange={e => setUjianData({ ...ujianData, taksonomi: e.target.value })}>
                        <option value="Taksonomi Bloom">Bloom</option>
                        <option value="Taksonomi SOLO">SOLO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">10. Tingkat Kesulitan <span className="text-red-500">*</span></label>
                      <select className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.kesulitan} onChange={e => setUjianData({ ...ujianData, kesulitan: e.target.value })}>
                        <option value="HOTS (High Order)">HOTS Saja</option>
                        <option value="Kombinasi (LOTS+MOTS+HOTS)">Kombinasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">11. Jml Soal (Max 20) <span className="text-red-500">*</span></label>
                      <input type="number" min="1" max="20" required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.jumlahSoal} onChange={e => setUjianData({ ...ujianData, jumlahSoal: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button type="submit" disabled={isGenerating} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-lg shadow-md transition-all flex justify-center items-center gap-2">
                      {isGenerating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menyusun Ujian...</> : <><i className="fa-solid fa-wand-magic-sparkles"></i> Buat Naskah Soal & Kisi-kisi</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {/* RENDER HASIL & EXPORT */}
        {genState === 'C' && (
          <div className="bg-surface border border-surface_border rounded-3xl p-6 sm:p-10 shadow-xl mt-6 max-w-4xl mx-auto">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="loader mb-6"></div>
                <h3 className="text-xl font-bold text-white mb-2">⏳ {loadingMessages[loadingMsgIdx]}</h3>
                <p className="text-slate-400 text-sm">AI sedang mengetik dan merakit struktur dokumen.</p>
              </div>
            ) : (
              <div className="animate-fade w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-surface_border pb-4 gap-4">
                  <div><h2 className="text-2xl font-bold text-white">Hasil Dokumen</h2><p className="text-sm text-slate-400">Tinjau, edit langsung teks di bawah, atau unduh.</p></div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setGenState('B')} className="px-4 py-2 border border-surface_border bg-background rounded-md text-slate-300 hover:text-white text-sm font-semibold"><i className="fa-solid fa-arrow-left mr-1"></i> Edit Form</button>
                    <button onClick={() => exportToWord('generatedContent')} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md hover:bg-blue-500/30 text-sm font-semibold"><i className="fa-solid fa-file-word mr-1"></i> Word</button>
                    <button onClick={() => exportToPDF('generatedContent')} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/30 text-sm font-semibold"><i className="fa-solid fa-file-pdf mr-1"></i> PDF</button>
                  </div>
                </div>
                
                {/* --- BANNER EDITABLE --- */}
                <div className="bg-blue-900/40 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-lg mb-4 flex items-start gap-3 text-sm">
                    <i className="fa-solid fa-pen-to-square mt-0.5 text-blue-400"></i>
                    <p><strong>Mode Edit Aktif:</strong> Anda dapat mengklik dan mengedit teks pada dokumen di bawah ini secara langsung sebelum menyimpannya ke Word atau PDF.</p>
                </div>

                <div id="exportableContentWrapper" className="overflow-auto max-h-[65vh] bg-slate-200 p-4 sm:p-8 rounded-lg w-full shadow-inner">
                  <div id="generatedContent" className="outline-none mx-auto shadow-md" contentEditable suppressContentEditableWarning style={{ backgroundColor: 'white', padding: '40px', minHeight: '800px', minWidth: '750px', maxWidth: '900px', cursor: 'text' }} dangerouslySetInnerHTML={{ __html: resultHtml }} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODAL DAFTAR CP (DARI KEMENDIKDASMEN) --- */}
      {showCpModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-fade overflow-hidden">
            <div className="bg-emerald-700 text-white p-5 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Preview Capaian Pembelajaran (CP)
                </h3>
                <p className="text-emerald-100 text-sm">{activeCpTarget === 'modul' ? formData.mapel : ujianData.mapel} • {activeCpTarget === 'modul' ? formData.fase : ujianData.fase} • {activeCpTarget === 'modul' ? formData.kelas : ujianData.kelas}</p>
              </div>
              <button onClick={() => setShowCpModal(false)} className="text-emerald-200 hover:text-white p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 bg-slate-50 space-y-3">
              {availableCps.map((cp: any, idx: number) => {
                const title = cp.elemen || cp.title;
                const desc = cp.deskripsi || cp.desc;
                const isChecked = tempSelectedCp.includes(desc);
                return (
                  <label key={idx} className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${isChecked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
                    <div className="mt-0.5"><input type="checkbox" className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" checked={isChecked} onChange={() => handleToggleCp(desc)} /></div>
                    <div><h4 className="font-bold text-slate-800">{title}</h4><p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{desc}</p></div>
                  </label>
                );
              })}
            </div>
            <div className="bg-white border-t border-slate-200 p-5">
              <p className="text-xs text-slate-400 mb-4">Sumber: guru.kemendikdasmen.go.id</p>
              <div className="flex justify-between items-center">
                <button onClick={() => setShowCpModal(false)} className="text-slate-500 hover:text-slate-700 font-semibold text-sm">Lewati / Isi Manual</button>
                <button onClick={applyCpSelection} disabled={tempSelectedCp.length === 0} className={`font-bold py-2.5 px-6 rounded-lg transition-colors ${tempSelectedCp.length > 0 ? 'bg-emerald-700 hover:bg-emerald-800 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Gunakan {tempSelectedCp.length} Elemen CP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notifikasi Sistem Utama */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-surface_border rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-fade">
            <div className="flex justify-between items-start mb-4"><h3 className="text-xl font-bold text-white">{modal.title}</h3><button onClick={() => setModal({ ...modal, isOpen: false })} className="text-slate-400 hover:text-white"><i className="fa-solid fa-xmark"></i></button></div>
            <p className="text-slate-300 text-sm mb-6" dangerouslySetInnerHTML={{ __html: modal.message }}></p>
            <div className="flex justify-end"><button onClick={() => setModal({ ...modal, isOpen: false })} className="bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2 px-6 rounded-lg">Tutup</button></div>
          </div>
        </div>
      )}
      
      {/* TAMPILAN BRANKAS DOKUMEN FINAL */}
      {activeTab === 'brankas' && (
        <section className="relative animate-fade max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 -mt-8 md:-mt-12 pb-20 z-0">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[200px] bg-orange-500/15 blur-[100px] rounded-full pointer-events-none -z-10"></div>
          <div className="text-center mb-10 relative z-10">
            <div className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-400 text-sm font-semibold rounded-full mb-4 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
              <i className="fa-solid fa-box-archive mr-2"></i> Riwayat Penyimpanan
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md">
              Brankas Dokumen Saya
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Semua Modul Ajar, LKPD, dan Soal HOTS yang pernah Anda buat tersimpan aman di sini.
              Akses dan unduh kembali kapan saja tanpa mengurangi sisa kuota Anda.
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-700/50 pb-4 gap-4">
              <h3 className="text-lg font-semibold text-white">Daftar Dokumen <span className="text-slate-400 text-sm font-normal">({filteredDokumen.length} Total)</span></h3>
              
              {/* --- FITUR PENCARIAN BRANKAS --- */}
              <div className="relative w-full md:w-64">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Cari mapel / jenis dokumen..." 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredDokumen.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-700 border-dashed">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">
                  <i className="fa-regular fa-folder-open"></i>
                </div>
                <p className="text-slate-300 text-lg font-medium">{daftarDokumen.length === 0 ? "Brankas masih kosong" : "Dokumen tidak ditemukan"}</p>
                <p className="text-slate-500 text-sm mt-2">{daftarDokumen.length === 0 ? "Dokumen yang Anda generate akan otomatis muncul di sini." : "Coba gunakan kata kunci pencarian yang lain."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDokumen.map((dok) => (
                  <div key={dok.id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between hover:border-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-300 group">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20">
                          {dok.doc_type}
                        </span>
                        {/* --- TOMBOL HAPUS DOKUMEN --- */}
                        <button onClick={() => handleDeleteDokumen(dok.id)} className="text-slate-500 hover:text-red-500 transition-colors" title="Hapus Dokumen">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                      <h3 className="text-slate-200 font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                        {dok.title}
                      </h3>
                      <div className="text-slate-500 text-xs flex items-center gap-1.5 font-medium mt-3">
                         <i className="fa-regular fa-calendar"></i>
                         {new Date(dok.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedContent(dok.content)}
                      className="w-full bg-slate-800 hover:bg-orange-500 text-slate-300 hover:text-white text-sm py-2.5 mt-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-regular fa-eye"></i> Buka Dokumen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
{/* HALAMAN TENTANG KAMI */}
        {activeTab === 'tentang kami' && (
          <section className="animate-fade max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Kolom Gambar AI */}
              <div className="relative rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.15)] border-4 border-slate-800 bg-slate-900 p-2">
                <img 
                  src="/Gemini_Generated_Image_jn5dzjjn5dzjjn5d.jpg" 
                  alt="Guru Indonesia" 
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>

              {/* Kolom Teks & Fitur */}
              <div>
                <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full mb-4 inline-block border border-orange-500/20">
                  TENTANG KAMI
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                  Dibuat guru, untuk guru Indonesia
                </h2>
                <p className="text-slate-400 mb-8 text-base md:text-lg leading-relaxed">
                  Modul Ajar Guru Hebat lahir dari pengalaman langsung para guru Indonesia yang memahami betapa terbatasnya waktu untuk membuat administrasi pembelajaran.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-4 p-5 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-sm hover:border-slate-500 transition-colors">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 h-fit">
                      <i className="fa-solid fa-book-open text-orange-400 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200">Sesuai Kurikulum Merdeka</h3>
                      <p className="text-sm text-slate-400 mt-1">Menggunakan model pembelajaran dan Dimensi Profil Lulusan sesuai standar Kemendikbudristek.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-5 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-sm hover:border-slate-500 transition-colors">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 h-fit">
                      <i className="fa-solid fa-microchip text-orange-400 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200">AI terlatih untuk pendidikan Indonesia</h3>
                      <p className="text-sm text-slate-400 mt-1">Di-train dengan ribuan modul ajar berkualitas dari guru-guru terbaik Indonesia.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-5 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-sm hover:border-slate-500 transition-colors">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 h-fit">
                      <i className="fa-solid fa-bolt text-orange-400 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200">Hemat waktu & biaya</h3>
                      <p className="text-sm text-slate-400 mt-1">Buat modul ajar lengkap hanya dalam 3 menit, bukan 3 jam.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* HALAMAN BLOG */}
        {activeTab === 'blog' && (
          <section className="animate-fade w-full pt-8 pb-20">
            <ArticleSection />
          </section>
        )}
     {/* HALAMAN KEBIJAKAN PRIVASI */}
      {activeTab === 'privasi' && (
        <section className="max-w-4xl mx-auto w-full p-6 sm:p-10 mb-20 text-slate-300 animate-fade pt-8">
          <h2 className="text-3xl font-bold text-white mb-6">Kebijakan Privasi</h2>
          <div className="space-y-6 leading-relaxed bg-surface p-8 rounded-2xl border border-surface_border text-sm md:text-base">
            <p className="text-slate-400 font-medium">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            
            <p><strong>Modul Ajar Guru Hebat</strong> ("kami") sangat menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan platform kami ("Layanan"), sebuah asisten pembuat perangkat ajar Kurikulum Merdeka berbasis Kecerdasan Buatan (AI) untuk pendidik di Indonesia.</p>
            
            <h3 className="text-xl font-bold text-white mt-8 mb-2">1. Data yang Kami Kumpulkan</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Data Akun:</strong> Nama, alamat email, dan foto profil yang Anda berikan saat mendaftar atau masuk menggunakan akun Google (Google OAuth).</li>
              <li><strong>Konten Pembelajaran:</strong> Topik, mata pelajaran, fase/kelas, dan karakteristik siswa yang Anda ketikkan untuk menghasilkan Modul Ajar, LKPD, maupun Soal HOTS, beserta riwayat dokumen yang tersimpan di Brankas Anda.</li>
              <li><strong>Data Transaksi & Kuota:</strong> Informasi sisa kuota (kredit) dan riwayat pembelian paket yang diproses melalui mitra *payment gateway* resmi kami. Kami tidak pernah menyimpan data kartu kredit atau PIN rekening Anda di *server* kami.</li>
              <li><strong>Data Teknis:</strong> Alamat IP, jenis perangkat, jenis peramban (*browser*), serta data analitik dasar untuk memastikan Layanan berjalan tanpa gangguan.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">2. Cara Kami Menggunakan Data</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Menyediakan, memelihara, dan memastikan kelancaran fungsionalitas Layanan.</li>
              <li>Memproses instruksi (*prompt*) Anda melalui mesin AI untuk menghasilkan dokumen perangkat ajar yang akurat.</li>
              <li>Mengelola sinkronisasi akun, sisa kuota, dan akses ke riwayat dokumen di Brankas Anda.</li>
              <li>Mengirimkan pembaruan sistem, notifikasi layanan, dan dukungan pelanggan.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">3. Login Menggunakan Akun Google</h3>
            <p>Saat Anda memilih untuk masuk menggunakan Google, kami hanya meminta akses ke informasi profil dasar Anda (nama, email, dan foto profil) sesuai dengan izin otorisasi yang Anda berikan. Kami sama sekali <strong>tidak</strong> mengakses, membaca, mengubah, atau menyimpan isi email (Gmail), kontak, Google Drive, maupun data privasi Google lainnya. Penggunaan informasi yang diterima dari Google API secara ketat mematuhi <em>Google API Services User Data Policy</em>.</p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">4. Berbagi Data dengan Pihak Ketiga</h3>
            <p>Kami tidak akan pernah menjual data pribadi Anda. Data hanya dibagikan seperlunya kepada infrastruktur pihak ketiga yang terenkripsi dan tepercaya untuk menjalankan Layanan ini:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Supabase:</strong> Digunakan untuk sistem autentikasi pengguna dan penyimpanan *database* (Brankas dokumen) dengan standar keamanan tinggi.</li>
              <li><strong>Google Gemini API:</strong> Digunakan murni sebagai mesin pemroses bahasa (AI) untuk merakit naskah Modul Ajar, LKPD, dan Soal. Instruksi pembelajaran yang Anda masukkan dikirim ke server AI, namun <strong>tidak digunakan</strong> oleh Google untuk melatih model AI publik mereka.</li>
              <li><strong>Vercel:</strong> Digunakan untuk *hosting* situs web dan manajemen *server* aplikasi.</li>
              <li><strong>Mitra Pembayaran:</strong> Untuk memvalidasi transaksi saat Anda membeli kuota langganan (Guru Pro).</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">5. Keamanan & Penyimpanan Data</h3>
            <p>Kami menerapkan protokol keamanan teknis industri, termasuk enkripsi jalur data (HTTPS/SSL) dan perlindungan basis data berlapis. Data Anda akan disimpan selama akun Anda berstatus aktif agar Anda tetap dapat mengakses riwayat Brankas. Meskipun kami berupaya maksimal, tidak ada transmisi internet yang 100% kebal, sehingga Anda dihimbau untuk selalu menjaga kerahasiaan akses akun (email) Anda.</p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">6. Hak Pengguna</h3>
            <p>Anda memiliki kendali penuh atas data Anda. Anda berhak untuk mengakses, mengubah, mengunduh, hingga meminta penghapusan permanen akun beserta seluruh riwayat dokumen Anda dari *server* kami kapan saja.</p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">7. Hubungi Kami</h3>
            <p>Jika Anda memiliki pertanyaan, kendala, atau permintaan terkait penghapusan data privasi, silakan hubungi tim dukungan kami melalui email di <strong>support@modulajarguru.com</strong> atau WhatsApp CS di <strong>+62 812-3456-7890</strong>.</p>
          </div>
        </section>
      )}
      {/* HALAMAN SYARAT & KETENTUAN */}
      {activeTab === 'syarat' && (
        <section className="max-w-4xl mx-auto w-full p-6 sm:p-10 mb-20 text-slate-300 animate-fade pt-8">
          <h2 className="text-3xl font-bold text-white mb-6">Syarat & Ketentuan Layanan</h2>
          <div className="space-y-6 leading-relaxed bg-surface p-8 rounded-2xl border border-surface_border text-sm md:text-base">
            <p className="text-slate-400 font-medium">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            
            <p>Selamat datang di <strong>Modul Ajar Guru Hebat</strong>. Dengan mengakses, mendaftar, atau menggunakan platform kami ("Layanan"), Anda menyetujui untuk terikat dengan Syarat & Ketentuan berikut. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan Layanan kami.</p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">1. Tentang Layanan</h3>
            <p>Modul Ajar Guru Hebat adalah platform berbasis Kecerdasan Buatan (AI) yang dirancang untuk membantu pendidik di Indonesia menyusun perangkat ajar (Modul Ajar/RPP, LKPD, dan Soal HOTS) berdasarkan Kurikulum Merdeka. <strong>Penting:</strong> Layanan ini ditujukan murni sebagai <em>alat bantu (asisten)</em>. Hasil dokumen yang di-<em>generate</em> oleh AI mungkin tidak selalu sempurna. Anda wajib meninjau, memvalidasi, dan menyesuaikan keakuratan materi sebelum menggunakannya di ruang kelas.</p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">2. Akun & Keamanan</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Anda wajib mendaftar menggunakan identitas (akun Google) yang valid.</li>
              <li>Satu akun hanya diperuntukkan bagi penggunaan pribadi (kecuali paket instansi/Sekolah) dan dilarang keras untuk diperjualbelikan atau dipindahtangankan.</li>
              <li>Anda bertanggung jawab penuh atas kerahasiaan akses akun Anda dan seluruh aktivitas pembuatan dokumen di dalamnya.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">3. Sistem Kuota & Langganan</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Setiap kali Anda menekan tombol pemrosesan AI (Generate Dokumen), sistem akan memotong 1 (satu) kuota dari akun Anda. Membuka atau mengunduh ulang dokumen dari Brankas tidak memotong kuota.</li>
              <li>Pengguna baru berhak mendapatkan kuota uji coba gratis. Jika habis, Anda dapat melanjutkan penggunaan dengan berlangganan paket (misal: Guru Pro) melalui metode pembayaran resmi.</li>
              <li>Sisa kuota dari paket langganan bulanan tidak dapat diakumulasikan ke bulan berikutnya (tergantung ketentuan paket).</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">4. Pembayaran & Pengembalian Dana</h3>
            <p>Semua transaksi pembayaran diproses dengan aman melalui mitra <em>payment gateway</em> resmi kami. Karena Layanan ini berupa produk digital generatif yang kuotanya langsung masuk ke akun Anda secara *real-time*, <strong>semua pembelian bersifat final dan tidak dapat di-<em>refund</em> (dikembalikan)</strong>. Namun, jika terjadi *error* sistem (seperti pembayaran berhasil namun kuota tidak bertambah), silakan hubungi tim dukungan kami untuk penyesuaian manual.</p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">5. Hak Kekayaan Intelektual (HAKI)</h3>
            <p>Nama, logo, kode sumber (*source code*), dan desain antarmuka aplikasi Modul Ajar Guru Hebat adalah hak milik kami sepenuhnya. Namun, <strong>seluruh dokumen perangkat ajar</strong> yang berhasil Anda hasilkan (generate) menggunakan alat kami adalah <strong>sepenuhnya hak milik Anda</strong> dan bebas Anda distribusikan, cetak, atau bagikan untuk keperluan edukasi di instansi Anda.</p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">6. Penggunaan yang Dilarang</h3>
            <p>Anda secara tegas dilarang untuk:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Mengeksploitasi, meretas, atau menggunakan *bot* untuk mengakali sistem pemotongan kuota atau *server* AI kami.</li>
              <li>Menggunakan Layanan untuk menghasilkan konten yang melanggar hukum, bermuatan SARA, pornografi, atau ujaran kebencian.</li>
              <li>Menyalin, melakukan *reverse-engineering*, atau menduplikasi sistem aplikasi untuk tujuan komersial tanpa izin tertulis.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">7. Batasan Tanggung Jawab</h3>
            <p>Layanan kami disediakan secara "apa adanya" (<em>as is</em>). Kami tidak menjamin bahwa operasional AI akan selalu terbebas dari kesalahan, kelambatan, atau <em>server down</em> sementara. Sejauh diizinkan oleh hukum yang berlaku, kami dibebaskan dari segala tuntutan atas kerugian langsung maupun tidak langsung yang dialami pengguna akibat penggunaan hasil dokumen dari platform ini.</p>

            <h3 className="text-xl font-bold text-white mt-8 mb-2">8. Hubungi Kami</h3>
            <p>Kami berhak mengubah atau memperbarui Syarat & Ketentuan ini sewaktu-waktu guna menyesuaikan dengan perkembangan sistem. Jika Anda memiliki pertanyaan atau kendala, silakan hubungi kami melalui email <strong>support@modulajarguru.com</strong> atau WhatsApp di <strong>+62 812-3456-7890</strong>.</p>
          </div>
        </section>
      )}
      {/* HALAMAN HUBUNGI KAMI */}
      {activeTab === 'kontak' && (
        <section className="max-w-2xl mx-auto w-full p-6 sm:p-10 mb-20 text-slate-300 animate-fade pt-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Hubungi Kami</h2>
          <div className="flex flex-col items-center space-y-6 bg-surface p-8 rounded-2xl border border-surface_border text-center">
            <p className="text-lg">Ada pertanyaan, kendala, atau ingin bekerja sama? Jangan ragu untuk menghubungi tim dukungan kami.</p>
            <div className="w-full space-y-4 mt-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400 mb-1">Email Dukungan</p>
                <a href="mailto:support@modulajarguru.com" className="text-brand-400 font-bold text-lg hover:underline">support@modulajarguru.com</a>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400 mb-1">WhatsApp CS (Admin)</p>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-green-400 font-bold text-lg hover:underline">+62 812-3456-7890</a>
                <p className="text-xs text-slate-500 mt-2">Senin - Jumat (08:00 - 17:00 WIB)</p>
              </div>
            </div>
          </div>
        </section>
      )}

    {/* FOOTER MODERN MULTI-KOLOM */}
      <footer className="mt-20 pt-16 pb-8 border-t border-surface_border bg-surface relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Kolom 1: Brand & Deskripsi */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Modul Ajar<br/>Guru Hebat</h3>
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Aplikasi asisten AI cerdas untuk membantu guru di Indonesia merancang administrasi pembelajaran Kurikulum Merdeka dengan cepat dan presisi.
              </p>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-all"><i className="fa-brands fa-facebook-f"></i></button>
                <button className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-all"><i className="fa-brands fa-instagram"></i></button>
                <button className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-all"><i className="fa-brands fa-youtube"></i></button>
              </div>
            </div>

            {/* Kolom 2: Produk Utama */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Produk AI</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><button onClick={() => switchTab('generator')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Modul Ajar (RPP)</button></li>
                <li><button onClick={() => switchTab('soal')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Bank Soal HOTS</button></li>
                <li><button onClick={() => switchTab('lkpd')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">LKPD Interaktif</button></li>
                <li><button onClick={() => switchTab('brankas')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Brankas Dokumen</button></li>
                <li className="flex items-center gap-2 text-slate-600 cursor-not-allowed">Prota & Promes <span className="text-[9px] bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-400 uppercase font-bold tracking-wider">Segera</span></li>
                <li className="flex items-center gap-2 text-slate-600 cursor-not-allowed">Komentar Rapor <span className="text-[9px] bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-400 uppercase font-bold tracking-wider">Segera</span></li>
             <li className="flex items-center gap-2 text-slate-600 cursor-not-allowed">Latihan Soal CBT <span className="text-[9px] bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-400 uppercase font-bold tracking-wider">Segera</span></li>
              </ul>
            </div>

           {/* Kolom 3: Perusahaan & Navigasi */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Perusahaan</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><button onClick={() => switchTab('beranda')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Beranda Utama</button></li>
                <li><button onClick={() => switchTab('pricing')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Harga & Langganan</button></li>
                <li><button onClick={() => switchTab('tentang kami')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Tentang Kami</button></li>
                <li><button onClick={() => switchTab('blog')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Blog Pendidikan</button></li>
                <li className="flex items-center gap-2 text-slate-600 cursor-not-allowed">Ekosistem Guru <span className="text-[9px] bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-400 uppercase font-bold tracking-wider">Segera</span></li>
               
              </ul>
            </div>

            {/* Kolom 4: Bantuan & Legal */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Bantuan</h4>
              <ul className="space-y-4 text-sm font-medium">
               <li><button onClick={() => { switchTab('beranda'); setTimeout(() => document.getElementById('panduan')?.scrollIntoView({behavior: 'smooth'}), 100); }} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Panduan Penggunaan</button></li>
<li><button onClick={() => { switchTab('beranda'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({behavior: 'smooth'}), 100); }} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Tanya Jawab (FAQ)</button></li>
                <li><button onClick={() => switchTab('kontak')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Hubungi Kami</button></li>
                <li><button onClick={() => switchTab('privasi')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Kebijakan Privasi</button></li>
                <li><button onClick={() => switchTab('syarat')} className="text-slate-400 hover:text-orange-400 transition-colors text-left w-full">Syarat & Ketentuan</button></li>
              </ul>
            </div>
          </div>

          {/* Copyright Area */}
          <div className="pt-8 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} Modul Ajar Guru Hebat. Dibuat dengan ❤️ untuk Pendidikan Indonesia.
            </p>
            <div className="flex gap-4 text-xs text-slate-500 font-semibold uppercase tracking-wider">
               <span>Inovasi Pembelajaran Digital</span>
            </div>
          </div>
        </div>
      </footer>
      {/* POP-UP BACA DOKUMEN (READ & EDIT) */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-fade">
          <div className="bg-white text-black w-full max-w-5xl h-full max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Dokumen Anda</h3>
              <div className="flex gap-3">
                <button onClick={() => exportToPDF('previewContent')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 text-sm"><i className="fa-solid fa-file-pdf"></i> Download PDF</button>
                <button onClick={() => exportToWord('previewContent')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 text-sm"><i className="fa-solid fa-file-word"></i> Download Doc</button>
                <button onClick={() => setSelectedContent(null)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-bold transition-colors text-sm">Tutup</button>
              </div>
            </div>
            
            {/* --- BANNER EDITABLE POP-UP --- */}
            <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-6 py-2 flex items-center gap-3 text-sm">
                <i className="fa-solid fa-pen-to-square"></i>
                <p>Dokumen ini dapat diedit. Klik bagian teks mana saja di bawah untuk mengubah isinya sebelum diunduh.</p>
            </div>

           <div className="p-4 sm:p-8 overflow-auto flex-1 font-sans bg-slate-200 w-full">
            <div id="previewContent" className="outline-none mx-auto shadow-md" contentEditable suppressContentEditableWarning style={{ backgroundColor: 'white', padding: '40px', minHeight: '800px', minWidth: '750px', maxWidth: '900px', cursor: 'text' }} dangerouslySetInnerHTML={{ __html: selectedContent }} />
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArticleSection() {
  const articles = [
    {
      kategori: "KURIKULUM",
      tanggal: "21 Okt 2026",
      judul: "Panduan Cepat Menyusun Modul Ajar Kurikulum Merdeka",
      deskripsi: "Lelah begadang menyusun RPP? Pelajari cara praktis merumuskan CP, TP, dan P5 menjadi Modul Ajar lengkap dan komprehensif.",
      gambar: "/Panduan.jpg" // Kiri (Gambar tetap)
    },
    {
      kategori: "PRAKTIKUM & METODE",
      tanggal: "21 Okt 2026",
      judul: "Merancang LKPD Interaktif: Rahasia Kelas Aktif",
      deskripsi: "LKPD yang baik bukan sekadar kumpulan soal. Temukan cara membuat Lembar Kerja Peserta Didik berbasis proyek dan inkuiri yang menyenangkan.",
      gambar: "/LKPD.jpg" // Tengah
    },
    {
      kategori: "EVALUASI & ASESMEN",
      tanggal: "21 Okt 2026",
      judul: "Rahasia Menyusun Soal HOTS yang Valid dan Efektif",
      deskripsi: "Panduan menyusun soal HOTS literasi dan numerasi berbasis Taksonomi Bloom. Dilengkapi cara membuat kisi-kisi dan rubrik penilaian yang akurat.",
      gambar: "/Hots.jpg" // Kanan
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 border-t border-slate-700/50">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div className="max-w-2xl">
          <div className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 text-sm font-semibold rounded-full mb-4 border border-blue-500/20">
            <i className="fa-solid fa-newspaper mr-2"></i> Artikel & Wawasan
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ruang Belajar Pendidik</h2>
          <p className="text-slate-400 text-sm md:text-base">Temukan berbagai tips, trik, dan panduan seputar implementasi Kurikulum Merdeka dan pemanfaatan AI dalam pendidikan.</p>
        </div>
        <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm font-semibold transition-colors border border-slate-600 whitespace-nowrap">
          Lihat Semua Artikel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((art, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden group hover:border-slate-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] flex flex-col cursor-pointer">
            <div className="h-48 overflow-hidden relative">
              <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-slate-600">
                {art.kategori}
              </div>
              <img src={art.gambar} alt={art.judul} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <div className="text-slate-500 text-xs mb-3 font-medium flex items-center gap-2">
                <i className="fa-regular fa-calendar"></i> {art.tanggal}
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">{art.judul}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">{art.deskripsi}</p>
              <div className="mt-auto font-semibold text-blue-500 text-sm group-hover:text-blue-400 flex items-center">
                Baca Selengkapnya <i className="fa-solid fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Apa itu Modul Ajar Guru Hebat?",
      a: "Modul Ajar Guru Hebat adalah asisten pintar berbasis kecerdasan buatan (AI) yang dirancang khusus untuk membantu guru di Indonesia menyusun Modul Ajar, LKPD, dan Soal HOTS sesuai standar Kurikulum Merdeka dalam hitungan detik."
    },
    {
      q: "Apakah saya perlu membayar untuk menggunakan aplikasi ini?",
      a: "Setiap pengguna baru otomatis mendapatkan 10 kuota gratis saat pertama kali mendaftar. Jika kuota tersebut habis, Anda dapat berlangganan paket Guru Pro dengan harga yang sangat terjangkau."
    },
    {
      q: "Bagaimana sistem pemotongan kuota bekerja?",
      a: "Setiap kali Anda menekan tombol 'Generate' (baik untuk Modul Ajar, LKPD, maupun Soal), sistem akan memotong 1 kuota. Namun, membuka, membaca, atau mengunduh ulang dokumen yang sudah ada di Brankas sama sekali tidak memotong kuota."
    },
    {
      q: "Di mana saya bisa melihat dokumen yang sudah pernah dibuat?",
      a: "Semua dokumen yang berhasil dibuat akan otomatis tersimpan dengan aman di menu 'Brankas'. Anda bisa mengakses dan mengunduhnya kembali kapan saja melalui perangkat apa pun."
    },
    {
      q: "Apakah hasil dokumennya sesuai dengan Kurikulum Merdeka?",
      a: "Ya. Model AI kami telah diinstruksikan secara khusus untuk menyusun struktur dokumen yang memuat Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), dan profil Pelajar Pancasila sesuai standar Kurikulum Merdeka."
    }
  ];

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-10 border-t border-slate-700/50 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md">Pertanyaan Seputar Modul Ajar Guru Hebat</h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Temukan jawaban cepat untuk pertanyaan yang sering diajukan oleh rekan-rekan pengajar.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border rounded-2xl transition-all duration-300 ${openIndex === index
              ? 'bg-slate-800/80 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
              : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
              }`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex justify-between items-center text-left p-5 focus:outline-none"
            >
              <span className={`font-semibold text-base md:text-lg transition-colors ${openIndex === index ? 'text-orange-400' : 'text-slate-200'}`}>
                {faq.q}
              </span>
              <span className={`ml-4 text-orange-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`}>
                <i className="fa-solid fa-chevron-down"></i>
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <p className="p-5 pt-0 text-slate-400 leading-relaxed text-sm md:text-base border-t border-slate-700/50 mt-2">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureSection({ switchTab }: { switchTab: (tab: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const features = [
    {
      id: 'modul',
      title: 'Modul Ajar',
      icon: 'fa-book-open',
      desc: 'Susun Modul Ajar terstruktur lengkap dengan CP, TP, dan Profil Pelajar Pancasila secara instan.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      hover: 'group-hover:border-blue-500/50 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]'
    },
    {
      id: 'lkpd',
      title: 'LKPD Interaktif',
      icon: 'fa-file-signature',
      desc: 'Buat Lembar Kerja Peserta Didik yang menarik, rapi, dan sesuai dengan materi pembelajaran.',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      hover: 'group-hover:border-green-500/50 group-hover:shadow-[0_0_25px_rgba(34,197,94,0.15)]'
    },
    {
      id: 'soal',
      title: 'Soal HOTS',
      icon: 'fa-brain',
      desc: 'Generate soal evaluasi High Order Thinking Skills pilihan ganda lengkap dengan kunci jawaban.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      hover: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]'
    }
  ];

  return (
    <section ref={sectionRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-slate-700/50 mt-10">
      <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-400 text-sm font-semibold rounded-full mb-4 border border-orange-500/20">
          <i className="fa-solid fa-bolt mr-2"></i> Super Cepat & Praktis
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Solusi Administrasi Guru</h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Pilih dokumen apa yang ingin Anda buat hari ini. AI kami akan memprosesnya dalam hitungan detik.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feat, index) => (
          <div
            key={feat.id}
            onClick={() => switchTab(feat.id)}
            className={`group cursor-pointer bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-3xl transition-all duration-700 transform hover:-translate-y-3 hover:bg-slate-800/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'} ${feat.hover}`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${feat.bg} ${feat.color}`}>
              <i className={`fa-solid ${feat.icon} text-2xl`}></i>
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-white transition-colors">{feat.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {feat.desc}
            </p>
            <div className="flex items-center text-sm font-semibold text-slate-300 group-hover:text-orange-400 transition-colors mt-auto">
              Mulai Buat <i className="fa-solid fa-arrow-right ml-2 transition-transform group-hover:translate-x-2"></i>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const steps = [
    { num: "01", title: "Pilih Tool AI", desc: "Tentukan format yang ingin Anda susun hari ini: Modul Ajar, LKPD, atau daftar Soal HOTS.", icon: "fa-arrow-pointer" },
    { num: "02", title: "Masukkan Topik", desc: "Ketikkan materi pelajaran, jenjang, dan fase kelas. Biarkan AI kami merangkai strukturnya.", icon: "fa-pen-nib" },
    { num: "03", title: "Download Hasil", desc: "Dalam hitungan detik, dokumen siap diekspor ke format PDF atau disimpan ke Brankas Anda.", icon: "fa-download" }
  ];

  return (
    <section id="panduan" ref={sectionRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-slate-700/50 mt-10">
      <div className={`mb-12 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
        <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-wider rounded-full mb-4 uppercase border border-blue-500/20">Cara Kerja</div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Tiga langkah mudah,<br className="hidden md:block" /> tanpa keahlian khusus.</h2>
        <p className="text-slate-400 text-sm md:text-base max-w-xl">Dari form kosong sampai dokumen Kurikulum Merdeka siap cetak — semuanya diproses otomatis di bawah satu menit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div key={step.num} className={`relative bg-slate-900 border border-slate-700 p-8 rounded-3xl overflow-hidden transition-all duration-700 transform hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: `${index * 200}ms` }}>
            <div className="absolute -top-4 -right-2 text-[120px] font-black text-slate-800/50 select-none group-hover:text-slate-700/40 transition-colors duration-500 leading-none">{step.num}</div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-xl flex items-center justify-center text-slate-300 mb-6 group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all duration-300">
                <i className={`fa-solid ${step.icon} text-lg`}></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SimulationSection() {
  const [activeSim, setActiveSim] = useState<'modul' | 'soal' | 'lkpd'>('lkpd');

  const getOutputContent = () => {
    if (activeSim === 'lkpd') {
      return (
        <>
          <div className="mb-6"><h4 className="text-lg font-bold text-slate-200">LKPD — Informatika Kelas 8</h4><p className="text-sm text-slate-400">Berpikir Komputasional · Fase D</p></div>
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-2"><i className="fa-solid fa-eye"></i> Ayo Mengamati</div>
              <p className="text-sm text-slate-300 leading-relaxed">Perhatikan alur flowchart cara kerja mesin pembuat kopi otomatis di bawah ini! Identifikasi bagian mana yang merupakan proses dekomposisi dan pengenalan pola.</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm mb-2"><i className="fa-solid fa-pen-to-square"></i> Ayo Berlatih</div>
              <p className="text-sm text-slate-300 leading-relaxed">1. Jika sebuah robot dirancang untuk membersihkan ruangan berukuran 4x4 meter, tuliskan urutan algoritma pergerakannya agar seluruh lantai bersih tanpa melewati titik yang sama dua kali!</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-2"><i className="fa-solid fa-lightbulb"></i> Ayo Berpikir Kritis</div>
              <p className="text-sm text-slate-300 leading-relaxed">Jelaskan mengapa pendekatan abstraksi sangat penting saat kita mengembangkan sebuah perangkat lunak (software) kasir untuk kantin sekolah!</p>
            </div>
          </div>
        </>
      );
    } else if (activeSim === 'modul') {
      return (
        <div className="space-y-4">
          <div className="mb-6"><h4 className="text-lg font-bold text-slate-200">Modul Ajar — Informatika Kelas 8</h4><p className="text-sm text-slate-400">Berpikir Komputasional · Fase D</p></div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"><h5 className="font-semibold text-orange-400 text-sm mb-2">A. Tujuan Pembelajaran (TP)</h5><ul className="list-disc pl-5 text-sm text-slate-300 space-y-1"><li>Peserta didik mampu memahami konsep dekomposisi dalam menyelesaikan masalah.</li><li>Peserta didik dapat menyusun algoritma sederhana untuk tugas sehari-hari.</li></ul></div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"><h5 className="font-semibold text-orange-400 text-sm mb-2">B. Profil Pelajar Pancasila</h5><p className="text-sm text-slate-300">Bernalar Kritis, Kreatif, dan Mandiri.</p></div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="mb-6"><h4 className="text-lg font-bold text-slate-200">Bank Soal HOTS — Informatika Kelas 8</h4><p className="text-sm text-slate-400">Pilihan Ganda · Tingkat Kesulitan: Tinggi</p></div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-sm text-slate-300 mb-3 leading-relaxed"><strong>1.</strong> Sekolah Daar el-Qolam ingin membuat sistem bel otomatis. Jika hari Jumat bel istirahat berbunyi pukul 09:30, sedangkan hari lain pukul 10:00. Manakah struktur percabangan algoritma yang paling efisien untuk kasus ini?</p>
            <div className="space-y-2 text-sm text-slate-400 pl-4"><p>A. IF Hari = Jumat THEN Bunyi(09:30) ELSE Bunyi(10:00)</p><p>B. IF Hari != Jumat THEN Bunyi(09:30) ELSE Bunyi(10:00)</p><p>C. WHILE Hari = Jumat DO Bunyi(09:30)</p></div>
          </div>
        </div>
      );
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-400 text-xs font-bold tracking-wider rounded-full mb-4 uppercase border border-orange-500/20">Contoh Hasil</div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Seperti ini hasil yang Anda dapatkan</h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">Dihasilkan dalam hitungan detik, disusun rapi, tanpa perlu mengetik manual dari awal.</p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="flex p-1 bg-slate-900 border border-slate-700 rounded-full shadow-lg">
          {[{ id: 'modul', label: 'Modul Ajar' }, { id: 'soal', label: 'Soal HOTS' }, { id: 'lkpd', label: 'LKPD' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveSim(tab.id as 'modul' | 'soal' | 'lkpd')} className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${activeSim === tab.id ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4"><span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Input Guru</span><span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">Simulasi</span></div>
          <div className="space-y-5">
            <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Mata Pelajaran</label><div className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium">Informatika</div></div>
            <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Topik Materi</label><div className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium">Berpikir Komputasional & Algoritma</div></div>
            <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Fase / Kelas</label><div className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium">Fase D / Kelas 8</div></div>
            <div className="pt-4"><button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)]"><i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Generate Otomatis</button><p className="text-center text-xs text-slate-500 mt-3"><i className="fa-regular fa-clock mr-1"></i> Proses selesai dalam ~45 detik</p></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4"><span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Hasil Output AI</span><span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Siap diunduh</span></div>
          <div className="min-h-[350px]"><div className="border-l-2 border-orange-500 pl-4 mb-4">{getOutputContent()}</div></div>
          <div className="pt-6 border-t border-slate-800 mt-4"><Link href="/login" className="block w-full text-center bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors group"><i className="fa-solid fa-download mr-2 text-slate-400 group-hover:text-white transition-colors"></i>Daftar Sekarang — Gratis 10 Kuota</Link></div>
        </div>
      </div>
    </section>
  );
}