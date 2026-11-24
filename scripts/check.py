#!/usr/bin/env python3
"""讲义 HTML 自检：标签配对、公式残留、图片加载。

用法：python3 check.py 讲义.html
"""
import re
import sys

VOID = {'img','br','hr','input','meta','link','source'}

def check(path):
    s = open(path, encoding='utf-8').read()
    ok = True
    print(f'文件：{path}（{len(s.encode())/1048576:.2f} MB）')

    # 1) 剔除 script/style 后检查标签配对
    clean = re.sub(r'<script[\s\S]*?</script>', '', s)
    clean = re.sub(r'<style[\s\S]*?</style>', '', clean)
    stack = []
    for m in re.finditer(r'<(/?)([a-zA-Z][\w-]*)([^>]*?)(/?)>', clean):
        closing, tag, _, selfc = m.group(1), m.group(2).lower(), m.group(3), m.group(4)
        if tag in VOID or selfc:
            continue
        if closing:
            if stack and stack[-1] == tag:
                stack.pop()
            else:
                print(f'  ✗ 标签不配对 @ {m.start()}：</{tag}>，栈顶 {stack[-1] if stack else "空"}')
                ok = False
                break
        else:
            stack.append(tag)
    if not stack:
        print('  ✓ 标签配对')
    elif ok:
        print(f'  ✗ 未闭合：{stack[:5]}')
        ok = False

    # 2) 公式：静态文件里是 data-tex，浏览器运行时才变成 .katex
    n_katex = s.count('class="katex"')
    n_tex = len(re.findall(r'data-tex="', s))
    has_runtime = 'katex.render' in s
    if n_tex and has_runtime:
        print(f'  ✓ 公式 {n_tex} 个（运行时渲染，静态 HTML 里是 data-tex）')
    elif n_tex:
        print(f'  ✗ 有 {n_tex} 个 data-tex 但没有渲染代码')
        ok = False
    elif n_katex:
        print(f'  ✓ KaTeX 已预渲染 {n_katex} 个')
    else:
        print('  · 没有公式（可能这份讲义本来就没有）')

    # 3) 正文里残留的 $...$
    body = re.sub(r'<script[\s\S]*?</script>', '', s)
    body = re.sub(r'<style[\s\S]*?</style>', '', body)
    left = re.findall(r'\$[^$\n]{2,80}\$', body)
    if left:
        print(f'  ✗ 正文残留 {len(left)} 处 $...$：{left[:3]}')
        ok = False
    else:
        print('  ✓ 无残留 $...$')

    # 4) 图片（只看 HTML 部分，忽略脚本里的模板字符串）
    html_only = re.sub(r'<script[\s\S]*?</script>', '', s)
    imgs = re.findall(r'<img[^>]+src="([^"]{0,80})', html_only)
    imgs = [i for i in imgs if not i.startswith("'") and '+' not in i]
    bad = [i for i in imgs if not (i.startswith('data:') or i.startswith('http') or i.startswith('.') or i.startswith('/'))]
    if imgs:
        print(f'  ✓ 图片 {len(imgs)} 张' + (f'，异常 {len(bad)}: {bad[:2]}' if bad else ''))
    else:
        print('  · 没有图片')
    return ok

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('用法：python3 check.py 讲义.html')
    all_ok = all(check(p) for p in sys.argv[1:])
    print('\n' + ('全部通过 ✓' if all_ok else '有问题 ✗'))
    sys.exit(0 if all_ok else 1)
