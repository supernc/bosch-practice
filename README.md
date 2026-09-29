# 博世业务方向 · 学习刷题

围绕博世（Bosch）汽车客户业务方向的**业务侧刷题平台**，帮助系统掌握数据合规、自动驾驶、地图、具身智能、座舱及博世业务代码（XC / CR / BUD / RBCN / RBCC / BEG / AAE）的知识框架。

## 题库

共 **420 题**，7 个领域各 60 题：

| 领域 | 题目文件 | 内容侧重 |
|------|---------|---------|
| 数据合规 | questions-compliance.js | 合规云 vs 公有云、360 环视/哨兵、脱敏、出境评估 |
| 自动驾驶 | questions-autonomous.js | SAE 分级、感知-决策-执行、端到端、数据闭环 |
| 地图 | questions-map.js | 高精/导航地图、测绘资质、去图化、车图云 |
| 具身智能 | questions-embodied.js | VLA、数据采集、仿真、腾讯云具身方案 |
| 座舱 | questions-cockpit.js | 域控制器、舱驾一体、芯片、车手互联 |
| XC 跨域计算 | questions-xc.js | 博世 XC 事业部、高低阶智驾、域控 |
| 博世代码模块 | questions-bosch-code.js | CR/BUD/RBCN/RBCC/BEG/AAE 定位 |

## 功能

- 领域练习 / 随机自测（可选 10/20/30/50 题）
- 收藏、错题本、做题统计（近 7 天趋势 + 按领域正确率）
- CSV 导出（含领域列，Excel 可直接打开）
- 本地持久化（localStorage，刷新不丢）

## 技术栈

纯原生 JavaScript（ES Modules），无构建、无依赖。题目数据按领域拆分到 `questions-*.js`，`questions.js` 为入口汇总。

## 本地运行

```bash
python3 -m http.server 4180
# 浏览器打开 http://localhost:4180/
```

> 因使用 ES Modules，需通过 HTTP 打开，不能直接双击 index.html。

## 更新题目

只需编辑对应领域的 `questions-*.js`（题目结构：`id / chapter / type / question / options / answer / explanation`），推送到 `main` 分支后 GitHub Actions 自动部署。

> 内容基于公司内部知识库与公开法规整理，仅供内部学习参考。
