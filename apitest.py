"""用真实接口跑一次生成，验证 prompt 与 max_tokens 配置是否够用。"""
import json
import os
import sys
import time
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

KEY = "sk-300dd331465f4ae38ae4da3829c38418"
URL = "https://api.deepseek.com/v1/chat/completions"
MODEL = "deepseek-v4-flash"

SYSTEM = """你是光体•文无界，一位深谙人类文明的内容创作者。

【写作风格】
- 视角：人类文明高度，不限于一国一域
- 语言：有诗意但不矫情，有深度但不晦涩，有锋芒但不偏激
- 主张：人类正经历从物质到意识的范式转移
- 金句密度：每300字一句值得截图转发的话
- 信息密度：每段都有增量，零废话

【写作铁律】
1. 开头3秒定生死——用震撼事实或颠覆认知开场，绝不寒暄
2. 不是"介绍"是"颠覆"——让读者觉得"原来我以前知道的是错的"
3. 观点带锋芒——有态度有立场，不和稀泥
4. 具体到名字时间地点——有细节才有可信度
5. 情绪有起伏——震撼→追问→共鸣→冲突→启示→行动
6. 绝不出现："本文将介绍""综上所述""随着时代发展""值得我们深思"
7. 禁止："揭秘""震惊""绝密""99%的人不知道"等low词
8. 禁止提及"108维度""素材库"等系统词汇"""

TITLE_PROMPT = """创作5个关于"%s"的%s标题。
要求：让人有点开的冲动，15-25字，5个不同风格（悬念反转、认知颠覆、痛点共鸣、数字冲击、情绪引爆），只输出标题每行一个不要序号不要引号，用中文。"""


def call(messages, temperature, max_tokens, timeout=300):
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    req = urllib.request.Request(
        URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + KEY},
    )
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = json.loads(r.read().decode("utf-8"))
    dt = time.time() - t0
    ch = (data.get("choices") or [{}])[0]
    msg = ch.get("message") or {}
    return {
        "content": msg.get("content") or "",
        "reasoning": msg.get("reasoning_content") or "",
        "finish": ch.get("finish_reason"),
        "usage": data.get("usage") or {},
        "seconds": round(dt, 1),
    }


def main():
    dim = os.environ.get("DIM", "三星堆文明")
    ctype = os.environ.get("CTYPE", "深度长文")
    maxtok = int(os.environ.get("MAXTOK", "16000"))

    print("=== 1. 标题生成 (max_tokens=2000) ===")
    r = call([{"role": "system", "content": SYSTEM},
              {"role": "user", "content": TITLE_PROMPT % (dim, ctype)}], 0.9, 2000)
    print("finish=%s 用时=%ss tokens=%s" % (r["finish"], r["seconds"], r["usage"].get("completion_tokens")))
    print("content 长度=%d" % len(r["content"]))
    print(r["content"][:400])
    print()

    print("=== 2. 正文生成 (%s, max_tokens=%d) ===" % (ctype, maxtok))
    body_prompt = [
        '【任务】以"三星堆文明深度解读"为题，创作一篇关于"%s"的深度长文，发布在公众号。' % dim,
        "【基础要求】",
        "1. 开头用震撼事实或颠覆认知切入，绝不寒暄",
        "2. 核心论点鲜明——第一段就要亮出观点",
        "3. 用具体事实支撑（有数字、有名字、有时间、有地点）",
        "4. 与当代建立连接（这与我有什么关系）",
        "5. 有情绪起伏，不要平铺直叙",
        "6. 段落间有过渡金句",
        "【深度长文专属结构】（严格按此执行）",
        "第一段（200字）：震撼开场。一个颠覆认知的具体事实，带数字和细节。",
        "第二段（150字）：核心论点宣告。明确告诉读者你要说什么，观点要有锋芒。",
        "第三至六段（800字）：历史纵深。时间线+3个关键事件+2个人物故事（具体到名字、年代、地点）。穿插1个争议话题。",
        "第七至十段（1000字）：深度分析。5个具体事实，每个配数据或考古发现。展示不同学者观点的碰撞。",
        "第十一至十二段（600字）：当代连接。这个文明对今天的我们有何启示？具体到一个现代场景。",
        "第十三段（400字）：升华。从更大视角（宇宙/文明/人类命运）收束全文。",
        "第十四段（200字）：互动结尾。向读者提出一个问题或发起一个行动号召。",
        "【结尾附加】",
        "另起一行，输出5-8条金句，每行一条，方便截图转发。",
        "【格式】",
        "- 段落之间用空行分隔",
        "- 小标题用【】包裹",
        "- 重要句子用**加粗**",
        "- 字数3000字以上",
    ]
    r2 = call([{"role": "system", "content": SYSTEM},
               {"role": "user", "content": "\n".join(body_prompt)}], 0.85, maxtok)
    print("finish=%s 用时=%ss" % (r2["finish"], r2["seconds"]))
    print("completion_tokens=%s  total=%s" % (
        r2["usage"].get("completion_tokens"), r2["usage"].get("total_tokens")))
    print("reasoning 字符数=%d" % len(r2["reasoning"]))
    print("content 字符数=%d" % len(r2["content"]))
    print("--- 正文前 500 字 ---")
    print(r2["content"][:500])
    print("--- 正文后 200 字 ---")
    print(r2["content"][-200:])


if __name__ == "__main__":
    main()
