import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { isSupportedLocale } from "@/i18n/locales";
import { loadMessages } from "@/i18n";
import SidebarNav from "@/components/layout/SidebarNav";
import TopBar from "@/components/layout/TopBar";
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
  const messages = await loadMessages(locale);
  const t = (path: string) => path.split(".").reduce((acc: any, key) => acc?.[key], messages)?.toString?.() ?? "";

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground relative overflow-hidden`}>
      {/* Enhanced Background with Multiple Layers */}
      <div className="pointer-events-none select-none fixed inset-0 -z-10">
        {/* Base gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/40 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-900/40" />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse" 
               style={{ animationDelay: '0s', animationDuration: '4s' }} />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse" 
               style={{ animationDelay: '2s', animationDuration: '6s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-green-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse" 
               style={{ animationDelay: '1s', animationDuration: '5s' }} />
        </div>
        
        {/* Mesh pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <svg width="60" height="60" viewBox="0 0 60 60" className="absolute inset-0 h-full w-full">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="m 60 0 l 0 60 m -60 0 l 60 0" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <ToastProvider>
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[280px_1fr] relative">
          {/* Enhanced Sidebar */}
          <aside className="hidden lg:block relative">
            <div className="fixed top-0 left-0 h-full w-[280px] glass border-r border-border/50 backdrop-blur-xl">
              <div className="h-full px-6 py-8 flex flex-col">
                {/* Logo/Brand Section */}
                <div className="mb-8 animate-slide-in">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold gradient-text tracking-tight">{t("app.title")}</h1>
                      <p className="text-xs text-muted-foreground">智能创作助手</p>
                    </div>
                  </div>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <SidebarNav locale={locale} messages={messages} />
                </nav>
                
                {/* Bottom Section */}
                <div className="mt-auto pt-4 border-t border-border/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="text-xs text-muted-foreground text-center">
                    <p className="mb-1">✨ AI驱动的创作平台</p>
                    <p className="text-[10px] opacity-60">让创意无限可能</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main Content Area */}
          <section className="flex flex-col min-h-screen lg:ml-0">
            {/* Enhanced Header */}
            <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl">
              <TopBar locale={locale} messages={messages} />
            </header>
            
            {/* Main Content with Enhanced Container */}
            <main className="flex-1 relative">
              <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="relative">
                  {children}
                </div>
              </div>
              
              {/* Floating Elements for Visual Interest */}
              <div className="fixed bottom-8 right-8 pointer-events-none">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full opacity-50"></div>
              </div>
            </main>
          </section>
        </div>
      </ToastProvider>
    </div>
  );
}

