#!/usr/bin/env python3
"""生成业务场景题库 + 打散旧题选项顺序。

用法：python3 scripts/build_scenario_questions.py

1. 读取 scripts/scenario/ch1..ch7.py 中的 QUESTIONS，生成 src/data/questions/scenario.json
   - id 规则：s{chapter}{序号:02d}，如 s101、s240
   - 选项顺序按固定种子打散，并在单选题间轮转正确答案位置，保证 A/B/C/D 分布均衡
2. 对旧的 chapter1-7.json 做一次性选项重排（原答案几乎全是 A），同样均衡分布
   - 旧题 id 不变，答题记录/错题/收藏不受影响
   - 解析文本里不引用字母，重排安全
3. 输出校验报告
"""
import importlib.util
import json
import random
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QDIR = ROOT / "src" / "data" / "questions"
SDIR = Path(__file__).resolve().parent / "scenario"
sys.path.insert(0, str(SDIR))

SUB = {
    1: "ch1-compliance", 2: "ch2-autonomous", 3: "ch3-map", 4: "ch4-embodied",
    5: "ch5-cockpit", 6: "ch6-xc", 7: "ch7-bosch-code",
}
SCENARIO_SUB = {k: v.replace("ch", "sc", 1) for k, v in SUB.items()}
LABELS = "ABCDE"


def load(ch):
    spec = importlib.util.spec_from_file_location(f"ch{ch}", SDIR / f"ch{ch}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.QUESTIONS


def balanced_positions(rng, n):
    """每 4 个一组随机排列 [0,1,2,3]，保证任意前缀的答案位置都接近均衡。"""
    out = []
    while len(out) < n:
        block = [0, 1, 2, 3]
        rng.shuffle(block)
        out.extend(block)
    return out


def arrange(correct, wrong, rng, target_pos=None):
    """返回 (options, answer_labels)。单选时把正确项放到 target_pos。"""
    items = [(t, True) for t in correct] + [(t, False) for t in wrong]
    rng.shuffle(items)
    if target_pos is not None and len(correct) == 1:
        idx = next(i for i, (_, ok) in enumerate(items) if ok)
        items[idx], items[target_pos] = items[target_pos], items[idx]
    options = [{"label": LABELS[i], "text": t} for i, (t, _) in enumerate(items)]
    answer = [LABELS[i] for i, (_, ok) in enumerate(items) if ok]
    return options, answer


def build_scenario():
    out = []
    for ch in range(1, 8):
        qs = load(ch)
        rng = random.Random(20261009 + ch)
        positions = balanced_positions(rng, 80)
        pi = 0
        stems = set()
        for i, q in enumerate(qs, 1):
            assert q["stem"] not in stems, f"重复题干 ch{ch}: {q['stem'][:30]}"
            stems.add(q["stem"])
            texts = q["correct"] + q["wrong"]
            assert len(set(texts)) == len(texts), f"选项重复 ch{ch}-{i}"
            tp = None
            if q["type"] == "single":
                tp = positions[pi]
                pi += 1
            options, answer = arrange(q["correct"], q["wrong"], rng, tp)
            out.append({
                "id": f"s{ch}{i:02d}",
                "stem": q["stem"],
                "options": options,
                "answer": answer,
                "type": q["type"],
                "chapter": ch,
                "subChapter": SCENARIO_SUB[ch],
                "tags": ["业务场景"] + q["tags"],
                "analysis": q["analysis"],
                "difficulty": q["difficulty"],
            })
    (QDIR / "scenario.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


def reshuffle_legacy():
    """旧题：若某章节单选答案在某一位置占比 ≥40%，则按固定种子重排。幂等：已均衡则跳过。"""
    report = {}
    for ch in range(1, 8):
        p = QDIR / f"chapter{ch}.json"
        data = json.loads(p.read_text(encoding="utf-8"))
        singles = [q for q in data if q["type"] == "single"]
        top_label, top_n = Counter(q["answer"][0] for q in singles).most_common(1)[0]
        a_ratio = top_n / max(1, len(singles))
        if a_ratio < 0.4:
            report[ch] = "已均衡，跳过"
            continue
        rng = random.Random(9000 + ch)
        positions = balanced_positions(rng, 80)
        pi = 0
        for q in data:
            by_label = {o["label"]: o["text"] for o in q["options"]}
            correct = [by_label[a] for a in q["answer"]]
            wrong = [o["text"] for o in q["options"] if o["label"] not in q["answer"]]
            tp = None
            if q["type"] == "single" and len(q["options"]) == 4:
                tp = positions[pi]
                pi += 1
            q["options"], q["answer"] = arrange(correct, wrong, rng, tp)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report[ch] = f"原 {top_label} 占比 {a_ratio:.0%} → 已重排"
    return report


def main():
    legacy = reshuffle_legacy()
    sc = build_scenario()
    print("== 旧题重排 ==")
    for ch, msg in legacy.items():
        print(f"  ch{ch}: {msg}")
    print("== 场景题 ==")
    for ch in range(1, 8):
        qs = [q for q in sc if q["chapter"] == ch]
        sg = [q for q in qs if q["type"] == "single"]
        dist = Counter(q["answer"][0] for q in sg)
        seq = sum("→" in q["options"][0]["text"] for q in qs)
        print(f"  ch{ch}: {len(qs)} 题（单选 {len(sg)} / 多选 {len(qs)-len(sg)}，排序题 {seq}），单选答案分布 {dict(sorted(dist.items()))}")
    print(f"  合计 {len(sc)} 题 → {QDIR / 'scenario.json'}")


if __name__ == "__main__":
    main()
