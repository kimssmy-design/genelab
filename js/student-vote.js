/* =========================================================
   student-vote.js — 우리 반 세율 투표
   카드를 받기 전, 자기 형편을 모르는 상태에서 세율을 정해요(무지의 베일).
   투표 → 선생님이 대시보드에서 마감할 때까지 기다리기 → 결과 보고 카드 받기
   ========================================================= */
GL.Vote = {
  choice: null,
  timer: null,

  // 확정된 세율을 내 카드에 적용 (세금은 자동으로 빠지고, 지원금은 신청해야 받음)
  applyRate: function (rate) {
    var S = GL.state;
    S.rate = Number(rate) || 0;
    S.tax = GL.POLICY.tax(S.rate, S.level);
    GL.App.save();
  },

  /* ---------- 투표 화면 ---------- */
  show: function () {
    var u = GL.util;
    GL.Vote.choice = null;
    u.$('voteOpts').innerHTML = GL.POLICY.RATES.map(function (r) {
      var info = GL.POLICY.RATE_INFO[r];
      return '<button class="vote-opt" data-r="' + r + '">' +
        '<span class="vote-rate mono">' + r + '%</span>' +
        '<span class="vote-name">' + u.esc(info.name) + '</span>' +
        '<span class="vote-desc">' + u.esc(info.desc) + '</span></button>';
    }).join('');
    u.$('voteOpts').querySelectorAll('.vote-opt').forEach(function (b) {
      b.onclick = function () {
        GL.Vote.choice = Number(b.dataset.r);
        u.$('voteOpts').querySelectorAll('.vote-opt').forEach(function (x) { x.classList.toggle('on', x === b); });
        u.$('voteBtn').disabled = false;
      };
    });
    u.$('voteBtn').disabled = true;
    u.$('voteBtn').onclick = GL.Vote.submit;
    u.$('voteErr').textContent = '';
    GL.App.show('scr-vote', 1, 2045);
  },

  submit: async function () {
    var u = GL.util;
    var btn = u.$('voteBtn');
    if (GL.Vote.choice === null || btn.dataset.busy) return;
    btn.dataset.busy = '1';
    btn.innerHTML = '<span class="spinner"></span>투표하는 중';
    var res = await GL.api.call('vote', { id: GL.state.id, rate: GL.Vote.choice });
    delete btn.dataset.busy;
    btn.textContent = '투표하기';
    if (!res.ok) { u.$('voteErr').textContent = res.msg; return; }
    GL.Vote.render(res.vote);
  },

  /* ---------- 기다리기 화면 (5~7초마다 마감됐는지 확인) ---------- */
  wait: function () {
    GL.App.show('scr-wait', 1, 2045);
    GL.Vote.check();
  },

  check: async function () {
    clearTimeout(GL.Vote.timer);
    var res = await GL.api.call('voteStatus', { id: GL.state.id }, 1);
    if (res.ok) GL.Vote.render(res.vote);
    else if (GL.state.screen === 'scr-wait') GL.Vote.timer = setTimeout(GL.Vote.check, 7000);
  },

  render: function (v) {
    var u = GL.util;
    var info = GL.POLICY.RATE_INFO;
    var scr = GL.state.screen;
    if (scr !== 'scr-wait' && scr !== 'scr-vote') return;   // 이미 다른 화면으로 넘어감
    if (scr !== 'scr-wait') GL.App.show('scr-wait', 1, 2045);

    if (!v.closed) {
      u.$('waitTitle').textContent = '투표했어요';
      u.$('waitMine').textContent = v.myVote !== null && v.myVote !== undefined
        ? '내 선택: ' + v.myVote + '% (' + info[v.myVote].name + ')' : '';
      u.$('waitCount').textContent = '우리 반 ' + v.voted + '/' + v.total + '명 투표';
      u.$('waitNote').textContent = '선생님이 투표를 마감하면 결과와 형편 카드가 나와요.';
      u.$('waitResult').classList.add('hidden');
      u.$('waitBtn').classList.add('hidden');
      u.$('waitSpin').classList.remove('hidden');
      GL.Vote.timer = setTimeout(GL.Vote.check, 5000 + Math.random() * 2000);
      return;
    }

    // 마감됨 → 결과 보여 주고 카드 받기
    clearTimeout(GL.Vote.timer);
    GL.Vote.applyRate(v.rate);
    u.$('waitTitle').textContent = '우리 반의 결정: 세율 ' + v.rate + '%';
    u.$('waitMine').textContent = info[v.rate].name + ' · ' + info[v.rate].desc;
    u.$('waitCount').textContent = '';
    u.$('waitNote').textContent = '';
    u.$('waitSpin').classList.add('hidden');
    var total = Math.max(1, v.voted);
    u.$('waitResult').innerHTML = GL.POLICY.RATES.map(function (r) {
      var n = (v.counts || {})[r] || 0;
      return '<div class="vr-row' + (r === v.rate ? ' win' : '') + '"><span class="mono">' + r + '%</span>' +
        '<div class="vr-bar"><span style="width:' + (n / total * 100) + '%"></span></div>' +
        '<span class="mono">' + n + '표</span></div>';
    }).join('');
    u.$('waitResult').classList.remove('hidden');
    u.$('waitBtn').classList.remove('hidden');
    u.$('waitBtn').onclick = GL.Card.show;
  }
};
