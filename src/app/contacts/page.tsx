import { PublicTextPage } from "@/components/legal/public-page";

export default function Page() {
  return <PublicTextPage eyebrow="Contacts" title="Контакты" intro="Свяжитесь с MemberFlow, если хотите обсудить запуск подписок, карт лояльности или подключение сети филиалов." sections={[
    { title: "Продажи и запуск", text: "Для вопросов по тарифам, запуску программы и демонстрации продукта: sales@memberflow.app. Обычно мы отвечаем в течение одного рабочего дня." },
    { title: "Поддержка бизнеса", text: "Для действующих клиентов: support@memberflow.app. В сообщении укажите название бизнеса, город, программу и краткое описание вопроса." },
    { title: "Офис", text: "MemberFlow работает с европейскими сервисными бизнесами. Базовый регион продукта: Riga, Latvia. Встречи и onboarding проводятся онлайн." },
  ]} />;
}
