import CategoriesClient from "@/components/contents/CategoriesClient";
import { loadMessages } from "@/i18n";
import type { AppLocale } from "@/i18n/locales";

export default async function CategoriesPage({ params }: { params: { locale: AppLocale } }) {
  const messages = await loadMessages(params.locale);
  return <CategoriesClient locale={params.locale} messages={messages} />;
}

