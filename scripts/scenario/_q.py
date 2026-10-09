"""场景题定义辅助函数。

S(...)  单选：ans 为正确项文本，wrong 为 3 个干扰项
M(...)  多选：ans 为正确项文本列表，wrong 为干扰项列表（总选项 4~5 个）

选项顺序由 build_scenario_questions.py 统一打散并均衡答案位置，
编写时正确项写在前面即可，不要在解析里引用 A/B/C/D 字母。
"""


def S(stem, ans, wrong, analysis, tags, d=2):
    assert len(wrong) == 3, stem
    return dict(type="single", stem=stem, correct=[ans], wrong=list(wrong),
                analysis=analysis, tags=list(tags), difficulty=d)


def M(stem, ans, wrong, analysis, tags, d=3):
    assert len(ans) >= 2 and 4 <= len(ans) + len(wrong) <= 5, stem
    return dict(type="multiple", stem=stem, correct=list(ans), wrong=list(wrong),
                analysis=analysis, tags=list(tags), difficulty=d)
