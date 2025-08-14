"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { AppLocale } from "@/i18n/locales";
import type { HotItem } from "@/types";
import { addToMaterials, fetchHotItems } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export function Hotboards({ locale, messages }: { locale: AppLocale; messages: any }) {
  const t = (path: string) => path.split(".").reduce((acc: any, key) => acc?.[key], messages);
  const [items, setItems] = useState<HotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HotItem["source"]>("weixin");
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const data = await fetchHotItems();
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    return {
      weixin: items.filter((i) => i.source === "weixin"),
      zhihu: items.filter((i) => i.source === "zhihu"),
      baidu: items.filter((i) => i.source === "baidu"),
    };
  }, [items]);

  async function onAdd(item: HotItem) {
    await addToMaterials(item);
    push(t("app.feedback.addedToMaterials"), "success");
  }

  const sourceConfig = {
    weixin: {
      name: t("app.dashboard.hotboards.weixin") || "微信热点",
      icon: Icons.messageCircle,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      count: grouped.weixin.length
    },
    zhihu: {
      name: t("app.dashboard.hotboards.zhihu") || "知乎热榜",
      icon: Icons.layers,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      count: grouped.zhihu.length
    },
    baidu: {
      name: t("app.dashboard.hotboards.baidu") || "百度热搜",
      icon: Icons.trendingUp,
      color: "from-red-500 to-orange-600",
      bgColor: "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
      count: grouped.baidu.length
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Icons.zap className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">实时热点追踪</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text">今日热门内容</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            实时追踪全网热点，发现创作灵感，把握流量密码
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(sourceConfig).map(([source, config], index) => {
            const Icon = config.icon;
            return (
              <Card 
                key={source} 
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-fade-in",
                  activeTab === source && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setActiveTab(source as HotItem["source"])}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={cn("p-3 rounded-xl bg-gradient-to-br", config.color)}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{config.count}</div>
                      <div className="text-xs text-muted-foreground">条热点</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-1">{config.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {source === 'weixin' && '公众号热门文章'}
                    {source === 'zhihu' && '知乎热门话题'}
                    {source === 'baidu' && '百度搜索热词'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Hot Items Display */}
      <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                {React.createElement(sourceConfig[activeTab].icon, { 
                  className: "w-6 h-6" 
                })}
                {sourceConfig[activeTab].name}
              </CardTitle>
              <CardDescription>
                实时更新 • {sourceConfig[activeTab].count} 条内容
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icons.refresh className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm">
                <Icons.filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Icons.loader className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-sm text-muted-foreground">{t("app.common.loading") || "加载中..."}</p>
                </div>
              </div>
            )}
            
            {!loading && grouped[activeTab].length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Icons.fileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">暂无热点内容</h3>
                <p className="text-sm text-muted-foreground">{t("app.dashboard.empty") || "请稍后刷新重试"}</p>
              </div>
            )}
            
            {!loading && grouped[activeTab].map((item, index) => (
              <div 
                key={item.id} 
                className="border-b border-border/50 last:border-b-0 p-6 hover:bg-muted/30 transition-all duration-200 group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Rank Number */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                    index < 3 
                      ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="block font-semibold text-lg hover:text-emerald-600 transition-colors line-clamp-2 group-hover:text-emerald-600"
                        >
                          {item.title}
                          <Icons.externalLink className="inline w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        
                        {item.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Icons.trendingUp className="w-3 h-3" />
                            热度: {item.heat ?? "-"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.clock className="w-3 h-3" />
                            刚刚更新
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.eye className="w-3 h-3" />
                            {Math.floor(Math.random() * 10000 + 1000)}+ 浏览
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onAdd(item)}
                          className="gap-2"
                        >
                          <Icons.plus className="w-4 h-4" />
                          {t("app.actions.addToLibrary") || "添加到素材库"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

