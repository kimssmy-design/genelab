/* =========================================================
   config.js — 앱 전체 설정 (가장 먼저 불러오는 파일)
   ⚠️ GAS 웹앱을 배포한 뒤, 아래 GAS_URL에 주소를 붙여넣으세요.
   ========================================================= */
var GL = window.GL = window.GL || {};

GL.CONFIG = {
  // 앱스크립트 [배포 → 새 배포 → 웹 앱]에서 받은 주소 (…/exec 로 끝나야 함)
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzpYemb4X0b9nohRB46pxnWvxGGIPBUtkP2tKc3LSHqukdtFHJSKq1kMNkiXOcBeTDvHg/exec',

  // 성찰 답변 최소 글자 수 (공백 제외)
  MIN_CHARS: 20
};

/* 형편 카드 5단계 — 예산 단위는 '만 원'
   (반별 배정 비율은 gas/Code.gs 의 RATIO 에서 정해요) */
GL.LEVELS = {
  1: { name: '기초생활수급 가정', short: '수급',   budget: 0,
       note: '국가 지원: 질병 예방(치료) 옵션 1개를 무료로 받을 수 있어요.' },
  2: { name: '차상위 가정',       short: '차상위', budget: 200,
       note: '수급 기준보다 소득이 조금 많아서 국가 지원 대상이 아니에요.' },
  3: { name: '중산층 가정',       short: '중산층', budget: 3000,
       note: '아껴 쓰면 몇 가지는 고를 수 있어요.' },
  4: { name: '고소득 가정',       short: '고소득', budget: 10000,
       note: '대부분의 옵션을 고를 수 있어요.' },
  5: { name: '최상위 가정',       short: '최상위', budget: 100000,
       note: '모든 옵션을 고를 수 있어요.' }
};
