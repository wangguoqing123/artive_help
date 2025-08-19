// API配置 - 使用真实的大家啦API
const API_BASE_URL = 'https://www.dajiala.com';
const API_KEY = process.env.NEXT_PUBLIC_INSPIRATION_API_KEY || 'JZL4b6905ee09a19cee';

// 请求限制 - 防止频繁请求
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 最小请求间隔1秒

// 启动时打印配置信息（开发环境）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('=== API配置信息 ===');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('API_KEY存在:', !!API_KEY);
  console.log('API_KEY值:', API_KEY ? `${API_KEY.substring(0, 5)}...` : '未设置');
}

// 搜索结果接口类型定义
export interface WechatAccountSearchResult {
  wxId: string;           // 微信ID
  wxName: string;         // 公众号名称
  wxAvatar: string;       // 头像URL
  description?: string;   // 描述信息
  followerCount?: number; // 粉丝数
  articleCount?: number;  // 文章数
  latestPublish?: string; // 最近发布时间
  biz?: string;          // 公众号biz
  ghid?: string;         // 公众号ghid
}

// 大家啦API原始响应格式
interface DajialaAccountResult {
  name: string;
  biz: string;
  owner_name: string;
  customer_type: string;
  ghid: string;
  wxid: string;
  fans: number;
  avg_top_read: number;
  avg_top_zan: number;
  avatar: string;
  qrcode: string;
  week_articles: string | number;
  lastest_publish: number;
}

interface DajialaApiResponse {
  code: number;
  msg: string;
  cost_money?: number;
  remain_money?: number;
  data?: DajialaAccountResult[];
}

// API响应类型定义
export interface ApiResponse<T> {
  code: number;          // 状态码：200成功，其他失败
  message: string;       // 提示信息
  data?: T;             // 返回数据
}

/**
 * 搜索公众号
 * @param keyword 搜索关键词（公众号名称）
 * @returns 搜索结果
 */
export async function searchWechatAccount(keyword: string): Promise<ApiResponse<WechatAccountSearchResult | null>> {
  try {
    // 检查请求频率限制
    const currentTime = Date.now();
    const timeSinceLastRequest = currentTime - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`请求太频繁，等待 ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
    
    // 构建请求URL
    const url = `${API_BASE_URL}/fbmain/monitor/v3/wx_account/search`;
    
    // 构建form-urlencoded格式的请求体
    const params = new URLSearchParams({
      keyword: keyword.trim(),
      page: '1',
      size: '10',
      key: API_KEY,
      verifycode: '' // 可选的验证码
    });
    
    // 构建请求头 - 使用form-urlencoded
    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    };
    
    // 打印调试信息
    console.log('=== 搜索API调试信息 ===');
    console.log('请求URL:', url);
    console.log('请求方法: POST');
    console.log('请求参数:', params.toString());
    console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 5)}...` : '未设置');
    
    // 调用搜索API - 使用POST方法和form-urlencoded格式
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: params.toString(),
    });
    
    // 打印响应信息
    console.log('响应状态:', response.status);
    console.log('响应状态文本:', response.statusText);
    console.log('响应头:', response.headers);

    // 检查响应是否成功
    if (!response.ok) {
      console.error('API响应失败:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      });
      
      // 尝试读取错误响应内容
      let errorMessage = '';
      try {
        const errorData = await response.json();
        console.error('错误响应数据:', errorData);
        errorMessage = errorData.message || errorData.error || '请求失败';
      } catch (e) {
        // 如果无法解析为JSON，尝试读取文本
        try {
          errorMessage = await response.text();
          console.error('错误响应文本:', errorMessage);
        } catch (textError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      
      return {
        code: response.status,
        message: errorMessage,
        data: null
      };
    }

    // 解析响应
    let result: DajialaApiResponse;
    
    try {
      const responseText = await response.text();
      console.log('原始响应文本:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.error('API返回空响应');
        return {
          code: 500,
          message: 'API返回空响应，请稍后重试',
          data: null
        };
      }
      
      result = JSON.parse(responseText);
      console.log('解析后的API响应:', result);
    } catch (parseError) {
      console.error('解析响应失败:', parseError);
      return {
        code: 500,
        message: '响应格式错误，请稍后重试',
        data: null
      };
    }
    
    // 验证响应对象
    if (!result || typeof result !== 'object') {
      console.error('无效的响应格式:', result);
      return {
        code: 500,
        message: '响应格式无效，请稍后重试',
        data: null
      };
    }
    
    // 检查result是否有code字段（API可能返回不同格式）
    if (!('code' in result)) {
      console.error('响应缺少code字段:', result);
      
      // 尝试检查是否有其他错误信息
      if ('message' in result || 'error' in result) {
        return {
          code: 500,
          message: (result as any).message || (result as any).error || '服务器返回错误',
          data: null
        };
      }
      
      return {
        code: 500,
        message: '响应格式不正确，请稍后重试',
        data: null
      };
    }
    
    // 处理大家啦API的响应
    if (result.code === 0 && result.data && result.data.length > 0) {
      // 搜索成功，找到公众号
      // 尝试找到最精确匹配的结果
      const searchKeywordLower = keyword.trim().toLowerCase();
      let bestMatch = result.data.find(item => 
        item.name.toLowerCase() === searchKeywordLower
      );
      
      // 如果没有精确匹配，找最相似的
      if (!bestMatch) {
        bestMatch = result.data.find(item => 
          item.name.toLowerCase().includes(searchKeywordLower) ||
          searchKeywordLower.includes(item.name.toLowerCase())
        );
      }
      
      // 如果还是没有，使用第一个结果
      if (!bestMatch) {
        bestMatch = result.data[0];
      }
      
      // 转换为我们的格式
      const transformedResult: WechatAccountSearchResult = {
        wxId: bestMatch.wxid || bestMatch.ghid || `wx_${Date.now()}`,
        wxName: bestMatch.name,
        wxAvatar: bestMatch.avatar || 'https://wx.qlogo.cn/mmhead/Q3auHgzwzM4fgHg/132',
        description: bestMatch.owner_name || bestMatch.customer_type || '',
        followerCount: bestMatch.fans || 0,
        articleCount: parseInt(String(bestMatch.week_articles)) || 0,
        latestPublish: bestMatch.lastest_publish ? new Date(bestMatch.lastest_publish * 1000).toISOString() : undefined,
        biz: bestMatch.biz,
        ghid: bestMatch.ghid
      };
      
      console.log('转换后的结果:', transformedResult);
      
      return {
        code: 200,
        message: '搜索成功',
        data: transformedResult
      };
    } else if (result.code === 0 && (!result.data || result.data.length === 0)) {
      // 搜索成功但没有找到结果
      return {
        code: 404,
        message: `未找到名为"${keyword}"的公众号，请检查名称是否正确`,
        data: null
      };
    } else {
      // API返回错误
      console.error('API错误响应:', result);
      
      // 特殊错误码处理
      if (result.code === 20001) {
        return {
          code: 403,
          message: 'API余额不足，请联系管理员充值',
          data: null
        };
      }
      
      return {
        code: result.code || 500,
        message: result.msg || '系统错误，请稍后重试',
        data: null
      };
    }
  } catch (error) {
    // 网络或解析错误
    console.error('=== 搜索公众号发生错误 ===');
    console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('错误消息:', error instanceof Error ? error.message : String(error));
    console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    console.error('完整错误对象:', error);
    
    // 判断错误类型，提供更友好的提示
    if (error instanceof TypeError) {
      if (error.message.includes('fetch')) {
        console.error('诊断：fetch失败，可能是网络问题');
        return {
          code: 500,
          message: '网络连接失败，请检查网络后重试',
          data: null
        };
      } else if (error.message.includes('Failed to fetch')) {
        console.error('诊断：无法连接到API服务器');
        return {
          code: 500,
          message: 'API服务器连接失败，请检查网络或联系管理员',
          data: null
        };
      } else if (error.message.includes('CORS')) {
        console.error('诊断：CORS跨域问题');
        return {
          code: 500,
          message: '跨域请求被阻止，请联系管理员配置服务器',
          data: null
        };
      }
    }
    
    // 其他未知错误
    return {
      code: 500,
      message: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      data: null
    };
  }
}

/**
 * 获取公众号详情（可扩展）
 * @param wxId 微信ID
 * @returns 公众号详情
 */
export async function getWechatAccountDetail(wxId: string): Promise<ApiResponse<WechatAccountSearchResult | null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wechat/detail/${wxId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (result.code === 200) {
      return {
        code: 200,
        message: '获取成功',
        data: result.data
      };
    } else {
      console.error('获取公众号详情失败:', result);
      return {
        code: result.code || 500,
        message: result.message || '获取失败',
        data: null
      };
    }
  } catch (error) {
    console.error('获取公众号详情错误:', error);
    return {
      code: 500,
      message: '系统错误，请稍后重试',
      data: null
    };
  }
}

/**
 * 批量搜索公众号（可扩展）
 * @param keywords 搜索关键词数组
 * @returns 批量搜索结果
 */
export async function batchSearchWechatAccounts(keywords: string[]): Promise<ApiResponse<WechatAccountSearchResult[]>> {
  try {
    // 并发搜索所有关键词
    const searchPromises = keywords.map(keyword => searchWechatAccount(keyword));
    const results = await Promise.all(searchPromises);
    
    // 过滤出成功的结果
    const successResults = results
      .filter(r => r.code === 200 && r.data)
      .map(r => r.data as WechatAccountSearchResult);
    
    return {
      code: 200,
      message: `成功搜索到 ${successResults.length} 个公众号`,
      data: successResults
    };
  } catch (error) {
    console.error('批量搜索失败:', error);
    return {
      code: 500,
      message: '批量搜索失败',
      data: []
    };
  }
}