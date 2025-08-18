"use client";
import React, { useState, useMemo } from "react";
import type { AppLocale } from "@/i18n/locales";
import type { 
  Subscription, 
  TimelineContent, 
  TimelineFilter, 
  SortOption,
  Platform 
} from "@/types";
import { SubscriptionManager } from "./SubscriptionManager";
import { TimelineSection } from "./TimelineSection";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export function InspirationMarket({ locale, messages }: { locale: AppLocale; messages: any }) {
  const t = (path: string) => path.split(".").reduce((acc: any, key) => acc?.[key], messages);
  
  // 订阅管理状态
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [timelineContent, setTimelineContent] = useState<TimelineContent[]>([]);
  
  // 筛选和排序状态
  const [filter, setFilter] = useState<TimelineFilter>({
    platforms: [],
    sources: [],
    contentTypes: [],
    dateRange: {},
  });
  const [sortBy, setSortBy] = useState<SortOption>("publishedAt");
  const [isLoading, setIsLoading] = useState(false);

  // 今日更新统计
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayContent = timelineContent.filter(
      item => new Date(item.publishedAt).toDateString() === today
    );
    
    return {
      total: todayContent.length,
      youtube: todayContent.filter(item => item.platform === 'youtube').length,
      wechat: todayContent.filter(item => item.platform === 'wechat').length,
    };
  }, [timelineContent]);

  // 处理订阅更新
  const handleSubscriptionUpdate = (updatedSubscriptions: Subscription[]) => {
    setSubscriptions(updatedSubscriptions);
    // TODO: 触发内容重新获取
  };

  // 处理内容入库
  const handleAddToMaterials = async (contentId: string) => {
    // TODO: 实现API调用
    setTimelineContent(prev => 
      prev.map(item => 
        item.id === contentId 
          ? { ...item, isInMaterials: true }
          : item
      )
    );
  };

  // 获取最新内容
  const handleFetchLatestContent = async () => {
    if (subscriptions.filter(s => s.status === 'active').length === 0) {
      // TODO: 显示提示
      console.log('请先添加订阅');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 调用API获取最新内容
      console.log('正在获取最新内容...');
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: 这里应该调用真实的API
      // const latestContent = await fetchLatestContent(subscriptions);
      // setTimelineContent(latestContent);
      
      console.log('获取最新内容完成');
    } catch (error) {
      console.error('获取最新内容失败:', error);
      // TODO: 显示错误提示
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* 页面标题区 */}
      <div className="border-b border-green-100 dark:border-green-800/30 bg-gradient-to-b from-green-50/50 to-background dark:from-green-900/10 dark:to-background backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">灵感集市</h1>
              <p className="text-muted-foreground mt-2 text-lg font-medium">订阅创作者，获取灵感，一键入库</p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full border border-green-200 dark:border-green-800 shadow-sm backdrop-blur-sm">
                <Icons.calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">今日更新</span>
                <span className="font-bold text-lg text-green-700 dark:text-green-400">{todayStats.total}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">YouTube {todayStats.youtube}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">公众号 {todayStats.wechat}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* 订阅管理模块 */}
        <section className="space-y-6">
          <SubscriptionManager
            subscriptions={subscriptions}
            onSubscriptionsUpdate={handleSubscriptionUpdate}
            locale={locale}
            messages={messages}
          />
        </section>

        {/* 分割线和统计 */}
        <div className="border-t border-border/50 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">最新内容</h2>
              <p className="text-muted-foreground text-sm mt-1">
                来自你订阅的 {subscriptions.filter(s => s.status === 'active').length} 个创作者
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleFetchLatestContent}
                disabled={isLoading || subscriptions.filter(s => s.status === 'active').length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Icons.refresh className={cn("w-4 h-4", isLoading && "animate-spin")} />
                {isLoading ? '获取中...' : '获取最新内容'}
              </button>
              {subscriptions.filter(s => s.status === 'active').length === 0 && (
                <p className="text-sm text-muted-foreground">
                  请先添加订阅
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 时间线内容模块 */}
        <TimelineSection
          content={timelineContent}
          subscriptions={subscriptions}
          filter={filter}
          sortBy={sortBy}
          isLoading={isLoading}
          onFilterChange={setFilter}
          onSortChange={setSortBy}
          onAddToMaterials={handleAddToMaterials}
          locale={locale}
          messages={messages}
        />
      </div>
    </div>
  );
}