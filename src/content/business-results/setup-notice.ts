import type { Locale } from "@/content";
export const setupNoticeContent: Record<
  Locale,
  { title: string; text: string; action: string; restricted: string }
> = {
  ru: {
    title: "Профиль бизнеса ещё не настроен до конца",
    text: "Завершите заполнение информации о бизнесе в настройках.",
    action: "Настроить бизнес",
    restricted:
      "Попросите владельца или сотрудника с доступом к настройкам завершить профиль.",
  },
  en: {
    title: "Your business profile is not complete yet",
    text: "Finish adding your business information in settings.",
    action: "Set up your business",
    restricted:
      "Ask the owner or a team member with settings access to complete the profile.",
  },
  lv: {
    title: "Uzņēmuma profils vēl nav pilnībā aizpildīts",
    text: "Pabeidziet uzņēmuma informācijas aizpildīšanu iestatījumos.",
    action: "Iestatīt uzņēmumu",
    restricted:
      "Lūdziet īpašniekam vai darbiniekam ar piekļuvi iestatījumiem pabeigt profila aizpildīšanu.",
  },
};
