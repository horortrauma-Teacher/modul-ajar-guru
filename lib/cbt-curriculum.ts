/**
 * Sinkronisasi Topik & Kurikulum Merdeka CBT SMP & SMA (SMPS Daar El-Qolam)
 * Terhubung langsung dengan sistem Bank Soal & Jadwal Ujian CBT
 */

export interface CbtTopicItem {
  id: string;
  nama: string;
  deskripsi: string;
}

export const CBT_CURRICULUM_TOPICS: Record<string, CbtTopicItem[]> = {
  // =================== INFORMATIKA ===================
  'Informatika': [
    { id: 'inf-01', nama: 'Membedakan Fakta dan Opini', deskripsi: 'Literasi informasi digital, verifikasi kebenaran berita, identifikasi disinformasi/hoaks, dan berpikir kritis di ruang siber' },
    { id: 'inf-02', nama: 'Ekosistem Media Pers Digital', deskripsi: 'Jurnalistik siber, etika media digital, peran pers resmi vs media sosial, algoritma kurasi berita, dan Undang-Undang ITE' },
    { id: 'inf-03', nama: 'Berpikir Komputasional (Decomposisi, Pola, Abstraksi, Algoritma)', deskripsi: 'Pemecahan masalah logis, diagram alir, dan logika struktur keputusan' },
    { id: 'inf-04', nama: 'Teknologi Informasi & Komunikasi (Aplikasi Perkantoran)', deskripsi: 'Integrasi dokumen teks, lembar kerja spreadsheet, dan presentasi multimedia' },
    { id: 'inf-05', nama: 'Sistem Komputer (Hardware, Software & Brainware)', deskripsi: 'Interaksi komponen CPU, RAM, memori penyimpanan, dan sistem operasi' },
    { id: 'inf-06', nama: 'Jaringan Komputer, Topologi & Keamanan Internet', deskripsi: 'Internet vs intranet, enkripsi, bahaya phishing, malware, dan etika digital' },
    { id: 'inf-07', nama: 'Analisis Data & Visualisasi Lembar Kerja', deskripsi: 'Penggunaan rumus SUM, AVERAGE, IF, VLOOKUP, dan grafik tren data' },
    { id: 'inf-08', nama: 'Algoritma Pemrograman Visual (Scratch / Block-based)', deskripsi: 'Struktur sekuensial, perulangan (loop), kondisi logika if-else, dan variabel' }
  ],

  // =================== BAHASA INDONESIA ===================
  'Bahasa Indonesia': [
    { id: 'bi-01', nama: 'Teks Deskripsi & Objek Budaya Nusantara', deskripsi: 'Mengidentifikasi informasi rinci, struktur, dan kebahasaan teks deskripsi' },
    { id: 'bi-02', nama: 'Puisi Rakyat & Pantun Tradisional', deskripsi: 'Memahami rima, bait, makna kata kias, dan nilai kearifan lokal' },
    { id: 'bi-03', nama: 'Teks Prosedur & Wacana Kritis', deskripsi: 'Tahapan sistematis, konjungsi temporal, dan kalimat imperatif' },
    { id: 'bi-04', nama: 'Teks Cerita Pendek (Cerpen) & Resensi', deskripsi: 'Unsur intrinsik, pesan moral, amanat, dan alur dramatik' },
    { id: 'bi-05', nama: 'Teks Berita & Literasi Informasi Digital', deskripsi: 'Unsur 5W+1H (Adiksimba), verifikasi hoaks, dan fakta vs opini' },
    { id: 'bi-06', nama: 'Teks Diskusi & Argumentasi Dua Arah', deskripsi: 'Sudut pandang pro-kontra dan penalaran logis solutif' },
    { id: 'bi-07', nama: 'Wacana AKM Literasi Membaca Kontekstual', deskripsi: 'Analisis stimulus wacana sosial, saintifik, dan evaluasi isi' }
  ],

  // =================== MATEMATIKA ===================
  'Matematika': [
    { id: 'mat-01', nama: 'Bilangan Bulat, Pecahan & Rasional', deskripsi: 'Operasi hitung campuran, representasi garis bilangan, dan aplikasi kehidupan' },
    { id: 'mat-02', nama: 'Aljabar & Persamaan Linear Satu Variabel (PLSV)', deskripsi: 'Suku sejenis, pemodelan matematika, dan penyelesaian masalah kontekstual' },
    { id: 'mat-03', nama: 'Aritmetika Sosial & Rasio Proporsi', deskripsi: 'Diskon, pajak, untung-rugi, bunga tunggal, skala peta, dan perbandingan' },
    { id: 'mat-04', nama: 'Geometri & Bangun Datar (Segi Empat & Segitiga)', deskripsi: 'Keliling, luas, teorema Pythagoras, dan sudut dalam bangun datar' },
    { id: 'mat-05', nama: 'Bangun Ruang Sisi Datar (Kubus, Balok, Prisma, Limas)', deskripsi: 'Luas permukaan, volume, jaring-jaring, dan diagonal ruang' },
    { id: 'mat-06', nama: 'Statistika & Analisis Data Diagram', deskripsi: 'Mean, median, modus, kuartil, interpretasi tabel dan grafik batang/lingkaran' },
    { id: 'mat-07', nama: 'Peluang Teoretik & Peluang Empirik', deskripsi: 'Ruang sampel, titik sampel, dan frekuensi harapan dalam simulasi' },
    { id: 'mat-08', nama: 'Pola Bilangan, Barisan & Pola Konfigurasi Objek', deskripsi: 'Barisan aritmetika dasar, barisan bertingkat, dan generalisasi rumus ke-n' }
  ],

  // =================== ILMU PENGETAHUAN ALAM (IPA) ===================
  'Ilmu Pengetahuan Alam (IPA)': [
    { id: 'ipa-01', nama: 'Hakikat Sains, Pengukuran & Metode Ilmiah', deskripsi: 'Besaran pokok, turunan, ketelitian alat ukur, dan variabel eksperimen' },
    { id: 'ipa-02', nama: 'Klasifikasi Makhluk Hidup & Interaksi Ekosistem', deskripsi: 'Rantai makanan, jaring-jaring, simbiosis, piramida ekologi, dan daur materi' },
    { id: 'ipa-03', nama: 'Zat, Sifat, Wujud & Perubahannya', deskripsi: 'Perubahan fisika, kimia, pemisahan campuran, asam-basa, dan indikator' },
    { id: 'ipa-04', nama: 'Energi, Suhu, Kalor & Dinamika Gerak Benda', deskripsi: 'Konversi suhu, perpindahan kalor, Hukum Newton I, II, III, dan GLB/GLBB' },
    { id: 'ipa-05', nama: 'Sistem Organ Manusia (Pencernaan, Pernapasan, Peredaran Darah)', deskripsi: 'Struktur jaringan, enzim, mekanisme pertukaran gas, dan kelainan organ' },
    { id: 'ipa-06', nama: 'Tekanan Zat (Padat, Cair, Gas) & Hukum Archimedes', deskripsi: 'Tekanan hidrostatis, bejana berhubungan, hukum Pascal, dan gaya apung' },
    { id: 'ipa-07', nama: 'Gelombang, Bunyi, Cahaya & Alat Optik', deskripsi: 'Frekuensi, cepat rambat, pembiasan cahaya, lensa cembung/cekung, dan mata' },
    { id: 'ipa-08', nama: 'Tata Surya, Struktur Bumi, Lapisan Atmosfer & Mitigasi Gempa', deskripsi: 'Rotasi/revolusi bumi, gerhana, lempeng tektonik, dan mitigasi bencana' }
  ],

  // =================== ILMU PENGETAHUAN SOSIAL (IPS) ===================
  'Ilmu Pengetahuan Sosial (IPS)': [
    { id: 'ips-01', nama: 'Kondisi Geografis & Keragaman Alam Indonesia', deskripsi: 'Letak astronomis/geologis, iklim tropis, flora-fauna Garis Wallace/Weber' },
    { id: 'ips-02', nama: 'Interaksi Sosial, Lembaga Sosial & Dinamika Penduduk', deskripsi: 'Bentuk asosiatif/disosiatif, piramida penduduk, urbanisasi, dan mobilitas' },
    { id: 'ips-03', nama: 'Aktivitas Ekonomi, Kelangkaan & Terbentuknya Pasar', deskripsi: 'Kebutuhan manusia, permintaan-penawaran, harga keseimbangan, dan distribusi' },
    { id: 'ips-04', nama: 'Masa Praaksara, Kerajaan Hindu-Buddha & Islam', deskripsi: 'Peninggalan artefak, jalur perdagangan maritim kuno, dan akulturasi budaya' },
    { id: 'ips-05', nama: 'Masa Penjajahan Bangsa Barat & Pergerakan Nasional', deskripsi: 'VOC, tanam paksa, politik etis, Budi Utomo, dan Sumpah Pemuda 1928' },
    { id: 'ips-06', nama: 'Kerjasama Kawasan Regional ASEAN & Globalisasi', deskripsi: 'Pilar kerjasama ASEAN ekonomi, politik, sosial-budaya dan tantangan era digital' },
    { id: 'ips-07', nama: 'Pemberdayaan Masyarakat & Ekonomi Maritim Indonesia', deskripsi: 'Potensi kelautan, agrikultur, ekonomi kreatif, dan pemerataan kesejahteraan' }
  ],

  // =================== BAHASA INGGRIS ===================
  'Bahasa Inggris': [
    { id: 'bing-01', nama: 'Descriptive Text (People, Animals, Famous Landmarks)', deskripsi: 'Identification, description characteristics, adjectives, and simple present' },
    { id: 'bing-02', nama: 'Recount Text (Personal Experience & Historical Events)', deskripsi: 'Orientation, events sequence, re-orientation, past tense, and conjunctions' },
    { id: 'bing-03', nama: 'Narrative Text (Fables, Folktales & Legends)', deskripsi: 'Complication, resolution, moral value, direct speech, and character traits' },
    { id: 'bing-04', nama: 'Procedure Text (Recipes, Manuals & Life Hacks)', deskripsi: 'Goal, materials, step-by-step imperative sentences, and adverbs of sequence' },
    { id: 'bing-05', nama: 'Notice, Announcement & Short Functional Texts', deskripsi: 'Short messages, public notices, cautions, greeting cards, and invitations' },
    { id: 'bing-06', nama: 'Transactional Dialogues (Agreement, Opinions & Intentions)', deskripsi: 'Expressing hope, wish, complimenting, making requests, and everyday spoken' }
  ],

  // =================== PENDIDIKAN PANCASILA (PPKn) ===================
  'Pendidikan Pancasila': [
    { id: 'ppkn-01', nama: 'Kelahiran, Perumusan & Penetapan Pancasila sebagai Dasar Negara', deskripsi: 'Sidang BPUPKI, Piagam Jakarta, Panitia Sembilan, dan komitmen para pendiri' },
    { id: 'ppkn-02', nama: 'Norma Sosial, Keadilan & Tata Hukum Nasional', deskripsi: 'Norma agama, kesusilaan, kesopanan, hukum, serta kesadaran hukum masyarakat' },
    { id: 'ppkn-03', nama: 'Keberagaman SARA & Bhinneka Tunggal Ika', deskripsi: 'Persatuan dalam keragaman suku, agama, ras, dan antargolongan' },
    { id: 'ppkn-04', nama: 'UUD NRI Tahun 1945 & Hak-Kewajiban Warga Negara', deskripsi: 'Hierarki perundang-undangan di Indonesia dan perlindungan hak asasi manusia' },
    { id: 'ppkn-05', nama: 'Semangat Sumpah Pemuda & Bela Negara Kesatuan RI', deskripsi: 'Wawasan kebangsaan, kedaulatan wilayah NKRI, dan peran pemuda' }
  ],

  // =================== PENDIDIKAN AGAMA ISLAM (PAI) ===================
  'Pendidikan Agama Islam dan Budi Pekerti': [
    { id: 'pai-01', nama: 'Al-Qur\'an & Hadis: Hukum Bacaan Tajwid dan Nilai Akhlak', deskripsi: 'Nun mati/tanwin, mim mati, mad, serta tafsir ayat toleransi dan etos belajar' },
    { id: 'pai-02', nama: 'Akidah & Rukun Iman (Iman kepada Kitab & Rasul Allah)', deskripsi: 'Meneladani sifat wajib/mustahil rasul dan mukjizat para nabi' },
    { id: 'pai-03', nama: 'Akhlak Terpuji (Jujur, Amanah, Menghargai Orang Tua & Guru)', deskripsi: 'Penerapan adab keseharian dan menjaga lisan di media sosial' },
    { id: 'pai-04', nama: 'Fikih Ibadah: Shalat Sunnah, Zakat, Puasa & Sujud Syukur', deskripsi: 'Ketentuan syarat rukun, hikmah pembersihan harta, dan tata cara sujud sahwi/tilawah' },
    { id: 'pai-05', nama: 'Sejarah Peradaban Islam: Khulafaur Rasyidin & Daulah Islamiah', deskripsi: 'Kepemimpinan Abu Bakar, Umar, Utsman, Ali dan perkembangan ilmu pengetahuan' }
  ]
};

export function getCbtTopicsForMapel(mapel: string): CbtTopicItem[] {
  if (!mapel) return [];
  // Cocokkan mapel dengan kunci kamus
  const key = Object.keys(CBT_CURRICULUM_TOPICS).find(k => 
    mapel.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(mapel.toLowerCase())
  );
  return key ? CBT_CURRICULUM_TOPICS[key] : [];
}
