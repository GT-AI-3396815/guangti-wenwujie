/* 光体·文无界 — 工具层（额度 / 历史 / 导出 / 内容体检）
 *
 * 相对原站修复：
 *  [BUG-10] 历史持久化
 *  [BUG-11] 额度初始化读本地真实值
 *
 * 本次新增：
 *  [NEW-12] 内容体检：字数/阅读时长/金句数/风险词检测
 *  [NEW-13] 历史导出/导入 JSON（跨设备备份）
 *  [NEW-14] 配图提示词生成（供即梦/Midjourney 出真实配图）
 */
(function (WJ) {
  'use strict';

  /* ---------------- 额度 ---------------- */
  var QUOTA_KEY = 'wenwujie_quota';
  var DAILY_LIMIT = 100;

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  WJ.quota = {
    demo: true,   // [NEW-13] 纯前端计数，界面需标注"演示额度"
    limit: DAILY_LIMIT,
    get: function () {
      try {
        var raw = localStorage.getItem(QUOTA_KEY);
        if (!raw) return { used: 0, remaining: DAILY_LIMIT, limit: DAILY_LIMIT };
        var o = JSON.parse(raw);
        if (o.date !== today()) return { used: 0, remaining: DAILY_LIMIT, limit: DAILY_LIMIT };
        var used = o.count || 0;
        return { used: used, remaining: Math.max(0, DAILY_LIMIT - used), limit: DAILY_LIMIT };
      } catch (e) {
        return { used: 0, remaining: DAILY_LIMIT, limit: DAILY_LIMIT };
      }
    },
    consume: function () {
      var q = WJ.quota.get();
      var used = q.used + 1;
      try {
        localStorage.setItem(QUOTA_KEY, JSON.stringify({ date: today(), count: used }));
      } catch (e) { /* 隐私模式下写入失败不影响使用 */ }
      return { used: used, remaining: Math.max(0, DAILY_LIMIT - used), limit: DAILY_LIMIT };
    },
    allowed: function () {
      return WJ.quota.get().remaining > 0;
    },
  };

  /* ---------------- 历史记录 ---------------- */
  var HISTORY_KEY = 'wenwujie_history';
  var HISTORY_MAX = 50;

  WJ.history = {
    load: function () {
      try {
        var raw = localStorage.getItem(HISTORY_KEY);
        var arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (e) {
        return [];
      }
    },
    save: function (list) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)));
      } catch (e) { /* 超出配额时静默失败 */ }
    },
    add: function (item) {
      var list = WJ.history.load();
      list.unshift(item);
      WJ.history.save(list);
      return list;
    },
    remove: function (id) {
      var list = WJ.history.load().filter(function (h) { return h.id !== id; });
      WJ.history.save(list);
      return list;
    },
    clear: function () {
      WJ.history.save([]);
      return [];
    },
    /* [NEW-13] 导出全部历史为 JSON 文件 */
    exportJson: function () {
      var data = JSON.stringify({ app: 'guangti-wenwujie', version: 2, items: WJ.history.load() }, null, 2);
      var blob = new Blob([data], { type: 'application/json;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '光体文无界_历史备份_' + today() + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    },
    /* [NEW-13] 从 JSON 文件导入历史（按 id 去重合并），返回新列表；失败返回 null */
    importJsonText: function (text) {
      try {
        var o = JSON.parse(text);
        var items = Array.isArray(o) ? o : (o && Array.isArray(o.items) ? o.items : null);
        if (!items) return null;
        var valid = items.filter(function (it) {
          return it && typeof it.content === 'string' && typeof it.id !== 'undefined';
        });
        if (!valid.length) return null;
        var exist = {};
        WJ.history.load().forEach(function (h) { exist[h.id] = true; });
        var merged = WJ.history.load();
        valid.forEach(function (it) {
          if (!exist[it.id]) { merged.push(it); exist[it.id] = true; }
        });
        merged.sort(function (a, b) { return String(b.id).localeCompare(String(a.id)); });
        WJ.history.save(merged);
        return merged;
      } catch (e) {
        return null;
      }
    },
  };

  /* ---------------- [NEW-12] 内容体检 ---------------- */
  var RISK_WORDS = [
    '根治', '治愈', '包治', '疗效', '彻底解决', '排毒', '清宿便',
    '稳赚', '保本', '躺赚', '翻倍', '百分百', '100%', '保证收益',
    '第一品牌', '国家级', '最高级', '绝无仅有', '万能', '包好',
  ];

  WJ.audit = function (content) {
    var lines = String(content || '').split('\n');
    var text = lines.join('');
    var chars = text.replace(/\s/g, '').length;
    var minutes = Math.max(1, Math.round(chars / 400)); // 中文阅读约 400 字/分钟

    var golden = 0;
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      // 独立成行的短句（≤30字、以句末标点收尾）视为金句
      if (t.length >= 6 && t.length <= 30 && /[。！？…]$/.test(t) && t.indexOf('【') !== 0 && !/^[━═─-]+$/.test(t)) {
        golden++;
      }
    }

    var risks = [];
    for (var j = 0; j < RISK_WORDS.length; j++) {
      var w = RISK_WORDS[j];
      var count = text.split(w).length - 1;
      if (count > 0) risks.push({ word: w, count: count });
    }

    return { chars: chars, minutes: minutes, golden: golden, risks: risks };
  };

  /* ---------------- [NEW-14] 配图提示词 ---------------- */
  /* 从正文中挑 3 个画面感强的句子，生成文生图提示词（供即梦/Midjourney使用） */
  WJ.imagePrompts = function (content, dimension) {
    var captions = WJ.pickImageCaptions ? WJ.pickImageCaptions(content) : [];
    while (captions.length < 3) captions.push(dimension || '古老文明');
    var style = '电影感构图，暖金色调，超高清细节，史诗氛围';
    return captions.map(function (c, i) {
      return '配图' + (i + 1) + '：' + c.substring(0, 24) + '…… → 提示词：' +
        dimension + '，' + (i === 0 ? '宏伟全景' : (i === 1 ? '人物特写' : '细节纹样')) +
        '，' + style;
    });
  };

  /* ---------------- 下载 ---------------- */
  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  WJ.downloadMarkdown = function (content, dimension) {
    var blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    triggerDownload(blob, WJ.BRAND.filePrefix + '_' + dimension + '_' + Date.now() + '.md');
  };

  /* 生成 Word 可直接打开的 .doc（内嵌 HTML，无需外部库） */
  WJ.downloadWord = function (content, dimension, title) {
    var esc = function (s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    var body = String(content).split('\n').map(function (line) {
      var t = line.trim();
      if (!t) return '<p>&nbsp;</p>';
      if (/^[━═─-]+$/.test(t)) return '<hr/>';
      if (t.indexOf('【') === 0 && t.lastIndexOf('】') === t.length - 1) {
        return '<h2>' + esc(t.replace(/[【】]/g, '')) + '</h2>';
      }
      return '<p>' + esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</p>';
    }).join('\n');

    var html = [
      '<html xmlns:o="urn:schemas-microsoft-com:office:office"',
      ' xmlns:w="urn:schemas-microsoft-com:office:word"',
      ' xmlns="http://www.w3.org/TR/REC-html40">',
      '<head><meta charset="utf-8">',
      '<title>' + esc(title || dimension) + '</title>',
      '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->',
      '<style>',
      'body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;font-size:11pt;line-height:1.8;color:#222}',
      'h1{font-size:18pt;color:#3a2e22}',
      'h2{font-size:14pt;color:#8a6a3a;margin-top:16pt}',
      'p{margin:6pt 0;text-align:justify}',
      '</style></head><body>',
      '<h1>' + esc(title || dimension) + '</h1>',
      body,
      '</body></html>',
    ].join('');

    var blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
    triggerDownload(blob, WJ.BRAND.filePrefix + '_' + dimension + '_' + Date.now() + '.doc');
  };

  /* ---------------- 其它 ---------------- */
  WJ.copyText = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // 兜底：非 HTTPS / 旧浏览器
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (e) {
        reject(e);
      }
    });
  };

  WJ.escapeHtml = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
})(window.WJ = window.WJ || {});
