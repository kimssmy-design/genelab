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
  ansQ: 'q2',    // 답변 모아보기: 보고 있는 질문
  ansLv: 0,      // 답변 모아보기: 형편 단계 필터 (0 = 전체)

  QUESTIONS: [
    { key: 'q1', short: 'Q1 좋은 점', full: 'Q1. 유전자 편집 기술의 좋은 점은 무엇일까요?' },
    { key: 'q2', short: 'Q2 문제점',  full: 'Q2. 이 기술이 널리 쓰이면 어떤 문제가 생길 수 있을까요?' },
    { key: 'q3', short: 'Q3 허용 범위', full: 'Q3. 유전자 편집을 어디까지 허용해야 할까요?' },
    { key: 'q4', short: 'Q4 답장',    full: 'Q4. 아이의 편지에 한 줄로 답장해 보세요.' }
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
    D.renderQ3(subs);
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

  renderQ3: function (subs) {
    var D = GL.Dash;
    var g = D.byLevel(subs);
    var keys = ['전면 금지', '질병 치료만 허용', '능력 향상까지 허용'];
    var cls = ['seg-ban', 'seg-treat', 'seg-enh'];
    function bar(list) {
      var n = list.length;
      if (!n) return '<div class="sbar"></div>';
      return '<div class="sbar">' + keys.map(function (k, i) {
        var c = list.filter(function (s) { return s.q3choice === k; }).length;
        return c ? '<span class="' + cls[i] + '" style="width:' + (c / n * 100) + '%">' + c + '</span>' : '';
      }).join('') + '</div>';
    }
    var html = [1, 2, 3, 4, 5].map(function (lv) {
      return '<div class="stat-row">' + D.rowLabel(lv, g[lv].length) + bar(g[lv]) + '<span class="row-val"></span></div>';
    }).join('');
    html += '<div class="stat-row stat-total"><div class="row-label"><b>반 전체</b><span class="muted mono small">' +
      subs.length + '명</span></div>' + bar(subs) + '<span class="row-val"></span></div>';
    GL.util.$('statQ3').innerHTML = html;
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
    var choiceCls = { '전면 금지': 'c-ban', '질병 치료만 허용': 'c-treat', '능력 향상까지 허용': 'c-enh' };
    u.$('ansList').innerHTML = list.map(function (s) {
      var choice = q.key === 'q3' && s.q3choice
        ? '<span class="ans-choice ' + (choiceCls[s.q3choice] || '') + '">' + u.esc(s.q3choice) + '</span>' : '';
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
    u.$('viewerCards').innerHTML = D.viewIds.map(function (id) { return GL.ResultCard.html(D.subs[id], { meta: true }); }).join('');
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
    u.$('clsSelect').onchange = function () { GL.Dash.cls = this.value; GL.Dash.render(); };
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
