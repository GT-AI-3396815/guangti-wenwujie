/* 光体·文无界 — 工具层（额度 / 历史 / 导出）
 *
 * 相对原站修复：
 *  [BUG-10] 原站历史记录只存在 React state 里，刷新页面全部丢失，
 *           但界面却叫「生成历史」，属于实打实的数据丢失。这里持久化到 localStorage。
 *  [BUG-11] 原站额度初始值硬编码 useState(100)，刷新瞬间会闪一下 100 再跳到真实值。
 *           这里初始化即读本地真实值。
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
