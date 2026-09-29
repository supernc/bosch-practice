#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TCCP 新增题目生成器。
设计目标（规避原题库两大缺陷）：
  1. 正确答案位置随机打散（原库单选答案 A=181/B=44/C=17/D=6 严重失衡）
  2. 正确答案不总是最长选项（原库 86.3% 单选"最长即答案"）
用法：
  每道题以 dict 描述，正确选项文本放入 `correct`，干扰项文本列表放入 `distractors`。
  多选题正确项放 `correct_multi`（list），其余为干扰项。
  脚本负责：打乱选项顺序、分配 A/B/C/D、生成 answer、做防泄题校验、续号 ID、写入 JSON。
"""
import json, random, re, sys, collections, os

random.seed(20260817)  # 固定种子，保证可复现

WIKI = {
 "ch1-arch": "https://angelsnow1129.github.io/TCCPWiki/chapter1/1.1_%E4%BA%91%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%A6%82%E8%AE%BA/",
 "ch2-as": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.2_%E5%BC%B9%E6%80%A7%E4%BC%B8%E7%BC%A9AS%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch2-cdb": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.9_%E4%BA%91%E6%95%B0%E6%8D%AE%E5%BA%93%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch2-cdn": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.6_%E5%86%85%E5%AE%B9%E5%88%86%E5%8F%91%E7%BD%91%E7%BB%9CCDN%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch2-clb": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.5_%E8%B4%9F%E8%BD%BD%E5%9D%87%E8%A1%A1CLB%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch2-cls": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.8_%E6%97%A5%E5%BF%97%E6%9C%8D%E5%8A%A1CLS%E4%BB%8B%E7%BB%8D/",
 "ch2-cvm": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.1_%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8CVM%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch2-domain": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.16_%E5%9F%9F%E5%90%8D%E6%9C%8D%E5%8A%A1%2B%E6%95%B0%E5%AD%97%E8%AF%81%E4%B9%A6%2BSSL/",
 "ch2-micro": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.14_%E5%BE%AE%E6%9C%8D%E5%8A%A1%E6%A6%82%E8%BF%B0%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch2-mq": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.13_%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch2-redis": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.12_%E4%BA%91Redis%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5%2B%E5%85%B6%E4%BB%96NoSQL/",
 "ch2-scf": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.15_Serverless%E4%BA%91%E5%87%BD%E6%95%B0SCF/",
 "ch2-storage": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.7_%E4%BA%91%E5%AD%98%E5%82%A8%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch2-tcop": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.17_%E8%85%BE%E8%AE%AF%E4%BA%91%E5%8F%AF%E8%A7%82%E6%B5%8B%E5%B9%B3%E5%8F%B0/",
 "ch2-tdsql": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.10_%E4%BC%81%E4%B8%9A%E7%BA%A7%E5%88%86%E5%B8%83%E5%BC%8F%E6%95%B0%E6%8D%AE%E5%BA%93TDSQL/",
 "ch2-tdsqlc": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.11_%E4%BA%91%E5%8E%9F%E7%94%9FTDSQL-C%2B%E4%BA%91%E6%95%B0%E6%8D%AE%E5%BA%93Redis/",
 "ch2-tke": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.3_%E5%AE%B9%E5%99%A8%E6%9C%8D%E5%8A%A1TKE%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch2-vpc": "https://angelsnow1129.github.io/TCCPWiki/chapter2/2.4_%E7%A7%81%E6%9C%89%E7%BD%91%E7%BB%9CVPC%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/",
 "ch3-ai": "https://angelsnow1129.github.io/TCCPWiki/chapter3/3.4_AI%E5%92%8C%E5%A4%A7%E6%A8%A1%E5%9E%8B/",
 "ch3-container": "https://angelsnow1129.github.io/TCCPWiki/chapter3/3.3_%E5%BA%94%E7%94%A8%E5%AE%B9%E5%99%A8%E5%8C%96%E6%94%B9%E9%80%A0/",
 "ch3-dr": "https://angelsnow1129.github.io/TCCPWiki/chapter3/3.1_%E4%BA%91%E4%B8%8A%E5%AE%B9%E7%81%BE/",
 "ch3-perf": "https://angelsnow1129.github.io/TCCPWiki/chapter3/3.2_%E4%BA%91%E4%B8%8A%E6%9E%B6%E6%9E%84%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96/",
 "ch4-compute": "https://angelsnow1129.github.io/TCCPWiki/chapter4/4.4_%E6%9E%84%E5%BB%BA%E5%AE%89%E5%85%A8%E8%AE%A1%E7%AE%97%E7%8E%AF%E5%A2%83%E5%8F%8A%E5%AE%89%E5%85%A8%E7%AE%A1%E7%90%86%E4%B8%AD%E5%BF%83/",
 "ch4-mlps": "https://angelsnow1129.github.io/TCCPWiki/chapter4/4.1_%E5%9B%BD%E5%AE%B6%E5%AE%89%E5%85%A8%E7%AD%89%E7%BA%A7%E4%BF%9D%E6%8A%A4/",
 "ch4-network": "https://angelsnow1129.github.io/TCCPWiki/chapter4/4.3_%E6%9E%84%E5%BB%BA%E5%AE%89%E5%85%A8%E9%80%9A%E4%BF%A1%E7%BD%91%E7%BB%9C%E5%8F%8A%E5%AE%89%E5%85%A8%E5%8C%BA%E5%9F%9F%E8%BE%B9%E7%95%8C/",
 "ch4-standard": "https://angelsnow1129.github.io/TCCPWiki/chapter4/4.2_%E4%BA%91%E5%AE%89%E5%85%A8%E4%BD%93%E7%B3%BB%E4%B8%8E%E6%A0%87%E5%87%86/",
 "ch5-cost": "https://angelsnow1129.github.io/TCCPWiki/chapter5/5.3_%E8%BF%81%E7%A7%BB%E6%A1%88%E4%BE%8B%E4%BB%8B%E7%BB%8D%E5%8F%8A%E4%BA%91%E4%B8%8A%E8%B5%84%E6%BA%90%E6%88%90%E6%9C%AC%E7%AE%A1%E7%90%86/",
 "ch5-method": "https://angelsnow1129.github.io/TCCPWiki/chapter5/5.1_%E8%BF%81%E7%A7%BB%E6%96%B9%E6%B3%95%E8%AE%BA%E6%A6%82%E8%BF%B0/",
 "ch5-tools": "https://angelsnow1129.github.io/TCCPWiki/chapter5/5.2_%E4%BA%91%E7%BB%84%E4%BB%B6%E4%B8%8E%E8%BF%81%E7%A7%BB%E5%B7%A5%E5%85%B7/",
}

SUBCH2CHAPTER = {sc: int(sc[2]) for sc in WIKI}  # ch1-.. ->1

LABELS = ["A","B","C","D"]

# 干扰项扩写句池：作为“独立补充分句”接在干扰项之后（以“，”分隔、句末不加标点），
# 目的是消除“正确项显著最长”的泄题特征。刻意做到：
#   1) 每条都能通顺地接在“任意名词短语或完整句”之后（用“，”而非“并/同时”硬连）；
#   2) 中性、具体、不含“唯一/所有/永久/无限/必然”等绝对化词（避免形成新信号）；
#   3) 语义上属于“貌似合理的补充”，不改变干扰项本身的错误属性。
FILLER_POOL = {
    "generic": [
        "这一理解常见于早期资料",
        "在部分场景下也有人这样描述",
        "该说法需结合具体业务判断",
        "这属于容易混淆的一种表述",
        "实践中偶尔会被误用为默认做法",
        "此观点在讨论中时有出现",
        "这是需要重点甄别的说法",
        "该表述与实际配置存在偏差",
        "这一提法缺乏官方文档支撑",
    ],
    "ch2": [
        "这类描述常与产品能力边界相混淆",
        "该说法忽略了地域与可用区的差异",
        "此配置在生产环境中并不推荐",
    ],
    "ch4": [
        "该做法不符合最小权限与纵深防御原则",
        "此说法与等保合规要求存在出入",
        "这类配置会遗留明显的安全敞口",
    ],
    "ch5": [
        "该做法未考虑迁移前的评估与依赖梳理",
        "此说法忽略了回滚预案与停机窗口",
        "这类判断缺乏成本测算作为支撑",
    ],
}

def _filler_for(sc):
    base = list(FILLER_POOL["generic"])
    if sc.startswith("ch2"):
        return FILLER_POOL["ch2"] + base
    if sc.startswith("ch4"):
        return FILLER_POOL["ch4"] + base
    if sc.startswith("ch5"):
        return FILLER_POOL["ch5"] + base
    return base

def balance_lengths(correct_texts, distractors, sc):
    """消除“正确项显著最长”的泄题特征。
    规则（保守，避免制造语法断裂/新信号）：
      - 短选项题（最长正确项 < 22 字）不处理：此时长度差不足以“一眼可辨”；
      - 否则若正确项比最长干扰项长 >5 字，则给最短干扰项追加“，+补充分句”，
        直到最长干扰项长度 >= 最长正确项。补充分句以“，”独立接续，任何前缀都通顺。"""
    max_correct = max(len(t) for t in correct_texts)
    if max_correct < 22:
        return list(distractors)
    if max(len(d) for d in distractors) >= max_correct - 5:
        return list(distractors)
    pool = list(_filler_for(sc))
    random.shuffle(pool)
    pi = 0
    dz = list(distractors)
    guard = 0
    while max(len(d) for d in dz) < max_correct and guard < 8:
        guard += 1
        j = min(range(len(dz)), key=lambda k: len(dz[k]))
        if pi >= len(pool):
            random.shuffle(pool); pi = 0
        add = pool[pi]; pi += 1
        if add in dz[j]:
            continue
        sep = "" if dz[j].endswith(("，", "。", "、")) else "，"
        dz[j] = dz[j] + sep + add
    return dz

def build_question(spec, seq):
    """spec: dict, 见文件顶部说明。seq: 从100起的序号。返回标准 Question dict。"""
    sc = spec["sub"]
    chapter = SUBCH2CHAPTER[sc]
    qtype = spec["type"]
    if qtype == "single":
        correct_texts = [spec["correct"]]
        distractors = spec["distractors"]
        distractors = balance_lengths(correct_texts, distractors, sc)
        all_texts = correct_texts + distractors
        assert len(all_texts) == 4, f"单选必须4项: {spec.get('stem')[:20]}"
    else:
        correct_texts = spec["correct_multi"]
        distractors = spec["distractors"]
        distractors = balance_lengths(correct_texts, distractors, sc)
        all_texts = correct_texts + distractors
        assert len(all_texts) == 4, f"多选必须4项: {spec.get('stem')[:20]}"
    # 打乱顺序
    idx = list(range(4))
    random.shuffle(idx)
    shuffled = [all_texts[i] for i in idx]
    correct_set = set(correct_texts)
    options = []
    answer = []
    for i, text in enumerate(shuffled):
        lab = LABELS[i]
        options.append({"label": lab, "text": text})
        if text in correct_set:
            answer.append(lab)
    answer.sort()
    q = {
        "id": f"{sc}-{seq:03d}",
        "stem": spec["stem"],
        "options": options,
        "answer": answer,
        "type": qtype,
        "chapter": chapter,
        "subChapter": sc,
        "tags": spec["tags"],
        "analysis": spec["analysis"],
        "wikiUrl": WIKI[sc],
        "difficulty": spec["difficulty"],
    }
    return q

def anti_leak_check(questions):
    """校验防泄题指标"""
    singles = [q for q in questions if q["type"]=="single"]
    # 最长即答案
    def longest_is_ans(q):
        opts=q["options"]; mx=max(len(o["text"]) for o in opts)
        longest=[o["label"] for o in opts if len(o["text"])==mx]
        return len(longest)==1 and q["answer"][0] in longest
    hits=sum(1 for q in singles if longest_is_ans(q))
    posc=collections.Counter(q["answer"][0] for q in singles)
    print(f"[新题自检] 单选 {len(singles)} 题, 最长即答案 {hits} ({hits/max(1,len(singles))*100:.1f}%), 答案位置 {dict(sorted(posc.items()))}")
    return hits/max(1,len(singles))
