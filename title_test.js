global.window = {};
require('./src/prompts.js');
var WJ = global.window.WJ || global.window;
var prompt = WJ.buildTitlePrompt('三星堆文明', '爆款文案');
var body = JSON.stringify({
  model: 'deepseek-v4-flash-vision-exp',
  messages: [
    { role: 'system', content: WJ.SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ],
  temperature: 0.9,
  max_tokens: 3000,
});
fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer sk-54eed41ec2c649fcb3f871887e7e53bf' },
  body: body,
}).then(r => r.json()).then(d => {
  var m = (d.choices || [])[0]?.message || {};
  console.log('finish:', d.choices?.[0]?.finish_reason);
  console.log('content:', JSON.stringify(m.content));
  console.log('reasoning len:', (m.reasoning_content || '').length);
  console.log('usage:', JSON.stringify(d.usage));
}).catch(e => console.error('ERR', e.message));
