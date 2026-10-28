/* =========================================================
   student-money.js — 쇼핑 화면의 돈 관리
   - 예산 내역: 기본 예산 − 세금 + 국가 지원 + 아르바이트 + 대출
   - 국가 지원 신청: 우리 반 세율과 형편 단계에 따라 승인·탈락
   - 대출받기: 형편 단계별 한도, 갚을 돈 = 빌린 돈 × 1.5 (20년)
   ========================================================= */
GL.Money = {
  // 쓸 수 있는 돈 전체
  total: function () {
    var S = GL.state;
    return S.budget - S.tax + S.support + (S.earned || 0) + S.loan;
  },

  /* ---------- 왼쪽 패널의 예산 내역 ---------- */
  renderBreakdown: function () {
    var u = GL.util;
    var S = GL.state;
    var rows = [['기본 예산', S.budget, '']];
    if (S.tax) rows.push(['세금 (세율 ' + S.rate + '%)', -S.tax, 'minus']);
    if (S.support) rows.push(['국가 지원', S.support, 'plus']);
    if (S.earned) rows.push(['아르바이트', S.earned, 'plus']);
    if (S.loan) rows.push(['대출', S.loan, 'loan']);
    u.$('moneyRows').innerHTML = rows.length > 1 ? rows.map(function (r) {
      var sign = r[1] > 0 && r[2] ? '+' : r[1] < 0 ? '−' : '';
      return '<div class="mrow ' + r[2] + '"><span>' + r[0] + '</span><span class="mono">' + sign +
        u.money(Math.abs(r[1])).replace(' 원', '') + '</span></div>';
    }).join('') : '';

    // 국가 지원 버튼
    var sb = u.$('supportBtn');
    if (S.supportStatus === '승인') { sb.disabled = true; sb.textContent = '국가 지원 ✓ 받음'; }
    else if (S.supportStatus === '탈락') { sb.disabled = true; sb.textContent = '국가 지원 신청 · 탈락'; }
    else { sb.disabled = false; sb.textContent = '국가 지원 신청'; }

    // 대출 버튼
    var lb = u.$('loanBtn');
    var left = GL.POLICY.LOAN_LIMIT[S.level] - S.loan;
    lb.disabled = left < GL.POLICY.LOAN_STEP;
    lb.innerHTML = left < GL.POLICY.LOAN_STEP ? '대출 한도를 모두 썼어요'
      : '대출받기 <span class="mono muted">한도 ' + u.money(left).replace(' 원', '') + '</span>';
  },

  /* ---------- 국가 지원 신청 ---------- */
  applySupport: function () {
    var S = GL.state;
    var u = GL.util;
    if (S.results.length || S.supportStatus !== '미신청') return;
    var amount = GL.POLICY.support(S.rate, S.level);
    var title, body;

    if (amount > 0) {
      S.supportStatus = '승인';
      S.support = amount;
      title = '심사 결과: 승인';
      body = '우리 반이 정한 세율 ' + S.rate + '%로 모인 세금에서 <b>' + u.money(amount) + '</b>을 지원받았어요.' +
        (S.level === 1 ? ' 치료 1개 무료 지원은 그대로 받을 수 있어요.' : '');
    } else if (S.level === 1) {
      // 세율 0%: L1은 치료 1개 무료만 (추가 지원금 없음)
      S.supportStatus = '승인';
      title = '심사 결과: 승인';
      body = '기초생활수급 가정은 <b>치료 옵션 1개를 무료</b>로 받을 수 있어요. 우리 반 세율이 0%라서 추가 지원금은 없어요.';
    } else if (S.level === 2) {
      S.supportStatus = '탈락';
      title = '심사 결과: 탈락';
      body = '우리 집 소득이 지원 기준선보다 <b>조금 높아요.</b> 지금 제도에서는 기초생활수급 가정만 지원받을 수 있어요.' +
        '<br><span class="muted small">세율이 더 높았다면 우리 집도 지원받을 수 있었어요.</span>';
    } else {
      S.supportStatus = '탈락';
      title = '심사 결과: 지원 대상 아님';
      body = '우리 집은 지원 대상 소득 기준보다 소득이 높아요.' +
        (S.tax ? ' 대신 세금 ' + u.money(S.tax) + '을 냈어요. 그 돈은 형편이 어려운 집의 지원금이 되었어요.' : '');
    }
    GL.App.save();
    GL.Shop.render();
    GL.App.modal('<h3>' + title + '</h3><p>' + body + '</p>' +
      '<div class="modal-actions"><button class="btn btn-ink" id="mOk">확인</button></div>');
    u.$('mOk').onclick = GL.App.closeModal;
  },

  /* ---------- 대출 ---------- */
  loanAmount: 0,

  openLoan: function () {
    var S = GL.state;
    if (S.results.length) return;
    var left = GL.POLICY.LOAN_LIMIT[S.level] - S.loan;
    if (left < GL.POLICY.LOAN_STEP) return;
    GL.Money.loanAmount = Math.min(left, GL.POLICY.LOAN_STEP * 5);
    GL.Money.loanLeft = left;
    GL.App.modal(
      '<h3>대출받기</h3>' +
      '<p class="muted small">은행은 형편에 따라 빌려주는 돈이 달라요. 빌린 돈은 이자를 붙여 20년 동안 갚아야 해요.</p>' +
      '<div class="loan-row"><span>우리 집 대출 한도</span><span class="mono">' +
        GL.util.money(GL.POLICY.LOAN_LIMIT[S.level]) + (S.loan ? ' (이미 ' + GL.util.money(S.loan) + ' 빌림)' : '') + '</span></div>' +
      '<div class="loan-ctrl"><button class="btn" id="loanMinus">−</button>' +
      '<input type="range" id="loanRange" min="' + GL.POLICY.LOAN_STEP + '" max="' + left + '" step="' + GL.POLICY.LOAN_STEP + '" value="' + GL.Money.loanAmount + '">' +
      '<button class="btn" id="loanPlus">+</button></div>' +
      '<div class="loan-row big"><span>빌릴 돈</span><span class="mono" id="loanNow"></span></div>' +
      '<div class="loan-row minus"><span>갚을 돈 (이자 포함)</span><span class="mono" id="loanRepay"></span></div>' +
      '<div class="loan-row muted"><span>20년 동안 매달</span><span class="mono" id="loanMonthly"></span></div>' +
      '<div class="modal-actions"><button class="btn" id="loanCancel">취소</button>' +
      '<button class="btn btn-ink" id="loanOk">빌리기</button></div>');
    var u = GL.util;
    u.$('loanRange').oninput = function () { GL.Money.setLoan(Number(this.value)); };
    u.$('loanMinus').onclick = function () { GL.Money.setLoan(GL.Money.loanAmount - GL.POLICY.LOAN_STEP); };
    u.$('loanPlus').onclick = function () { GL.Money.setLoan(GL.Money.loanAmount + GL.POLICY.LOAN_STEP); };
    u.$('loanCancel').onclick = GL.App.closeModal;
    u.$('loanOk').onclick = GL.Money.borrow;
    GL.Money.setLoan(GL.Money.loanAmount);
  },

  setLoan: function (v) {
    var u = GL.util;
    v = Math.max(GL.POLICY.LOAN_STEP, Math.min(GL.Money.loanLeft, v));
    GL.Money.loanAmount = v;
    u.$('loanRange').value = v;
    u.$('loanNow').textContent = u.money(v);
    u.$('loanRepay').textContent = u.money(GL.POLICY.repay(GL.state.loan + v));
    u.$('loanMonthly').textContent = '약 ' + GL.POLICY.monthlyWon(GL.state.loan + v).toLocaleString('ko-KR') + '원';
  },

  borrow: function () {
    var S = GL.state;
    S.loan += GL.Money.loanAmount;
    GL.App.save();
    GL.App.closeModal();
    GL.Shop.render();
    GL.App.toast(GL.util.money(GL.Money.loanAmount) + '을 빌렸어요');
  }
};
