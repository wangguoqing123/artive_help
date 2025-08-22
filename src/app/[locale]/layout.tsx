import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { isSupportedLocale } from "@/i18n/locales";
import { loadMessagesWithCache } from "@/lib/i18nCache"; // 使用缓存版本
import SidebarNav from "@/components/layout/SidebarNav";
import SidebarUser from "@/components/layout/SidebarUser";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMS",
  description: "WeChat Content Manager",
};

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children, params } = props;
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return notFound();
  const messages = await loadMessagesWithCache(locale); // 从缓存加载
  const t = (path: string) => path.split(".").reduce((acc: any, key) => acc?.[key], messages)?.toString?.() ?? "";

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground relative overflow-hidden`}>
      {/* 简化背景，移除动画以提升性能 */}
      <div className="pointer-events-none select-none fixed inset-0 -z-10">
        {/* 仅保留静态渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-teal-50/30 dark:from-slate-900/30 dark:via-slate-800/20 dark:to-slate-900/30" />
      </div>

      <ToastProvider>
        <div className="min-h-screen grid grid-cols-[280px_1fr] relative">
          {/* Enhanced Sidebar */}
          <aside className="block relative">
            <div className="fixed top-0 left-0 h-full w-[280px] bg-background/95 border-r border-border/50"> {/* 移除backdrop-blur以提升性能 */}
              <div className="h-full px-6 py-8 flex flex-col">
                {/* Logo/Brand Section */}
                <div className="mb-8"> {/* 移除动画 */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold gradient-text tracking-tight">{t("app.title")}</h1>
                    </div>
                  </div>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1"> {/* 移除动画 */}
                  <SidebarNav locale={locale} messages={messages} />
                </nav>

                {/* 用户信息 */}
                <div className="mt-auto pt-4 border-t border-border/50"> {/* 移除动画 */}
                  <SidebarUser locale={locale} messages={messages} />
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main Content Area */}
          <section className="flex flex-col min-h-screen">
            {/* Main Content */}
            <main className="flex-1 relative">
              <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl"> {/* 移除动画 */}
                <div className="relative">
                  {children}
                </div>
              </div>
            </main>
          </section>
        </div>
      </ToastProvider>
    </div>
  );
}

