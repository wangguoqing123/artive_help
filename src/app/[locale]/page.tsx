import { loadMessages } from "@/i18n";
import type { AppLocale } from "@/i18n/locales";
import { Hotboards } from "@/components/dashboard/Hotboards";

export default async function Dashboard({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const messages = await loadMessages(locale);
  return (
    <div className="space-y-6">
      <Hotboards locale={locale} messages={messages} />
    </div>
  );
}

