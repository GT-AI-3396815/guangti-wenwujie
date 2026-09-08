# -*- coding: utf-8 -*-
"""把 base64 logo 注入 app.js：替换 SVG 图标 + 注入共享常量 WJ.LOGO_SRC"""
import io
import re

s = io.open('src/app.js', encoding='utf-8').read()
b64 = io.open('src/logo_b64.txt').read().strip()

old_logo = re.search(r"logo: '<svg viewBox.*?</svg>'", s, re.S)
assert old_logo, 'logo svg not found'
new_logo = ("logo: '<img src=\"' + WJ.LOGO_SRC + "
            "\"\" style=\"width:100%;height:100%;object-fit:contain;display:block;\" alt=\"\" />'\"")
new_logo = "logo: '<img src=\"' + WJ.LOGO_SRC + \"\" style=\"width:100%;height:100%;object-fit:contain;display:block;\" alt=\"\" />'"
s = s[:old_logo.start()] + new_logo + s[old_logo.end():]

anchor = "(function (WJ) {\n  'use strict';"
assert anchor in s, 'anchor not found'
inject = (anchor +
          "\n\n  /* 品牌 logo（透明底金色曼陀罗，base64 内嵌） */"
          "\n  WJ.LOGO_SRC = 'data:image/png;base64," + b64 + "';")
s = s.replace(anchor, inject, 1)

io.open('src/app.js', 'w', encoding='utf-8').write(s)
print('app.js logo injected, len', len(s))
