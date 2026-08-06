import { Book, createIrregularUnit } from "../book-types";

export const irregularVerbs: Book = {
  id: "irregular-verbs",
  title: "Irregular Verbs",
  subtitle: "Noto'g'ri fe'llarni oson yodlang",
  totalUnits: 8,
  units: [
    createIrregularUnit(
      1,
      [
        { v1: "be", phonetic: "/bi/", v2: "was / were", v3: "been", uz: "bo\'lmoq" },
        { v1: "beat", phonetic: "/bit/", v2: "beat", v3: "beaten", uz: "urmoq, mag\'lub etmoq" },
        { v1: "become", phonetic: "/bɪˈkəm/", v2: "became", v3: "become", uz: "bo\'lmoq, aylanmoq" },
        { v1: "begin", phonetic: "/bɪˈgɪn/", v2: "began", v3: "begun", uz: "boshlamoq, boshlanmoq" },
        { v1: "bite", phonetic: "/baɪt/", v2: "bit", v3: "bitten", uz: "tishlamoq" },
        { v1: "blow", phonetic: "/bloʊ/", v2: "blew", v3: "blown", uz: "esmoq, puflamoq" },
        { v1: "break", phonetic: "/breɪk/", v2: "broke", v3: "broken", uz: "sindirmoq, sinmoq" },
        { v1: "bring", phonetic: "/brɪŋ/", v2: "brought", v3: "brought", uz: "olib kelmoq" },
        { v1: "build", phonetic: "/bɪld/", v2: "built", v3: "built", uz: "qurmoq" },
        { v1: "buy", phonetic: "/baɪ/", v2: "bought", v3: "bought", uz: "sotib olmoq" },
      ],
      "Unit 1",
      "Noto'g'ri fe'llar - 1-qism"
    ),
    createIrregularUnit(
      2,
      [
        { v1: "catch", phonetic: "/kæʧ/", v2: "caught", v3: "caught", uz: "tutmoq, ushlamoq" },
        { v1: "choose", phonetic: "/ʧuz/", v2: "chose", v3: "chosen", uz: "tanlamoq" },
        { v1: "come", phonetic: "/kəm/", v2: "came", v3: "come", uz: "kelmoq" },
        { v1: "cost", phonetic: "/kɔst/", v2: "cost", v3: "cost", uz: "turmoq (narxi bo\'lmoq)" },
        { v1: "cut", phonetic: "/kət/", v2: "cut", v3: "cut", uz: "kesmoq" },
        { v1: "do", phonetic: "/du/", v2: "did", v3: "done", uz: "bajarmoq, qilmoq" },
        { v1: "draw", phonetic: "/drɔ/", v2: "drew", v3: "drawn", uz: "chizmoq" },
        { v1: "drink", phonetic: "/drɪŋk/", v2: "drank", v3: "drunk", uz: "ichmoq" },
        { v1: "drive", phonetic: "/draɪv/", v2: "drove", v3: "driven", uz: "haydamoq (mashina)" },
        { v1: "eat", phonetic: "/it/", v2: "ate", v3: "eaten", uz: "yemoq" },
      ],
      "Unit 2",
      "Noto'g'ri fe'llar - 2-qism"
    ),
    createIrregularUnit(
      3,
      [
        { v1: "fall", phonetic: "/fɔl/", v2: "fell", v3: "fallen", uz: "yiqilmoq, tushmoq" },
        { v1: "feed", phonetic: "/fid/", v2: "fed", v3: "fed", uz: "ovqatlantirmoq" },
        { v1: "feel", phonetic: "/fil/", v2: "felt", v3: "felt", uz: "his qilmoq" },
        { v1: "fight", phonetic: "/faɪt/", v2: "fought", v3: "fought", uz: "kurashmoq, urishmoq" },
        { v1: "find", phonetic: "/faɪnd/", v2: "found", v3: "found", uz: "topmoq" },
        { v1: "fly", phonetic: "/flaɪ/", v2: "flew", v3: "flown", uz: "uchmoq" },
        { v1: "forget", phonetic: "/fərˈgɛt/", v2: "forgot", v3: "forgotten", uz: "unutmoq" },
        { v1: "forgive", phonetic: "/fərˈgɪv/", v2: "forgave", v3: "forgiven", uz: "kechirmoq" },
        { v1: "get", phonetic: "/gɪt/", v2: "got", v3: "got (gotten)", uz: "olmoq, erishmoq" },
        { v1: "give", phonetic: "/gɪv/", v2: "gave", v3: "given", uz: "bermoq" },
      ],
      "Unit 3",
      "Noto'g'ri fe'llar - 3-qism"
    ),
    createIrregularUnit(
      4,
      [
        { v1: "go", phonetic: "/goʊ/", v2: "went", v3: "gone", uz: "bormoq" },
        { v1: "grow", phonetic: "/groʊ/", v2: "grew", v3: "grown", uz: "o\'smoq, o\'stirmoq" },
        { v1: "have", phonetic: "/hæv/", v2: "had", v3: "had", uz: "ega bo\'lmoq" },
        { v1: "hear", phonetic: "/hir/", v2: "heard", v3: "heard", uz: "eshitmoq" },
        { v1: "hide", phonetic: "/haɪd/", v2: "hid", v3: "hidden", uz: "yashirmoq, yashirinmoq" },
        { v1: "hit", phonetic: "/hɪt/", v2: "hit", v3: "hit", uz: "urmoq, zarba bermoq" },
        { v1: "hold", phonetic: "/hoʊld/", v2: "held", v3: "held", uz: "ushlab turmoq" },
        { v1: "hurt", phonetic: "/hərt/", v2: "hurt", v3: "hurt", uz: "og\'ritmoq, jarohatlamoq" },
        { v1: "keep", phonetic: "/kip/", v2: "kept", v3: "kept", uz: "saqlamoq" },
        { v1: "know", phonetic: "/noʊ/", v2: "knew", v3: "known", uz: "bilmoq, tanimoq" },
      ],
      "Unit 4",
      "Noto'g'ri fe'llar - 4-qism"
    ),
    createIrregularUnit(
      5,
      [
        { v1: "learn", phonetic: "/lərn/", v2: "learnt / learned", v3: "learnt / learned", uz: "o\'rganmoq" },
        { v1: "leave", phonetic: "/liv/", v2: "left", v3: "left", uz: "tark etmoq, chiqib ketmoq" },
        { v1: "lend", phonetic: "/lɛnd/", v2: "lent", v3: "lent", uz: "qarz bermoq" },
        { v1: "let", phonetic: "/lɛt/", v2: "let", v3: "let", uz: "ruxsat bermoq" },
        { v1: "lie", phonetic: "/laɪ/", v2: "lay", v3: "lain", uz: "yotmoq" },
        { v1: "lose", phonetic: "/luz/", v2: "lost", v3: "lost", uz: "yo\'qotmoq" },
        { v1: "make", phonetic: "/meɪk/", v2: "made", v3: "made", uz: "yasamoq, qilmoq" },
        { v1: "mean", phonetic: "/min/", v2: "meant", v3: "meant", uz: "anglatmoq, nazarda tutmoq" },
        { v1: "meet", phonetic: "/mit/", v2: "met", v3: "met", uz: "uchrashmoq, tanishmoq" },
        { v1: "pay", phonetic: "/peɪ/", v2: "paid", v3: "paid", uz: "to\'lamoq" },
      ],
      "Unit 5",
      "Noto'g'ri fe'llar - 5-qism"
    ),
    createIrregularUnit(
      6,
      [
        { v1: "put", phonetic: "/pʊt/", v2: "put", v3: "put", uz: "qo\'ymoq" },
        { v1: "read", phonetic: "/rɛd/", v2: "read", v3: "read", uz: "o\'qimoq" },
        { v1: "ride", phonetic: "/raɪd/", v2: "rode", v3: "ridden", uz: "minmoq (ot, velosiped)" },
        { v1: "ring", phonetic: "/rɪŋ/", v2: "rang", v3: "rung", uz: "jiringlamoq, qo\'ng\'iroq qilmoq" },
        { v1: "rise", phonetic: "/raɪz/", v2: "rose", v3: "risen", uz: "ko\'tarilmoq" },
        { v1: "run", phonetic: "/rən/", v2: "ran", v3: "run", uz: "yugurmoq" },
        { v1: "say", phonetic: "/seɪ/", v2: "said", v3: "said", uz: "demoq, aytmoq" },
        { v1: "see", phonetic: "/si/", v2: "saw", v3: "seen", uz: "ko\'rmoq" },
        { v1: "sell", phonetic: "/sɛl/", v2: "sold", v3: "sold", uz: "sotmoq" },
        { v1: "send", phonetic: "/sɛnd/", v2: "sent", v3: "sent", uz: "yubormoq" },
      ],
      "Unit 6",
      "Noto'g'ri fe'llar - 6-qism"
    ),
    createIrregularUnit(
      7,
      [
        { v1: "show", phonetic: "/ʃoʊ/", v2: "showed", v3: "shown", uz: "ko\'rsatmoq" },
        { v1: "shut", phonetic: "/ʃət/", v2: "shut", v3: "shut", uz: "yopmoq" },
        { v1: "sing", phonetic: "/sɪŋ/", v2: "sang", v3: "sung", uz: "qo\'shiq kuylamoq" },
        { v1: "sit", phonetic: "/sɪt/", v2: "sat", v3: "sat", uz: "o\'tirmoq" },
        { v1: "sleep", phonetic: "/slip/", v2: "slept", v3: "slept", uz: "uxlamoq" },
        { v1: "speak", phonetic: "/spik/", v2: "spoke", v3: "spoken", uz: "gapirmoq" },
        { v1: "spend", phonetic: "/spɛnd/", v2: "spent", v3: "spent", uz: "sarflamoq, o\'tkazmoq (vaqt)" },
        { v1: "stand", phonetic: "/stænd/", v2: "stood", v3: "stood", uz: "turmoq (oyoqda)" },
        { v1: "swim", phonetic: "/swɪm/", v2: "swam", v3: "swum", uz: "suzmoq" },
        { v1: "take", phonetic: "/teɪk/", v2: "took", v3: "taken", uz: "olmoq" },
      ],
      "Unit 7",
      "Noto'g'ri fe'llar - 7-qism"
    ),
    createIrregularUnit(
      8,
      [
        { v1: "teach", phonetic: "/tiʧ/", v2: "taught", v3: "taught", uz: "o\'qitmoq, dars bermoq" },
        { v1: "tell", phonetic: "/tɛl/", v2: "told", v3: "told", uz: "aytib bermoq" },
        { v1: "think", phonetic: "/θɪŋk/", v2: "thought", v3: "thought", uz: "o\'ylamoq" },
        { v1: "understand", phonetic: "/ˌəndərˈstænd/", v2: "understood", v3: "understood", uz: "tushunmoq" },
        { v1: "wake", phonetic: "/weɪk/", v2: "woke", v3: "woken", uz: "uyg\'onmoq, uyg\'otmoq" },
        { v1: "wear", phonetic: "/wɛr/", v2: "wore", v3: "worn", uz: "kiymoq" },
        { v1: "win", phonetic: "/wɪn/", v2: "won", v3: "won", uz: "yutmoq, g\'alaba qozonmoq" },
        { v1: "write", phonetic: "/raɪt/", v2: "wrote", v3: "written", uz: "yozmoq" },
      ],
      "Unit 8",
      "Noto'g'ri fe'llar - 8-qism"
    ),
  ],
};
