/* =========================================================
   student-report.js — 20년 후 리포트
   왼쪽: 아이 프로필 + 유전자별 인생 이야기 (2개는 펼침, 나머지는 눌러서)
   오른쪽: 2065년 뉴스 + 20년의 종합 해설
   ========================================================= */
GL.Report = {
  OPEN_COUNT: 2,

  show: function () {
    var u = GL.util;
    var S = GL.state;
    var s = GL.sim.summarize(S.results);

    // 프로필 요약 줄
    var sum;
    if (s.total === 0) {
      sum = '';
    } else {
      sum = s.total + '개를 편집했어요. 사용한 돈 ' + u.money(S.spent) + '.';
    }
    u.$('profLine').textContent = GL.STORY.profileLine(s);
    u.$('profSummary').textContent = sum;

    // 유전자별 인생 이야기 — 의미가 큰 순서(변화 > 효과 없음 > 향상 > 경계 > 치료)
    var rank = function (p) {
      var o = GL.optById[p.id];
      var b = p.status === 'side' ? 5 : p.status === 'none' ? 4 : (o.tag === 'enhance' ? 3 : o.tag === 'border' ? 2 : 1);
      return b * 1000000 + o.price;
    };
    var sorted = S.results.slice().sort(function (a, b) { return rank(b) - rank(a); });
    u.$('profPicks').innerHTML = sorted.map(function (p, i) {
      var o = GL.optById[p.id];
      var st = GL.sim.STATUS[p.status];
      var story = (GL.LIFE[o.id] || {})[p.status] || '';
      return '<li><details class="story ' + st.cls + '"' + (i < GL.Report.OPEN_COUNT ? ' open' : '') + '>' +
        '<summary><span class="rc-mark">' + st.mark + '</span><span class="rc-pname">' + u.esc(o.name) + '</span>' +
        '<span class="st-label">' + st.label + '</span><span class="chev">▾</span></summary>' +
        '<p>' + u.esc(story) + '</p></details></li>';
    }).join('');
    u.$('moreHint').classList.toggle('hidden', sorted.length <= GL.Report.OPEN_COUNT);

    // 뉴스 4개 — 처음 볼 때 한 번 고르고 저장 (새로고침해도 그대로)
    if (!S.news || !S.news.length) {
      S.news = GL.STORY.pickNews(s, S.level, { rate: S.rate || 0, loan: S.loan, supportStatus: S.supportStatus });
      GL.App.save();
    }
    u.$('newsList').innerHTML = S.news.map(function (n) {
      return '<li class="news news-' + n.tone + '"><span class="news-meta mono">' + n.date + ' · ' + n.sec + '</span>' +
        '<span class="news-t">' + u.esc(n.t) + '</span></li>';
    }).join('');

    // 20년의 종합 해설
    // 종합 해설 유형 그림 (태블릿: 해설 위 / 폰: 화면 맨 위)
    var lifeType = GL.LIFE_TYPE(GL.App.moneyRec());
    u.$('lifeImg').innerHTML = GL.lifeImageHtml(lifeType);
    u.$('lifeImgTop').innerHTML = GL.lifeImageHtml(lifeType);

    var paras = GL.LIFE_SUMMARY(GL.App.moneyRec());
    u.$('lifeSummary').innerHTML = paras.map(function (p, i) {
      return '<p' + (i === paras.length - 1 ? ' class="sum-q"' : '') + '>' + u.esc(p) + '</p>';
    }).join('');

    u.$('toLetterBtn').onclick = GL.Letter.show;
    GL.App.show('scr-report', 3, 2065);
  }
};
