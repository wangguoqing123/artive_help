export type HotItem = {
  id: string;
  title: string;
  summary?: string;
  heat?: number;
  source: "weixin" | "zhihu" | "baidu";
  url: string;
  cover?: string;
};

export type Material = {
  id: string;
  title: string;
  source: string;
  collectedAt: string;
};

export type Article = {
  id: string;
  title: string;
  content: string;
};

export type ContentItem = {
  id: string;
  title: string;
  status: "draft" | "pending" | "published" | "failed";
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type Account = { id: string; name: string };

export type Fingerprint = {
  id: string;
  name: string;
  corePath?: string;
  userDataDir?: string;
};

export type PublishHistoryItem = {
  id: string;
  article: string;
  account: string;
  status: "published" | "failed";
  reason?: string;
  time: string;
};

