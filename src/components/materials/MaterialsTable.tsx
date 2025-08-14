"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { AppLocale } from "@/i18n/locales";
import type { Material } from "@/types";
import { fetchMaterials } from "@/lib/api";
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const data = await fetchMaterials();
      if (!cancelled) {
        setList(data);
        setLoading(false);
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
    const selectedCount = list.filter(m => m.selected).length;
    if (selectedCount === 0) {
      push("请先选择要删除的素材", "warning");
      return;
    }
    setList((prev) => prev.filter((m) => !m.selected));
    push(`成功删除 ${selectedCount} 个素材`, "success");
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
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Icons.upload className="w-4 h-4" />
            导入素材
          </Button>
          <Button className="gap-2">
            <Icons.plus className="w-4 h-4" />
            添加素材
          </Button>
        </div>
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

        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>今日新增</CardDescription>
              <Icons.calendar className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              比昨天增加 8%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-0">
                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t("app.actions.search") || "搜索素材标题..."}
                  className="input pl-10 w-full lg:w-80"
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
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Icons.layers className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 w-8 p-0"
                >
                  <Icons.barChart className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="sm">
                <Icons.filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
              <Button variant="outline" size="sm">
                <Icons.sortDesc className="w-4 h-4 mr-2" />
                排序
              </Button>
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
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((material, index) => {
              const SourceIcon = getSourceIcon(material.source);
              const sourceColor = getSourceColor(material.source);
              
              return (
                <Card 
                  key={material.id} 
                  className={cn(
                    "group cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-fade-in",
                    material.selected && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => toggleOne(material.id, !material.selected)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br", sourceColor)}>
                        <SourceIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!material.selected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleOne(material.id, e.target.checked);
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {material.title}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <SourceIcon className="w-4 h-4" />
                        <span>{material.source}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icons.clock className="w-4 h-4" />
                        <span>{new Date(material.collectedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        asChild
                      >
                        <a href={`/${locale}/rewrite?ids=${material.id}`}>
                          <Icons.edit className="w-4 h-4 mr-2" />
                          {t("app.actions.rewrite") || "改写"}
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-10 h-10 p-0"
                      >
                        <Icons.moreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="p-4 text-left w-12">
                        <input 
                          type="checkbox" 
                          checked={allSelected} 
                          onChange={(e) => toggleAll(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      </th>
                      <th className="p-4 text-left font-semibold">标题</th>
                      <th className="p-4 text-left font-semibold">来源</th>
                      <th className="p-4 text-left font-semibold">收集时间</th>
                      <th className="p-4 text-left font-semibold w-32">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((material, index) => {
                      const SourceIcon = getSourceIcon(material.source);
                      
                      return (
                        <tr 
                          key={material.id} 
                          className={cn(
                            "border-b transition-colors hover:bg-muted/50 animate-fade-in",
                            material.selected && "bg-emerald-50 dark:bg-emerald-900/20"
                          )}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={!!material.selected}
                              onChange={(e) => toggleOne(material.id, e.target.checked)}
                              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-4 font-medium">{material.title}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <SourceIcon className="w-4 h-4 text-muted-foreground" />
                              {material.source}
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(material.collectedAt).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              asChild
                            >
                              <a href={`/${locale}/rewrite?ids=${material.id}`}>
                                <Icons.edit className="w-4 h-4 mr-2" />
                                改写
                              </a>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

