// 博世业务方向题库 · 入口
// 各领域题目分别存于 questions-*.js，此处汇总导出。
// 领域映射见 app.js 顶部 DOMAINS：1=数据合规 2=自动驾驶 3=地图 4=具身智能 5=座舱 6=XC跨域计算 7=博世代码模块
import COMPLIANCE_QUESTIONS from './questions-compliance.js';
import AUTONOMOUS_QUESTIONS from './questions-autonomous.js';
import MAP_QUESTIONS from './questions-map.js';
import EMBODIED_QUESTIONS from './questions-embodied.js';
import COCKPIT_QUESTIONS from './questions-cockpit.js';
import XC_QUESTIONS from './questions-xc.js';
import BOSCH_CODE_QUESTIONS from './questions-bosch-code.js';

const BOSCH_QUESTIONS = [
  ...COMPLIANCE_QUESTIONS,
  ...AUTONOMOUS_QUESTIONS,
  ...MAP_QUESTIONS,
  ...EMBODIED_QUESTIONS,
  ...COCKPIT_QUESTIONS,
  ...XC_QUESTIONS,
  ...BOSCH_CODE_QUESTIONS,
];

export default BOSCH_QUESTIONS;
