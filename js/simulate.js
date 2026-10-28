/* =========================================================
   simulate.js — 편집 결과 굴리기 + 요약
   성공률 rate% → 성공
   실패한 나머지 중 1/4 → 의도하지 않은 변화(side) (적은 확률)
   나머지 → 효과 없음(none)
   예) 성공률 40%: 성공 40% / 변화 15% / 효과 없음 45%
       성공률 95%: 성공 95% / 변화 1.25% / 효과 없음 3.75%
   ========================================================= */
GL.sim = {
  SIDE_SHARE: 0.25,

  roll: function (opt) {
    var r = Math.random() * 100;
    if (r < opt.rate) return 'ok';
    if (r < opt.rate + (100 - opt.rate) * GL.sim.SIDE_SHARE) return 'side';
    return 'none';
  },

  // picks: [{id, status}] → 개수 요약
  summarize: function (picks) {
    var s = { total: 0, treat: 0, border: 0, enhance: 0, side: 0, none: 0, ids: {}, firstSide: null, firstEnh: null };
    (picks || []).forEach(function (p) {
      var o = GL.optById[p.id];
      if (!o) return;
      s.total++;
      s.ids[o.id] = true;
      s[o.tag]++;
      if (p.status === 'none') s.none++;
      if (p.status === 'side') {
        s.side++;
        if (!s.firstSide) s.firstSide = o;
      }
      if (o.tag === 'enhance' && !s.firstEnh) s.firstEnh = o;
    });
    return s;
  },

  STATUS: {
    ok:   { mark: '●', label: '성공',      cls: 'st-ok' },
    none: { mark: '○', label: '효과 없음', cls: 'st-none' },
    side: { mark: '▲', label: '의도하지 않은 변화', cls: 'st-side' }
  },

  sideText: function (opt) { return opt.side || GL.DEFAULT_SIDE; }
};
