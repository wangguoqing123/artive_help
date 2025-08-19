"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import type { AppLocale } from "@/i18n/locales";
import type { Subscription, SubscriptionSearchResult, Platform, SubscriptionStatus } from "@/types";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { searchWechatAccount, type WechatAccountSearchResult } from "@/lib/api/inspiration";
import { WechatSearchResult } from "./WechatSearchResult";

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  onSubscriptionsUpdate: (subscriptions: Subscription[]) => void;
  locale: AppLocale;
  messages: any;
}

export function SubscriptionManager({ 
  subscriptions, 
  onSubscriptionsUpdate, 
  locale, 
  messages 
}: SubscriptionManagerProps) {
  const t = (path: string) => path.split(".").reduce((acc: any, key) => acc?.[key], messages);
  const { push } = useToast();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SubscriptionSearchResult[]>([]);
  const [wechatSearchResult, setWechatSearchResult] = useState<WechatAccountSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const lastSearchRef = useRef<string>("");
  
  // 订阅列表状态
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    displayName: string;
    tags: string[];
  }>({ displayName: "", tags: [] });

  // 模拟搜索API
  const mockSearchResults: SubscriptionSearchResult[] = [
    {
      id: "yt-1",
      platform: "youtube",
      name: "李永乐老师",
      avatar: "https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj",
      description: "用理科思维看世界，分享科学知识",
      followerCount: 1200000,
      url: "https://youtube.com/@liyongle",
      isSubscribed: false
    },
    {
      id: "wx-1", 
      platform: "wechat",
      name: "36氪",
      avatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM4fgHg/132",
      description: "让一部分人先看到未来",
      followerCount: 500000,
      url: "https://mp.weixin.qq.com/profile?src=3&timestamp=1234567890&ver=1&signature=example",
      isSubscribed: false
    }
  ];

  // 模拟现有订阅数据
  const mockSubscriptions: Subscription[] = [
    {
      id: "sub-1",
      platform: "youtube",
      name: "李永乐老师",
      displayName: "永乐老师",
      avatar: "https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj",
      url: "https://youtube.com/@liyongle",
      description: "用理科思维看世界，分享科学知识",
      followerCount: 1200000,
      status: "active",
      tags: ["科普", "教育"],
      defaultTags: ["科普"],
      lastSyncAt: "2025-01-18T10:30:00Z",
      createdAt: "2025-01-15T08:00:00Z",
      updatedAt: "2025-01-18T10:30:00Z"
    },
    {
      id: "sub-2", 
      platform: "wechat",
      name: "36氪",
      avatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM4fgHg/132",
      url: "https://mp.weixin.qq.com/profile?src=3&timestamp=1234567890&ver=1&signature=example",
      description: "让一部分人先看到未来",
      followerCount: 500000,
      status: "active",
      tags: ["科技", "创业"],
      defaultTags: ["科技"],
      lastSyncAt: "2025-01-18T09:15:00Z",
      createdAt: "2025-01-10T12:00:00Z",
      updatedAt: "2025-01-18T09:15:00Z"
    }
  ];

  // 初始化mock数据
  useEffect(() => {
    if (subscriptions.length === 0) {
      onSubscriptionsUpdate(mockSubscriptions);
    }
  }, [subscriptions.length, onSubscriptionsUpdate]);

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  // 搜索功能 - 集成真实API
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 1) {
      setWechatSearchResult(null);
      setSearchError(null);
      setShowSearchResults(false);
      return;
    }

    // 防止重复搜索相同内容
    if (lastSearchRef.current === query && isSearching) {
      console.log('正在搜索相同内容，跳过');
      return;
    }
    
    // 如果正在搜索，先取消
    if (isSearching) {
      console.log('正在搜索中，请等待...');
      push("正在搜索中，请稍后再试", "warning");
      return;
    }

    lastSearchRef.current = query;
    setIsSearching(true);
    setShowSearchResults(true);
    setSearchError(null);
    setWechatSearchResult(null);
    
    try {
      // 调用真实的搜索API
      const apiResponse = await searchWechatAccount(query);
      
      if (apiResponse.code === 200 && apiResponse.data) {
        // 成功找到公众号
        setWechatSearchResult(apiResponse.data);
        setSearchError(null);
        
        // 显示成功提示
        push(`找到公众号：${apiResponse.data.wxName}`, "success");
      } else if (apiResponse.code === 404) {
        // 未找到公众号
        setWechatSearchResult(null);
        setSearchError("未找到该公众号，请检查名称是否正确");
        push(apiResponse.message || "未找到该公众号，请检查名称是否正确", "warning");
      } else {
        // 其他错误
        setWechatSearchResult(null);
        
        // 根据错误类型显示不同的提示
        if (apiResponse.message.includes('网络')) {
          setSearchError(apiResponse.message);
          push(apiResponse.message, "error");
        } else {
          // 后台记录详细错误，用户只看到友好提示
          console.error('搜索API错误:', apiResponse);
          setSearchError("系统繁忙，请稍后重试");
          push("系统繁忙，请稍后重试", "error");
        }
      }
    } catch (error) {
      // 处理未预期的错误
      console.error('搜索过程发生错误:', error);
      setWechatSearchResult(null);
      setSearchError("搜索失败，请检查网络连接");
      push("搜索失败，请检查网络连接", "error");
    } finally {
      setIsSearching(false);
      // 清除最后搜索记录，允许重新搜索
      setTimeout(() => {
        lastSearchRef.current = "";
      }, 500);
    }
  }, [push]);

  // 处理搜索输入
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // 移除即时搜索，改为按钮触发
  };

  // 处理搜索按钮点击
  const handleSearchClick = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 1) {
      push("请输入公众号名称进行搜索", "error");
      return;
    }
    handleSearch(trimmedQuery);
  };

  // 处理回车键搜索
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  // 添加订阅（支持微信公众号）
  const handleWechatSubscribe = async (account: WechatAccountSearchResult) => {
    if (subscriptions.length >= 200) {
      push("订阅数量已达上限（200个），请先删除一些订阅", "error");
      return;
    }

    // 检查是否已订阅
    const isAlreadySubscribed = subscriptions.some(sub => 
      sub.name === account.wxName && sub.platform === 'wechat'
    );
    
    if (isAlreadySubscribed) {
      push("该公众号已订阅", "warning");
      return;
    }

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      platform: "wechat",
      name: account.wxName,
      avatar: account.wxAvatar || "https://wx.qlogo.cn/mmhead/Q3auHgzwzM4fgHg/132",
      url: `https://mp.weixin.qq.com/${account.wxId}`,
      description: account.description,
      followerCount: account.followerCount,
      status: "active",
      tags: [],
      defaultTags: [],
      lastSyncAt: account.latestPublish,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedSubscriptions = [...subscriptions, newSubscription];
    onSubscriptionsUpdate(updatedSubscriptions);
    
    // 更新搜索结果，标记为已订阅
    setWechatSearchResult(null);
    setShowSearchResults(false);
    setSearchQuery("");

    push(`成功订阅公众号：${account.wxName}`, "success");
  };

  // 添加订阅（兼容旧版）
  const handleSubscribe = async (result: SubscriptionSearchResult) => {
    if (subscriptions.length >= 200) {
      push("订阅数量已达上限（200个），请先删除一些订阅", "error");
      return;
    }

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      platform: result.platform,
      name: result.name,
      avatar: result.avatar,
      url: result.url,
      description: result.description,
      followerCount: result.followerCount,
      status: "active",
      tags: [],
      defaultTags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedSubscriptions = [...subscriptions, newSubscription];
    onSubscriptionsUpdate(updatedSubscriptions);
    
    // 更新搜索结果状态
    setSearchResults(prev => 
      prev.map(item => 
        item.id === result.id ? { ...item, isSubscribed: true } : item
      )
    );

    push("订阅成功！开始采集近期内容（约1-2分钟）", "success");
  };

  // 更新订阅状态
  const handleStatusToggle = (id: string, status: SubscriptionStatus) => {
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === id ? { ...sub, status, updatedAt: new Date().toISOString() } : sub
    );
    onSubscriptionsUpdate(updatedSubscriptions);
    push(status === "active" ? "已启用订阅" : "已停用订阅", "success");
  };

  // 删除订阅
  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个订阅吗？已采集的内容将保留。")) {
      const updatedSubscriptions = subscriptions.filter(sub => sub.id !== id);
      onSubscriptionsUpdate(updatedSubscriptions);
      push("订阅已删除", "success");
    }
  };

  // 开始编辑
  const startEdit = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setEditForm({
      displayName: subscription.displayName || subscription.name,
      tags: subscription.tags
    });
  };

  // 保存编辑
  const saveEdit = () => {
    if (!editingId) return;
    
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === editingId 
        ? { 
            ...sub, 
            displayName: editForm.displayName,
            tags: editForm.tags,
            updatedAt: new Date().toISOString()
          } 
        : sub
    );
    onSubscriptionsUpdate(updatedSubscriptions);
    setEditingId(null);
    push("更新成功", "success");
  };

  // 筛选订阅
  const filteredSubscriptions = subscriptions.filter(sub => {
    switch (activeTab) {
      case 'active': return sub.status === 'active';
      case 'inactive': return sub.status === 'inactive';
      default: return true;
    }
  });

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'youtube': return Icons.play;
      case 'wechat': return Icons.messageCircle;
      default: return Icons.globe;
    }
  };

  const getPlatformColor = (platform: Platform) => {
    switch (platform) {
      case 'youtube': return 'text-red-500';
      case 'wechat': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const formatFollowerCount = (count?: number) => {
    if (!count) return '-';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '从未同步';
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  return (
    <div className="space-y-8">
      {/* 搜索新订阅 */}
      <Card className="shadow-lg border-green-100 dark:border-green-800/30 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <Icons.search className="w-5 h-5 text-white" />
            </div>
            新增订阅
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          <div className="relative" ref={searchContainerRef}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索公众号名或 YouTube 频道名"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-background"
                />
              </div>
              <Button
                onClick={handleSearchClick}
                disabled={isSearching || searchQuery.trim().length < 1}
                className="px-6 py-3 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isSearching ? (
                  <>
                    <Icons.loader className="w-4 h-4 animate-spin mr-2" />
                    搜索中
                  </>
                ) : (
                  <>
                    <Icons.search className="w-4 h-4 mr-2" />
                    搜索
                  </>
                )}
              </Button>
            </div>

            {/* 搜索结果 - 改进的弹框样式 */}
            {showSearchResults && (
              <>
                {/* 半透明背景遮罩 */}
                <div 
                  className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 animate-in fade-in duration-200"
                  onClick={() => setShowSearchResults(false)}
                />
                
                {/* 搜索结果弹框 */}
                <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="relative max-w-xl mx-auto">
                    {/* 小三角指示器 */}
                    <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 rotate-45 border-l border-t border-gray-200 dark:border-gray-700 shadow-sm"></div>
                    
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {isSearching ? (
                        // 搜索中状态 - 更紧凑
                        <div className="p-8 text-center">
                          <Icons.loader className="w-6 h-6 animate-spin text-green-500 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            正在搜索公众号...
                          </p>
                        </div>
                      ) : searchError ? (
                        // 错误状态 - 更紧凑
                        <div className="p-8 text-center">
                          <Icons.alertCircle className="w-6 h-6 text-red-500 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                            未找到公众号
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {searchError}
                          </p>
                        </div>
                      ) : wechatSearchResult ? (
                        // 成功找到公众号
                        <div className="p-0">
                          <WechatSearchResult
                            account={wechatSearchResult}
                            isSubscribed={subscriptions.some(sub => 
                              sub.name === wechatSearchResult.wxName && sub.platform === 'wechat'
                            )}
                            onSubscribe={handleWechatSubscribe}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 我的订阅 */}
      <Card className="shadow-lg border-green-100 dark:border-green-800/30 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <Icons.heart className="w-5 h-5 text-white" />
              </div>
              我的订阅
              <span className="text-base font-medium text-muted-foreground">
                ({subscriptions.length}/200)
              </span>
            </div>
            
            {/* 状态切换标签 */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(['all', 'active', 'inactive'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md transition-colors",
                    activeTab === tab 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === 'all' ? '全部' : tab === 'active' ? '启用' : '停用'}
                  <span className="ml-1 text-xs">
                    ({tab === 'all' ? subscriptions.length : 
                      subscriptions.filter(s => s.status === tab).length})
                  </span>
                </button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Icons.heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">
                {activeTab === 'all' ? '暂无订阅' : `暂无${activeTab === 'active' ? '启用' : '停用'}的订阅`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all' ? '搜索并添加你关注的创作者' : '尝试切换到其他标签查看'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubscriptions.map((subscription) => {
                const PlatformIcon = getPlatformIcon(subscription.platform);
                const isEditing = editingId === subscription.id;
                
                return (
                  <div key={subscription.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-border rounded-lg hover:border-border/80 transition-colors">
                    <div className="relative">
                      <img 
                        src={subscription.avatar} 
                        alt={subscription.name}
                        className="w-12 h-12 rounded-full object-cover shadow-md"
                      />
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold",
                        subscription.platform === 'youtube' 
                          ? "bg-red-500 text-white" 
                          : "bg-green-500 text-white"
                      )}>
                        <PlatformIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.displayName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                            className="w-full px-2 py-1 border border-border rounded text-sm"
                            placeholder="备注名"
                          />
                          <input
                            type="text"
                            value={editForm.tags.join(', ')}
                            onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                            className="w-full px-2 py-1 border border-border rounded text-sm"
                            placeholder="标签（用逗号分隔）"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg truncate">
                              {subscription.displayName || subscription.name}
                            </h4>
                            <span className={cn(
                              "px-2 py-1 text-xs font-semibold rounded-full border",
                              subscription.platform === 'youtube' 
                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800" 
                                : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                            )}>
                              {subscription.platform === 'youtube' ? 'YouTube' : '微信公众号'}
                            </span>
                            <div className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              subscription.status === 'active' 
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
                            )}>
                              {subscription.status === 'active' ? '启用' : '停用'}
                            </div>
                            {subscription.followerCount && (
                              <span className="text-xs text-muted-foreground">
                                {formatFollowerCount(subscription.followerCount)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>最近同步：{formatTimeAgo(subscription.lastSyncAt)}</span>
                            {subscription.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Icons.tag className="w-3 h-3" />
                                <span>{subscription.tags.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={saveEdit}>保存</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>取消</Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(subscription)}
                          >
                            <Icons.edit className="w-4 h-4 sm:mr-0" />
                            <span className="sm:hidden ml-1">编辑</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusToggle(
                              subscription.id, 
                              subscription.status === 'active' ? 'inactive' : 'active'
                            )}
                          >
                            {subscription.status === 'active' ? '停用' : '启用'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(subscription.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-200"
                          >
                            <Icons.trash className="w-4 h-4 sm:mr-0" />
                            <span className="sm:hidden ml-1">删除</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}