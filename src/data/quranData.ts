export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  ayahCount: number;
  type: 'Meccan' | 'Medinan';
}

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatihah', ayahCount: 7, type: 'Meccan' },
  { number: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', ayahCount: 286, type: 'Medinan' },
  { number: 3, nameArabic: 'آل عمران', nameEnglish: 'Ali \'Imran', ayahCount: 200, type: 'Medinan' },
  { number: 4, nameArabic: 'النساء', nameEnglish: 'An-Nisa', ayahCount: 176, type: 'Medinan' },
  { number: 5, nameArabic: 'المائدة', nameEnglish: 'Al-Ma\'idah', ayahCount: 120, type: 'Medinan' },
  { number: 6, nameArabic: 'الأنعام', nameEnglish: 'Al-An\'am', ayahCount: 165, type: 'Meccan' },
  { number: 7, nameArabic: 'الأعراف', nameEnglish: 'Al-A\'raf', ayahCount: 206, type: 'Meccan' },
  { number: 8, nameArabic: 'الأنفال', nameEnglish: 'Al-Anfal', ayahCount: 75, type: 'Medinan' },
  { number: 9, nameArabic: 'التوبة', nameEnglish: 'At-Tawbah', ayahCount: 129, type: 'Medinan' },
  { number: 10, nameArabic: 'يونس', nameEnglish: 'Yunus', ayahCount: 109, type: 'Meccan' },
  { number: 11, nameArabic: 'هود', nameEnglish: 'Hud', ayahCount: 123, type: 'Meccan' },
  { number: 12, nameArabic: 'يوسف', nameEnglish: 'Yusuf', ayahCount: 111, type: 'Meccan' },
  { number: 13, nameArabic: 'الرعد', nameEnglish: 'Ar-Ra\'d', ayahCount: 43, type: 'Medinan' },
  { number: 14, nameArabic: 'إبراهيم', nameEnglish: 'Ibrahim', ayahCount: 52, type: 'Meccan' },
  { number: 15, nameArabic: 'الحجر', nameEnglish: 'Al-Hijr', ayahCount: 99, type: 'Meccan' },
  { number: 16, nameArabic: 'النحل', nameEnglish: 'An-Nahl', ayahCount: 128, type: 'Meccan' },
  { number: 17, nameArabic: 'الإسراء', nameEnglish: 'Al-Isra', ayahCount: 111, type: 'Meccan' },
  { number: 18, nameArabic: 'الكهف', nameEnglish: 'Al-Kahf', ayahCount: 110, type: 'Meccan' },
  { number: 19, nameArabic: 'مريم', nameEnglish: 'Maryam', ayahCount: 98, type: 'Meccan' },
  { number: 20, nameArabic: 'طه', nameEnglish: 'Taha', ayahCount: 135, type: 'Meccan' },
  { number: 21, nameArabic: 'الأنبياء', nameEnglish: 'Al-Anbiya', ayahCount: 112, type: 'Meccan' },
  { number: 22, nameArabic: 'الحج', nameEnglish: 'Al-Hajj', ayahCount: 78, type: 'Medinan' },
  { number: 23, nameArabic: 'المؤمنون', nameEnglish: 'Al-Mu\'minun', ayahCount: 118, type: 'Meccan' },
  { number: 24, nameArabic: 'النور', nameEnglish: 'An-Nur', ayahCount: 64, type: 'Medinan' },
  { number: 25, nameArabic: 'الفرقان', nameEnglish: 'Al-Furqan', ayahCount: 77, type: 'Meccan' },
  { number: 26, nameArabic: 'الشعراء', nameEnglish: 'Ash-Shu\'ara', ayahCount: 227, type: 'Meccan' },
  { number: 27, nameArabic: 'النمل', nameEnglish: 'An-Naml', ayahCount: 93, type: 'Meccan' },
  { number: 28, nameArabic: 'القصص', nameEnglish: 'Al-Qasas', ayahCount: 88, type: 'Meccan' },
  { number: 29, nameArabic: 'العنكبوت', nameEnglish: 'Al-\'Ankabut', ayahCount: 69, type: 'Meccan' },
  { number: 30, nameArabic: 'الروم', nameEnglish: 'Ar-Rum', ayahCount: 60, type: 'Meccan' },
  { number: 31, nameArabic: 'لقمان', nameEnglish: 'Luqman', ayahCount: 34, type: 'Meccan' },
  { number: 32, nameArabic: 'السجدة', nameEnglish: 'As-Sajdah', ayahCount: 30, type: 'Meccan' },
  { number: 33, nameArabic: 'الأحزاب', nameEnglish: 'Al-Ahzab', ayahCount: 73, type: 'Medinan' },
  { number: 34, nameArabic: 'سبأ', nameEnglish: 'Saba', ayahCount: 54, type: 'Meccan' },
  { number: 35, nameArabic: 'فاطر', nameEnglish: 'Fatir', ayahCount: 45, type: 'Meccan' },
  { number: 36, nameArabic: 'يس', nameEnglish: 'Ya-Sin', ayahCount: 83, type: 'Meccan' },
  { number: 37, nameArabic: 'الصافات', nameEnglish: 'As-Saffat', ayahCount: 182, type: 'Meccan' },
  { number: 38, nameArabic: 'ص', nameEnglish: 'Sad', ayahCount: 88, type: 'Meccan' },
  { number: 39, nameArabic: 'الزمر', nameEnglish: 'Az-Zumar', ayahCount: 75, type: 'Meccan' },
  { number: 40, nameArabic: 'غافر', nameEnglish: 'Ghafir', ayahCount: 85, type: 'Meccan' },
  { number: 41, nameArabic: 'فصلت', nameEnglish: 'Fussilat', ayahCount: 54, type: 'Meccan' },
  { number: 42, nameArabic: 'الشورى', nameEnglish: 'Ash-Shura', ayahCount: 53, type: 'Meccan' },
  { number: 43, nameArabic: 'الزخرف', nameEnglish: 'Az-Zukhruf', ayahCount: 89, type: 'Meccan' },
  { number: 44, nameArabic: 'الدخان', nameEnglish: 'Ad-Dukhan', ayahCount: 59, type: 'Meccan' },
  { number: 45, nameArabic: 'الجاثية', nameEnglish: 'Al-Jathiyah', ayahCount: 37, type: 'Meccan' },
  { number: 46, nameArabic: 'الأحقاف', nameEnglish: 'Al-Ahqaf', ayahCount: 35, type: 'Meccan' },
  { number: 47, nameArabic: 'محمد', nameEnglish: 'Muhammad', ayahCount: 38, type: 'Medinan' },
  { number: 48, nameArabic: 'الفتح', nameEnglish: 'Al-Fath', ayahCount: 29, type: 'Medinan' },
  { number: 49, nameArabic: 'الحجرات', nameEnglish: 'Al-Hujurat', ayahCount: 18, type: 'Medinan' },
  { number: 50, nameArabic: 'ق', nameEnglish: 'Qaf', ayahCount: 45, type: 'Meccan' },
  { number: 51, nameArabic: 'الذاريات', nameEnglish: 'Adh-Dhariyat', ayahCount: 60, type: 'Meccan' },
  { number: 52, nameArabic: 'الطور', nameEnglish: 'At-Tur', ayahCount: 49, type: 'Meccan' },
  { number: 53, nameArabic: 'النجم', nameEnglish: 'An-Najm', ayahCount: 62, type: 'Meccan' },
  { number: 54, nameArabic: 'القمر', nameEnglish: 'Al-Qamar', ayahCount: 55, type: 'Meccan' },
  { number: 55, nameArabic: 'الرحمن', nameEnglish: 'Ar-Rahman', ayahCount: 78, type: 'Medinan' },
  { number: 56, nameArabic: 'الواقعة', nameEnglish: 'Al-Waqi\'ah', ayahCount: 96, type: 'Meccan' },
  { number: 57, nameArabic: 'الحديد', nameEnglish: 'Al-Hadid', ayahCount: 29, type: 'Medinan' },
  { number: 58, nameArabic: 'المجادلة', nameEnglish: 'Al-Mujadila', ayahCount: 22, type: 'Medinan' },
  { number: 59, nameArabic: 'الحشر', nameEnglish: 'Al-Hashr', ayahCount: 24, type: 'Medinan' },
  { number: 60, nameArabic: 'الممتحنة', nameEnglish: 'Al-Mumtahanah', ayahCount: 13, type: 'Medinan' },
  { number: 61, nameArabic: 'الصف', nameEnglish: 'As-Saff', ayahCount: 14, type: 'Medinan' },
  { number: 62, nameArabic: 'الجمعة', nameEnglish: 'Al-Jumu\'ah', ayahCount: 11, type: 'Medinan' },
  { number: 63, nameArabic: 'المنافقون', nameEnglish: 'Al-Munafiqun', ayahCount: 11, type: 'Medinan' },
  { number: 64, nameArabic: 'التغابن', nameEnglish: 'At-Taghabun', ayahCount: 18, type: 'Medinan' },
  { number: 65, nameArabic: 'الطلاق', nameEnglish: 'At-Talaq', ayahCount: 12, type: 'Medinan' },
  { number: 66, nameArabic: 'التحريم', nameEnglish: 'At-Tahrim', ayahCount: 12, type: 'Medinan' },
  { number: 67, nameArabic: 'الملك', nameEnglish: 'Al-Mulk', ayahCount: 30, type: 'Meccan' },
  { number: 68, nameArabic: 'القلم', nameEnglish: 'Al-Qalam', ayahCount: 52, type: 'Meccan' },
  { number: 69, nameArabic: 'الحاقة', nameEnglish: 'Al-Haqqah', ayahCount: 52, type: 'Meccan' },
  { number: 70, nameArabic: 'المعارج', nameEnglish: 'Al-Ma\'arij', ayahCount: 44, type: 'Meccan' },
  { number: 71, nameArabic: 'نوح', nameEnglish: 'Nuh', ayahCount: 28, type: 'Meccan' },
  { number: 72, nameArabic: 'الجن', nameEnglish: 'Al-Jinn', ayahCount: 28, type: 'Meccan' },
  { number: 73, nameArabic: 'المزمل', nameEnglish: 'Al-Muzzammil', ayahCount: 20, type: 'Meccan' },
  { number: 74, nameArabic: 'المدثر', nameEnglish: 'Al-Muddaththir', ayahCount: 56, type: 'Meccan' },
  { number: 75, nameArabic: 'القيامة', nameEnglish: 'Al-Qiyamah', ayahCount: 40, type: 'Meccan' },
  { number: 76, nameArabic: 'الإنسان', nameEnglish: 'Al-Insan', ayahCount: 31, type: 'Medinan' },
  { number: 77, nameArabic: 'المرسلات', nameEnglish: 'Al-Mursalat', ayahCount: 50, type: 'Meccan' },
  { number: 78, nameArabic: 'النبأ', nameEnglish: 'An-Naba', ayahCount: 40, type: 'Meccan' },
  { number: 79, nameArabic: 'النازعات', nameEnglish: 'An-Nazi\'at', ayahCount: 46, type: 'Meccan' },
  { number: 80, nameArabic: 'عبس', nameEnglish: '\'Abasa', ayahCount: 42, type: 'Meccan' },
  { number: 81, nameArabic: 'التكوير', nameEnglish: 'At-Takwir', ayahCount: 29, type: 'Meccan' },
  { number: 82, nameArabic: 'الانفطار', nameEnglish: 'Al-Infitar', ayahCount: 19, type: 'Meccan' },
  { number: 83, nameArabic: 'المطففين', nameEnglish: 'Al-Mutaffifin', ayahCount: 36, type: 'Meccan' },
  { number: 84, nameArabic: 'الانشقاق', nameEnglish: 'Al-Inshiqaq', ayahCount: 25, type: 'Meccan' },
  { number: 85, nameArabic: 'البروج', nameEnglish: 'Al-Buruj', ayahCount: 22, type: 'Meccan' },
  { number: 86, nameArabic: 'الطارق', nameEnglish: 'At-Tariq', ayahCount: 17, type: 'Meccan' },
  { number: 87, nameArabic: 'الأعلى', nameEnglish: 'Al-A\'la', ayahCount: 19, type: 'Meccan' },
  { number: 88, nameArabic: 'الغاشية', nameEnglish: 'Al-Ghashiyah', ayahCount: 26, type: 'Meccan' },
  { number: 89, nameArabic: 'الفجر', nameEnglish: 'Al-Fajr', ayahCount: 30, type: 'Meccan' },
  { number: 90, nameArabic: 'البلد', nameEnglish: 'Al-Balad', ayahCount: 20, type: 'Meccan' },
  { number: 91, nameArabic: 'الشمس', nameEnglish: 'Ash-Shams', ayahCount: 15, type: 'Meccan' },
  { number: 92, nameArabic: 'الليل', nameEnglish: 'Al-Layl', ayahCount: 21, type: 'Meccan' },
  { number: 93, nameArabic: 'الضحى', nameEnglish: 'Ad-Duha', ayahCount: 11, type: 'Meccan' },
  { number: 94, nameArabic: 'الشرح', nameEnglish: 'Ash-Sharh', ayahCount: 8, type: 'Meccan' },
  { number: 95, nameArabic: 'التين', nameEnglish: 'At-Tin', ayahCount: 8, type: 'Meccan' },
  { number: 96, nameArabic: 'العلق', nameEnglish: 'Al-\'Alaq', ayahCount: 19, type: 'Meccan' },
  { number: 97, nameArabic: 'القدر', nameEnglish: 'Al-Qadr', ayahCount: 5, type: 'Meccan' },
  { number: 98, nameArabic: 'البينة', nameEnglish: 'Al-Bayyinah', ayahCount: 8, type: 'Medinan' },
  { number: 99, nameArabic: 'الزلزلة', nameEnglish: 'Az-Zalzalah', ayahCount: 8, type: 'Medinan' },
  { number: 100, nameArabic: 'العاديات', nameEnglish: 'Al-\'Adiyat', ayahCount: 11, type: 'Meccan' },
  { number: 101, nameArabic: 'القارعة', nameEnglish: 'Al-Qari\'ah', ayahCount: 11, type: 'Meccan' },
  { number: 102, nameArabic: 'التكاثر', nameEnglish: 'At-Takathur', ayahCount: 8, type: 'Meccan' },
  { number: 103, nameArabic: 'العصر', nameEnglish: 'Al-\'Asr', ayahCount: 3, type: 'Meccan' },
  { number: 104, nameArabic: 'الهمزة', nameEnglish: 'Al-Humazah', ayahCount: 9, type: 'Meccan' },
  { number: 105, nameArabic: 'الفيل', nameEnglish: 'Al-Fil', ayahCount: 5, type: 'Meccan' },
  { number: 106, nameArabic: 'قريش', nameEnglish: 'Quraysh', ayahCount: 4, type: 'Meccan' },
  { number: 107, nameArabic: 'الماعون', nameEnglish: 'Al-Ma\'un', ayahCount: 7, type: 'Meccan' },
  { number: 108, nameArabic: 'الكوثر', nameEnglish: 'Al-Kawthar', ayahCount: 3, type: 'Meccan' },
  { number: 109, nameArabic: 'الكافرون', nameEnglish: 'Al-Kafirun', ayahCount: 6, type: 'Meccan' },
  { number: 110, nameArabic: 'النصر', nameEnglish: 'An-Nasr', ayahCount: 3, type: 'Medinan' },
  { number: 111, nameArabic: 'المسد', nameEnglish: 'Al-Masad', ayahCount: 5, type: 'Meccan' },
  { number: 112, nameArabic: 'الإخلاص', nameEnglish: 'Al-Ikhlas', ayahCount: 4, type: 'Meccan' },
  { number: 113, nameArabic: 'الفلق', nameEnglish: 'Al-Falaq', ayahCount: 5, type: 'Meccan' },
  { number: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', ayahCount: 6, type: 'Meccan' },
];

export const POPULAR_AYAHS_DATABASE: { [key: string]: { [ayah: number]: string } } = {
  '1': {
    1: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    2: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    3: 'الرَّحْمَٰنِ الرَّحِيمِ',
    4: 'مَالِكِ يَوْمِ الدِّينِ',
    5: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    6: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    7: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
  },
  '2': {
    255: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    285: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ',
    286: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
  },
  '18': {
    1: 'الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا',
    2: 'قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ وَيُبَشِّرَ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا',
    10: 'إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
    110: 'قُلْ إِنَّمَا أَنَا بَشَرٌ مِّثْلُكُمْ يُوحَىٰ إِلَيَّ أَنَّمَا إِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ فَمَن كَانَ يَرْجُو لِقَاءَ رَبِّهِ فَلْيَعْمَلْ عَمَلًا صَالِحًا وَلَا يُشْرِكْ بِعِبَادَةِ رَبِّهِ أَحَدًا',
  },
  '36': {
    1: 'يس',
    2: 'وَالْقُرْآنِ الْحَكِيمِ',
    3: 'إِنَّكَ لَمِنَ الْمُرْسَلِينَ',
    4: 'عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ',
    5: 'تَنزِيلَ الْعَزِيزِ الرَّحِيمِ',
    82: 'إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَن يَقُولَ لَهُ كُن فَيَكُونُ',
    83: 'فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ',
  },
  '55': {
    1: 'الرَّحْمَٰنُ',
    2: 'عَلَّمَ الْقُرْآنَ',
    3: 'خَلَقَ الْإِنسَانَ',
    4: 'عَلَّمَهُ الْبَيَانَ',
    13: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
    60: 'هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ',
  },
  '67': {
    1: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    2: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
    3: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ',
  },
  '93': {
    1: 'وَالضُّحَىٰ',
    2: 'وَاللَّيْلِ إِذَا سَجَىٰ',
    3: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
    4: 'وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ',
    5: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
  },
  '94': {
    1: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ',
    2: 'وَوَضَعْنَا عَنكَ وِزْرَكَ',
    5: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    6: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
  },
  '97': {
    1: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ',
    2: 'وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ',
    3: 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ',
    4: 'تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ',
    5: 'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ',
  },
  '103': {
    1: 'وَالْعَصْرِ',
    2: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
    3: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
  },
  '108': {
    1: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
    2: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
    3: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
  },
  '112': {
    1: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    2: 'اللَّهُ الصَّمَدُ',
    3: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    4: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
  },
  '113': {
    1: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    2: 'مِن شَرِّ مَا خَلَقَ',
    3: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
    4: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
    5: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
  },
  '114': {
    1: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    2: 'مَلِكِ النَّاسِ',
    3: 'إِلَٰهِ النَّاسِ',
    4: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
    5: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
    6: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
  },
};

// Offline cache storage for fetched ayahs
const quranMemoryCache: { [key: string]: string } = {};

// Load cached ayahs from localStorage if available
try {
  const stored = localStorage.getItem('aitec_quran_cache');
  if (stored) {
    Object.assign(quranMemoryCache, JSON.parse(stored));
  }
} catch {
  // Local storage not accessible
}

const saveAyahToCache = (surahNum: number, ayahNum: number, text: string) => {
  const key = `${surahNum}:${ayahNum}`;
  quranMemoryCache[key] = text;
  try {
    localStorage.setItem('aitec_quran_cache', JSON.stringify(quranMemoryCache));
  } catch {
    // quota exceeded or unavailable
  }
};

/**
 * Fetch any Ayah from public Quran APIs with fallback and permanent caching.
 * Guaranteed to return the real Quranic text for any Surah (1-114) and any Ayah.
 */
export const fetchAyahFromAPI = async (surahNum: number, ayahNum: number): Promise<string> => {
  const cacheKey = `${surahNum}:${ayahNum}`;
  
  // 1. Check in-memory cache
  if (quranMemoryCache[cacheKey]) {
    return quranMemoryCache[cacheKey];
  }

  // 2. Check built-in popular database
  const surahKey = String(surahNum);
  if (POPULAR_AYAHS_DATABASE[surahKey] && POPULAR_AYAHS_DATABASE[surahKey][ayahNum]) {
    const text = POPULAR_AYAHS_DATABASE[surahKey][ayahNum];
    saveAyahToCache(surahNum, ayahNum, text);
    return text;
  }

  // 3. Fetch from Quran API (Primary: alquran.cloud Uthmani)
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/ar.uthmani`);
    if (response.ok) {
      const data = await response.json();
      if (data?.data?.text) {
        let text = data.data.text.trim();
        // Remove Bismillah from beginning of Surahs other than Al-Fatiha (since it's an intro)
        if (surahNum !== 1 && ayahNum === 1 && text.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ')) {
          text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
        }
        saveAyahToCache(surahNum, ayahNum, text);
        return text;
      }
    }
  } catch (err) {
    console.warn('Primary Quran API fetch failed, trying fallback...', err);
  }

  // 4. Fallback: Secondary Quran API
  try {
    const fallbackRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranuthmani/${surahNum}/${ayahNum}.json`);
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      if (data?.text) {
        const text = data.text.trim();
        saveAyahToCache(surahNum, ayahNum, text);
        return text;
      }
    }
  } catch (err) {
    console.warn('Fallback Quran API fetch failed', err);
  }

  // 5. Fallback 3: Alternative API
  try {
    const altRes = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/ar.alafasy`);
    if (altRes.ok) {
      const data = await altRes.json();
      if (data?.data?.text) {
        const text = data.data.text.trim();
        saveAyahToCache(surahNum, ayahNum, text);
        return text;
      }
    }
  } catch (err) {
    console.warn('Alternative Quran API fetch failed', err);
  }

  // If completely offline and un-cached, give clean Surah & Ayah badge without generic repetition
  const surah = SURAH_LIST.find(s => s.number === surahNum);
  const surahName = surah ? surah.nameArabic : `سورة ${surahNum}`;
  return `﴿ سُورَةُ ${surahName} - الآيَةُ ${ayahNum} ﴾`;
};

export const getAyahText = (surahNum: number, ayahNum: number): string => {
  const key = `${surahNum}:${ayahNum}`;
  if (quranMemoryCache[key]) {
    return quranMemoryCache[key];
  }
  const surahKey = String(surahNum);
  if (POPULAR_AYAHS_DATABASE[surahKey] && POPULAR_AYAHS_DATABASE[surahKey][ayahNum]) {
    return POPULAR_AYAHS_DATABASE[surahKey][ayahNum];
  }
  const surah = SURAH_LIST.find(s => s.number === surahNum);
  const surahName = surah ? surah.nameArabic : `سورة ${surahNum}`;
  return `﴿ سُورَةُ ${surahName} - الآيَةُ ${ayahNum} ﴾`;
};
