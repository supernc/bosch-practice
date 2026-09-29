# -*- coding: utf-8 -*-
"""
修复 data_a/b/c.py 中单值行（stem/correct/analysis）内部嵌套的半角双引号。
策略：
  对形如   <indent>"key":"VALUE",  或  <indent>"key":"VALUE"  的行，
  仅当 key 属于 SINGLE_KEYS 时处理：
  - 定位前缀 '"key":"' 的结尾位置 p（即 value 起始）
  - 定位尾部定界引号（最后一个 '"'，其后只能是可选的 ',' 与空白）
  - 将 value 区间内所有半角 '"' 成对替换为中文全角 “ / ”
列表行（distractors/tags/correct_multi）跳过——其内部半角引号是合法的字符串分隔。
"""
import re, sys, os

SINGLE_KEYS = ["stem", "correct", "analysis"]
LEFT, RIGHT = "\u201c", "\u201d"  # “ ”

def fix_value(v):
    """把字符串 v 内部的半角双引号成对替换为全角。"""
    out = []
    open_q = True
    for ch in v:
        if ch == '"':
            out.append(LEFT if open_q else RIGHT)
            open_q = not open_q
        else:
            out.append(ch)
    return "".join(out)

def fix_line(line):
    stripped = line.lstrip()
    indent = line[: len(line) - len(stripped)]
    for key in SINGLE_KEYS:
        prefix = '"%s":"' % key
        if stripped.startswith(prefix):
            rest = stripped[len(prefix):]
            # rest 以 value 开头，末尾应为  "  或  ",
            # 去掉行尾空白
            tail_ws = ""
            core = rest
            m = re.search(r"(\s*)$", core)
            if m:
                tail_ws = m.group(1)
                core = core[: len(core) - len(tail_ws)]
            # 末尾逗号
            comma = ""
            if core.endswith(","):
                comma = ","
                core = core[:-1]
            # 现在 core 末尾应为定界引号
            if core.endswith('"'):
                value = core[:-1]
            else:
                # 异常，原样返回
                return line, False
            fixed = fix_value(value)
            newline = indent + prefix + fixed + '"' + comma + tail_ws
            return newline, (fixed != value)
    return line, False

def main():
    changed_total = 0
    for fn in ["data_a.py", "data_b.py", "data_c.py"]:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), fn)
        lines = open(path, encoding="utf-8").read().split("\n")
        new_lines = []
        changed = 0
        for l in lines:
            nl, ch = fix_line(l)
            if ch:
                changed += 1
            new_lines.append(nl)
        open(path, "w", encoding="utf-8").write("\n".join(new_lines))
        print(f"{fn}: 修复 {changed} 行")
        changed_total += changed
    print(f"合计修复 {changed_total} 行")

if __name__ == "__main__":
    main()
