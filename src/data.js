/* 光体·文无界 — 数据层
 * 全部数据从原站 https://llwtsscpjckdm.ok.kimi.link/ 完整迁移
 */
(function (WJ) {
  'use strict';

  /* ---------- 站点信息 ---------- */
  WJ.BRAND = {
    name: '光体•文无界',
    sub: '文案生成系统',
    footer: '光体•文无界 · 深度内容创作',
    filePrefix: '光体文无界',
  };

  /* ---------- 文明维度（54 项，与原站完全一致） ---------- */
  WJ.CIVILIZATIONS = [
    '北纬三十度文明', '玛雅文明', '阿兹特克文明', '印加文明', '奥尔梅克文明',
    '北美印第安文明', '纳斯卡文明', '古埃及文明', '努比亚文明', '阿克苏姆帝国',
    '大津巴布韦', '马里帝国', '桑海帝国', '苏美尔文明', '巴比伦文明',
    '亚述文明', '赫梯文明', '波斯文明', '腓尼基文明', '犹太文明',
    '古希腊文明', '古罗马文明', '凯尔特文明', '维京文明', '米诺斯文明',
    '迈锡尼文明', '伊特鲁里亚文明', '古印度文明', '高棉帝国', '爪哇文明',
    '占婆文明', '斯里兰卡文明', '缅甸蒲甘文明', '华夏文明', '三星堆文明',
    '良渚文明', '红水河文化', '吐蕃文明', '红山文化', '萨满文化',
    '波利尼西亚文明', '毛利文明', '复活节岛文明', '亚特兰蒂斯文明', '利莫里亚文明',
    '姆大陆文明', '山海经文明', '巨人族文明', '外星远古接触', '地心世界',
    '前亚当文明', 'UFO与外星文明', '百慕大三角', '曼德拉效应',
  ];

  /* ---------- 行业维度（54 项，与原站完全一致） ---------- */
  WJ.INDUSTRIES = [
    '身心灵疗愈', '冥想正念', '瑜伽修行', '能量疗愈', '占星命理',
    '水晶矿物', '女性成长', '情感关系', '婚姻家庭', '亲子教育',
    '情绪管理', '自我认知', '健康养生', '中医养生', '营养食疗',
    '运动健身', '睡眠管理', '抗衰老', 'AI人工智能', '量子科技',
    '元宇宙', '生物科技', '新能源', '太空探索', '创业商业',
    '投资理财', '自媒体运营', '知识付费', '品牌营销', '企业管理',
    '非遗文化', '国学经典', '音乐艺术', '设计美学', '茶道文化',
    '书画艺术', '餐饮美食', '旅行探索', '家居生活', '时尚穿搭',
    '美妆护肤', '宠物生活', '教育培训', '职业规划', '阅读写作',
    '演讲表达', '领导力', '终身学习', '生命之花', '神圣几何',
    '音频疗愈', '色彩疗愈', '自然疗法', '宇宙意识',
  ];

  /* ---------- 内容类型（6 种）
   * 修复：原站 UI 声称「可多选」，实际只取 types[0] 生成。
   * 改为单选，选择即生效，不再误导。
   */
  WJ.CONTENT_TYPES = [
    {
      id: 'long-form', name: '深度长文', icon: 'FileText',
      description: '3000-5000字，结构完整，逻辑严谨',
      platforms: ['公众号', '知乎'],
    },
    {
      id: 'viral', name: '爆款文案', icon: 'Zap',
      description: '标题党+情绪价值+转化引导',
      platforms: ['公众号', '小红书'],
    },
    {
      id: 'short-video', name: '短视频脚本', icon: 'Video',
      description: '15-60秒，分镜头设计，台词+画面+字幕',
      platforms: ['抖音', '快手', '视频号'],
    },
    {
      id: 'podcast', name: '播客口播稿', icon: 'Mic',
      description: '口语化表达，自然流畅',
      platforms: ['视频号', 'B站'],
    },
    {
      id: 'moments', name: '朋友圈文案', icon: 'Smartphone',
      description: '简短精炼，带话题标签',
      platforms: ['朋友圈'],
    },
    {
      id: 'qa', name: '问答互动', icon: 'MessageCircle',
      description: '一问一答形式，适合知识分享',
      platforms: ['知乎', '知识星球'],
    },
  ];

  /* ---------- 目标平台（9 个） ---------- */
  WJ.PLATFORMS = [
    { id: 'wechat-mp', name: '公众号', description: '自动生成标题、摘要、正文格式' },
    { id: 'wechat-moments', name: '朋友圈', description: '自动生成适合朋友圈的短文案' },
    { id: 'xiaohongshu', name: '小红书', description: '自动生成种草风格文案、emoji' },
    { id: 'zhihu', name: '知乎', description: '自动生成问题标题、回答结构' },
    { id: 'zsxq', name: '知识星球', description: '自动生成付费内容格式、引导语' },
    { id: 'channels', name: '视频号', description: '自动生成适合微信生态的文案' },
    { id: 'douyin', name: '抖音', description: '自动生成竖屏脚本、话题标签' },
    { id: 'kuaishou', name: '快手', description: '自动生成接地气风格文案' },
    { id: 'bilibili', name: 'B站', description: '自动生成视频标题、简介、分P标题' },
  ];

  /* ---------- 平台在预览头部的展示名 / 署名 ---------- */
  WJ.PLATFORM_LABEL = {
    公众号: '微信公众号', 小红书: '小红书', 知乎: '知乎',
    朋友圈: '朋友圈', 知识星球: '知识星球',
    抖音: '抖音', 快手: '快手', 视频号: '微信视频号', 'B站': '哔哩哔哩',
  };

  WJ.PLATFORM_AUTHOR = {
    公众号: '订阅号 · 光体•文无界', 小红书: '小红书', 知乎: '知乎 · 问答社区',
    朋友圈: '朋友圈', 知识星球: '知识星球',
    抖音: '抖音', 快手: '快手', 视频号: '微信视频号', 'B站': '哔哩哔哩',
  };

  /* ---------- 配图配色主题（8 套） ---------- */
  WJ.PALETTES = [
    { name: '暖沙', bg1: '#f0e8da', bg2: '#e8ddd0', bg3: '#f5efe6', accent: '#c9a96e', text: '#4a3a2a', muted: '#9a8a78' },
    { name: '雾蓝', bg1: '#dde2e6', bg2: '#d0d8e0', bg3: '#e6eaec', accent: '#8fa3bf', text: '#3a3a4a', muted: '#7a8a9a' },
    { name: '烟粉', bg1: '#eadcd8', bg2: '#e0d0c8', bg3: '#f0e6e0', accent: '#b89090', text: '#4a3530', muted: '#9a8080' },
    { name: '薄荷', bg1: '#d8e2d6', bg2: '#ccd8c8', bg3: '#e2eadf', accent: '#8a9e86', text: '#3a4538', muted: '#7a8e78' },
    { name: '暮紫', bg1: '#ddd8e0', bg2: '#d0c8d6', bg3: '#e6e0ea', accent: '#9a86a8', text: '#3a2e42', muted: '#887a96' },
    { name: '琥珀', bg1: '#e8ddd0', bg2: '#ddd0c0', bg3: '#f0e8d8', accent: '#b89860', text: '#4a3e2a', muted: '#968670' },
    { name: '青瓷', bg1: '#cdd8d2', bg2: '#bccdc2', bg3: '#dae4de', accent: '#7a9e8a', text: '#2e3e36', muted: '#6a8e7a' },
    { name: '胭脂', bg1: '#e8d8d4', bg2: '#dcc8c2', bg3: '#f0e4de', accent: '#b07870', text: '#4a2e2a', muted: '#967068' },
  ];

  WJ.typeByName = function (name) {
    return WJ.CONTENT_TYPES.filter(function (t) { return t.name === name; })[0] || WJ.CONTENT_TYPES[0];
  };
  WJ.platformByName = function (name) {
    return WJ.PLATFORMS.filter(function (p) { return p.name === name; })[0] || WJ.PLATFORMS[0];
  };
})(window.WJ = window.WJ || {});
