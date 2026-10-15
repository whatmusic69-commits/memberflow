import type { HomeRefinement } from "./types";
export const lv: HomeRefinement = {
  channelHeading: "PUBLICĒŠANA SOCIĀLAJOS TĪKLOS · PLĀNOTA",
  why: {
    label: "KĀPĒC MEMBERFLOW",
    title: "Pirmā vizīte ir laba.\nOtrā ir vēl labāka.",
    intro:
      "Papīra zīmogu karte parāda klientam progresu. MemberFlow arī sniedz jums apmeklējumu vēsturi, lai redzētu, kuri klienti atgriežas, kuri sen nav bijuši un kurai grupai sagatavot piedāvājumu.",
    pairs: [
      {
        problem:
          "Tu ieguldi laiku un resursus klientu piesaistē. Taču saikne bieži beidzas ar pirmo vizīti.",
        solution:
          "Lojalitāte, atlīdzības un abonementi dod klientam skaidru iemeslu nākamajai vizītei.",
      },
      {
        problem:
          "Cilvēki ir aizņemti. Par tavu biznesu aizmirst, un e-pasti pazūd starp citām ziņām.",
        solution:
          "Klienta lapa un karte Apple Wallet vai Google Wallet saglabā saikni ar biznesu, izmantojot atbalstītos kartes atjauninājumus.",
      },
      {
        problem:
          "Bez vizīšu vēstures ir grūti saprast, kam vajadzīgs iemesls atgriezties.",
        solution:
          "Klientu aktivitāte un automatizācijas palīdz pamanīt piemērotu iespēju un sagatavot aktuālu piedāvājumu.",
      },
    ],
    example: "Klienta ceļa piemērs · Your Coffee",
    scenarioTitle: "Iemesls Annai atgriezties",
    steps: [
      {
        title: "Pamanīt pauzi",
        text: "Anna · Pēdējā vizīte: pirms 30 dienām. MemberFlow nosaka piemērotu iespēju aicināt viņu atgriezties.",
      },
      {
        title: "Sagatavot piedāvājumu",
        text: "Bizness izveido piedāvājumu: “Dubulti zīmogi par tavu nākamo kafiju.”",
      },
      {
        title: "Saglabāt saikni ar karti",
        text: "Wallet kartes atjauninājums un paziņojums, kur tas ir atbalstīts, var aizvest Annu atpakaļ uz viņas personīgo klienta lapu.",
      },
      {
        title: "Turpināt attiecības",
        text: "Anna var atvērt savu lojalitātes pieredzi, atgriezties un izmantot pieejamo piedāvājumu ar darbinieka skenējumu.",
      },
    ],
    walletConnection: "Vizīte beidzas. Saikne paliek.",
    walletRelationship:
      "Karte klienta Wallet saglabā tavu biznesu pa rokai: lojalitātes progress, atlīdzības un atbalstītie atjauninājumi — bez atsevišķas MemberFlow lietotnes.",
    walletNote:
      "Wallet atjauninājumi un paziņojumi ir atkarīgi no platformas, kartes veida, lietotāja iestatījumiem un Apple / Google noteikumiem. Paziņojuma parādīšana nav garantēta.",
  },
  stories: [
    {
      label: "PUBLICĒŠANA SOCIĀLAJOS TĪKLOS · PLĀNOTA",
      title: "Viens ieraksts.\nAtbalstītie kanāli.",
      text: "Plānots: izveidojiet ierakstu ar tekstu un attēlu, izvēlieties pieslēgtos sociālos tīklus, pārskatiet pielāgotos formātus un apstipriniet publicēšanu ar oficiālajiem API. Katrai platformai ir savi formāti, atļaujas un apstiprināšanas prasības.",
      takeaway: "Publicēšana sociālajos tīklos ir plānota; šis piemērs ierakstus nepublicē.",
    },
    {
      label: "PIESAISTĪT UN SAVIENOT",
      title: "Tavs bizness.\nTava lapa. Tavi klienti.",
      text: "Saite no sociālajiem tīkliem vai biznesa QR atver klienta lapu. Tavs zīmols, biznesa informācija, aktīvie piedāvājumi un programmas apvienoti vienā veidnē. Pēc pievienošanās klients redz savu progresu, atlīdzības, abonementus un pieejamos piedāvājumus.",
      takeaway: "No atklāšanas līdz personīgai saiknei.",
    },
    {
      label: "NOTURĒT UN IESAISTĪT",
      title: "Iemesls atgriezties.\nVienkārša apkalpošana.",
      text: "Klients parāda QR. Darbinieks to skenē, lai reģistrētu vizīti vai pievienotu atļautu zīmogu, un lojalitātes progress atjauninās. Atlīdzības, abonementi un piedāvājumi piešķir nākamajai vizītei jēgu. Wallet karte saglabā saikni bez atsevišķas MemberFlow lietotnes.",
      takeaway: "Komanda apkalpo klientus. Tu pārvaldi piekļuvi.",
    },
    {
      label: "SAPRAST UN ATGRIEZT",
      title: "Pazīsti pastāvīgos.\nPamani pauzi.",
      text: "Skati vizītes, lojalitāti un abonementu aktivitāti kopā. Klientu segmenti un automatizācijas palīdz noteikt piemērotas atgriešanās iespējas un sagatavot aktuālu piedāvājumu, ņemot vērā katra klienta vēsturi.",
      takeaway: "Vienots attiecību skats. Skaidrāks nākamais solis.",
    },
  ],
  benefitsTitle: "Vairāk nekā papīra zīmogu karte.",
  benefits: [{"title": "Karte katram klientam.", "text": "Klients pievienojas ar uzņēmuma QR un saņem personīgu digitālo QR karti. Bez lietotnes instalēšanas."}, {"title": "Redzams progress.", "text": "Zīmogi, punkti un nākamā atlīdzība ir redzami klienta personīgajā lapā."}, {"title": "Noderīga apmeklējumu vēsture.", "text": "Skatiet reģistrētos apmeklējumus, atrodiet klientus, kuri sen nav bijuši, un gatavojiet piedāvājumus vajadzīgajai grupai."}, {"title": "Pārvaldība vienuviet.", "text": "Iestatiet programmas, skatiet klientu vēsturi un pārvaldiet abonementus vadības panelī."}],
  customerPage: {
    entry: "Sociālo tīklu saite vai biznesa QR",
    public: "Publiska biznesa lapa",
    personal: "Annas personīgā pieredze",
    description: "Viena lapa — pirms un pēc pievienošanās.",
    businessDescription:
      "Tava apkaimes kafejnīca. Laba kafija un pazīstamas sejas.",
    hours: "P.–Pk. · 08:00–18:00",
    location: "Rīga · Adrese un norādes",
    connect: "Pievienoties Your Coffee",
    connectText:
      "Klients pievienojas, lai redzētu savas atlīdzības un progresu.",
    social: "Sociālo tīklu saites",
    offer: "Aktīvs piedāvājums",
    programme: "Lojalitātes programma",
    membership: "Abonementi",
    wallet: "Apple Wallet / Google Wallet",
    noApp: "Atsevišķa MemberFlow lietotne nav vajadzīga.",
  },
  staff: {
    title: "Darbinieka skeneris",
    qr: "Klients parāda savu QR",
    scan: "Darbinieks skenē kodu",
    action: "Reģistrēt vizīti · Pievienot zīmogu",
    progress: "Klienta lojalitātes progress atjauninās",
    access: "Atsevišķa, ierobežota darbinieku piekļuve.",
    owner: "Īpašnieks pārvalda komandu un atļaujas.",
  },
  wallet: {
    title: "Personīgā lojalitātes karte — pa rokai.",
    text: "Klients var glabāt personīgo lojalitātes karti Apple Wallet vai Google Wallet, lai to ātri atrastu pie kases. Kartes izsniegšanai jāpieslēdz Wallet integrācija; personīgais QR paliek pieejams arī klienta lapā.",
    updates: "Kartes atjauninājumi uztur informāciju aktuālu.",
    notifications:
      "Paziņojumi var papildināt atbilstošus atjauninājumus, kur tie tiek atbalstīti.",
    page: "Personīgā klienta lapa satur progresu, atlīdzības, abonementus un pieejamos piedāvājumus.",
  },
  activity: {
    segmentation: "Segmenti pēc klientu aktivitātes",
    automation: "Atgriešanās automatizācijas sagatavošana",
    eligibility:
      "Dalības nosacījumi un programmas noteikumi nosaka, kurš var saņemt un izmantot piedāvājumu.",
  },
  faqTitle: "Daži svarīgi jautājumi.",
  faq: [
    {
      question: "Vai klientam jāinstalē lietotne?",
      answer:
        "Atsevišķa MemberFlow lietotne nav vajadzīga. Saite vai biznesa QR atver klienta lapu pārlūkā. Klients var arī glabāt digitālo karti Apple Wallet vai Google Wallet, kur tas tiek atbalstīts.",
    },
    {
      question: "Kas mainās pēc klienta pievienošanās?",
      answer:
        "Pirms pievienošanās lapa rāda publisko biznesa informāciju, aktīvos piedāvājumus un programmas. Pēc pievienošanās klients redz personīgo lojalitātes progresu, atlīdzības, abonementus un pieejamos piedāvājumus.",
    },
    {
      question: "Vai mana komanda var izmantot MemberFlow?",
      answer:
        "Darbinieki lieto atsevišķu skeneri ar ierobežotām atļaujām. Īpašnieks pārvalda komandas piekļuvi — katram darbiniekam nav vajadzīga visa darba telpa.",
    },
    {
      question: "Vai Wallet atjauninājumi ir push paziņojumi?",
      answer:
        "Nē. Atjauninājums maina kartes informāciju. Paziņojums var tikt parādīts, ja platforma to atbalsta, atkarībā no kartes veida, lietotāja iestatījumiem un Apple / Google noteikumiem. Ne katrs piedāvājums kļūst par paziņojumu.",
    },
    {
      question: "Vai tas ir mājaslapu veidotājs?",
      answer:
        "Klienta lapa izmanto MemberFlow veidni un biznesa datus. Tā apvieno klientu programmas un piedāvājumus, nevis veido atsevišķu mājaslapu sistēmu.",
    },
  ],
  pricing: {
    title: "Izvēlieties plānu atkārtotiem apmeklējumiem.",
    intro:
      "Salīdziniet Starter, Growth un Business pēc aktīvo klientu skaita, atrašanās vietām un norādītajiem rīkiem. Izvēlieties savai lojalitātes programmai vajadzīgo apjomu.",
    scope: "Plānu pārskats",
    details: "Salīdzini vajadzības",
    customers: "Aktīvie klienti",
    locations: "Biznesa atrašanās vietas",
    features: "Iekļautās iespējas",
    monthly: "/ mēnesī",
    yearly: "/ gadā",
    from: "no",
    custom: "Individuāla cena",
    upgrade:
      "Pirms plāna izvēles vai maiņas salīdzini aktīvo klientu skaitu, atrašanās vietas un iekļautās iespējas. Plānu pieejamība un abonēšanas nosacījumi tiek parādīti, izvēloties plānu.",
    billing: "Apmaksas periods",
    customScope: "Atbilstoši tava biznesa vajadzībām",
    ctaTitle: "Sāciet ar iemeslu atgriezties.",
    ctaText: "Izveidojiet kontu un iestatiet sava uzņēmuma lojalitātes programmu.",
    tryFree: "Izveidot lojalitātes programmu",
    back: "Iepazīt produktu",
    unavailable:
      "Izvēlies pēc klientu skaita, atrašanās vietām un komandai vajadzīgajām iespējām.",
  },
};
