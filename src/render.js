/* 光体·文无界 — 平台排版渲染
 *
 * 相对原站修复：
 *  [BUG-8] 补齐 4 套缺失平台模板（抖音/快手/视频号/B站）
 *  [BUG-9] innerHTML XSS 转义
 *
 * 本次新增：
 *  [NEW-15] parseContent：从正文中解析平台招牌字段（摘要/问题/简介/分P/话题词/事实来源），
 *           公众号渲染摘要框、知乎渲染问题体、B站渲染简介+分P、各平台渲染真实话题词
 *  [NEW-16] 事实来源渲染为独立引用框
 */
(function (WJ) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* 处理 **加粗**，输入必须是已转义的文本 */
  function bold(s) {
    return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  function stripMarks(s) {
    return s.replace(/[【】]/g, '');
  }

  function isDivider(s) {
    return /^[━═─-]+$/.test(s);
  }

  function img(src, height) {
    return '<img src="' + src + '" style="width:100%;height:' + height +
      'px;object-fit:cover;border-radius:8px;display:block;margin:12px 0;" alt="" ' +
      "onerror=\"this.style.display='none'\" />";
  }

  /* 品牌 logo <img>（统一头像） */
  function logoImg(size, extra) {
    return '<img src="' + (WJ.LOGO_SRC || '') + '" style="width:' + size + 'px;height:' + size +
      'px;object-fit:contain;display:block;flex:none;' + (extra || '') + '" alt="光体•文无界" />';
  }

  /* ---------- [NEW-15] 内容解析 ----------
   * 把模型输出拆成：标题 / 摘要 / 问题 / 简介 / 分P / 话题词 / 事实来源 / 正文段落
   */
  WJ.parseContent = function (content) {
    var lines = String(content || '').split('\n');
    var out = {
      title: '',
      summary: '',      // 【摘要】
      question: '',     // 【问题】
      intro: '',        // 【简介】
      episodes: [],     // 【分P标题】
      tags: [],         // 【话题词】
      sources: [],      // 【事实来源与延伸阅读】下的条目
      paras: [],        // 其余正文
    };

    var section = '';          // 'summary' | 'question' | 'intro' | 'episodes' | 'tags' | 'sources' | ''
    var firstMeaningful = true;

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i].trim();
      if (!raw) { section = ''; continue; }  // 空行结束当前区块，回到正文
      if (isDivider(raw)) { if (section) continue; out.paras.push(raw); continue; }

      // 第一行（无论是否带【】）都是标题
      if (firstMeaningful) {
        out.title = raw.replace(/[【】]/g, '').trim();
        firstMeaningful = false;
        continue;
      }

      if (raw.indexOf('【') === 0) {
        // 【区块名】或【区块名】内容 —— 前缀匹配区块名
        var nm = raw.match(/^【([^】]{1,14})】/);
        var secName = nm ? nm[1] : '';
        var known = {
          '摘要': 'summary', '问题': 'question', '简介': 'intro',
          '分P标题': 'episodes', '分P': 'episodes',
          '话题词': 'tags', '话题标签': 'tags',
          '事实来源与延伸阅读': 'sources', '事实来源': 'sources',
        };
        if (known[secName]) {
          section = known[secName];
          firstMeaningful = false;
          // 【区块名】后同行还有内容 → 立即按该区块处理
          var rest = raw.slice(nm[0].length).trim();
          if (rest) {
            switch (section) {
              case 'summary': out.summary = out.summary ? out.summary + rest : rest; break;
              case 'question': out.question += rest; break;
              case 'intro': out.intro = out.intro ? out.intro + rest : rest; break;
              case 'episodes': rest = rest.replace(/^[-*\d.、]+\s*/, ''); if (rest) out.episodes.push(rest); break;
              case 'tags': out.tags = out.tags.concat(rest.split(/[\s#]+/).filter(function (t) { return t && t.length >= 2; })); break;
              case 'sources': rest = rest.replace(/^[-*\d.、]+\s*/, ''); if (rest) out.sources.push(rest); break;
            }
          }
          continue;
        }
        // 其它小标题：回到正文
        section = '';
        out.paras.push(raw);
        continue;
      }

      switch (section) {
        case 'summary':
          out.summary += (out.summary ? '' : '') + raw;
          break;
        case 'question':
          out.question += raw;
          break;
        case 'intro':
          out.intro += (out.intro ? '' : '') + raw;
          break;
        case 'episodes':
          if (/^[-*\d.、]+\s*/.test(raw)) raw = raw.replace(/^[-*\d.、]+\s*/, '');
          if (raw) out.episodes.push(raw);
          break;
        case 'tags':
          if (raw) out.tags = out.tags.concat(raw.split(/[\s#]+/).filter(function (t) { return t && t.length >= 2; }));
          break;
        case 'sources':
          if (/^[-*\d.、]+\s*/.test(raw)) raw = raw.replace(/^[-*\d.、]+\s*/, '');
          if (raw) out.sources.push(raw);
          break;
        default:
          out.paras.push(raw);
      }
    }
    if (out.tags.length > 12) out.tags = out.tags.slice(0, 12);
    return out;
  };

  /* 摘要框（公众号） */
  function summaryBox(text) {
    if (!text) return '';
    return '<div style="margin:0 0 14px;padding:10px 14px;background:#faf7f2;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;font-size:13px;color:#6a5d4d;line-height:1.7;">' +
      '<span style="font-weight:700;color:#8a6a3a;">摘要 · </span>' + esc(text) + '</div>';
  }

  /* 问题体头部（知乎） */
  function questionBox(text) {
    if (!text) return '';
    return '<div style="margin:0 0 12px;padding:10px 14px;background:#f6f7fb;border-left:3px solid #4a6fa5;border-radius:0 8px 8px 0;">' +
      '<span style="font-size:12px;color:#8590a6;">问题</span>' +
      '<div style="font-size:16px;font-weight:700;color:#1a1a1a;line-height:1.5;margin-top:2px;">' + esc(text) + '</div></div>';
  }

  /* 话题词行 */
  function tagsRow(tags, color) {
    if (!tags || !tags.length) return '';
    return '<div style="margin-top:10px;font-size:12px;font-weight:600;line-height:1.8;">' +
      tags.map(function (t) { return '<span style="color:' + (color || '#c9a96e') + '">#' + esc(t) + '</span>'; }).join(' ') +
      '</div>';
  }

  /* 事实来源引用框 */
  function sourcesBox(sources) {
    if (!sources || !sources.length) return '';
    var h = '<div style="margin-top:20px;padding:12px 14px;background:#f8f5ef;border:1px dashed #d4c8b0;border-radius:8px;">';
    h += '<div style="font-size:12px;font-weight:700;color:#8a6a3a;margin-bottom:6px;">📚 事实来源与延伸阅读</div>';
    for (var i = 0; i < sources.length; i++) {
      h += '<div style="font-size:12px;color:#6a5d4d;line-height:1.7;margin:3px 0;">· ' + esc(sources[i]) + '</div>';
    }
    h += '</div>';
    return h;
  }

  /**
   * 通用正文流：按顺序产出 h2 / p，并每隔 every 段插入一张配图
   */
  function body(paras, inline, every, headingStyle, paraStyle, onPara) {
    var html = '';
    var shown = 0;   // 已输出的正文段数
    var imgIdx = 0;
    for (var i = 0; i < paras.length; i++) {
      var raw = paras[i].trim();
      if (!raw) continue;
      if (isDivider(raw)) { html += '<hr style="border:none;border-top:1px solid #ddd;margin:12px 0;">'; continue; }
      if (raw.indexOf('【') === 0 && raw.lastIndexOf('】') === raw.length - 1) {
        html += '<h' + (headingStyle.tag || 2) + ' style="' + headingStyle.css + '">' + esc(stripMarks(raw)) + '</h' + (headingStyle.tag || 2) + '>';
        continue;
      }
      // 模型常把小标题写成 markdown 的 ### 形式，这里一并识别，避免退化成普通段落
      var md = raw.match(/^(#{1,4})\s+(.+)$/);
      if (md) {
        html += '<h' + (headingStyle.tag || 2) + ' style="' + headingStyle.css + '">' + esc(stripMarks(md[2])) + '</h' + (headingStyle.tag || 2) + '>';
        continue;
      }
      var bodyHtml = bold(esc(raw));
      if (onPara) bodyHtml = onPara(bodyHtml);
      html += '<p style="' + paraStyle + '">' + bodyHtml + '</p>';
      shown++;
      if (every && shown % every === 0 && imgIdx < inline.length) {
        html += img(inline[imgIdx], 160);
        imgIdx++;
      }
    }
    return html;
  }

  var TEMPLATES = {};

  TEMPLATES['公众号'] = function (ctx) {
    var h = '<div style="max-width:677px;margin:0 auto;background:#fff;padding:24px 20px;">';
    h += img(ctx.cover, 240);
    h += '<h1 style="font-size:22px;color:#2e2418;font-weight:700;margin:4px 0 8px;line-height:1.4;letter-spacing:.3px;">' + esc(ctx.title) + '</h1>';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">' + logoImg(18) +
      '<span style="font-size:12px;color:#a08858;font-weight:600;">光体•文无界</span>' +
      '<span style="font-size:12px;color:#bbb;">· ' + esc(ctx.date) + '</span></div>';
    h += summaryBox(ctx.parsed.summary);
    h += body(ctx.parsed.paras, ctx.inline, 3,
      { tag: 2, css: 'font-size:17px;color:#2e2418;font-weight:700;margin:22px 0 10px;padding-left:10px;border-left:3px solid #c9a96e;line-height:1.4;' },
      'font-size:15px;color:#333;line-height:1.85;margin:0 0 14px;text-align:justify;letter-spacing:.3px;');
    h += sourcesBox(ctx.parsed.sources);
    h += '<div style="margin-top:24px;padding-top:14px;border-top:1px solid #eee;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;color:#999;">' +
      logoImg(16, 'border-radius:50%;') + '光体•文无界 · 探索无限</div>';
    return h + '</div>';
  };

  TEMPLATES['小红书'] = function (ctx) {
    var h = '<div style="background:linear-gradient(135deg,#faf6f0,#f5efe6);border-radius:12px;padding:16px;">';
    h += img(ctx.cover, 180);
    h += '<h1 style="font-size:18px;color:#4a3a2a;font-weight:700;margin:0 0 12px;line-height:1.5;letter-spacing:.3px;">' + esc(ctx.title) + '</h1>';
    h += body(ctx.parsed.paras, ctx.inline, 2,
      { tag: 3, css: 'font-size:15px;color:#c9a96e;font-weight:700;margin:12px 0 6px;' },
      'font-size:14px;color:#5a4d3f;line-height:1.85;margin:0 0 10px;letter-spacing:.3px;');
    h += tagsRow(ctx.parsed.tags.length ? ctx.parsed.tags : [ctx.dimension, ctx.type, '光体文无界'], '#c9a96e');
    h += '<div style="margin-top:10px;padding-top:8px;border-top:1px dashed #d4c8b8;font-size:11px;color:#a09080;text-align:center;">✨ 收藏关注</div>';
    return h + '</div>';
  };

  TEMPLATES['知乎'] = function (ctx) {
    var h = '<div style="padding:16px;">';
    h += img(ctx.cover, 200);
    h += questionBox(ctx.parsed.question);
    h += '<h1 style="font-size:22px;color:#121212;font-weight:700;margin:0 0 10px;">' + esc(ctx.title) + '</h1>';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #f0f0f0;">' +
      logoImg(24, 'border-radius:50%;') +
      '<span style="font-size:12px;color:#8590a6;">光体•文无界</span></div>';
    h += body(ctx.parsed.paras, ctx.inline, 3,
      { tag: 3, css: 'font-size:16px;color:#121212;font-weight:700;margin:14px 0 8px;padding-left:8px;border-left:3px solid #c9a96e;' },
      'font-size:15px;color:#444;line-height:1.8;margin:0 0 10px;text-align:justify;');
    h += sourcesBox(ctx.parsed.sources);
    h += '<div style="margin-top:14px;padding:10px;background:#faf8f5;border-radius:6px;font-size:12px;color:#8590a6;text-align:center;">☕ 阅读愉快</div>';
    return h + '</div>';
  };

  TEMPLATES['朋友圈'] = function (ctx) {
    var h = '<div style="padding:14px;">';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
      logoImg(36) +
      '<div><div style="font-size:13px;color:#576b95;font-weight:500;">光体•文无界</div>' +
      '<div style="font-size:10px;color:#b2b2b2;">刚刚</div></div></div>';
    h += '<p style="font-size:15px;color:#333;margin:0 0 10px;font-weight:500;">' + esc(ctx.title) + '</p>';
    h += '<div style="background:#f7f7f7;border-radius:6px;overflow:hidden;border:1px solid #eee;margin-bottom:10px;">' +
      img(ctx.cover, 140) +
      '<div style="padding:8px 10px;font-size:11px;color:#888;">光体•文无界 · ' + esc(ctx.type) + '</div></div>';
    var n = 0;
    for (var i = 0; i < ctx.parsed.paras.length; i++) {
      var raw = ctx.parsed.paras[i].trim();
      if (!raw || isDivider(raw)) continue;
      h += '<p style="font-size:14px;color:#333;line-height:1.6;margin:0 0 6px;">' +
        stripMarks(bold(esc(raw))) + '</p>';
      n++;
      if (n >= 5) {
        h += '<div style="color:#576b95;font-size:13px;margin:6px 0;">展开全文</div>';
        break;
      }
    }
    h += tagsRow(ctx.parsed.tags, '#576b95');
    h += '<div style="margin-top:8px;font-size:11px;color:#b2b2b2;">👍 💬</div>';
    return h + '</div>';
  };

  TEMPLATES['知识星球'] = function (ctx) {
    var h = '<div style="padding:16px;">';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">' +
      '<span style="background:#c9a96e;color:#fff;font-size:10px;padding:2px 8px;border-radius:3px;font-weight:600;">精选</span>' +
      '<span style="font-size:12px;color:#8a8a8a;">' + esc(ctx.title) + '</span></div>';
    h += img(ctx.cover, 160);
    h += body(ctx.parsed.paras, ctx.inline, 3,
      { tag: 3, css: 'font-size:15px;color:#3a2e22;font-weight:700;margin:14px 0 6px;' },
      'font-size:14px;color:#444;line-height:1.7;margin:0 0 8px;text-align:justify;');
    h += sourcesBox(ctx.parsed.sources);
    h += '<div style="margin-top:12px;text-align:center;font-size:11px;color:#aaa;">💎 星球专享</div>';
    return h + '</div>';
  };

  /* ---- 以下 4 套为原站缺失、本次补齐 ---- */

  function shortVideoShell(ctx, accent, bgTop, bgBottom) {
    var h = '<div style="max-width:420px;margin:0 auto;background:linear-gradient(180deg,' + bgTop + ',' + bgBottom + ');border-radius:14px;overflow:hidden;color:#fff;">';
    h += '<div style="position:relative;">';
    h += '<img src="' + ctx.cover + '" style="width:100%;height:420px;object-fit:cover;display:block;" alt="" onerror="this.style.display=\'none\'" />';
    h += '<div style="position:absolute;right:10px;bottom:16px;display:flex;flex-direction:column;gap:14px;align-items:center;font-size:11px;text-shadow:0 1px 3px rgba(0,0,0,.5);">';
    h += '<div>❤️ 1.2w</div><div>💬 386</div><div>⭐ 892</div><div>↗ 分享</div>';
    h += '</div></div>';
    h += '<div style="padding:12px 14px 16px;">';
    h += '<div style="font-size:13px;font-weight:700;line-height:1.5;margin-bottom:6px;">' + esc(ctx.title) + '</div>';
    var n = 0;
    for (var i = 0; i < ctx.parsed.paras.length && n < 4; i++) {
      var raw = ctx.parsed.paras[i].trim();
      if (!raw || isDivider(raw)) continue;
      h += '<div style="font-size:12px;line-height:1.7;opacity:.92;margin:0 0 4px;">' +
        stripMarks(bold(esc(raw))) + '</div>';
      n++;
    }
    h += tagsRow(ctx.parsed.tags.length ? ctx.parsed.tags : [ctx.dimension, ctx.type, '光体文无界'], accent);
    h += '<div style="margin-top:10px;display:flex;align-items:center;gap:6px;font-size:11px;opacity:.75;">' +
      logoImg(20, 'border-radius:50%;') + '光体•文无界</div>';
    h += '</div></div>';
    return h;
  }

  TEMPLATES['抖音'] = function (ctx) {
    return shortVideoShell(ctx, '#fe2c55', '#161823', '#2c2c3a');
  };

  TEMPLATES['快手'] = function (ctx) {
    return shortVideoShell(ctx, '#ff6600', '#241a12', '#3a2a1c');
  };

  TEMPLATES['视频号'] = function (ctx) {
    var h = '<div style="max-width:420px;margin:0 auto;background:#ededed;border-radius:12px;overflow:hidden;">';
    h += '<img src="' + ctx.cover + '" style="width:100%;height:380px;object-fit:cover;display:block;" alt="" onerror="this.style.display=\'none\'" />';
    h += '<div style="background:#fff;padding:12px 14px;">';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">' +
      logoImg(24, 'border-radius:50%;') +
      '<span style="font-size:12px;color:#576b95;font-weight:600;">光体•文无界</span>' +
      '<span style="margin-left:auto;font-size:11px;color:#fff;background:#07c160;padding:2px 8px;border-radius:3px;">关注</span></div>';
    h += '<div style="font-size:14px;font-weight:700;color:#191919;line-height:1.5;margin-bottom:6px;">' + esc(ctx.title) + '</div>';
    var n = 0;
    for (var i = 0; i < ctx.parsed.paras.length && n < 5; i++) {
      var raw = ctx.parsed.paras[i].trim();
      if (!raw || isDivider(raw)) continue;
      h += '<p style="font-size:13px;color:#333;line-height:1.7;margin:0 0 5px;">' + stripMarks(bold(esc(raw))) + '</p>';
      n++;
    }
    h += tagsRow(ctx.parsed.tags, '#576b95');
    h += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #f0f0f0;display:flex;gap:18px;font-size:11px;color:#8a8a8a;">' +
      '<span>♡ 赞</span><span>💬 评论</span><span>↗ 转发</span><span>⭐ 收藏</span></div>';
    h += '</div></div>';
    return h;
  };

  TEMPLATES['B站'] = function (ctx) {
    var h = '<div style="max-width:640px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e3e5e7;">';
    h += '<img src="' + ctx.cover + '" style="width:100%;height:300px;object-fit:cover;display:block;" alt="" onerror="this.style.display=\'none\'" />';
    h += '<div style="padding:14px 16px;">';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">' +
      '<span style="background:#fb7299;color:#fff;font-size:10px;padding:2px 6px;border-radius:3px;">' + esc(ctx.dimension) + '</span>' +
      '<span style="font-size:11px;color:#9499a0;">' + esc(ctx.type) + '</span></div>';
    h += '<h1 style="font-size:17px;color:#18191c;font-weight:700;line-height:1.5;margin:0 0 10px;">' + esc(ctx.title) + '</h1>';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">' +
      logoImg(26, 'border-radius:50%;') +
      '<span style="font-size:12px;color:#fb7299;font-weight:600;">光体•文无界</span>' +
      '<span style="font-size:11px;color:#9499a0;">· UP主</span></div>';
    if (ctx.parsed.intro) {
      h += '<div style="background:#f6f7f8;border-radius:6px;padding:10px 12px;margin-bottom:10px;">' +
        '<div style="font-size:11px;color:#9499a0;margin-bottom:4px;">简介</div>' +
        '<div style="font-size:13px;color:#61666d;line-height:1.7;">' + esc(ctx.parsed.intro) + '</div></div>';
    }
    if (ctx.parsed.episodes.length) {
      h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">';
      for (var e = 0; e < ctx.parsed.episodes.length; e++) {
        h += '<span style="background:#fff0f4;color:#fb7299;border:1px solid #ffd9e4;font-size:11px;padding:3px 8px;border-radius:999px;">P' + (e + 1) + ' ' + esc(ctx.parsed.episodes[e]) + '</span>';
      }
      h += '</div>';
    }
    h += '<div style="background:#f6f7f8;border-radius:6px;padding:10px 12px;">';
    var n = 0;
    for (var i = 0; i < ctx.parsed.paras.length && n < 6; i++) {
      var raw = ctx.parsed.paras[i].trim();
      if (!raw || isDivider(raw)) continue;
      h += '<p style="font-size:13px;color:#61666d;line-height:1.7;margin:0 0 5px;">' + stripMarks(bold(esc(raw))) + '</p>';
      n++;
    }
    h += '</div>';
    h += tagsRow(ctx.parsed.tags.length ? ctx.parsed.tags : ['光体文无界', ctx.dimension], '#fb7299');
    h += '</div></div>';
    return h;
  };

  /* 通用兜底：任何未覆盖的平台都不会再错渲染成知识星球 */
  function generic(ctx) {
    var h = '<div style="padding:16px;">';
    h += img(ctx.cover, 200);
    h += '<h1 style="font-size:20px;color:#3a2e22;font-weight:700;margin:0 0 10px;">' + esc(ctx.title) + '</h1>';
    h += body(ctx.parsed.paras, ctx.inline, 3,
      { tag: 3, css: 'font-size:15px;color:#3a2e22;font-weight:700;margin:14px 0 6px;' },
      'font-size:14px;color:#444;line-height:1.8;margin:0 0 8px;text-align:justify;');
    h += tagsRow(ctx.parsed.tags);
    h += sourcesBox(ctx.parsed.sources);
    return h + '</div>';
  }

  /** 渲染成平台化的 HTML（自动解析招牌字段） */
  WJ.renderPlatform = function (content, platform, dimension, type, cover, inline) {
    var parsed = WJ.parseContent(content);
    var ctx = {
      title: parsed.title,
      parsed: parsed,
      cover: cover,
      inline: inline || [],
      dimension: dimension || '',
      type: type || '',
      date: new Date().toLocaleDateString('zh-CN'),
    };
    var fn = TEMPLATES[platform] || generic;
    try {
      return fn(ctx);
    } catch (e) {
      return '<p style="color:#b45050;">排版渲染失败：' + esc(e.message) + '</p>';
    }
  };

  /* 纯文字版渲染（无配图） */
  WJ.renderPlain = function (content) {
    return String(content || '').split('\n').map(function (line) {
      var t = line.trim();
      if (!t) return '<br>';
      if (isDivider(t)) return '<hr style="border:none;border-top:1px solid #ddd;margin:14px 0;">';
      if (t.indexOf('【摘要】') === 0) {
        return '<div style="margin:12px 0;padding:10px 14px;background:#faf7f2;border-left:3px solid #c9a96e;border-radius:0 8px 8px 0;font-size:13px;color:#6a5d4d;line-height:1.7;"><b style="color:#8a6a3a;">摘要 · </b>' +
          esc(stripMarks(t).replace(/^摘要/, '').trim()) + '</div>';
      }
      if (t.indexOf('【问题】') === 0) {
        return '<div style="margin:12px 0;padding:10px 14px;background:#f6f7fb;border-left:3px solid #4a6fa5;border-radius:0 8px 8px 0;"><span style="font-size:12px;color:#8590a6;">问题</span><div style="font-size:15px;font-weight:700;color:#1a1a1a;">' +
          esc(stripMarks(t).replace(/^问题/, '').trim()) + '</div></div>';
      }
      if (t.indexOf('【话题词】') === 0 || t.indexOf('【话题标签】') === 0) {
        return '<div style="margin:12px 0;font-size:12px;font-weight:600;color:#c9a96e;">' +
          esc(stripMarks(t).replace(/^话题词|^话题标签/, '').trim().split(/[\s#]+/).filter(Boolean).map(function (x) { return '#' + x; }).join(' ')) + '</div>';
      }
      if (t.indexOf('【事实来源') === 0) {
        return '<div style="margin:16px 0 6px;font-size:13px;font-weight:700;color:#8a6a3a;">📚 事实来源与延伸阅读</div>';
      }
      if (t.indexOf('【') === 0 && t.lastIndexOf('】') === t.length - 1) {
        return '<h2 style="font-size:1.2em;font-weight:700;color:#2e2418;margin:20px 0 10px;padding-left:10px;border-left:3px solid #c9a96e;line-height:1.4;">' + esc(stripMarks(t)) + '</h2>';
      }
      var md = t.match(/^(#{1,4})\s+(.+)$/);
      if (md) {
        return '<h2 style="font-size:1.2em;font-weight:700;color:#2e2418;margin:20px 0 10px;padding-left:10px;border-left:3px solid #c9a96e;line-height:1.4;">' + esc(stripMarks(md[2])) + '</h2>';
      }
      // 独立成行的短句（金句）居中展示，更有呼吸感
      if (t.length <= 24 && /[。！？…]$/.test(t) && t.indexOf('**') >= 0) {
        return '<p style="margin:16px 0;text-align:center;color:#8a6a3a;font-weight:600;letter-spacing:.5px;">' +
          bold(esc(t)).replace(/\*\*/g, '') + '</p>';
      }
      return '<p style="margin:8px 0;text-align:justify;line-height:1.85;letter-spacing:.3px;">' +
        bold(esc(t)).replace(/<strong>/g, '<strong style="color:#4a3a2a;">') + '</p>';
    }).join('\n');
  };
})(window.WJ = window.WJ || {});
