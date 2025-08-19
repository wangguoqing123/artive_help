import { NextRequest, NextResponse } from 'next/server';

// 模拟公众号数据库
const mockWechatAccounts = [
  {
    wxId: "wx_36kr",
    wxName: "36氪",
    wxAvatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM6UXCCLMnQhXSPwGvqVTQNGN5fwFNticMFU/0",
    description: "让一部分人先看到未来",
    followerCount: 850000,
    articleCount: 1256,
    latestPublish: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1天前
  },
  {
    wxId: "wx_huxiu",
    wxName: "虎嗅APP",
    wxAvatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM5mE8Y37BibHwj5MN9icMrBsEUbw7HkQ5oHQ/0",
    description: "聚合优质的创新信息与人群",
    followerCount: 620000,
    articleCount: 892,
    latestPublish: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2小时前
  },
  {
    wxId: "wx_geekpark",
    wxName: "极客公园",
    wxAvatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM4Z0JzFpVqKSXR2TtHdTzgZTIxYHiaDFB5M/0",
    description: "科技创新者的大本营",
    followerCount: 450000,
    articleCount: 756,
    latestPublish: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5小时前
  },
  {
    wxId: "wx_ifanr",
    wxName: "爱范儿",
    wxAvatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM7KgBmhYD9PfJRtLgO6rpMFO3TLzCjVVJQ/0",
    description: "让未来触手可及",
    followerCount: 380000,
    articleCount: 1025,
    latestPublish: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12小时前
  },
  {
    wxId: "wx_pingwest",
    wxName: "品玩",
    wxAvatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM5a4T8FBwQh9mjLEEicibHUIcYvVibibn0iaZTw/0",
    description: "有品好玩的科技，一切与你有关",
    followerCount: 290000,
    articleCount: 623,
    latestPublish: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
  },
  {
    wxId: "wx_tmtpost",
    wxName: "钛媒体",
    wxAvatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM7kQrJhBu5xN8FCiaEt0kKQWXxqBzGg2T7w/0",
    description: "引领未来商业与生活新知",
    followerCount: 520000,
    articleCount: 1456,
    latestPublish: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6小时前
  },
  {
    wxId: "wx_zaobao",
    wxName: "早报",
    wxAvatar: "https://wx.qlogo.cn/mmhead/Q3auHgzwzM5Q5kY2Zia6PQrJnRqhXd3xpUibRJpKXaEBw/0",
    description: "每日早报，知晓天下事",
    followerCount: 180000,
    articleCount: 365,
    latestPublish: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8小时前
  }
];

export async function GET(request: NextRequest) {
  // 获取查询参数
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');
  
  // 打印请求日志
  console.log('=== 模拟API收到搜索请求 ===');
  console.log('搜索关键词:', keyword);
  console.log('请求头:', Object.fromEntries(request.headers.entries()));
  
  // 参数验证
  if (!keyword || keyword.trim().length === 0) {
    return NextResponse.json({
      code: 400,
      message: '搜索关键词不能为空',
      data: null
    }, { status: 400 });
  }
  
  // 模拟延迟（更真实）
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 搜索逻辑：模糊匹配公众号名称
  const searchKeyword = keyword.trim().toLowerCase();
  const foundAccount = mockWechatAccounts.find(account => 
    account.wxName.toLowerCase().includes(searchKeyword)
  );
  
  if (foundAccount) {
    console.log('找到匹配的公众号:', foundAccount.wxName);
    return NextResponse.json({
      code: 200,
      message: '搜索成功',
      data: foundAccount
    });
  } else {
    console.log('未找到匹配的公众号');
    return NextResponse.json({
      code: 404,
      message: `未找到名为"${keyword}"的公众号，请检查名称是否正确`,
      data: null
    });
  }
}

// 获取所有可搜索的公众号列表（用于测试）
export async function POST(request: NextRequest) {
  return NextResponse.json({
    code: 200,
    message: '获取成功',
    data: mockWechatAccounts.map(account => ({
      wxName: account.wxName,
      description: account.description
    }))
  });
}