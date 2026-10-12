import type { Locale } from "@/content";

type Copy = {
  social: string;
  qr: string;
  profile: string;
  wallet: string;
  authorize: string;
  unavailable: string;
  permission: string;
  connect: string;
  reconnect: string;
  configure: string;
};
export const integrationContent: Record<Locale, Copy> = {
  en: {
    social:
      "Connect your business account to prepare campaigns for this channel.",
    qr: "Your business QR opens your Customer Page. Customize the printed invitation and download the QR here.",
    profile:
      "Set up the public page your customers open through your link or QR: branding, business information and customer actions.",
    wallet:
      "Manage Wallet actions on your Customer Page. Card issuance and connection status are provided by the business service.",
    authorize:
      "Continue to the provider to choose your account and approve access. MemberFlow does not ask for your account password.",
    unavailable:
      "The business service has not provided an authorization link for this channel yet. Connecting an account requires this link.",
    permission:
      "Only team members with integration management permission can connect an account.",
    connect: "Connect account",
    reconnect: "Reconnect account",
    configure: "Open settings",
  },
  ru: {
    social:
      "Подключите аккаунт вашего бизнеса для подготовки кампаний в этом канале.",
    qr: "QR бизнеса открывает клиентскую страницу. Настройте приглашение на печатном листе и скачайте QR.",
    profile:
      "Настройте публичную страницу, которую клиенты открывают по ссылке или QR: оформление, сведения о бизнесе и действия для клиентов.",
    wallet:
      "Управляйте действиями Wallet на клиентской странице. Выпуск карт и статус подключения предоставляет сервис бизнеса.",
    authorize:
      "Перейдите на сайт сервиса, выберите свой аккаунт и разрешите доступ. MemberFlow не запрашивает пароль от вашего аккаунта.",
    unavailable:
      "Сервис бизнеса пока не предоставил ссылку авторизации для этого канала. Без неё подключить аккаунт нельзя.",
    permission:
      "Подключать аккаунты могут сотрудники с разрешением на управление интеграциями.",
    connect: "Подключить аккаунт",
    reconnect: "Подключить заново",
    configure: "Открыть настройки",
  },
  lv: {
    social:
      "Pievienojiet sava uzņēmuma kontu, lai sagatavotu kampaņas šim kanālam.",
    qr: "Uzņēmuma QR kods atver klienta lapu. Pielāgojiet drukāto uzaicinājumu un lejupielādējiet QR kodu.",
    profile:
      "Iestatiet publisko lapu, ko klienti atver ar saiti vai QR kodu: noformējumu, uzņēmuma informāciju un klientiem pieejamās darbības.",
    wallet:
      "Pārvaldiet Wallet darbības klienta lapā. Karšu izsniegšanu un savienojuma statusu nodrošina uzņēmuma pakalpojums.",
    authorize:
      "Dodieties uz pakalpojuma vietni, izvēlieties savu kontu un atļaujiet piekļuvi. MemberFlow neprasa jūsu konta paroli.",
    unavailable:
      "Uzņēmuma pakalpojums vēl nav nodrošinājis autorizācijas saiti šim kanālam. Bez tās kontu nevar pievienot.",
    permission:
      "Kontus var pievienot darbinieki ar atļauju pārvaldīt integrācijas.",
    connect: "Pievienot kontu",
    reconnect: "Pievienot atkārtoti",
    configure: "Atvērt iestatījumus",
  },
};
