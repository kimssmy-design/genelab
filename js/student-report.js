/* =========================================================
   student-report.js — 20년 후 리포트 (아이 프로필 + 2065 뉴스)
   ========================================================= */
GL.Report = {
  show: function () {
    var u = GL.util;
    var S = GL.state;
    var s = GL.sim.summarize(S.results);

    // 프로필 요약 줄
    var sum;
    if (s.total === 0) {
      sum = S.level === 2 ? '우리 집 예산으로는 살 수 있는 옵션이 하나도 없었어요.' : '';
    } else {
      sum = s.total + '개를 편집했어요. 사용한 돈 ' + u.money(S.spent) + '.';
    }
    u.$('profLine').textContent = GL.STORY.profileLine(s);
    u.$('profSummary').textContent = sum;

    var list = u.$('profPicks');
    if (!S.results.length) {
      list.innerHTML = '';
    } else {
      list.innerHTML = S.results.map(function (p) {
        var o = GL.optById[p.id];
        var st = GL.sim.STATUS[p.status];
        return '<li class="rc-pick ' + st.cls + '"><span class="rc-mark">' + st.mark + '</span>' +
          '<span class="rc-pname">' + u.esc(o.name) + '</span>' +
          '<span class="st-label">' + st.label + '</span>' +
          (p.status === 'side' ? '<span class="rc-side">' + u.esc(GL.sim.sideText(o)) + '</span>' : '') +
          '</li>';
      }).join('');
    }

    // 뉴스 4개
    var months = ['03', '05', '08', '11'];
    u.$('newsList').innerHTML = GL.STORY.pickNews(s).map(function (n, i) {
      return '<li class="news news-' + n.tone + '"><span class="news-meta mono">2065.' + months[i] + ' · ' + n.sec + '</span>' +
        '<span class="news-t">' + u.esc(n.t) + '</span></li>';
    }).join('');

    u.$('toLetterBtn').onclick = GL.Letter.show;
    GL.App.show('scr-report', 3, 2065);
  }
};
