import type { Locale } from "@/content";
export type ExampleFeature =
  | "campaigns"
  | "customers"
  | "loyalty"
  | "memberships"
  | "offers"
  | "automations";
type Example = {
  title: string;
  text: string;
  details: [string, string][];
  steps: [string, string, string];
};
type Copy = {
  label: string;
  hint: string;
  examples: Record<ExampleFeature, Example>;
};
export const emptyExamples: Record<Locale, Copy> = {
  ru: {
    label: "Например",
    hint: "Для иллюстрации — не добавлено в ваш бизнес",
    examples: {
      offers: {
        title: "Скидка 15% на следующую мойку",
        text: "Вернитесь в течение 14 дней и получите скидку на комплексную мойку автомобиля.",
        details: [
          ["Бизнес", "Автомойка «Чистый старт»"],
          ["Аудитория", "Возвращающиеся клиенты"],
          ["Условие", "Один раз в течение 14 дней"],
        ],
        steps: [
          "Опишите предложение",
          "Выберите аудиторию",
          "Укажите срок действия",
        ],
      },
      loyalty: {
        title: "Каждый восьмой кофе — в подарок",
        text: "За каждый кофе — одна отметка. Соберите восемь и получите следующий кофе бесплатно.",
        details: [
          ["Бизнес", "Your Coffee"],
          ["Награда", "Кофе на выбор"],
          ["Цель", "8 отметок"],
        ],
        steps: [
          "Выберите отметки или баллы",
          "Задайте порог награды",
          "Опишите награду",
        ],
      },
      memberships: {
        title: "Пакет «Пять тренировок»",
        text: "Пять групповых занятий в студии «Движение». Выберите удобные занятия из расписания.",
        details: [
          ["Тип", "Пакет посещений"],
          ["Включено", "5 занятий"],
          ["Стоимость в примере", "60 €"],
        ],
        steps: [
          "Выберите тип",
          "Укажите стоимость и условия",
          "Добавьте описание",
        ],
      },
      automations: {
        title: "Возвращение после 30 дней",
        text: "Анна давно не была в Your Coffee. Сценарий предлагает повод вернуться: двойные отметки за следующий кофе.",
        details: [
          ["Условие", "30 дней без посещения"],
          ["Предложение", "Двойные отметки"],
          ["Канал", "Wallet — где поддерживается"],
        ],
        steps: [
          "Задайте период без визита",
          "Выберите готовое предложение",
          "Укажите канал связи",
        ],
      },
      campaigns: {
        title: "Выходные чистого автомобиля",
        text: "«Пора освежить автомобиль? В эти выходные — скидка 15% на комплексную мойку в “Чистом старте”.»",
        details: [
          ["Площадка", "Instagram"],
          ["Формат", "Публикация"],
          ["Статус примера", "Черновик — не опубликован"],
        ],
        steps: [
          "Добавьте текст и изображение",
          "Адаптируйте под каналы",
          "Проверьте подготовленные версии",
        ],
      },
      customers: {
        title: "Анна",
        text: "Так может выглядеть карточка подключившегося клиента: контакты, программа лояльности и история посещений.",
        details: [
          ["Имя клиента", "Анна — вымышленный пример"],
          ["Программа", "Каждый восьмой кофе — в подарок"],
          ["Контакт", "anna@example.com"],
        ],
        steps: [
          "Оформите клиентскую страницу",
          "Разместите QR или ссылку",
          "Предложите клиенту подключиться",
        ],
      },
    },
  },
  en: {
    label: "For example",
    hint: "Illustration only — not added to your business",
    examples: {
      offers: {
        title: "15% off your next car wash",
        text: "Return within 14 days for a discount on a full car wash.",
        details: [
          ["Business", "Fresh Start Car Wash"],
          ["Audience", "Returning customers"],
          ["Condition", "Once within 14 days"],
        ],
        steps: [
          "Describe your offer",
          "Choose your audience",
          "Set an expiry date",
        ],
      },
      loyalty: {
        title: "Every eighth coffee is on us",
        text: "One stamp for every coffee. Collect eight and enjoy your next coffee free.",
        details: [
          ["Business", "Your Coffee"],
          ["Reward", "A coffee of your choice"],
          ["Target", "8 stamps"],
        ],
        steps: [
          "Choose stamps or points",
          "Set the reward threshold",
          "Describe the reward",
        ],
      },
      memberships: {
        title: "The Five Sessions package",
        text: "Five group sessions at Movement Studio. Choose the classes that fit your schedule.",
        details: [
          ["Type", "Visit package"],
          ["Included", "5 sessions"],
          ["Example price", "€60"],
        ],
        steps: [
          "Choose the type",
          "Set the price and terms",
          "Add a description",
        ],
      },
      automations: {
        title: "Return after 30 days",
        text: "Anna has not visited Your Coffee recently. This journey offers a reason to return: double stamps on her next coffee.",
        details: [
          ["Trigger", "30 days without a visit"],
          ["Offer", "Double stamps"],
          ["Channel", "Wallet — where supported"],
        ],
        steps: [
          "Set an inactivity period",
          "Choose an existing offer",
          "Select a channel",
        ],
      },
      campaigns: {
        title: "A fresh car for the weekend",
        text: "“Time to freshen up your car? This weekend, get 15% off a full wash at Fresh Start.”",
        details: [
          ["Channel", "Instagram"],
          ["Format", "Post"],
          ["Example status", "Draft — not published"],
        ],
        steps: [
          "Add text and an image",
          "Adapt for each channel",
          "Review the prepared versions",
        ],
      },
      customers: {
        title: "Anna",
        text: "A connected customer profile could show contact details, their loyalty programme and visit history.",
        details: [
          ["Customer", "Anna — fictional example"],
          ["Programme", "Every eighth coffee is on us"],
          ["Contact", "anna@example.com"],
        ],
        steps: [
          "Set up your Customer Page",
          "Share your QR or link",
          "Invite customers to connect",
        ],
      },
    },
  },
  lv: {
    label: "Piemēram",
    hint: "Tikai ilustrācija — nav pievienota jūsu uzņēmumam",
    examples: {
      offers: {
        title: "15% atlaide nākamajai auto mazgāšanai",
        text: "Atgriezieties 14 dienu laikā un saņemiet atlaidi pilnai automašīnas mazgāšanai.",
        details: [
          ["Uzņēmums", "Automazgātava “Tīrs starts”"],
          ["Auditorija", "Klienti, kas atgriežas"],
          ["Nosacījums", "Vienu reizi 14 dienu laikā"],
        ],
        steps: [
          "Aprakstiet piedāvājumu",
          "Izvēlieties auditoriju",
          "Norādiet derīguma termiņu",
        ],
      },
      loyalty: {
        title: "Katru astoto kafiju dāvinām",
        text: "Par katru kafiju — viena atzīme. Sakrājiet astoņas un saņemiet nākamo kafiju bez maksas.",
        details: [
          ["Uzņēmums", "Your Coffee"],
          ["Balva", "Kafija pēc izvēles"],
          ["Mērķis", "8 atzīmes"],
        ],
        steps: [
          "Izvēlieties atzīmes vai punktus",
          "Nosakiet balvas slieksni",
          "Aprakstiet balvu",
        ],
      },
      memberships: {
        title: "Piecu nodarbību pakete",
        text: "Piecas grupu nodarbības studijā “Kustība”. Izvēlieties sev ērtus nodarbību laikus.",
        details: [
          ["Veids", "Apmeklējumu pakete"],
          ["Iekļauts", "5 nodarbības"],
          ["Piemēra cena", "60 €"],
        ],
        steps: [
          "Izvēlieties veidu",
          "Norādiet cenu un nosacījumus",
          "Pievienojiet aprakstu",
        ],
      },
      automations: {
        title: "Atgriešanās pēc 30 dienām",
        text: "Anna sen nav apmeklējusi Your Coffee. Scenārijs piedāvā iemeslu atgriezties: dubultas atzīmes par nākamo kafiju.",
        details: [
          ["Nosacījums", "30 dienas bez apmeklējuma"],
          ["Piedāvājums", "Dubultas atzīmes"],
          ["Kanāls", "Wallet — kur tas tiek atbalstīts"],
        ],
        steps: [
          "Nosakiet neaktivitātes periodu",
          "Izvēlieties esošu piedāvājumu",
          "Norādiet saziņas kanālu",
        ],
      },
      campaigns: {
        title: "Tīrs auto nedēļas nogalei",
        text: "“Laiks atsvaidzināt auto? Šajā nedēļas nogalē — 15% atlaide pilnai mazgāšanai automazgātavā ‘Tīrs starts’.”",
        details: [
          ["Kanāls", "Instagram"],
          ["Formāts", "Publikācija"],
          ["Piemēra statuss", "Melnraksts — nav publicēts"],
        ],
        steps: [
          "Pievienojiet tekstu un attēlu",
          "Pielāgojiet kanāliem",
          "Pārskatiet sagatavotās versijas",
        ],
      },
      customers: {
        title: "Anna",
        text: "Pievienota klienta profilā var būt kontaktinformācija, lojalitātes programma un apmeklējumu vēsture.",
        details: [
          ["Klients", "Anna — izdomāts piemērs"],
          ["Programma", "Katru astoto kafiju dāvinām"],
          ["Kontakts", "anna@example.com"],
        ],
        steps: [
          "Noformējiet klienta lapu",
          "Izvietojiet QR kodu vai saiti",
          "Aiciniet klientus pievienoties",
        ],
      },
    },
  },
};
