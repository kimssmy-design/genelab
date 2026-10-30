/* =========================================================
   student-job.js — 아르바이트(퀴즈)로 돈 벌기
   - 맞히면 GL.JOB.PAY(10만 원), 틀리면 해설만 보고 다음 문제
   - 한 문제는 한 번만 도전, 학생마다 문제 순서가 섞임
   - "알바 마치기"로 쇼핑에 돌아가고, 탄생 전까지 "다시 출근" 가능
   ========================================================= */
GL.Job = {
  // 학생마다 문제 순서 섞기 (처음 출근할 때 한 번)
  ensureOrder: function () {
    var S = GL.state;
    if (S.job && S.job.order && S.job.order.length) return;
    var ids = GL.QUIZ.map(function (q) { return q.id; });
    for (var i = ids.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = ids[i]; ids[i] = ids[j]; ids[j] = t;
    }
    S.job = { order: ids, done: {} };
  },

  doneCount: function () {
    var S = GL.state;
    return S.job && S.job.done ? Object.keys(S.job.done).length : 0;
  },

  nextQuiz: function () {
    var S = GL.state;
    for (var i = 0; i < S.job.order.length; i++) {
      var id = S.job.order[i];
      if (!(id in S.job.done)) return GL.QUIZ.filter(function (q) { return q.id === id; })[0];
    }
    return null;
  },

  // 쇼핑 화면 왼쪽 패널의 버튼·번 돈 표시
  renderPanel: function () {
    var u = GL.util;
    var S = GL.state;
    var n = GL.Job.doneCount();
    var total = GL.QUIZ.length;
    var btn = u.$('jobBtn');
    if (n >= total) {
      btn.disabled = true;
      btn.textContent = '아르바이트를 모두 마쳤어요';
    } else {
      btn.disabled = false;
      btn.innerHTML = GL.Job.ICON + (n ? '다시 출근하기' : '아르바이트 하기') + ' <span class="mono muted">' + n + '/' + total + '</span>';
    }
    // 번 돈은 예산 내역(student-money.js)에 표시돼요
  },

  ICON: '<svg class="job-ic" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="5" width="12" height="8" rx="1.5"/><path d="M6 5V3.5h4V5"/></svg>',

  open: function () {
    if (GL.state.results.length) return;   // 탄생 후에는 일할 수 없음
    GL.Job.ensureOrder();
    GL.Job.show();
  },

  // 보기 순서 섞기 (학생마다, 문제마다 달라서 '정답은 늘 1번' 같은 요령이 통하지 않음)
  shuffledIdx: function (n) {
    var idx = [];
    for (var i = 0; i < n; i++) idx.push(i);
    for (var j = n - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = idx[j]; idx[j] = idx[k]; idx[k] = t;
    }
    return idx;
  },

  show: function () {
    var u = GL.util;
    var q = GL.Job.nextQuiz();
    var n = GL.Job.doneCount();
    if (!q) { GL.Job.finish(); return; }

    GL.App.modal(
      '<div class="job-head mono"><span>아르바이트 ' + (n + 1) + '/' + GL.QUIZ.length + '</span>' +
      '<span>정답 +' + u.money(GL.JOB.PAY) + '</span></div>' +
      '<p class="job-earned muted small">지금까지 번 돈 ' + u.money(GL.state.earned) + '</p>' +
      '<h3 class="job-q">' + u.esc(q.q) + '</h3>' +
      '<div class="job-opts">' + GL.Job.shuffledIdx(q.o.length).map(function (i, pos) {
        // data-i는 원래 보기 번호(채점용), 화면 번호는 섞인 순서대로 1·2·3
        return '<button class="job-opt" data-i="' + i + '"><span class="mono">' + (pos + 1) + '</span>' + u.esc(q.o[i]) + '</button>';
      }).join('') + '</div>' +
      '<div class="job-result hidden" id="jobResult"></div>' +
      '<div class="modal-actions"><button class="btn" id="jobStop">알바 마치기</button>' +
      '<button class="btn btn-ink hidden" id="jobNext">다음 문제</button></div>');

    document.querySelectorAll('.job-opt').forEach(function (b) {
      b.onclick = function () { GL.Job.answer(q, Number(b.dataset.i)); };
    });
    u.$('jobStop').onclick = GL.Job.stop;
    u.$('jobNext').onclick = GL.Job.show;
  },

  answer: function (q, i) {
    var u = GL.util;
    var S = GL.state;
    if (q.id in S.job.done) return;   // 한 문제는 한 번만
    var right = i === q.a;
    S.job.done[q.id] = right;
    if (right) S.earned += GL.JOB.PAY;
    GL.App.save();
    GL.Shop.render();   // 뒤쪽 쇼핑 화면의 남은 예산·버튼도 바로 갱신

    document.querySelectorAll('.job-opt').forEach(function (b) {
      var k = Number(b.dataset.i);
      b.disabled = true;
      if (k === q.a) b.classList.add('right');
      else if (k === i) b.classList.add('wrong');
    });
    var r = u.$('jobResult');
    r.classList.remove('hidden');
    r.innerHTML = '<b class="' + (right ? 'ok' : 'no') + '">' + (right ? '정답! +' + u.money(GL.JOB.PAY) : '아쉬워요. 이번 문제는 보수가 없어요.') + '</b>' +
      '<p>' + u.esc(q.ex) + '</p>';
    u.$('jobNext').classList.toggle('hidden', !GL.Job.nextQuiz());
    u.$('jobStop').textContent = GL.Job.nextQuiz() ? '알바 마치기' : '쇼핑하러 가기';
  },

  stop: function () {
    GL.App.closeModal();
    GL.Shop.render();
    var S = GL.state;
    if (S.earned) GL.App.toast('지금까지 번 돈 ' + GL.util.money(S.earned));
  },

  finish: function () {
    GL.App.modal('<h3>아르바이트를 모두 마쳤어요</h3><p class="muted">' + GL.QUIZ.length + '문제를 모두 풀어서 ' +
      GL.util.money(GL.state.earned) + '을 벌었어요.</p>' +
      '<div class="modal-actions"><button class="btn btn-ink" id="mOk">쇼핑하러 가기</button></div>');
    GL.util.$('mOk').onclick = GL.Job.stop;
  }
};
