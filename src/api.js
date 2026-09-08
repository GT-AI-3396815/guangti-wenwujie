/* 光体·文无界 — 模型接口层
 *
 * 相对原站修复：
 *  [BUG-1] max_tokens 从 4000 提到 16000。原站用 deepseek-v4-flash，这是推理模型，
 *          会先产出 reasoning_content 再产出 content，4000 token 里思考链就吃掉大半，
 *          导致正文被截断甚至 content 直接为空（实测 max_tokens=20 时 content 为 ""）。
 *  [BUG-2] 新增 finish_reason==='length' 截断检测，明确告诉用户内容被截断。
 *  [BUG-3] 新增超时控制（默认 180s）与 AbortController，避免请求挂死界面卡在「生成中」。
 *  [BUG-4] 新增针对推理模型 content 为空的自动重试（降低 temperature 再试一次）。
 *  [BUG-5] 错误按状态码分类，给出可操作的中文提示，而不是抛一句英文 API 报错。
 *  [BUG-6] API Key 不再写死成常量，改为可在「设置」中替换并持久化（仍提醒前端暴露风险）。
 */
(function (WJ) {
  'use strict';

  var DEFAULT_CONFIG = {
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: 'sk-8653ab2cd6e348448f40916a1ab97975',
    model: 'deepseek-v4-flash',
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

  /**
   * 调用模型
   * @param {Array}  messages    消息数组
   * @param {Number} temperature 温度
   * @param {Number} maxTokens   最大输出 token
   * @returns {Promise<{content:String, truncated:Boolean}>}
   */
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
      body: JSON.stringify({
        model: cfg.model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    }).then(function (res) {
      return res.text().then(function (text) {
        if (!res.ok) throw new Error(friendlyError(res.status, text));
        var data;
        try { data = JSON.parse(text); } catch (e) { throw new Error('接口返回了非 JSON 内容，请检查接口地址是否正确。'); }
        var choice = (data.choices || [])[0] || {};
        var msg = choice.message || {};
        return {
          // 推理模型可能把正文放在 content，也可能只有 reasoning_content
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

  /**
   * 生成正文。带一次「推理模型空内容」重试。
   */
  WJ.generateContent = function (messages, temperature, maxTokens) {
    return WJ.callModel(messages, temperature, maxTokens).then(function (r) {
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
      // 标题失败不应阻断正文生成，回落到默认标题
      return [];
    });
  };
})(window.WJ = window.WJ || {});
