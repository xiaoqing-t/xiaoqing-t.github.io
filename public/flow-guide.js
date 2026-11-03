/* 两页 Archify 流程图的导读与逐步读图。
   页面用 <script src="/flow-guide.js" data-flow="boot|epoll"> 引入，
   配置写在本文件里，避免再往 700KB 的生成页里塞第二份逻辑。 */
(function () {
  'use strict';

  var CONFIGS = {
    boot: {
      guide: {
        headline: '两栏并排比，QEMU 多出来的格子就是省下的时间',
        lead:
          '这张图只回答一个问题：同样从开机到 login，StratoVirt 为什么快 3.3 秒？先横着看同一阶段的两条泳道，再注意 QEMU 独有、StratoVirt 空着的那一列。圆点里的数字是阶段号，两边同号对读；下方「下一步」会按阶段依次高亮。',
        facts: [
          ['QEMU', '13.6 s', '固件 + GRUB'],
          ['StratoVirt', '10.3 s', '自研引导，无固件'],
          ['净差', '3.3 s', '主要在第 2 阶段']
        ]
      },
      steps: [
        {
          phase: '① 起点',
          text: '两边都是宿主机上的普通进程，都通过 KVM 建一台 VM、一块内存、一个 vCPU；这一步耗时接近。',
          nodes: ['q_proc', 's_proc'],
          edges: [],
          card: 0
        },
        {
          phase: '② 引导阶段',
          text:
            'QEMU 先跑 SeaBIOS 摸硬件、造 E820，再让 GRUB 装载内核；StratoVirt 用自研 BootLoader 直接算好布局跳进内核。3.3 秒的差主要在这里。',
          nodes: ['q_seabios', 'q_grub', 's_boot'],
          edges: ['q1', 'q2', 's1'],
          card: 1
        },
        {
          phase: '③ 内核启动',
          text:
            'QEMU 0.74 s（带 initrd），StratoVirt 1.14 s（裸内核）。这一项 QEMU 反而快 0.4 s，不应算作 VMM 的效率。',
          nodes: ['q_kernel', 's_kernel'],
          edges: ['q3', 's2'],
          card: 2
        },
        {
          phase: '④ 用户态',
          text:
            '两边都进入 systemd 多用户。StratoVirt 客户机没有网卡，networkd-wait-online 会空等两分钟，所以这项数据不可用。',
          nodes: ['q_user', 's_user'],
          edges: ['q4', 's3'],
          card: 3
        },
        {
          phase: '⑤ 到 login',
          text:
            'QEMU 13.6 s，StratoVirt 10.3 s。省下的 3.3 s 对应第 2 列空出的固件和 GRUB；代价是没有 PCI 设备、热插拔和显卡。',
          nodes: ['q_login', 's_login'],
          edges: ['q5', 's4'],
          card: 4
        }
      ],
      nodePhases: {
        q_proc: 1,
        s_proc: 1,
        q_seabios: 2,
        q_grub: 2,
        s_boot: 2,
        q_kernel: 3,
        s_kernel: 3,
        q_user: 4,
        s_user: 4,
        q_login: 5,
        s_login: 5
      },
      time: {
        qemu: 13.6,
        strato: 10.3,
        note:
          '条形按 10 次均值总时长等比。固件与 GRUB 没有单独计时，所以图中不虚构分段；QEMU 比 StratoVirt 多出的那一截是净差 3.3 s——引导省下的时间减去内核多花的 0.4 s。',
        segs: [
          ['内核', 'QEMU 0.74 s · StratoVirt 1.14 s', '这一项 QEMU 反而快 0.4 s'],
          ['固件 + GRUB', '只在 QEMU 侧', '没有单独计时，包含在净差里'],
          ['用户态', '两侧都是 systemd', 'StratoVirt 的 2 分钟空等不计入']
        ]
      }
    },

    epoll: {
      guide: {
        headline: '沿箭头 1→9 走一圈，不是从左往右读',
        lead:
          '这张图只回答一件事：一次客户机读盘，宿主侧的 VMM 怎么用一个线程等到完成事件。1–2 只在启动时登记一次，3–9 每读一次盘都走一遍；第 9 步已经不属于 epoll。下方「下一步」会按编号依次高亮。',
        facts: [
          ['消息', '9 条', '一次读盘走一圈'],
          ['线程', '1 个', 'epoll_wait 等所有 fd'],
          ['只做一次', '1–2 步', '启动时登记回调']
        ]
      },
      steps: [
        {
          phase: '① 注册（只做一次）',
          text: 'VMM 调用 epoll_ctl，把完成口 fd 交给内核：这个 fd 有动静要通知我。只在启动时做一次。',
          edge: 'ctl',
          card: 0
        },
        {
          phase: '① 注册（只做一次）',
          text: '内核把 fd 记进登记表，并在它上面挂一个回调；以后条件满足时，内核自己调用这个回调。',
          edge: 'hook',
          card: 0
        },
        {
          phase: '② 客户机发起',
          text: '客户机把读请求写进共享的 virtio 队列，然后 kick，陷入宿主 VMM。客户机并不知道自己在虚拟机里。',
          edge: 'kick',
          card: 1
        },
        {
          phase: '② 客户机发起',
          text: 'VMM 把请求翻译成宿主机上的异步 I/O，提交给块层和驱动。',
          edge: 'submit',
          card: 1
        },
        {
          phase: '③ 磁盘完成',
          text: '磁盘读完，驱动向完成通知 eventfd 写入一个数，等于说「我好了」。',
          edge: 'done',
          card: 2
        },
        {
          phase: '③ 磁盘完成',
          text: '内核调用之前挂好的回调：把 fd 挂进就绪清单、唤醒等待线程；回调不搬数据。',
          edge: 'callback',
          card: 2
        },
        {
          phase: '④ 唤醒并取结果',
          text: 'epoll_wait 返回，VMM 从就绪清单里知道哪个 fd 可读。',
          edge: 'wake',
          card: 3
        },
        {
          phase: '④ 唤醒并取结果',
          text: 'VMM 自己调用 read() 把结果取走。epoll 只负责上报，不搬业务数据。',
          edge: 'read',
          card: 3
        },
        {
          phase: '⑤ 通知客户机',
          text: 'VMM 把结果写回共享内存并注入中断；客户机的 read() 这时才返回。这一步已经不属于 epoll。',
          edge: 'inject',
          card: 4
        }
      ]
    }
  };

  var page = document.currentScript && document.currentScript.getAttribute('data-flow');
  var config = CONFIGS[page];

  if (!config) return;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    window.setTimeout(function () {
      try {
        init(config, page);
      } catch (error) {
        console.error('[flow-guide]', error);
      }
    }, 0);
  });

  function init(cfg, pageName) {
    var container = document.querySelector('.container');
    var header = container && container.querySelector('.header');
    var diagram = container && container.querySelector('.diagram-container');
    var svg = diagram && diagram.querySelector('svg');
    if (!header || !diagram || !svg) return;

    var stepCards = Array.prototype.slice.call(document.querySelectorAll('.cards .card'));
    var cardsWrap = document.querySelector('.cards');

    var allNodes = Array.prototype.slice.call(svg.querySelectorAll('[data-node-id]'));
    var allEdges = Array.prototype.slice.call(svg.querySelectorAll('[data-edge-id]'));

    var guide = buildGuide(cfg);
    header.insertAdjacentElement('afterend', guide);

    if (pageName === 'boot') addNodeBadges(svg, cfg.nodePhases);
    else addEdgeBadges(svg, cfg.steps);

    if (cfg.time) addTimeBar(diagram, cfg.time);

    var state = { mode: 'step', index: 0 };
    var countEl = guide.querySelector('[data-sg="count"]');
    var textEl = guide.querySelector('[data-sg="text"]');
    var prevBtn = guide.querySelector('[data-sg="prev"]');
    var nextBtn = guide.querySelector('[data-sg="next"]');
    var allBtn = guide.querySelector('[data-sg="all"]');

    prevBtn.addEventListener('click', function () {
      if (state.mode === 'all') return;
      state.index = Math.max(0, state.index - 1);
      render();
    });

    nextBtn.addEventListener('click', function () {
      if (state.mode === 'all') {
        state.mode = 'step';
        state.index = 0;
      } else {
        state.index = Math.min(cfg.steps.length - 1, state.index + 1);
      }
      render();
    });

    allBtn.addEventListener('click', function () {
      state.mode = 'all';
      render();
    });

    guide.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') prevBtn.click();
      else nextBtn.click();
    });

    function render() {
      var isAll = state.mode === 'all';
      if (cardsWrap) cardsWrap.classList.toggle('sg-step-mode', !isAll);
      svg.classList.toggle('sg-step-mode', !isAll);

      allNodes.concat(allEdges).forEach(function (el) {
        el.classList.remove('sg-dim', 'sg-active');
      });
      stepCards.forEach(function (card) {
        card.classList.remove('sg-card-on');
      });

      prevBtn.disabled = isAll || state.index === 0;
      nextBtn.disabled = !isAll && state.index === cfg.steps.length - 1;
      allBtn.disabled = isAll;

      if (isAll) {
        countEl.textContent = '全图';
        textEl.textContent = '已显示全部步骤。点「下一步」从第 1 步重新开始。';
        return;
      }

      var step = cfg.steps[state.index];
      var activeNodes = [];
      var activeEdges = [];

      if (step.edge) {
        var edge = svg.querySelector('[data-edge-id="' + step.edge + '"]');
        if (edge) {
          activeEdges.push(edge);
          activeNodes.push(edge.getAttribute('data-edge-from'));
          activeNodes.push(edge.getAttribute('data-edge-to'));
        }
      } else {
        activeNodes = step.nodes || [];
        activeEdges = (step.edges || []).reduce(function (list, id) {
          return list.concat(Array.prototype.slice.call(svg.querySelectorAll('[data-edge-id="' + id + '"]')));
        }, []);
      }

      var activeNodeEls = activeNodes
        .map(function (id) {
          return svg.querySelector('[data-node-id="' + id + '"]');
        })
        .filter(Boolean);

      var activeSet = activeNodeEls.concat(activeEdges);

      allNodes.concat(allEdges).forEach(function (el) {
        if (activeSet.indexOf(el) !== -1) el.classList.add('sg-active');
        else el.classList.add('sg-dim');
      });

      if (stepCards[step.card]) stepCards[step.card].classList.add('sg-card-on');

      countEl.textContent =
        '第 ' + (state.index + 1) + ' / ' + cfg.steps.length + ' 步 · ' + step.phase;
      textEl.textContent = step.text;
    }

    render();
  }

  function buildGuide(cfg) {
    var guide = document.createElement('section');
    guide.className = 'sg-guide';
    guide.setAttribute('aria-labelledby', 'sg-guide-title');

    var facts = cfg.guide.facts
      .map(function (fact, index) {
        return (
          '<div class="sg-fact' + (index === 2 ? ' sg-fact-gap' : '') + '">' +
          '<span>' + fact[0] + '</span>' +
          '<strong>' + fact[1] + '</strong>' +
          '<small>' + fact[2] + '</small>' +
          '</div>'
        );
      })
      .join('');

    guide.innerHTML =
      '<div class="sg-guide-grid">' +
      '<div>' +
      '<span class="sg-eyebrow">先读这个</span>' +
      '<h2 class="sg-headline" id="sg-guide-title">' + cfg.guide.headline + '</h2>' +
      '<p class="sg-lead">' + cfg.guide.lead + '</p>' +
      '</div>' +
      '<div class="sg-facts">' + facts + '</div>' +
      '</div>' +
      '<div class="sg-stepbar" role="group" aria-label="逐步读图">' +
      '<div class="sg-step-copy">' +
      '<span class="sg-step-count" data-sg="count" aria-live="polite"></span>' +
      '<p class="sg-step-text" data-sg="text" aria-live="polite"></p>' +
      '</div>' +
      '<div class="sg-step-buttons">' +
      '<button type="button" class="sg-btn" data-sg="prev">上一步</button>' +
      '<button type="button" class="sg-btn sg-btn-primary" data-sg="next">下一步</button>' +
      '<button type="button" class="sg-btn" data-sg="all">看全图</button>' +
      '</div>' +
      '</div>';

    return guide;
  }

  function addEdgeBadges(svg, steps) {
    steps.forEach(function (step, index) {
      var group = svg.querySelector('[data-edge-id="' + step.edge + '"]');
      if (!group) return;
      var label = group.querySelector('g[data-detail="context"]');
      if (!label) return;
      var rect = label.querySelector('rect');
      if (!rect) return;

      var x = parseFloat(rect.getAttribute('x'));
      var y = parseFloat(rect.getAttribute('y'));
      var width = parseFloat(rect.getAttribute('width'));
      var height = parseFloat(rect.getAttribute('height'));

      rect.setAttribute('x', String(x - 24));
      rect.setAttribute('width', String(width + 24));

      var badge = makeBadge(x - 12, y + height / 2, index + 1);
      label.insertBefore(badge, rect);
    });
  }

  function addNodeBadges(svg, phaseMap) {
    Object.keys(phaseMap).forEach(function (id) {
      var node = svg.querySelector('[data-node-id="' + id + '"]');
      if (!node) return;
      var rect = node.querySelector('rect');
      if (!rect) return;

      var x = parseFloat(rect.getAttribute('x'));
      var y = parseFloat(rect.getAttribute('y'));
      var width = parseFloat(rect.getAttribute('width'));

      node.appendChild(makeBadge(x + width - 10, y + 10, phaseMap[id]));
    });
  }

  function makeBadge(cx, cy, value) {
    var NS = 'http://www.w3.org/2000/svg';
    var group = document.createElementNS(NS, 'g');
    group.setAttribute('class', 'sg-badge');
    group.setAttribute('aria-hidden', 'true');

    var circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', '8.5');

    var text = document.createElementNS(NS, 'text');
    text.setAttribute('x', String(cx));
    text.setAttribute('y', String(cy + 0.5));
    text.textContent = String(value);

    group.appendChild(circle);
    group.appendChild(text);
    return group;
  }

  function addTimeBar(diagram, time) {
    var stratoPercent = (time.strato / time.qemu) * 100;
    var gapPercent = 100 - stratoPercent;

    var segs = time.segs
      .map(function (seg) {
        return (
          '<div class="sg-seg">' +
          '<strong>' + seg[0] + '</strong> ' + seg[1] +
          '<small>' + seg[2] + '</small>' +
          '</div>'
        );
      })
      .join('');

    var section = document.createElement('section');
    section.className = 'sg-time';
    section.setAttribute('aria-labelledby', 'sg-time-title');
    section.innerHTML =
      '<span class="sg-eyebrow">时间条</span>' +
      '<h3 id="sg-time-title">13.6 s 对 10.3 s（10 次均值，条形按比例）</h3>' +
      '<div class="sg-bars" role="img" aria-label="QEMU 13.6 秒，StratoVirt 10.3 秒，净差 3.3 秒">' +
      '<span class="sg-bar-label">QEMU</span>' +
      '<div class="sg-bar-track">' +
      '<div class="sg-bar-fill qemu" style="width:100%"></div>' +
      '<div class="sg-gap" style="left:' + stratoPercent.toFixed(2) + '%;width:' + gapPercent.toFixed(2) + '%">净差 3.3 s</div>' +
      '</div>' +
      '<span class="sg-bar-value">13.6 s</span>' +
      '<span class="sg-bar-label">StratoVirt</span>' +
      '<div class="sg-bar-track">' +
      '<div class="sg-bar-fill strato" style="width:' + stratoPercent.toFixed(2) + '%"></div>' +
      '</div>' +
      '<span class="sg-bar-value">10.3 s</span>' +
      '</div>' +
      '<p class="sg-time-note">' + time.note + '</p>' +
      '<div class="sg-segments">' + segs + '</div>';

    diagram.insertAdjacentElement('afterend', section);
  }
})();
