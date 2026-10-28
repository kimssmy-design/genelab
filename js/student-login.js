/* =========================================================
   student-login.js — 학번 입력 → 본인 확인 → 형편 카드 뒤집기
   이미 제출한 학생이면 쇼핑 없이 제출 결과 화면으로 (쇼핑은 1회만)
   ========================================================= */
GL.Login = {
  init: function () {
    var input = GL.util.$('idInput');
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, 4);
      GL.util.$('loginErr').textContent = '';
    });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') GL.Login.submit(); });
    GL.util.$('loginBtn').onclick = GL.Login.submit;
  },

  submit: async function () {
    var id = GL.util.$('idInput').value.trim();
    var err = GL.util.$('loginErr');
    var btn = GL.util.$('loginBtn');
    if (!/^\d{4}$/.test(id)) { err.textContent = '학번 네 자리를 입력해 주세요. (예: 3105)'; return; }
    if (btn.disabled) return;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>확인 중';
    var res = await GL.api.call('login', { id: id });
    btn.disabled = false;
    btn.textContent = '카드 받기';

    if (!res.ok) { err.textContent = res.msg || '잠시 후 다시 시도해 주세요.'; return; }

    // 본인 확인 (친구 학번 오입력·장난 방지)
    var clsLabel = id.charAt(0) + '-' + id.charAt(1);
    GL.App.confirm(clsLabel + ' ' + id.slice(2) + '번 ' + res.name + ' 맞나요?',
      '본인이 맞을 때만 눌러 주세요. 다른 친구의 학번으로 들어가면 그 친구의 결과가 바뀌어요.',
      '맞아요', function () { GL.Login.enter(id, clsLabel, res); },
      '아니에요', function () { GL.util.$('idInput').select(); });
  },

  enter: function (id, clsLabel, res) {
    var S = GL.state = GL.newState();
    GL.Letter.reset();
    S.id = id;
    S.name = res.name;
    S.clsLabel = clsLabel;
    S.level = Number(res.level);
    S.budget = GL.LEVELS[S.level].budget;
    S.startedAt = Date.now();

    if (res.sub) {
      // 이미 제출한 학생: 첫 쇼핑 결과를 그대로 불러오고 답변만 고칠 수 있게
      var sub = res.sub;
      S.results = sub.picks || [];
      S.picks = S.results.map(function (p) { return p.id; });
      S.spent = Number(sub.spent) || 0;
      S.earned = Number(sub.earned) || 0;
      S.rate = Number(sub.rate) || 0;
      S.tax = Number(sub.tax) || 0;
      S.support = Number(sub.support) || 0;
      S.supportStatus = sub.supportStatus || '미신청';
      S.loan = Number(sub.loan) || 0;
      S.answers = { q1: sub.q1, q2: sub.q2, q3: sub.q3, q4: sub.q4, q3choice: sub.q3choice };
      S.submitted = true;
      S.count = Number(sub.count) || 1;
      GL.App.showDone();
      GL.App.toast('이미 제출한 기록을 불러왔어요');
      return;
    }

    // 세율 투표: 마감됐으면 바로 카드, 이미 투표했으면 기다리기, 아니면 투표
    var v = res.vote || {};
    if (v.closed) { GL.Vote.applyRate(v.rate); GL.Card.show(); }
    else if (v.myVote !== null && v.myVote !== undefined) GL.Vote.wait();
    else GL.Vote.show();
  }
};

GL.Card = {
  show: function () {
    var S = GL.state;
    var lv = GL.LEVELS[S.level];
    GL.util.$('cardWho').textContent = S.clsLabel + ' ' + S.id.slice(2) + '번 ' + S.name;
    GL.util.$('cardLevel').textContent = 'LEVEL ' + S.level + ' / 5';
    GL.util.$('cardName').textContent = lv.name;
    GL.util.$('cardBudget').textContent = GL.util.money(lv.budget);
    GL.util.$('cardNote').textContent = lv.note;

    // 우리 반 세율에 따른 세금 (지원금은 쇼핑 화면에서 신청해야 받음)
    var taxLine = '';
    if (S.tax) taxLine = '세금 −' + GL.util.money(S.tax) + ' (세율 ' + S.rate + '%)';
    else if (GL.POLICY.support(S.rate || 0, S.level) > 0) taxLine = '국가 지원 신청 가능';
    GL.util.$('cardTax').textContent = taxLine;

    var flip = GL.util.$('flip');
    flip.classList.remove('flipped');
    GL.util.$('cardAfter').classList.add('invisible');
    flip.onclick = function () {
      flip.classList.add('flipped');
      setTimeout(function () { GL.util.$('cardAfter').classList.remove('invisible'); }, 500);
    };
    GL.util.$('startShopBtn').onclick = function () {
      GL.state.startedAt = Date.now();
      GL.Shop.show();
    };
    GL.App.show('scr-card', 1, 2045);
  }
};
