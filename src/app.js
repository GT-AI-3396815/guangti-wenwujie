/* 光体·文无界 — 主应用
 * 迁移自原站，并按专业审计全面升级：
 *  [NEW-17] 创作/改写双模式（润色/精简/扩写/换平台）
 *  [NEW-18] 自定义主题输入（维度 / 维度+主题 / 纯主题 三种来源）
 *  [NEW-19] CTA 转化目标选择
 *  [NEW-20] 选题灵感（8 个切口+推荐类型/平台）
 *  [NEW-21] 系列大纲（连载规划）
 *  [NEW-22] 内容体检（字数/阅读时长/金句/风险词）
 *  [NEW-23] 传说维度免责卡 + 敏感行业合规清单
 *  [NEW-24] 流式生成实时回显
 *  [NEW-25] 历史导出/导入
 *  [NEW-26] 配图提示词（供文生图工具出真实配图）
 *  [NEW-27] 额度标注为演示额度
 */
(function (WJ) {
  'use strict';

  /* 品牌 logo（透明底金色曼陀罗，base64 内嵌） */
  WJ.LOGO_SRC = 'data:image/png;base64,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';

  /* ==================== 图标 ==================== */
  var I = {
    history: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    spark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>',
    copy: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    down: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
    chevron: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    send: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    gear: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>',
    refresh: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M8 16H3v5"/></svg>',
    fileText: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h8"/><path d="M8 17h8"/></svg>',
    alert: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
    checkBig: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    bulb: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    list: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>',
    upload: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>',
    pen: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>',
    logo: '<img src="' + WJ.LOGO_SRC + '" style="width:100%;height:100%;object-fit:contain;display:block;" alt="" />'
  };

  /* ==================== 状态 ==================== */
  var S = {
    workMode: 'create',     // create | rewrite
    mode: 'civilization',   // civilization | industry
    dimension: '',
    topicMode: 'dimension', // dimension | blend | custom
    customTopic: '',
    cta: 'interact',
    type: '深度长文',
    platform: '公众号',
    rewriteText: '',
    rewriteMode: '润色',
    content: '',
    streamText: '',
    titles: [],
    title: '',
    loading: false,
    loadLabel: '',
    error: '',
    historyOpen: false,
    history: [],
    copied: false,
    dropdown: false,
    toast: '',
    quota: WJ.quota.get(),
    published: {},          // platform -> true
    preview: null,          // { platform, content, dimension, type }
    ideas: [],
    ideasOpen: false,
    ideasLoading: false,
    series: [],
    seriesOpen: false,
    seriesLoading: false,
    riskOpen: false,
    imgPromptsOpen: false,
  };

  var $ = function (id) { return document.getElementById(id); };
  var esc = WJ.escapeHtml;

  /* ==================== 维度/主题辅助 ==================== */
  /* 返回 {promptDim, label, mystery, sensitive} */
  function effectiveDim() {
    var d = S.dimension;
    var topic = (S.customTopic || '').trim();
    if (S.topicMode === 'custom' || (!d && topic)) {
      return {
        promptDim: topic,
        label: topic.length > 14 ? topic.substring(0, 14) + '..' : topic,
        mystery: false,
        sensitive: false,
      };
    }
    if (S.topicMode === 'blend' && topic) {
      return {
        promptDim: d + '（结合：' + topic + '）',
        label: d + ' × 主题',
        mystery: WJ.dimensionTag(d) === 'mystery',
        sensitive: WJ.isSensitive(d),
      };
    }
    return {
      promptDim: d,
      label: d,
      mystery: d ? WJ.dimensionTag(d) === 'mystery' : false,
      sensitive: d ? WJ.isSensitive(d) : false,
    };
  }

  /* ==================== 主渲染 ==================== */
  function render() {
    var root = $('root');
    root.innerHTML = shellHtml();
    bindShell();
    renderPanel();
  }

  function shellHtml() {
    var q = S.quota;
    var list = S.mode === 'civilization' ? WJ.CIVILIZATIONS : WJ.INDUSTRIES;

    return '' +
    '<div class="app-wrapper">' +
      '<header class="app-header"><div class="header-inner">' +
        '<div class="brand">' +
          '<div class="brand-logo" style="display:flex;align-items:center;justify-content:center;overflow:hidden;">' + I.logo + '</div>' +
          '<div class="brand-text"><h1>' + esc(WJ.BRAND.name) + '</h1><p>' + esc(WJ.BRAND.sub) + '</p></div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<button id="btn-settings" class="history-btn" title="接口设置">' + I.gear + '设置</button>' +
          '<button id="btn-history" class="history-btn ' + (S.historyOpen ? 'active' : '') + '">' + I.history + '历史记录' +
            (S.history.length > 0 ? '<span class="history-badge">' + S.history.length + '</span>' : '') +
          '</button>' +
        '</div>' +
      '</div></header>' +

      '<main class="main-container">' +
        (S.historyOpen ? historyHtml() : '') +
        '<div class="panel-card">' +

          /* ---------- 创作 / 改写 切换 ---------- */
          '<div style="display:flex;justify-content:center;gap:10px;margin-bottom:20px;">' +
            '<button class="pill-toggle ' + (S.workMode === 'create' ? 'active' : '') + '" data-workmode="create">' + I.pen + ' 从零创作</button>' +
            '<button class="pill-toggle ' + (S.workMode === 'rewrite' ? 'active' : '') + '" data-workmode="rewrite">改写润色</button>' +
          '</div>' +

          (S.workMode === 'create' ? createFormHtml(list) : rewriteFormHtml()) +

          '<div style="display:flex;flex-direction:column;align-items:center;margin-top:24px;margin-bottom:8px;">' +
            '<button id="btn-generate" class="btn-generate"' + (S.loading ? ' disabled' : '') + '>' +
              (S.loading
                ? '<span class="spinner"></span>' + esc(S.loadLabel || '生成中...')
                : (S.workMode === 'create' ? I.spark + '一键生成' : I.pen + '开始改写')) +
            '</button>' +
            '<p class="hint-text" style="font-size:11px;">' +
              (q.remaining > 0
                ? '今日剩余额度 <b style="color:#b08a4a">' + q.remaining + '</b>/' + q.limit + '（演示额度 · 仅本机浏览器计数）'
                : '<span style="color:#c86464">今日额度已用完，请明日继续（演示额度 · 仅本机浏览器计数）</span>') +
            '</p>' +
          '</div>' +
        '</div>' +

        '<div id="result-slot"></div>' +
        (S.error ? errorHtml() : '') +
      '</main>' +

      '<footer class="app-footer"><div class="deco-line" style="margin-bottom:12px;"></div><p>' + esc(WJ.BRAND.footer) + '</p></footer>' +
    '</div>';
  }

  /* ---------- 创作表单 ---------- */
  function createFormHtml(list) {
    var ed = effectiveDim();
    var topicInputStyle = 'width:100%;box-sizing:border-box;min-height:0;margin-top:8px;padding:10px 14px;border:1px solid rgba(201,169,110,.3);border-radius:12px;font-size:13px;color:#4a3f32;background:#fffc;resize:none;line-height:1.6;';

    var h = '';

    /* 维度选择 */
    h += '<div style="margin-bottom:20px;">' +
      '<label class="section-label">选择维度</label>' +
      '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:10px;">' +
        '<button class="pill-toggle ' + (S.mode === 'civilization' ? 'active' : '') + '" data-mode="civilization">文明</button>' +
        '<button class="pill-toggle ' + (S.mode === 'industry' ? 'active' : '') + '" data-mode="industry">行业</button>' +
      '</div>' +
      '<div class="select-wrapper">' +
        '<select id="sel-dimension" class="select-styled">' +
          '<option value="">请选择' + (S.mode === 'civilization' ? '文明' : '行业') + '...</option>' +
          list.map(function (d) {
            return '<option value="' + esc(d) + '"' + (S.dimension === d ? ' selected' : '') + '>' + esc(d) + '</option>';
          }).join('') +
        '</select>' +
        '<span class="select-arrow">' + I.chevron + '</span>' +
      '</div>' +
    '</div>';

    /* [NEW-18] 自定义主题 */
    h += '<div style="margin-bottom:20px;">' +
      '<label class="section-label">主题来源</label>' +
      '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">' +
        '<button class="content-pill ' + (S.topicMode === 'dimension' ? 'active' : '') + '" data-topicmode="dimension">只用维度</button>' +
        '<button class="content-pill ' + (S.topicMode === 'blend' ? 'active' : '') + '" data-topicmode="blend">维度+我的主题</button>' +
        '<button class="content-pill ' + (S.topicMode === 'custom' ? 'active' : '') + '" data-topicmode="custom">只写我的主题</button>' +
      '</div>' +
      (S.topicMode !== 'dimension'
        ? '<textarea id="input-topic" class="content-textarea" style="' + topicInputStyle + '" rows="2" placeholder="例如：我们新推出的颂钵疗愈课程，主打职场女性睡前10分钟放松……">' + esc(S.customTopic) + '</textarea>'
        : '') +
    '</div>';

    /* 内容类型 */
    h += '<div style="margin-bottom:20px;">' +
      '<label class="section-label">内容类型（单选）</label>' +
      '<div id="types" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">' +
        WJ.CONTENT_TYPES.map(function (t) {
          return '<button class="content-pill ' + (S.type === t.name ? 'active' : '') + '" data-type="' + esc(t.name) + '" title="' + esc(t.description) + '">' + esc(t.name) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';

    /* [NEW-19] CTA */
    h += '<div style="margin-bottom:20px;">' +
      '<label class="section-label">结尾转化目标（CTA）</label>' +
      '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">' +
        WJ.CTA_OPTIONS.map(function (c) {
          return '<button class="content-pill ' + (S.cta === c.id ? 'active' : '') + '" data-cta="' + esc(c.id) + '" title="' + esc(c.desc) + '">' + esc(c.name) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';

    /* 平台 */
    h += '<div style="margin-bottom:4px;">' +
      '<label class="section-label">目标平台（单选）</label>' +
      '<div id="platforms" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">' +
        WJ.PLATFORMS.map(function (p) {
          return '<button class="platform-pill ' + (S.platform === p.name ? 'active' : '') + '" data-platform="' + esc(p.name) + '" title="' + esc(p.description) + '">' + esc(p.name) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';

    /* [NEW-20][NEW-21] 选题灵感 / 系列大纲 */
    h += '<div style="display:flex;justify-content:center;gap:10px;margin-top:18px;">' +
      '<button id="btn-ideas" class="history-btn ' + (S.ideasOpen ? 'active' : '') + '"' + (S.ideasLoading ? ' disabled' : '') + '>' +
        (S.ideasLoading ? '<span class="spinner"></span>灵感生成中...' : I.bulb + '选题灵感') +
      '</button>' +
      '<button id="btn-series" class="history-btn ' + (S.seriesOpen ? 'active' : '') + '"' + (S.seriesLoading ? ' disabled' : '') + '>' +
        (S.seriesLoading ? '<span class="spinner"></span>大纲生成中...' : I.list + '系列大纲') +
      '</button>' +
    '</div>';

    if (S.ideasOpen && S.ideas.length) h += ideasHtml();
    if (S.seriesOpen && S.series.length) h += seriesHtml();

    /* 底部状态 */
    h += '<div class="panel-footer">' +
      '<div style="display:flex;align-items:center;justify-content:center;gap:24px;">' +
        '<div class="stat-item"><span class="stat-num">' + S.history.length + '</span><span class="stat-label">已生成</span></div>' +
        '<span class="stat-divider"></span>' +
        '<div class="stat-item"><span class="stat-num" style="font-size:14px;">' + (ed.label ? esc(ed.label) : '—') + '</span><span class="stat-label">内容主题</span></div>' +
        '<span class="stat-divider"></span>' +
        '<div class="stat-item"><span class="stat-num" style="font-size:14px;">' + esc(S.platform) + '</span><span class="stat-label">适配平台</span></div>' +
      '</div>' +
    '</div>';

    return h;
  }

  /* ---------- [NEW-20] 选题灵感面板 ---------- */
  function ideasHtml() {
    return '<div style="margin-top:14px;padding:14px;background:#fdf9f2;border:1px solid rgba(201,169,110,.25);border-radius:14px;">' +
      '<div style="font-size:12px;font-weight:700;color:#8a6a3a;margin-bottom:10px;">' + I.bulb + ' 选题灵感（点一条直接填入主题与平台）</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
        S.ideas.map(function (idea, idx) {
          return '<div class="idea-item" data-idea="' + idx + '" style="padding:8px 10px;background:#fff;border:1px solid rgba(201,169,110,.18);border-radius:10px;cursor:pointer;">' +
            '<div style="font-size:13px;font-weight:600;color:#4a3f32;">' + esc(idea.title) + '</div>' +
            '<div style="font-size:12px;color:#8a7a6a;margin-top:2px;">' + esc(idea.angle) + '</div>' +
            '<div style="font-size:11px;color:#b08a4a;margin-top:3px;">推荐：' + esc(idea.type) + ' · ' + esc(idea.platform) + '</div>' +
          '</div>';
        }).join('') +
      '</div></div>';
  }

  /* ---------- [NEW-21] 系列大纲面板 ---------- */
  function seriesHtml() {
    return '<div style="margin-top:14px;padding:14px;background:#fdf9f2;border:1px solid rgba(201,169,110,.25);border-radius:14px;">' +
      '<div style="font-size:12px;font-weight:700;color:#8a6a3a;margin-bottom:10px;">' + I.list + ' 系列大纲（点一篇标题直接开写）</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
        S.series.map(function (ep, idx) {
          return '<div class="idea-item" data-series="' + idx + '" style="padding:8px 10px;background:#fff;border:1px solid rgba(201,169,110,.18);border-radius:10px;cursor:pointer;">' +
            '<div style="font-size:13px;font-weight:600;color:#4a3f32;">' + esc(ep.title) + '</div>' +
            '<div style="font-size:12px;color:#8a7a6a;margin-top:2px;">要点：' + esc(ep.points) + '</div>' +
            '<div style="font-size:11px;color:#b08a4a;margin-top:3px;">篇间钩子：' + esc(ep.hook) + '</div>' +
          '</div>';
        }).join('') +
      '</div></div>';
  }

  /* ---------- 改写表单 ---------- */
  function rewriteFormHtml() {
    var h = '';
    h += '<div style="margin-bottom:18px;">' +
      '<label class="section-label">粘贴你要改的文案</label>' +
      '<textarea id="input-rewrite" class="content-textarea" style="width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid rgba(201,169,110,.3);border-radius:12px;font-size:13px;color:#4a3f32;background:#fffc;min-height:140px;resize:vertical;line-height:1.7;" placeholder="把已有文章/文案粘进来，下面选改写方式……">' + esc(S.rewriteText) + '</textarea>' +
    '</div>';
    h += '<div style="margin-bottom:18px;">' +
      '<label class="section-label">改写方式</label>' +
      '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">' +
        ['润色', '精简', '扩写', '换平台'].map(function (m) {
          var desc = { '润色': '保留结构，提升语言质感', '精简': '压缩到40%-60%，砍废话', '扩写': '扩充至2倍左右，补案例细节', '换平台': '改写成' + S.platform + '的本地形态' }[m];
          return '<button class="content-pill ' + (S.rewriteMode === m ? 'active' : '') + '" data-rewritemode="' + esc(m) + '" title="' + esc(desc) + '">' + esc(m) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';
    h += '<div style="margin-bottom:4px;">' +
      '<label class="section-label">目标平台（单选）</label>' +
      '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">' +
        WJ.PLATFORMS.map(function (p) {
          return '<button class="platform-pill ' + (S.platform === p.name ? 'active' : '') + '" data-platform="' + esc(p.name) + '" title="' + esc(p.description) + '">' + esc(p.name) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';
    return h;
  }

  /* ---------- 历史面板 ---------- */
  function historyHtml() {
    if (S.history.length === 0) {
      return '<div class="panel-card history-panel"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' + I.history + '<h3 style="font-size:14px;font-weight:500;color:#5a4d3f;margin:0;">生成历史</h3></div>' +
        '<button id="btn-history-close" class="icon-btn">' + I.close + '</button></div>' +
        '<div style="text-align:center;padding:32px 0;"><p style="font-size:13px;color:#9a8a78;margin:0;">暂无生成记录，开始你的第一次创作吧</p></div></div>';
    }
    return '<div class="panel-card history-panel">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' + I.history + '<h3 style="font-size:14px;font-weight:500;color:#5a4d3f;margin:0;">生成历史</h3></div>' +
        '<div style="display:flex;align-items:center;gap:4px;">' +
          '<button id="btn-history-export" class="icon-btn" title="导出备份(JSON)">' + I.down + '</button>' +
          '<button id="btn-history-import" class="icon-btn" title="导入备份(JSON)">' + I.upload + '</button>' +
          '<input type="file" id="history-file" accept=".json,application/json" style="display:none;">' +
          '<button id="btn-history-clear" class="icon-btn" title="清空历史">' + I.trash + '</button>' +
          '<button id="btn-history-close" class="icon-btn">' + I.close + '</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;max-height:288px;overflow-y:auto;padding-right:4px;">' +
        S.history.map(function (h) {
          return '<div class="history-item" data-hid="' + esc(h.id) + '">' +
            '<div style="min-width:0;flex:1;">' +
              '<p style="font-size:13px;color:#4a3f32;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(h.dimension) + ' · ' + esc((h.contentTypes || []).join('/')) + '</p>' +
              '<p style="font-size:11px;color:#9a8a78;margin:0;">' + esc(h.timestamp) + ' · ' + esc((h.platforms || []).join('/')) + '</p>' +
            '</div>' +
            '<button class="icon-btn-danger" data-hdel="' + esc(h.id) + '" title="删除">' + I.trash + '</button>' +
          '</div>';
        }).join('') +
      '</div></div>';
  }

  function errorHtml() {
    return '<div class="panel-card error-panel" style="margin-top:20px;">' +
      '<div style="display:flex;align-items:center;justify-content:center;gap:8px;color:#b45050;">' + I.alert +
      '<span style="font-size:13px;">' + esc(S.error) + '</span></div>' +
      '<button id="btn-retry" class="retry-btn">重试</button></div>';
  }

  /* ---------- 结果区 ---------- */
  function resultHtml() {
    /* 流式生成中：实时回显 */
    if (S.loading) {
      if (!S.streamText) return '';
      return '<div class="panel-card result-panel">' +
        '<div style="font-size:12px;color:#8a6a3a;margin-bottom:8px;">' + esc(S.loadLabel || '生成中') + ' · 实时回显</div>' +
        '<div id="stream-box" style="max-height:320px;overflow-y:auto;font-size:13px;line-height:1.8;color:#5a4d3f;white-space:pre-wrap;background:#fdf9f2;border:1px solid rgba(201,169,110,.2);border-radius:12px;padding:14px;">' + esc(S.streamText) + '</div>' +
      '</div>';
    }
    if (!S.content) return '';

    var audit = WJ.audit(S.content);
    var ed = effectiveDim();
    var riskHtml = '';
    if (audit.risks.length) {
      riskHtml = '<div style="margin-top:6px;font-size:12px;color:#c86464;">风险词 ' + audit.risks.length + ' 组：' +
        audit.risks.map(function (r) { return esc(r.word) + '×' + r.count; }).join('、') +
        '<span style="color:#9a8a78;">（发布前请人工确认合规）</span></div>';
    }

    /* [NEW-23] 免责 / 合规卡片 */
    var noticeCards = '';
    if (S.workMode === 'create' && ed.mystery) {
      noticeCards += '<div style="margin-top:12px;padding:10px 14px;background:#fdf6ec;border:1px solid #ecd9b8;border-radius:10px;font-size:12px;color:#8a6a3a;line-height:1.7;">' +
        I.alert + ' <b>传说维度提示：</b>' + esc(WJ.DISCLAIMER) + '</div>';
    }
    if (S.workMode === 'create' && ed.sensitive && WJ.COMPLIANCE[S.dimension]) {
      noticeCards += '<div style="margin-top:12px;padding:10px 14px;background:#fdeeee;border:1px solid #e8c8c8;border-radius:10px;font-size:12px;color:#a05050;line-height:1.7;">' +
        I.alert + ' <b>合规检查清单（' + esc(S.dimension) + '）：</b><br>' +
        WJ.COMPLIANCE[S.dimension].map(function (c) { return '· ' + esc(c); }).join('<br>') + '</div>';
    }

    /* [NEW-26] 配图提示词 */
    var imgPromptHtml = '';
    if (S.imgPromptsOpen) {
      var prompts = WJ.imagePrompts(S.content, ed.label || S.dimension || '主题');
      imgPromptHtml = '<div style="margin-top:10px;padding:12px 14px;background:#f4f1ea;border-radius:10px;">' +
        '<div style="font-size:12px;font-weight:700;color:#6a5d4d;margin-bottom:6px;">AI 配图提示词（粘贴到即梦 / Midjourney 即可出真实配图）</div>' +
        prompts.map(function (p) {
          return '<div style="font-size:12px;color:#6a5d4d;line-height:1.7;margin:4px 0;">' + esc(p) + '</div>';
        }).join('') +
        '<button id="btn-copy-imgprompts" class="action-btn" style="margin-top:6px;">' + I.copy + '复制全部提示词</button>' +
      '</div>';
    }

    return '<div class="panel-card result-panel">' +
      '<div class="result-header">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<h3 style="font-size:15px;font-weight:600;color:#3a3328;margin:0;">' + (S.workMode === 'rewrite' ? '改写结果' : '生成结果') + '</h3>' +
          '<span class="result-tag">' + esc(S.platform) + '</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          '<button id="btn-regen" class="action-btn">' + I.refresh + '换一篇</button>' +
          '<button id="btn-copy" class="action-btn ' + (S.copied ? 'success' : '') + '">' + (S.copied ? I.check + '已复制' : I.copy + '复制') + '</button>' +
          '<div style="position:relative;">' +
            '<button id="btn-download" class="action-btn">' + I.down + '下载 ' + I.chevron + '</button>' +
            (S.dropdown ? '<div class="dropdown-menu">' +
              '<button class="dropdown-item" data-dl="md">' + I.fileText + '下载 Markdown</button>' +
              '<button class="dropdown-item" data-dl="doc">' + I.fileText + '下载 Word</button>' +
            '</div>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +

      /* [NEW-22] 内容体检 */
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px;">' +
        '<span style="font-size:11px;color:#6a5d4d;background:#f4efe6;border-radius:999px;padding:4px 10px;">字数 ' + audit.chars + '</span>' +
        '<span style="font-size:11px;color:#6a5d4d;background:#f4efe6;border-radius:999px;padding:4px 10px;">约读 ' + audit.minutes + ' 分钟</span>' +
        '<span style="font-size:11px;color:#6a5d4d;background:#f4efe6;border-radius:999px;padding:4px 10px;">金句 ' + audit.golden + '</span>' +
        '<span style="font-size:11px;color:' + (audit.risks.length ? '#c86464' : '#5a9060') + ';background:' + (audit.risks.length ? '#fdeeee' : '#edf4ec') + ';border-radius:999px;padding:4px 10px;">风险词 ' + audit.risks.length + '</span>' +
      '</div>' +
      riskHtml +
      noticeCards +

      (S.titles.length > 0 ? '<div class="title-selector">' +
        '<div style="font-size:12px;color:#8a7a6a;margin-bottom:8px;">💡 选一个爆款标题：</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px;">' +
          S.titles.map(function (t) {
            return '<button class="title-option ' + (S.title === t ? 'active' : '') + '" data-title="' + esc(t) + '">' + esc(t) + '</button>';
          }).join('') +
        '</div></div>' : '') +

      '<textarea id="content" class="content-textarea">' + esc(S.content) + '</textarea>' +

      '<button id="btn-imgprompts" class="action-btn" style="margin-top:10px;">' + I.spark + ' 配图提示词 ' + I.chevron + '</button>' +
      imgPromptHtml +

      '<div class="publish-bar">' +
        '<span style="font-size:12px;color:#8a7a6a;">一键发布到：</span>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
          WJ.PLATFORMS.slice(0, 6).map(function (p) {
            var done = !!S.published[p.name];
            return '<button class="publish-pill ' + (done ? 'published' : '') + '" data-publish="' + esc(p.name) + '">' +
              (done ? I.check : I.send) + esc(p.name) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      (S.toast ? '<div class="publish-toast">' + I.check + esc(S.toast) + '</div>' : '') +
    '</div>';
  }

  function renderPanel() {
    var slot = $('result-slot');
    if (slot) slot.innerHTML = resultHtml();
    bindResult();
    /* 流式回显自动滚到底 */
    var sb = $('stream-box');
    if (sb) sb.scrollTop = sb.scrollHeight;
  }

  function refreshAll() {
    S.quota = WJ.quota.get();
    render();
  }

  /* ==================== 事件绑定 ==================== */
  function bindShell() {
    var bg = $('btn-generate');
    if (bg) bg.onclick = function () { doMain(); };

    var bh = $('btn-history');
    if (bh) bh.onclick = function () { S.historyOpen = !S.historyOpen; refreshAll(); };
    var bhc = $('btn-history-close');
    if (bhc) bhc.onclick = function () { S.historyOpen = false; refreshAll(); };
    var bcl = $('btn-history-clear');
    if (bcl) bcl.onclick = function () {
      if (confirm('确定清空全部生成历史？此操作不可恢复。')) {
        S.history = WJ.history.clear();
        refreshAll();
      }
    };

    /* [NEW-25] 历史导出/导入 */
    var bex = $('btn-history-export');
    if (bex) bex.onclick = function () { WJ.history.exportJson(); };
    var bim = $('btn-history-import');
    var fin = $('history-file');
    if (bim && fin) {
      bim.onclick = function () { fin.click(); };
      fin.onchange = function () {
        var file = fin.files && fin.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var merged = WJ.history.importJsonText(String(reader.result || ''));
          if (merged === null) {
            S.error = '导入失败：不是有效的历史备份文件';
          } else {
            S.history = merged;
            S.error = '';
          }
          refreshAll();
        };
        reader.readAsText(file, 'utf-8');
      };
    }

    var bs = $('btn-settings');
    if (bs) bs.onclick = openSettings;

    /* 工作/维度/主题/类型/CTA/平台 切换 */
    Array.prototype.forEach.call(document.querySelectorAll('[data-workmode]'), function (el) {
      el.onclick = function () {
        S.workMode = el.getAttribute('data-workmode');
        S.error = '';
        refreshAll();
      };
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-mode]'), function (el) {
      el.onclick = function () {
        S.mode = el.getAttribute('data-mode');
        S.dimension = '';
        refreshAll();
      };
    });

    var sel = $('sel-dimension');
    if (sel) sel.onchange = function () { S.dimension = sel.value; refreshAll(); };

    Array.prototype.forEach.call(document.querySelectorAll('[data-topicmode]'), function (el) {
      el.onclick = function () {
        S.topicMode = el.getAttribute('data-topicmode');
        refreshAll();
      };
    });

    var topicInput = $('input-topic');
    if (topicInput) topicInput.oninput = function () { S.customTopic = topicInput.value; };

    Array.prototype.forEach.call(document.querySelectorAll('[data-type]'), function (el) {
      el.onclick = function () {
        S.type = el.getAttribute('data-type');
        // 智能联动：切到该类型推荐的首选平台
        var t = WJ.typeByName(S.type);
        if (t.platforms && t.platforms.length) S.platform = t.platforms[0];
        refreshAll();
      };
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-cta]'), function (el) {
      el.onclick = function () {
        S.cta = el.getAttribute('data-cta');
        refreshAll();
      };
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-rewritemode]'), function (el) {
      el.onclick = function () {
        S.rewriteMode = el.getAttribute('data-rewritemode');
        refreshAll();
      };
    });

    var rw = $('input-rewrite');
    if (rw) rw.oninput = function () { S.rewriteText = rw.value; };

    Array.prototype.forEach.call(document.querySelectorAll('[data-platform]'), function (el) {
      el.onclick = function () { S.platform = el.getAttribute('data-platform'); refreshAll(); };
    });

    /* [NEW-20][NEW-21] */
    var bi = $('btn-ideas');
    if (bi) bi.onclick = doIdeas;
    var bsr = $('btn-series');
    if (bsr) bsr.onclick = doSeries;

    Array.prototype.forEach.call(document.querySelectorAll('[data-idea]'), function (el) {
      el.onclick = function () {
        var idea = S.ideas[Number(el.getAttribute('data-idea'))];
        if (!idea) return;
        S.customTopic = idea.title + '（' + idea.angle + '）';
        S.topicMode = 'blend';
        if (!S.dimension) {
          // 维度为空时按推荐类型/平台落位，主题独立成篇
          S.topicMode = 'custom';
        }
        S.type = WJ.CONTENT_TYPES.some(function (t) { return t.name === idea.type; }) ? idea.type : S.type;
        S.platform = WJ.PLATFORMS.some(function (p) { return p.name === idea.platform; }) ? idea.platform : S.platform;
        S.ideasOpen = false;
        refreshAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-series]'), function (el) {
      el.onclick = function () {
        var ep = S.series[Number(el.getAttribute('data-series'))];
        if (!ep) return;
        S.customTopic = ep.title;
        S.topicMode = S.dimension ? 'blend' : 'custom';
        S.seriesOpen = false;
        refreshAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-hid]'), function (el) {
      el.onclick = function (ev) {
        if (ev.target.closest('[data-hdel]')) return;
        loadHistory(el.getAttribute('data-hid'));
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-hdel]'), function (el) {
      el.onclick = function (ev) {
        ev.stopPropagation();
        S.history = WJ.history.remove(el.getAttribute('data-hdel'));
        refreshAll();
      };
    });

    var br = $('btn-retry');
    if (br) br.onclick = function () { S.error = ''; doMain(); };
  }

  function bindResult() {
    var br = $('btn-regen');
    if (br) br.onclick = function () { doMain(true); };

    var bc = $('btn-copy');
    if (bc) bc.onclick = function () {
      WJ.copyText(S.content).then(function () {
        S.copied = true;
        renderPanel();
        setTimeout(function () { S.copied = false; renderPanel(); }, 2000);
      }).catch(function () {
        S.toast = '复制失败，请手动选中文本复制';
        renderPanel();
      });
    };

    var bd = $('btn-download');
    if (bd) bd.onclick = function (e) { e.stopPropagation(); S.dropdown = !S.dropdown; renderPanel(); };

    Array.prototype.forEach.call(document.querySelectorAll('[data-dl]'), function (el) {
      el.onclick = function () {
        S.dropdown = false;
        var kind = el.getAttribute('data-dl');
        var ed = effectiveDim();
        if (kind === 'md') WJ.downloadMarkdown(S.content, ed.label || '内容');
        else WJ.downloadWord(S.content, ed.label || '内容', S.title);
        renderPanel();
      };
    });

    /* [NEW-26] 配图提示词 */
    var bip = $('btn-imgprompts');
    if (bip) bip.onclick = function () { S.imgPromptsOpen = !S.imgPromptsOpen; renderPanel(); };
    var bcip = $('btn-copy-imgprompts');
    if (bcip) bcip.onclick = function () {
      var prompts = WJ.imagePrompts(S.content, effectiveDim().label || S.dimension || '主题');
      WJ.copyText(prompts.join('\n')).then(function () {
        S.toast = '配图提示词已复制';
        renderPanel();
        setTimeout(function () { S.toast = ''; renderPanel(); }, 2000);
      });
    };

    Array.prototype.forEach.call(document.querySelectorAll('[data-title]'), function (el) {
      el.onclick = function () {
        var t = el.getAttribute('data-title');
        S.title = t;
        var lines = S.content.split('\n');
        if (lines[0] && lines[0].indexOf('【') === 0) lines[0] = '【' + t + '】';
        else lines.unshift('【' + t + '】');
        S.content = lines.join('\n');
        refreshAll();
      };
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-publish]'), function (el) {
      el.onclick = function () {
        openPreview(el.getAttribute('data-publish'));
      };
    });

    var ta = $('content');
    if (ta) ta.oninput = function () { S.content = ta.value; };

    // 点击空白关闭下载下拉
    document.onclick = function () {
      if (S.dropdown) { S.dropdown = false; renderPanel(); }
    };
  }

  function loadHistory(id) {
    var item = S.history.filter(function (h) { return h.id === id; })[0];
    if (!item) return;
    var isCiv = WJ.CIVILIZATIONS.indexOf(item.dimension) >= 0;
    var isInd = WJ.INDUSTRIES.indexOf(item.dimension) >= 0;
    S.workMode = 'create';
    S.mode = isCiv ? 'civilization' : 'industry';
    S.dimension = isCiv || isInd ? item.dimension : '';
    S.topicMode = (isCiv || isInd) ? 'dimension' : 'custom';
    S.customTopic = (isCiv || isInd) ? '' : item.dimension;
    S.type = (item.contentTypes || [])[0] || '深度长文';
    S.platform = (item.platforms || [])[0] || '公众号';
    S.content = item.content;
    S.historyOpen = false;
    var lines = S.content.split('\n');
    var m = (lines[0] || '').trim().match(/【(.+?)】/);
    var t = m ? m[1] : (item.dimension + '深度解读');
    S.title = t;
    S.titles = [t];
    S.error = '';
    refreshAll();
  }

  /* ==================== 生成主流程 ==================== */
  function maxTokensFor(type) {
    switch (type) {
      case '深度长文': return 16000;
      case '播客口播稿': return 16000;
      case '问答互动': return 10000;
      case '短视频脚本': return 8000;
      case '爆款文案': return 6000;
      case '朋友圈文案': return 4000;
      default: return 16000;
    }
  }

  function doMain(isRegen) {
    if (S.loading) return;
    S.error = '';
    if (S.workMode === 'rewrite') doRewrite();
    else doGenerate(!!isRegen);
  }

  function doGenerate(isRegen) {
    var ed = effectiveDim();
    if (!ed.promptDim) {
      S.error = S.topicMode === 'custom'
        ? '请先填写自定义主题'
        : '请先选择一个内容维度';
      refreshAll(); return;
    }
    if (!WJ.quota.allowed()) { S.error = '今日额度已用完，请明日继续'; refreshAll(); return; }

    S.loading = true;
    S.loadLabel = isRegen ? '换一篇生成中' : '生成中';
    S.content = '';
    S.streamText = '';
    S.titles = [];
    S.title = '';
    S.riskOpen = false;
    S.imgPromptsOpen = false;
    refreshAll();

    var dimension = ed.promptDim;
    var type = S.type;
    var platform = S.platform;
    var opts = { cta: S.cta, mystery: ed.mystery };
    var lastPaint = 0;

    function onDelta(full) {
      S.streamText = full;
      var now = Date.now();
      if (now - lastPaint > 400) {
        lastPaint = now;
        renderPanel();
      }
    }

    WJ.generateTitles(dimension, type).then(function (titles) {
      S.titles = titles && titles.length ? titles : [];
      var title = S.titles[0] || (ed.label + '深度解读');
      S.title = title;
      var prompt = isRegen
        ? WJ.buildRegenPrompt(dimension, type, platform, title, opts)
        : WJ.buildPrompt(dimension, type, platform, title, opts);
      var messages = [
        { role: 'system', content: WJ.SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ];
      var temp = isRegen ? 0.95 : 0.85;
      return WJ.generateContent(messages, temp, maxTokensFor(type), onDelta).then(function (r) {
        return { body: r.content, truncated: r.truncated };
      });
    }).then(function (out) {
      S.content = '【' + S.title + '】\n\n' + out.body;
      if (out.truncated) {
        S.toast = '提示：本次输出达到长度上限，内容可能被截断，可点击下方「换一篇」重试';
      }
      WJ.quota.consume();
      S.quota = WJ.quota.get();
      S.history = WJ.history.add({
        id: String(Date.now()),
        dimension: ed.label || dimension,
        contentTypes: [type],
        platforms: [platform],
        content: S.content,
        timestamp: new Date().toLocaleString('zh-CN'),
      });
      S.published = {};
      S.loading = false;
      S.streamText = '';
      refreshAll();
    }).catch(function (err) {
      S.error = err && err.message ? err.message : '内容生成失败，请检查网络后重试';
      S.loading = false;
      S.streamText = '';
      refreshAll();
    });
  }

  /* [NEW-17] 改写模式 */
  function doRewrite() {
    var text = (S.rewriteText || '').trim();
    if (text.length < 30) { S.error = '请先粘贴至少 30 字的原文案'; refreshAll(); return; }
    if (!WJ.quota.allowed()) { S.error = '今日额度已用完，请明日继续'; refreshAll(); return; }

    S.loading = true;
    S.loadLabel = '改写中';
    S.content = '';
    S.streamText = '';
    S.titles = [];
    S.title = '';
    refreshAll();

    var platform = S.platform;
    var ed = effectiveDim();
    var dimension = (S.topicMode !== 'custom' && S.dimension) ? S.dimension : '';
    var prompt = WJ.buildRewritePrompt(text, S.rewriteMode, platform, dimension);
    var messages = [
      { role: 'system', content: WJ.SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];
    var lastPaint = 0;

    function onDelta(full) {
      S.streamText = full;
      var now = Date.now();
      if (now - lastPaint > 400) {
        lastPaint = now;
        renderPanel();
      }
    }

    WJ.generateContent(messages, 0.8, 16000, onDelta).then(function (r) {
      S.content = r.content;
      if (r.truncated) {
        S.toast = '提示：本次输出达到长度上限，内容可能被截断，可重试';
      }
      WJ.quota.consume();
      S.quota = WJ.quota.get();
      S.history = WJ.history.add({
        id: String(Date.now()),
        dimension: '改写·' + S.rewriteMode + (dimension ? '·' + dimension : ''),
        contentTypes: ['改写'],
        platforms: [platform],
        content: S.content,
        timestamp: new Date().toLocaleString('zh-CN'),
      });
      S.published = {};
      S.loading = false;
      S.streamText = '';
      refreshAll();
    }).catch(function (err) {
      S.error = err && err.message ? err.message : '改写失败，请检查网络后重试';
      S.loading = false;
      S.streamText = '';
      refreshAll();
    });
  }

  /* [NEW-20] 选题灵感 */
  function doIdeas() {
    if (S.ideasLoading || S.loading) return;
    var ed = effectiveDim();
    if (!ed.promptDim) {
      S.error = S.topicMode === 'custom' ? '请先填写自定义主题' : '请先选择一个内容维度';
      refreshAll(); return;
    }
    S.error = '';
    S.ideasLoading = true;
    S.ideasOpen = true;
    refreshAll();

    var messages = [
      { role: 'system', content: WJ.SYSTEM_PROMPT },
      { role: 'user', content: WJ.buildIdeasPrompt(ed.promptDim) },
    ];
    WJ.callModel(messages, 0.9, 4000).then(function (r) {
      var ideas = [];
      String(r.content || '').split('\n').forEach(function (line) {
        var t = line.trim().replace(/^[-*\d.、]+\s*/, '');
        if (!t) return;
        var parts = t.split('|').map(function (p) { return p.trim(); });
        if (parts.length >= 4 && parts[0]) {
          ideas.push({ title: parts[0], angle: parts[1], type: parts[2], platform: parts[3] });
        }
      });
      if (!ideas.length) {
        S.error = '选题灵感解析失败（模型输出格式异常），请重试一次';
      } else {
        S.ideas = ideas.slice(0, 8);
        WJ.quota.consume();
        S.quota = WJ.quota.get();
      }
      S.ideasLoading = false;
      refreshAll();
    }).catch(function (err) {
      S.error = err && err.message ? err.message : '选题灵感生成失败，请重试';
      S.ideasLoading = false;
      refreshAll();
    });
  }

  /* [NEW-21] 系列大纲 */
  function doSeries() {
    if (S.seriesLoading || S.loading) return;
    var ed = effectiveDim();
    if (!ed.promptDim) {
      S.error = S.topicMode === 'custom' ? '请先填写自定义主题' : '请先选择一个内容维度';
      refreshAll(); return;
    }
    S.error = '';
    S.seriesLoading = true;
    S.seriesOpen = true;
    refreshAll();

    var messages = [
      { role: 'system', content: WJ.SYSTEM_PROMPT },
      { role: 'user', content: WJ.buildSeriesPrompt(ed.promptDim, 5) },
    ];
    WJ.callModel(messages, 0.85, 4000).then(function (r) {
      var eps = [];
      String(r.content || '').split('\n').forEach(function (line) {
        var t = line.trim().replace(/^[-*\d.、]+\s*/, '');
        if (!t) return;
        var parts = t.split('|').map(function (p) { return p.trim(); });
        if (parts.length >= 3 && parts[0]) {
          eps.push({ title: parts[0], points: parts[1], hook: parts[2] });
        }
      });
      if (!eps.length) {
        S.error = '系列大纲解析失败（模型输出格式异常），请重试一次';
      } else {
        S.series = eps.slice(0, 6);
        WJ.quota.consume();
        S.quota = WJ.quota.get();
      }
      S.seriesLoading = false;
      refreshAll();
    }).catch(function (err) {
      S.error = err && err.message ? err.message : '系列大纲生成失败，请重试';
      S.seriesLoading = false;
      refreshAll();
    });
  }

  /* ==================== 发布预览弹窗 ==================== */
  function openPreview(platform) {
    S.preview = {
      platform: platform,
      dimension: effectiveDim().label || S.dimension || '主题',
      type: S.type,
      content: S.content,
      step: 'preview',        // preview | confirm | published
      view: 'text',           // text | graphic
      images: null,
      busy: false,
    };
    renderPreview();
  }

  function buildPreviewImages(pv) {
    if (pv.images) return;
    try {
      var cover = WJ.makeCover(pv.title || S.title, pv.dimension);
      var caps = WJ.pickImageCaptions(pv.content);
      while (caps.length < 3) caps.push(pv.dimension || S.title || '');
      var inline = caps.map(function (c, i) { return WJ.makeInlineImage(c, pv.dimension, i); });
      pv.images = { cover: cover, inline: inline };
    } catch (e) {
      pv.images = null;
      pv.imgError = true;
    }
  }

  function previewHtml() {
    var pv = S.preview;
    var label = WJ.PLATFORM_LABEL[pv.platform] || pv.platform;
    var title = (String(pv.content).split('\n')[0] || '').replace(/[【】]/g, '');
    pv.title = title;
    var html = WJ.renderPlain(pv.content);

    if (pv.view === 'graphic') {
      buildPreviewImages(pv);
      if (pv.images) {
        html = WJ.renderPlatform(pv.content, pv.platform, pv.dimension, pv.type, pv.images.cover, pv.images.inline);
      }
    }

    var bodyHtml;
    if (pv.step === 'published') {
      bodyHtml = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:14px;">' +
        '<div style="width:72px;height:72px;border-radius:50%;background:rgba(90,144,96,0.1);display:flex;align-items:center;justify-content:center;color:#5a9060;">' + I.checkBig + '</div>' +
        '<h3 style="font-size:18px;color:#3a2e22;margin:0;">发布成功！</h3>' +
        '<p style="font-size:13px;color:#8a7a6a;margin:0;text-align:center;">内容已成功发布到' + esc(label) + '</p>' +
        '<p style="font-size:11px;color:#b0a090;margin:0;text-align:center;">（演示环境：未真实对接平台授权接口）</p>' +
      '</div>';
    } else {
      bodyHtml =
        '<div class="pp-toolbar"><div style="display:flex;gap:12px;align-items:center;">' +
          '<div class="pp-toggle">' +
            '<button class="' + (pv.view === 'text' ? 'on' : '') + '" data-view="text">文字版</button>' +
            '<button class="' + (pv.view === 'graphic' ? 'on' : '') + '" data-view="graphic">图文版</button>' +
          '</div>' +
          (pv.view === 'graphic' && !pv.images ? '<span style="font-size:11px;color:#c86464;">配图生成失败</span>' : '') +
        '</div>' +
        '<span style="font-size:11px;color:#a09080;">' + esc(label) + '</span>' +
        '</div>' +
        '<div class="pp-scroll"><div class="pp-render" style="' +
          (pv.view === 'graphic' && pv.platform === '小红书' ? 'background:#faf6f0;' : '') + '">' + html + '</div></div>';
    }

    var footer;
    if (pv.step === 'preview') {
      footer = '<div style="display:flex;align-items:center;justify-content:space-between;width:100%;">' +
        '<span style="font-size:11px;color:#a09080;">确认排版后进入发布确认</span>' +
        '<div style="display:flex;gap:8px;">' +
          '<button class="pp-btn-secondary" data-act="cancel">取消</button>' +
          '<button class="pp-btn-primary" data-act="confirm">确认排版，下一步</button>' +
        '</div></div>';
    } else if (pv.step === 'confirm') {
      footer = '<div style="width:100%;"><div class="pp-confirm-note">' + I.alert +
        '确认发布后将跳转至 ' + esc(label) + ' 进行授权（演示环境为模拟发布）</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;">' +
          '<button class="pp-btn-secondary" data-act="back">返回预览</button>' +
          '<button class="pp-btn-primary" data-act="publish"' + (pv.busy ? ' disabled' : '') + '>' +
            (pv.busy ? '发布中...' : '发布到 ' + esc(pv.platform)) + '</button>' +
        '</div></div>';
    } else {
      footer = '<div style="display:flex;align-items:center;justify-content:center;width:100%;">' +
        '<button class="pp-btn-primary" data-act="cancel">完成</button></div>';
    }

    return '<div class="pp-overlay" id="pp-overlay"><div class="pp-modal" id="pp-modal">' +
      '<div class="pp-header">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span class="pp-badge">' + esc(label) + '</span>' +
          '<span style="font-size:13px;color:#8a7a6a;">' + esc(pv.dimension) + '</span>' +
        '</div>' +
        '<button class="pp-close" data-act="cancel">' + I.close + '</button>' +
      '</div>' +
      '<div class="pp-steps">' +
        '<div class="pp-step ' + (pv.step === 'preview' ? 'active' : 'done') + '"><span class="pp-step-num">1</span><span>预览排版</span></div>' +
        '<div class="pp-step-line"></div>' +
        '<div class="pp-step ' + (pv.step === 'confirm' ? 'active' : (pv.step === 'published' ? 'done' : '')) + '"><span class="pp-step-num">2</span><span>确认发布</span></div>' +
        '<div class="pp-step-line"></div>' +
        '<div class="pp-step ' + (pv.step === 'published' ? 'active' : '') + '"><span class="pp-step-num">3</span><span>发布成功</span></div>' +
      '</div>' +
      '<div class="pp-body">' + bodyHtml + '</div>' +
      '<div class="pp-footer">' + footer + '</div>' +
    '</div></div>';
  }

  function renderPreview() {
    var host = $('preview-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'preview-host';
      document.body.appendChild(host);
    }
    host.innerHTML = previewHtml();
    bindPreview();
  }

  function closePreview() {
    var host = $('preview-host');
    if (host) host.innerHTML = '';
    S.preview = null;
  }

  function bindPreview() {
    var ov = $('pp-overlay');
    if (ov) ov.onclick = function (e) { if (e.target === ov) closePreview(); };

    Array.prototype.forEach.call(document.querySelectorAll('[data-view]'), function (el) {
      el.onclick = function () {
        S.preview.view = el.getAttribute('data-view');
        renderPreview();
      };
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-act]'), function (el) {
      el.onclick = function () {
        var act = el.getAttribute('data-act');
        var pv = S.preview;
        if (act === 'cancel' || act === 'back') {
          if (act === 'cancel' && pv.step === 'published') {
            S.published[pv.platform] = true;
            S.toast = '已发布到 ' + pv.platform;
            closePreview();
            refreshAll();
            setTimeout(function () { S.toast = ''; renderPanel(); }, 3000);
          } else if (act === 'back') {
            pv.step = 'preview';
            renderPreview();
          } else {
            closePreview();
          }
        } else if (act === 'confirm') {
          if (pv.view === 'text') {
            // 切到图文版时先生成配图，避免用户直接看到空白
            pv.view = 'graphic';
            buildPreviewImages(pv);
          }
          pv.step = 'confirm';
          renderPreview();
        } else if (act === 'publish') {
          pv.busy = true;
          renderPreview();
          setTimeout(function () {
            pv.busy = false;
            pv.step = 'published';
            renderPreview();
          }, 900);
        }
      };
    });

    document.onkeydown = function (e) {
      if (e.key === 'Escape') closePreview();
    };
  }

  /* ==================== 设置弹窗 ==================== */
  function openSettings() {
    var cfg = WJ.getConfig();
    var host = $('settings-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'settings-host';
      document.body.appendChild(host);
    }
    host.innerHTML = '<div class="pp-overlay" id="st-overlay"><div class="pp-modal" style="max-width:520px;">' +
      '<div class="pp-header">' +
        '<div style="display:flex;align-items:center;gap:10px;"><span class="pp-badge">接口设置</span>' +
        '<span style="font-size:12px;color:#8a7a6a;">模型 / 密钥 / 接口地址</span></div>' +
        '<button class="pp-close" id="st-close">' + I.close + '</button>' +
      '</div>' +
      '<div class="pp-body" style="padding:18px 20px;">' +
        '<label style="display:block;font-size:12px;color:#7a6a5a;margin-bottom:6px;">接口地址</label>' +
        '<input id="st-url" class="select-styled" style="width:100%;box-sizing:border-box;margin-bottom:14px;" value="' + esc(cfg.baseUrl) + '">' +
        '<label style="display:block;font-size:12px;color:#7a6a5a;margin-bottom:6px;">模型名称</label>' +
        '<input id="st-model" class="select-styled" style="width:100%;box-sizing:border-box;margin-bottom:14px;" value="' + esc(cfg.model) + '">' +
        '<label style="display:block;font-size:12px;color:#7a6a5a;margin-bottom:6px;">API Key</label>' +
        '<input id="st-key" class="select-styled" style="width:100%;box-sizing:border-box;margin-bottom:10px;" value="' + esc(cfg.apiKey) + '">' +
        '<div style="display:flex;gap:6px;align-items:flex-start;background:#c9a96e1a;padding:10px 12px;border-radius:8px;">' +
          '<span style="flex-shrink:0;margin-top:1px;color:#a08050;">' + I.alert + '</span>' +
          '<span style="font-size:11px;color:#8a6a3a;line-height:1.6;">本页面为纯前端应用，密钥保存在本机浏览器 localStorage 中，不会上传到任何第三方服务器；但同一浏览器内的其它脚本理论上可读取。生产部署建议改为后端代理调用。</span>' +
        '</div>' +
      '</div>' +
      '<div class="pp-footer" style="justify-content:space-between;">' +
        '<button class="pp-btn-secondary" id="st-reset">恢复默认</button>' +
        '<div style="display:flex;gap:8px;"><button class="pp-btn-primary" id="st-save">保存</button></div>' +
      '</div>' +
    '</div></div>';

    $('st-close').onclick = function () { $('settings-host').innerHTML = ''; };
    $('st-overlay').onclick = function (e) { if (e.target === $('st-overlay')) $('settings-host').innerHTML = ''; };
    $('st-reset').onclick = function () {
      WJ.resetConfig();
      var c = WJ.getConfig();
      $('st-url').value = c.baseUrl; $('st-model').value = c.model; $('st-key').value = c.apiKey;
    };
    $('st-save').onclick = function () {
      WJ.saveConfig({
        baseUrl: $('st-url').value.trim(),
        model: $('st-model').value.trim(),
        apiKey: $('st-key').value.trim(),
      });
      $('settings-host').innerHTML = '';
      S.toast = '接口设置已保存';
      renderPanel();
      setTimeout(function () { S.toast = ''; renderPanel(); }, 2500);
    };
  }

  /* ==================== 启动 ==================== */
  function boot() {
    S.history = WJ.history.load();
    S.quota = WJ.quota.get();
    render();
    // 暴露内部状态，便于自动化排查（只读调试用）
    window.__WJ_STATE = S;
  }

  WJ.boot = boot;
})(window.WJ = window.WJ || {});
