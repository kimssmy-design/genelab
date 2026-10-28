/* =========================================================
   data-policy.js — 우리 반 세율 투표 · 세금 · 국가 지원 · 대출 규칙
   금액 단위: 만 원 (세금·지원 금액은 상징적인 숫자예요)
   ========================================================= */
GL.POLICY = {
  RATES: [0, 10, 30],

  // 투표 화면에 보여 줄 설명 (아직 자기 형편을 모르는 상태에서 고름)
  RATE_INFO: {
    0:  { name: '세금 없음', desc: '각자 가진 돈으로만 편집해요. 기초생활수급 가정만 치료 1개를 무료로 받아요.' },
    10: { name: '조금 걷기', desc: '부유한 가정(L4·L5)이 세금을 내고, 형편이 어려운 가정(L1·L2)이 500만 원씩 지원받아요.' },
    30: { name: '많이 걷기', desc: '중산층(L3)까지 세금을 내고, 형편이 어려운 가정(L1·L2)이 1,500만 원씩 지원받아요.' }
  },

  // 세금: 세율 → { 단계: 금액 }
  TAX: {
    0:  {},
    10: { 4: 1000, 5: 10000 },
    30: { 3: 500, 4: 3000, 5: 30000 }
  },

  // 국가 지원금: 세율 → { 단계: 금액 } (신청해야 받음)
  // L1의 '치료 1개 무료'는 세율과 상관없이 늘 적용돼요
  SUPPORT: {
    0:  {},
    10: { 1: 500, 2: 500 },
    30: { 1: 1500, 2: 1500 }
  },

  // 대출 한도 (형편이 어려울수록 적게 빌릴 수 있어요)
  LOAN_LIMIT: { 1: 300, 2: 1000, 3: 2000, 4: 5000, 5: 10000 },
  LOAN_STEP: 100,
  INTEREST: 1.5,     // 갚을 돈 = 빌린 돈 × 1.5
  LOAN_YEARS: 20,

  tax: function (rate, level) { return (GL.POLICY.TAX[rate] || {})[level] || 0; },
  support: function (rate, level) { return (GL.POLICY.SUPPORT[rate] || {})[level] || 0; },
  repay: function (loan) { return Math.round(loan * GL.POLICY.INTEREST); },
  // 매달 갚는 돈 (원 단위, 천 원에서 반올림)
  monthlyWon: function (loan) {
    return Math.round(GL.POLICY.repay(loan) * 10000 / (GL.POLICY.LOAN_YEARS * 12) / 1000) * 1000;
  }
};
