/* =========================================================
   result-card.js — 학생 결과 카드 HTML 만들기
   학생 완료 화면과 교사 대시보드에서 똑같이 사용
   rec = { id, name, level, budget, spent, picks:[{id,status}], q1~q6, q3choice·q4choice·q5choice, firstVote, count, time }
   opts.meta = true 이면 제출 횟수·시간 표시 (대시보드용)
   opts.summary = true 이면 종합 해설 첫 문단 표시 (data-life.js 필요)
   ========================================================= */
GL.ResultCard = {
  // 예산 1억 − 세금 1,000만 + 지원 500만 + 알바 40만 + 대출 300만 · 사용 9,300만
  moneyLine: function (rec) {
    var m = function (v) { return GL.util.money(v).replace(' 원', ''); };
    var t = '예산 ' + m(rec.budget);
    if (rec.tax) t += ' − 세금 ' + m(rec.tax);
    if (rec.support) t += ' + 지원 ' + m(rec.support);
    if (rec.earned) t += ' + 알바 ' + m(rec.earned);
    if (rec.loan) t += ' + 대출 ' + m(rec.loan);
    t += ' · 사용 ' + m(rec.spent);
    if (rec.supportStatus === '탈락') t += ' · 지원 탈락';
    return t;
  },

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
        '<div class="rc-money mono">' + GL.ResultCard.moneyLine(rec) + '</div>' +
        (opts.meta ? '<div class="rc-meta mono' + (rec.count > 1 ? ' multi' : '') + '">제출 ' + (rec.count || 1) + '회' +
          (rec.time ? ' · 마지막 ' + u.esc(rec.time) : '') + '</div>' : '') +
        '<div class="rc-counts">' +
          '<span><b>' + s.total + '</b> 편집</span>' +
          '<span class="tag tag-treat">치료 ' + s.treat + '</span>' +
          '<span class="tag tag-border">경계 ' + s.border + '</span>' +
          '<span class="tag tag-enh">향상 ' + s.enhance + '</span>' +
          (s.side ? '<span class="tag tag-side">변화 ' + s.side + '</span>' : '') +
        '</div>' +
        (opts.summary && GL.LIFE_TYPE
          ? GL.lifeImageHtml(GL.LIFE_TYPE(rec), 'rc-img') +
            '<p class="rc-type">유형 ' + GL.LIFE_TYPE(rec) + ' · ' + GL.LIFE_TYPES[GL.LIFE_TYPE(rec)] + '</p>' : '') +
        (opts.summary && GL.LIFE_SUMMARY
          ? '<p class="rc-summary">' + u.esc(GL.LIFE_SUMMARY(rec)[0]) + '</p>' : '') +
        '<ul class="rc-picks">' + pickHtml + '</ul>' +
        '<div class="rc-answers">' +
          ans('Q1 내 카드', rec.q1) +
          ans('Q2 좋은 점·걱정', rec.q2) +
          ans('Q3 허용 범위 · ' + (rec.q3choice || '—'), rec.q3) +
          ans('Q4 책임 · ' + (rec.q4choice || '—'), rec.q4) +
          ans('Q5 다시 투표 · ' + (rec.q5choice || '—') +
            (rec.firstVote !== null && rec.firstVote !== undefined && rec.firstVote !== '' ? ' (처음 ' + rec.firstVote + '%)' : ''), rec.q5) +
          ans('Q6 답장', rec.q6) +
        '</div>' +
      '</article>';
  }
};
