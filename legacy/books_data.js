// NurulQuran Faith & Knowledge Local Database

var ISLAMIC_BOOKS = [
  {
    id: "nawawi",
    title: "Forty Hadith of Imam Al-Nawawi",
    author: "Imam Yahya ibn Sharaf al-Nawawi",
    category: "Hadith",
    coverGradient: "from-emerald-800 to-teal-700",
    chapters: [
      {
        id: "ch1",
        title: "Hadith 1: Actions are by Intentions",
        arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوْ امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.",
        english: "Actions are but by intentions and every man shall have only that which he intended. Thus he whose migration was for Allah and His Messenger, his migration was for Allah and His Messenger, and he whose migration was for a worldly benefit or for a woman he might marry, his migration was for that which he migrated.",
        explanation: "This Hadith is a foundational pillar of Islamic law and morality. It teaches that the spiritual validity and reward of any deed depend entirely on the purity of the underlying intention (Niyyah). Deeds done for show, prestige, or material gain carry no weight in the sight of Allah."
      },
      {
        id: "ch2",
        title: "Hadith 2: Islam, Iman, and Ihsan (Hadith Jibreel)",
        arabic: "أَخْبِرْنِي عَنْ الْإِسْلَامِ؟ فَقَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: الْإِسْلَامُ أَنْ تَشْهَدَ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلَاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلًا. قَالَ: صَدَقْتَ. قَالَ: فَأَخْبِرْنِي عَنْ الْإِيمَانِ؟ قَالَ: أَنْ تُؤْمِنَ بِاللَّهِ، وَمَلَائِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالْيَوْمِ الْآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ. قَالَ: صَدَقْتَ. قَالَ: فَأَخْبِرْنِي عَنْ الْإِحْسَانِ؟ قَالَ: أَنْ تَعْبُدَ اللَّهَ كَأَنَّك تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاك.",
        english: "Islam is that you testify that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establish prayer, pay zakat, fast Ramadan, and perform pilgrimage to the House if you are able. Iman is that you believe in Allah, His angels, His books, His messengers, the Last Day, and divine decree (Qadar), both its good and its bad. Ihsan is that you worship Allah as if you see Him, for if you do not see Him, He surely sees you.",
        explanation: "Known as the Mother of the Sunnah, this Hadith outlines the three core dimensions of faith: outward practice (Islam), inward creed (Iman), and spiritual excellence/mindfulness (Ihsan), delivered through the dialogue between Jibreel (Angel Gabriel) and the Prophet (PBUH)."
      },
      {
        id: "ch3",
        title: "Hadith 3: Pillars of Islam",
        arabic: "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ.",
        english: "Islam has been built on five: Testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing prayer, paying zakat, making pilgrimage to the House, and fasting in Ramadan.",
        explanation: "This Hadith provides a concise structural framework for a Muslim's practical life, summarizing the five main rituals which define the identity and spiritual duties of a believer."
      },
      {
        id: "ch4",
        title: "Hadith 5: Rejection of Bi'dah (Innovation)",
        arabic: "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ.",
        english: "He who innovates something in this matter of ours (Islam) that is not of it will have it rejected.",
        explanation: "Preserves the integrity of the Islamic faith. Any changes, edits, or additions to the fundamental acts of worship that do not align with Quranic values or the practices of the Prophet (PBUH) are rejected."
      },
      {
        id: "ch5",
        title: "Hadith 12: Leaving That Which Does Not Concern You",
        arabic: "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ.",
        english: "Part of the excellence of one's Islam is his leaving alone that which does not concern him.",
        explanation: "An essential rule for building a clean community and maintaining personal peace of mind. A Muslim should refrain from gossip, curiosity about private affairs, and activities that do not benefit their worldly life or hereafter."
      },
      {
        id: "ch6",
        title: "Hadith 13: Loving for Your Brother What You Love for Yourself",
        arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.",
        english: "None of you believes until he loves for his brother what he loves for himself.",
        explanation: "True faith requires empathy and selflessness. Believers must desire the same peace, success, guidance, and well-being for others as they want for themselves, eliminating jealousy and ill-will."
      },
      {
        id: "ch7",
        title: "Hadith 15: Good Manners in Speech and Hospitality",
        arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ.",
        english: "He who believes in Allah and the Last Day let him speak good or remain silent. And he who believes in Allah and the Last Day let him be generous to his neighbor. And he who believes in Allah and the Last Day let him show hospitality to his guest.",
        explanation: "Connects ethical behavior directly to faith in Allah. Controls tongue-slippage, encourages neighborly support, and reinforces hospitality."
      },
      {
        id: "ch8",
        title: "Hadith 16: The Prohibition of Anger",
        arabic: "أَنَّ رَجُلًا قَالَ لِلنَّبِيِّ صلى الله عليه وسلم: أَوْصِنِي. قَالَ: لَا تَغْضَبْ. فَرَدَّدَ مِرَارًا، قَالَ: لَا تَغْضَبْ.",
        english: "A man said to the Prophet (PBUH): 'Counsel me.' He said: 'Do not become angry.' The man repeated his request several times, and each time he said: 'Do not become angry.'",
        explanation: "Anger is the root of many bad decisions and conflicts. Controlling one's temper and reacting with composure is a sign of high character and spiritual maturity."
      }
    ]
  },
  {
    id: "riyad",
    title: "Riyad as-Salihin (Selected Chapters)",
    author: "Imam Yahya ibn Sharaf al-Nawawi",
    category: "Manners & Ethics",
    coverGradient: "from-amber-700 to-yellow-600",
    chapters: [
      {
        id: "ch1",
        title: "Chapter 1: Sincerity and Intention (Ikhlas)",
        arabic: "قُلْ إِن تُخْفُواْ مَا فِي صُدُورِكُمْ أَوْ تُبْدُوهُ يَعْلَمْهُ اللَّهُ",
        english: "Say: 'Whether you hide what is in your hearts or reveal it, Allah knows it.' (Quran 3:29). Sincerity means performing acts of worship purely to seek the pleasure of Allah, rather than praise or status from creation.",
        explanation: "Imam Nawawi started the book with this chapter to align the reader's focus. True righteousness lies in the secret intentions of the heart."
      },
      {
        id: "ch2",
        title: "Chapter 2: Patience and Perseverance (Sabr)",
        arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        english: "O you who believe! Seek help in patience and prayer; surely Allah is with the patient. (Quran 2:153). Sabr has three types: patience in obeying Allah, patience in refraining from sins, and patience in facing trials.",
        explanation: "Sabr is not passive surrender, but active resilience and reliance on Allah when dealing with trials or resisting temptation."
      },
      {
        id: "ch3",
        title: "Chapter 3: Truthfulness (Sidq)",
        arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ",
        english: "O you who believe! Fear Allah and keep company with the truthful. (Quran 9:119). The Prophet (PBUH) said: 'Truthfulness leads to righteousness, and righteousness leads to Paradise.'",
        explanation: "Truthfulness must manifest in three areas: speech, intentions, and deeds. Complete honesty builds community trust and integrity."
      }
    ]
  },
  {
    id: "seerah",
    title: "Timeline of the Prophet's Seerah",
    author: "NurulQuran Editorial",
    category: "History",
    coverGradient: "from-teal-855 to-emerald-600",
    chapters: [
      {
        id: "ch1",
        title: "Phase 1: Birth and Early Life (570 - 610 CE)",
        arabic: "لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ",
        english: "Indeed in the Messenger of Allah you have an excellent example (Quran 33:21). The Prophet (PBUH) was born in Makkah in 570 CE, the Year of the Elephant. He was orphaned early and raised by his grandfather and uncle. He was known as Al-Amin (the Trustworthy) and As-Sadiq (the Truthful) long before his prophethood.",
        explanation: "This early period established his unimpeachable moral character among the Quraysh, laying the foundation for his message."
      },
      {
        id: "ch2",
        title: "Phase 2: Prophethood and Makkah Period (610 - 622 CE)",
        arabic: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
        english: "Read in the name of your Lord who created. (Quran 96:1). In 610 CE, Jibreel visited the Prophet (PBUH) in the cave of Hira. For 13 years in Makkah, he preached the oneness of Allah (Tawheed) amidst intense persecution, leading to the migration of his followers.",
        explanation: "The Makkah period focused on building faith, resilience, monotheism, and steadfastness."
      },
      {
        id: "ch3",
        title: "Phase 3: Migration (Hijrah) and Medina State (622 - 632 CE)",
        arabic: "إِلَّا تَنصُرُوهُ فَقَدْ نَصَرَهُ اللَّهُ",
        english: "If you do not aid the Prophet - Allah has already aided him. (Quran 9:40). The Hijrah in 622 CE marks the beginning of the Islamic Calendar. In Medina, the Prophet (PBUH) drafted the Constitution of Medina, establishing brotherhood, justice, and the first Islamic society.",
        explanation: "The Medina phase witnessed the codification of Islamic law, social welfare systems, treaties, and the final completion of the religion."
      }
    ]
  },
  {
    id: "fiqh",
    title: "Practical Fiqh Essentials",
    author: "NurulQuran Juristic Panel",
    category: "Law & Practice",
    coverGradient: "from-blue-800 to-indigo-700",
    chapters: [
      {
        id: "ch1",
        title: "Purification (Wudu & Taharah)",
        arabic: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ",
        english: "Indeed, Allah loves those who are constantly repentant and loves those who purify themselves (Quran 2:222). Wudu consists of obligatory acts: washing the face, arms up to elbows, wiping the head, and washing the feet to ankles.",
        explanation: "Cleanliness is half of faith. Perfecting physical purification is a prerequisite for prayer and spiritual purity."
      },
      {
        id: "ch2",
        title: "Prayer (Salah Details)",
        arabic: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
        english: "Indeed, prayer has been decreed upon the believers a decree of specified times. (Quran 4:103). Salah consists of standing (Qiyam), bowing (Ruku), prostrating (Sujud), and concentration (Khushu).",
        explanation: "Salah is the daily link between creation and Creator, offering comfort, forgiveness of sins, and structural discipline to a Muslim's day."
      }
    ]
  }
];

var HADITH_SEARCH_COLLECTION = [
  {
    ref: "Sahih Bukhari 1",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    english: "Actions are judged by intentions, and every person will get what they intended.",
    topic: "Faith",
    tags: ["intentions", "sincerity", "deeds"]
  },
  {
    ref: "Sahih Muslim 256",
    arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
    english: "Cleanliness is half of faith.",
    topic: "Faith",
    tags: ["purification", "cleanliness", "wudu"]
  },
  {
    ref: "Sahih Bukhari 13",
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    english: "None of you truly believes until he loves for his brother what he loves for himself.",
    topic: "Manners",
    tags: ["brotherhood", "love", "community"]
  },
  {
    ref: "Sahih Muslim 45",
    arabic: "الدِّينُ النَّصِيحَةُ",
    english: "The religion is sincere advice.",
    topic: "Faith",
    tags: ["advice", "guidance", "brotherhood"]
  },
  {
    ref: "Sahih Bukhari 6018",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    english: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    topic: "Manners",
    tags: ["speech", "tongue", "silence"]
  },
  {
    ref: "Jami at-Tirmidhi 1956",
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    english: "Your smiling in the face of your brother is charity for you.",
    topic: "Charity",
    tags: ["smile", "sadakah", "manners"]
  },
  {
    ref: "Sahih Bukhari 20",
    arabic: "إِنَّ مِمَّا أَدْرَكَ النَّاسُ مِنْ كَلاَمِ النُّبُوَّةِ الأُولَى إِذَا لَمْ تَسْتَحْيِ فَاصْنَعْ مَا شِئْتَ",
    english: "If you have no shame, then do whatever you wish.",
    topic: "Manners",
    tags: ["modesty", "shame", "character"]
  },
  {
    ref: "Sahih Muslim 2581",
    arabic: "لاَ يَدْخُلُ الْجَنَّةَ مَنْ كَانَ فِي قَلْبِهِ مِثْقَالُ ذَرَّةٍ مِنْ كِبْرٍ",
    english: "He who has in his heart the weight of a mustard seed of pride will not enter Paradise.",
    topic: "Faith",
    tags: ["pride", "paradise", "humility"]
  },
  {
    ref: "Sunan Abu Dawud 4904",
    arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ",
    english: "The merciful will be shown mercy by the Most Merciful. Show mercy to those on the earth, and He who is in heaven will show mercy to you.",
    topic: "Manners",
    tags: ["mercy", "compassion", "love"]
  },
  {
    ref: "Sahih Bukhari 5678",
    arabic: "مَا أَنْزَلَ اللَّهُ دَاءً إِلاَّ أَنْزَلَ لَهُ شِفَاءً",
    english: "Allah did not send down any disease except that He sent down for it a cure.",
    topic: "Knowledge",
    tags: ["health", "cure", "medicine"]
  },
  {
    ref: "Jami at-Tirmidhi 2687",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    english: "Whoever takes a path seeking knowledge, Allah makes easy for him a path to Paradise.",
    topic: "Knowledge",
    tags: ["knowledge", "study", "paradise"]
  },
  {
    ref: "Sahih Muslim 223",
    arabic: "عَلَيْكَ بِكَثْرَةِ السُّجُودِ لِلَّهِ فَإِنَّكَ لاَ تَسْجُدُ لِلَّهِ سَجْدَةً إِلاَّ رَفَعَكَ اللَّهُ بِهَا دَرَجَةً",
    english: "Make use of prostrating to Allah frequently, for you do not make a single prostration to Allah except that He raises you a degree thereby and wipes out a sin.",
    topic: "Prayer",
    tags: ["prostration", "sujud", "salah"]
  },
  {
    ref: "Jami at-Tirmidhi 2307",
    arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
    english: "A kind word is a charity.",
    topic: "Charity",
    tags: ["speech", "kindness", "sadakah"]
  },
  {
    ref: "Sahih Muslim 2588",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    english: "Charity does not decrease wealth.",
    topic: "Charity",
    tags: ["wealth", "zakat", "sadakah"]
  },
  {
    ref: "Sahih Bukhari 5027",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    english: "The best among you are those who learn the Quran and teach it.",
    topic: "Knowledge",
    tags: ["quran", "knowledge", "teacher"]
  },
  {
    ref: "Jami at-Tirmidhi 2002",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    english: "The most perfect of believers in faith is the one with the best character.",
    topic: "Manners",
    tags: ["character", "manners", "faith"]
  },
  {
    ref: "Sahih Muslim 1078",
    arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    english: "Whoever fasts Ramadan out of faith and hoping for reward, their previous sins will be forgiven.",
    topic: "Faith",
    tags: ["fasting", "ramadan", "forgiveness"]
  },
  {
    ref: "Sahih Bukhari 1154",
    arabic: "يَنْزِلُ رَبُّنَا كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الآخِرُ فَيَقُولُ مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ",
    english: "Our Lord descends every night to the lowest heaven when one-third of the night remains, saying: 'Who calls upon Me that I may answer him? Who asks of Me that I may give him? Who seeks My forgiveness that I may forgive him?'",
    topic: "Prayer",
    tags: ["supplication", "dua", "tahajjud", "night"]
  },
  {
    ref: "Jami at-Tirmidhi 2501",
    arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
    english: "Have Taqwa (fear/mindfulness) of Allah wherever you are, follow up an evil deed with a good deed which will wipe it out, and behave well towards the people.",
    topic: "Manners",
    tags: ["taqwa", "repentance", "character"]
  },
  {
    ref: "Sahih Muslim 2699",
    arabic: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ",
    english: "Whoever relieves a believer of some distress in this world, Allah will relieve him of some distress on the Day of Resurrection.",
    topic: "Manners",
    tags: ["distress", "help", "brotherhood"]
  }
];

var DAILY_AZKAR = [
  {
    id: "ayat_kursi",
    categories: ["morning", "evening", "daily"],
    title: "Ayat al-Kursi (The Verse of the Throne)",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum. Wa la yuhituna bi-shay'im-min 'ilmihi illa bi-ma sha'. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adheem.",
    english: "Allah! There is no deity worthy of worship except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    explanation: "Recited in the morning and evening for divine protection. The Prophet (PBUH) said that whoever recites this after every prayer, nothing stands between him and entering Paradise except death.",
    targetCount: 1
  },
  {
    id: "three_quls",
    categories: ["morning", "evening"],
    title: "The Three Quls (Sura Al-Ikhlas, Al-Falaq, An-Nas)",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ\n\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ\n\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَٰهِ النَّاسِ ۞ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ",
    transliteration: "Bismillahir-Rahmanir-Rahim. Qul Huwal-lahu Ahad... Qul A'udhu bi-Rabbil-Falaq... Qul A'udhu bi-Rabbin-Nas...",
    english: "Say, 'He is Allah, [who is] One...' Say, 'I seek refuge in the Lord of daybreak...' Say, 'I seek refuge in the Lord of mankind...'",
    explanation: "Recite 3 times in the morning and 3 times in the evening. The Prophet (PBUH) said: 'Recite them; they will suffice you against everything.'",
    targetCount: 3
  },
  {
    id: "bismillah_la_yadurru",
    categories: ["morning", "evening"],
    title: "Protection Against All Harm",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
    english: "In the name of Allah, with whose name nothing can cause harm on earth or in the heaven, and He is the All-Hearing, the All-Knowing.",
    explanation: "Recited 3 times. Prophet Muhammad (PBUH) said: 'He who recites it three times in the morning will not be afflicted by any calamity until evening, and he who recites it three times in the evening will not be afflicted by any calamity until morning.'",
    targetCount: 3
  },
  {
    id: "raditu_billah",
    categories: ["morning", "evening"],
    title: "Contentment with Allah, Islam, and the Prophet",
    arabic: "رَضِيتُ بِاللَّهِ رَبَّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيَّا",
    transliteration: "Raditu billahi Rabba, wa bil-Islami dina, wa bi-Muhammadin (sallallahu 'alayhi wa sallam) Nabiyya.",
    english: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (PBUH) as my Prophet.",
    explanation: "Recited 3 times. The Prophet (PBUH) said: 'Whoever says this three times in the morning and evening, it is a duty upon Allah to make him pleased on the Day of Resurrection.'",
    targetCount: 3
  },
  {
    id: "sayyidul_istighfar",
    categories: ["morning", "evening", "daily"],
    title: "Sayyidul Istighfar (The Master Supplication for Forgiveness)",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أنتَ",
    transliteration: "Allahumma Anta Rabbi la ilaha illa Ant. Khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mas-tata't. A'udhu bika min sharri ma sana't. Abu'u laka bi-ni'matika 'alayy, wa abu'u laka bi-dhanbi faghfir li, fa-innahu la yaghfirudh-dhunuba illa Ant.",
    english: "O Allah, You are my Lord, there is no deity worthy of worship except You. You created me and I am Your servant, and I am faithful to my covenant and my promise to You as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge to You Your favor upon me, and I acknowledge to You my sin, so forgive me, for indeed, none can forgive sins except You.",
    explanation: "Recited 1 time. The Prophet (PBUH) said: 'If somebody recites it during the day with firm faith in it, and dies on the same day before the evening, he will be from the people of Paradise; and if somebody recites it at night with firm faith in it, and dies before the morning, he will be from the people of Paradise.'",
    targetCount: 1
  },
  {
    id: "tasbih_fatima",
    categories: ["daily"],
    title: "Tasbih of Fatima (SubhanAllah, Alhamdulillah, Allahu Akbar)",
    arabic: "سُبْحَانَ اللَّهِ (٣٣) ۞ الْحَمْدُ لِلَّهِ (٣٣) ۞ اللَّهُ أَكْبَرُ (٣٤)",
    transliteration: "SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (34x)",
    english: "Glory be to Allah (33 times), Praise be to Allah (33 times), Allah is the Greatest (34 times).",
    explanation: "Recited daily, especially before going to sleep or after obligatory prayers. It brings immense spiritual strength, peace, and replaces physical fatigue with divine energy.",
    targetCount: 100
  },
  {
    id: "la_ilaha_illallah_wahdahu",
    categories: ["morning", "daily"],
    title: "Dhikr of High Reward & Protection",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu, wa Huwa 'ala kulli shay'in Qadir.",
    english: "There is no deity worthy of worship except Allah alone, without partner. To Him belongs dominion, and to Him belongs praise, and He has power over all things.",
    explanation: "Recited 10 or 100 times daily. The Prophet (PBUH) said that whoever recites it 100 times in a day will have a reward equal to freeing ten slaves, one hundred good deeds will be written for him, one hundred bad deeds will be wiped out from his record, and it will be a shield for him from Satan that day until night.",
    targetCount: 10
  }
];
