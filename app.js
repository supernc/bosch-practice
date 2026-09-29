import BOSCH_QUESTIONS from './questions.js';

// lucide 图标库 fallback：CDN 加载失败时不白屏（仅图标不渲染，文字内容正常）
if (typeof lucide === 'undefined') {
  window.lucide = { createIcons() {} };
}

// 领域映射（chapter 数字 -> 领域名）
const DOMAINS = {
  1: '数据合规',
  2: '自动驾驶',
  3: '地图',
  4: '具身智能',
  5: '座舱',
  6: 'XC 跨域计算',
  7: '博世代码模块',
};

class App {
  constructor() {
    this.container = document.getElementById('app-content');
    this.navItems = document.querySelectorAll('.nav-item');
    this.favorites = JSON.parse(localStorage.getItem('bosch_favs') || '[]');
    this.currentView = 'home';
    this.examState = {
      active: false,
      questions: [],
      currentIndex: 0,
      userAnswers: {},
      startTime: null,
      timerInterval: null,
      submitted: false
    };
    this.practiceState = {
      active: false,
      questions: [],
      currentIndex: 0,
      userAnswers: {},
      answerStatus: {}, // 'correct', 'wrong', 'unanswered'
      submitted: false
    };
    this.notes = JSON.parse(localStorage.getItem('bosch_notes') || '{}'); // 题目备注
    this.wrongQuestions = JSON.parse(localStorage.getItem('bosch_wrong') || '[]'); // 错题 id 数组
    this.stats = JSON.parse(localStorage.getItem('bosch_stats') || '{}'); // 做题统计
    if (!this.stats.byDomain) this.stats.byDomain = {};
    if (!this.stats.daily) this.stats.daily = {};
    if (!this.stats.totalAnswered) this.stats.totalAnswered = 0;
    if (!this.stats.totalCorrect) this.stats.totalCorrect = 0;

    this.init();
  }

  init() {
    // Navigation
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        this.navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.currentView = item.id.replace('nav-', '');
        this.render();
      });
    });

    // Theme toggle
    const themeBtn = document.getElementById('theme-btn');
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      themeBtn.innerHTML = `<i data-lucide="${newTheme === 'dark' ? 'sun' : 'moon'}"></i>`;
      lucide.createIcons();
    });

    this.render();
  }

  render() {
    // Clear interval if leaving exam
    if (this.currentView !== 'exam' && this.examState.timerInterval) {
      clearInterval(this.examState.timerInterval);
    }

    switch(this.currentView) {
      case 'home': this.renderHome(); break;
      case 'chapters': this.renderChapters(); break;
      case 'exam': this.renderExam(); break;
      case 'favs': this.renderFavs(); break;
      case 'wrong': this.renderWrong(); break;
      case 'stats': this.renderStats(); break;
    }
    lucide.createIcons();
  }

  renderHome() {
    this.container.innerHTML = `
      <div class="card">
        <h1>博世业务方向 · 学习刷题</h1>
        <p>围绕自动驾驶、地图、具身智能、座舱与博世业务代码（XC / 脱敏等）的<b>业务侧</b>题库，重点覆盖数据合规（合规云 vs 公有云、脱敏、出境）等实战决策场景。</p>
        <div class="grid-chapters mt-4">
          <div class="chapter-card" onclick="window.app.startChapter(0)">
            <h3>全部题目</h3>
            <p>包含所有领域的练习题，共 ${BOSCH_QUESTIONS.length} 题。</p>
          </div>
          <div class="chapter-card" onclick="window.app.currentView='exam'; window.app.render();">
            <h3>随机自测</h3>
            <p>随机抽取 20 题限时作答，检验掌握程度。</p>
          </div>
          <div class="chapter-card" onclick="window.app.currentView='favs'; window.app.render();">
            <h3>收藏 / 重点</h3>
            <p>查看标记的重点题目，查漏补缺。</p>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>学习要点</h3>
        <ul style="padding-left: 20px; color: var(--text-secondary);">
          <li>数据合规：敏感个人信息 / 重要数据分级，境内存储与出境评估</li>
          <li>合规云 vs 公有云：什么数据能上公有云，什么必须进专有云</li>
          <li>脱敏处理：360 环视 / 哨兵模式等人脸车牌视频的匿名化</li>
          <li>自动驾驶 / 地图 / 具身智能 / 座舱：业务逻辑与腾讯云切入点</li>
          <li>博世代码：XC、CR、BUD、RBCN、RBCC、BEG、AAE 的业务定位</li>
        </ul>
      </div>
    `;
  }

  renderChapters() {
    const chapters = [
      { id: 1, name: '数据合规', desc: '合规云 vs 公有云 · 脱敏 · 出境评估' },
      { id: 2, name: '自动驾驶', desc: '智驾分级 · 数据闭环 · 端到端' },
      { id: 3, name: '地图', desc: '高精地图 · 测绘资质 · 去图化' },
      { id: 4, name: '具身智能', desc: 'VLA · 数据采集 · 仿真' },
      { id: 5, name: '座舱', desc: '域控制器 · 舱驾一体 · 车手互联' },
      { id: 6, name: 'XC 跨域计算', desc: '高阶/低阶智驾 · 博世核心事业部' },
      { id: 7, name: '博世代码模块', desc: 'CR / BUD / RBCN / RBCC / BEG / AAE' },
    ];

    this.container.innerHTML = `
      <h1>领域练习</h1>
      <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">按业务领域刷题，每题即时判分并附业务侧解析。</p>
      <div class="grid-chapters">
        ${chapters.map(c => {
          const count = BOSCH_QUESTIONS.filter(q => q.chapter === c.id).length;
          return `
            <div class="chapter-card" onclick="window.app.startChapter(${c.id})">
              <h3>${c.name}</h3>
              <p>${c.desc}</p>
              <p style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--primary); font-weight: 600;">${count} 题</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
    lucide.createIcons();
  }

  startChapter(chapterId) {
    const questions = chapterId === 0 ? BOSCH_QUESTIONS : BOSCH_QUESTIONS.filter(q => q.chapter === chapterId);
    const title = chapterId === 0 ? '全部练习' : (DOMAINS[chapterId] || `领域 ${chapterId}`) + ' · 练习';
    this.renderQuestionList(questions, title);
  }

  renderQuestionList(questions, title) {
    this.container.innerHTML = `
      <div class="flex justify-between items-center">
        <h2>${title} (${questions.length} 题)</h2>
        <button class="btn btn-outline" onclick="window.app.render()"><i data-lucide="arrow-left"></i> 返回</button>
      </div>
      <div id="questions-container">
        ${questions.map(q => this.createQuestionHTML(q)).join('')}
      </div>
    `;
    lucide.createIcons();
  }

  createQuestionHTML(q, showAnswer = false) {
    const isFav = this.favorites.some(fav => fav.id === q.id);
    const optionExplanations = q.optionExplanations || {};
    
    return `
      <div class="card question-card" id="q-${q.id}">
        <div class="flex justify-between">
          <span class="badge badge-blue">${q.type === 'single' ? '单选题' : '多选题'}</span>
          <button class="collect-btn ${isFav ? 'active' : ''}" onclick="window.app.toggleFav(${q.id})">
            <i data-lucide="star" fill="${isFav ? 'currentColor' : 'none'}"></i>
          </button>
        </div>
        <p class="mt-4" style="font-size: 1.1rem; font-weight: 500;">${q.question}</p>
        <div class="options-container">
          ${q.options.map(opt => {
            const letter = opt.charAt(0);
            return `
              <div class="option" onclick="window.app.checkAnswer(${q.id}, '${letter}')" data-letter="${letter}">
                ${opt}
              </div>
            `;
          }).join('')}
        </div>
        <div class="explanation-box hidden" id="exp-${q.id}">
          <p><strong>正确答案：</strong> ${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</p>
          <p class="mt-2"><strong>整体解析：</strong> ${q.explanation}</p>
          ${Object.keys(optionExplanations).length > 0 ? `
            <div class="mt-3" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
              <p><strong>各选项解析：</strong></p>
              ${Object.entries(optionExplanations).map(([key, exp]) => `
                <p style="margin-top: 0.5rem;"><strong>${key}.</strong> ${exp}</p>
              `).join('')}
            </div>
          ` : ''}
        </div>
        ${this.getNoteHTML(q.id)}
      </div>
    `;
  }

  checkAnswer(questionId, selectedLetter) {
    const q = BOSCH_QUESTIONS.find(item => item.id === questionId);
    const card = document.getElementById(`q-${questionId}`);
    const exp = document.getElementById(`exp-${questionId}`);
    const options = card.querySelectorAll('.option');

    if (card.dataset.answered === 'true') return; // 已判分，防止重复记录
    card.dataset.answered = 'true';

    if (q.type === 'single') {
      options.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'wrong');
        const letter = opt.getAttribute('data-letter');
        if (letter === q.answer) {
          opt.classList.add('correct');
        } else if (letter === selectedLetter) {
          opt.classList.add('wrong');
        }
      });
      exp.classList.remove('hidden');
      this.recordAnswer(q, selectedLetter === q.answer);
    } else {
      // Multiple choice logic (simplified for demo)
      const clicked = card.querySelector(`[data-letter="${selectedLetter}"]`);
      clicked.classList.toggle('selected');
      
      // Add a 'Confirm' button if not present
      if (!card.querySelector('.btn-confirm')) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary btn-confirm mt-4';
        btn.innerText = '确认提交';
        btn.onclick = () => {
          const selected = Array.from(card.querySelectorAll('.option.selected')).map(o => o.getAttribute('data-letter'));
          options.forEach(opt => {
            const letter = opt.getAttribute('data-letter');
            if (q.answer.includes(letter)) opt.classList.add('correct');
            else if (selected.includes(letter)) opt.classList.add('wrong');
          });
          exp.classList.remove('hidden');
          btn.remove();
          const isCorrect = selected.length === q.answer.length && selected.every(v => q.answer.includes(v));
          this.recordAnswer(q, isCorrect);
        };
        card.appendChild(btn);
      }
    }
  }

  // 统一记录：错题 + 做题统计
  recordAnswer(q, isCorrect) {
    if (!isCorrect && !this.wrongQuestions.includes(q.id)) {
      this.wrongQuestions.push(q.id);
      localStorage.setItem('bosch_wrong', JSON.stringify(this.wrongQuestions));
    }
    this.stats.totalAnswered += 1;
    if (isCorrect) this.stats.totalCorrect += 1;
    const dk = q.chapter;
    this.stats.byDomain[dk] = this.stats.byDomain[dk] || { answered: 0, correct: 0 };
    this.stats.byDomain[dk].answered += 1;
    if (isCorrect) this.stats.byDomain[dk].correct += 1;
    const today = new Date().toISOString().split('T')[0];
    this.stats.daily[today] = this.stats.daily[today] || { answered: 0, correct: 0 };
    this.stats.daily[today].answered += 1;
    if (isCorrect) this.stats.daily[today].correct += 1;
    localStorage.setItem('bosch_stats', JSON.stringify(this.stats));
  }

  toggleFav(id) {
    // 查找题目（从所有来源）
    let question = BOSCH_QUESTIONS.find(q => q.id === id);
    if (!question && this.practiceState.active) {
      question = this.practiceState.questions.find(q => q.id === id);
    }
    if (!question && this.examState.active) {
      question = this.examState.questions.find(q => q.id === id);
    }

    const index = this.favorites.findIndex(fav => fav.id === id);
    if (index > -1) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(question);
    }
    localStorage.setItem('bosch_favs', JSON.stringify(this.favorites));
    this.render();
  }

  renderFavs() {
    if (this.favorites.length === 0) {
      this.container.innerHTML = `
        <div class="card" style="text-align: center; padding: 4rem;">
          <div style="width: 60px; height: 60px; margin: 0 auto 1.5rem; background: rgba(255, 180, 0, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="star" style="width: 32px; height: 32px; color: #ffb400;"></i>
          </div>
          <h2 style="margin-bottom: 1rem;">暂无收藏题目</h2>
          <p style="color: var(--text-secondary);">在练习时点击星标即可收藏重点题目</p>
          <button class="btn btn-primary mt-4" onclick="window.app.currentView='chapters'; window.app.render();">
            <i data-lucide="book-open"></i> 去练习
          </button>
        </div>
      `;
      lucide.createIcons();
    } else {
      this.container.innerHTML = `
        <div class="favorites-header">
          <div class="favorites-title">
            <div class="favorites-icon">
              <i data-lucide="bookmark"></i>
            </div>
            <div>
              <h1>我的收藏</h1>
              <p>共 ${this.favorites.length} 个收藏题目（已持久化保存）</p>
            </div>
          </div>
          <div class="favorites-actions">
            <button class="btn btn-outline" onclick="window.app.exportFavorites()">
              <i data-lucide="download"></i> 导出 Excel (CSV)
            </button>
            <button class="btn btn-primary" onclick="window.app.startFavPractice()">
              <i data-lucide="play"></i> 开始收藏练习
            </button>
          </div>
        </div>
        <div class="favorites-list">
          ${this.favorites.map((q, idx) => this.createFavQuestionCard(q, idx)).join('')}
        </div>
      `;
      lucide.createIcons();
    }
  }

  createFavQuestionCard(q, index) {
    const badges = [
      { text: q.type === 'single' ? '单选题' : '多选题', color: 'blue' },
      { text: `${DOMAINS[q.chapter] || '领域 ' + q.chapter}`, color: 'gray' }
    ];
    
    return `
      <div class="fav-question-card">
        <div class="fav-question-header">
          <div class="fav-badges">
            ${badges.map(b => `<span class="badge badge-${b.color}">${b.text}</span>`).join('')}
          </div>
          <button class="collect-btn active" onclick="window.app.toggleFav(${q.id}); event.stopPropagation();">
            <i data-lucide="star" fill="currentColor"></i>
          </button>
        </div>
        <div class="fav-question-content">
          <div class="fav-question-text">${q.question}</div>
          <div class="fav-options-preview">
            ${q.options.slice(0, 2).map(opt => `
              <div class="fav-option-item">${opt}</div>
            `).join('')}
            ${q.options.length > 2 ? `<div class="fav-option-more">+${q.options.length - 2} 个选项</div>` : ''}
          </div>
        </div>
        <div class="fav-question-footer">
          <button class="btn-text" onclick="window.app.showFavQuestionDetail(${index})">
            <i data-lucide="eye"></i> 查看解析与知识点回顾
          </button>
        </div>
      </div>
    `;
  }

  showFavQuestionDetail(index) {
    this.showQuestionDetail(this.favorites[index]);
  }

  // 通用题目详情 modal（收藏/错题共用）
  showQuestionDetail(q) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <span class="badge badge-blue">${q.type === 'single' ? '单选题' : '多选题'}</span>
            <span class="badge badge-gray">${DOMAINS[q.chapter] || '领域 ' + q.chapter}</span>
          </div>
          <button class="btn-icon" onclick="this.closest('.modal-overlay').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <h3 class="question-title">${q.question}</h3>
          <div class="options-container">
            ${q.options.map(opt => {
              const letter = opt.charAt(0);
              const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
              const isCorrect = correctAns.includes(letter);
              return `
                <div class="option ${isCorrect ? 'correct' : ''}" style="cursor: default;">
                  ${opt}
                  ${isCorrect ? '<i data-lucide="check-circle" style="margin-left: auto; color: var(--success);"></i>' : ''}
                </div>
              `;
            }).join('')}
          </div>
          <div class="explanation-box" style="display: block;">
            <div class="explanation-header">
              <i data-lucide="lightbulb"></i>
              <span>选项解析与知识点回顾</span>
            </div>
            <p><strong>正确答案：</strong> ${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</p>
            <p class="mt-2"><strong>【正确项解析】：</strong>${q.explanation}</p>
            ${q.optionExplanations ? `
              <div class="mt-3" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                ${Object.entries(q.optionExplanations).map(([key, exp]) => {
                  const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
                  const isCorrect = correctAns.includes(key);
                  return `
                    <p style="margin-top: 0.75rem; padding: 0.75rem; background: ${isCorrect ? 'rgba(0, 180, 42, 0.05)' : 'rgba(245, 63, 63, 0.05)'}; border-radius: 8px;">
                      <strong>${key}.</strong> ${exp}
                    </p>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
    
    // 点击遮罩关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  startFavPractice() {
    if (this.favorites.length === 0) {
      alert('暂无收藏题目');
      return;
    }
    // 打乱题目顺序
    const shuffled = [...this.favorites].sort(() => Math.random() - 0.5);
    this.practiceState = {
      active: true,
      questions: shuffled,
      currentIndex: 0,
      userAnswers: {},
      answerStatus: {},
      submitted: false,
      title: '收藏题目练习',
      mode: 'exam' // 整卷提交模式
    };
    this.renderPracticeInterface();
  }

  exportFavorites() {
    if (this.favorites.length === 0) {
      alert('暂无收藏题目');
      return;
    }
    this.exportQuestionList(this.favorites, '博世收藏题目');
  }

  exportQuestionList(list, filename) {
    // 生成 CSV 格式（Excel 可打开）
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += '题号,领域,题型,题目,选项A,选项B,选项C,选项D,正确答案,整体解析,选项A解析,选项B解析,选项C解析,选项D解析\n';

    list.forEach((q, idx) => {
      const escapeCSV = (str) => `"${String(str).replace(/"/g, '""')}"`;
      const opts = ['', '', '', ''];
      q.options.forEach(opt => {
        const letter = opt.charAt(0);
        const index = letter.charCodeAt(0) - 65; // A=0, B=1...
        opts[index] = opt.substring(3);
      });
      
      const optExps = q.optionExplanations || {};
      
      csv += [
        idx + 1,
        DOMAINS[q.chapter] || '',
        q.type === 'single' ? '单选' : '多选',
        escapeCSV(q.question),
        escapeCSV(opts[0]),
        escapeCSV(opts[1]),
        escapeCSV(opts[2]),
        escapeCSV(opts[3]),
        escapeCSV(Array.isArray(q.answer) ? q.answer.join(',') : q.answer),
        escapeCSV(q.explanation),
        escapeCSV(optExps.A || ''),
        escapeCSV(optExps.B || ''),
        escapeCSV(optExps.C || ''),
        escapeCSV(optExps.D || '')
      ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  renderExam() {
    if (!this.examState.active) {
      if (!this.examCount) this.examCount = 20;
      const countOptions = [10, 20, 30, 50];
      this.container.innerHTML = `
        <div class="card" style="text-align: center;">
          <h1>随机自测</h1>
          <div class="exam-stats">
            <div class="stat-item">
              <div class="value">${this.examCount}</div>
              <div class="label">题量</div>
            </div>
            <div class="stat-item">
              <div class="value">${Math.ceil(this.examCount * 1.5)}</div>
              <div class="label">时间 (分钟)</div>
            </div>
            <div class="stat-item">
              <div class="value">60%</div>
              <div class="label">及格线</div>
            </div>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <p style="color: var(--text-secondary); margin-bottom: 0.75rem;">选择题量</p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              ${countOptions.map(c => `
                <button class="btn ${this.examCount === c ? 'btn-primary' : 'btn-outline'}" onclick="window.app.examCount=${c}; window.app.renderExam()">${c} 题</button>
              `).join('')}
            </div>
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">随机抽取题目，计时开始后中途离开不保存进度。</p>
          <button class="btn btn-primary btn-lg" onclick="window.app.startExam()">开始自测</button>
        </div>
      `;
    } else {
      this.renderExamInterface();
    }
  }

  startExam() {
    const count = Math.min(this.examCount || 20, BOSCH_QUESTIONS.length);
    this.examState = {
      active: true,
      questions: [...BOSCH_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, count),
      currentIndex: 0,
      userAnswers: {},
      answerStatus: {},
      startTime: Date.now(),
      timeLeft: count * 90, // 每题 1.5 分钟
      submitted: false
    };

    this.examState.timerInterval = setInterval(() => {
      this.examState.timeLeft--;
      const timerEl = document.getElementById('exam-timer');
      if (timerEl) {
        const mins = Math.floor(this.examState.timeLeft / 60);
        const secs = this.examState.timeLeft % 60;
        timerEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      if (this.examState.timeLeft <= 0) {
        this.submitExam();
      }
    }, 1000);

    // 将考试模式转换为练习模式的格式
    this.practiceState = {
      active: true,
      questions: this.examState.questions,
      currentIndex: 0,
      userAnswers: this.examState.userAnswers,
      answerStatus: this.examState.answerStatus,
      submitted: false,
      title: '模拟考试',
      mode: 'exam',
      isExam: true,
      timeLeft: this.examState.timeLeft,
      timerInterval: this.examState.timerInterval
    };

    this.renderExamPracticeInterface();
  }

  renderExamPracticeInterface() {
    const q = this.practiceState.questions[this.practiceState.currentIndex];
    const total = this.practiceState.questions.length;
    const current = this.practiceState.currentIndex + 1;
    const answeredCount = Object.keys(this.practiceState.userAnswers).filter(id => 
      this.practiceState.userAnswers[id] && this.practiceState.userAnswers[id].length > 0
    ).length;

    const sidebarHTML = `
      <div class="practice-sidebar">
        <div class="exam-timer-display" id="exam-timer-display">
          <i data-lucide="clock"></i>
          <span id="exam-timer">30:00</span>
        </div>
        <h3 style="margin: 1rem 0;">题目导航</h3>
        <div class="question-nav-grid">
          ${this.practiceState.questions.map((question, idx) => {
            const hasAnswer = this.practiceState.userAnswers[question.id]?.length > 0;
            const status = this.practiceState.answerStatus[question.id];
            let className = 'question-nav-item';
            if (idx === this.practiceState.currentIndex) className += ' active';
            if (this.practiceState.submitted) {
              if (status === 'correct') className += ' correct';
              else if (status === 'wrong') className += ' wrong';
            } else if (hasAnswer) {
              className += ' answered';
            }
            
            return `
              <div class="${className}" onclick="window.app.jumpToExamQuestion(${idx})">
                ${idx + 1}
              </div>
            `;
          }).join('')}
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(0, 82, 217, 0.05); border-radius: 8px;">
          <p style="font-size: 0.9rem; color: var(--text-secondary); text-align: center;">
            已答 <strong style="color: var(--primary);">${answeredCount}</strong> / ${total} 题
          </p>
        </div>
        ${this.practiceState.submitted ? '' : `
          <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" 
            onclick="window.app.submitExam()">
            <i data-lucide="check"></i> 提交试卷
          </button>
        `}
      </div>
    `;

    const mainHTML = `
      <div class="practice-main">
        <div class="flex justify-between items-center mb-4">
          <h2>模拟考试 (${current}/${total})</h2>
          <button class="btn btn-outline" onclick="window.app.exitExam()">
            <i data-lucide="x"></i> ${this.practiceState.submitted ? '退出' : '放弃考试'}
          </button>
        </div>
        <div class="card">
          <span class="badge badge-blue">${q.type === 'single' ? '单选题' : '多选题'}</span>
          <p class="mt-4" style="font-size: 1.2rem; font-weight: 500;">${q.question}</p>
          <div class="options-container">
            ${q.options.map(opt => {
              const letter = opt.charAt(0);
              const userAns = this.practiceState.userAnswers[q.id] || [];
              const isSelected = userAns.includes(letter);
              const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
              
              let className = 'option';
              if (this.practiceState.submitted) {
                if (correctAns.includes(letter)) className += ' correct';
                else if (isSelected) className += ' wrong';
              } else if (isSelected) {
                className += ' selected';
              }
              
              return `
                <div class="${className}" onclick="window.app.selectExamAnswer('${letter}')" data-letter="${letter}">
                  ${opt}
                  ${this.practiceState.submitted && correctAns.includes(letter) ? '<i data-lucide="check-circle" style="margin-left: auto;"></i>' : ''}
                </div>
              `;
            }).join('')}
          </div>
          ${this.practiceState.submitted ? `
            <div class="explanation-box">
              <div class="explanation-header">
                <i data-lucide="lightbulb"></i>
                <span>选项解析与知识点回顾</span>
              </div>
              <p><strong>你的答案：</strong> ${(this.practiceState.userAnswers[q.id] || []).join(', ') || '未作答'}</p>
              <p><strong>正确答案：</strong> ${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</p>
              <p class="mt-2"><strong>【正确项解析】：</strong>${q.explanation}</p>
              ${q.optionExplanations ? `
                <div class="mt-3" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                  ${Object.entries(q.optionExplanations).map(([key, exp]) => {
                    const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
                    const isCorrectOpt = correctAns.includes(key);
                    return `
                      <p style="margin-top: 0.75rem; padding: 0.75rem; background: ${isCorrectOpt ? 'rgba(0, 180, 42, 0.05)' : 'rgba(245, 63, 63, 0.05)'}; border-radius: 8px;">
                        <strong>${key}.</strong> ${exp}
                      </p>
                    `;
                  }).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${this.getNoteHTML(q.id)}
        </div>
        <div class="flex justify-between mt-4">
          <button class="btn btn-outline" onclick="window.app.prevExamQuestion()" ${current === 1 ? 'disabled' : ''}>
            <i data-lucide="arrow-left"></i> 上一题
          </button>
          <button class="btn btn-outline" onclick="window.app.nextExamQuestion()" ${current === total ? 'disabled' : ''}>
            下一题 <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = `
      <div class="practice-container">
        ${sidebarHTML}
        ${mainHTML}
      </div>
    `;
    lucide.createIcons();
  }

  jumpToExamQuestion(index) {
    this.practiceState.currentIndex = index;
    this.renderExamPracticeInterface();
  }

  nextExamQuestion() {
    if (this.practiceState.currentIndex < this.practiceState.questions.length - 1) {
      this.practiceState.currentIndex++;
      this.renderExamPracticeInterface();
    }
  }

  prevExamQuestion() {
    if (this.practiceState.currentIndex > 0) {
      this.practiceState.currentIndex--;
      this.renderExamPracticeInterface();
    }
  }

  exitExam() {
    if (this.practiceState.timerInterval) {
      clearInterval(this.practiceState.timerInterval);
    }
    this.practiceState.active = false;
    this.examState.active = false;
    this.currentView = 'home';
    this.render();
  }

  renderExamInterface() {
    const q = this.examState.questions[this.examState.currentIndex];
    const total = this.examState.questions.length;
    const current = this.examState.currentIndex + 1;

    // 计算已答题数量
    const answeredCount = Object.keys(this.examState.userAnswers).filter(id => 
      this.examState.userAnswers[id] && this.examState.userAnswers[id].length > 0
    ).length;

    this.container.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h2>模拟考试 (${current}/${total}) - 已答 ${answeredCount} 题</h2>
        <div class="timer" id="exam-timer">30:00</div>
      </div>
      <div class="card">
        <span class="badge badge-blue">${q.type === 'single' ? '单选题' : '多选题'}</span>
        <p class="mt-4" style="font-size: 1.2rem;">${q.question}</p>
        <div class="options-container">
          ${q.options.map(opt => {
            const letter = opt.charAt(0);
            const isSelected = this.examState.userAnswers[q.id]?.includes(letter);
            return `
              <div class="option ${isSelected ? 'selected' : ''}" onclick="window.app.selectExamAnswer('${letter}')">
                ${opt}
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="flex justify-between mt-4">
        <button class="btn btn-outline" onclick="window.app.prevExamQuestion()" ${this.examState.currentIndex === 0 ? 'disabled' : ''}>上一题</button>
        ${this.examState.currentIndex === total - 1 
          ? `<button class="btn btn-primary" onclick="window.app.submitExam()">提交试卷</button>` 
          : `<button class="btn btn-primary" onclick="window.app.nextExamQuestion()">下一题</button>`}
      </div>
    `;
  }

  selectExamAnswer(letter) {
    if (this.practiceState.submitted) return;
    
    const q = this.practiceState.questions[this.practiceState.currentIndex];
    if (q.type === 'single') {
      this.practiceState.userAnswers[q.id] = [letter];
    } else {
      const current = this.practiceState.userAnswers[q.id] || [];
      const idx = current.indexOf(letter);
      if (idx > -1) current.splice(idx, 1);
      else current.push(letter);
      this.practiceState.userAnswers[q.id] = current;
    }
    this.renderExamPracticeInterface();
  }

  nextExamQuestion() {
    if (this.examState.currentIndex < this.examState.questions.length - 1) {
      this.examState.currentIndex++;
      this.render();
    }
  }

  prevExamQuestion() {
    if (this.examState.currentIndex > 0) {
      this.examState.currentIndex--;
      this.render();
    }
  }

  submitExam() {
    if (this.practiceState.submitted) return;
    if (this.practiceState.timerInterval) {
      clearInterval(this.practiceState.timerInterval);
    }
    
    let score = 0;
    this.practiceState.questions.forEach(q => {
      const userAns = this.practiceState.userAnswers[q.id] || [];
      const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
      const isCorrect = userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));
      if (isCorrect) {
        score++;
        this.practiceState.answerStatus[q.id] = 'correct';
      } else {
        this.practiceState.answerStatus[q.id] = 'wrong';
      }
      this.recordAnswer(q, isCorrect);
    });

    const percent = Math.round((score / this.practiceState.questions.length) * 100);
    this.practiceState.submitted = true;
    
    this.container.innerHTML = `
      <div class="card" style="text-align: center;">
        <h1>考试结果</h1>
        <div style="font-size: 4rem; font-weight: 800; color: ${percent >= 60 ? 'var(--success)' : 'var(--error)'}; margin: 2rem 0;">
          ${percent}%
        </div>
        <p style="font-size: 1.2rem;">得分：${score} / ${this.practiceState.questions.length}</p>
        <p class="mt-2" style="color: var(--text-secondary);">${percent >= 60 ? '恭喜你，通过了模拟考试！' : '很遗憾，未能达到及格线，请继续努力。'}</p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 2rem;">
          <button class="btn btn-primary" onclick="window.app.reviewExam()">
            <i data-lucide="eye"></i> 查看答题情况
          </button>
          <button class="btn btn-outline" onclick="window.app.exitExam()">
            <i data-lucide="arrow-left"></i> 返回首页
          </button>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  reviewExam() {
    this.practiceState.currentIndex = 0;
    this.renderExamPracticeInterface();
  }

  renderInstantPracticeInterface() {
    if (!this.practiceState.active) return;

    const q = this.practiceState.questions[this.practiceState.currentIndex];
    const total = this.practiceState.questions.length;
    const current = this.practiceState.currentIndex + 1;
    const userAns = this.practiceState.userAnswers[q.id] || [];
    const hasAnswered = !!this.practiceState.answerStatus[q.id]; // 使用 answerStatus 判断是否已确认答题
    const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
    const isCorrect = hasAnswered && userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));

    this.container.innerHTML = `
      <div class="instant-practice-container">
        <div class="instant-practice-header">
          <h2>${this.practiceState.title || '练习模式'} (${current}/${total})</h2>
          <button class="btn btn-outline" onclick="window.app.exitPractice()">
            <i data-lucide="x"></i> 退出练习
          </button>
        </div>
        
        <div class="card">
          <div class="flex justify-between">
            <div>
              <span class="badge badge-blue">${q.type === 'single' ? '单选题' : '多选题'}</span>
              <span class="badge badge-gray">${DOMAINS[q.chapter] || '领域 ' + q.chapter}</span>
            </div>
            <button class="collect-btn ${this.favorites.some(fav => fav.id === q.id) ? 'active' : ''}" 
              onclick="window.app.toggleFav(${q.id})">
              <i data-lucide="star" fill="${this.favorites.some(fav => fav.id === q.id) ? 'currentColor' : 'none'}"></i>
            </button>
          </div>
          
          <p class="mt-4" style="font-size: 1.2rem; font-weight: 500;">${q.question}</p>
          
          <div class="options-container">
            ${q.options.map(opt => {
              const letter = opt.charAt(0);
              const isSelected = userAns.includes(letter);
              const isCorrectOption = correctAns.includes(letter);
              
              let className = 'option';
              if (hasAnswered) {
                if (isCorrectOption) className += ' correct';
                else if (isSelected) className += ' wrong';
              } else if (isSelected) {
                className += ' selected';
              }
              
              return `
                <div class="${className}" onclick="window.app.selectInstantAnswer('${letter}')" data-letter="${letter}">
                  ${opt}
                  ${hasAnswered && isCorrectOption ? '<i data-lucide="check-circle" style="margin-left: auto;"></i>' : ''}
                </div>
              `;
            }).join('')}
          </div>

          ${!hasAnswered && userAns.length > 0 && q.type === 'multiple' ? `
            <button class="btn btn-primary mt-4" style="width: 100%;" onclick="window.app.confirmInstantAnswer()">
              <i data-lucide="check"></i> 确定
            </button>
          ` : ''}

          ${hasAnswered ? `
            <div class="explanation-box">
              <div class="explanation-header">
                <i data-lucide="lightbulb"></i>
                <span>选项解析与知识点回顾</span>
              </div>
              <p><strong>正确答案：</strong> ${correctAns.join(', ')}</p>
              <p class="mt-2"><strong>【正确项解析】：</strong>${q.explanation}</p>
              ${q.optionExplanations ? `
                <div class="mt-3" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                  ${Object.entries(q.optionExplanations).map(([key, exp]) => {
                    const isCorrectOpt = correctAns.includes(key);
                    return `
                      <p style="margin-top: 0.75rem; padding: 0.75rem; background: ${isCorrectOpt ? 'rgba(0, 180, 42, 0.05)' : 'rgba(245, 63, 63, 0.05)'}; border-radius: 8px;">
                        <strong>${key}.</strong> ${exp}
                      </p>
                    `;
                  }).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${this.getNoteHTML(q.id)}
        </div>

        <div class="flex justify-between mt-4">
          <button class="btn btn-outline" onclick="window.app.prevInstantQuestion()" ${current === 1 ? 'disabled' : ''}>
            <i data-lucide="arrow-left"></i> 上一题
          </button>
          <button class="btn btn-primary" onclick="window.app.nextInstantQuestion()" ${!hasAnswered ? 'disabled' : ''}>
            ${current === total ? '完成练习' : '下一题'} <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  selectInstantAnswer(letter) {
    const q = this.practiceState.questions[this.practiceState.currentIndex];
    const hasAnswered = !!this.practiceState.answerStatus[q.id];
    
    if (hasAnswered) return; // 已答题不能修改
    
    if (!this.practiceState.userAnswers[q.id]) {
      this.practiceState.userAnswers[q.id] = [];
    }
    
    if (q.type === 'single') {
      this.practiceState.userAnswers[q.id] = [letter];
      // 单选题选完立即判断，答对自动跳转下一题
      const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
      const isCorrect = correctAns.includes(letter);
      this.practiceState.answerStatus[q.id] = isCorrect ? 'correct' : 'wrong';
      this.recordAnswer(q, isCorrect);
      this.renderInstantPracticeInterface();
      if (isCorrect && this.practiceState.currentIndex < this.practiceState.questions.length - 1) {
        setTimeout(() => {
          this.practiceState.currentIndex++;
          this.renderInstantPracticeInterface();
        }, 1000);
      }
    } else {
      const current = this.practiceState.userAnswers[q.id];
      const idx = current.indexOf(letter);
      if (idx > -1) current.splice(idx, 1);
      else current.push(letter);
      this.renderInstantPracticeInterface();
    }
  }

  confirmInstantAnswer() {
    const q = this.practiceState.questions[this.practiceState.currentIndex];
    const userAns = this.practiceState.userAnswers[q.id] || [];
    const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
    
    if (userAns.length === 0) {
      alert('请先选择答案！');
      return;
    }
    
    // 标记为已答题（通过设置状态）
    const isCorrect = userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));
    if (isCorrect) {
      this.practiceState.answerStatus[q.id] = 'correct';
    } else {
      this.practiceState.answerStatus[q.id] = 'wrong';
    }
    this.recordAnswer(q, isCorrect);
    
    this.renderInstantPracticeInterface();
    
    // 答对自动跳转下一题
    if (isCorrect && this.practiceState.currentIndex < this.practiceState.questions.length - 1) {
      setTimeout(() => {
        this.practiceState.currentIndex++;
        this.renderInstantPracticeInterface();
      }, 1000);
    }
  }

  nextInstantQuestion() {
    if (this.practiceState.currentIndex < this.practiceState.questions.length - 1) {
      this.practiceState.currentIndex++;
      this.renderInstantPracticeInterface();
    } else {
      // 完成练习
      const total = this.practiceState.questions.length;
      const correct = Object.values(this.practiceState.answerStatus).filter(s => s === 'correct').length;
      const percent = Math.round((correct / total) * 100);
      
      this.container.innerHTML = `
        <div class="card" style="text-align: center;">
          <h1>练习完成</h1>
          <div style="font-size: 4rem; font-weight: 800; color: var(--primary); margin: 2rem 0;">
            ${percent}%
          </div>
          <p style="font-size: 1.2rem;">答对：${correct} / ${total}</p>
          <p class="mt-2" style="color: var(--text-secondary);">继续加油，巩固知识点！</p>
          <button class="btn btn-primary mt-4" onclick="window.app.exitPractice()">返回</button>
        </div>
      `;
    }
  }

  prevInstantQuestion() {
    if (this.practiceState.currentIndex > 0) {
      this.practiceState.currentIndex--;
      this.renderInstantPracticeInterface();
    }
  }

  renderPracticeInterface() {
    if (!this.practiceState.active) return;

    const q = this.practiceState.questions[this.practiceState.currentIndex];
    const total = this.practiceState.questions.length;
    const current = this.practiceState.currentIndex + 1;

    const sidebarHTML = `
      <div class="practice-sidebar">
        <h3 style="margin-bottom: 1rem;">题目导航</h3>
        <div class="question-nav-grid">
          ${this.practiceState.questions.map((question, idx) => {
            const status = this.practiceState.answerStatus[question.id];
            let className = 'question-nav-item';
            if (idx === this.practiceState.currentIndex) className += ' active';
            if (status === 'correct') className += ' correct';
            else if (status === 'wrong') className += ' wrong';
            
            return `
              <div class="${className}" onclick="window.app.jumpToPracticeQuestion(${idx})">
                ${idx + 1}
              </div>
            `;
          }).join('')}
        </div>
        ${this.practiceState.submitted ? '' : `
          <button class="btn btn-primary" style="width: 100%; margin-top: 2rem;" 
            onclick="window.app.submitPractice()">
            <i data-lucide="check"></i> 提交答案
          </button>
        `}
      </div>
    `;

    const mainHTML = `
      <div class="practice-main">
        <div class="flex justify-between items-center mb-4">
          <h2>${this.practiceState.title || '练习模式'} (${current}/${total})</h2>
          <button class="btn btn-outline" onclick="window.app.exitPractice()">
            <i data-lucide="x"></i> 退出练习
          </button>
        </div>
        <div class="card">
          <div class="flex justify-between">
            <span class="badge badge-blue">${q.type === 'single' ? '单选题' : '多选题'}</span>
            <button class="collect-btn ${this.favorites.some(fav => fav.id === q.id) ? 'active' : ''}" 
              onclick="window.app.toggleFav(${q.id})">
              <i data-lucide="star" fill="${this.favorites.some(fav => fav.id === q.id) ? 'currentColor' : 'none'}"></i>
            </button>
          </div>
          <p class="mt-4" style="font-size: 1.2rem; font-weight: 500;">${q.question}</p>
          <div class="options-container">
            ${q.options.map(opt => {
              const letter = opt.charAt(0);
              const userAns = this.practiceState.userAnswers[q.id] || [];
              const isSelected = userAns.includes(letter);
              const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
              
              let className = 'option';
              if (this.practiceState.submitted) {
                if (correctAns.includes(letter)) className += ' correct';
                else if (isSelected) className += ' wrong';
              } else if (isSelected) {
                className += ' selected';
              }
              
              return `
                <div class="${className}" onclick="window.app.selectPracticeAnswer('${letter}')" data-letter="${letter}">
                  ${opt}
                </div>
              `;
            }).join('')}
          </div>
          ${this.practiceState.submitted ? `
            <div class="explanation-box">
              <p><strong>你的答案：</strong> ${(this.practiceState.userAnswers[q.id] || []).join(', ') || '未作答'}</p>
              <p><strong>正确答案：</strong> ${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</p>
              <p class="mt-2"><strong>整体解析：</strong> ${q.explanation}</p>
              ${q.optionExplanations ? `
                <div class="mt-3" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                  <p><strong>各选项解析：</strong></p>
                  ${Object.entries(q.optionExplanations).map(([key, exp]) => `
                    <p style="margin-top: 0.5rem;"><strong>${key}.</strong> ${exp}</p>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${this.getNoteHTML(q.id)}
        </div>
        <div class="flex justify-between mt-4">
          <button class="btn btn-outline" onclick="window.app.prevPracticeQuestion()" ${current === 1 ? 'disabled' : ''}>
            <i data-lucide="arrow-left"></i> 上一题
          </button>
          <button class="btn btn-outline" onclick="window.app.nextPracticeQuestion()" ${current === total ? 'disabled' : ''}>
            下一题 <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = `
      <div class="practice-container">
        ${sidebarHTML}
        ${mainHTML}
      </div>
    `;
    lucide.createIcons();
  }

  selectPracticeAnswer(letter) {
    if (this.practiceState.submitted) return;
    
    const q = this.practiceState.questions[this.practiceState.currentIndex];
    if (q.type === 'single') {
      this.practiceState.userAnswers[q.id] = [letter];
    } else {
      const current = this.practiceState.userAnswers[q.id] || [];
      const idx = current.indexOf(letter);
      if (idx > -1) current.splice(idx, 1);
      else current.push(letter);
      this.practiceState.userAnswers[q.id] = current;
    }
    this.renderPracticeInterface();
  }

  jumpToPracticeQuestion(index) {
    this.practiceState.currentIndex = index;
    this.renderPracticeInterface();
  }

  nextPracticeQuestion() {
    if (this.practiceState.currentIndex < this.practiceState.questions.length - 1) {
      this.practiceState.currentIndex++;
      this.renderPracticeInterface();
    }
  }

  prevPracticeQuestion() {
    if (this.practiceState.currentIndex > 0) {
      this.practiceState.currentIndex--;
      this.renderPracticeInterface();
    }
  }

  submitPractice() {
    if (this.practiceState.submitted) return;
    this.practiceState.questions.forEach(q => {
      const userAns = this.practiceState.userAnswers[q.id] || [];
      const correctAns = Array.isArray(q.answer) ? q.answer : [q.answer];
      const isCorrect = userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));
      if (isCorrect) {
        this.practiceState.answerStatus[q.id] = 'correct';
      } else {
        this.practiceState.answerStatus[q.id] = 'wrong';
      }
      this.recordAnswer(q, isCorrect);
    });
    this.practiceState.submitted = true;
    this.renderPracticeInterface();
  }

  saveNote(questionId) {
    const textarea = document.getElementById(`note-${questionId}`);
    if (textarea) {
      const note = textarea.value.trim();
      if (note) {
        this.notes[questionId] = note;
      } else {
        delete this.notes[questionId];
      }
      localStorage.setItem('bosch_notes', JSON.stringify(this.notes));
    }
  }

  getNoteHTML(questionId) {
    const note = this.notes[questionId] || '';
    return `
      <div class="note-section">
        <div class="note-header">
          <i data-lucide="file-text"></i>
          <span>我的备注</span>
        </div>
        <textarea id="note-${questionId}" class="note-textarea" placeholder="在此输入备注内容..." 
          onblur="window.app.saveNote(${questionId})">${note}</textarea>
      </div>
    `;
  }

  // ===== 错题本 =====
  getWrongQuestionList() {
    return this.wrongQuestions.map(id => BOSCH_QUESTIONS.find(q => q.id === id)).filter(Boolean);
  }

  renderWrong() {
    const wrongQs = this.getWrongQuestionList();
    if (wrongQs.length === 0) {
      this.container.innerHTML = `
        <div class="card" style="text-align: center; padding: 4rem;">
          <div style="width: 60px; height: 60px; margin: 0 auto 1.5rem; background: rgba(245, 63, 63, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="x-circle" style="width: 32px; height: 32px; color: var(--error);"></i>
          </div>
          <h2 style="margin-bottom: 1rem;">暂无错题</h2>
          <p style="color: var(--text-secondary);">答错的题目会自动收录到这里，重做答对后自动移除</p>
          <button class="btn btn-primary mt-4" onclick="window.app.currentView='chapters'; window.app.render();">
            <i data-lucide="book-open"></i> 去练习
          </button>
        </div>
      `;
      return;
    }
    this.container.innerHTML = `
      <div class="favorites-header">
        <div class="favorites-title">
          <div class="favorites-icon"><i data-lucide="x-circle"></i></div>
          <div><h1>错题本</h1><p>共 ${wrongQs.length} 道错题（已持久化保存）</p></div>
        </div>
        <div class="favorites-actions">
          <button class="btn btn-outline" onclick="window.app.exportWrong()"><i data-lucide="download"></i> 导出 CSV</button>
          <button class="btn btn-primary" onclick="window.app.startWrongPractice()"><i data-lucide="play"></i> 重做错题</button>
        </div>
      </div>
      <div class="favorites-list">
        ${wrongQs.map((q, idx) => this.createWrongCard(q, idx)).join('')}
      </div>
    `;
  }

  createWrongCard(q, index) {
    const badges = [
      { text: q.type === 'single' ? '单选题' : '多选题', color: 'blue' },
      { text: `${DOMAINS[q.chapter] || '领域 ' + q.chapter}`, color: 'gray' }
    ];
    return `
      <div class="fav-question-card">
        <div class="fav-question-header">
          <div class="fav-badges">${badges.map(b => `<span class="badge badge-${b.color}">${b.text}</span>`).join('')}</div>
          <button class="collect-btn active" onclick="window.app.removeWrong(${q.id}); event.stopPropagation();" title="移除错题">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="fav-question-content">
          <div class="fav-question-text">${q.question}</div>
          <div class="fav-options-preview">
            ${q.options.slice(0, 2).map(opt => `<div class="fav-option-item">${opt}</div>`).join('')}
            ${q.options.length > 2 ? `<div class="fav-option-more">+${q.options.length - 2} 个选项</div>` : ''}
          </div>
        </div>
        <div class="fav-question-footer">
          <button class="btn-text" onclick="window.app.showWrongDetail(${index})"><i data-lucide="eye"></i> 查看解析</button>
        </div>
      </div>
    `;
  }

  removeWrong(id) {
    this.wrongQuestions = this.wrongQuestions.filter(wid => wid !== id);
    localStorage.setItem('bosch_wrong', JSON.stringify(this.wrongQuestions));
    this.renderWrong();
  }

  showWrongDetail(index) {
    this.showQuestionDetail(this.getWrongQuestionList()[index]);
  }

  startWrongPractice() {
    const wrongQs = this.getWrongQuestionList();
    if (wrongQs.length === 0) { alert('暂无错题'); return; }
    this.practiceState = {
      active: true,
      questions: [...wrongQs].sort(() => Math.random() - 0.5),
      currentIndex: 0,
      userAnswers: {},
      answerStatus: {},
      submitted: false,
      title: '错题重做',
      mode: 'exam'
    };
    this.renderPracticeInterface();
  }

  exportWrong() {
    const wrongQs = this.getWrongQuestionList();
    if (wrongQs.length === 0) { alert('暂无错题'); return; }
    this.exportQuestionList(wrongQs, '博世错题');
  }

  // ===== 做题统计 =====
  renderStats() {
    const total = this.stats.totalAnswered || 0;
    const correct = this.stats.totalCorrect || 0;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    const domainRows = Object.keys(DOMAINS).map(k => {
      const dk = Number(k);
      const d = this.stats.byDomain[dk] || { answered: 0, correct: 0 };
      return { name: DOMAINS[dk], ...d, rate: d.answered > 0 ? Math.round((d.correct / d.answered) * 100) : 0 };
    }).filter(d => d.answered > 0);

    // 最近 7 天趋势
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const rec = this.stats.daily[key] || { answered: 0, correct: 0 };
      days.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, ...rec });
    }
    const maxDay = Math.max(1, ...days.map(d => d.answered));

    this.container.innerHTML = `
      <h1>做题统计</h1>
      <div class="grid-chapters" style="margin-top: 1rem;">
        <div class="chapter-card">
          <h3 style="font-size: 2rem; color: var(--primary);">${total}</h3>
          <p>累计答题</p>
        </div>
        <div class="chapter-card">
          <h3 style="font-size: 2rem; color: var(--success);">${correct}</h3>
          <p>累计答对</p>
        </div>
        <div class="chapter-card">
          <h3 style="font-size: 2rem; color: ${rate >= 60 ? 'var(--success)' : 'var(--error)'};">${rate}%</h3>
          <p>正确率</p>
        </div>
        <div class="chapter-card">
          <h3 style="font-size: 2rem; color: var(--error);">${this.wrongQuestions.length}</h3>
          <p>当前错题</p>
        </div>
      </div>

      <div class="card mt-4">
        <h3>最近 7 天答题趋势</h3>
        <div style="display: flex; align-items: flex-end; gap: 12px; height: 120px; margin-top: 1rem;">
          ${days.map(d => `
            <div style="flex: 1; text-align: center;">
              <div style="background: var(--primary); height: ${Math.round((d.answered / maxDay) * 90)}px; border-radius: 6px 6px 0 0; min-height: ${d.answered > 0 ? '4px' : '2px'}; opacity: ${d.answered > 0 ? 1 : 0.2};"></div>
              <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.4rem;">${d.label}</div>
              <div style="font-size: 0.7rem; color: var(--text-primary);">${d.answered}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card mt-4">
        <h3>各领域掌握情况</h3>
        ${domainRows.length === 0 ? '<p style="color: var(--text-secondary); margin-top: 0.75rem;">暂无答题记录</p>' : `
          <table style="width: 100%; margin-top: 1rem; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">
                <th style="text-align: left; padding: 0.5rem;">领域</th>
                <th style="text-align: center; padding: 0.5rem;">答题数</th>
                <th style="text-align: center; padding: 0.5rem;">答对数</th>
                <th style="text-align: center; padding: 0.5rem;">正确率</th>
              </tr>
            </thead>
            <tbody>
              ${domainRows.map(d => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.6rem;">${d.name}</td>
                  <td style="text-align: center;">${d.answered}</td>
                  <td style="text-align: center;">${d.correct}</td>
                  <td style="text-align: center; color: ${d.rate >= 60 ? 'var(--success)' : 'var(--error)'};">${d.rate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  }

  exitPractice() {
    this.practiceState.active = false;
    this.render();
  }
}

window.app = new App();
