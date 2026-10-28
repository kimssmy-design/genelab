/* =========================================================
   student-shop.js — 유전자 편집 쇼핑몰
   왼쪽: 예산·선택 목록·탄생 버튼 / 오른쪽: 분류 탭 + 옵션 카드
   ========================================================= */
GL.Shop = {
  cat: 'disease',

  /* ---------- 계산 ---------- */
  isPicked: function (id) { return GL.state.picks.indexOf(id) > -1; },

  // L1 국가 지원: 아직 안 쓴 상태에서 '치료' 태그 옵션이면 무료
  isVoucherable: function (o) {
    var S = GL.state;
    return S.level === 1 && o.tag === 'treat' && !S.voucherId;
  },

  priceOf: function (o) { return GL.state.voucherId === o.id ? 0 : o.price; },

  spent: function () {
    return GL.state.picks.reduce(function (sum, id) { return sum + GL.Shop.priceOf(GL.optById[id]); }, 0);
  },

  // 쓸 수 있는 돈 = 기본 예산 − 세금 + 국가 지원 + 아르바이트 + 대출 (student-money.js)
  total: function () { return GL.Money.total(); },
  remaining: function () { return GL.Shop.total() - GL.Shop.spent(); },

  // 고를 수 있는지 + 못 고르는 이유
  check: function (o) {
    if (GL.Shop.isPicked(o.id)) return { ok: true };
    if (GL.Shop.isVoucherable(o)) return { ok: true };
    if (o.price <= GL.Shop.remaining()) return { ok: true };
    if (GL.state.level === 1 && o.tag === 'treat') return { ok: false, why: '지원은 1개만' };
    return { ok: false, why: '예산 부족' };
  },

  add: function (o) {
    var S = GL.state;
    if (!GL.Shop.check(o).ok || GL.Shop.isPicked(o.id)) return;
    if (GL.Shop.isVoucherable(o)) S.voucherId = o.id;
    S.picks.push(o.id);
    GL.Shop.render();
    GL.App.save();
  },

  remove: function (id) {
    var S = GL.state;
    S.picks = S.picks.filter(function (x) { return x !== id; });
    if (S.voucherId === id) S.voucherId = null;
    GL.Shop.render();
    GL.App.save();
  },

  /* ---------- 그리기 ---------- */
  show: function () {
    var S = GL.state;
    if (S.results.length || S.submitted) { GL.Report.show(); return; }  // 쇼핑은 1회만
    var lv = GL.LEVELS[S.level];
    GL.util.$('shopLevel').innerHTML =
      '<span class="lv-chip lv' + S.level + '">L' + S.level + '</span> ' + GL.util.esc(lv.name);
    GL.util.$('shopBudget').textContent = '예산 ' + GL.util.money(S.budget);
    GL.Shop.renderTabs();
    GL.Shop.render();
    GL.util.$('birthBtn').onclick = GL.Shop.birthConfirm;
    GL.util.$('jobBtn').onclick = GL.Job.open;
    GL.util.$('supportBtn').onclick = GL.Money.applySupport;
    GL.util.$('loanBtn').onclick = GL.Money.openLoan;
    GL.util.$('cartToggle').onclick = function () {
      GL.util.$('shopPanel').classList.toggle('open');
    };
    GL.App.show('scr-shop', 2, 2045);
  },

  renderTabs: function () {
    var html = GL.CATS.map(function (c) {
      return '<button class="tab' + (c.key === GL.Shop.cat ? ' on' : '') + '" data-cat="' + c.key + '">' + c.name + '</button>';
    }).join('');
    var tabs = GL.util.$('catTabs');
    tabs.innerHTML = html;
    tabs.querySelectorAll('.tab').forEach(function (b) {
      b.onclick = function () {
        GL.Shop.cat = b.dataset.cat;
        GL.Shop.renderTabs();
        GL.Shop.renderGrid();
        GL.util.$('optGrid').scrollTop = 0;
      };
    });
    var cat = GL.CATS.filter(function (c) { return c.key === GL.Shop.cat; })[0];
    GL.util.$('catNote').textContent = cat.note;
  },

  render: function () {
    GL.Shop.renderGrid();
    GL.Shop.renderPanel();
  },

  renderGrid: function () {
    var u = GL.util;
    var list = GL.OPTIONS.filter(function (o) { return o.cat === GL.Shop.cat; });
    var grid = u.$('optGrid');
    grid.innerHTML = list.map(function (o) {
      var picked = GL.Shop.isPicked(o.id);
      var chk = GL.Shop.check(o);
      var free = (!picked && GL.Shop.isVoucherable(o)) || GL.state.voucherId === o.id;
      var lock = !chk.ok ? GL.Shop.LOCK_SVG : '';
      var priceTxt = free
        ? '<span class="price mono"><s>' + u.money(o.price) + '</s> 무료</span>'
        : '<span class="price mono">' + lock + u.money(o.price) + '</span>';
      var state = picked ? '<span class="opt-state on">✓ 선택함</span>' : '';
      return '<button class="opt' + (picked ? ' sel' : '') + (!chk.ok ? ' locked' : '') + '" data-id="' + o.id + '">' +
        '<div class="opt-top"><span class="gene mono">' + u.esc(o.gene) + '</span>' +
        '<span class="tag ' + GL.TAGS[o.tag].cls + '">' + GL.TAGS[o.tag].name + '</span></div>' +
        '<div class="opt-name">' + u.esc(o.name) + '</div>' +
        '<div class="opt-bot">' + priceTxt + '<span class="rate mono">성공률 ' + o.rate + '%</span></div>' +
        state +
        '</button>';
    }).join('');
    grid.querySelectorAll('.opt').forEach(function (b) {
      b.onclick = function () { GL.Shop.openDetail(GL.optById[b.dataset.id]); };
    });
    GL.Shop.renderBanner();
  },

  LOCK_SVG: '<svg class="lock-ic" viewBox="0 0 16 16" aria-label="잠김"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',

  // 더 고를 수 있는 옵션이 하나도 없을 때 한 줄 안내
  renderBanner: function () {
    var any = GL.OPTIONS.some(function (o) { return !GL.Shop.isPicked(o.id) && GL.Shop.check(o).ok; });
    var b = GL.util.$('shopBanner');
    if (any) { b.classList.add('hidden'); return; }
    b.classList.remove('hidden');
    b.textContent = GL.state.picks.length
      ? '남은 예산으로 더 고를 수 있는 유전자가 없어요. 아르바이트·국가 지원·대출로 돈을 더 마련할 수 있어요.'
      : '우리 집 예산으로는 고를 수 있는 유전자가 없어요. 아르바이트·국가 지원·대출로 돈을 마련할 수 있어요.';
  },

  renderPanel: function () {
    var u = GL.util;
    var S = GL.state;
    var spent = GL.Shop.spent();
    var total = GL.Shop.total();
    var remain = total - spent;
    u.$('remain').textContent = u.money(remain);
    var pct = total > 0 ? Math.round(remain / total * 100) : 0;
    u.$('barFill').style.width = pct + '%';
    u.$('spentLine').textContent = u.money(spent) + ' 사용';

    var vNote = u.$('voucherNote');
    if (S.level === 1) {
      vNote.classList.remove('hidden');
      vNote.textContent = S.voucherId ? '국가 지원 1개를 사용했어요' : '국가 지원: 치료 옵션 1개 무료';
    } else {
      vNote.classList.add('hidden');
    }

    GL.Job.renderPanel();
    GL.Money.renderBreakdown();
    u.$('cartCount').textContent = S.picks.length;
    var cart = u.$('cartList');
    if (!S.picks.length) {
      cart.innerHTML = '<li class="cart-empty">오른쪽에서 유전자를 골라 보세요</li>';
    } else {
      cart.innerHTML = S.picks.map(function (id) {
        var o = GL.optById[id];
        var p = GL.Shop.priceOf(o);
        return '<li><span class="cart-name">' + u.esc(o.name) + '</span>' +
          '<span class="mono cart-price">' + (p ? u.money(p) : '무료') + '</span>' +
          '<button class="cart-x" data-id="' + id + '" aria-label="빼기">×</button></li>';
      }).join('');
      cart.querySelectorAll('.cart-x').forEach(function (b) {
        b.onclick = function () { GL.Shop.remove(b.dataset.id); };
      });
    }
  },

  /* ---------- 옵션 상세 ---------- */
  openDetail: function (o) {
    var u = GL.util;
    var picked = GL.Shop.isPicked(o.id);
    var chk = GL.Shop.check(o);
    var noneP = Math.round((100 - o.rate) * (1 - GL.sim.SIDE_SHARE));
    var sideP = 100 - o.rate - noneP;
    var btn = picked
      ? '<button class="btn" id="dAct">선택 취소</button>'
      : (chk.ok ? '<button class="btn btn-ink" id="dAct">선택하기</button>'
                : '<button class="btn" disabled>' + chk.why + '</button>');

    GL.App.modal(
      '<div class="d-top"><span class="gene mono">GENE · ' + u.esc(o.gene) + '</span>' +
      '<span class="tag ' + GL.TAGS[o.tag].cls + '">' + GL.TAGS[o.tag].name + '</span></div>' +
      '<h3>' + u.esc(o.name) + '</h3>' +
      '<p>' + u.esc(o.desc) + '</p>' +
      (o.gene === '다유전자' ? '<p class="muted small">다유전자: 수백 개 이상의 유전자가 함께 관여하는 특성이라 원하는 대로 바꾸기 어려워요.</p>' : '') +
      '<div class="d-odds">' +
        '<div class="odds-bar"><span class="o-ok" style="width:' + o.rate + '%"></span>' +
        '<span class="o-none" style="width:' + noneP + '%"></span>' +
        '<span class="o-side" style="width:' + sideP + '%"></span></div>' +
        '<div class="odds-legend mono"><span>● 성공 ' + o.rate + '%</span><span>○ 효과 없음 ' + noneP + '%</span>' +
        '<span>▲ 의도하지 않은 변화 ' + sideP + '%</span></div>' +
      '</div>' +
      '<div class="modal-actions"><span class="price mono big-price">' +
        (GL.Shop.isVoucherable(o) || GL.state.voucherId === o.id ? '무료 (국가 지원)' : u.money(o.price)) +
      '</span><button class="btn" id="dClose">닫기</button>' + btn + '</div>');

    u.$('dClose').onclick = GL.App.closeModal;
    var act = u.$('dAct');
    if (act) act.onclick = function () {
      if (picked) GL.Shop.remove(o.id); else GL.Shop.add(o);
      GL.App.closeModal();
    };
  },

  /* ---------- 아이 탄생 ---------- */
  birthConfirm: function () {
    var n = GL.state.picks.length;
    if (n === 0) {
      GL.App.confirm('편집 없이 탄생시킬까요?', '고른 유전자가 없어요. 이대로 아이를 탄생시키면 다시 바꿀 수 없어요.',
        '탄생시키기', GL.Shop.birth);
    } else {
      GL.App.confirm(n + '개를 편집해서 탄생시킬까요?', '탄생한 뒤에는 고른 유전자를 바꿀 수 없어요.',
        '탄생시키기', GL.Shop.birth);
    }
  },

  birth: function () {
    var S = GL.state;
    S.spent = GL.Shop.spent();
    S.results = S.picks.map(function (id) { return { id: id, status: GL.sim.roll(GL.optById[id]) }; });
    GL.App.save();

    // 짧은 편집 로그 연출 후 20년 뒤 리포트로
    var lines = ['수정란 준비 완료'];
    S.picks.slice(0, 6).forEach(function (id) { lines.push(GL.optById[id].gene + ' 편집 중…'); });
    if (S.picks.length > 6) lines.push('외 ' + (S.picks.length - 6) + '개 편집 중…');
    lines.push('탄생 · 20년이 흐릅니다');

    GL.App.lockModal = true;
    GL.App.modal('<div class="birth-log mono" id="birthLog"></div>');
    var log = GL.util.$('birthLog');
    var i = 0;
    var timer = setInterval(function () {
      if (i >= lines.length) {
        clearInterval(timer);
        setTimeout(function () {
          GL.App.closeModal();
          GL.App.lockModal = false;
          GL.Shop.yearJump(GL.Report.show);
        }, 450);
        return;
      }
      log.innerHTML += '<div>&gt; ' + GL.util.esc(lines[i++]) + '</div>';
    }, 260);
  },

  // 2045 → 2065 숫자가 올라가는 전환 화면
  yearJump: function (done) {
    var box = GL.util.$('yearJump');
    var num = GL.util.$('yearNum');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    box.classList.remove('hidden');
    var y = reduce ? 2065 : 2045;
    num.textContent = y;
    var t = setInterval(function () {
      if (y < 2065) { y++; num.textContent = y; return; }
      clearInterval(t);
      setTimeout(function () {
        done();
        box.classList.add('hidden');
      }, 700);
    }, 55);
  }
};
