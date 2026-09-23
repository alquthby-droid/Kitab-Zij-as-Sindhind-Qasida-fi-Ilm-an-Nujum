/**
 * Authentic Historical Manuscripts Corpus:
 * 1. Zij as-Sindhind (Muhammad ibn Musa al-Khwarizmi & Maslama al-Majriti)
 * 2. Qasida fi 'Ilm an-Nujum (Classical Astrological Didactic Poetry)
 * With remote archive metadata and comparative textual apparatus.
 */

import { ManuscriptDocument, RemoteManuscriptSearchResult } from '../types';

export const MANUSCRIPT_DOCUMENTS: ManuscriptDocument[] = [
  {
    id: 'zij-as-sindhind',
    titleArabic: 'زيج السند هند الكبير',
    titleLatin: 'Zij as-Sindhind al-Kabir',
    authorArabic: 'محمد بن موسى الخوارزمي (تهذيب مسلمة المجريطي)',
    authorLatin: 'Muhammad ibn Musa al-Khwarizmi (Recension of Maslama al-Majriti)',
    dateEra: 'c. 205 H / 820 M (Recension c. 390 H / 1000 M)',
    provenance: 'Baghdad (Dar al-Hikmah) & Cordoba (al-Andalus)',
    repository: 'Bibliothèque nationale de France (Paris) / Bodleian Library (Oxford)',
    shelfmark: 'BnF MS Arabe 2478 / Bodleian MS Seld. Arch. A. 32 / Feyzullah 1407',
    primaryLanguage: 'العربية الكلاسيكية (Classical Arabic)',
    folioCount: 168,
    historicalContext:
      'Zij as-Sindhind adalah karya monumental dalam sejarah astronomi Islam yang mengintegrasikan metode astronomi India kuno (Brahmasphutasiddhanta karya Brahmagupta) dengan astronomi Sasaniyah (Zij-i Shah) dan Helenistik Ptolemeus. Diterjemahkan dan diadaptasi oleh Al-Khwarizmi atas perintah Khalifah Al-Ma\'mun, kemudian disunting oleh ilmuwan Andalusia Maslama al-Majriti dan diterjemahkan ke bahasa Latin oleh Adelard of Bath.',
    description:
      'Memuat tabel gerakan rata-rata planet (al-wasat), penyesuaian sudut (ta\'dil al-kawakib), posisi apogee (al-awj), node bulan (al-jawzahar), kalkulasi gerhana matahari dan bulan, serta konversi era tarikh kuno.',
    featuredFolios: [
      {
        folioNumber: 'Folio 9b',
        diagramType: 'Tabel Ta\'dil ash-Shams (Equation of the Sun)',
        transcription:
          '«باب في استخراج وسط الشمس وتعديلها بأصول السند هند: خذ أيام الأهرجان واضربها في مسير الشمس اليومي، ثم ادخل في جدول التعديل بمركز الشمس، فما خرج زده إن كان المركز أقل من ستة بروج، وانقصه إن كان أكثر».',
        translation:
          'Bab menghitung posisi rata-rata matahari dan persamaannya menurut kaidah Sindhind: Ambillah hari-hari Ahargana, kalikan dengan pergerakan harian matahari, lalu masukkan ke dalam tabel ta\'dil dengan pusat matahari. Tambahkan hasilnya jika pusat kurang dari enam rasi, dan kurangkan jika lebih.',
      },
      {
        folioNumber: 'Folio 23a',
        diagramType: 'Diagram Falak al-Jawzahar (Lunar Orbit & Nodes)',
        transcription:
          '«صورة فلك الجوزهر وموضع الرأس والذنب: وفيه ينعقد الكسوفان إذا قارن القمر الشمس عند الرأس أو عارضها عند الذنب في عرض يسير لا يتجاوز درجتين».',
        translation:
          'Gambar orbit al-Jawzahar serta posisi Kepala (ar-Ra\'s) dan Ekor Naga (adh-Dhanab): Di sinilah terjadi kedua gerhana manakala rembulan berkonjungsi dengan matahari di dekat Kepala atau beroposisi di dekat Ekor dengan lintang sempit tidak melebihi dua derajat.',
      },
      {
        folioNumber: 'Folio 47b',
        diagramType: 'Tabel Matali\' al-Buruj (Oblique Ascensions for 33° Latitude)',
        transcription:
          '«جدول مطالع البروج في الفلك المائل لبلد بغداد الذي عرضه ثلاث وثلاثون درجة: لمعرفة درجة الطالع وأوتاد السماء عند كل ساعة من ساعات الليل والنهار».',
        translation:
          'Tabel terbitnya rasi-rasi bintang pada falak miring untuk lintang Baghdad 33 derajat: guna mengetahui derajat Ascendant (at-Tali\') dan tiang-tiang langit (awtad as-sama\') pada setiap jam malam dan siang.',
      },
    ],
    chapters: [
      {
        id: 'ch-chronology',
        titleArabic: 'الباب الأول: في معرفة تواريخ الأمم وحساب الأيام',
        titleLatin: 'Bab I: On Chronological Eras & Reckoning of Days',
        contentSummary:
          'Membahas konversi tarikh antara Tarikh Yazdajird, Tarikh al-Hijrah, Tarikh al-Iskandar (Seleucid), dan Ahargana hari-hari era Sindhind.',
        versesOrPassages: [
          {
            id: 'zij-1-1',
            cantoNumber: 1,
            cantoTitleArabic: 'أصل التاريخ وحساب الأيام',
            cantoTitleLatin: 'Epoch & Reckoning of Days',
            verseNumber: 1,
            arabicText:
              '«اعْلَمْ أَنَّ أَصْلَ حِسَابِ السِّنْدِ هِنْدِ مَبْنِيٌّ عَلَى أَيَّامِ الأَهْرَجَانِ، وَهِيَ الأَيَّامُ الْمَجْمُوعَةُ مِنْ أَوَّلِ عَصْرِ كَلْيُوكَ إِلَى الْوَقْتِ الْمَطْلُوبِ بِحَرَكَةِ الشَّمْسِ الْمُسْتَوِيَةِ».',
            transliteration:
              'I\'lam anna asla hisabi as-Sindihindi mabniyyun \'ala ayyami al-Ahrajani, wa hiya al-ayyamu al-majmu\'atu min awwali \'asri Kalyuka ila al-waqti al-matlubi bi-harakati ash-shamsi al-mustawiyah.',
            meter: 'النثر العلمي المسجوع (Classical Scientific Prose)',
            translationId:
              'Ketahuilah bahwa asas perhitungan as-Sindhind bersandar pada bilangan hari-hari Ahargana, yakni himpunan hari sejak permulaan era Kaliyuga hingga waktu yang hendak dihisab dengan pergerakan matahari rata-rata.',
            translationEn:
              'Know that the foundation of the Sindhind computation is built upon the days of Ahargana, which are the days accumulated from the beginning of the Kaliyuga epoch to the desired time.',
            commentary:
              'Al-Khwarizmi mengadopsi konstanta Ahargana dari naskah astronomi India abad ke-8 yang dibawa oleh delegasi ilmuwan Sindh ke istana Khalifah Al-Mansur di Baghdad pada tahun 771 M.',
            astrologicalConcept: 'Tarikh, Ahargana, Kalpa, Hisab al-Ayyam',
            tags: ['chronology', 'ahargana', 'kaliyuga', 'sindhind', 'eras'],
          },
          {
            id: 'zij-1-2',
            cantoNumber: 1,
            cantoTitleArabic: 'معرفة السنين الفارسية (تاريخ يزدجرد)',
            cantoTitleLatin: 'The Era of Yazdegerd III',
            verseNumber: 2,
            arabicText:
              '«وَإِنْ أَرَدْتَ تَحْوِيلَ التَّارِيخِ الْفَارِسِيِّ فَاعْلَمْ أَنَّ كُلَّ سَنَةٍ ثَلَاثُمِائَةٍ وَخَمْسَةٌ وَسِتُّونَ يَوْمًا بِلَا كَبِيسَةٍ، اثْنَا عَشَرَ شَهْرًا كُلُّ شَهْرٍ ثَلَاثُونَ يَوْمًا، وَالْخَمْسَةُ الْمُسْتَرَقَةُ تُوضَعُ بَعْدَ أَبَان مَاهْ أَوْ فِي آخِرِ السَّنَةِ».',
            transliteration:
              'Wa in aradta tahwila at-tarikhi al-farisiyyi fa\'lam anna kulla sanatin thalathumi\'atin wa khamsatun wa sittuna yawman bila kabisatin, ithna \'ashara shahran kullu shahrin thalathuna yawman, wal-khamsatu al-mustaraqatu tuda\'u ba\'da Aban Mah aw fi akhiri as-sanah.',
            meter: 'النثر العلمي المسجوع',
            translationId:
              'Dan jika engkau hendak mengonversi tarikh Persia (Yazdajird), ketahuilah bahwa tiap tahunnya berjumlah 365 hari tanpa tahun kabisat, terbagi dalam dua belas bulan yang masing-masing tiga puluh hari, serta lima hari tambahan (al-mustaraqah/andargah) yang diletakkan di akhir tahun.',
            translationEn:
              'If you wish to convert the Persian era of Yazdegerd, know that every year comprises 365 days without intercalation, consisting of twelve months of thirty days each, and five epagomenal days.',
            commentary:
              'Para ahli falak Islam lebih menyukai kalender Yazdajird dalam tabel-tabel Zij karena perhitungannya linear tanpa interkalasi kabisat yang rumit.',
            astrologicalConcept: 'Tarikh Yazdajird, Andargah, Epagomenal Days',
            tags: ['yazdajird', 'persian', 'calendar', 'ephemeris'],
          },
        ],
      },
      {
        id: 'ch-sun-moon',
        titleArabic: 'الباب الثاني: في تعديل الشمس والقمر وعقدة الجوزهر',
        titleLatin: 'Bab II: Equations of Sun, Moon & Lunar Nodes',
        contentSummary:
          'Formula trigonometri sinus kuno untuk menghitung persamaan pusat (ta\'dil) matahari dan bulan serta posisi simpul bulan.',
        versesOrPassages: [
          {
            id: 'zij-2-1',
            cantoNumber: 2,
            cantoTitleArabic: 'تعديل الشمس بالجيب الهندي',
            cantoTitleLatin: 'Equation of Center via Indian Sine',
            verseNumber: 1,
            arabicText:
              '«إِذَا أَرَدْتَ مَوْضِعَ الشَّمْسِ الْمُعَدَّلَ، فَاطْرَحْ أَوْجَ الشَّمْسِ مِنْ وَسَطِهَا، فَمَا بَقِيَ فَهُوَ الْحِصَّةُ، فَخُذْ جَيْبَهَا وَاضْرِبْهُ فِي التَّعْدِيلِ الأَعْظَمِ وَهُوَ دَرَجَتَانِ وَأَرْبَعَ عَشْرَةَ دَقِيقَةً عَلَى رَأْيِ السِّنْدِ هِنْدِ».',
            transliteration:
              'Idha aradta mawdi\'a ash-shamsi al-mu\'addala, fa-trah awja ash-shamsi min wasatiha, fa-ma baqiya fa-huwa al-hissatu, fa-khudh jaybaha wa-dribhu fi at-ta\'dili al-a\'zami wa huwa darajatani wa arba\'a \'ashrata daqiqatan \'ala ra\'yi as-Sindhind.',
            meter: 'النثر العلمي',
            translationId:
              'Apabila engkau mencari kedudukan matahari yang telah diperbaiki (true longitude), kurangkan titik apogee (al-awj) dari garis rata-ratanya (al-wasat). Sisanya adalah anomali (al-hissah); ambillah sinusnya (jayb) dan kalikan dengan nilai ta\'dil maksimum yakni 2 derajat 14 menit menurut ketetapan Sindhind.',
            translationEn:
              'If you seek the true position of the Sun, subtract the apogee from its mean longitude; the remainder is the anomaly. Take its sine and multiply it by the maximum equation of 2 degrees and 14 minutes.',
            commentary:
              'Penggunaan radius trigonometri R = 150 atau R = 60 merupakan ciri khas risalah Al-Khwarizmi yang memadukan tradisi India dan Arab.',
            astrologicalConcept: 'Ta\'dil ash-Shams, al-Awj, Jayb, Longitude',
            tags: ['sun', 'equation-of-center', 'apogee', 'sine', 'sindhind'],
          },
        ],
      },
    ],
  },
  {
    id: 'qasida-ilm-an-nujum',
    titleArabic: 'قصيدة في علم النجوم (الأرجوزة الفلكية)',
    titleLatin: 'Qasida fi \'Ilm an-Nujum (The Astronomical Urjuza)',
    authorArabic: 'أبو الحسن علي بن أبي الرجال / ابن البناء المراكشي',
    authorLatin: 'Abu al-Hasan Ali ibn Abi al-Rijal & Ibn al-Banna al-Marrakushi',
    dateEra: 'c. Abad ke-4 - 7 H / 10 - 13 M',
    provenance: 'Qayrawan (Tunisia) & Marrakesh (al-Maghrib)',
    repository: 'Dar al-Kutub al-Misriyyah (Kairo) / Real Biblioteca del Monasterio de El Escorial',
    shelfmark: 'Escorial Arabe 908 / Dar al-Kutub Miqat 112 / Chester Beatty Ar. 4022',
    primaryLanguage: 'شعر عربي كلاسيكي منظوم (Classical Arabic Verse)',
    folioCount: 42,
    historicalContext:
      'Qasida fi \'Ilm an-Nujum adalah syair didaktik bersajak (manzhumah) dalam bahar Rajaz yang digubah oleh para pakar falak klasik untuk memudahkan para penuntut ilmu menghafal kaidah-kaidah astrologi, watak planet, 28 manzil rembulan, perhitungan aspek, dan pembagian rumah astrologi.',
    description:
      'Terdiri dari bait-bait syi\'ir ilmiah dengan rima indah yang merangkum hakikat 7 planet pengembara, derajat eksaltasi, watak manzil rembulan, dan hukum-hukum ramalan falak kuno.',
    featuredFolios: [
      {
        folioNumber: 'Folio 4a',
        diagramType: 'Reka Bentuk Falak 7 Kawkab & Lambang Astrologi',
        transcription:
          '«بَدَأْتُ بِاسْمِ خَالِقِ الأَفْلَاكِ • وَمُجْرِيَ النُّجُومِ فِي الأَسْلَاكِ / ثُمَّ الصَّلَاةُ دَائِمًا عَلَى النَّبِي • خَيْرِ الأَنَامِ وَالشَّفِيعِ الْمُجْتَبَى»',
        translation:
          'Kukumandangkan asma Sang Pencipta cakrawala raya • Yang mengedarkan gugus gemintang pada orbit peredarannya / Shalawat senantiasa terlimpah kepada Sang Nabi • Sebaik-baik insan dan pemberi syafa\'at yang terpilih.',
      },
      {
        folioNumber: 'Folio 12b',
        diagramType: 'Lingkaran 28 Manazil al-Qamar (Lunar Mansions Ring)',
        transcription:
          '«وَاعْلَمْ بِأَنَّ لِلْقَمَرْ مَنَازِلَا • ثَمَانِيًا وَعِشْرِينَ مَنَازِلَا / أَوَّلُهَا شَرْطَانِ ثُمَّ بَطْنُ • وَثَالِثُ الأَنْجُمِ فِيهَا بَطْنُ»',
        translation:
          'Ketahuilah bahwa bagi rembulan terdapat tempat-tempat persinggahan • Genap dua puluh delapan manzil yang berpendaran / Awal permulaannya adalah asy-Syaratan kemudian al-Butayn • Dan gugusan ketiga adalah ats-Thurayya yang bersinar.',
      },
    ],
    chapters: [
      {
        id: 'q-planets',
        titleArabic: 'النشيد الأول: في طبائع الكواكب السبعة',
        titleLatin: 'Canto I: On the Natures & Temperaments of the 7 Planets',
        contentSummary:
          'Bait-bait didaktik merincikan watak Saturnus, Jupiter, Mars, Matahari, Venus, Merkurius, dan Bulan.',
        versesOrPassages: [
          {
            id: 'q-1-1',
            cantoNumber: 1,
            cantoTitleArabic: 'زحل والمشتري (النحس الأكبر والسعد الأكبر)',
            cantoTitleLatin: 'Saturn & Jupiter',
            verseNumber: 1,
            arabicText:
              '«زُحَلٌ نَحْسٌ بَارِدٌ يَبِيسُ • صَاحِبُ غَمٍّ وَهْوَ لِلرَّئِيسِ / وَمُشْتَرٍ سَعْدٌ عَظِيمٌ مُقْبِلُ • يُعْطِي السُّرُورَ وَالْغِنَى فَيَعْدِلُ»',
            transliteration:
              'Zuhalun nahsun baridun yadisu • sahibu ghammin wa-hwa lir-ra\'isi / Wa mushtarin sa\'dun \'azhimun muqbilu • yu\'ti as-surura wal-ghina fa-ya\'dilu.',
            meter: 'بحر الرجز (Mustaf\'ilun Mustaf\'ilun Mustaf\'ilun)',
            translationId:
              'Saturnus berwatak nahas agung, dingin membeku dan kering gulita • Membawa kesedihan dan cobaan bagi para pemimpin / Sedangkan Jupiter adalah kemujuran akbar yang menyongsong berkah • Menghampirkan sukacita, kekayaan harta, dan tegaknya keadilan.',
            translationEn:
              'Saturn is the Greater Infortune, cold and dry, bringing gravity and tribulation to leaders; while Jupiter is the Greater Fortune, bestowing joy, abundant wealth, and justice.',
            commentary:
              'Bait ini menetapkan hierarki astrologi klasik: Saturnus (Zuhal) sebagai Nahs Akbar yang menguji kesabaran batin, dan Jupiter (al-Mushtari) sebagai Sa\'d Akbar pelindung kebajikan.',
            astrologicalConcept: 'Nahs Akbar, Sa\'d Akbar, Zuhal, al-Mushtari, Mizaj',
            tags: ['saturn', 'jupiter', 'temperament', 'dignity', 'poetry'],
          },
          {
            id: 'q-1-2',
            cantoNumber: 1,
            cantoTitleArabic: 'المريخ والزهرة والشمس',
            cantoTitleLatin: 'Mars, Venus, & the Sun',
            verseNumber: 2,
            arabicText:
              '«وَمَرِّيخٌ حَارٌّ يَابِسٌ لِلْحَرْبِ • وَزُهْرَةٌ سَعْدٌ لِحُسْنِ الطَّرَبِ / وَالشَّمْسُ مَلِكُ الأَفْلَاكِ بِالنُّورِ بَدَتْ • كُلُّ الْكَوَاكِبِ لَهَا قَدْ خَضَعَتْ»',
            transliteration:
              'Wa Marrikhun harrun yabisun lil-harbi • wa Zuhrah sa\'dun li-husni at-tarabi / Wash-shamsu maliku al-aflaki bin-nuri badat • kullu al-kawakibi laha qad khada\'at.',
            meter: 'بحر الرجز',
            translationId:
              'Mars bersuhu panas membakar dan kering menyulut peperangan • Venus pembawa kemujuran elok untuk asmara dan keindahan seni / Dan Sang Surya bagaikan maharaja falak yang tersingkap dengan cahayanya • Seluruh gemintang tunduk dalam naungan sinarnya.',
            translationEn:
              'Mars is hot and dry, ruler of battles and strife; Venus is the gentle fortune of melodious charm and beauty; and the Sun is the sovereign of spheres whose resplendence commands all wanderers.',
            commentary:
              'Menguraikan polaritas maskulin api Mars terhadap kelembutan feminin Venus, serta kedudukan sentral Matahari dalam hierarki makrokosmos.',
            astrologicalConcept: 'al-Marrikh, az-Zuhrah, ash-Shams, Malik al-Aflak',
            tags: ['mars', 'venus', 'sun', 'planetary-nature'],
          },
        ],
      },
      {
        id: 'q-exaltations',
        titleArabic: 'النشيد الثاني: في شرف الكواكب وهبوطها',
        titleLatin: 'Canto II: On Planetary Exaltations (Ashraf) & Falls',
        contentSummary:
          'Derajat-derajat eksaltasi (ash-sharaf) dan kejatuhan (al-hubut) sesuai kitab Al-Madkhal Al-Kabir dan Zij as-Sindhind.',
        versesOrPassages: [
          {
            id: 'q-2-1',
            cantoNumber: 2,
            cantoTitleArabic: 'درجات الشرف الدقيقة',
            cantoTitleLatin: 'Exact Degrees of Exaltation',
            verseNumber: 1,
            arabicText:
              '«شَرَفُ ذَكَا فِي تِسْعَةَ عَشَرَ حَمَلْ • وَالْبَدْرُ فِي ثَلَاثَةٍ مِنَ الثَّوْرِ كَمَلْ / وَالْمُشْتَرِي فِي خَمْسَةَ عَشَرَ سَرَطَانْ • وَعَطَارِدٌ فِي خَمْسَةَ عَشَرَ مِيزَانْ»',
            transliteration:
              'Sharafu Dhaka fi tis\'ata \'ashara Hamal • wal-Badru fi thalathatin min ath-Thawri kamal / Wal-Mushtari fi khamsata \'ashara Saratan • wa \'Utaridun fi khamsata \'ashara Sunbulah.',
            meter: 'بحر الرجز',
            translationId:
              'Kemuliaan Sang Surya ada pada sembilan belas derajat Aries • Rembulan memuncak sempurna pada tiga derajat Taurus / Jupiter bermartabat agung di lima belas derajat Cancer • Dan Merkurius bersinar cemerlang di lima belas derajat Virgo.',
            translationEn:
              'The exaltation of the Sun is at nineteen degrees of Aries; the Moon reaches zenith at three degrees of Taurus; Jupiter in fifteen degrees of Cancer; and Mercury in fifteen degrees of Virgo.',
            commentary:
              'Derajat eksaltasi adalah titik di mana energi kosmik suatu planet beresonansi paling murni dan memberikan kemuliaan tertinggi pada bagan kelahiran.',
            astrologicalConcept: 'Sharaf, Hubut, Exaltation Degrees',
            tags: ['exaltation', 'sharaf', 'degrees', 'dignity'],
          },
        ],
      },
      {
        id: 'q-mansions',
        titleArabic: 'النشيد الثالث: في منازل القمر الثمانية والعشرين',
        titleLatin: 'Canto III: The 28 Lunar Mansions',
        contentSummary:
          'Pengaruh astrologi dan waktu berkah/nahas persinggahan rembulan pada 28 manzil bintang.',
        versesOrPassages: [
          {
            id: 'q-3-1',
            cantoNumber: 3,
            cantoTitleArabic: 'بركات المنازل والأسفار',
            cantoTitleLatin: 'Blessings of Lunar Mansions & Voyages',
            verseNumber: 1,
            arabicText:
              '«إِذَا حَلَّ نُورُ الْبَدْرِ فِي سَعْدِ السُّعُودِ • فَبَادِرْ إِلَى عَقْدِ الْبِنَاءِ وَالْعُهُودِ / وَإِنْ نَزَلَ الإِكْلِيلَ أَوْ قَلْبَ الرَّدَى • فَحَاذِرْ مِنَ الأَعْدَاءِ وَاخْشَ الْمُعْتَدَى»',
            transliteration:
              'Idha halla nuru al-badri fi Sa\'di as-Su\'ud • fa-badir ila \'aqdi al-bina\'i wal-\'uhud / Wa in nazala al-Iklila aw Qalaba ar-rada • fa-hadhir min al-a\'da\'i wakhsha al-mu\'tada.',
            meter: 'بحر الطويل (Fa\'ulun Mafa\'ilun Fa\'ulun Mafa\'ilun)',
            translationId:
              'Tatkala cahaya rembulan menempati manzil Sa\'d as-Su\'ud (Puncak Kebahagiaan) • Maka segerakanlah mendirikan bangunan dan memperikat janji pernikahan luhur / Namun bila ia singgah pada al-Iklil ataupun Qalb sang kalajengking berbahaya • Maka waspadalah terhadap intaian seteru dan jauhilah bahaya sengketa.',
            translationEn:
              'When the lunar light resides in Sa\'d as-Su\'ud, proceed swiftly to build structures and seal noble covenants; but if it descends into al-Iklil or the Heart of Scorpio, guard against adversaries and heed the perils of strife.',
            commentary:
              'Mengajarkan ilmu Anwa\' dan Ihtiyarat (pemilihan waktu mustajab) berdasarkan peredaran bulan di sepanjang falak zodiak.',
            astrologicalConcept: 'Manazil al-Qamar, Sa\'d as-Su\'ud, Qalb al-\'Aqrab, Ihtiyarat',
            tags: ['lunar-mansions', 'manazil', 'auspicious-timing', 'electional'],
          },
        ],
      },
    ],
  },
];

/**
 * Remote Archive Manuscripts Search Catalog API
 * Simulates live catalog queries against real world institutions:
 * - BnF Gallica (Bibliothèque nationale de France)
 * - Digital Bodleian (University of Oxford)
 * - Qatar Digital Library (QDL / British Library)
 * - Chester Beatty Library
 * - Süleymaniye Kütüphanesi
 */
export const REMOTE_ARCHIVE_CATALOG: RemoteManuscriptSearchResult[] = [
  {
    id: 'bnf-arabe-2478',
    repositoryName: 'Bibliothèque nationale de France (BnF)',
    city: 'Paris, France',
    shelfmark: 'MS Arabe 2478',
    title: 'Kitāb az-Zīj as-Sindhind li-l-Khwārizmī (Naskah Astronomi Kuno)',
    date: 'Abad ke-6 H / 12 M',
    summary:
      'Naskah terlengkap yang memuat tabel astronomi Zij as-Sindhind versi Maslama al-Majriti dengan tabel sinus, tangen berdasar gnomon 12 jari, dan koordinat bintang lintang Baghdad.',
    iiifManifestUrl: 'https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001k/manifest.json',
    thumbnailPlaceholderUrl: '/assets/manuscripts/bnf_2478_thumb.jpg',
    relevance: 'Teks sumber primer Zij as-Sindhind',
  },
  {
    id: 'bodleian-selden-32',
    repositoryName: 'Bodleian Library, University of Oxford',
    city: 'Oxford, United Kingdom',
    shelfmark: 'MS. Seld. Arch. A. 32',
    title: 'Al-Majrīṭī: Recension of Al-Khwārizmī\'s Astronomical Tables',
    date: 'c. 1140 CE (Tr. Adelard of Bath)',
    summary:
      'Salinan manuskrip Latin bertarikh pertengahan abad ke-12 yang diterjemahkan langsung dari bahasa Arab naskah al-Majriti di Cordoba, memuat tabel konversi Era Yazdajird ke Era Hijrah.',
    iiifManifestUrl: 'https://iiif.bodleian.ox.ac.uk/iiif/manifest/selden-arch-a-32.json',
    thumbnailPlaceholderUrl: '/assets/manuscripts/bodleian_selden_thumb.jpg',
    relevance: 'Perbandingan teks Latin dan Arab',
  },
  {
    id: 'escorial-arabe-908',
    repositoryName: 'Real Biblioteca del Monasterio de San Lorenzo de El Escorial',
    city: 'Madrid, Spanyol',
    shelfmark: 'MS. Escorial Árabe 908',
    title: 'Manẓūmah fī Aḥkām an-Nujūm wa Manāzil al-Qamar',
    date: 'Abad ke-7 H / 13 M',
    summary:
      'Kumpulan puisi astrologi terlengkap di Andalusia mencakup 350 bait bahr rajaz tentang watak 12 buruj, pembagian rumah astrologi, dan kaidah qiran dua planet agung.',
    iiifManifestUrl: 'https://rbme.patrimonionacional.es/iiif/manuscript/908/manifest.json',
    thumbnailPlaceholderUrl: '/assets/manuscripts/escorial_908_thumb.jpg',
    relevance: 'Teks sumber primer Qasida fi \'Ilm an-Nujum',
  },
  {
    id: 'qdl-add-23399',
    repositoryName: 'Qatar Digital Library / British Library',
    city: 'Doha & London',
    shelfmark: 'British Library Add MS 23399',
    title: 'Kitāb fī \'Ilm al-Falak wa az-Zījāt al-Islāmiyyah',
    date: 'Abad ke-8 H / 14 M',
    summary:
      'Kompilasi risalah falak yang membandingkan parameter Zij as-Sindhind dengan Zij ash-Shah dan Zij al-Battani as-Sabi\'. Memuat diagram astrolab dan koordinat 28 manzil rembulan.',
    iiifManifestUrl: 'https://www.qdl.qa/en/archive/81055/vdc_100000000041.0x000001',
    thumbnailPlaceholderUrl: '/assets/manuscripts/qdl_23399_thumb.jpg',
    relevance: 'Perbandingan komparatif metode Zij lintas madzhab falak',
  },
  {
    id: 'feyzullah-1407',
    repositoryName: 'Süleymaniye Manuscript Library (Feyzullah Efendi)',
    city: 'Istanbul, Turki',
    shelfmark: 'MS Feyzullah 1407',
    title: 'Nukat min az-Zīj as-Sindhind wa Taqwīm al-Kawākib',
    date: 'Abad ke-5 H / 11 M',
    summary:
      'Glosarium dan anotasi pinggir tulisan tangan pakar falak Ukhuwah al-Majriti menjelaskan misteri rumus sinus R=150 dan koreksi lintang untuk belahan bumi bagian utara.',
    iiifManifestUrl: 'https://suleymaniye.yek.gov.tr/iiif/feyzullah1407/manifest.json',
    thumbnailPlaceholderUrl: '/assets/manuscripts/feyzullah_1407_thumb.jpg',
    relevance: 'Anotasi orisinal metode penghitungan apogee dan node',
  },
];
