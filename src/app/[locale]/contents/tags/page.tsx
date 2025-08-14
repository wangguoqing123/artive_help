import TagsClient from "@/components/contents/TagsClient";
import { loadMessages } from "@/i18n";
import type { AppLocale } from "@/i18n/locales";

export default async function TagsPage({ params }: { params: { locale: AppLocale } }) {
  const messages = await loadMessages(params.locale);
  return <TagsClient locale={params.locale} messages={messages} />;
}

