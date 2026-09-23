import React, { useState, useMemo } from 'react';
import { ThemeMode } from '../types';
import {
  X,
  BookOpen,
  Search,
  Compass,
  CircleDot,
  Layers,
  GitCompare,
  CloudRain,
  Sparkles,
  Calendar,
  Info,
  Bookmark,
  FileDown,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  ScrollText,
  Sliders,
  History,
  GraduationCap,
  Globe2,
  Moon,
  TrendingUp,
  Landmark,
  Hash,
  Shield,
  Milestone,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tabId: string) => void;
  theme: ThemeMode;
}

type GuideTab = 'modules' | 'glossary' | 'workflow' | 'history';

interface GlossaryItem {
  termArabic: string;
  transliteration: string;
  modernTerm: string;
  category: 'calculation' | 'aspect' | 'position' | 'weather' | 'calendar';
  categoryLabel: string;
  simpleExplanation: string;
  technicalDetails: string;
  exampleInApp: string;
}

interface ModuleGuideItem {
  id: string;
  titleArabic: string;
  titleLatin: string;
  icon: React.ComponentType<{ className?: string }>;
  purpose: string;
  beginnerTips: string[];
  keyActions: string[];
}

const MODULES_GUIDE: ModuleGuideItem[] = [
  {
    id: 'astrolabe',
    titleArabic: 'فَلَكُ الأَسْطُرْلَابِ',
    titleLatin: 'Falak al-Asturlab (Simulasi Astrolab 2D)',
    icon: Compass,
    purpose: 'Merekonstruksi piringan astrolab kuno berbahan perunggu untuk memproyeksikan kubah langit secara geosentris (bumi sebagai pusat pandang pengamat).',
    beginnerTips: [
      'Gunakan tombol navigasi waktu (Hari, Jam, Menit) untuk melihat perputaran bintang secara langsung.',
      'Klik tombol Putar Otomatis (Play) untuk menyaksikan peredaran benda langit dalam format simulasi waktu nyata.',
      'Periksa kartu "Khadim as-Sa\'ah" di bawah piringan untuk mengetahui kawkab penguasa jam dan hari berjalan.',
    ],
    keyActions: ['Putar Waktu Simulasi', 'Identifikasi Titik Terbit (Tali\')', 'Periksa Jam Planetar'],
  },
  {
    id: 'orbits',
    titleArabic: 'مَدَارَاتُ الكَوَاكِبِ',
    titleLatin: 'Orbit D3 Dinamis (Helio & Geosentris)',
    icon: CircleDot,
    purpose: 'Visualisasi lintasan edar planet interaktif menggunakan pustaka D3.js dengan dukungan dua perspektif astronomis.',
    beginnerTips: [
      'Pilih mode "Heliosentris" untuk melihat tata surya dari sudut pandang Matahari sebagai pusat.',
      'Pilih mode "Geosentris" untuk melihat fenomena lintasan unik mirip bunga (Epicycle) sebagaimana diamati para astronom abad pertengahan.',
      'Atur penggeser Kecepatan Simulasi dan saksikan jejak ekliptika di layar.',
    ],
    keyActions: ['Beralih Helio / Geo', 'Atur Kecepatan Orbit', 'Sorot Planet Tertentu'],
  },
  {
    id: 'starmap',
    titleArabic: 'خَرِيطَةُ السَّمَاءِ وَمَنَازِلُ القَمَرِ',
    titleLatin: 'Peta Langit D3 & 28 Manzil (Star Map)',
    icon: Globe2,
    purpose: 'Memproyeksikan kubah langit lokal (Alt-Azimuth / Al-Muqantarāt) dari 28 Manzil Bulan, rasi zodiak, dan bintang navigasi Arab kuno sesuai koordinat geografis pengamat.',
    beginnerTips: [
      'Gunakan menu "Lokasi Observatorium" untuk memilih kota sejarah (Baghdad, Ujjain/Arin, Rayy, Damaskus, Cordoba) atau klik "GPS Saya" untuk sinkronisasi posisi terkini Anda.',
      'Klik salah satu bintang tetap (seperti Sirius, Canopus, Aldebaran) atau 28 Manzil untuk menelaah ketinggian (Irtifa\') dan arah mata angin (Samt).',
      'Manzil singgah Bulan saat ini ditandai dengan lingkaran emas bercahaya (pulsing halo).',
      'Gunakan kontrol mouse/sentuh untuk memperbesar (zoom) dan menggeser (pan) kubah langit D3.',
    ],
    keyActions: ['Ganti Koordinat / Deteksi GPS', 'Periksa 28 Manzil Bulan', 'Analisis Bintang Navigasi Arab', 'Catat ke Anotasi Riset'],
  },
  {
    id: 'manzil',
    titleArabic: 'حَاسِبَةُ مَنَازِلِ القَمَرِ',
    titleLatin: 'Manzil Calculator & Sifat 28 Manzil',
    icon: Moon,
    purpose: 'Menghitung sifat-sifat khusus (Muhibbah/kasih sayang, Tabi\'at/unsur) dari 28 Manzil berdasarkan posisi Bulan terkini serta menampilkan saran aktivitas harian (Al-Ikhtiyarat) menurut naskah klasik.',
    beginnerTips: [
      'Periksa "DARAJAT AL-MUHIBBAH" (0-100) yang mengukur tingkat keserasian relasi dan diplomasi saat ini, disesuaikan dengan aspek planet terhadap Bulan.',
      'Telaah daftar "Aktivitas Sangat Dianjurkan (Al-Mustahabb)" dan "Aktivitas yang Harus Dihindari (Al-Makruh)".',
      'Gunakan tombol Simulasi Waktu (+12 Jam / +24 Jam) untuk melihat kapan Bulan berpindah ke Manzil berikutnya.',
      'Buka tab "Lingkaran Zodiak 360°" untuk visualisasi grafis interaktif Falak ad-Dawa\'ir yang memproyeksikan 28 Manzil, posisi Bulan riil, bintang tetap konstelasi Arab, dan garis aspek.',
      'Buka tab "Histori Tren 30 Hari" untuk menelaah grafik fluktuasi saran aktivitas harian selama 30 hari terakhir, frekuensi tindakan paling sering dianjurkan, matriks kalender, serta evaluasi 7 ranah hajat kehidupan.',
      'Buka tab "Katalog 28 Manzil" atau "Pencari Hari Baik" untuk mencari Manzil terbaik sesuai niat (Pernikahan, Bisnis, Perjalanan, Properti, Kesehatan).',
    ],
    keyActions: ['Periksa Manzil Bulan Aktif', 'Buka Lingkaran Zodiak 360°', 'Grafik Histori 30 Hari', 'Filter 28 Manzil Berdasarkan Hajat', 'Cari Hari Baik (Ikhtiyarat)', 'Simpan ke Anotasi Riset'],
  },
  {
    id: 'aspects',
    titleArabic: 'أَشْكَالُ الاتِّصَالَاتِ',
    titleLatin: 'Tabel Aspek & Matriks Sudut (Al-Ittisalat)',
    icon: Layers,
    purpose: 'Menghitung hubungan geometris antar-kawkab dalam satu bagan waktu berdasarkan kaidah lingkaran cahaya (Jurm al-Kawkab).',
    beginnerTips: [
      'Periksa simbol aspek: ☌ Konjungsi (0°), ⚹ Sekstil (60°), □ Kuadrat (90°), △ Trina (120°), ☍ Oposisi (180°).',
      'Aspek warna hijau (Sa\'d) melambangkan keharmonisan; warna merah (Nahs) melambangkan tegangan energi.',
      'Label "Partil" menandakan aspek sudut sangat eksak dan presisi (deviasi ≤ 1.0°).',
    ],
    keyActions: ['Filter Sifat Aspek (Sa\'d / Nahs)', 'Telaah Matriks Silang', 'Baca Hikmah Klasik'],
  },
  {
    id: 'transit',
    titleArabic: 'حَاسِبَةُ العُبُورِ وَالتَّحَاوِيلِ',
    titleLatin: 'Kalkulator Transit (Al-\'Ubur & Tahawil)',
    icon: TrendingUp,
    purpose: 'Menghitung pergerakan planet di langit saat ini terhadap kedudukan planet pada naskah kelahiran (natal) pengguna, serta menyajikan tabel aspek dinamis dan matriks silang.',
    beginnerTips: [
      'Gunakan menu "Kelahiran Saya" untuk mengisi tanggal, jam, dan kota kelahiran Anda sendiri (tersimpan di peramban), atau pilih tokoh klasik (Al-Biruni, Al-Khwarizmi, Abu Ma\'shar).',
      'Periksa "Iklim Transit Saat Ini" untuk mengetahui dominasi aspek berkah (Sa\'d) atau ujian (Nahs).',
      'Gunakan tombol navigasi waktu (-1 Hari, +1 Hari, -1 Bulan, +1 Tahun, atau "Hari Ini") untuk mensimulasikan transit di masa depan atau lampau.',
      'Beralih antara "Tabel Aspek" dan "Matriks Transit" untuk menelaah interaksi spesifik.',
      'Klik tombol "Telaah" pada baris mana pun untuk membaca dampak astrologi klasik dan nasihat falakiyah praktis.',
    ],
    keyActions: ['Konfigurasi Tanggal Natal', 'Simulasi Waktu Transit', 'Filter Aspek Presisi (Daqiqi)', 'Matriks Transit 9x9', 'Catat ke Jurnal Riset'],
  },
  {
    id: 'progressions',
    titleArabic: 'التَّسْيِيرُ الثَّانَوِيُّ (يَوْمٌ لِكُلِّ سَنَةٍ)',
    titleLatin: 'Secondary Progressions (Progresi 50 Tahun)',
    icon: Milestone,
    purpose: 'Menghitung evolusi karakter dan kedewasaan batiniah selama kurun waktu 50 tahun ke depan berdasarkan Zij as-Sindhind (1 hari peredaran falak setelah lahir setara dengan 1 tahun usia kehidupan).',
    beginnerTips: [
      'Gunakan penggeser usia (0 hingga 50 tahun) atau tombol "Jalankan Simulasi" untuk menyaksikan pergerakan tahunan secara otomatis.',
      'Periksa 8 Fase Bulan Progresi (Adwar al-Qamar) untuk memahami babak 30-tahunan jiwa (penanaman benih, pembuktian aksi, hingga puncak pencerahan dan hening).',
      'Pelajari tahapan psikologi Sufi (Maratib an-Nafs): Nafs al-Ammarah, Nafs al-Lawwamah, hingga Nafs al-Mulhamah.',
      'Buka tab "Matriks Kronologi 50 Tahun" untuk melihat titik balik penting (Ingress rasi, New Moon, Full Moon) dalam kurun setengah abad.',
      'Pilih tokoh inspiratif (Ibnu Sina, Al-Biruni, Sultan Al-Fatih, Gus Dur, Habibie, Kartini) untuk menelusuri korelasi falak progresi dengan fakta sejarah biografi mereka.',
    ],
    keyActions: ['Geser Usia 0-50 Tahun', 'Jalankan Simulasi Waktu', 'Telaah Fase Bulan Progresi', 'Matriks Kronologi 50 Th', 'Catat ke Jurnal Riset'],
  },
  {
    id: 'synastry',
    titleArabic: 'مَصْفُوفَةُ التَّوَافُقِ',
    titleLatin: 'Synastry Matrix (Komparasi Dua Tarikh)',
    icon: GitCompare,
    purpose: 'Membandingkan posisi kawkab antara dua tanggal sejarah yang berbeda guna meneliti keselarasan aspek (Mizan at-Tawafuq).',
    beginnerTips: [
      'Gunakan pilihan Preset Sejarah (misal: Baghdad 145 H vs Al-Khwarizmi 215 H) atau masukkan tanggal kustom Anda sendiri.',
      'Lihat Mizan at-Tawafuq (0 - 100%) dan empat pilar keserasian: Mawaddah (Rasa), Akal (Wacana), Himmah (Aksi), dan Thabat (Komitmen).',
      'Klik sel matriks 9x9 untuk menelaah interaksi spesifik planet Tanggal A terhadap planet Tanggal B.',
    ],
    keyActions: ['Pilih Preset Tarikh Komparatif', 'Tukar Data A ⇄ B', 'Simpan ke Anotasi Riset'],
  },
  {
    id: 'mawlayin',
    titleArabic: 'أَحْكَامُ المَوْلَيَيْنِ وَالكَاكِبِ العُلْوِيَّة',
    titleLatin: 'Ahkam al-Mawlayin (Pemerintahan & Iklim Sosial)',
    icon: Landmark,
    purpose: 'Interpretasi astrologi kenegaraan klasik (Ahkam ad-Duwal wal-Muluk) berbasis Zij as-Sindhind & Abu Ma\'shar mengenai stabilitas rezim kekuasaan, keadilan hukum, dan iklim sosial berdasarkan 3 planet Superior (Saturnus, Yupiter, Mars).',
    beginnerTips: [
      'Amati Tri-Gauge Indikator Kenegaraan: Stabilitas Negara, Kesejahteraan Sosial, dan Ketahanan Keamanan.',
      'Gunakan menu preset sejarah (misal: Era Emas Bayt al-Hikmah 813 M, Reformasi Nizam al-Mulk 1075 M, Penyatuan Syam Shalahuddin 1182 M, atau Konjungsi Agung 2020).',
      'Pelajari kedudukan martabat masing-masing planet superior (Bayt, Sharaf, Wabal, Hubut) dan status gerak retrograde (Raji\').',
      'Telaah Siklus Konjungsi Agung (Qiran al-Mawlayayn) dan pergeseran unsur triplisitas peradaban.',
      'Buka ramalan sektoral untuk membaca kebijakan tata negara, ekonomi rakyat, dan pertahanan.',
    ],
    keyActions: ['Simulasi Era Kenegaraan', 'Analisis Martabat Planet Superior', 'Telaah Aspek Antar-Mawlayayn', 'Simpan Analisis ke Jurnal Riset'],
  },
  {
    id: 'weather',
    titleArabic: 'الأَنْوَاءُ وَالأَحْوَالُ الجَوِّيَّة',
    titleLatin: 'Al-Anwa\' (Prediksi Cuaca Musiman & Manzil)',
    icon: CloudRain,
    purpose: 'Meramalkan fluktuasi iklim 4 musim surya (Musim Semi, Panas, Gugur, Dingin), derajat suhu, curah hujan, arah angin, dan pedoman pertanian.',
    beginnerTips: [
      'Kenali dua tuan penguasa: Mawla al-Fasl (pengatur suhu dasar ingress) dan Mawla al-Anwa\' (pengatur angin & curah hujan).',
      'Periksa indikator "Fath al-Bab" untuk mengetahui apakah pintu uap air langit sedang terbuka atau tertahan.',
      'Baca kolom "Tuntunan Agrikultur" untuk mengetahui rekomendasi penanaman benih dan pengolahan lahan.',
    ],
    keyActions: ['Pilih Tahun Analisis', 'Periksa 4 Gerbang Musim', 'Baca Nasihat Filahah'],
  },
  {
    id: 'jumal',
    titleArabic: 'حِسَابُ الجُمَّلِ وَالفَالُ الفَلَكِيّ وَالطَّبَائِع',
    titleLatin: 'Hisab Jumal & Petung Weton Pasaran',
    icon: Hash,
    purpose: 'Analisis numerologi Abjad Hijaiyyah (Hisab Jumal Kabir/Saghir), empat unsur watak alamiah (Al-Arkan al-Arba\'ah), weton Sapta Wara & Panca Wara Jawa, kawkab pelindung, rasi batin, serta petung rezeki dan karakter berdasarkan nama seseorang.',
    beginnerTips: [
      'Ketik nama lengkap seseorang dalam huruf Latin atau lafaz Arab/Pegon langsung.',
      'Gunakan papan huruf Hijaiyyah/Pegon virtual untuk menyisipkan huruf berharakat atau huruf khas Nusantara (چ, ڤ, ڠ, ݢ, ڽ).',
      'Pilih hari (Sapta Wara) dan pasaran (Panca Wara) kelahiran, atau klik "Sinkronkan Weton" dengan kalender aktif.',
      'Amati komposisi persentase empat unsur: Api (Nariyyah), Tanah (Turabiyyah), Udara (Hawa\'iyyah), dan Air (Ma\'iyyah).',
      'Pelajari kategori Pancasuda (Sri, Rejeki, Gedhong, Loro, Pati) dan wirid Asmaul Husna yang bernilai resonan dengan nama.',
    ],
    keyActions: ['Pilih Preset Tokoh Inspirator', 'Eksplorasi Transliterasi Nama', 'Analisis Keseimbangan Unsur', 'Simpan ke Jurnal Riset'],
  },
  {
    id: 'wafaq',
    titleArabic: 'طِلَسْمُ وَأَوْفَاقُ المَنَازِلِ الفَلَكِيَّة',
    titleLatin: 'Amulet & Wafaq Generator 28 Manzil',
    icon: Shield,
    purpose: 'Perancang visual jimat rajah dan bujur sangkar magis (Al-Awfaq) berdasarkan 28 Manzil Bulan klasik menurut risalah Syams al-Ma\'arif al-Kubra (Syaikh Ahmad al-Buni) dan Kitab al-Awfaq (Imam Al-Ghazali), lengkap dengan fitur cetak dan ekspor gambar.',
    beginnerTips: [
      'Klik tombol "Sinkronkan" untuk merancang jimat berdasarkan Manzil Bulan yang sedang aktif di langit saat ini.',
      'Pilih salah satu dari 5 tujuan hajat (Perlindungan, Kelancaran Rezeki, Kasih Sayang, Kecerdasan & Kesembuhan, atau Kewibawaan).',
      'Ketik nama Anda untuk memadukan hisab Jumal nama dengan bobot Manzil menjadi Mizan Wafaq yang seimbang matematis.',
      'Pilih ukuran grid Wafaq 3x3 (Muthallath) atau 4x4 (Murabba\') serta gaya aksara (Arab Timur, Abjad Hijaiyyah, atau Latin).',
      'Pilih tema estetika manuskrip klasik, lalu gunakan tombol "Unduh Gambar PNG" atau "Cetak" untuk menghasilkan gambar beresolusi tinggi.',
    ],
    keyActions: ['Sinkronkan Manzil Bulan Aktif', 'Pilih Niat Hajat Spiritual', 'Personalisasi Hisab Nama', 'Unduh PNG 2400px / Cetak Jimat'],
  },
  {
    id: 'ephemeris',
    titleArabic: 'جَدْوَلُ الكَوَاكِبِ',
    titleLatin: 'Jadwal Ephemeris Posisi Planet',
    icon: Sparkles,
    purpose: 'Tabel numerik ilmiah yang merinci bujur astronomis, koordinat zodiak, martabat planet, dan kecepatan harian.',
    beginnerTips: [
      'Perhatikan kolom "Al-Wasat" (Bujur Rata-rata) vs "Al-Mu\'addal" (Bujur Sejati setelah koreksi persamaan pusat Ta\'dil).',
      'Tanda "Ruju\'" (Retrograd) menunjukkan planet tampak bergerak mundur dari bumi.',
      'Tanda "Ihtiraq" (Combust) menandakan kawkab berada terlalu dekat dengan cahaya terik Matahari (dalam batas ~8.5°).',
    ],
    keyActions: ['Cek Derajat Zodiak', 'Periksa Martabat Esensial', 'Catat Data ke Anotasi'],
  },
  {
    id: 'calendar',
    titleArabic: 'تَحْوِيلُ التَّوَارِيخِ',
    titleLatin: 'Konversi Kalender Lintas Era',
    icon: Calendar,
    purpose: 'Sinkronisasi instan antara 6 sistem penanggalan kuno: Hijriah, Julian/Masehi, Yazdajird Persia, Seleukid/Iskandar, Nabonassar, dan Kaliyuga Sindhind.',
    beginnerTips: [
      'Masukkan tanggal dalam kalender mana pun, dan sistem akan mengonversi semua era secara otomatis.',
      'Julian Day Number (JDN) adalah bilangan skalar kontinu standar yang digunakan astronom kuno dan modern.',
      'Klik tombol "Terapkan Tanggal Ini" untuk menyinkronkan seluruh tampilan aplikasi ke tanggal tersebut.',
    ],
    keyActions: ['Konversi Lintas Kalender', 'Cek Tahun Kabisa (Leap Year)', 'Terapkan Tanggal ke Aplikasi'],
  },
  {
    id: 'interpretation',
    titleArabic: 'أَحْكَامُ النُّجُومِ',
    titleLatin: 'Tafsir Astrologi 12 Rumah Langit',
    icon: Info,
    purpose: 'Analisis kedudukan kawkab pada 12 Rumah Langit (Buyut al-Falak) serta pengaruhnya terhadap karakter, takdir waktu, dan urusan duniawi.',
    beginnerTips: [
      'Rumah I (Thali\' / Diri & Jiwa), Rumah IV (Asas & Akhir), Rumah VII (Mitra & Hubungan), Rumah X (Kedudukan & Prestise).',
      'Pelajari dominasi 4 unsur alam: Api (Nar), Tanah (Turab), Udara (Hawa), dan Air (Ma).',
      'Baca sintesis naratif kitab kuno untuk memahami tema sentral bagan waktu yang sedang diperiksa.',
    ],
    keyActions: ['Periksa 12 Rumah Langit', 'Analisis Dominasi 4 Unsur', 'Baca Horoskop Klasik'],
  },
  {
    id: 'manuscripts',
    titleArabic: 'خِزَانَةُ المَخْطُوطَاتِ',
    titleLatin: 'Arsip & API Naskah Kuno',
    icon: BookOpen,
    purpose: 'Koleksi digital manuskrip falak otentik dari perpustakaan manuskrip dunia (Bodleian Oxford, Suleymaniye Istanbul, BnF Paris) dengan integrasi data API.',
    beginnerTips: [
      'Pilih naskah untuk membaca nomor katalog, asal kota penyalinan, abad penulisan, dan ringkasan isi risalah.',
      'Gunakan tautan digitalisasi untuk melihat pindaian lembaran manuskrip asli berhuruf khat Arab kuno.',
    ],
    keyActions: ['Filter Naskah Berdasarkan Abad', 'Buka Lembaran Digital', 'Salin Referensi Akademis'],
  },
  {
    id: 'search',
    titleArabic: 'الفِهْرِسُ الدَّلَالِيُّ',
    titleLatin: 'Indeks Semantik Naskah',
    icon: Search,
    purpose: 'Mesin pencari leksikal cerdas untuk menemukan bait syair Qasida, pasal Zij as-Sindhind, dan terminologi falak dengan rujukan bab.',
    beginnerTips: [
      'Ketik kata kunci dalam bahasa Indonesia (misal: "hujan", "retrograd", "martabat") atau bahasa Arab (misal: "الرجوع", "المطر").',
      'Klik hasil pencarian untuk melihat kutipan teks asli dan penjelasannya.',
    ],
    keyActions: ['Cari Istilah / Konsep', 'Filter Kategori Subjek', 'Buka Bab Naskah Terkait'],
  },
  {
    id: 'annotations',
    titleArabic: 'التَّعْلِيقَاتُ البَحْثِيَّةُ',
    titleLatin: 'Anotasi Riset Pribadi',
    icon: Bookmark,
    purpose: 'Ruang kerja peneliti untuk menyimpan catatan, temuan hisab, dan hipotesis riset yang tersimpan aman di peramban lokal.',
    beginnerTips: [
      'Gunakan tombol "Catat Anotasi" di modul apa pun untuk langsung mendokumentasikan temuan Anda.',
      'Kelola status riset: Draf, Sedang Diteliti, Terverifikasi, atau Arsip.',
      'Semua catatan tersimpan secara lokal dan otomatis disertakan dalam berkas Ekspor PDF.',
    ],
    keyActions: ['Tulis Catatan Baru', 'Atur Tag & Status', 'Cari Catatan Riset'],
  },
];

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    termArabic: 'الوَسَطُ',
    transliteration: 'Al-Wasat',
    modernTerm: 'Bujur Rata-rata (Mean Longitude)',
    category: 'calculation',
    categoryLabel: 'Dasar Hisab',
    simpleExplanation: 'Posisi planet jika diasumsikan bergerak dalam lintasan lingkaran sempurna dengan kecepatan tetap tanpa hambatan.',
    technicalDetails: 'Dihitung dari hari epok dasar dikalikan laju harian rata-rata planet (al-Harakah al-Yaumiyyah).',
    exampleInApp: 'Dapat dilihat di kolom "Bujur Rata-rata" pada modul Ephemeris.',
  },
  {
    termArabic: 'المَرْكَزُ المُعَدَّلُ',
    transliteration: 'Al-Markaz al-Mu\'addal',
    modernTerm: 'Bujur Sejati (True Longitude)',
    category: 'calculation',
    categoryLabel: 'Dasar Hisab',
    simpleExplanation: 'Posisi riil planet di langit zodiak setelah dikoreksi dengan penyimpangan anomali orbit elips atau episiklus.',
    technicalDetails: 'Hasil dari Al-Wasat ditambah atau dikurangi nilai Ta\'dil (persamaan pusat) berdasarkan formula trigonometri busur sinus Sindhind.',
    exampleInApp: 'Menentukan letak derajat zodiak planet di piringan Astrolab dan diagram orbit.',
  },
  {
    termArabic: 'التَّعْدِيلُ',
    transliteration: 'At-Ta\'dil',
    modernTerm: 'Persamaan Koreksi (Equation of Center)',
    category: 'calculation',
    categoryLabel: 'Dasar Hisab',
    simpleExplanation: 'Nilai angka penyesuaian (plus atau minus) untuk mengubah posisi rata-rata menjadi posisi pengamatan sesungguhnya.',
    technicalDetails: 'Diperoleh dari tabel Ta\'dil Zij as-Sindhind yang berakar dari tabel Jya (kardaja sinus 150 menit) naskah India kuno.',
    exampleInApp: 'Tercantum pada rincian perhitungan planet di modul Ephemeris.',
  },
  {
    termArabic: 'الأَوْجُ وَالحَضِيضُ',
    transliteration: 'Al-Awj & Al-Hadhidh',
    modernTerm: 'Apogee (Terjauh) & Perigee (Terdekat)',
    category: 'position',
    categoryLabel: 'Kedudukan Planet',
    simpleExplanation: 'Al-Awj adalah titik ketika planet berada pada jarak terjauh dari bumi (kecepatan tampak paling lambat); Al-Hadhidh adalah titik terdekat dengan bumi (kecepatan tampak paling cepat).',
    technicalDetails: 'Titik bujur Al-Awj Matahari pada Zij as-Sindhind dipatok pada 77° 50\' (buruj Gemini/Jawza\').',
    exampleInApp: 'Mempengaruhi besaran Ta\'dil dan laju gerak harian planet.',
  },
  {
    termArabic: 'جُرْمُ الكَوْكَبِ',
    transliteration: 'Jurm al-Kawkab',
    modernTerm: 'Lingkaran Cahaya / Batas Orb (Orb of Light)',
    category: 'aspect',
    categoryLabel: 'Aspek & Sudut',
    simpleExplanation: 'Radius pendaran cahaya magis di sekeliling kawkab. Dua planet dianggap berinteraksi (beraspek) jika lingkaran cahaya mereka bersentuhan.',
    technicalDetails: 'Standar Sindhind: Matahari 15°, Bulan 12°, Saturnus 9°, Yupiter 9°, Mars 8°, Venus 7°, Merkurius 7°. Batas toleransi adalah (Jurm A + Jurm B) / 2.',
    exampleInApp: 'Dasar perhitungan toleransi orb pada Tabel Aspek dan Synastry Matrix.',
  },
  {
    termArabic: 'الطَّالِعُ',
    transliteration: 'Ath-Thali\'',
    modernTerm: 'Ascendant (Titik Terbit Timur)',
    category: 'position',
    categoryLabel: 'Kedudukan Planet',
    simpleExplanation: 'Derajat rasi bintang zodiak yang persis sedang menyembul terbit di ufuk timur pada detik waktu yang diamati.',
    technicalDetails: 'Menjadi patokan awal Rumah I (Bait al-Awwal) yang mengendalikan seluruh orientasi kubah astrolab dan horoskop.',
    exampleInApp: 'Ditampilkan menonjol di sudut kiri atas piringan Astrolab dan kartu waktu.',
  },
  {
    termArabic: 'الاِتِّصَالُ وَالاِنْفِصَالُ',
    transliteration: 'Al-Ittisal & Al-Infisal',
    modernTerm: 'Applying (Mendekat) & Separating (Menjauh)',
    category: 'aspect',
    categoryLabel: 'Aspek & Sudut',
    simpleExplanation: 'Ittisal terjadi saat planet yang lebih cepat sedang bergerak menyempurnakan sudut aspek; Infisal terjadi saat sudut telah lewat dan sedang menjauh.',
    technicalDetails: 'Aspek Ittisal melambangkan perkara yang sedang menuju perwujudan; Infisal melambangkan perkara yang telah berlalu efek puncaknya.',
    exampleInApp: 'Dapat dilihat pada status dinamika aspek di modul Tabel Aspek.',
  },
  {
    termArabic: 'المَوْلَيَانِ',
    transliteration: 'Al-Mawlayān',
    modernTerm: 'Dua Penguasa Musim & Iklim',
    category: 'weather',
    categoryLabel: 'Cuaca Musiman',
    simpleExplanation: 'Dua planet pengendali cuaca: Mawla al-Fasl (penguasa suhu dasar titik balik surya) dan Mawla al-Anwa\' (penguasa arah angin dan uap hujan).',
    technicalDetails: 'Berdasarkan risalah Al-Kindi fi al-Anwa\' dan sistem ingress Zīj as-Sindhind saat Matahari di 0° Aries, Cancer, Libra, dan Capricorn.',
    exampleInApp: 'Menjadi inti telaah modul Ahkam al-Mawlayin (Cuaca Musiman).',
  },
  {
    termArabic: 'فَتْحُ البَابِ',
    transliteration: 'Fat-h al-Bab',
    modernTerm: 'Pembukaan Pintu Hujan Langit',
    category: 'weather',
    categoryLabel: 'Cuaca Musiman',
    simpleExplanation: 'Fenomena meteorologis kuno ketika planet berelemen basah (Venus/Merkurius) berkonfigurasi dengan Bulan di buruj berair, memicu hujan lebat.',
    technicalDetails: 'Konfigurasi aspek kawkab basah terhadap kawkab dingin (Saturnus) membuka gerbang kondensasi uap udara langit.',
    exampleInApp: 'Status lencana "Maftuh / Insidad" pada modul Ahkam al-Mawlayin.',
  },
  {
    termArabic: 'الجَوْزَهَرُ (الرَّأْسُ وَالذَّنَبُ)',
    transliteration: 'Al-Jawzahar (Ar-Ra\'s & Adh-Dhanab)',
    modernTerm: 'Simpul Orbit Bulan / Rahu & Ketu',
    category: 'position',
    categoryLabel: 'Kedudukan Planet',
    simpleExplanation: 'Dua titik potong lintasan Bulan dengan lintasan Matahari (ekliptika). Tempat terjadinya gerhana Matahari dan gerhana Bulan.',
    technicalDetails: 'Ar-Ra\'s (Kepala Naga / Simpul Naik) memiliki sifat keberuntungan bertambah; Adh-Dhanab (Ekor Naga / Simpul Turun) bersifat melepaskan/mengurangi.',
    exampleInApp: 'Dihitung koordinat presisinya di Astrolab, Ephemeris, dan Orbit D3.',
  },
  {
    termArabic: 'الرُّجُوعُ وَالاِسْتِقَامَةُ',
    transliteration: 'Ar-Ruju\' & Al-Istiqamah',
    modernTerm: 'Gerak Retrograd & Direct',
    category: 'position',
    categoryLabel: 'Kedudukan Planet',
    simpleExplanation: 'Ruju\' adalah ilusi optik geosentris di mana planet seolah tampak melambat, berhenti (Iqamah), lalu mundur beberapa waktu sebelum maju kembali.',
    technicalDetails: 'Terjadi saat bumi menyalip planet luar (Mars, Yupiter, Saturnus) atau saat planet dalam (Merkurius, Venus) menyalip bumi.',
    exampleInApp: 'Ditandai dengan lencana merah "Ruju\'" pada tabel Ephemeris.',
  },
  {
    termArabic: 'الاِحْتِرَاقُ',
    transliteration: 'Al-Ihtiraq',
    modernTerm: 'Combustion (Terbakar Silau Matahari)',
    category: 'position',
    categoryLabel: 'Kedudukan Planet',
    simpleExplanation: 'Kondisi saat planet berada terlalu dekat dengan Matahari (dalam jarak ~8.5°), sehingga cahayanya lenyap tersilaukan sinar surya.',
    technicalDetails: 'Secara astrologis dianggap melemahkan manifestasi fisik planet tersebut karena energinya terserap oleh Matahari.',
    exampleInApp: 'Kolom status khusus pada tabel Ephemeris.',
  },
  {
    termArabic: 'مَنَازِلُ القَمَرِ',
    transliteration: 'Manāzil al-Qamar',
    modernTerm: '28 Rumah Persinggahan Bulan (Lunar Mansions)',
    category: 'weather',
    categoryLabel: 'Cuaca & Waktu',
    simpleExplanation: '28 kelompok bintang di sepanjang lingkaran zodiak yang disinggahi Bulan setiap malam (masing-masing selebar ~12° 51\').',
    technicalDetails: 'Menjadi basis sistem Anwa\' bangsa Arab kuno untuk memprediksi angin musiman, cuaca, dan pergantian masa.',
    exampleInApp: 'Tercantum di samping posisi Bulan di modul Astrolab, Peta Langit D3, Manzil Calculator, dan Cuaca Musiman.',
  },
  {
    termArabic: 'المُقَنْطَرَاتُ وَدَوَائِرُ السَّمْتِ',
    transliteration: 'Al-Muqanṭarāt & Dawā\'ir as-Samt',
    modernTerm: 'Almucantars (Lingkaran Ketinggian) & Lingkaran Azimuth',
    category: 'position',
    categoryLabel: 'Kedudukan Planet',
    simpleExplanation: 'Garis koordinat lengkung pada kubah langit lokal: Almucantar mengukur sudut elevasi di atas ufuk (0° sampai 90° ke Zenith), sedangkan Dawā\'ir as-Samt mengukur arah kompas sekeliling ufuk.',
    technicalDetails: 'Merupakan penemuan agung para insinyur falak peradaban Islam untuk mengukir lempeng safihah astrolab dan peta bintang lokal.',
    exampleInApp: 'Garis konsentris dan radial pada modul Peta Langit (Star Map) dan Astrolab.',
  },
  {
    termArabic: 'المَوَدَّةُ وَالمُحِبَّةُ فِي المَنَازِلِ',
    transliteration: 'Al-Mawaddah & Al-Muhibbah',
    modernTerm: 'Afinitas Kerukunan, Kasih Sayang & Keselarasan Sosial',
    category: 'aspect',
    categoryLabel: 'Aspek & Sudut',
    simpleExplanation: 'Pengaruh halus manzil perbintangan terhadap kelembutan hati manusia, daya tarik asmara, kemudahan diplomasi, dan rekonsiliasi sengketa.',
    technicalDetails: 'Manzil seperti Sa\'d as-Su\'ud (#24), Ath-Thurayya (#3), Al-Han\'ah (#6), dan Al-\'Awwa\' (#13) memiliki derajat muhibbah tertinggi; sedangkan Ad-Dabaran (#4) dan Al-Qalb (#18) menuntut kehati-hatian ekstra.',
    exampleInApp: 'Indikator "Darajat al-Muhibbah" (0-100) pada modul Manzil Calculator.',
  },
  {
    termArabic: 'الاِخْتِيَارَاتُ الفَلَكِيَّةُ',
    transliteration: 'Al-Ikhtiyārāt al-Falakiyyah',
    modernTerm: 'Pemilihan Waktu / Hari Baik Klasik (Electional Falak)',
    category: 'weather',
    categoryLabel: 'Cuaca & Waktu',
    simpleExplanation: 'Cabang ilmu falak aplikatif untuk menentukan waktu terbaik mengawali suatu hajat (pernikahan, perniagaan, perjalanan, atau pembangunan) dengan menyelaraskan posisi Bulan dan planet penguasa.',
    technicalDetails: 'Dirumuskan secara rinci dalam naskah Qasida fi \'Ilm an-Nujum, Kitab at-Tafhim Al-Biruni, dan Ghayat al-Hakim.',
    exampleInApp: 'Katalog Pencari Hari Baik (Al-Ikhtiyarat) pada modul Manzil Calculator.',
  },
];

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  theme,
}) => {
  if (!isOpen) return null;

  const isNight = theme === 'night';
  const [activeTab, setActiveTab] = useState<GuideTab>('modules');
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('all');

  // Filtered glossary items
  const filteredGlossary = useMemo(() => {
    return GLOSSARY_ITEMS.filter((item) => {
      if (glossaryCategory !== 'all' && item.category !== glossaryCategory) {
        return false;
      }
      if (glossarySearch.trim()) {
        const q = glossarySearch.toLowerCase();
        return (
          item.termArabic.includes(q) ||
          item.transliteration.toLowerCase().includes(q) ||
          item.modernTerm.toLowerCase().includes(q) ||
          item.simpleExplanation.toLowerCase().includes(q) ||
          item.technicalDetails.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [glossarySearch, glossaryCategory]);

  return (
    <div
      id="user-guide-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="user-guide-modal-container"
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isNight
            ? 'bg-[#101524] border-[#293d61] text-[#e8ded0]'
            : 'bg-[#faf6ee] border-[#d8cca8] text-[#2c241c]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-current/10 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider bg-[#c59a43]/20 text-[#c59a43] border border-[#c59a43]/40">
                دَلِيلُ المُسْتَخْدِمِ وَمُصْطَلَحَاتُ الفَلَكِ
              </span>
              <span className="text-xs opacity-60 font-serif hidden sm:inline">
                Pusat Edukasi & Pengetahuan Riset
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#c59a43]">
              Panduan Pengguna & Glosarium Falak Zij as-Sindhind
            </h2>
            <p className="text-xs opacity-75 font-serif max-w-2xl leading-relaxed">
              Panduan interaktif cara bernavigasi di setiap modul aplikasi dan kamus terminologi astronomi abad pertengahan agar riset naskah kuno mudah dipahami oleh peneliti dan masyarakat awam.
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isNight
                ? 'bg-[#182338] hover:bg-[#22314a] border-[#283b5c] text-slate-300'
                : 'bg-[#ede5d5] hover:bg-[#e4dac6] border-[#dacdb2] text-slate-700'
            }`}
            title="Tutup Panduan Pengguna"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-5 py-2.5 border-b border-current/10 overflow-x-auto no-scrollbar text-xs shrink-0 bg-current/5">
          {[
            { id: 'modules', label: 'خريطة الوحدات', sub: 'Navigasi Modul (11)', icon: Sliders },
            { id: 'glossary', label: 'معجم المصطلحات', sub: 'Glosarium Istilah A-Z', icon: BookOpen },
            { id: 'workflow', label: 'مسار البحث', sub: 'Alur Riset Cepat', icon: Lightbulb },
            { id: 'history', label: 'عن السندhind', sub: 'Sejarah Zij as-Sindhind', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GuideTab)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-serif transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#c59a43] text-black font-bold shadow-sm'
                    : 'hover:bg-current/10 opacity-75'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: MODULES NAVIGATION GUIDE */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-current/10">
                <span className="font-serif font-bold text-sm text-[#c59a43]">
                  Daftar & Penjelasan Seluruh Modul Aplikasi (Klik untuk langsung menuju modul):
                </span>
                <span className="text-[11px] font-mono opacity-60">11 Modul Terintegrasi</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {MODULES_GUIDE.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                        isNight
                          ? 'bg-[#0d1322] border-[#22334f] hover:border-[#c59a43]/50'
                          : 'bg-[#ffffff] border-[#ded5be] hover:border-[#c59a43]/60 shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-[#c59a43]/15 text-[#c59a43] shrink-0">
                              <Icon className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="font-serif font-bold text-xs text-[#c59a43]">
                                {m.titleLatin}
                              </div>
                              <div className="text-[10px] opacity-75 font-serif" dir="rtl">
                                {m.titleArabic}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onNavigateToTab(m.id);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#c59a43] text-black hover:bg-[#d6aa52] transition-colors shrink-0 shadow-sm"
                          >
                            <span>Buka Modul</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-xs opacity-85 leading-relaxed font-sans">
                          {m.purpose}
                        </p>

                        <div className="space-y-1 pt-1.5 border-t border-current/10">
                          <span className="text-[10px] font-bold text-[#38bdf8] block">
                            Tips Navigasi Pengguna Awam:
                          </span>
                          <ul className="text-[11px] opacity-80 space-y-0.5 list-disc list-inside">
                            {m.beginnerTips.map((tip, idx) => (
                              <li key={idx} className="leading-snug">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-current/10 flex flex-wrap gap-1">
                        {m.keyActions.map((act, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-2 py-0.5 rounded bg-current/5 border border-current/10 opacity-75"
                          >
                            ✓ {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GLOSSARY OF ZIJ AS-SINDHIND */}
          {activeTab === 'glossary' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-current/10">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#c59a43]">
                    Kamus Istilah Falak Sindhind (Mu'jam al-Mustalahat):
                  </h3>
                  <p className="text-xs opacity-75 font-serif">
                    Penjelasan bahasa ilmiah Arab klasik yang disederhanakan dengan padanan astronomi modern.
                  </p>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 opacity-50" />
                    <input
                      type="text"
                      value={glossarySearch}
                      onChange={(e) => setGlossarySearch(e.target.value)}
                      placeholder="Cari istilah / kata kunci..."
                      className={`pl-8 pr-3 py-1 rounded-lg border text-xs outline-none w-48 ${
                        isNight
                          ? 'bg-[#0a0f1d] border-[#1f2e47] focus:border-[#c59a43]'
                          : 'bg-[#ffffff] border-[#ded3bd] focus:border-[#c59a43]'
                      }`}
                    />
                  </div>

                  <select
                    value={glossaryCategory}
                    onChange={(e) => setGlossaryCategory(e.target.value)}
                    className={`px-2.5 py-1 rounded-lg border text-xs outline-none ${
                      isNight
                        ? 'bg-[#0a0f1d] border-[#1f2e47] focus:border-[#c59a43]'
                        : 'bg-[#ffffff] border-[#ded3bd] focus:border-[#c59a43]'
                    }`}
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="calculation">Dasar Hisab</option>
                    <option value="position">Kedudukan Planet</option>
                    <option value="aspect">Aspek & Sudut</option>
                    <option value="weather">Cuaca Musiman</option>
                  </select>
                </div>
              </div>

              {/* Glossary Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredGlossary.length === 0 ? (
                  <div className="col-span-2 py-10 text-center opacity-60 italic text-xs">
                    Tidak ditemukan istilah yang cocok dengan kata kunci "{glossarySearch}".
                  </div>
                ) : (
                  filteredGlossary.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                        isNight
                          ? 'bg-[#0d1322] border-[#22334f]'
                          : 'bg-[#ffffff] border-[#dfd5be] shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-current/10">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif font-bold text-sm text-[#c59a43]">
                              {item.transliteration}
                            </span>
                            <span className="font-serif text-xs opacity-75 font-semibold" dir="rtl">
                              ({item.termArabic})
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-[#38bdf8] block">
                            {item.modernTerm}
                          </span>
                        </div>

                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-current/10 opacity-75 shrink-0">
                          {item.categoryLabel}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs leading-relaxed font-sans">
                        <p className="opacity-90">
                          <strong className="text-[#c59a43]">Penjelasan Sederhana:</strong>{' '}
                          {item.simpleExplanation}
                        </p>
                        <p className="text-[11px] opacity-75">
                          <strong>Kaidah Ilmiah:</strong> {item.technicalDetails}
                        </p>
                        <div className="text-[10px] font-mono p-1.5 rounded bg-current/5 border border-current/10 text-[#38bdf8]">
                          💡 Pada Aplikasi: {item.exampleInApp}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-current/10">
                <h3 className="font-serif font-bold text-sm text-[#c59a43]">
                  Alur Riset Astronomi Cepat 5 Langkah (Panduan Pemula):
                </h3>
                <p className="text-xs opacity-75 font-serif">
                  Cara praktis melakukan studi dan telaah posisi kawkab dari naskah kuno ke kesimpulan riset ilmiah.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: '1',
                    title: 'Tentukan Waktu Observasi / Peristiwa Sejarah',
                    desc: 'Buka modul "Tarikh & Kalender". Tentukan tahun, bulan, hari, dan jam yang ingin diteliti (misal: 145 H / 762 M saat berdirinya Baghdad, atau tanggal lahir/peristiwa bersejarah lainnya). Klik "Terapkan Tanggal" untuk menyinkronkan seluruh piringan hisab.',
                    actionTab: 'calendar',
                    actionLabel: 'Buka Modul Kalender',
                  },
                  {
                    step: '2',
                    title: 'Periksa Piringan Astrolab & Orbit D3 Dinamis',
                    desc: 'Buka modul "Astrolab" untuk melihat proyeksi geosentris kawkab di 12 rasi zodiak, atau modul "Orbit D3" untuk melihat perputaran planet dalam model heliosentris dan geosentris. Amati letak titik terbit timur (Tali\') dan kedudukan planet.',
                    actionTab: 'astrolabe',
                    actionLabel: 'Buka Astrolab',
                  },
                  {
                    step: '3',
                    title: 'Hitung Aspek Geometris & Komparasi Synastry',
                    desc: 'Gunakan modul "Tabel Aspek" untuk mendeteksi sudut harmoni (Trina, Sekstil) atau tegangan (Kuadrat, Oposisi). Jika ingin membandingkan dua masa berbeda, buka modul "Synastry Matrix" untuk menimbang skor keserasian (Mizan at-Tawafuq).',
                    actionTab: 'aspects',
                    actionLabel: 'Buka Tabel Aspek',
                  },
                  {
                    step: '4',
                    title: 'Prediksi Iklim & Cuaca Musiman (Ahkam al-Mawlayin)',
                    desc: 'Buka modul "Cuaca Musiman" untuk mengetahui penguasa musim (Mawla al-Fasl) dan penguasa angin (Mawla al-Anwa\'). Cermati indeks suhu, curah hujan, arah angin, serta panduan agrikultur tradisional pada tahun tersebut.',
                    actionTab: 'weather',
                    actionLabel: 'Buka Cuaca Musiman',
                  },
                  {
                    step: '5',
                    title: 'Dokumentasikan Temuan & Unduh Berkas Riset PDF',
                    desc: 'Simpan hipotesis dan catatan Anda di modul "Anotasi Riset". Setelah seluruh data lengkap, klik tombol "Ekspor PDF" di sudut kanan atas untuk mengunduh laporan akademik resmi yang siap dicetak dan diarsipkan.',
                    actionTab: 'annotations',
                    actionLabel: 'Buka Anotasi Riset',
                  },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isNight ? 'bg-[#0d1322] border-[#22334f]' : 'bg-[#ffffff] border-[#ded5be]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#c59a43] text-black font-bold font-serif flex items-center justify-center shrink-0 text-sm shadow-sm">
                        {s.step}
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-[#c59a43] mb-0.5">
                          {s.title}
                        </h4>
                        <p className="text-xs opacity-80 leading-relaxed font-sans">{s.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigateToTab(s.actionTab);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c59a43]/20 hover:bg-[#c59a43]/30 text-[#c59a43] transition-colors shrink-0 self-end sm:self-auto border border-[#c59a43]/40"
                    >
                      <span>{s.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY OF SINDHIND MANUSCRIPT */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-current/10">
                <h3 className="font-serif font-bold text-sm text-[#c59a43]">
                  Sejarah Naskah Zīj as-Sindhind & Qasīdah fī ‘Ilm an-Nujūm:
                </h3>
                <p className="text-xs opacity-75 font-serif">
                  Kisah perjalanan khazanah ilmu falak dari peradaban lembah Indus ke pusat sains dunia di Bayt al-Hikmah Baghdad.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border leading-relaxed text-xs space-y-3 font-sans ${
                  isNight ? 'bg-[#0d1322] border-[#22334f]' : 'bg-[#ffffff] border-[#ded5be]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <ScrollText className="w-5 h-5 text-[#c59a43] shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#c59a43]">
                      Kedatangan Naskah ke Baghdad (154 H / 771 M):
                    </h4>
                    <p className="opacity-85">
                      Pada masa pemerintahan Khalifah Abbasiyah kedua, <strong>Abu Ja'far al-Manshur</strong>, sebuah delegasi sarjana dari India tiba di Baghdad dipimpin oleh seorang ahli falak yang membawa risalah astronomi berbahasa Sanskerta berjudul <em>Brahmasphutasiddhanta</em> (karya Brahmagupta, ~628 M). Naskah ini dikenal oleh para sarjana Arab sebagai <strong>As-Sindhind</strong> (السند هند), yang bermakna "Kaidah Abadi Penentu Peredaran Waktu".
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-current/10">
                  <GraduationCap className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#38bdf8]">
                      Penyuntingan oleh Al-Khwarizmi (Era Al-Ma'mun, ~215 H / 830 M):
                    </h4>
                    <p className="opacity-85">
                      Khalifah al-Manshur memerintahkan <strong>Ibrahim al-Fazari</strong> dan <strong>Ya'qub ibn Tariq</strong> untuk menerjemahkannya. Sekitar setengah abad kemudian, di era keemasan Bayt al-Hikmah di bawah Khalifah <strong>Al-Ma'mun</strong>, mahaguru matematika dan astronomi <strong>Abu Ja'far Muhammad ibn Musa al-Khwarizmi</strong> menyunting ulang naskah tersebut menjadi mahakarya <strong>Zīj as-Sindhind</strong> (زيج السند هند الكبير). Al-Khwarizmi mengintegrasikan astronomi India dengan parameter pengamatan Ptolemeus dan tabel trigonometri sinus Arab, serta mengalibrasi meridian acuan dari Ujjain ke Baghdad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-current/10">
                  <Lightbulb className="w-5 h-5 text-[#eab308] shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#eab308]">
                      Qasīdah fī ‘Ilm an-Nujūm (Tradisi Syair Mnemonik Para Astronom):
                    </h4>
                    <p className="opacity-85">
                      Agar rumus-rumus hisab yang rumit, watak kawkab, dan lingkaran cahaya (Jurm) mudah dihafalkan oleh para penuntut ilmu falak, para penyair sarjana menyusun bait-bait syair bersajak (Qasidah/Manzhumah) yang memadukan keindahan sastra Arab dengan ketelitian matematika astronomi.
                    </p>
                  </div>
                </div>

                {/* Developer Dedication */}
                <div className="flex items-start gap-2.5 pt-3 border-t-2 border-amber-500/30 bg-amber-500/10 p-3 rounded-xl">
                  <GraduationCap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 text-xs">
                    <h4 className="font-serif font-bold text-sm text-amber-600 dark:text-amber-300">
                      Pengembang Aplikasi: Al-Faqir Husni Bin Sabri Sapri
                    </h4>
                    <p className="opacity-90 font-medium">
                      Alamat: <strong>Beremi Jagaraga Kuripan Lombok Barat</strong>, Nusa Tenggara Barat.
                    </p>
                    <p className="opacity-90">
                      Kontak Telp/WA: <strong>+6281915949627</strong> &amp; <strong>+6285239163085</strong>
                    </p>
                    <p className="opacity-80 italic text-[11px] pt-0.5">
                      "Didedikasikan untuk menghidupkan kembali khazanah agung ilmu falak, astronomi Islam, hisab Jumal Abjad, dan manuskrip klasik Nusantara."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-current/10 bg-current/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0 font-serif">
          <span className="opacity-75 text-[11px] text-center sm:text-left">
            💡 <strong>Kiat Pintar:</strong> Anda dapat membuka kembali panduan ini kapan saja melalui tombol "Panduan Riset" di bilah atas aplikasi.
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-[#c59a43] text-black hover:bg-[#d4aa52] transition-colors shadow-sm"
          >
            Mengerti & Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
