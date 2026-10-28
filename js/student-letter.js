/* =========================================================
   student-letter.js — 아이의 편지 + 성찰 질문 6개 + 제출
   답변은 쓰는 대로 저장돼서 새로고침해도 남아 있어요.
   ========================================================= */
GL.Letter = {
  // 다른 학생이 시작할 때 폼 비우기
  reset: function () {
    var form = GL.util.$('qForm');
    form.innerHTML = '';
    delete form.dataset.built;
  },

  build: function () {
    var u = GL.util;
    var form = u.$('qForm');
    form.innerHTML = GL.STORY.QUESTIONS.map(function (q) {
      var seg = q.choices ? '<div class="seg" id="seg-' + q.key + '">' + q.choices.map(function (c) {
        return '<button type="button" class="seg-btn" data-v="' + u.esc(c) + '">' + u.esc(c) + '</button>';
      }).join('') + '</div>' : '';
      return '<div class="qbox" id="box-' + q.key + '">' +
        '<label for="' + q.key + '">' + u.esc(q.label) + '</label>' + seg +
        '<textarea id="' + q.key + '" rows="2" placeholder="' + u.esc(q.ph) + '"></textarea>' +
        '<div class="qmeta"><span class="qerr" id="err-' + q.key + '"></span>' +
        '<span class="qcount mono" id="cnt-' + q.key + '">0/' + GL.CONFIG.MIN_CHARS + '</span></div></div>';
    }).join('');
    form.dataset.built = '1';

    GL.STORY.QUESTIONS.forEach(function (q) {
      u.$(q.key).addEventListener('input', function () {
        GL.state.answers[q.key] = this.value;
        GL.Letter.updateCount(q.key);
        GL.App.save();
      });
      if (!q.choices) return;
      u.$('seg-' + q.key).querySelectorAll('.seg-btn').forEach(function (b) {
        b.onclick = function () {
          GL.state.answers[q.key + 'choice'] = b.dataset.v;
          GL.Letter.paintChoice(q.key);
          GL.Letter.checkText(q.key);
          GL.App.save();
        };
      });
    });
  },

  // 고르기 질문의 선택 표시
  paintChoice: function (key) {
    var v = GL.state.answers[key + 'choice'];
    GL.util.$('seg-' + key).querySelectorAll('.seg-btn').forEach(function (x) { x.classList.toggle('on', x.dataset.v === v); });
  },

  show: function () {
    var u = GL.util;
    var S = GL.state;
    var letter = GL.LETTER.compose(GL.App.moneyRec());
    u.$('letterText').innerHTML = letter.paras.map(function (p, i) {
      return '<p' + (i === letter.paras.length - 1 ? ' class="letter-q"' : '') + '>' + u.esc(p) + '</p>';
    }).join('');

    if (!u.$('qForm').dataset.built) GL.Letter.build();
    GL.STORY.QUESTIONS.forEach(function (q) {
      u.$(q.key).value = S.answers[q.key] || '';
      GL.Letter.updateCount(q.key);
      if (q.choices) GL.Letter.paintChoice(q.key);
    });

    u.$('submitBtn').textContent = S.submitted ? '고친 답변 제출하기' : '제출하기';
    u.$('submitErr').textContent = '';
    u.$('submitBtn').onclick = GL.Letter.submit;
    GL.App.show('scr-letter', 4, 2065);
  },

  updateCount: function (key) {
    var n = GL.util.chars(GL.util.$(key).value);
    var c = GL.util.$('cnt-' + key);
    c.textContent = n + '/' + GL.CONFIG.MIN_CHARS;
    c.classList.toggle('done', n >= GL.CONFIG.MIN_CHARS);
    GL.Letter.checkText(key, true);
  },

  // 이 질문의 오류 문구 (quiet: 이미 오류가 떠 있을 때만 다시 계산)
  checkText: function (key, quiet) {
    var u = GL.util;
    var q = GL.STORY.QUESTIONS.filter(function (x) { return x.key === key; })[0];
    var err = u.$('err-' + key);
    if (quiet && !err.textContent) return '';
    var msg = '';
    if (q.choices && !GL.state.answers[key + 'choice']) msg = '하나를 골라 주세요. ';
    if (u.chars(u.$(key).value) < GL.CONFIG.MIN_CHARS) msg += '공백 빼고 ' + GL.CONFIG.MIN_CHARS + '자 이상 써 주세요.';
    err.textContent = msg;
    return msg;
  },

  validate: function () {
    var u = GL.util;
    var firstBad = null;
    GL.STORY.QUESTIONS.forEach(function (q) {
      var msg = GL.Letter.checkText(q.key);
      if (msg && !firstBad) firstBad = q.key;
    });
    if (firstBad) {
      u.$('box-' + firstBad).scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  },

  submit: async function () {
    var u = GL.util;
    var S = GL.state;
    var btn = u.$('submitBtn');
    if (btn.disabled || !GL.Letter.validate()) return;
    u.$('submitErr').textContent = '';

    GL.STORY.QUESTIONS.forEach(function (q) { S.answers[q.key] = u.$(q.key).value.trim(); });
    var rec = GL.App.record();

    // 제출 진행 표시
    btn.disabled = true;
    var prog = u.$('submitProg');
    prog.classList.remove('hidden');
    var steps = [['30%', '연결하는 중'], ['65%', '저장하는 중'], ['85%', '거의 다 됐어요']];
    var si = 0;
    var tick = setInterval(function () {
      if (si >= steps.length) { clearInterval(tick); return; }
      u.$('progFill').style.width = steps[si][0];
      u.$('progLabel').textContent = steps[si++][1] + '…';
    }, 700);

    var res = await GL.api.call('submit', rec);
    clearInterval(tick);
    prog.classList.add('hidden');
    u.$('progFill').style.width = '0';
    btn.disabled = false;

    if (res.ok) {
      S.submitted = true;
      S.count = res.count || S.count + 1;
      GL.App.showDone();
    } else {
      u.$('submitErr').textContent = res.msg || '저장하지 못했어요. 다시 눌러 주세요.';
    }
  }
};
