"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export default function SidebarNav({ locale, messages, onNavigate }: { locale: string; messages: any; onNavigate?: () => void }) {
  const t = (path: string) => path.split(".").reduce((acc: any, key) => acc?.[key], messages)?.toString?.() ?? "";
  const pathname = usePathname();

  const navItems: { href: string; label: string; icon: React.ElementType; description: string; badge?: string }[] = [
    { 
      href: `/${locale}`, 
      label: t("app.nav.dashboard"), 
      icon: Icons.trendingUp,
      description: "实时热点与数据分析"
    },
    { 
      href: `/${locale}/inspiration`, 
      label: t("app.nav.inspiration") || "灵感集市", 
      icon: Icons.heart,
      description: "订阅创作者，获取灵感",
      badge: "NEW"
    },
    { 
      href: `/${locale}/materials`, 
      label: t("app.nav.materials"), 
      icon: Icons.folder,
      description: "素材库与资源管理"
    },
    { 
      href: `/${locale}/rewrite`, 
      label: t("app.nav.rewrite"), 
      icon: Icons.edit,
      description: "AI智能改写助手"
    },
    { 
      href: `/${locale}/contents`, 
      label: t("app.nav.contents"), 
      icon: Icons.fileText,
      description: "内容创作与管理"
    },
    { 
      href: `/${locale}/publish`, 
      label: t("app.nav.publish"), 
      icon: Icons.share,
      description: "一键发布到平台"
    },
    { 
      href: `/${locale}/publish/history`, 
      label: t("app.nav.publishHistory"), 
      icon: Icons.history,
      description: "发布历史记录"
    },
    { 
      href: `/${locale}/settings`, 
      label: t("app.nav.settings"), 
      icon: Icons.settings,
      description: "系统设置与配置"
    },
  ];

  return (
    <nav className="flex flex-col gap-2">
      <div className="mb-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
          创作工具
        </h2>
      </div>
      
      {navItems.map((item, index) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02]",
              "animate-fade-in",
              isActive
                ? "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-r-full animate-fade-in" />
            )}
            
            {/* Icon with enhanced styling */}
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
              isActive 
                ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25" 
                : "bg-muted/50 group-hover:bg-muted group-hover:scale-110"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            
            {/* Label and description */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="truncate font-medium">
                {item.label}
              </span>
              <span className="text-xs text-muted-foreground/80 truncate">
                {item.description}
              </span>
            </div>
            
            {/* Badge (if any) */}
            {item.badge && (
              <div className="flex items-center justify-center w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                {item.badge}
              </div>
            )}
            
            {/* Hover arrow */}
            <Icons.chevronRight className={cn(
              "w-4 h-4 transition-all duration-300",
              isActive ? "text-emerald-600 translate-x-0.5" : "text-muted-foreground/50 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
            )} />
            
            {/* Glow effect for active item */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-green-500/5 -z-10 animate-pulse" />
            )}
          </Link>
        );
      })}
      
      {/* Quick Actions Section */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all">
              <Icons.sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <span>AI 智能助手</span>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all">
              <Icons.zap className="w-4 h-4 text-purple-600" />
            </div>
            <span>快速创作</span>
            <Icons.plus className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </nav>
  );
}


