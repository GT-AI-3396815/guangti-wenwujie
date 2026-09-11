/* 光体·文无界 — 模型接口层
 *
 * 相对原站修复：
 *  [BUG-1] max_tokens 从 4000 提到 16000（推理模型的思考链开销）
 *  [BUG-2] finish_reason==='length' 截断检测
 *  [BUG-3] 超时控制与 AbortController
 *  [BUG-4] 推理模型 content 为空的自动重试
 *  [BUG-5] 错误按状态码分类，给可操作的中文提示
 *  [BUG-6] API Key 可在「设置」中替换并持久化
 *
 * 本次新增：
 *  [NEW-11] 流式输出（SSE），生成过程中实时回显；流式失败自动降级为普通请求
 */
(function (WJ) {
  'use strict';

  var DEFAULT_CONFIG = {
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: 'sk-54eed41ec2c649fcb3f871887e7e53bf',
    model: 'deepseek-v4-flash-vision-exp',
  };

  var CFG_KEY = 'wenwujie_llm_config';
  var TIMEOUT_MS = 180000;

  WJ.getConfig = function () {
    try {
      var raw = localStorage.getItem(CFG_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        return {
          baseUrl: saved.baseUrl || DEFAULT_CONFIG.baseUrl,
          apiKey: saved.apiKey || DEFAULT_CONFIG.apiKey,
          model: saved.model || DEFAULT_CONFIG.model,
        };
      }
    } catch (e) { /* 忽略解析异常，回落到默认配置 */ }
    return {
      baseUrl: DEFAULT_CONFIG.baseUrl,
      apiKey: DEFAULT_CONFIG.apiKey,
      model: DEFAULT_CONFIG.model,
    };
  };

  WJ.saveConfig = function (cfg) {
    localStorage.setItem(CFG_KEY, JSON.stringify({
      baseUrl: cfg.baseUrl || DEFAULT_CONFIG.baseUrl,
      apiKey: cfg.apiKey || DEFAULT_CONFIG.apiKey,
      model: cfg.model || DEFAULT_CONFIG.model,
    }));
  };

  WJ.resetConfig = function () {
    localStorage.removeItem(CFG_KEY);
  };

  function friendlyError(status, body) {
    var lower = String(body || '').toLowerCase();
    if (status === 401) return '接口密钥无效或已过期（401）。请在「设置」中更换 API Key。';
    if (status === 402) return '接口账户余额不足（402）。请充值后重试，或在「设置」中更换 API Key。';
    if (status === 422) return '请求参数有误（422）。可能是 max_tokens 超出该模型上限，请在「设置」中更换模型。';
    if (status === 429) return '请求过于频繁，已被限流（429）。请稍等几十秒后重试。';
    if (status >= 500) return '模型服务端暂时不可用（' + status + '）。请稍后重试。';
    if (lower.indexOf('insufficient') >= 0) return '账户余额不足，请充值后重试。';
    if (lower.indexOf('model') >= 0 && lower.indexOf('not') >= 0) return '模型名称不可用，请在「设置」中更换模型。';
    return '接口返回错误（' + status + '）：' + String(body || '').slice(0, 200);
  }

  function buildBody(messages, temperature, maxTokens, stream) {
    return JSON.stringify({
      model: WJ.getConfig().model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: !!stream,
    });
  }

  /* ---------------- 普通请求 ---------------- */
  WJ.callModel = function (messages, temperature, maxTokens) {
    var cfg = WJ.getConfig();
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    return fetch(cfg.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + cfg.apiKey,
      },
      body: buildBody(messages, temperature, maxTokens, false),
      signal: controller.signal,
    }).then(function (res) {
      return res.text().then(function (text) {
        if (!res.ok) throw new Error(friendlyError(res.status, text));
        var data;
        try { data = JSON.parse(text); } catch (e) { throw new Error('接口返回了非 JSON 内容，请检查接口地址是否正确。'); }
        var choice = (data.choices || [])[0] || {};
        var msg = choice.message || {};
        return {
          content: (msg.content || '').trim(),
          reasoning: (msg.reasoning_content || '').trim(),
          truncated: choice.finish_reason === 'length',
        };
      });
    }).catch(function (err) {
      if (err.name === 'AbortError') throw new Error('请求超时（超过 ' + Math.round(TIMEOUT_MS / 1000) + ' 秒）。内容较长时可稍后重试。');
      throw err;
    }).then(function (result) {
      clearTimeout(timer);
      return result;
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  };

  /* ---------------- [NEW-11] 流式请求 ----------------
   * 返回 {content, truncated}；onDelta(accumulatedText) 在每个增量后回调。
   * 流式不受 180s 超时打断（有增量就活着），仅 60s 无增量判超时。
   */
  WJ.callModelStream = function (messages, temperature, maxTokens, onDelta) {
    var cfg = WJ.getConfig();
    var controller = new AbortController();
    var lastActivity = Date.now();
    var watchdog = setInterval(function () {
      if (Date.now() - lastActivity > 60000) {
        controller.abort();
      }
    }, 5000);

    function cleanup() { clearInterval(watchdog); }

    return fetch(cfg.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + cfg.apiKey,
      },
      body: buildBody(messages, temperature, maxTokens, true),
      signal: controller.signal,
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) {
          throw new Error(friendlyError(res.status, text));
        });
      }
      if (!res.body || !res.body.getReader) {
        // 环境不支持流式，调用方会降级
        var noStream = new Error('NO_STREAM_SUPPORT');
        noStream.code = 'NO_STREAM_SUPPORT';
        throw noStream;
      }
      var reader = res.body.getReader();
      var decoder = new TextDecoder('utf-8');
      var buf = '';
      var full = '';
      var truncated = false;

      function pump() {
        return reader.read().then(function (chunk) {
          lastActivity = Date.now();
          if (chunk.done) {
            cleanup();
            return { content: full.trim(), truncated: truncated };
          }
          buf += decoder.decode(chunk.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop(); // 最后一段可能不完整，留在缓冲
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || line.indexOf('data:') !== 0) continue;
            var payload = line.slice(5).trim();
            if (payload === '[DONE]') continue;
            try {
              var j = JSON.parse(payload);
              var ch = (j.choices || [])[0] || {};
              var piece = (ch.delta && ch.delta.content) || '';
              if (piece) {
                full += piece;
                if (onDelta) { try { onDelta(full); } catch (e) { /* 回调异常不影响流 */ } }
              }
              if (ch.finish_reason === 'length') truncated = true;
            } catch (e) { /* 单片解析失败忽略 */ }
          }
          return pump();
        });
      }

      return pump();
    }).catch(function (err) {
      cleanup();
      if (err && err.code === 'NO_STREAM_SUPPORT') throw err;
      if (err.name === 'AbortError') {
        var t = new Error('流式请求超时（60秒无增量）。请重试。');
        throw t;
      }
      throw err;
    });
  };

  /**
   * 生成正文：优先流式（onDelta 实时回显），失败降级为普通请求，
   * 并带一次「推理模型空内容」重试。
   */
  WJ.generateContent = function (messages, temperature, maxTokens, onDelta) {
    function nonStreamFallback() {
      return WJ.callModel(messages, temperature, maxTokens).then(function (r) {
        if (r.content && onDelta) { try { onDelta(r.content); } catch (e) { /* ignore */ } }
        return r;
      });
    }

    return WJ.callModelStream(messages, temperature, maxTokens, onDelta).catch(function (err) {
      // 流式不支持 / 偶发失败 → 降级普通请求
      return nonStreamFallback();
    }).then(function (r) {
      if (r.content && r.content.length >= 50) {
        return { content: r.content, truncated: r.truncated };
      }
      // [BUG-4] 推理模型把 token 全花在思考上，正文被挤空 —— 降低温度、加大上限重试一次
      return WJ.callModel(messages, 0.6, Math.min(maxTokens * 2, 32000)).then(function (r2) {
        if (!r2.content || r2.content.length < 50) {
          if (r2.reasoning) {
            throw new Error('模型只输出了思考过程、没有产出正文。请重试，或在「设置」中换用非推理模型。');
          }
          throw new Error('模型返回内容为空，请重试。');
        }
        if (onDelta) { try { onDelta(r2.content); } catch (e) { /* ignore */ } }
        return { content: r2.content, truncated: r2.truncated };
      });
    });
  };

  /**
   * 生成 5 个爆款标题（失败自动重试一次，仍失败返回空数组由调用方兜底）
   */
  WJ.generateTitles = function (dimension, type) {
    var prompt = WJ.buildTitlePrompt(dimension, type);
    var messages = [
      { role: 'system', content: WJ.SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    function attempt() {
      // [BUG-1] 原站 500 token 对推理模型远远不够，提到 3000（含思考链开销）
      return WJ.callModel(messages, 0.9, 3000).then(function (r) {
        var lines = (r.content || '')
          .split('\n')
          .map(function (l) { return l.trim().replace(/^[-*\d.、]+\s*/, '').replace(/^["'「【]|[】」"']$/g, ''); })
          .filter(function (l) { return l.length >= 5 && l.length <= 40; });
        // 若模型未在行首输出，尝试按句号切分兜底
        if (lines.length < 2 && r.content) {
          lines = r.content.split(/[。！？]/).map(function (s) { return s.trim(); })
            .filter(function (s) { return s.length >= 8 && s.length <= 30; });
        }
        return lines.slice(0, 5);
      });
    }

    return attempt().then(function (lines) {
      if (lines.length >= 2) return lines;
      // 推理模型偶发把 token 全花在思考上导致标题为空 —— 重试一次
      return attempt();
    }).catch(function () {
      // 第一次请求抛错（限流/网络抖动）同样重试一次；标题失败不应阻断正文生成
      return attempt().catch(function () { return []; });
    });
  };
})(window.WJ = window.WJ || {});
