/**
 * Hisab Jumal & Petung Pasaran Engine (حساب الجُمَّلِ والوَفْقِ الفَلَكِيّ وَالفَال)
 * Classical Islamic-Nusantara Onomancy and Astro-Numerology
 * Sources:
 * - Kitab Syams al-Ma'arif al-Kubra (Syaikh Ahmad bin Ali al-Buni)
 * - Kitab Abu Ma'shar al-Balkhi fi al-Ahkam wal-Furu'
 * - Kitab Tajul Muluk & Mujarobat Melayu-Jawa
 * - Primbon Betaljemur Adammakna (Petung Salasilah Falak Jawa)
 */

export type ElementType = 'Api' | 'Tanah' | 'Udara' | 'Air';

export interface AbjadLetterInfo {
  char: string;
  name: string;
  value: number;
  element: ElementType;
  elementArabic: 'ناري' | 'ترابي' | 'هوائي' | 'مائي';
  nature: 'Harr Yabis (Panas-Kering)' | 'Barid Yabis (Dingin-Kering)' | 'Harr Ratb (Panas-Basah)' | 'Barid Ratb (Dingin-Basah)';
  natureArabic: string;
  spiritualNote: string;
}

/**
 * Standard 28 Arabic Abjad Letters + Pegon extensions with their classical values and elemental allocations
 */
export const ABJAD_TABLE: Record<string, AbjadLetterInfo> = {
  'ا': { char: 'ا', name: 'Alif', value: 1, element: 'Api', elementArabic: 'ناري', nature: 'Harr Yabis (Panas-Kering)', natureArabic: 'حار يابس', spiritualNote: 'Huruf permulaan ciptaan, kemandirian, dan kepemimpinan mutlak.' },
  'ب': { char: 'ب', name: 'Ba', value: 2, element: 'Tanah', elementArabic: 'ترابي', nature: 'Barid Yabis (Dingin-Kering)', natureArabic: 'بارد يابس', spiritualNote: 'Pintu gerbang hikmah, kerendahan hati, dan keteguhan batin.' },
  'ج': { char: 'ج', name: 'Jim', value: 3, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Kecerdikan bergaul, keluhuran derajat, dan kemampuan sintesis gagasan.' },
  'د': { char: 'د', name: 'Dal', value: 4, element: 'Air', elementArabic: 'مائي', nature: 'Barid Ratb (Dingin-Basah)', natureArabic: 'بارد رطب', spiritualNote: 'Kestabilan nurani, ketekunan, dan sifat pengayom yang setia.' },
  'ه': { char: 'ه', name: 'Ha', value: 5, element: 'Api', elementArabic: 'ناري', nature: 'Harr Yabis (Panas-Kering)', natureArabic: 'حار يابس', spiritualNote: 'Pancaran petunjuk, cahaya kalbu, dan wibawa rohaniah.' },
  'ة': { char: 'ة', name: 'Ta Marbuthah', value: 5, element: 'Api', elementArabic: 'ناري', nature: 'Harr Yabis (Panas-Kering)', natureArabic: 'حار يابس', spiritualNote: 'Keindahan budi dan pelengkap kesempurnaan hakikat.' },
  'و': { char: 'و', name: 'Waw', value: 6, element: 'Tanah', elementArabic: 'ترابي', nature: 'Barid Yabis (Dingin-Kering)', natureArabic: 'بارد يابس', spiritualNote: 'Penghubung silaturahmi, kebulatan tekad, dan kesetiaan janji.' },
  'ز': { char: 'ز', name: 'Zay', value: 7, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Ketajaman pikiran, kecermatan strategi, dan daya tarik alami.' },
  'ح': { char: 'ح', name: 'Ha', value: 8, element: 'Air', elementArabic: 'مائي', nature: 'Barid Ratb (Dingin-Basah)', natureArabic: 'بارد رطب', spiritualNote: 'Kesucian niat, kelembutan tutur kata, dan daya penyembuh kalbu.' },
  'ط': { char: 'ط', name: 'Tha', value: 9, element: 'Api', elementArabic: 'ناري', nature: 'Harr Yabis (Panas-Kering)', natureArabic: 'حار يابس', spiritualNote: 'Kekuatan tekad melampaui rintangan, ketegasan memutus perkara.' },
  'ي': { char: 'ي', name: 'Ya', value: 10, element: 'Tanah', elementArabic: 'ترابي', nature: 'Barid Yabis (Dingin-Kering)', natureArabic: 'بارد يابس', spiritualNote: 'Kepastian ilmu, keteraturan langkah, dan ketetapan pendirian.' },
  'ى': { char: 'ى', name: 'Alif Maqshurah', value: 10, element: 'Tanah', elementArabic: 'ترابي', nature: 'Barid Yabis (Dingin-Kering)', natureArabic: 'بارد يابس', spiritualNote: 'Kearifan mendalam dan keheningan renungan.' },
  'ك': { char: 'ك', name: 'Kaf', value: 20, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Kemampuan diplomasi, keanggunan tata bahasa, dan pengaruh sosial.' },
  'ل': { char: 'ل', name: 'Lam', value: 30, element: 'Air', elementArabic: 'مائي', nature: 'Barid Ratb (Dingin-Basah)', natureArabic: 'بارد رطب', spiritualNote: 'Keluasan sifat welas asih, keindahan adab, dan kemurahan hati.' },
  'م': { char: 'م', name: 'Mim', value: 40, element: 'Api', elementArabic: 'ناري', nature: 'Harr Yabis (Panas-Kering)', natureArabic: 'حار يابس', spiritualNote: 'Kematangan kepemimpinan, rahasia amanah, dan daya tahan tinggi.' },
  'ن': { char: 'ن', name: 'Nun', value: 50, element: 'Tanah', elementArabic: 'ترابي', nature: 'Barid Yabis (Dingin-Kering)', natureArabic: 'بارد يابس', spiritualNote: 'Ketajaman intuisi, pelindung kebenaran, dan cahaya pena keilmuan.' },
  'س': { char: 'س', name: 'Sin', value: 60, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Kedamaian jiwa, keteraturan administrasi, dan kelapangan dada.' },
  'ع': { char: 'ع', name: 'Ain', value: 70, element: 'Air', elementArabic: 'مائي', nature: 'Barid Ratb (Dingin-Basah)', natureArabic: 'بارد رطب', spiritualNote: 'Kedalaman mata batin, keluhuran ilmu kasyaf, dan kesadaran spiritual.' },
  'ف': { char: 'ف', name: 'Fa', value: 80, element: 'Api', elementArabic: 'ناري', nature: 'Harr Yabis (Panas-Kering)', natureArabic: 'حار يابس', spiritualNote: 'Fashahah (kefasihan berbicara), keterbukaan rezeki, dan kemenangan hak.' },
  'ص': { char: 'ص', name: 'Shad', value: 90, element: 'Tanah', elementArabic: 'ترابي', nature: 'Barid Yabis (Dingin-Kering)', natureArabic: 'بارد يابس', spiritualNote: 'Ketulusan shidiq, kesabaran dalam kesulitan, dan benteng pertahanan kukuh.' },
  'ق': { char: 'ق', name: 'Qaf', value: 100, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Keteguhan prinsip, kekuatan martabat, dan kejernihan wawasan masa depan.' },
  'ر': { char: 'ر', name: 'Ra', value: 200, element: 'Air', elementArabic: 'مائي', nature: 'Barid Ratb (Dingin-Basah)', natureArabic: 'بارد رطب', spiritualNote: 'Rahmat dan simpati tinggi, kemudahan menawan simpati khalayak.' },
  'ش': { char: 'ش', name: 'Syin', value: 300, element: 'Api', elementArabic: 'ناري', nature: 'Harr Yabis (Panas-Kering)', natureArabic: 'حار يابس', spiritualNote: 'Semangat membara, daya dorong revolusioner, dan ketegasan membela kebenaran.' },
  'ت': { char: 'ت', name: 'Ta', value: 400, element: 'Tanah', elementArabic: 'ترابي', nature: 'Barid Yabis (Dingin-Kering)', natureArabic: 'بارد يابس', spiritualNote: 'Ketakwaan, kepatuhan pada aturan, dan disiplin tinggi dalam berkarya.' },
  'ث': { char: 'ث', name: 'Tsa', value: 500, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Kekayaan ide, kepiawaian berdiskusi, dan ketabahan mempertahankan hujah.' },
  'خ': { char: 'خ', name: 'Kha', value: 600, element: 'Air', elementArabic: 'مائي', nature: 'Barid Ratb (Dingin-Basah)', natureArabic: 'بارد رطب', spiritualNote: 'Kewaspadaan instingtif, rahasia kepribadian mendalam, dan kepekaan rasa.' },
  'ذ': { char: 'ذ', name: 'Dzal', value: 700, element: 'Api', elementArabic: 'ناري', nature: 'Harr Yabis (Panas-Kering)', natureArabic: 'حار يابس', spiritualNote: 'Kecerdasan tajam, daya ingat kuat, dan kemuliaan nasab budi pekerti.' },
  'ض': { char: 'ض', name: 'Dhad', value: 800, element: 'Tanah', elementArabic: 'ترابي', nature: 'Barid Yabis (Dingin-Kering)', natureArabic: 'بارد يابس', spiritualNote: 'Kekuatan menanggung beban tanggung jawab berat dan keistimewaan bahasa.' },
  'ظ': { char: 'ظ', name: 'Zha', value: 900, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Kemenangan nyata, kejelasan argumen, dan kewibawaan lahiriah.' },
  'غ': { char: 'غ', name: 'Ghayn', value: 1000, element: 'Air', elementArabic: 'مائي', nature: 'Barid Ratb (Dingin-Basah)', natureArabic: 'بارد رطب', spiritualNote: 'Kekayaan batiniah tak terduga, ketahanan dari tipu daya, dan kelapangan rezeki.' },

  // Pegon / Nusantara Letters
  'چ': { char: 'چ', name: 'Ca (Pegon)', value: 3, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Keluwesan tutur kata Nusantara dan keceriaan sosial.' },
  'ڤ': { char: 'ڤ', name: 'Pa (Pegon)', value: 80, element: 'Api', elementArabic: 'ناري', nature: 'Harr Yabis (Panas-Kering)', natureArabic: 'حار يابس', spiritualNote: 'Daya inisiatif kepemimpinan lokal dan keberanian bertindak.' },
  'ڠ': { char: 'ڠ', name: 'Nga (Pegon)', value: 70, element: 'Air', elementArabic: 'مائي', nature: 'Barid Ratb (Dingin-Basah)', natureArabic: 'بارد رطب', spiritualNote: 'Keluhuran rasa batiniah dan kehalusan intuisi rasa Nusantara.' },
  'ݢ': { char: 'ݢ', name: 'Ga (Pegon)', value: 20, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Kekuatan fisik, keuletan kerja nyata, dan kemauan keras.' },
  'ک': { char: 'ک', name: 'Ga/Kaf Varian', value: 20, element: 'Udara', elementArabic: 'هوائي', nature: 'Harr Ratb (Panas-Basah)', natureArabic: 'حار رطب', spiritualNote: 'Keluwesan komunikasi dan daya pikat kepribadian.' },
  'ڽ': { char: 'ڽ', name: 'Nya (Pegon)', value: 50, element: 'Tanah', elementArabic: 'ترابي', nature: 'Barid Yabis (Dingin-Kering)', natureArabic: 'بارد يابس', spiritualNote: 'Keteraturan laku dan ketenangan memegang amanat luhur.' },
};

export type DayKey = 'ahad' | 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
export type PasaranKey = 'legi' | 'pahing' | 'pon' | 'wage' | 'kliwon';

export interface DayInfo {
  key: DayKey;
  name: string;
  arabicName: string;
  neptu: number;
  planet: string;
  planetArabic: string;
  lakuning: string;
  lakuningMeaning: string;
}

export interface PasaranInfo {
  key: PasaranKey;
  name: string;
  javaneseName: string;
  neptu: number;
  direction: string;
  directionArabic: string;
  element: string;
  elementArabic: string;
  character: string;
  characterArabic: string;
}

export const SAPTA_WARA: Record<DayKey, DayInfo> = {
  ahad: {
    key: 'ahad',
    name: 'Ahad / Minggu',
    arabicName: 'الأَحَد',
    neptu: 5,
    planet: 'Matahari (Asy-Syams)',
    planetArabic: 'الشَّمْس',
    lakuning: 'Lakuning Samudra',
    lakuningMeaning: 'Berjiwa luas bak samudera raya, berlapang dada memaafkan, dan disegani kawan maupun lawan.',
  },
  senin: {
    key: 'senin',
    name: 'Senin',
    arabicName: 'الاِثْنَيْن',
    neptu: 4,
    planet: 'Bulan (Al-Qamar)',
    planetArabic: 'القَمَر',
    lakuning: 'Lakuning Rembulan',
    lakuningMeaning: 'Peneduh bagi orang di sekitarnya, tutur katanya elok dan menenangkan hati, disukai dalam pergaulan.',
  },
  selasa: {
    key: 'selasa',
    name: 'Selasa',
    arabicName: 'الثُّلَاثَاء',
    neptu: 3,
    planet: 'Mars (Al-Mirrikh)',
    planetArabic: 'المِرِّيخ',
    lakuning: 'Lakuning Geni',
    lakuningMeaning: 'Berapi-api penuh daya juang, pemberani, pantang tunduk pada ketidakadilan, berjiwa ksatria pelindung.',
  },
  rabu: {
    key: 'rabu',
    name: 'Rabu',
    arabicName: 'الأَرْبِعَاء',
    neptu: 7,
    planet: 'Merkurius (\'Utarid)',
    planetArabic: 'عُطَارِد',
    lakuning: 'Lakuning Surya',
    lakuningMeaning: 'Pikirannya terang cemerlang, cerdas mengatur strategi dan diplomasi, dermawan serta pandai berniaga.',
  },
  kamis: {
    key: 'kamis',
    name: 'Kamis',
    arabicName: 'الخَمِيس',
    neptu: 8,
    planet: 'Yupiter (Al-Musytari)',
    planetArabic: 'المُشْتَرِي',
    lakuning: 'Lakuning Angin',
    lakuningMeaning: 'Bebas mandiri, cekatan menangkap peluang, berjiwa musafir ilmu pengetahuan, dan berwawasan luas.',
  },
  jumat: {
    key: 'jumat',
    name: 'Jum\'at',
    arabicName: 'الجُمُعَة',
    neptu: 6,
    planet: 'Venus (Az-Zuhrah)',
    planetArabic: 'الزُّهْرَة',
    lakuning: 'Lakuning Bintang',
    lakuningMeaning: 'Bersinar tenang di kegelapan, bersahaja, teliti, mencintai keindahan budi pekerti dan seni kehidupan.',
  },
  sabtu: {
    key: 'sabtu',
    name: 'Sabtu',
    arabicName: 'السَّبْت',
    neptu: 9,
    planet: 'Saturnus (Zuhal)',
    planetArabic: 'زُحَل',
    lakuning: 'Lakuning Bumi',
    lakuningMeaning: 'Kukuh menopang beban berat, penyabar tanpa banyak mengeluh, teguh pendirian, dan tempat bernaung.',
  },
};

export const PANCA_WARA: Record<PasaranKey, PasaranInfo> = {
  legi: {
    key: 'legi',
    name: 'Legi (Umanis)',
    javaneseName: 'Manis',
    neptu: 5,
    direction: 'Timur (Wetan)',
    directionArabic: 'الشَّرْق',
    element: 'Udara & Cahaya Putih',
    elementArabic: 'النُّورُ وَالهَوَاء',
    character: 'Ikhlas berkorban, manis budi pekertinya, cinta damai, dan mudah memikat rasa simpati sesama.',
    characterArabic: 'حُلْوُ المَعْشَرِ وَسَلِيمُ الصَّدْر',
  },
  pahing: {
    key: 'pahing',
    name: 'Pahing (Paing)',
    javaneseName: 'Pahing',
    neptu: 9,
    direction: 'Selatan (Kidul)',
    directionArabic: 'الجَنُوب',
    element: 'Api & Gelora Merah',
    elementArabic: 'النَّارُ وَالحَمِيَّة',
    character: 'Kuat kehendak batinnya, pantang berputus asa, memiliki cita-cita luhur dan tidak mudah diperdaya.',
    characterArabic: 'شَدِيدُ العَزْمِ عَالِي الهِمَّة',
  },
  pon: {
    key: 'pon',
    name: 'Pon (Petak)',
    javaneseName: 'Pon',
    neptu: 7,
    direction: 'Barat (Kulon)',
    directionArabic: 'الغَرْب',
    element: 'Air & Kilau Kuning',
    elementArabic: 'المَاءُ وَالبَصِيرَة',
    character: 'Waspada meneliti sebelum bertindak, hemat dan cermat mengelola kekayaan, bijak dalam menasihati.',
    characterArabic: 'حَذِرٌ حَكِيمٌ حَسَنُ التَّدْبِير',
  },
  wage: {
    key: 'wage',
    name: 'Wage (Cemeng)',
    javaneseName: 'Wage',
    neptu: 4,
    direction: 'Utara (Lor)',
    directionArabic: 'الشَّمَال',
    element: 'Tanah & Kedalaman Hitam',
    elementArabic: 'الأَرْضُ وَالثَّبَات',
    character: 'Ulet tahan banting dalam cobaan, teguh memegang amanah rahasia, pekerja keras yang tekun.',
    characterArabic: 'صَبُورٌ كَتُومٌ مُجِدُّ السَّعْي',
  },
  kliwon: {
    key: 'kliwon',
    name: 'Kliwon (Asih)',
    javaneseName: 'Kasih',
    neptu: 8,
    direction: 'Pusat (Pancer)',
    directionArabic: 'المَرْكَزُ (القَلْب)',
    element: 'Eter / Pancer Mancawarna',
    elementArabic: 'الأَثِيرُ وَالجَوْهَر',
    character: 'Daya spiritual pengayom kuat, disegani, memiliki kepekaan rasa batiniah tajam dan cinta kasih luas.',
    characterArabic: 'صَاحِبُ جَاذِبِيَّةٍ وَقُوَّةٍ رُوحِيَّة',
  },
};

/**
 * Spiritual Planet Rulers based on Total Jumal Modulo 7 (Abu Ma'shar & Tajul Muluk)
 */
export interface RulerPlanetDetail {
  key: string;
  name: string;
  arabicName: string;
  symbol: string;
  nature: string;
  blessingDay: string;
  blessingDayArabic: string;
  auraColor: string;
  characterTrait: string;
  auspiciousStone: string;
}

export const RULER_PLANETS: RulerPlanetDetail[] = [
  {
    key: 'saturn',
    name: 'Saturnus (Zuhal)',
    arabicName: 'زُحَل',
    symbol: '♄',
    nature: 'Ketahanan, Disiplin, & Fondasi Kokoh',
    blessingDay: 'Sabtu',
    blessingDayArabic: 'يَوْمُ السَّبْت',
    auraColor: 'Hitam / Biru Tua Pekat',
    characterTrait: 'Tahan banting menghadapi ujian panjang, cermat mengamati kesalahan, arif berhemat, dan berwibawa.',
    auspiciousStone: 'Batu Safir Biru (Yaqut Azraq) / Onyx',
  },
  {
    key: 'sun',
    name: 'Matahari (Asy-Syams)',
    arabicName: 'الشَّمْس',
    symbol: '☉',
    nature: 'Kemuliaan, Kepemimpinan, & Kejayaan',
    blessingDay: 'Ahad',
    blessingDayArabic: 'يَوْمُ الأَحَد',
    auraColor: 'Kuning Keemasan / Jingga Terang',
    characterTrait: 'Pribadi yang memancarkan daya pikat wibawa, pantang dihina, jujur, dan berjiwa pemimpin sejati.',
    auspiciousStone: 'Batu Permata Nilam / Akik Kuning / Ruby',
  },
  {
    key: 'moon',
    name: 'Bulan (Al-Qamar)',
    arabicName: 'القَمَر',
    symbol: '☽',
    nature: 'Kelembutan, Intuisi, & Daya Adaptasi',
    blessingDay: 'Senin',
    blessingDayArabic: 'يَوْمُ الاِثْنَيْن',
    auraColor: 'Putih Mutiara / Perak Berkilau',
    characterTrait: 'Perasaan peka nan halus, mudah berempati, disenangi masyarakat luas, dan pandai menjaga rahasia.',
    auspiciousStone: 'Batu Mutiara (Lu\'lu\') / Biduri Bulan',
  },
  {
    key: 'mars',
    name: 'Mars (Al-Mirrikh)',
    arabicName: 'المِرِّيخ',
    symbol: '♂',
    nature: 'Keberanian, Semangat Ksatria, & Ketegasan',
    blessingDay: 'Selasa',
    blessingDayArabic: 'يَوْمُ الثُّلَاثَاء',
    auraColor: 'Merah Menyala / Tembaga',
    characterTrait: 'Cepat bertindak, berjiwa penantang rintangan, suka membela kaum lemah, dan tidak gentar pada persaingan.',
    auspiciousStone: 'Batu Akik Yaman Merah (Yaqut Ahmar)',
  },
  {
    key: 'mercury',
    name: 'Merkurius (\'Utarid)',
    arabicName: 'عُطَارِد',
    symbol: '☿',
    nature: 'Kecerdasan, Diplomasi, & Perniagaan',
    blessingDay: 'Rabu',
    blessingDayArabic: 'يَوْمُ الأَرْبِعَاء',
    auraColor: 'Pirus / Hijau Muda Segar',
    characterTrait: 'Pintar berhitung dan bernegosiasi, senang membaca ilmu pengetahuan, fleksibel, dan fasih bertutur.',
    auspiciousStone: 'Batu Pirus (Fairuz) / Zamrud Muda',
  },
  {
    key: 'jupiter',
    name: 'Yupiter (Al-Musytari)',
    arabicName: 'المُشْتَرِي',
    symbol: '♃',
    nature: 'Keadilan, Kelapangan Rezeki, & Hikmah Luhur',
    blessingDay: 'Kamis',
    blessingDayArabic: 'يَوْمُ الخَمِيس',
    auraColor: 'Ungu / Biru Terang Langit',
    characterTrait: 'Berakhlak mulia, murah hati, menjadi penengah perkara yang bijaksana, serta dikaruniai rezeki tak terduga.',
    auspiciousStone: 'Batu Pirus Persia / Topas Biru',
  },
  {
    key: 'venus',
    name: 'Venus (Az-Zuhrah)',
    arabicName: 'الزُّهْرَة',
    symbol: '♀',
    nature: 'Kasih Sayang, Keharmonisan, & Kemakmuran',
    blessingDay: 'Jum\'at',
    blessingDayArabic: 'يَوْمُ الجُمُعَة',
    auraColor: 'Hijau Zamrud / Merah Muda',
    characterTrait: 'Penuh pesona ramah tamah, mencintai keindahan dan kerapian, membawa keberkahan di mana pun berada.',
    auspiciousStone: 'Batu Zamrud Asli (Zumurrud) / Giok',
  },
];

/**
 * Spiritual Zodiac Sign based on Total Jumal Modulo 12
 */
export interface SpiritualBurjDetail {
  name: string;
  arabicName: string;
  latinSign: string;
  element: ElementType;
  elementArabic: string;
  symbol: string;
  motto: string;
  innerDrive: string;
}

export const SPIRITUAL_BURUJ: SpiritualBurjDetail[] = [
  { name: 'Al-Hut (Pisces)', arabicName: 'الحُوت', latinSign: 'Pisces', element: 'Air', elementArabic: 'مائي', symbol: '♓', motto: 'Kedalaman Kasih & Samudera Doa', innerDrive: 'Mencari ketenangan hakiki dan menyebarkan welas asih tanpa pamrih.' },
  { name: 'Al-Hamal (Aries)', arabicName: 'الحَمَل', latinSign: 'Aries', element: 'Api', elementArabic: 'ناري', symbol: '♈', motto: 'Pelopor Pembaharu & Inisiator', innerDrive: 'Menjadi pembuka jalan pertama dan menaklukkan tantangan berat.' },
  { name: 'Ats-Tsaur (Taurus)', arabicName: 'الثَّوْر', latinSign: 'Taurus', element: 'Tanah', elementArabic: 'ترابي', symbol: '♉', motto: 'Kekukuhan Usaha & Kelimpahan Harta', innerDrive: 'Membangun kenyamanan hidup berkelanjutan dan menjaga stabilitas keluarga.' },
  { name: 'Al-Jauza (Gemini)', arabicName: 'الجَوْزَاء', latinSign: 'Gemini', element: 'Udara', elementArabic: 'هوائي', symbol: '♊', motto: 'Jembatan Informasi & Persahabatan', innerDrive: 'Menghubungkan orang banyak dan mengeksplorasi wawasan baru tiada henti.' },
  { name: 'As-Sarathan (Cancer)', arabicName: 'السَّرَطَان', latinSign: 'Cancer', element: 'Air', elementArabic: 'مائي', symbol: '♋', motto: 'Benteng Perlindungan & Kedamaian Rumah', innerDrive: 'Melindungi orang tercinta dan menumbuhkan rasa aman batiniah.' },
  { name: 'Al-Asad (Leo)', arabicName: 'الأَسَد', latinSign: 'Leo', element: 'Api', elementArabic: 'ناري', symbol: '♌', motto: 'Kewibawaan Singgasana & Kebesaran Budi', innerDrive: 'Memimpin dengan teladan terhormat dan menginspirasi sekelilingnya.' },
  { name: 'As-Sunbulah (Virgo)', arabicName: 'السُّنْبُلَة', latinSign: 'Virgo', element: 'Tanah', elementArabic: 'ترابي', symbol: '♍', motto: 'Kesempurnaan Karya & Pengabdian Suci', innerDrive: 'Menyusun keteraturan hidup dengan detail dan mengabdi pada kemaslahatan.' },
  { name: 'Al-Mizan (Libra)', arabicName: 'المِيزَان', latinSign: 'Libra', element: 'Udara', elementArabic: 'هوائي', symbol: '♎', motto: 'Timbangan Keadilan & Keindahan Selaras', innerDrive: 'Menciptakan keharmonisan sosial dan menengahi sengketa secara adil.' },
  { name: 'Al-\'Aqrab (Scorpio)', arabicName: 'العَقْرَب', latinSign: 'Scorpio', element: 'Air', elementArabic: 'مائي', symbol: '♏', motto: 'Transformasi Batin & Ketajaman Rahasia', innerDrive: 'Menembus tabir kebenaran hakiki dan memperbaharui diri lewat ujian hidup.' },
  { name: 'Al-Qaws (Sagittarius)', arabicName: 'القَوْس', latinSign: 'Sagittarius', element: 'Api', elementArabic: 'ناري', symbol: '♐', motto: 'Anak Panah Cita & Pengelana Kebenaran', innerDrive: 'Mengejar pemahaman filosofis luhur dan memperluas cakrawala jiwa.' },
  { name: 'Al-Jady (Capricorn)', arabicName: 'الجَدْي', latinSign: 'Capricorn', element: 'Tanah', elementArabic: 'ترابي', symbol: '♑', motto: 'Puncak Gunung Disiplin & Warisan Abadi', innerDrive: 'Mencapai puncak prestasi lewat kerja keras bertahap dan meninggalkan warisan berharga.' },
  { name: 'Ad-Dalw (Aquarius)', arabicName: 'الدَّلْو', latinSign: 'Aquarius', element: 'Udara', elementArabic: 'هوائي', symbol: '♒', motto: 'Kendi Kebajikan & Pembela Kemanusiaan', innerDrive: 'Membawa pembaharuan egaliter dan memajukan peradaban bersama.' },
];

/**
 * Resonant Divine Names (Asmaul Husna) mapped by Jumal value and spiritual resonance
 */
export interface ResonantAsmaInfo {
  arabic: string;
  latin: string;
  meaning: string;
  jumalValue: number;
  spiritualEfficacy: string;
}

export const ASMAUL_HUSNA_LIST: ResonantAsmaInfo[] = [
  { arabic: 'يَا اللهُ', latin: 'Ya Allah', meaning: 'Wahai Dzat Yang Maha Tunggal Pencipta Segala Wujud', jumalValue: 66, spiritualEfficacy: 'Menghadirkan ketenangan tauhid, memperkuat keyakinan, dan menyinari nurani.' },
  { arabic: 'يَا رَحْمَنُ', latin: 'Ya Rahman', meaning: 'Wahai Dzat Yang Maha Pengasih Tiada Batas', jumalValue: 298, spiritualEfficacy: 'Melunakkan hati yang keras, menumbuhkan cinta kasih, dan menarik welas asih alam semesta.' },
  { arabic: 'يَا رَحِيمُ', latin: 'Ya Rahim', meaning: 'Wahai Dzat Yang Maha Penyayang', jumalValue: 258, spiritualEfficacy: 'Mendatangkan pertolongan khusus dalam kesulitan dan perlindungan dari marabahaya.' },
  { arabic: 'يَا مَلِكُ', latin: 'Ya Malik', meaning: 'Wahai Dzat Yang Maha Merajai Alam Semesta', jumalValue: 90, spiritualEfficacy: 'Menumbuhkan wibawa kepemimpinan yang disegani dan menstabilkan derajat hidup.' },
  { arabic: 'يَا قُدُّوسُ', latin: 'Ya Quddus', meaning: 'Wahai Dzat Yang Maha Suci dari Segala Cela', jumalValue: 170, spiritualEfficacy: 'Menyucikan pikiran dari bisikan waswas dan membersihkan rezeki dari syubhat.' },
  { arabic: 'يَا سَلَامُ', latin: 'Ya Salam', meaning: 'Wahai Dzat Yang Maha Memberi Keselamatan', jumalValue: 131, spiritualEfficacy: 'Menebar keselamatan jiwa raga, mendamaikan sengketa, dan mengusir keresahan batin.' },
  { arabic: 'يَا مُؤْمِنُ', latin: 'Ya Mu\'min', meaning: 'Wahai Dzat Yang Memberi Keamanan & Membenarkan', jumalValue: 136, spiritualEfficacy: 'Memberikan rasa aman dari ancaman kejahatan dan mengokohkan kejujuran.' },
  { arabic: 'يَا عَزِيزُ', latin: 'Ya \'Aziz', meaning: 'Wahai Dzat Yang Maha Perkasa Tak Tertandingi', jumalValue: 94, spiritualEfficacy: 'Menghindarkan dari kehinaan dan mengangkat martabat di mata khalayak.' },
  { arabic: 'يَا وَهَّابُ', latin: 'Ya Wahhab', meaning: 'Wahai Dzat Yang Maha Memberi Karunia Tanpa Syarat', jumalValue: 14, spiritualEfficacy: 'Membukakan pintu anugerah tak terduga dan kemudahan dalam urusan sandang pangan.' },
  { arabic: 'يَا رَزَّاقُ', latin: 'Ya Razzaq', meaning: 'Wahai Dzat Yang Maha Melimpahkan Rezeki', jumalValue: 308, spiritualEfficacy: 'Memperlancar arus rezeki halal, memajukan usaha perniagaan, dan mencukupkan nafkah.' },
  { arabic: 'يَا فَتَّاحُ', latin: 'Ya Fattah', meaning: 'Wahai Dzat Yang Maha Membuka Pintu Kemudahan', jumalValue: 489, spiritualEfficacy: 'Membuka segala simpul kebuntuan, melonggarkan hati yang sempit, dan menyingkap jalan keluar.' },
  { arabic: 'يَا عَلِيمُ', latin: 'Ya \'Alim', meaning: 'Wahai Dzat Yang Maha Mengetahui Segala Rahasia', jumalValue: 150, spiritualEfficacy: 'Mempercepat penyerapan ilmu pengetahuan, mencerdaskan akal, dan menajamkan hafalan.' },
  { arabic: 'يَا لَطِيفُ', latin: 'Ya Latif', meaning: 'Wahai Dzat Yang Maha Lembut Memperhatikan Hamba-Nya', jumalValue: 129, spiritualEfficacy: 'Melancarkan kesulitan dengan cara yang tak terduga dan meneduhkan amarah musuh.' },
  { arabic: 'يَا كَرِيمُ', latin: 'Ya Karim', meaning: 'Wahai Dzat Yang Maha Pemurah Lagi Mulia', jumalValue: 270, spiritualEfficacy: 'Menghias diri dengan akhlak dermawan dan dimuliakan dalam majelis pergaulan.' },
  { arabic: 'يَا مُجِيبُ', latin: 'Ya Mujib', meaning: 'Wahai Dzat Yang Maha Mengabulkan Doa', jumalValue: 55, spiritualEfficacy: 'Mempercepat terkabulnya hajat permohonan dan mendekatkan pertolongan ilahi.' },
  { arabic: 'يَا وَدُودُ', latin: 'Ya Wadud', meaning: 'Wahai Dzat Yang Maha Mencintai & Mengasihi', jumalValue: 20, spiritualEfficacy: 'Mengharmoniskan hubungan asmara dan keluarga serta menyatukan hati yang berselisih.' },
  { arabic: 'يَا حَقُّ', latin: 'Ya Haqq', meaning: 'Wahai Dzat Yang Maha Benar Lagi Nyata', jumalValue: 108, spiritualEfficacy: 'Menegakkan keadilan, menepis fitnah keji, dan mengembalikan hak yang terampas.' },
  { arabic: 'يَا نُورُ', latin: 'Ya Nur', meaning: 'Wahai Dzat Yang Menerangi Langit & Bumi', jumalValue: 256, spiritualEfficacy: 'Menerangi wajah dengan aura berseri dan menyinari jalan hidup di saat gulita.' },
];

/**
 * Historical/Cultural Presets for quick exploration
 */
export interface JumalPreset {
  id: string;
  nameLatin: string;
  nameArabic: string;
  day: DayKey;
  pasaran: PasaranKey;
  description: string;
  fameRole: string;
}

export const CULTURAL_JUMAL_PRESETS: JumalPreset[] = [
  {
    id: 'gus_dur',
    nameLatin: 'Abdurrahman Wahid',
    nameArabic: 'عَبْدُ الرَّحْمَنِ وَاحِد',
    day: 'senin',
    pasaran: 'wage',
    description: 'Presiden RI ke-4, cendekiawan Muslim pejuang toleransi kemanusiaan dan pluralisme Nusantara.',
    fameRole: 'Ulama Pengayom & Bapak Pluralisme',
  },
  {
    id: 'soekarno',
    nameLatin: 'Ahmad Soekarno',
    nameArabic: 'أَحْمَد سُوكَرْنُو',
    day: 'kamis',
    pasaran: 'pon',
    description: 'Proklamator Kemerdekaan Indonesia, orator ulung, dan penggali Pancasila (Putra Sang Fajar).',
    fameRole: 'Proklamator & Pemimpin Bangsa',
  },
  {
    id: 'sunan_kalijaga',
    nameLatin: 'Raden Mas Said',
    nameArabic: 'رَادِين مَاس سَعِيد',
    day: 'jumat',
    pasaran: 'pahing',
    description: 'Wali Songo pelopor akulturasi budaya Islam dengan seni gamelan, wayang, dan kearifan Nusantara.',
    fameRole: 'Wali Songo & Tokoh Kebudayaan',
  },
  {
    id: 'kartini',
    nameLatin: 'Raden Ajeng Kartini',
    nameArabic: 'رَادِين أَاجِينج كَارْتِينِي',
    day: 'senin',
    pasaran: 'legi',
    description: 'Pahlawan nasional pejuang emansipasi wanita, literasi, dan pencerahan batin anak bangsa.',
    fameRole: 'Pelopor Emansipasi & Pendidikan',
  },
  {
    id: 'habibie',
    nameLatin: 'Bacharuddin Jusuf Habibie',
    nameArabic: 'بَحْرُ الدِّين يُوسُف حَبِيبِي',
    day: 'kamis',
    pasaran: 'wage',
    description: 'Presiden RI ke-3, pakar dirgantara dunia berjuluk Mr. Crack, perpaduan imtak dan iptek.',
    fameRole: 'Ilmuwan Dirgantara & Teknokrat',
  },
  {
    id: 'al_biruni',
    nameLatin: 'Abu Raihan Muhammad',
    nameArabic: 'أَبُو الرَّيْحَان مُحَمَّد',
    day: 'rabu',
    pasaran: 'kliwon',
    description: 'Master astronomi, matematika, dan perintis perbandingan kebudayaan pengarang Al-Qanun al-Mas\'udi.',
    fameRole: 'Filsuf Astronom & Ensiklopedis Islam',
  },
];

/**
 * Transliterate Latin text to Arabic / Pegon representation
 */
export function transliterateLatinToArabic(latinText: string): string {
  if (!latinText) return '';

  let text = latinText.toLowerCase().trim();

  // Common titles / particles cleanup
  text = text.replace(/^(raden|kyai|gus|sayyid|habib|teuku|sultan)\s+/i, '');

  const rules: [RegExp, string][] = [
    // Multigraphs
    [/kh/g, 'خ'],
    [/sy/g, 'ش'],
    [/sh/g, 'ش'],
    [/th/g, 'ث'],
    [/ts/g, 'ث'],
    [/dh/g, 'ض'],
    [/dz/g, 'ذ'],
    [/gh/g, 'غ'],
    [/ch/g, 'چ'],
    [/ng/g, 'ڠ'],
    [/ny/g, 'ڽ'],

    // Specific Nusantara sounds
    [/p/g, 'ڤ'],
    [/c/g, 'چ'],
    [/g/g, 'ݢ'],

    // Standard consonants
    [/b/g, 'ب'],
    [/j/g, 'ج'],
    [/d/g, 'د'],
    [/h/g, 'ه'],
    [/w/g, 'و'],
    [/z/g, 'ز'],
    [/y/g, 'ي'],
    [/k/g, 'ك'],
    [/l/g, 'ل'],
    [/m/g, 'م'],
    [/n/g, 'ن'],
    [/s/g, 'س'],
    [/f/g, 'ف'],
    [/v/g, 'ف'],
    [/q/g, 'ق'],
    [/r/g, 'ر'],
    [/t/g, 'ت'],
    [/x/g, 'كس'],

    // Initial vowels
    [/^a/g, 'ا'],
    [/^i/g, 'إِ'],
    [/^u/g, 'أُ'],
    [/^e/g, 'إِ'],
    [/^o/g, 'أُو'],
    [/\s+a/g, ' ا'],
    [/\s+i/g, ' إِ'],
    [/\s+u/g, ' أُ'],
    [/\s+e/g, ' إِ'],
    [/\s+o/g, ' أُو'],

    // Medial & final vowels
    [/aa/g, 'ا'],
    [/ai/g, 'اي'],
    [/au/g, 'او'],
    [/a/g, 'ا'],
    [/i/g, 'ي'],
    [/u/g, 'و'],
    [/e/g, 'ي'],
    [/o/g, 'و'],
  ];

  for (const [regex, repl] of rules) {
    text = text.replace(regex, repl);
  }

  // Remove non-Arabic characters
  text = text.replace(/[^\u0600-\u06FF\s]/g, '');
  // Normalize double spaces
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Calculate simple Jumal Kabir value for an Arabic or Latin text
 */
export function calculateSimpleJumal(text: string): number {
  if (!text || !text.trim()) return 0;
  let arabic = text;
  // If text contains latin characters, transliterate first
  if (/[a-zA-Z]/.test(text)) {
    arabic = transliterateLatinToArabic(text);
  }
  let sum = 0;
  for (const ch of arabic) {
    const base = ch.normalize('NFD').replace(/[\u064B-\u065F\u0670]/g, '');
    if (ABJAD_TABLE[base]) {
      sum += ABJAD_TABLE[base].value;
    }
  }
  return sum > 0 ? sum : Math.max(1, text.length * 7);
}

/**
 * Breakdown of single letter from parsed Arabic name
 */
export interface AnalyzedLetter {
  char: string;
  name: string;
  value: number;
  element: ElementType;
  elementArabic: string;
  nature: string;
  natureArabic: string;
  spiritualNote: string;
}

/**
 * Full Analysis Result of Hisab Jumal & Pasaran
 */
export interface HisabJumalReport {
  inputNameLatin: string;
  arabicName: string;
  lettersBreakdown: AnalyzedLetter[];
  totalJumalKabir: number;
  totalJumalSaghir: number; // Modulo 9 root digit (1-9)
  lettersCount: number;

  // Elemental Profile
  elementsBreakdown: {
    element: ElementType;
    elementArabic: string;
    count: number;
    valueSum: number;
    percentage: number;
    color: string;
    natureSummary: string;
  }[];
  dominantElement: ElementType;
  dominantElementArabic: string;
  secondaryElement: ElementType;
  elementalTemperament: string;

  // Day & Pasaran Weton Info
  dayInfo: DayInfo;
  pasaranInfo: PasaranInfo;
  neptuDino: number;
  neptuPasaran: number;
  neptuWetonTotal: number;
  neptuPlusJumal: number;

  // Javanese Pancasuda / Hastawara Category
  pancasuda: {
    index: number;
    name: string;
    javaneseTerm: string;
    meaning: string;
    advice: string;
  };

  // Planetary Ruler & Spiritual Zodiac
  rulerPlanet: RulerPlanetDetail;
  spiritualBurj: SpiritualBurjDetail;

  // Personal Character & Life Dynamics
  characterTraits: {
    coreVirtues: string[];
    communicationStyle: string;
    leadershipPotential: string;
    emotionalDisposition: string;
    cautionPoints: string[];
  };

  // Fortune & Prosperity Dynamics
  fortuneDynamics: {
    fortuneIndex: number; // 0-100%
    bestSectors: string[];
    auspiciousDay: string;
    auspiciousDirection: string;
    auspiciousDirectionArabic: string;
    practicalAdvice: string;
  };

  // Spiritual Remediation & Resonant Asmaul Husna
  spiritualRemedy: {
    closestAsma: ResonantAsmaInfo;
    recommendedDhikrCount: number;
    spiritualAdvice: string;
  };
}

/**
 * Compute full Hisab Jumal & Pasaran Report
 */
export function calculateHisabJumalReport(
  nameInput: string,
  dayKey: DayKey,
  pasaranKey: PasaranKey,
  customArabic?: string
): HisabJumalReport {
  // Determine Arabic text
  let arabicText = customArabic && customArabic.trim().length > 0
    ? customArabic.trim()
    : transliterateLatinToArabic(nameInput);

  if (!arabicText) {
    arabicText = 'أَحْمَد'; // Default fallback
  }

  // Analyze letters
  const lettersBreakdown: AnalyzedLetter[] = [];
  let totalJumalKabir = 0;

  for (const ch of arabicText) {
    if (ch === ' ' || ch === '\t' || ch === '\n') continue;
    // Harakat ignore or match base
    const baseChar = ch.normalize('NFD').replace(/[\u064B-\u065F\u0670]/g, '');
    if (!baseChar) continue;

    const info = ABJAD_TABLE[baseChar] || ABJAD_TABLE['ا'];
    lettersBreakdown.push({
      char: baseChar,
      name: info.name,
      value: info.value,
      element: info.element,
      elementArabic: info.elementArabic,
      nature: info.nature,
      natureArabic: info.natureArabic,
      spiritualNote: info.spiritualNote,
    });
    totalJumalKabir += info.value;
  }

  // Modulo 9 root digit (Hisab Saghir: 1 to 9)
  let totalJumalSaghir = totalJumalKabir % 9;
  if (totalJumalSaghir === 0) totalJumalSaghir = 9;

  // Calculate Elemental Counts
  const elementCounts: Record<ElementType, { count: number; valueSum: number }> = {
    Api: { count: 0, valueSum: 0 },
    Tanah: { count: 0, valueSum: 0 },
    Udara: { count: 0, valueSum: 0 },
    Air: { count: 0, valueSum: 0 },
  };

  lettersBreakdown.forEach((l) => {
    elementCounts[l.element].count += 1;
    elementCounts[l.element].valueSum += l.value;
  });

  const totalLetters = Math.max(1, lettersBreakdown.length);

  const elementsBreakdown = (['Api', 'Tanah', 'Udara', 'Air'] as ElementType[]).map((el) => {
    const count = elementCounts[el].count;
    const valueSum = elementCounts[el].valueSum;
    const percentage = Math.round((count / totalLetters) * 100);

    let elementArabic = 'ناري';
    let color = '#ef4444';
    let natureSummary = 'Semangat, keberanian, inisiatif, dan kepemimpinan dinamis.';

    if (el === 'Tanah') {
      elementArabic = 'ترابي';
      color = '#eab308';
      natureSummary = 'Keteguhan, kesabaran, realistis, dan ketelitian membangun fondasi.';
    } else if (el === 'Udara') {
      elementArabic = 'هوائي';
      color = '#38bdf8';
      natureSummary = 'Kecerdasan, diplomasi, kemampuan analisis, dan fleksibilitas bergaul.';
    } else if (el === 'Air') {
      elementArabic = 'مائي';
      color = '#34d399';
      natureSummary = 'Empati, intuisi tajam, kelembutan rasa, dan daya adaptasi damai.';
    }

    return {
      element: el,
      elementArabic,
      count,
      valueSum,
      percentage,
      color,
      natureSummary,
    };
  });

  // Sort to find dominant & secondary elements
  const sortedElements = [...elementsBreakdown].sort((a, b) => b.count - a.count);
  const dominantElement = sortedElements[0].element;
  const dominantElementArabic = sortedElements[0].elementArabic;
  const secondaryElement = sortedElements[1].element;

  let elementalTemperament = 'Seimbang Berpadu (Mu\'tadil)';
  if (dominantElement === 'Api') {
    elementalTemperament = 'Temperamen Harr Yabis (Panas-Kering) - Berjiwa Pelopor & Pemberani';
  } else if (dominantElement === 'Tanah') {
    elementalTemperament = 'Temperamen Barid Yabis (Dingin-Kering) - Tenang, Berhati-hati, & Setia';
  } else if (dominantElement === 'Udara') {
    elementalTemperament = 'Temperamen Harr Ratb (Panas-Basah) - Komunikatif, Berwawasan Luas, & Ramah';
  } else if (dominantElement === 'Air') {
    elementalTemperament = 'Temperamen Barid Ratb (Dingin-Basah) - Penuh Kasih, Intuitif, & Pengayom';
  }

  // Weton calculations
  const dayInfo = SAPTA_WARA[dayKey];
  const pasaranInfo = PANCA_WARA[pasaranKey];
  const neptuDino = dayInfo.neptu;
  const neptuPasaran = pasaranInfo.neptu;
  const neptuWetonTotal = neptuDino + neptuPasaran;
  const neptuPlusJumal = neptuWetonTotal + totalJumalKabir;

  // Pancasuda calculation: (Neptu Weton + Jumal Saghir) % 5
  // Traditional Petung: 1=Sri, 2=Rejeki, 3=Gedhong, 4=Loro, 5=Pati
  const pancaMod = ((neptuWetonTotal + totalJumalSaghir) % 5) || 5;
  const PANCASUDA_TABLE = [
    {
      index: 1,
      name: 'Sri (Kemuliaan & Berkah Kasih)',
      javaneseTerm: 'Sri',
      meaning: 'Dikaruniai kemuliaan budi, disukai banyak kalangan, dan mudah memperoleh pertolongan tak terduga.',
      advice: 'Jaga kerendahan hati dan perbanyak kedermawanan kepada sesama.',
    },
    {
      index: 2,
      name: 'Rejeki (Kelancaran Usaha & Sandang Pangan)',
      javaneseTerm: 'Rejeki',
      meaning: 'Pintu rezeki senantiasa terbuka luas, memiliki bakat perniagaan dan kemakmuran keluarga.',
      advice: 'Gunakan kemudahan finansial untuk investasi yang bermanfaat dan bersedekah.',
    },
    {
      index: 3,
      name: 'Gedhong (Kapasitas Aset & Simpanan)',
      javaneseTerm: 'Gedhong',
      meaning: 'Bakat dalam mengumpulkan aset permanen, teliti berhemat, dan mampu membangun kemandirian ekonomi.',
      advice: 'Hindari sifat terlalu mencemaskan masa depan; seimbangkan antara menabung dan menikmati hidup.',
    },
    {
      index: 4,
      name: 'Loro (Ujian Ketabahan Jiwa & Raga)',
      javaneseTerm: 'Loro',
      meaning: 'Sering ditempa ujian kesehatan raga atau kekhawatiran batin yang menjadikannya berhati baja.',
      advice: 'Jaga pola istirahat, hindari stres berlebih, dan dekatkan diri dalam munajat ketenangan batin.',
    },
    {
      index: 5,
      name: 'Pati (Kekuatan Transformasi & Kebangkitan)',
      javaneseTerm: 'Pati',
      meaning: 'Memiliki daya tahan luar biasa untuk bangkit kembali setelah mengalami keruntuhan atau cobaan berat.',
      advice: 'Pandang setiap kegagalan sebagai gerbang kelahiran fase baru yang lebih mulia dan berwibawa.',
    },
  ];
  const pancasuda = PANCASUDA_TABLE.find((p) => p.index === pancaMod) || PANCASUDA_TABLE[0];

  // Ruler Planet: Total Jumal % 7
  const planetIdx = totalJumalKabir % 7;
  const rulerPlanet = RULER_PLANETS[planetIdx];

  // Spiritual Zodiac: Total Jumal % 12
  const burjIdx = totalJumalKabir % 12;
  const spiritualBurj = SPIRITUAL_BURUJ[burjIdx];

  // Character Traits
  const coreVirtues: string[] = [];
  if (dominantElement === 'Api') {
    coreVirtues.push('Memiliki inisiatif tinggi dan keberanian mengambil keputusan sulit');
    coreVirtues.push('Optimis, bersemangat membara, dan tidak mudah menyerah oleh kegagalan');
  } else if (dominantElement === 'Tanah') {
    coreVirtues.push('Sangat amanah, dapat diandalkan, dan setia pada komitmen janji');
    coreVirtues.push('Penyabar, teliti dalam merencanakan sesuatu, dan berpendirian kokoh');
  } else if (dominantElement === 'Udara') {
    coreVirtues.push('Cerdas menganalisis persoalan rumit dan pandai menemukan solusi kreatif');
    coreVirtues.push('Kemampuan diplomasi tinggi, luwes bergaul, dan berwawasan luas');
  } else {
    coreVirtues.push('Memiliki empati batin yang mendalam dan peka terhadap perasaan orang lain');
    coreVirtues.push('Penyayang, suka mendamaikan perselisihan, dan berintuisi tajam');
  }

  coreVirtues.push(dayInfo.lakuningMeaning);
  coreVirtues.push(pasaranInfo.character);

  const cautionPoints: string[] = [];
  if (dominantElement === 'Api') {
    cautionPoints.push('Kecenderungan tergesa-gesa atau mudah tersulut rasa tidak sabar saat rencana tertunda.');
  } else if (dominantElement === 'Tanah') {
    cautionPoints.push('Kecenderungan terlalu kaku atau sulit menerima perubahan mendadak yang di luar rencana.');
  } else if (dominantElement === 'Udara') {
    cautionPoints.push('Potensi terlalu banyak menimbang sehingga menunda eksekusi nyata.');
  } else {
    cautionPoints.push('Mudah terbawa suasana hati orang lain atau terlalu memendam luka batin sendiri.');
  }

  // Fortune Dynamics
  // Base fortune score based on harmonizing factors
  let fortuneBase = 65;
  if (pancasuda.index === 1 || pancasuda.index === 2) fortuneBase += 15;
  if (rulerPlanet.key === 'jupiter' || rulerPlanet.key === 'venus' || rulerPlanet.key === 'sun') fortuneBase += 12;
  if (neptuWetonTotal >= 13) fortuneBase += 8;
  const fortuneIndex = Math.min(96, Math.max(45, fortuneBase));

  const bestSectors: string[] = [];
  if (dominantElement === 'Api' || rulerPlanet.key === 'mars' || rulerPlanet.key === 'sun') {
    bestSectors.push('Kepemimpinan, Manajemen Eksekutif, & Wirausaha Mandiri');
    bestSectors.push('Bidang Pertahanan, Hukum, Ekspedisi, & Industri Logam/Energi');
  }
  if (dominantElement === 'Udara' || rulerPlanet.key === 'mercury') {
    bestSectors.push('Perniagaan, Diplomasi, Riset Ilmiah, & Teknologi Informasi');
    bestSectors.push('Pendidikan, Komunikasi Publik, Penerbitan, & Konsultasi');
  }
  if (dominantElement === 'Air' || rulerPlanet.key === 'moon' || rulerPlanet.key === 'venus') {
    bestSectors.push('Seni Kreatif, Diplomasi Sosial, Hubungan Masyarakat, & Kuliner');
    bestSectors.push('Kesehatan Jiwa/Raga, Pelayanan Publik, & Perdagangan Maritim');
  }
  if (dominantElement === 'Tanah' || rulerPlanet.key === 'saturn') {
    bestSectors.push('Properti, Konstruksi, Pertanian, Perbankan, & Administrasi');
    bestSectors.push('Manajemen Aset Jangka Panjang, Audit Keuangan, & Konservasi');
  }

  // Resonant Asmaul Husna
  // Find the Asmaul Husna whose numerical difference to Jumal is closest or resonant
  let closestAsma = ASMAUL_HUSNA_LIST[0];
  let minDiff = 999999;
  for (const asma of ASMAUL_HUSNA_LIST) {
    const diff = Math.abs((totalJumalKabir % 500) - (asma.jumalValue % 500));
    if (diff < minDiff) {
      minDiff = diff;
      closestAsma = asma;
    }
  }

  const recommendedDhikrCount = totalJumalSaghir * 11 + closestAsma.jumalValue;

  return {
    inputNameLatin: nameInput,
    arabicName: arabicText,
    lettersBreakdown,
    totalJumalKabir,
    totalJumalSaghir,
    lettersCount: lettersBreakdown.length,
    elementsBreakdown,
    dominantElement,
    dominantElementArabic,
    secondaryElement,
    elementalTemperament,
    dayInfo,
    pasaranInfo,
    neptuDino,
    neptuPasaran,
    neptuWetonTotal,
    neptuPlusJumal,
    pancasuda,
    rulerPlanet,
    spiritualBurj,
    characterTraits: {
      coreVirtues,
      communicationStyle: `Gaya bertutur dipengaruhi oleh rasi batin ${spiritualBurj.name} dan planet ${rulerPlanet.name}.`,
      leadershipPotential: `Potensi kepemimpinan bercorak ${dayInfo.lakuning} dengan ketegasan elemen ${dominantElement}.`,
      emotionalDisposition: elementalTemperament,
      cautionPoints,
    },
    fortuneDynamics: {
      fortuneIndex,
      bestSectors,
      auspiciousDay: rulerPlanet.blessingDay,
      auspiciousDirection: pasaranInfo.direction,
      auspiciousDirectionArabic: pasaranInfo.directionArabic,
      practicalAdvice: `Hari keberkahan utama Anda jatuh pada hari ${rulerPlanet.blessingDay} dinaungi kawkab ${rulerPlanet.name}. Hendaknya memulai urusan penting dan berniaga menghadap arah ${pasaranInfo.direction} (${pasaranInfo.directionArabic}).`,
    },
    spiritualRemedy: {
      closestAsma,
      recommendedDhikrCount,
      spiritualAdvice: `Nama Anda selaras dengan asma mulia "${closestAsma.arabic} (${closestAsma.latin})". Khasiatnya: ${closestAsma.spiritualEfficacy}. Dianjurkan diwiridkan sebanyak ${recommendedDhikrCount} kali terutama pada malam ${rulerPlanet.blessingDay} setelah munajat.`,
    },
  };
}
