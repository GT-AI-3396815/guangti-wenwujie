/* 光体·文无界 — 配图生成
 * 算法完全迁移自原站（Canvas 程序化绘制，无外部图片依赖）。
 *
 * 相对原站修复：
 *  [BUG-7] 原站把 Date.now() 混进随机种子，导致同一篇内容每次打开预览配图都在变
 *          （颜色、构图全部重排）。这里只用内容哈希做种子，保证配图稳定可复现。
 */
(function (WJ) {
  'use strict';

  function lcg(seed) {
    var s = seed;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h) + 1;
  }

  /* 按最大宽度折行 */
  function wrapText(ctx, text, maxWidth) {
    var chars = text.split('');
    var lines = [];
    var cur = '';
    for (var i = 0; i < chars.length; i++) {
      var next = cur + chars[i];
      if (ctx.measureText(next).width > maxWidth && cur.length > 0) {
        lines.push(cur);
        cur = chars[i];
      } else {
        cur = next;
      }
    }
    if (cur) lines.push(cur);
    return lines.length > 0 ? lines : [text];
  }

  /* 径向渐变光斑 */
  function radialBlob(ctx, x, y, r, color, alpha) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    var a = Math.floor(alpha * 255).toString(16).padStart(2, '0');
    g.addColorStop(0, color + a);
    g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* 椭圆 */
  function ellipse(ctx, x, y, rx, ry, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    var a = Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.fillStyle = color + a;
    ctx.fill();
    ctx.restore();
  }

  /* 圆弧描边 */
  function arcStroke(ctx, x, y, r, start, end, color, width) {
    ctx.beginPath();
    ctx.arc(x, y, r, start, end);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  /* 颗粒噪点 */
  function grain(ctx, w, h, ratio) {
    var r = ratio === undefined ? 0.012 : ratio;
    var img = ctx.getImageData(0, 0, w, h);
    var d = img.data;
    for (var i = 0; i < d.length; i += 12) {
      if (Math.random() < r) {
        var n = Math.random() > 0.5 ? 6 : -6;
        d[i] = Math.max(0, Math.min(255, d[i] + n));
        d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
        d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /* 封面图 1024×576 */
  WJ.makeCover = function (title, dimension) {
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    var ctx = canvas.getContext('2d');
    if (!ctx) return '';

    var rand = lcg(hash(title + '|' + dimension)); // [BUG-7] 不再掺入 Date.now()
    var p = WJ.PALETTES[Math.floor(rand() * WJ.PALETTES.length)];
    var W = canvas.width;
    var H = canvas.height;

    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, p.bg1);
    bg.addColorStop(0.5, p.bg2);
    bg.addColorStop(1, p.bg3);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    radialBlob(ctx, W * 0.25, H * 0.3, 300, p.accent, 0.1);
    radialBlob(ctx, W * 0.75, H * 0.7, 250, p.accent, 0.08);
    radialBlob(ctx, W * 0.6, H * 0.2, 180, p.muted, 0.06);
    ellipse(ctx, W * 0.12, H * 0.2, 70, 35, p.accent, 0.07);
    ellipse(ctx, W * 0.88, H * 0.78, 90, 45, p.accent, 0.05);
    ellipse(ctx, W * 0.5, H * 0.12, 50, 25, p.muted, 0.09);

    var line = p.accent + '22';
    arcStroke(ctx, -60, H * 0.4, 240, -Math.PI * 0.3, Math.PI * 0.35, line, 1);
    arcStroke(ctx, W + 50, H * 0.6, 280, Math.PI * 0.65, Math.PI * 1.35, line, 0.8);

    ctx.save();
    ctx.strokeStyle = p.muted + '15';
    ctx.lineWidth = 0.35;
    for (var x = 0; x < W; x += 36) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (var y = 0; y < H; y += 36) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = p.accent + '80';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 36, H * 0.36);
    ctx.lineTo(W / 2 + 36, H * 0.36);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '500 14px "PingFang SC", "Noto Sans SC", -apple-system, sans-serif';
    ctx.fillStyle = p.accent;
    ctx.fillText(dimension, W / 2, H * 0.32);

    var short = title.length > 22 ? title.substring(0, 20) + '..' : title;
    var size = short.length > 14 ? 44 : 52;
    var lh = size * 1.35;
    ctx.font = '700 ' + size + 'px "PingFang SC", "Noto Sans SC", -apple-system, sans-serif';
    ctx.fillStyle = p.text;
    var lines = wrapText(ctx, short, 700);
    var startY = H * 0.48 - (lines.length * lh) / 2 + lh / 2;
    lines.forEach(function (ln, idx) {
      ctx.shadowColor = 'rgba(0,0,0,0.04)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 3;
      ctx.fillText(ln, W / 2, startY + idx * lh);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    });
    ctx.restore();

    grain(ctx, W, H);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  /* 正文配图 800×400 */
  WJ.makeInlineImage = function (text, dimension, index) {
    var canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    var ctx = canvas.getContext('2d');
    if (!ctx) return '';

    var rand = lcg(hash(text + '|' + dimension + '|' + index)); // [BUG-7]
    var palettes = WJ.PALETTES;
    var p = palettes[(Math.floor(rand() * palettes.length) + index * 3) % palettes.length];
    var W = canvas.width;
    var H = canvas.height;

    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, p.bg1);
    bg.addColorStop(0.5, p.bg3);
    bg.addColorStop(1, p.bg2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var vx = index % 2 === 0 ? W * 0.2 : W * 0.8;
    radialBlob(ctx, vx, H * 0.5, 180, p.accent, 0.09);
    radialBlob(ctx, W * 0.5, H * 0.15, 120, p.muted, 0.06);

    ctx.save();
    ctx.fillStyle = p.accent + '12';
    if (index % 2 === 0) ctx.fillRect(0, H * 0.2, W * 0.05, H * 0.6);
    else ctx.fillRect(W * 0.95, H * 0.2, W * 0.05, H * 0.6);
    ctx.restore();

    if (index % 3 === 0) arcStroke(ctx, -40, H * 0.5, 160, -Math.PI * 0.4, Math.PI * 0.4, p.accent + '18', 1);
    else if (index % 3 === 1) arcStroke(ctx, W + 40, H * 0.5, 180, Math.PI * 0.6, Math.PI * 1.4, p.accent + '15', 0.9);
    else arcStroke(ctx, W * 0.5, -40, 200, Math.PI * 0.1, Math.PI * 0.9, p.accent + '12', 0.8);

    var short = text.length > 28 ? text.substring(0, 26) + '..' : text;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '400 48px Georgia, serif';
    ctx.fillStyle = p.accent + '22';
    ctx.fillText('"', W / 2, H * 0.22);

    var size = short.length > 18 ? 22 : 26;
    var lh = size * 1.55;
    ctx.font = '600 ' + size + 'px "PingFang SC", "Noto Sans SC", -apple-system, sans-serif';
    ctx.fillStyle = p.text;
    var lines = wrapText(ctx, short, 540);
    var startY = H * 0.46 - (lines.length * lh) / 2 + lh / 2;
    lines.forEach(function (ln, idx) {
      ctx.fillText(ln, W / 2, startY + idx * lh);
    });

    var dy = H * 0.72;
    ctx.strokeStyle = p.accent + '50';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 32, dy);
    ctx.lineTo(W / 2 + 32, dy);
    ctx.stroke();
    ctx.font = '400 13px "PingFang SC", sans-serif';
    ctx.fillStyle = p.muted;
    ctx.fillText(dimension, W / 2, dy + 20);
    ctx.restore();

    grain(ctx, W, H);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  /* 从正文中挑 3 段适合做配图文案的句子 */
  WJ.pickImageCaptions = function (content) {
    var lines = content.split('\n').slice(1);
    var picked = [];
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (t.length > 20 && t.length < 80 && !/^[━═─]+$/.test(t) && t.indexOf('【') !== 0) {
        picked.push(t.substring(0, 50));
        if (picked.length >= 3) break;
      }
    }
    return picked;
  };
})(window.WJ = window.WJ || {});
