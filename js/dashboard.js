/* =========================================================
   dashboard.js — 교사용 결과 공개 대시보드
   비밀번호 → 반 선택 → 단계별 통계 + 학생 결과 카드 (비교·JPG 저장) + 답변 모아보기
   ========================================================= */
GL.Dash = {
  pw: '',
  roster: [],
  subs: {},      // 학번 → 제출 기록
  cls: '',
  viewIds: [],   // 크게 보는 학생 (최대 2명)
  picking: false,
  ansQ: 'q1',    // 답변 모아보기: 보고 있는 질문
  ansLv: 0,      // 답변 모아보기: 형편 단계 필터 (0 = 전체)

  // 학생 화면(data-story.js)의 질문과 같은 순서 · 고르기 질문은 선택지와 색 이름(cls)을 함께 둠
  QUESTIONS: [
    { key: 'q1', short: 'Q1 내 카드', full: 'Q1. 내 형편 카드로 할 수 있었던 것과 할 수 없었던 것은? 그때 기분은?' },
    { key: 'q2', short: 'Q2 좋은 점·걱정', full: 'Q2. 유전자 편집 기술의 좋은 점 한 가지와 걱정되는 점 한 가지' },
    { key: 'q3', short: 'Q3 허용 범위', full: 'Q3. 유전자 편집을 어디까지 허용해야 할까요?',
      choices: ['전면 금지', '질병 치료만 허용', '능력 향상까지 허용'], cls: ['c-ban', 'c-treat', 'c-enh'] },
    { key: 'q4', short: 'Q4 책임', full: 'Q4. 의도하지 않은 변화가 생겼다면, 책임은 누구에게 있을까요?',
      choices: ['부모', '의사·회사', '국가'], cls: ['c-ban', 'c-border', 'c-treat'] },
    { key: 'q5', short: 'Q5 다시 투표', full: 'Q5. 내 형편을 알게 된 지금, 세율 투표를 다시 한다면?',
      choices: ['0%', '10%', '30%'], cls: ['c-r0', 'c-r10', 'c-r30'] },
    { key: 'q6', short: 'Q6 답장', full: 'Q6. 아이의 편지에 한 줄로 답장해 보세요.' }
  ],

  /* ---------- 불러오기 ---------- */
  unlock: async function () {
    var u = GL.util;
    var pw = u.$('pwInput').value.trim();
    if (!pw) { u.$('pwErr').textContent = '비밀번호를 입력해 주세요.'; return; }
    var btn = u.$('pwBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>여는 중';
    var res = await GL.api.call('dashboard', { pw: pw });
    btn.disabled = false;
    btn.textContent = '열기';
    if (!res.ok) { u.$('pwErr').textContent = res.msg; return; }
    GL.Dash.pw = pw;
    GL.Dash.load(res);
    u.$('lockScr').classList.add('hidden');
    u.$('dashScr').classList.remove('hidden');
    u.$('dashTools').classList.remove('hidden');
  },

  refresh: async function () {
    var btn = GL.util.$('refreshBtn');
    btn.disabled = true;
    btn.textContent = '불러오는 중';
    var res = await GL.api.call('dashboard', { pw: GL.Dash.pw });
    btn.disabled = false;
    btn.textContent = '새로고침';
    if (!res.ok) { GL.Dash.toast(res.msg); return; }
    GL.Dash.load(res);
    GL.Dash.toast('최신 결과를 불러왔어요');
  },

  load: function (res) {
    var D = GL.Dash;
    D.roster = res.roster || [];
    D.votes = res.votes || {};
    D.subs = {};
    (res.subs || []).forEach(function (s) { D.subs[s.id] = s; });

    // 반 목록 (학번 앞 두 자리)
    var classes = [];
    D.roster.forEach(function (r) {
      var c = r.id.substr(0, 2);
      if (classes.indexOf(c) < 0) classes.push(c);
    });
    classes.sort();
    if (!D.cls || classes.indexOf(D.cls) < 0) {
      D.cls = classes.filter(function (c) {
        return D.roster.some(function (r) { return r.id.substr(0, 2) === c && D.subs[r.id]; });
      })[0] || classes[0] || '';
    }
    var sel = GL.util.$('clsSelect');
    sel.innerHTML = classes.map(function (c) {
      return '<option value="' + c + '"' + (c === D.cls ? ' selected' : '') + '>' + c.charAt(0) + '학년 ' + c.charAt(1) + '반</option>';
    }).join('');
    D.render();
  },

  classRoster: function () {
    var D = GL.Dash;
    return D.roster.filter(function (r) { return r.id.substr(0, 2) === D.cls; })
      .sort(function (a, b) { return a.id < b.id ? -1 : 1; });
  },

  classSubs: function () {
    var D = GL.Dash;
    return D.classRoster().map(function (r) { return D.subs[r.id]; }).filter(Boolean);
  },

  /* ---------- 그리기 ---------- */
  render: function () {
    var D = GL.Dash;
    var subs = D.classSubs();
    GL.util.$('subCount').textContent = '제출 ' + subs.length + '/' + D.classRoster().length;
    D.renderEdit(subs);
    D.renderMoney(subs);
    D.renderEarn(subs);
    D.renderLoan(subs);
    D.renderVote();
    D.renderChoice(subs, 'q3', 'statQ3');
    D.renderChoice(subs, 'q4', 'statQ4');
    D.renderRevote(subs);
    D.renderChips();
    D.renderAnswers();
  },

  byLevel: function (subs) {
    var g = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    subs.forEach(function (s) { if (g[s.level]) g[s.level].push(s); });
    return g;
  },

  avg: function (list, key) {
    if (!list.length) return 0;
    return list.reduce(function (sum, s) { return sum + (Number(s[key]) || 0); }, 0) / list.length;
  },

  rowLabel: function (lv, n) {
    return '<div class="row-label"><span class="lv-chip lv' + lv + '">L' + lv + '</span>' +
      '<span class="lv-name">' + GL.LEVELS[lv].short + '</span><span class="muted mono small">' + n + '명</span></div>';
  },

  renderEdit: function (subs) {
    var D = GL.Dash;
    var g = D.byLevel(subs);
    var rows = [];
    var max = 1;
    [1, 2, 3, 4, 5].forEach(function (lv) {
      var t = D.avg(g[lv], 'treat'), b = D.avg(g[lv], 'border'), e = D.avg(g[lv], 'enhance');
      rows.push({ lv: lv, n: g[lv].length, t: t, b: b, e: e });
      max = Math.max(max, t + b + e);
    });
    GL.util.$('statEdit').innerHTML = rows.map(function (r) {
      var total = r.t + r.b + r.e;
      return '<div class="stat-row">' + D.rowLabel(r.lv, r.n) +
        '<div class="sbar">' +
          '<span class="seg-treat" style="width:' + (r.t / max * 100) + '%"></span>' +
          '<span class="seg-border" style="width:' + (r.b / max * 100) + '%"></span>' +
          '<span class="seg-enh" style="width:' + (r.e / max * 100) + '%"></span>' +
        '</div><span class="row-val mono">' + (r.n ? total.toFixed(1) + '개' : '—') + '</span></div>';
    }).join('');
  },

  renderMoney: function (subs) {
    var D = GL.Dash;
    var g = D.byLevel(subs);
    GL.util.$('statMoney').innerHTML = [1, 2, 3, 4, 5].map(function (lv) {
      var list = g[lv];
      var sideN = list.filter(function (s) { return s.side > 0; }).length;
      return '<div class="stat-row money-row">' + D.rowLabel(lv, list.length) +
        '<span class="mono money-val">' + (list.length ? GL.util.money(D.avg(list, 'spent')) : '—') + '</span>' +
        '<span class="mono muted small">예산 ' + GL.util.money(GL.LEVELS[lv].budget) + '</span>' +
        '<span class="row-val mono' + (sideN ? ' side-val' : '') + '">' + (list.length ? sideN + '명' : '—') + '</span></div>';
    }).join('');
  },

  renderEarn: function (subs) {
    var D = GL.Dash;
    var g = D.byLevel(subs);
    var max = GL.QUIZ_MAX || 500;
    GL.util.$('statEarn').innerHTML = [1, 2, 3, 4, 5].map(function (lv) {
      var list = g[lv];
      var avg = D.avg(list, 'earned');
      return '<div class="stat-row">' + D.rowLabel(lv, list.length) +
        '<div class="sbar"><span class="seg-earn" style="width:' + Math.min(100, avg / max * 100) + '%"></span></div>' +
        '<span class="row-val mono">' + (list.length ? Math.round(avg) + '만' : '—') + '</span></div>';
    }).join('');
  },

  renderLoan: function (subs) {
    var D = GL.Dash;
    var g = D.byLevel(subs);
    var max = 1;
    [1, 2, 3, 4, 5].forEach(function (lv) { max = Math.max(max, D.avg(g[lv], 'loan')); });
    GL.util.$('statLoan').innerHTML = [1, 2, 3, 4, 5].map(function (lv) {
      var list = g[lv];
      var avg = D.avg(list, 'loan');
      var rej = list.filter(function (s) { return s.supportStatus === '탈락'; }).length;
      return '<div class="stat-row loan-row">' + D.rowLabel(lv, list.length) +
        '<div class="sbar"><span class="seg-loan" style="width:' + (avg / max * 100) + '%"></span></div>' +
        '<span class="row-val mono">' + (list.length ? GL.util.money(Math.round(avg)).replace(' 원', '') : '—') + '</span>' +
        '<span class="row-val mono' + (rej ? ' side-val' : ' muted') + '">' + (list.length ? '탈락 ' + rej + '명' : '') + '</span></div>';
    }).join('');
  },

  /* ---------- 세율 투표 ---------- */
  renderVote: function () {
    var D = GL.Dash;
    var u = GL.util;
    var v = (D.votes || {})[D.cls] || { counts: { 0: 0, 10: 0, 30: 0 }, voted: 0, closed: false, rate: null };
    var total = D.classRoster().length;
    u.$('voteState').textContent = v.closed ? '확정: 세율 ' + v.rate + '%' : '진행 중 · ' + v.voted + '/' + total + '명 투표';
    var maxN = Math.max(1, v.voted);
    u.$('statVote').innerHTML = GL.POLICY.RATES.map(function (r) {
      var n = v.counts[r] || 0;
      var info = GL.POLICY.RATE_INFO[r];
      return '<div class="stat-row vote-row' + (v.closed && v.rate === r ? ' win' : '') + '">' +
        '<div class="row-label"><b class="mono">' + r + '%</b><span class="lv-name">' + info.name + '</span></div>' +
        '<div class="sbar"><span class="seg-vote" style="width:' + (n / maxN * 100) + '%"></span></div>' +
        '<span class="row-val mono">' + n + '표</span></div>';
    }).join('');
    var act = u.$('voteActions');
    if (D.tie) {
      act.innerHTML = '<span class="small">동점이에요. 어느 세율로 정할까요?</span>' + D.tie.map(function (r) {
        return '<button class="btn btn-sm" data-force="' + r + '">' + r + '%로 확정</button>';
      }).join('');
      act.querySelectorAll('[data-force]').forEach(function (b) {
        b.onclick = function () { D.closeVote(Number(b.dataset.force)); };
      });
    } else if (v.closed) {
      act.innerHTML = '<span class="muted small">학생들이 결과를 보고 형편 카드를 받고 있어요.</span>' +
        '<button class="btn btn-sm" id="voteReset">투표 다시 하기</button>';
      u.$('voteReset').onclick = D.resetVote;
    } else {
      act.innerHTML = '<button class="btn btn-sm btn-ink" id="voteClose">투표 마감하고 결과 확정</button>' +
        '<span class="muted small">학생 화면은 5~7초마다 자동으로 확인해요. 결과를 보려면 새로고침을 눌러 주세요.</span>';
      u.$('voteClose').onclick = function () { D.closeVote(null); };
    }
  },

  closeVote: async function (force) {
    var D = GL.Dash;
    var res = await GL.api.call('closeVote', { pw: D.pw, cls: D.cls, force: force });
    if (!res.ok) { D.toast(res.msg); return; }
    if (res.tie) { D.tie = res.tie; D.renderVote(); return; }
    D.tie = null;
    D.toast('세율 ' + res.rate + '%로 확정했어요');
    D.refresh();
  },

  resetVote: async function () {
    var D = GL.Dash;
    if (!confirm('이 반의 투표 기록과 확정된 세율을 지울까요?\n이미 형편 카드를 받은 학생의 세금은 바뀌지 않아요.')) return;
    var res = await GL.api.call('resetVote', { pw: D.pw, cls: D.cls });
    if (!res.ok) { D.toast(res.msg); return; }
    D.tie = null;
    D.toast('투표를 초기화했어요');
    D.refresh();
  },

  // 고르기 질문(Q3·Q4)을 형편 단계별 막대로
  renderChoice: function (subs, key, targetId) {
    var D = GL.Dash;
    var q = D.QUESTIONS.filter(function (x) { return x.key === key; })[0];
    var g = D.byLevel(subs);
    function bar(list) {
      var n = list.length;
      if (!n) return '<div class="sbar"></div>';
      return '<div class="sbar">' + q.choices.map(function (k, i) {
        var c = list.filter(function (s) { return s[key + 'choice'] === k; }).length;
        return c ? '<span class="' + q.cls[i].replace('c-', 'seg-') + '" style="width:' + (c / n * 100) + '%">' + c + '</span>' : '';
      }).join('') + '</div>';
    }
    var html = [1, 2, 3, 4, 5].map(function (lv) {
      return '<div class="stat-row">' + D.rowLabel(lv, g[lv].length) + bar(g[lv]) + '<span class="row-val"></span></div>';
    }).join('');
    html += '<div class="stat-row stat-total"><div class="row-label"><b>반 전체</b><span class="muted mono small">' +
      subs.length + '명</span></div>' + bar(subs) + '<span class="row-val"></span></div>';
    GL.util.$(targetId).innerHTML = html;
  },

  // 세율 투표: 처음(형편을 모를 때) → 다시(Q5, 형편을 안 뒤)
  renderRevote: function (subs) {
    var D = GL.Dash;
    var g = D.byLevel(subs);
    var rates = [0, 10, 30];
    var cls = ['seg-r0', 'seg-r10', 'seg-r30'];
    function bar(vals) {
      var n = vals.length;
      if (!n) return '<div class="sbar thin"></div>';
      return '<div class="sbar thin">' + rates.map(function (r, i) {
        var c = vals.filter(function (v) { return v === r; }).length;
        return c ? '<span class="' + cls[i] + '" style="width:' + (c / n * 100) + '%">' + c + '</span>' : '';
      }).join('') + '</div>';
    }
    function row(label, list) {
      var both = list.filter(function (s) { return s.firstVote !== null && s.firstVote !== undefined && s.q5choice; });
      var first = both.map(function (s) { return Number(s.firstVote); });
      var again = both.map(function (s) { return parseInt(s.q5choice, 10); });
      var changed = both.filter(function (s) { return Number(s.firstVote) !== parseInt(s.q5choice, 10); }).length;
      return '<div class="stat-row revote-row">' + label +
        '<div class="revote-bars"><span class="rv-tag">처음</span>' + bar(first) +
        '<span class="rv-tag">다시</span>' + bar(again) + '</div>' +
        '<span class="row-val mono' + (changed ? ' side-val' : ' muted') + '">' + (both.length ? '바뀜 ' + changed + '명' : '—') + '</span></div>';
    }
    var html = [1, 2, 3, 4, 5].map(function (lv) { return row(D.rowLabel(lv, g[lv].length), g[lv]); }).join('');
    html += row('<div class="row-label"><b>반 전체</b><span class="muted mono small">' + subs.length + '명</span></div>', subs)
      .replace('stat-row revote-row', 'stat-row revote-row stat-total');
    GL.util.$('statRevote').innerHTML = html;
  },


  renderChips: function () {
    var D = GL.Dash;
    var u = GL.util;
    var box = u.$('chips');
    box.innerHTML = D.classRoster().map(function (r) {
      var done = !!D.subs[r.id];
      var lv = r.level ? '<span class="lv-chip lv' + r.level + '">L' + r.level + '</span>' : '<span class="muted small">카드 전</span>';
      var cnt = done && D.subs[r.id].count > 1 ? '<span class="chip-cnt mono">제출 ' + D.subs[r.id].count + '회</span>' : '';
      return '<button class="chip' + (done ? ' done' : '') + '" data-id="' + r.id + '">' +
        '<span class="chip-num mono">' + r.id.slice(2) + '</span>' +
        '<span class="chip-name">' + u.esc(r.name) + '</span>' + lv + cnt + '</button>';
    }).join('') || '<p class="muted">학생명단 시트에 이 반 학생이 없어요.</p>';
    box.querySelectorAll('.chip').forEach(function (b) {
      b.onclick = function () { D.open(b.dataset.id); };
    });
  },

  /* ---------- 답변 모아보기 ---------- */
  renderAnswers: function () {
    var D = GL.Dash;
    var u = GL.util;
    var qBox = u.$('ansQ');
    qBox.innerHTML = D.QUESTIONS.map(function (q) {
      return '<button class="seg-b' + (q.key === D.ansQ ? ' on' : '') + '" data-q="' + q.key + '">' + q.short + '</button>';
    }).join('');
    var lvBox = u.$('ansLv');
    lvBox.innerHTML = [0, 1, 2, 3, 4, 5].map(function (lv) {
      return '<button class="seg-b' + (lv === D.ansLv ? ' on' : '') + '" data-lv="' + lv + '">' +
        (lv ? 'L' + lv + ' ' + GL.LEVELS[lv].short : '전체') + '</button>';
    }).join('');
    qBox.querySelectorAll('.seg-b').forEach(function (b) {
      b.onclick = function () { D.ansQ = b.dataset.q; D.renderAnswers(); };
    });
    lvBox.querySelectorAll('.seg-b').forEach(function (b) {
      b.onclick = function () { D.ansLv = Number(b.dataset.lv); D.renderAnswers(); };
    });

    var q = D.QUESTIONS.filter(function (x) { return x.key === D.ansQ; })[0];
    var list = D.classSubs().filter(function (s) { return !D.ansLv || s.level === D.ansLv; })
      .sort(function (a, b) { return (a.level - b.level) || (a.id < b.id ? -1 : 1); });
    u.$('ansTitle').textContent = q.full;
    u.$('ansCount').textContent = list.length + '개의 답변';
    u.$('ansList').innerHTML = list.map(function (s) {
      var picked = q.choices ? s[q.key + 'choice'] : '';
      var extra = q.key === 'q5' && s.firstVote !== null && s.firstVote !== undefined ? ' (처음 ' + s.firstVote + '%)' : '';
      var choice = picked
        ? '<span class="ans-choice ' + (q.cls[q.choices.indexOf(picked)] || '') + '">' + u.esc(picked + extra) + '</span>' : '';
      return '<article class="ans-card">' +
        '<header><span class="lv-chip lv' + s.level + '">L' + s.level + '</span>' +
        '<span class="mono muted">' + s.id.slice(2) + '</span><b>' + u.esc(s.name) + '</b>' + choice + '</header>' +
        '<p>' + u.esc(s[q.key] || '—') + '</p></article>';
    }).join('') || '<p class="muted">아직 이 조건에 맞는 답변이 없어요.</p>';
  },

  switchView: function (id) {
    document.querySelectorAll('.vtab').forEach(function (t) { t.classList.toggle('on', t.dataset.view === id); });
    GL.util.$('viewStats').classList.toggle('hidden', id !== 'viewStats');
    GL.util.$('viewAnswers').classList.toggle('hidden', id !== 'viewAnswers');
  },

  toggleTv: function (on) {
    document.body.classList.toggle('tv', on);
    GL.util.$('tvBtn').textContent = on ? '글자 보통' : '글자 크게';
    try { localStorage.setItem('genelab-tv', on ? '1' : ''); } catch (e) {}
  },

  /* ---------- 결과 카드 크게 보기 ---------- */
  open: function (id) {
    var D = GL.Dash;
    if (!D.subs[id]) { D.toast('아직 제출하지 않았어요'); return; }
    D.viewIds = [id];
    D.picking = false;
    D.renderViewer();
    GL.util.$('viewer').classList.remove('hidden');
  },

  renderViewer: function () {
    var D = GL.Dash;
    var u = GL.util;
    u.$('viewerCards').className = 'viewer-cards' + (D.viewIds.length > 1 ? ' two' : '');
    u.$('viewerCards').innerHTML = D.viewIds.map(function (id) { return GL.ResultCard.html(D.subs[id], { meta: true, summary: true }); }).join('');
    u.$('cmpBtn').textContent = D.viewIds.length > 1 ? '한 명만 보기' : '나란히 비교';

    var strip = u.$('pickStrip');
    if (D.picking) {
      u.$('viewerHint').textContent = '비교할 학생을 고르세요';
      strip.classList.remove('hidden');
      strip.innerHTML = D.classSubs().filter(function (s) { return s.id !== D.viewIds[0]; }).map(function (s) {
        return '<button class="chip done" data-id="' + s.id + '"><span class="chip-num mono">' + s.id.slice(2) + '</span>' +
          '<span class="lv-chip lv' + s.level + '">L' + s.level + '</span></button>';
      }).join('');
      strip.querySelectorAll('.chip').forEach(function (b) {
        b.onclick = function () {
          D.viewIds = [D.viewIds[0], b.dataset.id];
          D.picking = false;
          D.renderViewer();
        };
      });
    } else {
      u.$('viewerHint').textContent = '';
      strip.classList.add('hidden');
    }
  },

  toggleCompare: function () {
    var D = GL.Dash;
    if (D.viewIds.length > 1) { D.viewIds = [D.viewIds[0]]; D.picking = false; }
    else { D.picking = !D.picking; }
    D.renderViewer();
  },

  saveJpg: function () {
    var D = GL.Dash;
    if (typeof html2canvas === 'undefined') { D.toast('이미지 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'); return; }
    var target = GL.util.$('viewerCards');
    html2canvas(target, { scale: 2, backgroundColor: '#f3f4f5' }).then(function (canvas) {
      var a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 0.92);
      a.download = 'gene-lab-' + D.viewIds.join('-') + '.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  },

  toast: function (msg) {
    var t = GL.util.$('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(GL.Dash._tt);
    GL.Dash._tt = setTimeout(function () { t.classList.remove('show'); }, 2200);
  },

  init: function () {
    var u = GL.util;
    GL.api.warmup();
    u.$('pwBtn').onclick = GL.Dash.unlock;
    u.$('pwInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') GL.Dash.unlock(); });
    u.$('refreshBtn').onclick = GL.Dash.refresh;
    u.$('clsSelect').onchange = function () { GL.Dash.cls = this.value; GL.Dash.tie = null; GL.Dash.render(); };
    u.$('closeBtn').onclick = function () { u.$('viewer').classList.add('hidden'); };
    u.$('cmpBtn').onclick = GL.Dash.toggleCompare;
    u.$('jpgBtn').onclick = GL.Dash.saveJpg;
    document.querySelectorAll('.vtab').forEach(function (t) {
      t.onclick = function () { GL.Dash.switchView(t.dataset.view); };
    });
    u.$('tvBtn').onclick = function () { GL.Dash.toggleTv(!document.body.classList.contains('tv')); };
    var tv = '';
    try { tv = localStorage.getItem('genelab-tv'); } catch (e) {}
    if (tv) GL.Dash.toggleTv(true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') u.$('viewer').classList.add('hidden');
    });
  }
};

document.addEventListener('DOMContentLoaded', GL.Dash.init);
