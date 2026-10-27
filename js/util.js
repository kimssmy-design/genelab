/* =========================================================
   util.js — 여러 파일에서 같이 쓰는 작은 도구 모음
   ========================================================= */
GL.util = {
  // 화면에 넣을 글자 안전하게 바꾸기 (학생 입력에 <, > 등이 있어도 깨지지 않게)
  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  },

  // 만 원 단위 숫자 → "3,000만 원", "1억 2,000만 원"
  money: function (man) {
    man = Math.round(Number(man) || 0);
    if (man === 0) return '0원';
    var eok = Math.floor(man / 10000);
    var rest = man % 10000;
    var s = '';
    if (eok) s += eok.toLocaleString('ko-KR') + '억';
    if (rest) s += (s ? ' ' : '') + rest.toLocaleString('ko-KR') + '만';
    return s + ' 원';
  },

  // 공백 제외 글자 수
  chars: function (s) {
    return String(s || '').replace(/\s/g, '').length;
  },

  $: function (id) { return document.getElementById(id); }
};
