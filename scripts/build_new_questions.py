#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""主入口：加载 data_a/b/c，生成标准题目，续号 ID，防泄题校验，写入各章节 JSON。"""
import json, os, sys, collections, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_questions import build_question, anti_leak_check, LABELS
from data_a import DATA_A
from data_b import DATA_B
from data_c import DATA_C

ALL_SPECS = DATA_A + DATA_B + DATA_C
QDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "questions")
QDIR = os.path.normpath(QDIR)

# 新题 ID 序号从 100 起，彻底避开现有 max(现有最大约 25)
START_SEQ = 100

def main():
    # 读取现有各章节，收集已用 ID
    chapter_files = {1:"chapter1.json",2:"chapter2.json",3:"chapter3.json",4:"chapter4.json",5:"chapter5.json"}
    existing = {}
    used_ids = set()
    for ch, fn in chapter_files.items():
        data = json.load(open(os.path.join(QDIR, fn), encoding="utf-8"))
        existing[ch] = data
        for q in data:
            used_ids.add(q["id"])

    # 按子章节分配递增序号
    seq_counter = collections.defaultdict(lambda: START_SEQ)
    new_questions = []
    for spec in ALL_SPECS:
        sc = spec["sub"]
        # 找一个不冲突的序号
        while True:
            seq = seq_counter[sc]
            seq_counter[sc] += 1
            qid = f"{sc}-{seq:03d}"
            if qid not in used_ids:
                used_ids.add(qid)
                break
        q = build_question(spec, seq)
        new_questions.append(q)

    print(f"共生成新题: {len(new_questions)}")

    # 防泄题自检
    ratio = anti_leak_check(new_questions)

    # 校验字段完整性 & 答案合法性
    errors = []
    for q in new_questions:
        labels = [o["label"] for o in q["options"]]
        if sorted(labels) != ["A","B","C","D"]:
            errors.append(f"{q['id']} 选项标签异常: {labels}")
        if not q["answer"]:
            errors.append(f"{q['id']} 答案为空")
        for a in q["answer"]:
            if a not in labels:
                errors.append(f"{q['id']} 答案 {a} 不在选项中")
        if q["type"]=="single" and len(q["answer"])!=1:
            errors.append(f"{q['id']} 单选答案数!=1: {q['answer']}")
        if q["type"]=="multiple" and len(q["answer"])<2:
            errors.append(f"{q['id']} 多选答案数<2: {q['answer']}")
        for field in ["stem","analysis","tags","wikiUrl","difficulty","chapter","subChapter"]:
            if not q.get(field) and q.get(field)!=0:
                errors.append(f"{q['id']} 缺字段 {field}")
        if len(q["stem"])<8:
            errors.append(f"{q['id']} 题干过短")
        if len(q["analysis"])<20:
            errors.append(f"{q['id']} 解析过短")
    if errors:
        print("!!! 校验错误 !!!")
        for e in errors[:50]:
            print("  ", e)
        sys.exit(1)
    print("字段/答案校验: 全部通过")

    # 按章节归类写回
    added_per_ch = collections.Counter()
    for q in new_questions:
        existing[q["chapter"]].append(q)
        added_per_ch[q["chapter"]] += 1

    for ch, fn in chapter_files.items():
        path = os.path.join(QDIR, fn)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(existing[ch], f, ensure_ascii=False, indent=2)
        print(f"  写入 {fn}: +{added_per_ch[ch]} 题, 现共 {len(existing[ch])} 题")

    # 总体分布
    total = sum(len(v) for v in existing.values())
    print(f"\n理论题总数(ch1-5): {total}")

if __name__ == "__main__":
    main()
