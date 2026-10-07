"use client";
import { useState, useEffect,useRef} from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

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
const p5Options = ["Beriman & Bertaqwa", "Berkebinekaan global", "Bergotong royong", "Mandiri", "Bernalar kritis", "Kreatif"];

const mataPelajaranOptions = [
  "Pendidikan Agama & Budi Pekerti", "Pendidikan Pancasila", "Bahasa Indonesia",
  "Matematika", "IPA", "IPS", "PJOK", "Bahasa Inggris", "Informatika",
  "Seni Rupa", "Seni Musik", "Seni Tari", "Seni Teater", "Prakarya", "Bahasa Daerah"
];

// --- DATABASE CP KURIKULUM MERDEKA (guru.kemendikdasmen.go.id) ---
const cpDatabase: any = {
  'Pendidikan Agama & Budi Pekerti': {
    'Fase D': [
      { id: 'ALQ', title: 'Al-Qur’an Hadis', desc: 'Peserta didik memahami ayat Al-Qur’an dan hadis tentang pentingnya berpikir kritis, ilmu pengetahuan, dan toleransi.' },
      { id: 'AQD', title: 'Aqidah', desc: 'Peserta didik mendalami rukun iman, sifat-sifat Allah, dan asmaul husna sebagai landasan keimanan yang kokoh.' },
      { id: 'AKH', title: 'Akhlak', desc: 'Peserta didik membiasakan akhlak terpuji terhadap diri sendiri, sesama manusia, dan alam lingkungan sekitar.' },
      { id: 'FIQ', title: 'Fiqih', desc: 'Peserta didik memahami ketentuan ibadah wajib dan sunah, muamalah, serta menerapkannya dalam kehidupan sehari-hari.' },
      { id: 'SKI', title: 'Sejarah Peradaban Islam', desc: 'Peserta didik menghayati sejarah kebudayaan Islam periode Mekah, Madinah, dan masa Khulafaur Rasyidin.' }
    ]
  },
  'Pendidikan Pancasila': {
    'Fase D': [
      { id: 'PAN', title: 'Pancasila', desc: 'Peserta didik mampu menganalisis kronologis lahirnya Pancasila; mengkaji fungsi dan kedudukan Pancasila sebagai dasar negara dan pandangan hidup bangsa.' },
      { id: 'UUD', title: 'UUD NRI Tahun 1945', desc: 'Peserta didik menyadari pentingnya kepatuhan terhadap norma dan aturan; menganalisis susunan negara dan sistem pemerintahan.' },
      { id: 'BHI', title: 'Bhinneka Tunggal Ika', desc: 'Peserta didik mampu mengidentifikasi keberagaman suku, agama, ras dan antargolongan dalam bingkai Bhinneka Tunggal Ika.' },
      { id: 'NKR', title: 'Negara Kesatuan Republik Indonesia', desc: 'Peserta didik mengkaji wawasan nusantara, sejarah lokal, dan peran Indonesia dalam kerja sama regional dan global.' }
    ]
  },
  'Bahasa Indonesia': {
    'Fase D': [
      { id: 'MNY', title: 'Menyimak', desc: 'Peserta didik mampu menganalisis dan memaknai informasi berupa gagasan, pikiran, pandangan dari berbagai jenis teks (fiksi dan nonfiksi) audiovisual dan aural.' },
      { id: 'MBC', title: 'Membaca dan Memirsa', desc: 'Peserta didik memahami informasi berupa gagasan, pikiran, pandangan, arahan dari berbagai jenis teks (deskripsi, narasi, puisi, eksplanasi dan eksposisi).' },
      { id: 'BBR', title: 'Berbicara dan Mempresentasikan', desc: 'Peserta didik mampu menyampaikan gagasan, pikiran, pandangan untuk tujuan pengajuan usul dan pemecahan masalah secara lisan.' },
      { id: 'MNL', title: 'Menulis', desc: 'Peserta didik mampu menulis gagasan, pikiran, pandangan tertulis untuk berbagai tujuan secara logis, kritis, dan kreatif.' }
    ],
    'Fase E': [
      { id: 'MNL', title: 'Menulis', desc: 'Peserta didik mampu menulis gagasan, pikiran, pandangan, arahan atau pesan tertulis untuk berbagai tujuan secara logis, kritis, dan kreatif dalam bentuk teks informasional dan fiksi.' }
    ]
  },
  'Matematika': {
    'Fase D': [
      { id: 'BIL', title: 'Bilangan', desc: 'Peserta didik dapat membaca, menulis, dan membandingkan bilangan bulat, rasional, desimal, bilangan berpangkat bulat dan akar, serta notasi ilmiah.' },
      { id: 'ALJ', title: 'Aljabar', desc: 'Peserta didik dapat menyelesaikan persamaan dan pertidaksamaan linear satu variabel, serta menyajikan relasi dan fungsi linear.' },
      { id: 'GEO', title: 'Geometri', desc: 'Peserta didik dapat menjelaskan sifat-sifat kekongruenan dan kesebangunan, serta menghitung luas permukaan dan volume bangun ruang sisi datar dan lengkung.' },
      { id: 'DAT', title: 'Analisis Data dan Peluang', desc: 'Peserta didik dapat merumuskan pertanyaan, mengumpulkan, menyajikan, dan menganalisis data, serta menentukan peluang kejadian tunggal.' }
    ],
    'Fase E': [
      { id: 'BIL', title: 'Bilangan', desc: 'Peserta didik dapat menggeneralisasi sifat-sifat bilangan berpangkat (eksponen) dan menerapkannya dalam barisan dan deret.' },
      { id: 'ALJ', title: 'Aljabar dan Fungsi', desc: 'Peserta didik dapat menyelesaikan sistem persamaan linear tiga variabel dan sistem pertidaksamaan linear dua variabel.' }
    ]
  },
  'IPA': {
    'Fase D': [
      { id: 'KIP', title: 'Pemahaman IPA', desc: 'Peserta didik memahami sistem organisasi kehidupan, klasifikasi makhluk hidup, pewarisan sifat, getaran, gelombang, cahaya, listrik, dan kemagnetan.' },
      { id: 'KPR', title: 'Keterampilan Proses', desc: 'Peserta didik mampu mengamati, mempertanyakan, merencanakan, melakukan penyelidikan, menganalisis data, mengevaluasi, dan mengomunikasikan hasil.' }
    ]
  },
  'IPS': {
    'Fase D': [
      { id: 'KRN', title: 'Keruangan dan Konektivitas', desc: 'Peserta didik memahami kondisi geografis Nusantara, potensi sumber daya alam, serta interaksi antar wilayah dan dampaknya.' },
      { id: 'SOS', title: 'Perkembangan Masyarakat', desc: 'Peserta didik memahami dinamika interaksi sosial, lembaga sosial, mobilitas sosial, dan keberagaman budaya masyarakat Indonesia.' },
      { id: 'SEJ', title: 'Sejarah dan Perubahan', desc: 'Peserta didik mampu memahami perubahan masa praaksara, kerajaan Hindu-Buddha, Islam, masa penjajahan, hingga proklamasi kemerdekaan.' },
      { id: 'EKO', title: 'Kegiatan Ekonomi', desc: 'Peserta didik memahami peran pelaku ekonomi, permintaan, penawaran, pasar, dan pemanfaatan literasi finansial.' }
    ]
  },
  'PJOK': {
    'Fase D': [
      { id: 'KG', title: 'Keterampilan Gerak', desc: 'Peserta didik mempraktikkan keterampilan gerak spesifik dalam berbagai permainan invasi, net, lapangan, beladiri, senam, dan renang.' },
      { id: 'PG', title: 'Pengetahuan Gerak', desc: 'Peserta didik menganalisis fakta, konsep, dan prosedur keterampilan gerak spesifik serta mekanika geraknya.' },
      { id: 'PM', title: 'Pemanfaatan Gerak', desc: 'Peserta didik menganalisis dan mempraktikkan aktivitas kebugaran jasmani untuk kesehatan.' }
    ]
  },
  'Bahasa Inggris': {
    'Fase D': [
      { id: 'LIS', title: 'Menyimak - Berbicara', desc: 'Peserta didik menggunakan bahasa Inggris untuk berinteraksi dan bertukar ide, pengalaman, minat dalam berbagai macam konteks.' },
      { id: 'REA', title: 'Membaca - Memirsa', desc: 'Peserta didik membaca dan merespon teks familiar dan tidak familiar (deskripsi, prosedur, narasi, recount) secara mandiri.' },
      { id: 'WRI', title: 'Menulis - Mempresentasikan', desc: 'Peserta didik mengomunikasikan ide dan pengalaman melalui paragraf sederhana dan terstruktur untuk berbagai audiens.' }
    ]
  },
  'Informatika': {
    'Fase D': [
      { id: 'BK', title: 'Berpikir Komputasional (BK)', desc: 'Peserta didik mampu menerapkan berpikir komputasional untuk menghasilkan solusi persoalan data diskrit bervolume kecil.' },
      { id: 'TIK', title: 'Teknologi Informasi dan Komunikasi (TIK)', desc: 'Peserta didik mampu memanfaatkan surel, peramban, CMS, dan perkakas TIK untuk membuat laporan dan presentasi.' },
      { id: 'SK', title: 'Sistem Komputer (SK)', desc: 'Peserta didik mampu mendeskripsikan komponen, fungsi, dan cara kerja komputer, serta penggunaan kodifikasi data.' },
      { id: 'JKI', title: 'Jaringan Komputer dan Internet (JKI)', desc: 'Peserta didik mampu memahami konektivitas jaringan lokal dan internet melalui jaringan kabel maupun nirkabel.' },
      { id: 'AD', title: 'Analisis Data (AD)', desc: 'Peserta didik mampu mengolah dan menganalisis data secara efisien untuk memprediksi situasi konkret sehari-hari.' },
      { id: 'AP', title: 'Algoritma dan Pemrograman (AP)', desc: 'Peserta didik mampu mengenali objek, memahami konsep variabel, percabangan, dan perulangan dalam pemrograman visual.' },
      { id: 'PLB', title: 'Praktik Lintas Bidang (PLB)', desc: 'Peserta didik mampu bergotong royong mengembangkan artefak komputasional sebagai solusi persoalan masyarakat.' }
    ]
  },
  'Seni Rupa': {
    'Fase D': [
      { id: 'MENG', title: 'Mengalami', desc: 'Peserta didik mampu menggunakan unsur rupa, prinsip desain, dan teknik seni rupa dua dimensi dan tiga dimensi.' },
      { id: 'CIPT', title: 'Menciptakan', desc: 'Peserta didik mampu menciptakan karya seni rupa dengan memadukan unsur, prinsip, dan bahan untuk mengekspresikan gagasan.' }
    ]
  },
  'Seni Musik': {
    'Fase D': [
      { id: 'MENG', title: 'Mengalami', desc: 'Peserta didik mampu menyimak, merespon, dan mengekspresikan bunyi musik secara musikal.' },
      { id: 'CIPT', title: 'Menciptakan', desc: 'Peserta didik mampu memproduksi karya musik sederhana melalui vokal maupun instrumen.' }
    ]
  },
  'Prakarya': {
    'Fase D': [
      { id: 'OBS', title: 'Observasi dan Eksplorasi', desc: 'Peserta didik mampu mengeksplorasi bahan, alat, dan teknik dari bahan lokal untuk produk kerajinan/rekayasa/budidaya/pengolahan.' },
      { id: 'DES', title: 'Desain dan Perencanaan', desc: 'Peserta didik mampu menyusun desain dan langkah kerja pembuatan produk inovatif secara sistematis.' },
      { id: 'PROD', title: 'Produksi', desc: 'Peserta didik mampu membuat produk sesuai desain dengan memperhatikan K3 dan estetika.' }
    ]
  }
};

export default function ModulGenApp() {
  const [activeTab, setActiveTab] = useState("beranda");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userQuota, setUserQuota] = useState(0);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [daftarDokumen, setDaftarDokumen] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
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


  // Fungsi Cek dan Potong Kuota
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Login & Kuota
    if (!currentUser || !currentUser.email) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    
    if (userQuota <= 0) {
      alert("Kredit kuota Anda sudah habis.");
      return;
    }

    try {
      // 2. Potong Kuota di Supabase
      const sisaKuotaBaru = userQuota - 1;
      const { error: updateError } = await supabase
        .from('users')
        .update({ quota: sisaKuotaBaru })
        .eq('email', currentUser.email);

      if (updateError) {
        console.error("Gagal memotong kuota:", updateError);
        alert("Gagal menghubungi database.");
        return; 
      }

      // 3. Update Angka Kuota di Layar
      setUserQuota(sisaKuotaBaru);
      
      const savedSession = JSON.parse(localStorage.getItem('modulgen_dummy_user') || '{}');
      savedSession.quota = sisaKuotaBaru;
      localStorage.setItem('modulgen_dummy_user', JSON.stringify(savedSession));

      alert("Kuota berhasil dipotong! Sisa kuota: " + sisaKuotaBaru);

      // ==========================================
      // TARUH FUNGSI PEMANGGIL GEMINI LO DI SINI
      // Contoh: await prosesGemini(formData);
      // ==========================================
    await handleGenerateModul(e);
    } catch (error) {
      console.error("Error generation:", error);
    }
  };
  const [formData, setFormData] = useState({
    guru: '', sekolah: '', kepsek: '',
    jenjang: '', kelas: '', fase: '', semester: '',
    mapel: '', cp: '',
    topik: '', karakteristik: '',
    pertemuan: '', jp: '', model: ''
  });
  const [selectedP5, setSelectedP5] = useState<string[]>(["Bernalar kritis", "Kreatif"]);

  const [lkpdData, setLkpdData] = useState({ mapel: '', kelas: 'Kelas 8', topik: 'Praktikum Berpikir Komputasional' });
  
  const [ujianData, setUjianData] = useState({
    jenjang: 'SMA/MA', kelas: 'Kelas 10', fase: 'Fase E', semester: 'Semester 1',
    mapel: '', indikator: '',
    topik: 'Eksponen, Barisan dan Deret Geometri',
    tipeSoal: 'Soal Umum', jenisAsesmen: 'Pilihan Ganda',
    jumlahOpsi: '5 Opsi (A, B, C, D, E)', tipePG: 'PG Tunggal (1 Benar)',
    taksonomi: 'Taksonomi Bloom', kesulitan: 'Kombinasi (LOTS + MOTS + HOTS)',
    jumlahSoal: 5
  });

  const [showCpModal, setShowCpModal] = useState(false);
  const [activeCpTarget, setActiveCpTarget] = useState<'modul' | 'ujian'>('modul');
  const [tempSelectedCp, setTempSelectedCp] = useState<string[]>([]);
  const [availableCps, setAvailableCps] = useState<any[]>([]);

  useEffect(() => {
    const savedSession = localStorage.getItem('modulgen_dummy_user');
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setCurrentUser({ name: parsedSession.name, email: parsedSession.email });
      setUserQuota(parsedSession.quota);
    }
  }, []);

  const showSystemModal = (title: string, message: string) => setModal({ isOpen: true, title, message });
  const switchTab = (tab: string) => { setActiveTab(tab); setGenState('A'); window.scrollTo({ top: 0, behavior: 'smooth' }); if (tab === 'brankas') ambilDataBrankas(); };

  // --- LOGIKA MODAL CP CERDAS ---
  const openCpModal = (target: 'modul' | 'ujian') => {
    setActiveCpTarget(target);
    setTempSelectedCp([]);
    const currentMapel = target === 'modul' ? formData.mapel : ujianData.mapel;
    const currentFase = target === 'modul' ? formData.fase : ujianData.fase;
    
    if (!currentMapel) {
        return showSystemModal("Validasi Gagal", "Silakan pilih Mata Pelajaran terlebih dahulu sebelum mencari CP.");
    }

    // Pencarian Cerdas (Case Insensitive & Substring Match)
    const dbSubjectKey = Object.keys(cpDatabase).find(key => 
      currentMapel.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(currentMapel.toLowerCase())
    );

    if (dbSubjectKey && cpDatabase[dbSubjectKey][currentFase]) {
      setAvailableCps(cpDatabase[dbSubjectKey][currentFase]);
    } else {
      // Jika belum ada di DB, buat dummy generik
      setAvailableCps([
        { id: 'ELEMEN 1', title: 'Pemahaman Konsep Inti', desc: `Pada akhir ${currentFase}, peserta didik mampu memahami konsep dasar, prinsip, dan teori terkait materi ${currentMapel} secara komprehensif.` },
        { id: 'ELEMEN 2', title: 'Keterampilan Proses & Aplikasi', desc: `Pada akhir ${currentFase}, peserta didik mampu menerapkan prinsip-prinsip ${currentMapel} untuk menganalisis dan memecahkan masalah kontekstual dalam kehidupan sehari-hari.` }
      ]);
    }
    setShowCpModal(true);
  };

  const handleToggleCp = (desc: string) => {
    if (tempSelectedCp.includes(desc)) {
      setTempSelectedCp(tempSelectedCp.filter(item => item !== desc));
    } else {
      setTempSelectedCp([...tempSelectedCp, desc]);
    }
  };

  const applyCpSelection = () => {
    const joinedCp = tempSelectedCp.join('\n\n');
    if (activeCpTarget === 'modul') {
      setFormData({...formData, cp: joinedCp});
    } else {
      setUjianData({...ujianData, indikator: joinedCp});
    }
    setShowCpModal(false);
  };
// --- FUNGSI AMBIL BRANKAS ---
  const ambilDataBrankas = async () => {
    if (!currentUser || !currentUser.email) return;
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_email', currentUser.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Gagal mengambil brankas:", error);
    } else if (data) {
      setDaftarDokumen(data);
    }
  };

  const fetchAI = async (prompt: string, docType: string) => {
    if (!currentUser || userQuota <= 0) return showSystemModal("Kuota Habis", "Kuota uji coba Anda telah habis. Silakan periksa paket langganan.");
    setGenState('C'); setIsGenerating(true); setActiveDocType(docType);

    // ⚠️ MASUKKAN API KEY GEMINI LO DI BAWAH INI:
    const apiKey = "process.env.NEXT_PUBLIC_GEMINI_API_KEY"; 

    try {
      if(!apiKey) {
        setTimeout(() => {
          setResultHtml(`<div style="font-family:'Times New Roman'; padding:20px;"><h1>Perhatian</h1><p>API Key Gemini kosong. Silakan isi variabel apiKey di kodingan.</p></div>`);
          setIsGenerating(false);
        }, 2000);
        return;
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
        })
      });
      
      if(!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Gagal API: ${response.status}`);
      }

      const data = await response.json();
      const outputText = data.candidates[0].content.parts[0].text;
      
      setResultHtml(outputText.replace(/```html/gi, '').replace(/```/gi, ''));
      
      const newQuota = userQuota - 1;
      setUserQuota(newQuota);
      localStorage.setItem('modulgen_dummy_user', JSON.stringify({ ...currentUser, quota: newQuota }));

      // ==========================================
      // SIMPAN KE BRANKAS DOKUMEN SUPABASE
      // ==========================================
      if (currentUser && currentUser.email) {
        // Kita bersihkan teksnya sekalian sebelum masuk database, sama seperti lo nge-set HTML
        const cleanContent = outputText.replace(/```html/gi, '').replace(/```/gi, '');
        
        const { error: insertError } = await supabase
          .from('documents')
          .insert([
            {
              user_email: currentUser.email,
              title: "Modul - " + docType, // Lo bisa ganti ini dengan variabel topik kalau ada
              doc_type: docType, 
              content: cleanContent
            }
          ]);
          
        if (insertError) {
          console.error("Gagal menyimpan dokumen ke brankas:", insertError);
        } else {
          console.log("Dokumen berhasil diamankan ke brankas!");
        }
      }
      // ==========================================
      
    } catch (err: any) {
      showSystemModal("Peringatan Sistem", `Keterangan: ${err.message}`);
      setGenState('B');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateModul = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedP5.length === 0) return showSystemModal("Validasi Gagal", "Pilih minimal 1 Dimensi Profil Pelajar Pancasila!");
    if (!formData.cp) return showSystemModal("Validasi Gagal", "Capaian Pembelajaran tidak boleh kosong!");
    const currentYear = new Date().getFullYear();
    const dateString = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const prompt = `Anda adalah ahli kurikulum pendidikan Indonesia. Buatkan Modul Ajar (RPP) yang SANGAT DETAIL berformat HTML murni.
Data: Guru: ${formData.guru} | Sekolah: ${formData.sekolah} | Kelas/Fase: ${formData.kelas}/${formData.fase} | Mapel: ${formData.mapel} | Topik: ${formData.topik} | CP: ${formData.cp} | P5: ${selectedP5.join(', ')} | Waktu: ${formData.pertemuan} Pertemuan (${formData.jp}) | Model: ${formData.model} | Karakteristik: ${formData.karakteristik}.

ATURAN MUTLAK:
1. Kembalikan HANYA tag HTML murni (tanpa \`\`\`html).
2. IKUTI CETAKAN TEMPLATE HTML INI 100%. Jangan merusak inline CSS. Ganti [KURUNG SIKU] dengan penjelasan materi yang panjang, padat, dan akademis!

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
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Profil Pelajar Pancasila</td><td style="padding: 4px; border: none;">: ${selectedP5.join(', ')}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Kompetensi Awal</td><td style="padding: 4px; border: none; text-align: justify;">: [Sebutkan 2 kemampuan dasar yang harus dimiliki siswa sebelum materi ini]</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Target Peserta Didik</td><td style="padding: 4px; border: none;">: ${formData.karakteristik}</td></tr>
        <tr><td style="padding: 4px; border: none; vertical-align: top;">Model Pembelajaran</td><td style="padding: 4px; border: none;">: ${formData.model}</td></tr>
    </table>

    <h4 style="color: #16a34a; margin-top: 15px;">Sarana dan Prasarana</h4>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid black; text-align: left;">
        <tr><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Materi</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Media</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Metode</th><th style="padding: 8px; border: 1px solid black; background-color: #e5e7eb;">Sumber</th></tr>
        <tr><td style="padding: 8px; border: 1px solid black; vertical-align: top;">[Sebutkan sub-materi]</td><td style="padding: 8px; border: 1px solid black; vertical-align: top;">Laptop, Proyektor, LKPD, Spidol</td><td style="padding: 8px; border: 1px solid black; vertical-align: top;">Diskusi, Tanya Jawab, Ceramah, Presentasi</td><td style="padding: 8px; border: 1px solid black; vertical-align: top;">Buku Panduan, Internet</td></tr>
    </table>

    <h2 style="color: #16a34a; font-weight: bold; border-bottom: 2px solid #16a34a; padding-bottom: 5px; margin-top: 30px;">II. KOMPONEN INTI</h2>
    <p><strong>A. Tujuan Pembelajaran</strong><br>[Berikan 3-4 tujuan pembelajaran spesifik (C4-C6)]</p>
    <p><strong>B. Pemahaman Bermakna</strong><br>[Jelaskan esensi dan manfaat materi dalam kehidupan sehari-hari]</p>
    <p><strong>C. Pertanyaan Pemantik</strong><br>[Berikan 3 pertanyaan yang menggugah nalar siswa]</p>
    <p><strong>D. Persiapan Pembelajaran</strong><br>[Sebutkan 3 langkah persiapan guru]</p>
    <p><strong>E. Kegiatan Pembelajaran</strong></p>

    [BUAT TABEL KEGIATAN DI BAWAH INI SEBANYAK ${formData.pertemuan} KALI (Pertemuan 1, Pertemuan 2, dst)]
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
        <tr><th colspan="2" style="padding: 8px; background-color: #16a34a; color: white; text-align: left; border: 1px solid black;">PERTEMUAN [X]: [Judul Sub Topik]</th><th style="padding: 8px; background-color: #16a34a; color: white; text-align: center; border: 1px solid black; width: 15%;">Waktu</th></tr>
        <tr><td style="padding: 8px; border: 1px solid black; font-weight: bold; width: 20%;">Pendahuluan</td><td style="padding: 8px; border: 1px solid black; text-align: justify;">[Sebutkan 4 langkah: salam, doa, apersepsi, penyampaian tujuan]</td><td style="padding: 8px; border: 1px solid black; text-align: center;">15 Mnt</td></tr>
        <tr><td style="padding: 8px; border: 1px solid black; font-weight: bold;">Kegiatan Inti<br>(${formData.model})</td><td style="padding: 8px; border: 1px solid black; text-align: justify;">[Sebutkan sintaks model pembelajaran secara terurut (Orientasi, Penyelidikan, dst). Sangat detail!]</td><td style="padding: 8px; border: 1px solid black; text-align: center;">[..] Mnt</td></tr>
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
        <tr><td style="width: 50%; border:none; text-align:center;">Mengetahui,<br>Kepala Sekolah<br><br><br><br><br><b>${formData.kepsek}</b></td><td style="width: 50%; border:none; text-align:center;">...................., ${dateString}<br>Guru Mata Pelajaran<br><br><br><br><br><b>${formData.guru}</b></td></tr>
    </table>
    
    <hr style="margin-top: 50px; border: 0; border-top: 1px solid #ccc;" />
    <p style="font-size: 10pt; color: #666; font-style: italic; text-align: center;">*Dokumen modul hasil generate dari Modul Ajar Guru Hebat. Harap tinjau kembali kesesuaian materi.</p>
</div>`;
    fetchAI(prompt, `Modul_${formData.mapel.replace(/ /g, '_')}`);
  };

  const handleGenerateLKPD = (e: React.FormEvent) => { 
    e.preventDefault(); 
    const prompt = `Anda adalah ahli pembuat Lembar Kerja Peserta Didik (LKPD). Buatkan LKPD interaktif berformat HTML murni.
Data: Mapel: ${lkpdData.mapel} | Kelas: ${lkpdData.kelas} | Topik/Praktikum: ${lkpdData.topik}.

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
    setUjianData({...ujianData, jenjang: newJenjang, kelas: firstKelas, fase: faseByKelas[firstKelas]});
  };
  const handleKelasChange = (e: any) => {
    const newKelas = e.target.value;
    setUjianData({...ujianData, kelas: newKelas, fase: faseByKelas[newKelas]});
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

  const exportToWord = () => {
    const htmlDoc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Dokumen</title></head><body>${resultHtml}</body></html>`;
    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${activeDocType}_${Date.now()}.doc`;
    link.click(); URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const element = document.getElementById('generatedContent');
    if (typeof window !== 'undefined' && (window as any).html2pdf) {
      const opt = { margin: [15, 15, 15, 15], filename: `${activeDocType}_${Date.now()}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
      const origStyle = element?.getAttribute('style');
      if (element) { element.style.backgroundColor = 'white'; element.style.color = 'black'; element.style.padding = '0'; }
      (window as any).html2pdf().set(opt).from(element).save().then(() => {
        if (element && origStyle) element.setAttribute('style', origStyle);
        else if (element) element.removeAttribute('style');
      });
    } else showSystemModal("Mohon Tunggu", "Sistem PDF sedang dimuat browser.");
  };

  return (
    <div className="bg-background text-slate-200 font-sans antialiased min-h-screen selection:bg-brand-500/30 flex flex-col relative">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b border-surface_border transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => switchTab('beranda')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">Modul Ajar Guru Hebat</span>
            <span className="bg-gradient-to-r from-accent-500 to-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wider ml-1 shadow-sm">PRO</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8 text-sm font-semibold h-full pt-1">
            {['beranda', 'generator', 'lkpd', 'soal', 'pricing', 'brankas'].map((tab) => (
              <button key={tab} onClick={() => switchTab(tab)} className={`h-full px-1 capitalize transition-colors ${tab === 'lkpd' || tab === 'soal' ? 'hidden md:block' : ''} ${activeTab === tab ? 'text-white border-b-2 border-accent-500' : 'text-slate-400 hover:text-white'}`}>
                {tab === 'generator' ? 'Modul Ajar' : tab === 'soal' ? 'Soal HOTS' : tab === 'pricing' ? 'Harga' : tab === 'lkpd' ? 'LKPD' : tab === 'brankas' ? 'Brankas' : tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {!currentUser ? (
              <Link href="/login" className="bg-white text-gray-900 text-xs md:text-sm font-bold py-1.5 px-3 md:px-4 rounded-full border border-gray-200 shadow-sm hover:bg-slate-100 transition-colors">
                Masuk / Daftar
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-300 hidden md:flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-surface_border shadow-inner">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${userQuota > 0 ? 'bg-green-400' : 'bg-red-400'}`}></span> Kuota: {userQuota}
                </span>
                <div className="relative group">
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer border-2 border-surface_border">{currentUser.name.charAt(0)}</div>
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-surface_border rounded-xl shadow-xl hidden group-hover:block z-50 overflow-hidden">
                        <div className="p-3 border-b border-surface_border bg-slate-800/50">
                            <p className="text-sm text-white font-semibold truncate">{currentUser.name}</p>
                            <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                        </div>
                        <button onClick={() => {
                            setCurrentUser(null);
                            localStorage.removeItem('modulgen_dummy_user');
                            switchTab('beranda');
                        }} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-surface_border transition-colors font-medium border-t border-surface_border">Keluar</button>
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
              /* ========================================================= */
              /* AREA 1: DASHBOARD KHUSUS (HANYA MUNCUL JIKA SUDAH LOGIN)  */
              /* ========================================================= */
              <div className="w-full animate-fade mb-16 mt-6">
                
                {/* Header & Banner Hijau */}
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

               {/* Grid Fitur: Bahan Ajar & Materi */}
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
                          {/* Kotak Icon dengan warna-warni */}
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
            ) : (/* ========================================================= */
              /* AREA 2: LANDING PAGE (HANYA MUNCUL JIKA BELUM LOGIN)      */
              /* ========================================================= */
              <div className="animate-fade w-full pb-12 relative">
                
                {/* --- HERO SECTION --- */}
                {/* PASTE KODINGAN HERO (TULISAN BESAR & FOTO KELAS) LO DI SINI */}
                
                {/* --- KOMPONEN LANDING PAGE LAINNYA --- */}
                <FeatureSection switchTab={switchTab} />
                <HowItWorksSection />
                <SimulationSection />
                <FAQSection />

              </div>
            )}
          </>
        )}
        
        {/* ========================================================= */}
        {/* KODINGAN TAB LAIN (MISALNYA: HALAMAN PRICING / MODUL AJAR) */}

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
                <button onClick={() => { if(!currentUser) { window.location.href = '/login'; } else { switchTab('generator'); } }} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">Mulai Gratis</button>
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
                  <button onClick={() => { if(!currentUser) { window.location.href = '/login'; } else { setGenState('B'); } }} className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 w-fit flex items-center gap-2">Mulai Isi Form <i className="fa-solid fa-arrow-right"></i></button>
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
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-surface_border pb-4">Data Modul Ajar</h2>
               <form onSubmit={handleGenerate} className="space-y-6">
                disabled={userQuota <= 0 || isGenerating}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-brand-900/20 border border-brand-500/20 rounded-xl">
                    <div><label className="text-xs text-slate-300">Nama Guru</label><input required className="w-full bg-background border border-surface_border rounded-lg px-3 py-2.5 mt-1" value={formData.guru} onChange={e => setFormData({...formData, guru: e.target.value})} /></div>
                    <div><label className="text-xs text-slate-300">Sekolah</label><input required className="w-full bg-background border border-surface_border rounded-lg px-3 py-2.5 mt-1" value={formData.sekolah} onChange={e => setFormData({...formData, sekolah: e.target.value})} /></div>
                    <div><label className="text-xs text-slate-300">Kepala Sekolah</label><input required className="w-full bg-background border border-surface_border rounded-lg px-3 py-2.5 mt-1" value={formData.kepsek} onChange={e => setFormData({...formData, kepsek: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div><label className="text-xs text-slate-400">Jenjang</label><select required className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1" value={formData.jenjang} onChange={e => setFormData({...formData, jenjang: e.target.value, kelas: ''})}><option value="">Pilih...</option>{Object.keys(kelasByJenjang).map(j => <option key={j} value={j}>{j}</option>)}</select></div>
                    <div><label className="text-xs text-slate-400">Kelas</label><select required disabled={!formData.jenjang} className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1" value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value, fase: faseByKelas[e.target.value]})}><option value="">Pilih...</option>{formData.jenjang && kelasByJenjang[formData.jenjang].map((k: string) => <option key={k} value={k}>{k}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs text-slate-400">Mata Pelajaran</label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1 outline-none focus:border-brand-500 text-white" value={formData.mapel} onChange={e => setFormData({...formData, mapel: e.target.value})}>
                        <option value="" disabled>Pilih Mata Pelajaran...</option>
                        {mataPelajaranOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs text-slate-400">Topik</label><input required className="w-full bg-background border border-brand-500 rounded-lg px-4 py-3 mt-1 ring-1 ring-brand-500" value={formData.topik} onChange={e => setFormData({...formData, topik: e.target.value})} /></div>
                  </div>
  
      
                  
                  {/* --- INTEGRASI TOMBOL CP --- */}
                  <div className="bg-background border border-surface_border rounded-xl p-4">
                    <label className="text-xs text-slate-400 font-semibold mb-2 block">Capaian Pembelajaran (CP) Resmi</label>
                    <button type="button" onClick={() => openCpModal('modul')} className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-500 rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> 
                      Lihat & Pilih Capaian Pembelajaran (CP)
                    </button>
                   <textarea required rows={8} placeholder="Atau ketik manual di sini..." className="w-full bg-surface border border-surface_border rounded-lg px-4 py-3 outline-none text-sm text-slate-300 min-h-[150px]" value={formData.cp} onChange={e => setFormData({...formData, cp: e.target.value})}></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Profil Pelajar Pancasila <span className="text-[10px] text-slate-500">(maks 3)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {p5Options.map(opt => (
                        <div key={opt} onClick={() => { if(selectedP5.includes(opt)) setSelectedP5(selectedP5.filter(i=>i!==opt)); else if(selectedP5.length < 3) setSelectedP5([...selectedP5, opt]); }} className={`cursor-pointer px-3 py-1.5 rounded-full border text-xs font-medium ${selectedP5.includes(opt) ? 'bg-brand-500 text-white border-brand-600' : 'bg-background text-slate-300 border-surface_border'}`}>{opt}</div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <div><label className="text-xs text-slate-400">Pertemuan</label><input required type="number" className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1" value={formData.pertemuan} onChange={e => setFormData({...formData, pertemuan: e.target.value})} /></div>
                    <div><label className="text-xs text-slate-400">JP/Pertemuan</label><input required className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1" value={formData.jp} onChange={e => setFormData({...formData, jp: e.target.value})} /></div>
                    <div><label className="text-xs text-slate-400">Model Pembelajaran</label><select required className="w-full bg-background border border-surface_border rounded-lg px-4 py-3 mt-1" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}><option value="Problem Based Learning (PBL)">PBL</option><option value="Project Based Learning (PjBL)">PjBL</option><option value="Discovery Learning">Discovery</option></select></div>
                  </div>
                  <div className="pt-6"><button type="submit" disabled={isGenerating} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-4 rounded-lg shadow-md">{isGenerating ? 'MEMPROSES...' : 'BUAT MODUL AJAR SEKARANG'}</button></div>
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
                  <button onClick={() => { if(!currentUser) { window.location.href = '/login'; } else { setGenState('B'); } }} className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 w-fit flex items-center gap-2">Buat LKPD Sekarang <i className="fa-solid fa-flask"></i></button>
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
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-surface_border pb-4">Data LKPD</h2>
                <form onSubmit={handleGenerateLKPD} className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs text-slate-400">Mata Pelajaran</label>
                      <select required className="w-full bg-background border border-surface_border text-white rounded-lg px-4 py-3 mt-1 outline-none focus:border-brand-500" value={lkpdData.mapel} onChange={e => setLkpdData({...lkpdData, mapel: e.target.value})}>
                        <option value="" disabled>Pilih Mata Pelajaran...</option>
                        {mataPelajaranOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs text-slate-400">Kelas / Fase</label><input required className="w-full bg-background border border-surface_border text-white rounded-lg px-4 py-3 mt-1 outline-none focus:border-brand-500" value={lkpdData.kelas} onChange={e => setLkpdData({...lkpdData, kelas: e.target.value})} /></div>
                  </div>
                  <div><label className="text-xs text-slate-400">Topik / Judul Praktikum</label><textarea required rows={3} className="w-full bg-background border border-brand-500 text-white rounded-lg px-4 py-3 mt-1 outline-none ring-1 ring-brand-500" value={lkpdData.topik} onChange={e => setLkpdData({...lkpdData, topik: e.target.value})}></textarea></div>
                  <div className="pt-6"><button type="submit" disabled={isGenerating} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-4 rounded-lg shadow-md">{isGenerating ? 'MEMPROSES LKPD...' : 'GENERATE LKPD SEKARANG'}</button></div>
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
                  <button onClick={() => { if(!currentUser) { window.location.href = '/login'; } else { setGenState('B'); } }} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 w-fit flex items-center gap-2">Mulai Merakit Ujian <i className="fa-solid fa-graduation-cap"></i></button>
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
                      <label className="block text-xs font-semibold text-slate-400 mb-2">1. Jenjang Pendidikan</label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.jenjang} onChange={handleJenjangChange}>
                        {Object.keys(kelasByJenjang).map(j => <option key={j} value={j}>{j}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">2. Kelas</label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.kelas} onChange={handleKelasChange}>
                        {kelasByJenjang[ujianData.jenjang]?.map((k: string) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">Fase (Otomatis)</label>
                      <input readOnly className="w-full bg-slate-900 border border-surface_border rounded-lg p-3 text-slate-500 cursor-not-allowed" value={ujianData.fase} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">3. Semester</label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.semester} onChange={e => setUjianData({...ujianData, semester: e.target.value})}>
                        <option value="Semester 1">Semester 1 (Ganjil)</option>
                        <option value="Semester 2">Semester 2 (Genap)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">4. Mata Pelajaran</label>
                      <select required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.mapel} onChange={e => setUjianData({...ujianData, mapel: e.target.value})}>
                        <option value="" disabled>Pilih Mata Pelajaran...</option>
                        {mataPelajaranOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">5. Topik Spesifik</label>
                      <input required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.topik} onChange={e => setUjianData({...ujianData, topik: e.target.value})} />
                    </div>
                  </div>
                

                  {/* --- INTEGRASI TOMBOL CP UNTUK SOAL --- */}
                  <div className="bg-background border border-surface_border rounded-xl p-4">
                    <label className="text-xs text-slate-400 font-semibold mb-2 block">6. Indikator Soal / Capaian Pembelajaran</label>
                    <button type="button" onClick={() => openCpModal('ujian')} className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-500 rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> 
                      Lihat & Pilih Capaian Pembelajaran (CP)
                    </button>
                    <textarea required rows={3} placeholder="Atau ketik manual di sini..." className="w-full bg-surface border border-surface_border rounded-lg px-4 py-3 outline-none text-sm text-slate-300" value={ujianData.indikator} onChange={e => setUjianData({...ujianData, indikator: e.target.value})}></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-background border border-surface_border rounded-xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-3">7. Tipe Stimulus Soal</label>
                      <select className="w-full bg-surface border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.tipeSoal} onChange={e => setUjianData({...ujianData, tipeSoal: e.target.value})}>
                        <option value="Soal Umum (Langsung)">Soal Umum (Kasus Singkat)</option>
                        <option value="Soal Literasi">Soal Literasi (Teks Panjang/Data)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-3">8. Bentuk Asesmen</label>
                      <select className="w-full bg-surface border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.jenisAsesmen} onChange={e => setUjianData({...ujianData, jenisAsesmen: e.target.value})}>
                        <option value="Pilihan Ganda">Pilihan Ganda</option>
                        <option value="Isian Singkat">Isian Singkat</option>
                        <option value="Uraian (Essay)">Uraian (Essay)</option>
                      </select>
                    </div>
                  </div>

                  {ujianData.jenisAsesmen === 'Pilihan Ganda' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-fade">
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-200 mb-1">Jumlah Opsi</label>
                        <select className="w-full bg-background border border-amber-500/30 rounded p-2 text-sm text-white outline-none" value={ujianData.jumlahOpsi} onChange={e => setUjianData({...ujianData, jumlahOpsi: e.target.value})}>
                          <option value="4 Opsi (A, B, C, D)">4 Opsi (A, B, C, D)</option>
                          <option value="5 Opsi (A, B, C, D, E)">5 Opsi (A, B, C, D, E)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-200 mb-1">Tipe PG</label>
                        <select className="w-full bg-background border border-amber-500/30 rounded p-2 text-sm text-white outline-none" value={ujianData.tipePG} onChange={e => setUjianData({...ujianData, tipePG: e.target.value})}>
                          <option value="PG Tunggal (1 Benar)">PG Tunggal (1 Benar)</option>
                          <option value="PG Kompleks (Lebih dari 1 Benar)">PG Kompleks</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">9. Taksonomi</label>
                      <select className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.taksonomi} onChange={e => setUjianData({...ujianData, taksonomi: e.target.value})}>
                        <option value="Taksonomi Bloom">Bloom</option>
                        <option value="Taksonomi SOLO">SOLO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">10. Tingkat Kesulitan</label>
                      <select className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.kesulitan} onChange={e => setUjianData({...ujianData, kesulitan: e.target.value})}>
                        <option value="HOTS (High Order)">HOTS Saja</option>
                        <option value="Kombinasi (LOTS+MOTS+HOTS)">Kombinasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">11. Jml Soal (Max 20)</label>
                      <input type="number" min="1" max="20" required className="w-full bg-background border border-surface_border rounded-lg p-3 text-white outline-none focus:border-amber-500" value={ujianData.jumlahSoal} onChange={e => setUjianData({...ujianData, jumlahSoal: Number(e.target.value)})} />
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
              <div className="flex flex-col items-center justify-center py-20 text-center"><div className="loader mb-6"></div><h3 className="text-xl font-bold text-white mb-2">⏳ Menyusun Dokumen...</h3><p className="text-slate-400 text-sm">AI sedang mengetik dan merakit struktur dokumen.</p></div>
            ) : (
              <div className="animate-fade w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-surface_border pb-4 gap-4">
                  <div><h2 className="text-2xl font-bold text-white">Hasil Dokumen</h2><p className="text-sm text-slate-400">Silakan tinjau dan unduh PDF.</p></div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setGenState('B')} className="px-4 py-2 border border-surface_border bg-background rounded-md text-slate-300 hover:text-white text-sm font-semibold"><i className="fa-solid fa-arrow-left mr-1"></i> Edit Form</button>
                    <button onClick={exportToWord} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md hover:bg-blue-500/30 text-sm font-semibold"><i className="fa-solid fa-file-word mr-1"></i> Word</button>
                    <button onClick={exportToPDF} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/30 text-sm font-semibold"><i className="fa-solid fa-file-pdf mr-1"></i> PDF</button>
                  </div>
                </div>
                <div id="exportableContentWrapper" className="overflow-y-auto max-h-[65vh] bg-slate-200 p-8 rounded-lg">
                  <div id="generatedContent" style={{backgroundColor: 'white', padding: '40px', minHeight: '800px'}} dangerouslySetInnerHTML={{ __html: resultHtml }} />
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
              {availableCps.map((cp) => {
                const isChecked = tempSelectedCp.includes(cp.desc);
                return (
                  <label key={cp.id} className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${isChecked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
                    <div className="mt-0.5"><input type="checkbox" className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" checked={isChecked} onChange={() => handleToggleCp(cp.desc)} /></div>
                    <div><h4 className="font-bold text-slate-800">{cp.title}</h4><p className="text-sm text-slate-600 mt-1">{cp.desc}</p></div>
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
             {activeTab === 'brankas' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            <div className="bg-surface border border-surface_border rounded-3xl p-6 sm:p-10 shadow-2xl mt-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-surface_border pb-4">
                Brankas Dokumen Saya
              </h2>
              
              {daftarDokumen.length === 0 ? (
                <div className="text-center py-16 bg-background rounded-2xl border border-surface_border border-dashed">
                  <p className="text-slate-400 text-lg">Brankas masih kosong.</p>
                  <p className="text-slate-500 text-sm mt-2">Modul yang Anda buat akan otomatis tersimpan di sini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {daftarDokumen.map((dok) => (
                    <div key={dok.id} className="bg-background border border-surface_border p-5 rounded-xl flex flex-col justify-between hover:border-brand-500 transition-colors">
                      <div>
                        <span className="text-xs font-bold bg-brand-900/40 text-brand-500 px-3 py-1 rounded-full mb-3 inline-block">
                          {dok.doc_type}
                        </span>
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{dok.title}</h3>
                        <p className="text-xs text-slate-400 mb-4">
                          Dibuat: {new Date(dok.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      
                     
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        </div>
      )}
   {/* TAMPILAN BRANKAS DOKUMEN FINAL */}
        {activeTab === 'brankas' && (
          <section className="relative animate-fade max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 -mt-8 md:-mt-12 pb-20 z-0">
            
            {/* Elemen Dekorasi Latar Belakang (Cahaya Oren di belakang judul) */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[200px] bg-orange-500/15 blur-[100px] rounded-full pointer-events-none -z-10"></div>
            
            {/* Bagian Header Brankas */}
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

            {/* Kontainer Utama Kotak Dokumen */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-4">
                <h3 className="text-lg font-semibold text-white">Daftar Dokumen <span className="text-slate-400 text-sm font-normal">({daftarDokumen.length} Total)</span></h3>
              </div>

              {daftarDokumen.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-700 border-dashed">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">
                    <i className="fa-regular fa-folder-open"></i>
                  </div>
                  <p className="text-slate-300 text-lg font-medium">Brankas masih kosong</p>
                  <p className="text-slate-500 text-sm mt-2">Dokumen yang Anda generate akan otomatis muncul di sini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {daftarDokumen.map((dok) => (
                    <div key={dok.id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between hover:border-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-300 group">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20">
                            {dok.doc_type}
                          </span>
                          <div className="text-slate-500 text-xs flex items-center gap-1.5 font-medium">
                            <i className="fa-regular fa-calendar"></i>
                            {new Date(dok.created_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        <h3 className="text-slate-200 font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                          {dok.title}
                        </h3>
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
        {/* POP-UP BACA DOKUMEN */}
          {selectedContent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-fade">
              <div className="bg-white text-black w-full max-w-5xl h-full max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                {/* Header Pop-up */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-100">
                  <h3 className="font-bold text-lg text-slate-800">Pratinjau Dokumen</h3>
                  
                  {/* Kumpulan Tombol Export */}
                  <div className="flex gap-3">
                    {/* Pastikan nama fungsinya sesuai dengan yang ada di kodingan lo, misal: exportToPDF */}
                    <button 
                      onClick={exportToPDF} 
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 text-sm"
                    >
                      <i className="fa-solid fa-file-pdf"></i> Download PDF
                    </button>
                    
                    {/* Tombol Word (kalau lo punya fungsi exportToWord) */}
                    <button 
                      onClick={exportToWord} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 text-sm"
                    >
                      <i className="fa-solid fa-file-word"></i> Download Doc
                    </button>

                    <button 
                      onClick={() => setSelectedContent(null)}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-bold transition-colors text-sm"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
                
               
                
                {/* Isi Teks Modul HTML */}
                <div className="p-8 overflow-y-auto flex-1 font-sans">
                   <div dangerouslySetInnerHTML={{ __html: selectedContent }} />
                </div>
              </div>
            </div>
          )}
    </div>
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
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-10 border-t border-slate-700/50 relative z-10">
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
            className={`border rounded-2xl transition-all duration-300 ${
              openIndex === index 
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
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
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
      { threshold: 0.1 } // Memicu animasi saat 10% elemen terlihat di layar
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
      
      {/* Header Bagian Fitur */}
      <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-400 text-sm font-semibold rounded-full mb-4 border border-orange-500/20">
          <i className="fa-solid fa-bolt mr-2"></i> Super Cepat & Praktis
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Solusi Administrasi Guru</h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Pilih dokumen apa yang ingin Anda buat hari ini. AI kami akan memprosesnya dalam hitungan detik.
        </p>
      </div>

      {/* Grid Kotak Fitur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feat, index) => (
          <div 
            key={feat.id}
            onClick={() => switchTab(feat.id)} // FUNGSI KLIK PINDAH TAB
            className={`group cursor-pointer bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-3xl transition-all duration-700 transform hover:-translate-y-3 hover:bg-slate-800/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'} ${feat.hover}`}
            style={{ transitionDelay: `${index * 150}ms` }} // Jeda animasi beruntun
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
    {
      num: "01",
      title: "Pilih Tool AI",
      desc: "Tentukan format yang ingin Anda susun hari ini: Modul Ajar, LKPD, atau daftar Soal HOTS.",
      icon: "fa-arrow-pointer"
    },
    {
      num: "02",
      title: "Masukkan Topik",
      desc: "Ketikkan materi pelajaran, jenjang, dan fase kelas. Biarkan AI kami merangkai strukturnya.",
      icon: "fa-pen-nib"
    },
    {
      num: "03",
      title: "Download Hasil",
      desc: "Dalam hitungan detik, dokumen siap diekspor ke format PDF atau disimpan ke Brankas Anda.",
      icon: "fa-download"
    }
  ];

  return (
    <section ref={sectionRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-slate-700/50 mt-10">
      
      {/* Bagian Header Kiri */}
      <div className={`mb-12 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
        <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-wider rounded-full mb-4 uppercase border border-blue-500/20">
          Cara Kerja
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Tiga langkah mudah,<br className="hidden md:block"/> tanpa keahlian khusus.
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-xl">
          Dari form kosong sampai dokumen Kurikulum Merdeka siap cetak — semuanya diproses otomatis di bawah satu menit.
        </p>
      </div>

      {/* Grid Kotak Langkah */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div 
            key={step.num}
            className={`relative bg-slate-900 border border-slate-700 p-8 rounded-3xl overflow-hidden transition-all duration-700 transform hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            {/* Watermark Angka Besar di Kanan Atas */}
            <div className="absolute -top-4 -right-2 text-[120px] font-black text-slate-800/50 select-none group-hover:text-slate-700/40 transition-colors duration-500 leading-none">
              {step.num}
            </div>

            {/* Konten Kotak */}
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-xl flex items-center justify-center text-slate-300 mb-6 group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all duration-300">
                <i className={`fa-solid ${step.icon} text-lg`}></i>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function SimulationSection() {
  const [activeSim, setActiveSim] = useState<'modul' | 'soal' | 'lkpd'>('lkpd');

  // Konten dinamis berdasarkan tab yang dipilih
  const getOutputContent = () => {
    if (activeSim === 'lkpd') {
      return (
        <>
          <div className="mb-6">
            <h4 className="text-lg font-bold text-slate-200">LKPD — Informatika Kelas 8</h4>
            <p className="text-sm text-slate-400">Berpikir Komputasional · Fase D</p>
          </div>
          
          <div className="space-y-4">
            {/* Box 1 */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-2">
                <i className="fa-solid fa-eye"></i> Ayo Mengamati
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Perhatikan alur flowchart cara kerja mesin pembuat kopi otomatis di bawah ini! Identifikasi bagian mana yang merupakan proses dekomposisi dan pengenalan pola.
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm mb-2">
                <i className="fa-solid fa-pen-to-square"></i> Ayo Berlatih
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                1. Jika sebuah robot dirancang untuk membersihkan ruangan berukuran 4x4 meter, tuliskan urutan algoritma pergerakannya agar seluruh lantai bersih tanpa melewati titik yang sama dua kali!
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-2">
                <i className="fa-solid fa-lightbulb"></i> Ayo Berpikir Kritis
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Jelaskan mengapa pendekatan abstraksi sangat penting saat kita mengembangkan sebuah perangkat lunak (software) kasir untuk kantin sekolah!
              </p>
            </div>
          </div>
        </>
      );
    } else if (activeSim === 'modul') {
      return (
        <div className="space-y-4">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-slate-200">Modul Ajar — Informatika Kelas 8</h4>
            <p className="text-sm text-slate-400">Berpikir Komputasional · Fase D</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h5 className="font-semibold text-orange-400 text-sm mb-2">A. Tujuan Pembelajaran (TP)</h5>
            <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
              <li>Peserta didik mampu memahami konsep dekomposisi dalam menyelesaikan masalah.</li>
              <li>Peserta didik dapat menyusun algoritma sederhana untuk tugas sehari-hari.</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h5 className="font-semibold text-orange-400 text-sm mb-2">B. Profil Pelajar Pancasila</h5>
            <p className="text-sm text-slate-300">Bernalar Kritis, Kreatif, dan Mandiri.</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-slate-200">Bank Soal HOTS — Informatika Kelas 8</h4>
            <p className="text-sm text-slate-400">Pilihan Ganda · Tingkat Kesulitan: Tinggi</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-sm text-slate-300 mb-3 leading-relaxed">
              <strong>1.</strong> Sekolah Daar el-Qolam ingin membuat sistem bel otomatis. Jika hari Jumat bel istirahat berbunyi pukul 09:30, sedangkan hari lain pukul 10:00. Manakah struktur percabangan algoritma yang paling efisien untuk kasus ini?
            </p>
            <div className="space-y-2 text-sm text-slate-400 pl-4">
              <p>A. IF Hari = Jumat THEN Bunyi(09:30) ELSE Bunyi(10:00)</p>
              <p>B. IF Hari != Jumat THEN Bunyi(09:30) ELSE Bunyi(10:00)</p>
              <p>C. WHILE Hari = Jumat DO Bunyi(09:30)</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
      
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-400 text-xs font-bold tracking-wider rounded-full mb-4 uppercase border border-orange-500/20">
          Contoh Hasil
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Seperti ini hasil yang Anda dapatkan
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Dihasilkan dalam hitungan detik, disusun rapi, tanpa perlu mengetik manual dari awal.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex justify-center mb-10">
        <div className="flex p-1 bg-slate-900 border border-slate-700 rounded-full shadow-lg">
          {[
            { id: 'modul', label: 'Modul Ajar' },
            { id: 'soal', label: 'Soal HOTS' },
            { id: 'lkpd', label: 'LKPD' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSim(tab.id as 'modul' | 'soal' | 'lkpd')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                activeSim === tab.id 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Kiri Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* PANEL KIRI: INPUT GURU */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Input Guru</span>
            <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">Simulasi</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Mata Pelajaran</label>
              <div className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium">
                Informatika
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Topik Materi</label>
              <div className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium">
                Berpikir Komputasional & Algoritma
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Fase / Kelas</label>
              <div className="w-full bg-slate-800 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium">
                Fase D / Kelas 8
              </div>
            </div>
            
            <div className="pt-4">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Generate Otomatis
              </button>
              <p className="text-center text-xs text-slate-500 mt-3">
                <i className="fa-regular fa-clock mr-1"></i> Proses selesai dalam ~45 detik
              </p>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: OUTPUT HASIL */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Hasil Output AI</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Siap diunduh
            </span>
          </div>

          <div className="min-h-[350px]">
            <div className="border-l-2 border-orange-500 pl-4 mb-4">
              {getOutputContent()}
            </div>
          </div>

         <div className="pt-6 border-t border-slate-800 mt-4">
            <Link href="/login" className="block w-full text-center bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors group">
              <i className="fa-solid fa-download mr-2 text-slate-400 group-hover:text-white transition-colors"></i> 
              Daftar Sekarang — Gratis 10 Kuota
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}