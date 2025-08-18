import { NextResponse } from 'next/server';
import type { TophubApiResponse, TophubItem, HotItem } from '@/types';

const TOPHUB_BASE_URL = process.env.TOPHUB_BASE_URL || 'https://www.tophubdata.com/api';
const TOPHUB_API_KEY = process.env.TOPHUB_API_KEY;

// 固定的4个榜单配置
const FIXED_BOARDS = [
  {
    hashid: 'WnBe01o371',
    name: '微信 ‧ 24h热文榜',
    source: 'weixin' as const
  },
  {
    hashid: '5PdMaaadmg', 
    name: '微信 ‧ 科技 ‧ 24h热文榜',
    source: 'weixin_tech' as const
  },
  {
    hashid: 'mproPpoq6O',
    name: '知乎 ‧ 热榜', 
    source: 'zhihu' as const
  },
  {
    hashid: 'KqndgxeLl9',
    name: '微博 ‧ 热搜榜',
    source: 'weibo' as const
  }
];

async function tophubFetch<T>(endpoint: string): Promise<T> {
  if (!TOPHUB_API_KEY) {
    throw new Error('Tophub API key not configured');
  }

  const response = await fetch(`${TOPHUB_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': TOPHUB_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Tophub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function convertTophubItemToHotItem(tophubItem: any, source: HotItem['source']): HotItem {
  
  // 解析热度数字
  const extractHeat = (viewsText: string): number => {
    if (!viewsText) return 0;
    const match = viewsText.match(/(\d+(?:\.\d+)?)\s*([万千]?)/);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2];
      if (unit === '万') return Math.floor(num * 10000);
      if (unit === '千') return Math.floor(num * 1000);
      return Math.floor(num);
    }
    return 0;
  };

  return {
    id: `${source}-${tophubItem.time || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: tophubItem.title,
    summary: tophubItem.description,
    heat: extractHeat(tophubItem.views),
    source: source,
    url: tophubItem.url,
    cover: tophubItem.thumbnail,
    timestamp: tophubItem.time ? new Date(parseInt(tophubItem.time) * 1000).toISOString() : undefined,
    mobile_url: tophubItem.url,
  };
}

export async function GET() {
  try {
    // 并行获取4个固定榜单的数据
    console.log('🚀 开始获取固定榜单数据...');
    
    const boardPromises = FIXED_BOARDS.map(async (board) => {
      try {
        console.log(`📡 获取 ${board.name} (${board.hashid})`);
        const response = await tophubFetch<any>(`/nodes/${board.hashid}`);
        
        // 简化调试信息
        console.log(`🔍 ${board.name} 响应检查`);
        if (response && response.data && response.data.items) {
          console.log(`📊 榜单信息: ${response.data.name} - ${response.data.display} (${response.data.items.length} 条)`);
        }
        
        // 提取数据数组
        let items: any[] = [];
        if (Array.isArray(response)) {
          items = response;
          console.log(`✅ ${board.name}: 直接数组，长度 ${items.length}`);
        } else if (response && response.data && Array.isArray(response.data.items)) {
          items = response.data.items;
          console.log(`✅ ${board.name}: response.data.items 数组，长度 ${items.length}`);
        } else if (response && Array.isArray(response.data)) {
          items = response.data;
          console.log(`✅ ${board.name}: response.data 数组，长度 ${items.length}`);
        } else {
          console.warn(`⚠️ ${board.name} 数据格式不正确`);
        }
        
        if (items.length > 0) {
          console.log(`✅ ${board.name}: 获取到 ${items.length} 条数据`);
          console.log(`第一条数据示例:`, JSON.stringify(items[0], null, 2));
          
          // 转换数据，传入正确的source类型
          return items.map((item) => convertTophubItemToHotItem(item, board.source));
        } else {
          console.log(`❌ ${board.name}: 没有获取到任何数据`);
          return [];
        }
      } catch (error) {
        console.error(`❌ 获取 ${board.name} 失败:`, error);
        return [];
      }
    });
    
    // 等待所有请求完成
    const boardResults = await Promise.all(boardPromises);
    
    // 合并所有榜单的数据
    const allHotItems = boardResults.flat();
    
    console.log(`🎉 总共获取到 ${allHotItems.length} 条热点数据`);
    console.log(`📊 数据分布: 微信(${allHotItems.filter(i => i.source === 'weixin').length}), 微信科技(${allHotItems.filter(i => i.source === 'weixin_tech').length}), 知乎(${allHotItems.filter(i => i.source === 'zhihu').length}), 微博(${allHotItems.filter(i => i.source === 'weibo').length})`);
    
    if (allHotItems.length === 0) {
      throw new Error('所有榜单都没有获取到数据');
    }
    
    return NextResponse.json(allHotItems);
  } catch (error) {
    console.warn('Tophub API 不可用，使用模拟数据:', error);
    
    // 回退到模拟数据
    const sources = ["weixin", "weixin_tech", "zhihu", "weibo"] as const;
    const mockData = Array.from({ length: 24 }).map((_, i) => ({
      id: `mock-${sources[i % 4]}-${i}`,
      title: `AI 热点 ${i + 1}`,
      summary: "这是一段自动生成的摘要，用于占位展示。",
      heat: 1000 - i * 13,
      source: sources[i % 4],
      url: "https://example.com",
    }));
    
    return NextResponse.json(mockData);
  }
}