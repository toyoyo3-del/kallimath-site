(() => {
  "use strict";

  const game = document.querySelector("#game");
  const progressFill = document.querySelector("#progressFill");
  const progressText = document.querySelector("#progressText");
  const rabbitTemplate = document.querySelector("#rabbitTemplate");
  const soundButton = document.querySelector("#soundButton");
  const soundIcon = document.querySelector("#soundIcon");
  const homeButton = document.querySelector("#homeButton");
  const chapterLabel = document.querySelector("#chapterLabel");

  const chapters = [
    { id: 1, title: "零的诞生", symbol: "0", color: "#e6b64a", subtitle: "让“没有”也能被清楚记录", start: "count" },
    { id: 2, title: "十个一捆", symbol: "10", color: "#5c9b72", subtitle: "发现十进制与个位、十位", start: "chapter-intro" },
    { id: 3, title: "汇合", symbol: "+", color: "#dd8565", subtitle: "从合并理解多位数加法", start: "chapter-intro" },
    { id: 4, title: "取走与距离", symbol: "−", color: "#668bb2", subtitle: "看见退位真正发生了什么", start: "chapter-intro" },
    { id: 5, title: "兔子方阵", symbol: "×", color: "#9a70ad", subtitle: "用排列发现乘法的结构", start: "chapter-intro" },
    { id: 6, title: "公平分组", symbol: "÷", color: "#4b9a96", subtitle: "理解平均分、分组与余数", start: "chapter-intro" }
  ];

  const lessonData = {
    2: {
      eyebrow: "第二章 · 丰收后的仓库",
      title: "刻痕多得看不清了",
      story: "23 根木棍挤在一起，逐根数既慢又容易出错。如果把每 10 根绑成一捆，会发生什么？",
      insight: "十进制就是一种聪明的打包方法：10 个一可以换成 1 个十。数字所在的位置决定它代表多少。",
      tasks: [14, 20, 37, 42, 58, 70, 86, 99]
    },
    3: {
      eyebrow: "第三章 · 两支采集队归来",
      title: "不用从头再数一遍",
      story: "一队带回 18 根木棍，另一队带回 7 根。把它们汇合后，10 个散根又能捆成什么？",
      insight: "加法描述数量的汇合。“进 1”并不是神秘规则，而是 10 个一重新打包成了 1 个十。",
      tasks: [[8, 7], [24, 13], [28, 17], [46, 38], [125, 67], [238, 154], [476, 289], [999, 1]]
    },
    4: {
      eyebrow: "第四章 · 仓库开始配货",
      title: "2 个一，怎样拿走 8 个一？",
      story: "仓库有 42 袋粮食，需要取走 18 袋。个位不够时，不是向谁“借”，而是解开一整捆。",
      insight: "减法可以表示取走，也可以表示两个数量相差多远。退位就是把一个高位单位拆成 10 个低位单位。",
      tasks: [[14, 6], [42, 18], [73, 29], [100, 46], [302, 147], [500, 238], [804, 376], [936, 458]]
    },
    5: {
      eyebrow: "第五章 · 兔子节日方阵",
      title: "重复相加，还能更简单吗？",
      story: "5 排兔子，每排 7 只。整齐的队形不只好看，还能把很长的加法压缩成一个乘法。",
      insight: "乘法既是相同小组的重复，也是矩形的面积。旋转阵列，总数不变；拆开阵列，复杂乘法会变简单。",
      tasks: [[3, 4], [5, 7], [7, 8], [9, 6], [12, 4], [13, 6], [24, 7], [32, 15]]
    },
    6: {
      eyebrow: "第六章 · 安排兔舍",
      title: "怎样分才真正公平？",
      story: "35 只兔子要住进 5 间兔舍。轮流分给每一间，就能看见除法答案是怎样生长出来的。",
      insight: "除法既能问“每组多少”，也能问“能分几组”。乘法和除法互相检查；不能完整分组的部分叫余数。",
      tasks: [[12, 3], [35, 5], [42, 6], [56, 8], [43, 5], [96, 8], [125, 5], [156, 12]]
    }
  };

  const state = {
    scene: "intro",
    chapter: 1,
    counted: 0,
    selectedPen: null,
    records: [null, null, null],
    practiceIndex: 0,
    practiceErrors: 0,
    guideStep: 0,
    sound: localStorage.getItem("mathBeautySound") !== "off",
    completed: loadCompleted()
  };

  let audioContext;

  function loadCompleted() {
    try {
      return JSON.parse(localStorage.getItem("mathBeautyCompleted") || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveCompletion(chapter) {
    if (!state.completed.includes(chapter)) {
      state.completed.push(chapter);
      state.completed.sort((a, b) => a - b);
      localStorage.setItem("mathBeautyCompleted", JSON.stringify(state.completed));
    }
  }

  function tone(frequency = 440, duration = .12, type = "sine", volume = .06, delay = 0) {
    if (!state.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const start = audioContext.currentTime + delay;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + .015);
      gain.gain.exponentialRampToValueAtTime(.001, start + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .02);
    } catch (_) { /* 声音是增强体验，不影响游戏。 */ }
  }

  function successSound() {
    [392, 523, 659].forEach((note, index) => tone(note, .3, "sine", .05, index * .09));
  }

  function setHeader(label, value = 0, text = "探索中") {
    chapterLabel.textContent = label;
    progressFill.style.width = `${value}%`;
    progressText.textContent = text;
  }

  function navigate(scene, options = {}) {
    if (options.chapter) state.chapter = options.chapter;
    state.scene = scene;
    window.scrollTo({ top: 0, behavior: "smooth" });
    render();
  }

  function startChapter(id) {
    state.chapter = id;
    state.practiceIndex = 0;
    state.practiceErrors = 0;
    state.guideStep = 0;
    navigate(id === 1 ? "count" : "chapter-intro");
  }

  function showToast(message, timeout = 2300) {
    document.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.querySelector(".scene")?.appendChild(toast);
    window.setTimeout(() => toast.remove(), timeout);
  }

  function makeRabbits(count, small = false) {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const rabbit = rabbitTemplate.content.firstElementChild.cloneNode(true);
      rabbit.dataset.index = index;
      if (small) rabbit.tabIndex = -1;
      fragment.appendChild(rabbit);
    }
    return fragment;
  }

  function renderIntro() {
    setHeader("一棵从好奇心长出的树", 0, "故事开始");
    game.innerHTML = `
      <section class="scene hero-scene">
        <div class="stars"></div>
        <div class="hero-card">
          <p class="eyebrow">从计数到看见世界的结构</p>
          <h1>数学之美</h1>
          <p class="subtitle">数学不是突然出现的规则。<br>它是人们一次次遇到困难后，亲手发明的工具。</p>
          <div class="seed-visual" aria-hidden="true">
            <div class="earth"></div><div class="seed"></div><div class="sprout"></div>
          </div>
          <button class="primary-button" id="enterTree">进入数学之树</button>
        </div>
      </section>`;
    document.querySelector("#enterTree").addEventListener("click", () => {
      tone(330, .18, "triangle");
      navigate("map");
    });
  }

  function renderMap() {
    setHeader("章节地图 · 算术主干", 0, `${state.completed.length}/6 章已完成`);
    const cards = chapters.map(chapter => {
      const completed = state.completed.includes(chapter.id);
      return `
        <button class="chapter-card ${completed ? "completed" : ""}" data-chapter="${chapter.id}" style="--chapter-color:${chapter.color}">
          <span class="chapter-number">第 ${chapter.id} 章</span>
          <span class="chapter-symbol">${chapter.symbol}</span>
          <strong>${chapter.title}</strong>
          <small>${chapter.subtitle}</small>
          <span class="chapter-status">${completed ? "✓ 已掌握 · 可再次练习" : chapter.id === 1 ? "从这里开始" : "进入章节"}</span>
        </button>`;
    }).join("");

    game.innerHTML = `
      <section class="scene map-scene">
        <div class="scene-heading">
          <span class="task-pill">数学之树 · 第一树冠</span>
          <h2>数量的语言</h2>
          <p>每一章都包含故事发现、递进练习和自由实验。可以按顺序成长，也可以回到任意章节巩固。</p>
        </div>
        <div class="chapter-grid">${cards}</div>
      </section>`;
    document.querySelectorAll(".chapter-card").forEach(card => {
      card.addEventListener("click", () => startChapter(Number(card.dataset.chapter)));
    });
  }

  function renderCount() {
    state.counted = 0;
    setHeader("第一章 · 零的诞生", 10, "学会清点");
    game.innerHTML = `
      <section class="scene story-scene">
        <div class="scene-heading">
          <span class="task-pill">第一天 · 太阳落山前</span>
          <h2>兔子都回来了吗？</h2>
          <p>村民还不会写数字。每点一只兔子，就在木板上刻一道痕。</p>
        </div>
        <div class="counting-area">
          <div class="meadow" id="meadow" aria-label="兔子草地"></div>
          <aside class="tally-board">
            <h3>今天的刻痕</h3>
            <div class="tally-count" id="tallyCount">0</div>
            <div class="tally-marks" id="tallyMarks">—</div>
            <div class="tally-help">轻点每一只兔子<br>不要重复，也别漏掉</div>
          </aside>
        </div>
        <div class="scene-actions">
          <span class="hint" id="countHint">还有 7 只兔子没有清点</span>
          <button class="primary-button" id="countNext" disabled>带着木板去兔舍</button>
        </div>
      </section>`;

    const meadow = document.querySelector("#meadow");
    meadow.appendChild(makeRabbits(7));
    meadow.querySelectorAll(".rabbit").forEach(rabbit => {
      rabbit.addEventListener("click", () => {
        if (rabbit.classList.contains("counted")) return;
        rabbit.classList.add("counted");
        state.counted += 1;
        tone(300 + state.counted * 38, .11, "triangle", .045);
        document.querySelector("#tallyCount").textContent = state.counted;
        document.querySelector("#tallyMarks").textContent = "Ⅰ".repeat(state.counted);
        const remaining = 7 - state.counted;
        document.querySelector("#countHint").textContent = remaining ? `还有 ${remaining} 只兔子没有清点` : "七道刻痕，正好对应七只兔子！";
        if (!remaining) {
          document.querySelector("#countNext").disabled = false;
          successSound();
        }
      });
    });
    document.querySelector("#countNext").addEventListener("click", () => navigate("pens"));
  }

  function tallyFor(value) {
    return value ? "Ⅰ".repeat(value) : "";
  }

  function renderPens() {
    setHeader("第一章 · 零的诞生", 35, "刻痕的难题");
    game.innerHTML = `
      <section class="scene story-scene">
        <div class="scene-heading">
          <span class="task-pill">第二天 · 三间兔舍</span>
          <h2>把数量写在木牌上</h2>
          <p>第一间有 3 只，第三间有 5 只。中间一只也没有……它的木牌该怎么刻？</p>
        </div>
        <div class="pens-area" id="pensArea"></div>
        <div class="scene-actions">
          <button class="primary-button" id="leaveBlankButton">中间只能留白吗？</button>
        </div>
      </section>`;

    const pens = document.querySelector("#pensArea");
    [3, 0, 5].forEach((count, index) => {
      const card = document.createElement("article");
      card.className = "pen-card";
      card.innerHTML = `<h3>兔舍 ${index + 1}</h3><div class="mini-rabbits"></div><div class="wood-tag display-tag ${count === 0 ? "blank" : ""}" aria-label="兔舍 ${index + 1} 的记录木牌">${tallyFor(count)}</div>`;
      card.querySelector(".mini-rabbits").appendChild(makeRabbits(count, true));
      pens.appendChild(card);
    });

    let discovered = false;
    document.querySelector("#leaveBlankButton").addEventListener("click", event => {
      if (discovered) {
        navigate("zero");
        return;
      }
      discovered = true;
      document.querySelectorAll(".wood-tag")[1].classList.add("ambiguous");
      tone(170, .35, "sawtooth", .035);
      showToast("留白究竟是“一只也没有”，还是“忘记记录了”？", 3300);
      event.currentTarget.textContent = "我们需要一个新符号";
    });
  }

  function renderZero() {
    setHeader("第一章 · 零的诞生", 58, "发明 0");
    game.innerHTML = `
      <section class="scene discovery-scene">
        <div class="discovery-card">
          <p class="eyebrow">一次改变世界的发明</p>
          <div class="zero-orbit" aria-label="数字零">0</div>
          <h2>让“没有”也有一个位置</h2>
          <p>我们画一个空空的圆，代表这里一个也没有。它不是空白，而是一个清楚的记录。我们叫它——零。</p>
          <button class="primary-button" id="inventButton">把 0 刻在木牌上</button>
        </div>
      </section>`;
    document.querySelector("#inventButton").addEventListener("click", () => {
      successSound();
      navigate("record");
    });
  }

  function renderRecord() {
    state.selectedPen = null;
    state.records = [null, null, null];
    setHeader("第一章 · 零的诞生", 78, "用数字记录");
    game.innerHTML = `
      <section class="scene story-scene">
        <div class="scene-heading">
          <span class="task-pill">新工具 · 0 到 5</span>
          <h2>重新记录三间兔舍</h2>
          <p>这一次木牌可以操作：先选择一块木牌，再选择正确的数字。</p>
        </div>
        <div class="pens-area" id="recordPens"></div>
        <div class="symbol-tray">${[0, 1, 2, 3, 4, 5].map(n => `<button class="symbol-button" data-number="${n}">${n}</button>`).join("")}</div>
        <div class="scene-actions">
          <span class="hint" id="recordHint">请选择一块写着“选择木牌”的木牌</span>
          <button class="primary-button" id="finishRecord" disabled>完成记录</button>
        </div>
      </section>`;

    const pens = document.querySelector("#recordPens");
    [3, 0, 5].forEach((count, index) => {
      const card = document.createElement("article");
      card.className = "pen-card";
      card.innerHTML = `<h3>兔舍 ${index + 1}</h3><div class="mini-rabbits"></div><button class="wood-tag editable" data-pen="${index}" aria-label="为兔舍 ${index + 1} 填写数字"></button>`;
      card.querySelector(".mini-rabbits").appendChild(makeRabbits(count, true));
      pens.appendChild(card);
    });

    document.querySelectorAll(".wood-tag.editable").forEach(tag => tag.addEventListener("click", () => {
      document.querySelectorAll(".wood-tag").forEach(item => item.classList.remove("selected"));
      document.querySelectorAll(".pen-card").forEach(item => item.classList.remove("active"));
      tag.classList.add("selected");
      tag.closest(".pen-card").classList.add("active");
      state.selectedPen = Number(tag.dataset.pen);
      document.querySelector("#recordHint").textContent = `正在记录兔舍 ${state.selectedPen + 1}`;
    }));

    document.querySelectorAll(".symbol-button").forEach(button => button.addEventListener("click", () => {
      if (state.selectedPen === null) {
        showToast("先选一块木牌");
        return;
      }
      const number = Number(button.dataset.number);
      const correct = [3, 0, 5][state.selectedPen];
      const tag = document.querySelector(`.wood-tag[data-pen="${state.selectedPen}"]`);
      if (number !== correct) {
        shake(tag);
        document.querySelector("#recordHint").textContent = "再数一数这间兔舍";
        return;
      }
      state.records[state.selectedPen] = number;
      tag.textContent = number;
      tag.classList.remove("editable", "selected");
      tag.closest(".pen-card").classList.remove("active");
      state.selectedPen = null;
      tone(420 + number * 25, .15, "sine", .05);
      const completed = state.records.filter(value => value !== null).length;
      document.querySelector("#recordHint").textContent = completed === 3 ? "3、0、5——没有一块木牌含糊不清！" : `已经记录 ${completed} 间兔舍`;
      if (completed === 3) {
        document.querySelector("#finishRecord").disabled = false;
        successSound();
      }
    }));
    document.querySelector("#finishRecord").addEventListener("click", () => completeChapter(1));
  }

  function renderChapterIntro() {
    const chapter = chapters[state.chapter - 1];
    const lesson = lessonData[state.chapter];
    setHeader(`第${cnNumber(state.chapter)}章 · ${chapter.title}`, 5, "新的困难");
    game.innerHTML = `
      <section class="scene lesson-intro" style="--chapter-color:${chapter.color}">
        <div class="lesson-emblem">${chapter.symbol}</div>
        <div class="lesson-intro-copy">
          <p class="eyebrow">${lesson.eyebrow}</p>
          <h2>${lesson.title}</h2>
          <p>${lesson.story}</p>
          <div class="lesson-route">
            <span>① 亲手发现</span><span>② 8 道练习</span><span>③ 自由实验</span>
          </div>
          <button class="primary-button" id="beginLesson">开始寻找新办法</button>
        </div>
      </section>`;
    document.querySelector("#beginLesson").addEventListener("click", () => navigate("guide"));
  }

  function renderGuide() {
    setHeader(`第${cnNumber(state.chapter)}章 · ${chapters[state.chapter - 1].title}`, 18, "亲手发现");
    ({ 2: renderPlaceGuide, 3: renderAdditionGuide, 4: renderSubtractionGuide, 5: renderMultiplicationGuide, 6: renderDivisionGuide }[state.chapter])();
  }

  function renderPlaceGuide() {
    state.guideStep = 0;
    game.innerHTML = `
      <section class="scene activity-scene">
        <div class="scene-heading">
          <span class="task-pill">亲手打包</span>
          <h2>把 23 根木棍整理清楚</h2>
          <p>每次选择 10 根散木，就能用绳子绑成一整捆。</p>
        </div>
        <div class="place-workbench">
          <div class="loose-sticks" id="guideLoose">${sticksHTML(23)}</div>
          <div class="place-slots">
            <div class="place-slot"><strong id="guideTens">0</strong><span>十位 · 整捆</span><div class="bundle-row" id="guideBundles"></div></div>
            <div class="place-slot"><strong id="guideOnes">23</strong><span>个位 · 散根</span></div>
          </div>
        </div>
        <div class="scene-actions">
          <span class="hint" id="guideHint">23 根还挤在一起</span>
          <button class="primary-button" id="bundleButton">十个一，绑成一捆</button>
          <button class="primary-button" id="guideNext" hidden>去练习整理数字</button>
        </div>
      </section>`;
    document.querySelector("#bundleButton").addEventListener("click", event => {
      state.guideStep += 1;
      const loose = 23 - state.guideStep * 10;
      document.querySelector("#guideLoose").innerHTML = sticksHTML(loose);
      document.querySelector("#guideBundles").innerHTML = bundlesHTML(state.guideStep);
      document.querySelector("#guideTens").textContent = state.guideStep;
      document.querySelector("#guideOnes").textContent = loose;
      tone(260 - state.guideStep * 30, .28, "triangle", .055);
      if (state.guideStep === 2) {
        event.currentTarget.hidden = true;
        document.querySelector("#guideNext").hidden = false;
        document.querySelector("#guideHint").innerHTML = "<strong>23 = 2 个十 + 3 个一</strong>";
        successSound();
      } else {
        document.querySelector("#guideHint").textContent = "还有 13 根，可以再绑一捆";
      }
    });
    document.querySelector("#guideNext").addEventListener("click", beginPractice);
  }

  function renderAdditionGuide() {
    state.guideStep = 0;
    game.innerHTML = guideShell(
      "让 18 和 7 真正汇合",
      "先把两队放到一起，再整理超过 9 个的个位。",
      `<div class="merge-trays">
        <div class="number-tray"><span>第一队 · 18</span>${baseBlocksHTML(18)}</div>
        <div class="operator-medallion">+</div>
        <div class="number-tray"><span>第二队 · 7</span>${baseBlocksHTML(7)}</div>
      </div>
      <div class="result-workspace" id="additionResult"><span class="empty-message">等待两队汇合</span></div>`,
      "合并两队"
    );
    const action = document.querySelector("#guideAction");
    action.addEventListener("click", () => {
      state.guideStep += 1;
      if (state.guideStep === 1) {
        document.querySelector("#additionResult").innerHTML = `<div><strong>1 个十</strong>${baseBlocksHTML(10)}</div><div><strong>15 个一</strong><div class="ones-spill">${onesHTML(15)}</div></div>`;
        action.textContent = "把 10 个一换成 1 个十";
        document.querySelector("#guideMessage").textContent = "18 + 7 合起来有 1 个十和 15 个一，个位太挤了。";
        tone(340, .18, "triangle");
      } else {
        document.querySelector("#additionResult").innerHTML = `<div class="equation-reveal">${baseBlocksHTML(25)}<strong>18 + 7 = 25</strong><small>2 个十，5 个一</small></div>`;
        finishGuide(action, "10 个一换成 1 个十，这就是进位。");
      }
    });
  }

  function renderSubtractionGuide() {
    state.guideStep = 0;
    game.innerHTML = guideShell(
      "从 42 中取走 18",
      "我们有 4 个十和 2 个一。先观察为什么不能直接拿走 8 个一。",
      `<div class="result-workspace subtraction-space" id="subtractionResult">
        <div class="equation-reveal">${baseBlocksHTML(42)}<strong>42 − 18</strong><small>4 个十，2 个一</small></div>
      </div>`,
      "尝试取走 18"
    );
    const action = document.querySelector("#guideAction");
    action.addEventListener("click", () => {
      state.guideStep += 1;
      if (state.guideStep === 1) {
        shake(document.querySelector("#subtractionResult"));
        action.textContent = "解开 1 个十";
        document.querySelector("#guideMessage").textContent = "只有 2 个一，确实不够拿走 8 个一。";
        tone(160, .18, "square", .025);
      } else if (state.guideStep === 2) {
        document.querySelector("#subtractionResult").innerHTML = `<div class="equation-reveal">${baseBlocksHTML(30)}<div class="ones-spill">${onesHTML(12)}</div><strong>42 = 3 个十 + 12 个一</strong></div>`;
        action.textContent = "现在取走 1 个十和 8 个一";
        document.querySelector("#guideMessage").textContent = "总数没有改变，只是换了一种打包方式。";
        tone(240, .3, "triangle");
      } else {
        document.querySelector("#subtractionResult").innerHTML = `<div class="equation-reveal">${baseBlocksHTML(24)}<strong>42 − 18 = 24</strong><small>剩下 2 个十，4 个一</small></div>`;
        finishGuide(action, "“退 1”其实是把 1 个十拆成 10 个一。");
      }
    });
  }

  function renderMultiplicationGuide() {
    state.guideStep = 0;
    game.innerHTML = guideShell(
      "5 排兔子，每排 7 只",
      "先看五个相同小组，再让它们排成整齐的矩形。",
      `<div class="multiplication-stage" id="multiplyStage">
        ${[1, 2, 3, 4, 5].map(n => `<div class="repeat-group"><span>第 ${n} 排</span>${dotsHTML(7)}</div>`).join("")}
      </div>`,
      "排成 5 × 7 方阵"
    );
    const action = document.querySelector("#guideAction");
    action.addEventListener("click", () => {
      state.guideStep += 1;
      if (state.guideStep === 1) {
        document.querySelector("#multiplyStage").innerHTML = `<div class="dot-array" style="--cols:7">${dotsHTML(35)}</div><div class="array-label">5 × 7 = 35</div>`;
        action.textContent = "把方阵旋转过来";
        document.querySelector("#guideMessage").textContent = "5 个 7 被压缩成了 5 × 7。";
        tone(360, .18, "triangle");
      } else {
        document.querySelector("#multiplyStage").innerHTML = `<div class="dot-array rotated" style="--cols:5">${dotsHTML(35)}</div><div class="array-label">7 × 5 = 35</div>`;
        finishGuide(action, "5 × 7 和 7 × 5 只是观察方向不同，总数不变。");
      }
    });
  }

  function renderDivisionGuide() {
    state.guideStep = 0;
    game.innerHTML = guideShell(
      "35 只兔子住进 5 间兔舍",
      "每次给每间兔舍分 1 只。公平分配会形成稳定的节奏。",
      `<div class="division-stage" id="divisionStage">
        ${[0, 1, 2, 3, 4].map(i => `<div class="division-pen"><span>兔舍 ${i + 1}</span><div class="pen-dots" data-pen="${i}"></div><strong>0</strong></div>`).join("")}
      </div>`,
      "给每间兔舍分 1 只"
    );
    const action = document.querySelector("#guideAction");
    action.addEventListener("click", () => {
      state.guideStep += 1;
      document.querySelectorAll(".division-pen").forEach((pen, index) => {
        pen.querySelector(".pen-dots").insertAdjacentHTML("beforeend", `<i class="math-dot" style="animation-delay:${index * .04}s"></i>`);
        pen.querySelector("strong").textContent = state.guideStep;
      });
      tone(280 + state.guideStep * 28, .13, "sine", .04);
      document.querySelector("#guideMessage").textContent = `已经分出 ${state.guideStep} 轮，共分了 ${state.guideStep * 5} 只`;
      if (state.guideStep === 7) {
        document.querySelector("#divisionStage").insertAdjacentHTML("beforeend", `<div class="array-label full-row">35 ÷ 5 = 7</div>`);
        finishGuide(action, "每间 7 只，35 只正好全部分完。");
      }
    });
  }

  function guideShell(title, description, content, buttonText) {
    return `
      <section class="scene activity-scene">
        <div class="scene-heading">
          <span class="task-pill">亲手发现</span>
          <h2>${title}</h2>
          <p>${description}</p>
        </div>
        <div class="guide-stage">${content}</div>
        <div class="scene-actions">
          <span class="hint" id="guideMessage">试试看会发生什么</span>
          <button class="primary-button" id="guideAction">${buttonText}</button>
          <button class="primary-button" id="guidePractice" hidden>开始 8 道练习</button>
        </div>
      </section>`;
  }

  function finishGuide(actionButton, message) {
    actionButton.hidden = true;
    document.querySelector("#guidePractice").hidden = false;
    document.querySelector("#guideMessage").textContent = message;
    successSound();
    document.querySelector("#guidePractice").addEventListener("click", beginPractice, { once: true });
  }

  function beginPractice() {
    state.practiceIndex = 0;
    state.practiceErrors = 0;
    navigate("practice");
  }

  function renderPractice() {
    const lesson = lessonData[state.chapter];
    const task = lesson.tasks[state.practiceIndex];
    const progress = 35 + state.practiceIndex * 6;
    setHeader(`第${cnNumber(state.chapter)}章 · ${chapters[state.chapter - 1].title}`, progress, `练习 ${state.practiceIndex + 1}/8`);

    if (state.chapter === 2) {
      renderPlacePractice(task);
      return;
    }
    renderArithmeticPractice(task);
  }

  function renderPlacePractice(target) {
    const targetTens = Math.floor(target / 10);
    const targetOnes = target % 10;
    game.innerHTML = `
      <section class="scene practice-scene">
        ${practiceHeader(`把 ${target} 整理到位值仓库`, "分别选择需要几捆十和几根一。")}
        <div class="practice-visual">${baseBlocksHTML(target)}</div>
        <div class="place-answer">
          ${stepperHTML("tensAnswer", "十位 · 整捆", 0, 9)}
          <div class="big-plus">+</div>
          ${stepperHTML("onesAnswer", "个位 · 散根", 0, 9)}
        </div>
        <div class="equation-strip" id="placeEquation">0 个十 + 0 个一 = 0</div>
        ${practiceActions()}
      </section>`;
    document.querySelectorAll(".stepper-button").forEach(button => button.addEventListener("click", () => {
      const input = document.querySelector(`#${button.dataset.target}`);
      input.value = Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value) + Number(button.dataset.delta)));
      const tens = Number(document.querySelector("#tensAnswer").value);
      const ones = Number(document.querySelector("#onesAnswer").value);
      document.querySelector("#placeEquation").textContent = `${tens} 个十 + ${ones} 个一 = ${tens * 10 + ones}`;
      tone(280 + (tens + ones) * 12, .07, "triangle", .025);
    }));
    bindPracticeCheck(() => {
      const tens = Number(document.querySelector("#tensAnswer").value);
      const ones = Number(document.querySelector("#onesAnswer").value);
      return {
        correct: tens === targetTens && ones === targetOnes,
        hint: tens !== targetTens ? `先数一数能装满多少个“十”。` : `整捆对了，再看看还剩几根。`
      };
    });
  }

  function renderArithmeticPractice(task) {
    const [a, b] = task;
    const isDivision = state.chapter === 6;
    const answer = state.chapter === 3 ? a + b : state.chapter === 4 ? a - b : state.chapter === 5 ? a * b : Math.floor(a / b);
    const remainder = isDivision ? a % b : 0;
    const symbol = chapters[state.chapter - 1].symbol;
    const wording = state.chapter === 3 ? "汇合后共有多少？" :
      state.chapter === 4 ? "取走后还剩多少？" :
      state.chapter === 5 ? `${a} 排，每排 ${b} 个，一共有多少？` :
      `${a} 个平均分成 ${b} 组，每组多少？`;

    game.innerHTML = `
      <section class="scene practice-scene">
        ${practiceHeader(`${a} ${symbol} ${b} = ?`, wording)}
        <div class="practice-visual">${operationVisual(state.chapter, a, b)}</div>
        <div class="answer-zone">
          <label><span>${isDivision ? "每组" : "答案"}</span><input class="number-answer" id="numberAnswer" type="number" inputmode="numeric" min="0" max="9999" placeholder="?"></label>
          ${isDivision ? `<label><span>余数</span><input class="number-answer small" id="remainderAnswer" type="number" inputmode="numeric" min="0" max="${b - 1}" value="0"></label>` : ""}
        </div>
        ${practiceActions()}
      </section>`;
    bindPracticeCheck(() => {
      const entered = Number(document.querySelector("#numberAnswer").value);
      const enteredRemainder = isDivision ? Number(document.querySelector("#remainderAnswer").value) : 0;
      const correct = entered === answer && enteredRemainder === remainder;
      return { correct, hint: practiceHint(state.chapter, a, b, answer, remainder) };
    });
    document.querySelectorAll(".number-answer").forEach(input => input.addEventListener("keydown", event => {
      if (event.key === "Enter") document.querySelector("#checkAnswer").click();
    }));
  }

  function practiceHeader(title, subtitle) {
    return `
      <div class="practice-top">
        <span class="task-pill">第 ${state.practiceIndex + 1} / 8 题</span>
        <div class="practice-dots">${lessonData[state.chapter].tasks.map((_, index) => `<i class="${index < state.practiceIndex ? "done" : index === state.practiceIndex ? "current" : ""}"></i>`).join("")}</div>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>`;
  }

  function practiceActions() {
    return `
      <div class="practice-feedback" id="practiceFeedback">可以观察图形，也可以用自己的方法计算。</div>
      <div class="scene-actions">
        <button class="secondary-button" id="showHint">给我一点提示</button>
        <button class="primary-button" id="checkAnswer">检查答案</button>
      </div>`;
  }

  function bindPracticeCheck(evaluate) {
    let lastHint = "再观察一下图形中的分组和位置。";
    let solved = false;
    document.querySelector("#showHint").addEventListener("click", () => {
      document.querySelector("#practiceFeedback").textContent = lastHint;
      tone(260, .12, "triangle", .03);
    });
    document.querySelector("#checkAnswer").addEventListener("click", event => {
      if (solved) {
        state.practiceIndex += 1;
        if (state.practiceIndex >= 8) navigate("sandbox");
        else renderPractice();
        return;
      }
      const result = evaluate();
      lastHint = result.hint;
      if (!result.correct) {
        state.practiceErrors += 1;
        document.querySelector("#practiceFeedback").textContent = result.hint;
        shake(document.querySelector(".answer-zone, .place-answer"));
        tone(160, .16, "square", .02);
        return;
      }
      solved = true;
      successSound();
      document.querySelector("#practiceFeedback").innerHTML = `<strong>发现得很准确！</strong> ${answerExplanation()}`;
      event.currentTarget.textContent = state.practiceIndex === 7 ? "进入自由实验" : "下一题";
    });
  }

  function answerExplanation() {
    if (state.chapter === 2) return "整捆放十位，散根放个位。";
    if (state.chapter === 3) return "合并后按位重新打包。";
    if (state.chapter === 4) return "需要时先拆开一个高位单位。";
    if (state.chapter === 5) return "行数 × 每行数量就是总数。";
    return "商表示每组数量，余数表示还不能完整分入的小部分。";
  }

  function practiceHint(chapter, a, b, answer, remainder) {
    if (chapter === 3) return `先把个位 ${a % 10} 和 ${b % 10} 合起来；满 10 就换成 1 个十。`;
    if (chapter === 4) return a % 10 < b % 10 ? `个位不够取，先把 1 个十拆成 10 个一。` : `先从个位取走，再处理十位和百位。`;
    if (chapter === 5) return a > 10 ? `可以把 ${a} 拆成 ${Math.floor(a / 10) * 10} + ${a % 10}，分别乘 ${b}。` : `把 ${b} 重复相加 ${a} 次，或观察点阵。`;
    return remainder ? `${b} × ${answer} = ${answer * b}，离 ${a} 还差 ${remainder}。` : `想一想：${b} 乘几能得到 ${a}？`;
  }

  function renderSandbox() {
    const chapter = chapters[state.chapter - 1];
    setHeader(`第${cnNumber(state.chapter)}章 · ${chapter.title}`, 88, "自由实验");
    if (state.chapter === 2) renderPlaceSandbox();
    else if (state.chapter === 5) renderMultiplySandbox();
    else if (state.chapter === 6) renderDivisionSandbox();
    else renderAddSubtractSandbox();
  }

  function sandboxShell(title, description, controls, visual) {
    game.innerHTML = `
      <section class="scene sandbox-scene">
        <div class="scene-heading">
          <span class="task-pill">自由玩法 · 不限次数</span>
          <h2>${title}</h2>
          <p>${description}</p>
        </div>
        <div class="sandbox-controls">${controls}</div>
        <div class="sandbox-visual" id="sandboxVisual">${visual}</div>
        <div class="scene-actions">
          <button class="secondary-button" id="newRandom">随机给我一个</button>
          <button class="primary-button" id="finishSandbox">我已经探索好了</button>
        </div>
      </section>`;
    document.querySelector("#finishSandbox").addEventListener("click", () => completeChapter(state.chapter));
  }

  function renderPlaceSandbox() {
    sandboxShell(
      "位值仓库",
      "拖动数字，观察同一个量怎样被分成百、十和一。",
      `<label class="range-control"><span>选择数量</span><input id="placeRange" type="range" min="0" max="999" value="246"><output id="placeOutput">246</output></label>`,
      placeSandboxVisual(246)
    );
    const range = document.querySelector("#placeRange");
    range.addEventListener("input", () => {
      document.querySelector("#placeOutput").textContent = range.value;
      document.querySelector("#sandboxVisual").innerHTML = placeSandboxVisual(Number(range.value));
      tone(220 + Number(range.value) % 12 * 20, .05, "sine", .015);
    });
    document.querySelector("#newRandom").addEventListener("click", () => {
      range.value = Math.floor(Math.random() * 1000);
      range.dispatchEvent(new Event("input"));
    });
  }

  function renderAddSubtractSandbox() {
    const symbol = state.chapter === 3 ? "+" : "−";
    const initialA = state.chapter === 3 ? 126 : 342;
    const initialB = state.chapter === 3 ? 75 : 168;
    sandboxShell(
      state.chapter === 3 ? "自由汇合实验室" : "自由取走实验室",
      "改变两个数量，按自己的节奏观察每一位发生了什么。",
      `<div class="dual-range">
        <label class="range-control"><span>第一个数</span><input id="rangeA" type="range" min="0" max="999" value="${initialA}"><output>${initialA}</output></label>
        <label class="range-control"><span>${state.chapter === 3 ? "第二个数" : "取走数量"}</span><input id="rangeB" type="range" min="0" max="999" value="${initialB}"><output>${initialB}</output></label>
      </div>`,
      sandboxEquationVisual(initialA, initialB, symbol)
    );
    const update = () => {
      const a = Number(document.querySelector("#rangeA").value);
      const bInput = document.querySelector("#rangeB");
      if (state.chapter === 4) bInput.max = a;
      const b = Math.min(Number(bInput.value), a);
      bInput.value = b;
      document.querySelector("#rangeA").nextElementSibling.textContent = a;
      bInput.nextElementSibling.textContent = b;
      document.querySelector("#sandboxVisual").innerHTML = sandboxEquationVisual(a, b, symbol);
    };
    document.querySelectorAll(".dual-range input").forEach(input => input.addEventListener("input", update));
    document.querySelector("#newRandom").addEventListener("click", () => {
      const a = Math.floor(Math.random() * 900) + 50;
      const b = state.chapter === 3 ? Math.floor(Math.random() * 500) : Math.floor(Math.random() * (a + 1));
      document.querySelector("#rangeA").value = a;
      document.querySelector("#rangeB").value = b;
      update();
    });
  }

  function renderMultiplySandbox() {
    sandboxShell(
      "兔子方阵实验室",
      "改变排数和每排数量，再旋转阵列看看总数是否改变。",
      `<div class="dual-range">
        <label class="range-control"><span>排数</span><input id="rangeA" type="range" min="1" max="20" value="6"><output>6</output></label>
        <label class="range-control"><span>每排</span><input id="rangeB" type="range" min="1" max="20" value="8"><output>8</output></label>
      </div>`,
      multiplySandboxVisual(6, 8)
    );
    const update = () => {
      const a = Number(document.querySelector("#rangeA").value);
      const b = Number(document.querySelector("#rangeB").value);
      document.querySelector("#rangeA").nextElementSibling.textContent = a;
      document.querySelector("#rangeB").nextElementSibling.textContent = b;
      document.querySelector("#sandboxVisual").innerHTML = multiplySandboxVisual(a, b);
    };
    document.querySelectorAll(".dual-range input").forEach(input => input.addEventListener("input", update));
    document.querySelector("#newRandom").textContent = "旋转方阵";
    document.querySelector("#newRandom").addEventListener("click", () => {
      const a = document.querySelector("#rangeA");
      const b = document.querySelector("#rangeB");
      [a.value, b.value] = [b.value, a.value];
      update();
    });
  }

  function renderDivisionSandbox() {
    sandboxShell(
      "公平分组实验室",
      "改变总数和组数，观察每组数量与余数。余数不是错误，它是还没组成完整一轮的部分。",
      `<div class="dual-range">
        <label class="range-control"><span>总数</span><input id="rangeA" type="range" min="1" max="200" value="47"><output>47</output></label>
        <label class="range-control"><span>分成几组</span><input id="rangeB" type="range" min="1" max="12" value="6"><output>6</output></label>
      </div>`,
      divisionSandboxVisual(47, 6)
    );
    const update = () => {
      const a = Number(document.querySelector("#rangeA").value);
      const b = Number(document.querySelector("#rangeB").value);
      document.querySelector("#rangeA").nextElementSibling.textContent = a;
      document.querySelector("#rangeB").nextElementSibling.textContent = b;
      document.querySelector("#sandboxVisual").innerHTML = divisionSandboxVisual(a, b);
    };
    document.querySelectorAll(".dual-range input").forEach(input => input.addEventListener("input", update));
    document.querySelector("#newRandom").addEventListener("click", () => {
      document.querySelector("#rangeA").value = Math.floor(Math.random() * 180) + 12;
      document.querySelector("#rangeB").value = Math.floor(Math.random() * 11) + 2;
      update();
    });
  }

  function completeChapter(chapter) {
    saveCompletion(chapter);
    state.chapter = chapter;
    navigate("chapter-ending");
  }

  function renderChapterEnding() {
    const chapter = chapters[state.chapter - 1];
    const insight = state.chapter === 1
      ? "符号不只是答案。0 让“确定地没有”与“尚未记录”变得不同。"
      : lessonData[state.chapter].insight;
    setHeader(`第${cnNumber(state.chapter)}章 · ${chapter.title}`, 100, "这一枝长成了");
    game.innerHTML = `
      <section class="scene mastery-scene" style="--chapter-color:${chapter.color}">
        <div class="mastery-branch">
          <div class="mastery-leaves"></div>
          <div class="mastery-fruit">${chapter.symbol}</div>
        </div>
        <div class="mastery-copy">
          <span class="next-chip">第 ${state.chapter} 章完成</span>
          <h2>${chapter.title}已经长进数学之树</h2>
          <p>${insight}</p>
          ${state.chapter > 1 ? `<div class="mastery-stats"><strong>8</strong><span>道递进练习</span><strong>${state.practiceErrors}</strong><span>次从错误中重新发现</span></div>` : ""}
          <div class="mastery-actions">
            <button class="secondary-button" id="backMap">返回章节地图</button>
            ${state.chapter < 6 ? `<button class="primary-button" id="nextChapter">继续第 ${state.chapter + 1} 章</button>` : `<button class="primary-button" id="replayPractice">再玩一次自由分组</button>`}
          </div>
        </div>
      </section>`;
    successSound();
    document.querySelector("#backMap").addEventListener("click", () => navigate("map"));
    if (state.chapter < 6) {
      document.querySelector("#nextChapter").addEventListener("click", () => startChapter(state.chapter + 1));
    } else {
      document.querySelector("#replayPractice").addEventListener("click", () => navigate("sandbox"));
    }
  }

  function operationVisual(chapter, a, b) {
    if (chapter === 3) {
      return `<div class="visual-pair"><div><span>${a}</span>${baseBlocksHTML(a)}</div><b>+</b><div><span>${b}</span>${baseBlocksHTML(b)}</div></div>`;
    }
    if (chapter === 4) {
      return `<div class="visual-pair subtraction-preview"><div><span>从 ${a} 开始</span>${baseBlocksHTML(a)}</div><b>取走 ${b}</b></div>`;
    }
    if (chapter === 5) {
      if (a * b <= 100) return `<div class="dot-array practice-array" style="--cols:${b}">${dotsHTML(a * b)}</div>`;
      const tens = Math.floor(a / 10) * 10;
      const ones = a % 10;
      return `<div class="area-model"><div style="flex:${tens}"><strong>${tens} × ${b}</strong></div>${ones ? `<div style="flex:${ones}"><strong>${ones} × ${b}</strong></div>` : ""}</div><small class="visual-note">把 ${a} 拆成 ${tens}${ones ? ` + ${ones}` : ""}</small>`;
    }
    const q = Math.floor(a / b);
    const r = a % b;
    return `<div class="division-preview">${Array.from({ length: Math.min(b, 12) }, (_, i) => `<div><span>第${i + 1}组</span>${dotsHTML(Math.min(q, 12))}</div>`).join("")}</div>${q > 12 ? `<small class="visual-note">每组的点很多，图中只展示前 12 个</small>` : ""}${r ? `<div class="remainder-preview">还剩 ${dotsHTML(r)}</div>` : ""}`;
  }

  function placeSandboxVisual(value) {
    const hundreds = Math.floor(value / 100);
    const tens = Math.floor((value % 100) / 10);
    const ones = value % 10;
    return `
      <div class="place-table">
        <div><strong>${hundreds}</strong><span>百位</span><div class="hundreds-mini">${"▦".repeat(hundreds)}</div></div>
        <div><strong>${tens}</strong><span>十位</span><div>${bundlesHTML(tens)}</div></div>
        <div><strong>${ones}</strong><span>个位</span><div class="sandbox-ones">${onesHTML(ones)}</div></div>
      </div>
      <div class="sandbox-equation">${hundreds} × 100 + ${tens} × 10 + ${ones} = <strong>${value}</strong></div>`;
  }

  function sandboxEquationVisual(a, b, symbol) {
    const result = symbol === "+" ? a + b : a - b;
    return `<div class="sandbox-equation huge">${a} ${symbol} ${b} = <strong>${result}</strong></div><div class="result-blocks">${baseBlocksHTML(result)}</div><p class="visual-note">${placeDescription(result)}</p>`;
  }

  function multiplySandboxVisual(a, b) {
    const total = a * b;
    const visual = total <= 144
      ? `<div class="dot-array sandbox-array" style="--cols:${b}">${dotsHTML(total)}</div>`
      : `<div class="area-model"><div><strong>${a} 排 × ${b} 个</strong></div></div>`;
    return `${visual}<div class="sandbox-equation huge">${a} × ${b} = <strong>${total}</strong></div>`;
  }

  function divisionSandboxVisual(total, groups) {
    const quotient = Math.floor(total / groups);
    const remainder = total % groups;
    return `
      <div class="sandbox-groups">${Array.from({ length: groups }, (_, i) => `<div><span>${i + 1}</span><strong>${quotient}</strong><small>个</small></div>`).join("")}</div>
      ${remainder ? `<div class="remainder-bowl"><span>余下</span>${dotsHTML(remainder)}</div>` : ""}
      <div class="sandbox-equation huge">${total} ÷ ${groups} = <strong>${quotient}</strong>${remainder ? ` 余 <strong>${remainder}</strong>` : ""}</div>`;
  }

  function baseBlocksHTML(value) {
    const hundreds = Math.min(9, Math.floor(value / 100));
    const tens = Math.min(9, Math.floor((value % 100) / 10));
    const ones = value % 10;
    return `<div class="base-blocks" aria-label="${placeDescription(value)}">
      <div class="hundreds-blocks">${Array.from({ length: hundreds }, () => `<i class="hundred-flat"></i>`).join("")}</div>
      <div class="tens-blocks">${Array.from({ length: tens }, () => `<i class="ten-rod"></i>`).join("")}</div>
      <div class="ones-blocks">${onesHTML(ones)}</div>
    </div>`;
  }

  function placeDescription(value) {
    return `${Math.floor(value / 100)} 个百、${Math.floor((value % 100) / 10)} 个十、${value % 10} 个一`;
  }

  function sticksHTML(count) {
    return Array.from({ length: count }, (_, index) => `<i class="loose-stick" style="--tilt:${(index % 5) - 2}deg"></i>`).join("");
  }

  function bundlesHTML(count) {
    return Array.from({ length: count }, () => `<i class="stick-bundle"></i>`).join("");
  }

  function onesHTML(count) {
    return Array.from({ length: count }, () => `<i class="one-cube"></i>`).join("");
  }

  function dotsHTML(count) {
    return Array.from({ length: count }, () => `<i class="math-dot"></i>`).join("");
  }

  function stepperHTML(id, label, min, max) {
    return `<div class="number-stepper"><span>${label}</span><button class="stepper-button" data-target="${id}" data-delta="-1" aria-label="减少">−</button><input id="${id}" type="number" value="0" min="${min}" max="${max}" readonly><button class="stepper-button" data-target="${id}" data-delta="1" aria-label="增加">+</button></div>`;
  }

  function shake(element) {
    if (!element) return;
    element.classList.remove("ambiguous");
    void element.offsetWidth;
    element.classList.add("ambiguous");
  }

  function cnNumber(number) {
    return ["一", "二", "三", "四", "五", "六"][number - 1] || number;
  }

  function render() {
    const renderers = {
      intro: renderIntro,
      map: renderMap,
      count: renderCount,
      pens: renderPens,
      zero: renderZero,
      record: renderRecord,
      "chapter-intro": renderChapterIntro,
      guide: renderGuide,
      practice: renderPractice,
      sandbox: renderSandbox,
      "chapter-ending": renderChapterEnding
    };
    renderers[state.scene]();
  }

  soundButton.addEventListener("click", () => {
    state.sound = !state.sound;
    localStorage.setItem("mathBeautySound", state.sound ? "on" : "off");
    soundIcon.textContent = state.sound ? "♪" : "×";
    soundButton.setAttribute("aria-label", state.sound ? "关闭声音" : "打开声音");
    if (state.sound) tone(440, .14, "sine");
  });

  homeButton.addEventListener("click", () => navigate(state.scene === "intro" ? "intro" : "map"));
  soundIcon.textContent = state.sound ? "♪" : "×";

  // 方便开发时直接检查某个章节页面，例如：?chapter=5&scene=practice
  const previewParams = new URLSearchParams(location.search);
  const previewChapter = Number(previewParams.get("chapter"));
  const previewScene = previewParams.get("scene");
  const previewScenes = ["map", "chapter-intro", "guide", "practice", "sandbox", "chapter-ending", "pens", "record"];
  if (previewChapter >= 1 && previewChapter <= 6) state.chapter = previewChapter;
  if (previewScenes.includes(previewScene)) state.scene = previewScene;

  render();
  if (previewParams.has("metrics")) {
    const scene = document.querySelector(".scene");
    const grid = document.querySelector(".chapter-grid");
    document.body.dataset.previewMetrics = [
      `viewport:${document.documentElement.clientWidth}`,
      `body:${document.body.scrollWidth}`,
      `scene:${scene ? Math.round(scene.getBoundingClientRect().width) : 0}`,
      `grid:${grid ? Math.round(grid.getBoundingClientRect().width) : 0}`
    ].join(",");
  }

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
})();
