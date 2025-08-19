"use client";
import React, { useState, useMemo, useEffect } from "react";
import type { AppLocale } from "@/i18n/locales";
import type { 
  TimelineContent, 
  Subscription, 
  TimelineFilter, 
  SortOption, 
  Platform,
  ContentType 
} from "@/types";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface TimelineSectionProps {
  content: TimelineContent[];
  subscriptions: Subscription[];
  filter: TimelineFilter;
  sortBy: SortOption;
  isLoading: boolean;
  onFilterChange: (filter: TimelineFilter) => void;
  onSortChange: (sort: SortOption) => void;
  onAddToMaterials: (contentId: string) => void;
  locale: AppLocale;
  messages: any;
}

export function TimelineSection({
  content: initialContent,
  subscriptions,
  filter,
  sortBy,
  isLoading,
  onFilterChange,
  onSortChange,
  onAddToMaterials,
  locale,
  messages
}: TimelineSectionProps) {
  const t = (path: string) => path.split(".").reduce((acc: any, key) => acc?.[key], messages);
  const { push } = useToast();
  
  // 本地状态
  const [content, setContent] = useState<TimelineContent[]>([]);
  const [displayCount, setDisplayCount] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  // 模拟时间线内容数据
  const mockTimelineContent: TimelineContent[] = [
    {
      id: "content-1",
      platform: "youtube",
      contentType: "video",
      title: "量子计算的原理和未来应用 - 深度解析",
      summary: "量子计算是一种基于量子力学原理的计算方式，相比传统计算机有着巨大优势。本视频将从基础原理讲解到实际应用前景。",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      author: "李永乐老师",
      sourceId: "sub-1",
      sourceName: "李永乐老师",
      sourceAvatar: "https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj",
      publishedAt: "2025-01-18T14:30:00Z",
      url: "https://youtube.com/watch?v=example1",
      tags: ["科普", "量子计算", "科技"],
      isInMaterials: false,
      duration: "15:32",
      viewCount: 125000,
      likeCount: 8900,
      hasSubtitles: true,
      createdAt: "2025-01-18T14:30:00Z",
      updatedAt: "2025-01-18T14:30:00Z"
    },
    {
      id: "content-2",
      platform: "wechat",
      contentType: "article",
      title: "2025年AI创业的三大趋势：从技术到商业化的全面分析",
      summary: "人工智能行业在2025年迎来了新的发展机遇。本文分析了当前最值得关注的三个创业方向，以及如何把握这些机会。",
      thumbnail: "https://mmbiz.qpic.cn/mmbiz_jpg/example/640",
      sourceId: "sub-2",
      sourceName: "36氪",
      sourceAvatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM4fgHg/132",
      publishedAt: "2025-01-18T12:00:00Z",
      url: "https://mp.weixin.qq.com/s/example2",
      tags: ["AI", "创业", "趋势分析"],
      isInMaterials: false,
      digest: "深度分析2025年AI创业的机遇与挑战，为创业者提供决策参考。",
      createdAt: "2025-01-18T12:00:00Z",
      updatedAt: "2025-01-18T12:00:00Z"
    },
    {
      id: "content-3",
      platform: "youtube",
      contentType: "short",
      title: "30秒看懂区块链技术",
      summary: "用最简单的语言解释区块链的核心概念",
      thumbnail: "https://i.ytimg.com/vi/shorts/example3.jpg",
      sourceId: "sub-1", 
      sourceName: "李永乐老师",
      sourceAvatar: "https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj",
      publishedAt: "2025-01-18T10:15:00Z",
      url: "https://youtube.com/shorts/example3",
      tags: ["科普", "区块链", "短视频"],
      isInMaterials: true,
      duration: "0:30",
      viewCount: 580000,
      likeCount: 15200,
      createdAt: "2025-01-18T10:15:00Z",
      updatedAt: "2025-01-18T10:15:00Z"
    },
    {
      id: "content-4",
      platform: "wechat",
      contentType: "multiArticle",
      title: "科技周报：本周值得关注的5个科技新闻",
      summary: "本周科技圈发生了哪些重要事件？我们为你整理了最值得关注的动态。",
      thumbnail: "https://mmbiz.qpic.cn/mmbiz_jpg/example4/640",
      sourceId: "sub-2",
      sourceName: "36氪", 
      sourceAvatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM4fgHg/132",
      publishedAt: "2025-01-17T18:00:00Z",
      url: "https://mp.weixin.qq.com/s/example4",
      tags: ["科技", "周报", "新闻"],
      isInMaterials: false,
      isMultiArticle: true,
      subArticles: [
        { title: "OpenAI发布新模型", url: "#", thumbnail: "https://example.com/thumb1.jpg" },
        { title: "特斯拉自动驾驶更新", url: "#", thumbnail: "https://example.com/thumb2.jpg" },
        { title: "Meta VR新品发布", url: "#", thumbnail: "https://example.com/thumb3.jpg" }
      ],
      createdAt: "2025-01-17T18:00:00Z",
      updatedAt: "2025-01-17T18:00:00Z"
    }
  ];

  // 初始化内容数据
  useEffect(() => {
    if (content.length === 0) {
      setContent(mockTimelineContent);
    }
  }, [content.length]);

  // 筛选和排序内容
  const filteredAndSortedContent = useMemo(() => {
    let filtered = content;

    // 平台筛选
    if (filter.platforms.length > 0) {
      filtered = filtered.filter(item => filter.platforms.includes(item.platform));
    }

    // 来源筛选
    if (filter.sources.length > 0) {
      filtered = filtered.filter(item => filter.sources.includes(item.sourceId));
    }

    // 内容类型筛选
    if (filter.contentTypes.length > 0) {
      filtered = filtered.filter(item => filter.contentTypes.includes(item.contentType));
    }

    // 时间范围筛选
    if (filter.dateRange.start || filter.dateRange.end) {
      filtered = filtered.filter(item => {
        const publishDate = new Date(item.publishedAt);
        const start = filter.dateRange.start ? new Date(filter.dateRange.start) : null;
        const end = filter.dateRange.end ? new Date(filter.dateRange.end) : null;
        
        if (start && publishDate < start) return false;
        if (end && publishDate > end) return false;
        return true;
      });
    }

    // 入库状态筛选
    if (filter.inMaterials !== undefined) {
      filtered = filtered.filter(item => item.isInMaterials === filter.inMaterials);
    }

    // 关键词筛选
    if (filter.keywords) {
      const keywords = filter.keywords.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(keywords) ||
        item.summary?.toLowerCase().includes(keywords) ||
        item.tags.some(tag => tag.toLowerCase().includes(keywords))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'publishedAt':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'popularity':
          const aScore = (a.viewCount || 0) + (a.likeCount || 0) * 10;
          const bScore = (b.viewCount || 0) + (b.likeCount || 0) * 10;
          return bScore - aScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [content, filter, sortBy]);

  // 当前显示的内容
  const displayedContent = filteredAndSortedContent.slice(0, displayCount);

  // 按时间分组
  const groupedContent = useMemo(() => {
    const groups: { [key: string]: TimelineContent[] } = {};
    
    displayedContent.forEach(item => {
      const publishDate = new Date(item.publishedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (publishDate.toDateString() === today.toDateString()) {
        groupKey = '今天';
      } else if (publishDate.toDateString() === yesterday.toDateString()) {
        groupKey = '昨天';
      } else {
        groupKey = publishDate.toLocaleDateString('zh-CN', {
          month: 'long',
          day: 'numeric'
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return groups;
  }, [displayedContent]);

  // 加载更多
  const loadMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  // 处理筛选器更新
  const updateFilter = (updates: Partial<TimelineFilter>) => {
    onFilterChange({ ...filter, ...updates });
  };

  // 获取平台图标和样式
  const getPlatformInfo = (platform: Platform) => {
    switch (platform) {
      case 'youtube':
        return { 
          icon: Icons.play, 
          color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
          name: 'YouTube'
        };
      case 'wechat':
        return { 
          icon: Icons.messageCircle, 
          color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
          name: '公众号'
        };
      default:
        return { 
          icon: Icons.globe, 
          color: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20',
          name: '其他'
        };
    }
  };

  // 获取内容类型标签
  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case 'video': return '视频';
      case 'short': return '短视频';
      case 'live': return '直播';
      case 'premiere': return '首播';
      case 'community': return '动态';
      case 'article': return '文章';
      case 'multiArticle': return '多图文';
      default: return type;
    }
  };

  // 格式化数字
  const formatNumber = (num?: number) => {
    if (!num) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Icons.filter className="w-4 h-4" />
            筛选
            {(filter.platforms.length > 0 || filter.sources.length > 0 || filter.contentTypes.length > 0) && (
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-sm" />
            )}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          共 {filteredAndSortedContent.length} 条内容
        </div>
      </div>

      {/* 筛选器展开面板 */}
      {showFilters && (
        <Card className="shadow-lg border-green-100 dark:border-green-800/30 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/5">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 平台筛选 */}
              <div>
                <label className="text-sm font-medium mb-2 block">平台</label>
                <div className="space-y-2">
                  {(['youtube', 'wechat'] as Platform[]).map(platform => {
                    const { name } = getPlatformInfo(platform);
                    return (
                      <label key={platform} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filter.platforms.includes(platform)}
                          onChange={(e) => {
                            const platforms = e.target.checked
                              ? [...filter.platforms, platform]
                              : filter.platforms.filter(p => p !== platform);
                            updateFilter({ platforms });
                          }}
                          className="rounded border-border"
                        />
                        {name}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 来源筛选 */}
              <div>
                <label className="text-sm font-medium mb-2 block">来源</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {subscriptions.filter(s => s.status === 'active').map(subscription => (
                    <label key={subscription.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filter.sources.includes(subscription.id)}
                        onChange={(e) => {
                          const sources = e.target.checked
                            ? [...filter.sources, subscription.id]
                            : filter.sources.filter(s => s !== subscription.id);
                          updateFilter({ sources });
                        }}
                        className="rounded border-border"
                      />
                      {subscription.displayName || subscription.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* 内容类型 */}
              <div>
                <label className="text-sm font-medium mb-2 block">内容类型</label>
                <div className="space-y-2">
                  {(['video', 'short', 'article', 'multiArticle'] as ContentType[]).map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filter.contentTypes.includes(type)}
                        onChange={(e) => {
                          const contentTypes = e.target.checked
                            ? [...filter.contentTypes, type]
                            : filter.contentTypes.filter(t => t !== type);
                          updateFilter({ contentTypes });
                        }}
                        className="rounded border-border"
                      />
                      {getContentTypeLabel(type)}
                    </label>
                  ))}
                </div>
              </div>

              {/* 入库状态 */}
              <div>
                <label className="text-sm font-medium mb-2 block">入库状态</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="inMaterials"
                      checked={filter.inMaterials === undefined}
                      onChange={() => updateFilter({ inMaterials: undefined })}
                      className="rounded-full border-border"
                    />
                    全部
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="inMaterials"
                      checked={filter.inMaterials === false}
                      onChange={() => updateFilter({ inMaterials: false })}
                      className="rounded-full border-border"
                    />
                    未入库
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="inMaterials"
                      checked={filter.inMaterials === true}
                      onChange={() => updateFilter({ inMaterials: true })}
                      className="rounded-full border-border"
                    />
                    已入库
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange({
                  platforms: [],
                  sources: [],
                  contentTypes: [],
                  dateRange: {},
                })}
              >
                清除筛选
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                收起
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 内容列表 */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-muted rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(groupedContent).length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Icons.fileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">暂无内容</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {subscriptions.length === 0 
              ? '请先添加一些订阅' 
              : '尝试调整筛选条件或刷新内容'
            }
          </p>
          {subscriptions.length === 0 && (
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              去添加订阅
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedContent).map(([dateGroup, items]) => (
            <div key={dateGroup}>
              <div className="sticky top-20 z-10 flex items-center gap-3 py-2 mb-4 bg-background/95 backdrop-blur-sm">
                <h3 className="font-semibold text-lg">{dateGroup}</h3>
                <div className="h-px bg-border flex-1" />
                <span className="text-sm text-muted-foreground">{items.length} 条</span>
              </div>
              
              <div className="space-y-4">
                {items.map((item) => {
                  const platformInfo = getPlatformInfo(item.platform);
                  const PlatformIcon = platformInfo.icon;
                  
                  return (
                    <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 border-green-100/50 dark:border-green-800/30 bg-gradient-to-br from-white to-green-50/20 dark:from-gray-900 dark:to-green-900/5 hover:border-green-200 dark:hover:border-green-700/50">
                      <CardContent className="p-0">
                        <div className="relative">
                          {/* 操作按钮 - 右上角 */}
                          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="sm"
                              variant={item.isInMaterials ? "outline" : "default"}
                              disabled={item.isInMaterials}
                              onClick={() => !item.isInMaterials && onAddToMaterials(item.id)}
                              className={cn(
                                "h-7 px-2 text-xs font-medium shadow-sm",
                                item.isInMaterials 
                                  ? "border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-900/20" 
                                  : "bg-green-500 text-white hover:bg-green-600"
                              )}
                            >
                              {item.isInMaterials ? (
                                <Icons.checkCircle className="w-3 h-3" />
                              ) : (
                                <Icons.plus className="w-3 h-3" />
                              )}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.url, '_blank')}
                              className="h-7 px-2 text-xs border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20 shadow-sm"
                            >
                              <Icons.externalLink className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="flex gap-2 p-2">
                            {/* 缩略图 - 放大到与内容等高 */}
                            <div className="relative flex-shrink-0 h-full">
                              <img
                                src={item.thumbnail || '/placeholder-image.jpg'}
                                alt={item.title}
                                className="h-full w-auto max-w-[200px] object-cover rounded-lg"
                              />
                              {item.duration && (
                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded font-medium">
                                  {item.duration}
                                </div>
                              )}
                              {item.isLive && (
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded font-medium">
                                  直播
                                </div>
                              )}
                            </div>
                            
                            {/* 内容信息 */}
                            <div className="flex-1 min-w-0 pr-16">
                              <div className="space-y-1">
                              {/* 创作者信息 - 突出显示 */}
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <img 
                                    src={item.sourceAvatar} 
                                    alt={item.sourceName}
                                    className="w-8 h-8 rounded-full object-cover ring-1 ring-white shadow-md"
                                  />
                                  {/* 平台标识 - 更加明显 */}
                                  <div className={cn(
                                    "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border border-white shadow-md flex items-center justify-center",
                                    item.platform === 'youtube' 
                                      ? "bg-red-500 text-white" 
                                      : "bg-green-500 text-white"
                                  )}>
                                    <PlatformIcon className="w-2.5 h-2.5" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-base text-foreground truncate">
                                      {item.sourceName}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground font-medium">
                                    {formatTime(item.publishedAt)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* 内容标题 */}
                              <div>
                                <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1">
                                  <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="hover:underline"
                                  >
                                    {item.title}
                                  </a>
                                </h4>
                              </div>
                              
                              {/* 摘要 */}
                              {item.summary && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {item.summary}
                                </p>
                              )}
                              
                              {/* 多图文子文章 */}
                              {item.isMultiArticle && item.subArticles && (
                                <div>
                                  <details className="group/details">
                                    <summary className="text-sm text-primary cursor-pointer hover:underline font-medium">
                                      查看其他 {item.subArticles.length} 篇文章
                                    </summary>
                                    <div className="mt-2 pl-4 border-l-2 border-primary/30 space-y-1">
                                      {item.subArticles.map((subArticle, index) => (
                                        <a
                                          key={index}
                                          href={subArticle.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                          {index + 2}. {subArticle.title}
                                        </a>
                                      ))}
                                    </div>
                                  </details>
                                </div>
                              )}
                              
                              {/* 数据指标 */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {item.viewCount && (
                                  <div className="flex items-center gap-1">
                                    <Icons.eye className="w-3 h-3" />
                                    <span>{formatNumber(item.viewCount)}</span>
                                  </div>
                                )}
                                
                                {item.likeCount && (
                                  <div className="flex items-center gap-1">
                                    <Icons.heart className="w-3 h-3" />
                                    <span>{formatNumber(item.likeCount)}</span>
                                  </div>
                                )}
                                
                                {item.hasSubtitles && (
                                  <span className="px-1.5 py-0.5 bg-muted rounded text-xs">字幕</span>
                                )}
                              </div>
                              
                            </div>
                          </div>
                        </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* 加载更多 */}
          {displayCount < filteredAndSortedContent.length && (
            <div className="text-center py-8">
              <Button 
                onClick={loadMore} 
                variant="outline" 
                className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20 font-medium shadow-sm hover:shadow-md transition-all duration-200 px-6 py-3"
              >
                <Icons.refresh className="w-4 h-4" />
                加载更多 ({filteredAndSortedContent.length - displayCount} 条剩余)
              </Button>
            </div>
          )}
          
          {displayCount >= filteredAndSortedContent.length && filteredAndSortedContent.length > 20 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              已显示全部 {filteredAndSortedContent.length} 条内容
            </div>
          )}
        </div>
      )}
    </div>
  );
}