import { ChapterInfo } from '../types';

// 博世业务方向 7 大领域（替代原 TCCP 5 章节）
export const chapters: ChapterInfo[] = [
  {
    id: 1,
    name: '数据合规',
    description: '合规云 vs 公有云、脱敏/匿名化、数据出境、汽车数据法规',
    weight: 14,
    wikiUrl: '',
    subChapters: [
      { id: 'ch1-compliance', name: '概念基础', wikiUrl: '' },
      { id: 'sc1-compliance', name: '业务场景题（腾讯智慧出行产品）', wikiUrl: '' },
    ],
  },
  {
    id: 2,
    name: '自动驾驶',
    description: 'SAE 分级、感知-决策-执行、端到端、数据闭环',
    weight: 14,
    wikiUrl: '',
    subChapters: [
      { id: 'ch2-autonomous', name: '概念基础', wikiUrl: '' },
      { id: 'sc2-autonomous', name: '业务场景题（腾讯智慧出行产品）', wikiUrl: '' },
    ],
  },
  {
    id: 3,
    name: '地图',
    description: '高精/导航地图、测绘资质、去图化、车图云',
    weight: 14,
    wikiUrl: '',
    subChapters: [
      { id: 'ch3-map', name: '概念基础', wikiUrl: '' },
      { id: 'sc3-map', name: '业务场景题（腾讯智慧出行产品）', wikiUrl: '' },
    ],
  },
  {
    id: 4,
    name: '具身智能',
    description: 'VLA 模型、数据采集、仿真、腾讯云具身方案',
    weight: 14,
    wikiUrl: '',
    subChapters: [
      { id: 'ch4-embodied', name: '概念基础', wikiUrl: '' },
      { id: 'sc4-embodied', name: '业务场景题（腾讯智慧出行产品）', wikiUrl: '' },
    ],
  },
  {
    id: 5,
    name: '座舱',
    description: '座舱域控制器、舱驾一体、芯片、车手互联',
    weight: 14,
    wikiUrl: '',
    subChapters: [
      { id: 'ch5-cockpit', name: '概念基础', wikiUrl: '' },
      { id: 'sc5-cockpit', name: '业务场景题（腾讯智慧出行产品）', wikiUrl: '' },
    ],
  },
  {
    id: 6,
    name: 'XC 跨域计算',
    description: '博世 XC 事业部、高阶/低阶智驾、域控制器',
    weight: 15,
    wikiUrl: '',
    subChapters: [
      { id: 'ch6-xc', name: '概念基础', wikiUrl: '' },
      { id: 'sc6-xc', name: '业务场景题（腾讯智慧出行产品）', wikiUrl: '' },
    ],
  },
  {
    id: 7,
    name: '博世代码模块',
    description: 'CR / BUD / RBCN / RBCC / BEG / AAE 业务定位',
    weight: 15,
    wikiUrl: '',
    subChapters: [
      { id: 'ch7-bosch-code', name: '概念基础', wikiUrl: '' },
      { id: 'sc7-bosch-code', name: '业务场景题（腾讯智慧出行产品）', wikiUrl: '' },
    ],
  },
];

export default chapters;
