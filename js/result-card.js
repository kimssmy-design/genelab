/* =========================================================
   result-card.js — 학생 결과 카드 HTML 만들기
   학생 완료 화면과 교사 대시보드에서 똑같이 사용
   rec = { id, name, level, budget, spent, picks:[{id,status}], q1, q2, q3choice, q3, q4, count, time }
   opts.meta = true 이면 제출 횟수·시간 표시 (대시보드용)
   opts.summary = true 이면 종합 해설 첫 문단 표시 (data-life.js 필요)
   ========================================================= */
GL.ResultCard = {
  html: function (rec, opts) {
    opts = opts || {};
    var u = GL.util;
    var lv = GL.LEVELS[rec.level] || { name: '?', short: '?' };
    var picks = rec.picks || [];
    var s = GL.sim.summarize(picks);
    var num = String(rec.id || '').slice(2);

    var pickHtml = picks.length ? picks.map(function (p) {
      var o = GL.optById[p.id];
      if (!o) return '';
      var st = GL.sim.STATUS[p.status] || GL.sim.STATUS.none;
      return '<li class="rc-pick ' + st.cls + '">' +
        '<span class="rc-mark">' + st.mark + '</span>' +
        '<span class="rc-pname">' + u.esc(o.name) + '</span>' +
        '<span class="tag ' + GL.TAGS[o.tag].cls + '">' + GL.TAGS[o.tag].name + '</span>' +
        (p.status === 'side' ? '<span class="rc-side">' + u.esc(GL.sim.sideText(o)) + '</span>' : '') +
        '</li>';
    }).join('') : '<li class="rc-empty">편집 없이 태어났어요</li>';

    function ans(label, text) {
      return '<div class="rc-ans"><span class="rc-qlabel">' + label + '</span><p>' + u.esc(text || '—') + '</p></div>';
    }

    return '' +
      '<article class="rcard">' +
        '<header class="rc-head">' +
          '<div><span class="rc-num mono">' + u.esc(num) + '번</span> <span class="rc-name">' + u.esc(rec.name) + '</span></div>' +
          '<span class="lv-chip lv' + rec.level + '">L' + rec.level + ' ' + u.esc(lv.short) + '</span>' +
        '</header>' +
        '<div class="rc-money mono">예산 ' + u.money(rec.budget) +
          (rec.earned ? ' + 알바 ' + u.money(rec.earned) : '') + ' · 사용 ' + u.money(rec.spent) + '</div>' +
        (opts.meta ? '<div class="rc-meta mono' + (rec.count > 1 ? ' multi' : '') + '">제출 ' + (rec.count || 1) + '회' +
          (rec.time ? ' · 마지막 ' + u.esc(rec.time) : '') + '</div>' : '') +
        '<div class="rc-counts">' +
          '<span><b>' + s.total + '</b> 편집</span>' +
          '<span class="tag tag-treat">치료 ' + s.treat + '</span>' +
          '<span class="tag tag-border">경계 ' + s.border + '</span>' +
          '<span class="tag tag-enh">향상 ' + s.enhance + '</span>' +
          (s.side ? '<span class="tag tag-side">변화 ' + s.side + '</span>' : '') +
        '</div>' +
        (opts.summary && GL.LIFE_SUMMARY
          ? '<p class="rc-summary">' + u.esc(GL.LIFE_SUMMARY(rec)[0]) + '</p>' : '') +
        '<ul class="rc-picks">' + pickHtml + '</ul>' +
        '<div class="rc-answers">' +
          ans('Q1 좋은 점', rec.q1) +
          ans('Q2 문제점', rec.q2) +
          ans('Q3 ' + (rec.q3choice || ''), rec.q3) +
          ans('Q4 답장', rec.q4) +
        '</div>' +
      '</article>';
  }
};
