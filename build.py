"""把 src/ 下的模块内联成单个可直接双击打开的 HTML 文件。"""
import io
import os
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "src")
DIST = os.path.join(BASE, "dist")
OUT = os.path.join(DIST, "光体·文无界.html")

JS_FILES = [
    "data.js",
    "prompts.js",
    "utils.js",
    "api.js",
    "graphics.js",
    "render.js",
    "app.js",
]


def read(name):
    with io.open(os.path.join(SRC, name), encoding="utf-8") as f:
        return f.read()


def main():
    styles = read("styles.css") + "\n" + read("custom.css")

    js_parts = []
    for name in JS_FILES:
        code = read(name)
        if "</script" in code.lower():
            print("ERROR: %s contains '</script'" % name)
            sys.exit(1)
        js_parts.append("/* ==== %s ==== */\n%s" % (name, code))

    js = "\n".join(js_parts)
    js += "\n\n/* ==== boot ==== */\nWJ.boot();\n"

    if "</style" in styles.lower():
        print("ERROR: css contains '</style'")
        sys.exit(1)

    shell = read("shell.html")
    html = shell.replace("/*__STYLES__*/", styles).replace("/*__APP__*/", js)

    if not os.path.isdir(DIST):
        os.makedirs(DIST)

    with io.open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    # 同内容再输出一份 index.html，便于本地起服务和部署
    with io.open(os.path.join(DIST, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)

    size = os.path.getsize(OUT)
    print("built: %s" % OUT)
    print("built: %s" % os.path.join(DIST, "index.html"))
    print("size : %.1f KB" % (size / 1024.0))


if __name__ == "__main__":
    main()
