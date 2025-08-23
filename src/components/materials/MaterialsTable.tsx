"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { AppLocale } from "@/i18n/locales";
import type { Material } from "@/types";
import { fetchMaterials, deleteMaterials } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export default function MaterialsTable({ locale, messages }: { locale: AppLocale; messages: any }) {
  const t = (path: string) => path.split(".").reduce((acc: any, key) => acc?.[key], messages);
  const [list, setList] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [viewMode, setViewMode] = useState<'grid'>('grid');
  const [platforms, setPlatforms] = useState<{ wechat: boolean; youtube: boolean }>({ wechat: true, youtube: true });
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const data = await fetchMaterials();
        if (!cancelled) {
          setList(data);
        }
      } catch (e) {
        if (!cancelled) {
          setList([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleAll(checked: boolean) {
    setList((prev) => prev.map((m) => ({ ...m, selected: checked })));
  }

  function toggleOne(id: string, checked: boolean) {
    setList((prev) => prev.map((m) => (m.id === id ? { ...m, selected: checked } : m)));
  }

  function batchRewrite() {
    const selectedItems = filtered.filter(m => m.selected);
    if (selectedItems.length === 0) {
      push("请先选择要批量改写的素材", "warning");
      return;
    }
    push(`已选择 ${selectedItems.length} 个素材进行批量改写`, "info");
  }

  function batchDelete() {
    const selectedIds = list.filter(m => m.selected).map(m => m.id);
    if (selectedIds.length === 0) {
      push("请先选择要删除的素材", "warning");
      return;
    }
    deleteMaterials(selectedIds)
      .then((res) => {
        setList((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
        push(`成功删除 ${res.deleted} 个素材`, "success");
      })
      .catch(() => {
        push("删除失败，请稍后重试", "error");
      });
  }

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return list;
    return list.filter((m) => m.title.includes(kw));
  }, [keyword, list]);

  const allSelected = filtered.length > 0 && filtered.every((m) => m.selected);
  const selectedCount = filtered.filter(m => m.selected).length;

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'wechat':
      case 'weixin':
      case '微信':
        return Icons.messageCircle;
      case 'zhihu':
      case '知乎':
        return Icons.layers;
      case 'baidu':
      case '百度':
        return Icons.trendingUp;
      default:
        return Icons.link;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'wechat':
      case 'weixin':
      case '微信':
        return 'from-green-500 to-emerald-600';
      case 'zhihu':
      case '知乎':
        return 'from-blue-500 to-indigo-600';
      case 'baidu':
      case '百度':
        return 'from-red-500 to-orange-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  const getProxyImage = (url?: string) => {
    if (!url) return url as any;
    if (url.includes('mmbiz.qpic.cn') || url.includes('qlogo.cn')) {
      return `/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">素材库管理</h1>
          <p className="text-muted-foreground mt-1">
            管理和组织您的创作素材，一键改写生成新内容
          </p>
        </div>
        
        <div />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>总素材数</CardDescription>
              <Icons.folder className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{list.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已收集 {list.length} 个素材
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>已选择</CardDescription>
              <Icons.checkCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{selectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              选中 {selectedCount} 个素材
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>热门来源</CardDescription>
              <Icons.trendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">微信</div>
            <p className="text-xs text-muted-foreground mt-1">
              最活跃的素材来源
            </p>
          </CardContent>
        </Card>

        {/* 移除今日新增模块 */}
      </div>

      {/* Controls */}
      <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="relative w-full max-w-xl">
                <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t("app.actions.search") || "搜索素材标题..."}
                  aria-label={t("app.actions.search") || "搜索"}
                  className="input h-11 pr-4 w-full rounded-xl"
                  style={{ paddingLeft: '44px' }}
                />
              </div>
              
              {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => batchRewrite()}
                    className="gap-2"
                  >
                    <Icons.edit className="w-4 h-4" />
                    批量改写 ({selectedCount})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => batchDelete()}
                    className="gap-2 text-red-600 hover:text-red-700"
                  >
                    <Icons.trash className="w-4 h-4" />
                    批量删除 ({selectedCount})
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* 平台筛选：默认全选，可切换 wechat / youtube */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={platforms.wechat}
                    onChange={(e) => setPlatforms((p) => ({ ...p, wechat: e.target.checked }))}
                    className="rounded border-border"
                  />
                  WeChat
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={platforms.youtube}
                    onChange={(e) => setPlatforms((p) => ({ ...p, youtube: e.target.checked }))}
                    className="rounded border-border"
                  />
                  YouTube
                </label>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Materials Display */}
      <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3">
                <Icons.loader className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-muted-foreground">{t("app.common.loading") || "加载中..."}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered
              .filter((m) => {
                const src = (m.source || '').toLowerCase();
                const isWeChat = src.includes('wechat') || src.includes('weixin') || m.source === '微信';
                const isYouTube = src.includes('youtube');
                return (platforms.wechat && isWeChat) || (platforms.youtube && isYouTube);
              })
              .map((material, index) => (
              <Card
                key={material.id}
                className={cn(
                  "group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in",
                  material.selected && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                )}
                style={{ animationDelay: `${index * 40}ms` }}
                onClick={() => toggleOne(material.id, !material.selected)}
              >
                {/* 大封面 */}
                <div className="relative aspect-[16/10] bg-muted">
                  {/* 选择复选框 */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={!!material.selected}
                      onChange={(e) => { e.stopPropagation(); toggleOne(material.id, e.target.checked); }}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 bg-white/90"
                    />
                  </div>
                  {material.cover ? (
                    <img
                      src={getProxyImage(material.cover)}
                      alt={material.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icons.file className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                </div>
                {/* 标题置底 */}
                <div className="p-4">
                  <h3 className="text-base font-semibold leading-snug line-clamp-2">
                    {material.title}
                  </h3>
                  <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {(() => { const Icon = getSourceIcon(material.source); return <Icon className="w-4 h-4" />; })()}
                      {material.source}
                    </span>
                    <span>
                      {new Date(material.collectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

