/* =========================================================
   student-app.js — 학생 화면 공통 기능
   상태(state) 저장·이어하기, 화면 전환, 모달, 토스트, 제출 완료 화면
   ========================================================= */
GL.STORE_KEY = 'genelab-progress';

GL.newState = function () {
  return {
    id: '', name: '', clsLabel: '', level: 0, budget: 0,
    picks: [],        // 고른 옵션 id (고른 순서대로)
    voucherId: null,  // L1 국가 지원으로 무료 처리된 옵션 id
    results: [],      // 탄생 후 [{id, status}] — 한 번 정해지면 바뀌지 않음
    spent: 0,         // 탄생 때 확정된 사용 금액
    earned: 0,        // 아르바이트(퀴즈)로 번 돈 (만 원)
    job: null,        // 아르바이트 진행 상황 { order:[문제id], done:{문제id: 맞힘여부} }
    answers: { q1: '', q2: '', q3: '', q4: '', q3choice: '' },
    submitted: false, count: 0,
    startedAt: 0, screen: 'scr-login'
  };
};
GL.state = GL.newState();

GL.App = {
  /* ---------- 진행 상황 저장 (새로고침·뒤로 가기 대비, 이 탭에서만 유지) ---------- */
  save: function () {
    try { sessionStorage.setItem(GL.STORE_KEY, JSON.stringify(GL.state)); } catch (e) {}
  },
  load: function () {
    try { return JSON.parse(sessionStorage.getItem(GL.STORE_KEY) || 'null'); } catch (e) { return null; }
  },
  clear: function () {
    try { sessionStorage.removeItem(GL.STORE_KEY); } catch (e) {}
  },

  // 화면 전환: step = 상단 STEP 표시, year = 2045 또는 2065
  show: function (screenId, step, year) {
    document.querySelectorAll('.screen').forEach(function (el) { el.classList.remove('active'); });
    GL.util.$(screenId).classList.add('active');
    GL.util.$('stepLabel').textContent = step ? 'STEP ' + step + '/4' : '';
    GL.util.$('yearLabel').textContent = year || 2045;
    window.scrollTo(0, 0);
    GL.state.screen = screenId;
    if (screenId !== 'scr-login') GL.App.save();
  },

  modal: function (html) {
    GL.util.$('modalBox').innerHTML = html;
    GL.util.$('modal').classList.remove('hidden');
  },
  closeModal: function () { GL.util.$('modal').classList.add('hidden'); },

  // 확인/취소 모달
  confirm: function (title, text, okLabel, onOk, cancelLabel, onCancel) {
    GL.App.modal(
      '<h3>' + GL.util.esc(title) + '</h3><p class="muted">' + GL.util.esc(text) + '</p>' +
      '<div class="modal-actions"><button class="btn" id="mCancel">' + GL.util.esc(cancelLabel || '취소') + '</button>' +
      '<button class="btn btn-ink" id="mOk">' + GL.util.esc(okLabel) + '</button></div>');
    GL.util.$('mCancel').onclick = function () { GL.App.closeModal(); if (onCancel) onCancel(); };
    GL.util.$('mOk').onclick = function () { GL.App.closeModal(); onOk(); };
  },

  toast: function (msg) {
    var t = GL.util.$('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(GL.App._tt);
    GL.App._tt = setTimeout(function () { t.classList.remove('show'); }, 2200);
  },

  help: function () {
    GL.App.modal(
      '<h3>사용법</h3>' +
      '<ol class="help-list">' +
      '<li>학번을 넣으면 우리 집의 <b>형편 카드</b>를 받아요. 카드는 무작위이고 바꿀 수 없어요.</li>' +
      '<li>예산 안에서 아기에게 넣을 <b>유전자</b>를 골라요. 카드를 누르면 자세한 설명이 나와요.</li>' +
      '<li>돈이 모자라면 <b>아르바이트</b>를 해요. 퀴즈를 맞힐 때마다 ' + GL.util.money(GL.JOB.PAY) + '을 벌고, 한 문제는 한 번만 풀 수 있어요.</li>' +
      '<li><b>아이 탄생시키기</b>를 누르면 20년 뒤로 이동해요. 편집이 항상 성공하는 건 아니고, 쇼핑은 한 번만 할 수 있어요.</li>' +
      '<li>아이의 편지를 읽고 질문에 답한 뒤 제출해요. 제출한 뒤에도 답변은 고칠 수 있어요.</li>' +
      '</ol>' +
      '<p class="muted small help-note">카드 위의 <span class="mono">HBB</span> 같은 글자는 바꾸는 유전자의 이름이에요. ' +
      '<b>다유전자</b>는 키·지능처럼 수백 개 이상의 유전자가 함께 관여하는 특성이라는 뜻이고, 그래서 성공률이 낮아요.</p>' +
      '<div class="modal-actions"><button class="btn btn-ink" id="mOk">확인</button></div>');
    GL.util.$('mOk').onclick = GL.App.closeModal;
  },

  // 현재 상태 → 제출·결과 카드용 기록
  record: function () {
    var S = GL.state;
    var s = GL.sim.summarize(S.results);
    var letter = GL.LETTER.compose({ level: S.level, earned: S.earned, spent: S.spent, picks: S.results });
    return {
      id: S.id, name: S.name, clsLabel: S.clsLabel, level: S.level,
      budget: S.budget, spent: S.spent, earned: S.earned,
      total: s.total, treat: s.treat, border: s.border, enhance: s.enhance, side: s.side,
      picks: S.results, letterType: letter.type,
      q1: S.answers.q1, q2: S.answers.q2, q3choice: S.answers.q3choice, q3: S.answers.q3, q4: S.answers.q4,
      elapsed: Math.round((Date.now() - S.startedAt) / 1000)
    };
  },

  /* ---------- 제출 완료 화면 ---------- */
  showDone: function () {
    GL.util.$('doneCard').innerHTML = GL.ResultCard.html(GL.App.record(), { summary: true });
    GL.App.show('scr-done', 0, 2065);
  },

  // 처음 화면으로 (다음 학생이 같은 태블릿을 쓸 때)
  reset: function () {
    GL.App.clear();
    GL.state = GL.newState();
    GL.Letter.reset();
    GL.util.$('idInput').value = '';
    GL.App.show('scr-login', 0, 2045);
  },

  // 저장된 진행 상황으로 돌아가기
  resume: function (saved) {
    GL.state = Object.assign(GL.newState(), saved);
    var go = {
      'scr-card': GL.Card.show,
      'scr-shop': GL.Shop.show,
      'scr-report': GL.Report.show,
      'scr-letter': GL.Letter.show,
      'scr-done': GL.App.showDone
    }[saved.screen];
    if (go) go(); else GL.App.reset();
  },

  init: function () {
    GL.api.warmup();
    GL.util.$('helpBtn').onclick = GL.App.help;
    GL.util.$('modal').addEventListener('click', function (e) {
      if (e.target.id === 'modal' && !GL.App.lockModal) GL.App.closeModal();
    });
    GL.util.$('editBtn').onclick = function () { GL.Letter.show(); };
    GL.util.$('homeBtn').onclick = function () {
      GL.App.confirm('처음 화면으로 갈까요?', '다음 친구가 이 기기를 쓸 때 눌러 주세요. 제출한 내용은 서버에 그대로 남아 있어요.',
        '처음으로', GL.App.reset);
    };
    GL.Login.init();

    var saved = GL.App.load();
    if (saved && saved.id && saved.screen && saved.screen !== 'scr-login') {
      GL.App.confirm('이어서 할까요?',
        saved.clsLabel + ' ' + saved.id.slice(2) + '번 ' + saved.name + ' 학생이 하던 활동이 남아 있어요.',
        '이어서 하기', function () { GL.App.resume(saved); },
        '새로 시작', GL.App.reset);
    }
  }
};

document.addEventListener('DOMContentLoaded', GL.App.init);
