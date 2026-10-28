/* =========================================================
   GENE LAB — Google Apps Script 백엔드
   시트: 학생명단(직접 입력) / 카드배정 · 제출데이터 · 세율투표 · 반설정(자동)
   ⚠️ 코드를 고친 뒤에는 [배포 → 배포 관리 → 수정(연필) → 새 버전]으로 배포하세요.
   ========================================================= */

var DASHBOARD_PW = '1234';            // 대시보드 비밀번호
var RATIO = [12, 16, 40, 24, 8];      // 형편 카드 L1~L5 비율(%) — 합계 100
var RATES = [0, 10, 30];              // 세율 투표 선택지(%)

var SH_ROSTER = '학생명단';
var SH_CARD = '카드배정';
var SH_SUB = '제출데이터';
var SH_VOTE = '세율투표';
var SH_CLASS = '반설정';

var CARD_HEADER = ['학번', '이름', '반', '단계', '배정일시'];
var VOTE_HEADER = ['학번', '반', '선택(%)', '투표일시'];
var CLASS_HEADER = ['반', '확정 세율(%)', '확정일시', '카드 순서'];
var SUB_HEADER = ['학번', '이름', '반', '단계', '예산(만원)', '사용금액(만원)', '편집수', '치료', '경계', '향상',
  '의도치않은변화', '선택결과(JSON)', '편지유형', 'Q1 좋은점', 'Q2 문제점', 'Q3 선택', 'Q3 이유', 'Q4 답장',
  '소요시간(초)', '제출횟수', '최종제출일시', '번 돈(만원)',
  '세율(%)', '세금(만원)', '국가 지원(만원)', '지원 신청', '대출(만원)'];

/* ---------- 라우터 ---------- */
function doGet(e) {
  return json_({ ok: true, msg: 'running' });
}

function doPost(e) {
  var params = {};
  try { params = JSON.parse(e.postData.contents); } catch (err) {}
  var action = (e.parameter && e.parameter.action) || params.action;
  var result;
  try {
    if (action === 'login') result = handleLogin(params);
    else if (action === 'vote') result = handleVote(params);
    else if (action === 'voteStatus') result = handleVoteStatus(params);
    else if (action === 'submit') result = handleSubmit(params);
    else if (action === 'dashboard') result = handleDashboard(params);
    else if (action === 'closeVote') result = handleCloseVote(params);
    else if (action === 'resetVote') result = handleResetVote(params);
    else result = { ok: false, msg: '알 수 없는 요청이에요.' };
  } catch (err) {
    result = { ok: false, msg: '서버 오류: ' + err.message };
  }
  return json_(result);
}

/* ---------- 로그인 + 형편 카드 배정 ---------- */
function handleLogin(params) {
  var id = String(params.id || '').trim();
  if (!/^\d{4}$/.test(id)) return { ok: false, msg: '학번 네 자리를 입력해 주세요.' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var roster = readRoster_(ss);
  var me = findInRoster_(roster, id);
  if (!me) return { ok: false, msg: '명단에 없는 학번이에요. 선생님께 확인해 주세요.' };
  var cls = id.substr(0, 2);

  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); }
  catch (e) { return { ok: false, msg: '지금 친구들이 한꺼번에 접속 중이에요. 잠시 후 다시 눌러 주세요.' }; }

  var level = 0;
  try {
    var sh = getSheet_(ss, SH_CARD, CARD_HEADER);
    var data = sh.getDataRange().getValues();
    var used = 0;
    for (var r = 1; r < data.length; r++) {
      var rid = String(data[r][0]).trim();
      if (rid === id) { level = Number(data[r][3]); break; }
      if (rid.substr(0, 2) === cls) used++;
    }

    if (!level) {
      var classSize = 0;
      for (var k = 0; k < roster.length; k++) {
        if (roster[k].id.substr(0, 2) === cls) classSize++;
      }
      var deck = getDeck_(ss, cls, classSize, used);
      level = used < deck.length ? deck[used] : deck[Math.floor(Math.random() * deck.length)];

      var row = sh.getLastRow() + 1;
      sh.getRange(row, 1, 1, 3).setNumberFormat('@');   // 학번·반('3-1'이 날짜로 바뀌지 않게) 텍스트로
      sh.getRange(row, 1, 1, 5).setValues([[id, me.name, label_(cls), level, now_()]]);
      SpreadsheetApp.flush();
    }
  } finally {
    lock.releaseLock();
  }
  return { ok: true, name: me.name, level: level, sub: findSub_(ss, id), vote: voteInfo_(ss, cls, id, roster) };
}

/* 반의 카드 더미: 그 반의 첫 학생이 들어올 때 무작위로 섞어 '반설정' 시트에 저장
   (카드배정 시트에서 그 반 학생 줄을 모두 지우면, 다음 접속 때 새로 섞여요) */
function getDeck_(ss, cls, classSize, used) {
  var sh = getSheet_(ss, SH_CLASS, CLASS_HEADER);
  var info = readClass_(ss, cls);
  if (used > 0 && info && info.deck) {
    var saved = info.deck.split(',').map(function (x) { return Number(x); });
    if (saved.length) return saved;
  }
  var deck = buildDeck_(Math.max(classSize, 1));
  var rowIdx = info ? info.row : sh.getLastRow() + 1;
  sh.getRange(rowIdx, 1).setNumberFormat('@');
  sh.getRange(rowIdx, 1).setValue(cls);
  sh.getRange(rowIdx, 4).setNumberFormat('@');
  sh.getRange(rowIdx, 4).setValue(deck.join(','));
  return deck;
}

/* 반 인원 n명에 맞춰 RATIO대로 카드 더미를 만들고 무작위로 섞기 */
function buildDeck_(n) {
  var counts = [];
  var rems = [];
  var total = 0;
  var i, j;
  for (i = 0; i < RATIO.length; i++) {
    var exact = n * RATIO[i] / 100;
    counts[i] = Math.floor(exact);
    rems.push({ i: i, r: exact - counts[i] });
    total += counts[i];
  }
  rems.sort(function (a, b) { return (b.r - a.r) || (a.i - b.i); });
  for (j = 0; total < n; j++) {
    counts[rems[j % rems.length].i]++;
    total++;
  }
  var deck = [];
  for (i = 0; i < counts.length; i++) {
    for (j = 0; j < counts[i]; j++) deck.push(i + 1);
  }
  for (i = deck.length - 1; i > 0; i--) {
    var p = Math.floor(Math.random() * (i + 1));
    var t = deck[i]; deck[i] = deck[p]; deck[p] = t;
  }
  return deck;
}

/* ---------- 세율 투표 ---------- */
function handleVote(params) {
  var id = String(params.id || '').trim();
  var rate = Number(params.rate);
  if (!/^\d{4}$/.test(id) || RATES.indexOf(rate) < 0) return { ok: false, msg: '투표 정보가 올바르지 않아요.' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var roster = readRoster_(ss);
  if (!findInRoster_(roster, id)) return { ok: false, msg: '명단에 없는 학번이에요.' };
  var cls = id.substr(0, 2);

  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); }
  catch (e) { return { ok: false, msg: '지금 친구들이 한꺼번에 투표 중이에요. 잠시 후 다시 눌러 주세요.' }; }

  try {
    var info = readClass_(ss, cls);
    if (info && info.rate !== '') {
      return { ok: true, vote: voteInfo_(ss, cls, id, roster) };   // 이미 마감됨
    }
    var sh = getSheet_(ss, SH_VOTE, VOTE_HEADER);
    var data = sh.getDataRange().getValues();
    var rowIdx = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === id) { rowIdx = i + 1; break; }
    }
    if (rowIdx < 0) rowIdx = sh.getLastRow() + 1;
    sh.getRange(rowIdx, 1, 1, 2).setNumberFormat('@');
    sh.getRange(rowIdx, 1, 1, 4).setValues([[id, label_(cls), rate, now_()]]);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return { ok: true, vote: voteInfo_(ss, cls, id, roster) };
}

function handleVoteStatus(params) {
  var id = String(params.id || '').trim();
  if (!/^\d{4}$/.test(id)) return { ok: false, msg: '학번 정보가 없어요.' };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return { ok: true, vote: voteInfo_(ss, id.substr(0, 2), id, null) };
}

/* 반의 투표 현황: { closed, rate, myVote, voted, total, counts } */
function voteInfo_(ss, cls, id, roster) {
  roster = roster || readRoster_(ss);
  var total = 0;
  for (var k = 0; k < roster.length; k++) {
    if (roster[k].id.substr(0, 2) === cls) total++;
  }
  var counts = tally_(ss)[cls] || emptyCounts_();
  var info = readClass_(ss, cls);
  var closed = !!(info && info.rate !== '');
  return {
    closed: closed,
    rate: closed ? Number(info.rate) : null,
    myVote: id ? myVote_(ss, id) : null,
    voted: counts.voted,
    total: total,
    counts: counts.byRate
  };
}

function emptyCounts_() {
  var byRate = {};
  for (var i = 0; i < RATES.length; i++) byRate[RATES[i]] = 0;
  return { voted: 0, byRate: byRate };
}

// 반별 투표 집계
function tally_(ss) {
  var out = {};
  var sh = ss.getSheetByName(SH_VOTE);
  if (!sh || sh.getLastRow() < 2) return out;
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var vid = String(data[i][0]).trim();
    if (!/^\d{4}$/.test(vid)) continue;
    var c = vid.substr(0, 2);
    if (!out[c]) out[c] = emptyCounts_();
    var r = Number(data[i][2]);
    if (out[c].byRate[r] !== undefined) { out[c].byRate[r]++; out[c].voted++; }
  }
  return out;
}

function myVote_(ss, id) {
  var sh = ss.getSheetByName(SH_VOTE);
  if (!sh || sh.getLastRow() < 2) return null;
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === id) return Number(data[i][2]);
  }
  return null;
}

/* 투표 마감: 가장 많은 표를 받은 세율로 확정 (동점이면 선생님이 고르도록 알려 줌) */
function handleCloseVote(params) {
  if (String(params.pw || '') !== DASHBOARD_PW) return { ok: false, msg: '비밀번호가 맞지 않아요.' };
  var cls = String(params.cls || '');
  if (!/^\d{2}$/.test(cls)) return { ok: false, msg: '반 정보가 올바르지 않아요.' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rate = null;
  if (params.force !== undefined && params.force !== null && RATES.indexOf(Number(params.force)) > -1) {
    rate = Number(params.force);
  } else {
    var counts = (tally_(ss)[cls] || emptyCounts_()).byRate;
    var max = -1;
    var top = [];
    for (var i = 0; i < RATES.length; i++) {
      var n = counts[RATES[i]];
      if (n > max) { max = n; top = [RATES[i]]; }
      else if (n === max) top.push(RATES[i]);
    }
    if (max <= 0) return { ok: false, msg: '아직 투표한 학생이 없어요.' };
    if (top.length > 1) return { ok: true, tie: top };
    rate = top[0];
  }

  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); }
  catch (e) { return { ok: false, msg: '잠시 후 다시 눌러 주세요.' }; }
  try {
    var sh = getSheet_(ss, SH_CLASS, CLASS_HEADER);
    var info = readClass_(ss, cls);
    var rowIdx = info ? info.row : sh.getLastRow() + 1;
    sh.getRange(rowIdx, 1).setNumberFormat('@');
    sh.getRange(rowIdx, 1, 1, 3).setValues([[cls, rate, now_()]]);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return { ok: true, rate: rate };
}

/* 투표 다시 하기: 그 반의 투표 기록과 확정 세율을 지움 (이미 받은 카드는 그대로) */
function handleResetVote(params) {
  if (String(params.pw || '') !== DASHBOARD_PW) return { ok: false, msg: '비밀번호가 맞지 않아요.' };
  var cls = String(params.cls || '');
  if (!/^\d{2}$/.test(cls)) return { ok: false, msg: '반 정보가 올바르지 않아요.' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); }
  catch (e) { return { ok: false, msg: '잠시 후 다시 눌러 주세요.' }; }
  try {
    var sh = ss.getSheetByName(SH_VOTE);
    if (sh && sh.getLastRow() >= 2) {
      var data = sh.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {   // 아래에서 위로 지워야 줄 번호가 안 꼬임
        if (String(data[i][0]).trim().substr(0, 2) === cls) sh.deleteRow(i + 1);
      }
    }
    var info = readClass_(ss, cls);
    if (info) getSheet_(ss, SH_CLASS, CLASS_HEADER).getRange(info.row, 2, 1, 2).setValues([['', '']]);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

/* ---------- 제출 (재제출 시 같은 학번 줄을 덮어씀) ---------- */
function handleSubmit(params) {
  var id = String(params.id || '').trim();
  if (!/^\d{4}$/.test(id)) return { ok: false, msg: '학번 정보가 없어요. 처음부터 다시 들어와 주세요.' };

  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); }
  catch (e) { return { ok: false, msg: '지금 많은 친구들이 동시에 제출 중이에요. 잠시 후 다시 눌러 주세요.' }; }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 단계는 학생이 보낸 값 대신 서버의 카드배정 기록을 믿음
    var level = Number(params.level) || 0;
    var cardData = getSheet_(ss, SH_CARD, CARD_HEADER).getDataRange().getValues();
    for (var c = 1; c < cardData.length; c++) {
      if (String(cardData[c][0]).trim() === id) { level = Number(cardData[c][3]); break; }
    }

    var sh = getSheet_(ss, SH_SUB, SUB_HEADER);
    var data = sh.getDataRange().getValues();
    var rowIdx = -1;
    var count = 0;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === id) {
        rowIdx = i + 1;
        count = Number(data[i][19]) || 0;
        break;
      }
    }

    var row = [
      id, clean_(params.name), clean_(params.clsLabel), level,
      Number(params.budget) || 0, Number(params.spent) || 0,
      Number(params.total) || 0, Number(params.treat) || 0, Number(params.border) || 0,
      Number(params.enhance) || 0, Number(params.side) || 0,
      JSON.stringify(params.picks || []), clean_(params.letterType),
      clean_(params.q1), clean_(params.q2), clean_(params.q3choice), clean_(params.q3), clean_(params.q4),
      Number(params.elapsed) || 0, count + 1, now_(),
      Number(params.earned) || 0,
      Number(params.rate) || 0, Number(params.tax) || 0, Number(params.support) || 0,
      clean_(params.supportStatus || '미신청'), Number(params.loan) || 0
    ];

    // 쇼핑은 1회만: 이미 제출한 학생이면 답변(14~18열)과 제출 횟수·시간만 바꾸고 나머지는 첫 제출 값 유지
    if (rowIdx > 0) {
      var old = data[rowIdx - 1];
      var keep = [4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 21, 22, 23, 24, 25, 26];
      for (var k = 0; k < keep.length; k++) {
        var col = keep[k];
        if (old[col] !== '' && old[col] != null) row[col] = old[col];
      }
    }

    if (rowIdx < 0) rowIdx = sh.getLastRow() + 1;
    sh.getRange(rowIdx, 1, 1, 3).setNumberFormat('@');   // 학번·이름·반 텍스트로
    sh.getRange(rowIdx, 12).setNumberFormat('@');
    sh.getRange(rowIdx, 1, 1, row.length).setValues([row]);
    SpreadsheetApp.flush();
    return { ok: true, count: count + 1 };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- 대시보드 데이터 ---------- */
function handleDashboard(params) {
  if (String(params.pw || '') !== DASHBOARD_PW) return { ok: false, msg: '비밀번호가 맞지 않아요.' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var roster = readRoster_(ss);

  var levelMap = {};
  var cardData = getSheet_(ss, SH_CARD, CARD_HEADER).getDataRange().getValues();
  for (var c = 1; c < cardData.length; c++) {
    levelMap[String(cardData[c][0]).trim()] = Number(cardData[c][3]);
  }
  var classes = {};
  for (var r = 0; r < roster.length; r++) {
    roster[r].level = levelMap[roster[r].id] || 0;
    classes[roster[r].id.substr(0, 2)] = true;
  }

  var subs = [];
  var data = getSheet_(ss, SH_SUB, SUB_HEADER).getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (!String(data[i][0]).trim()) continue;
    subs.push(rowToSub_(data[i]));
  }

  // 반별 투표 현황
  var tallies = tally_(ss);
  var votes = {};
  Object.keys(classes).forEach(function (cls) {
    var t = tallies[cls] || emptyCounts_();
    var info = readClass_(ss, cls);
    votes[cls] = { counts: t.byRate, voted: t.voted,
      closed: !!(info && info.rate !== ''), rate: info && info.rate !== '' ? Number(info.rate) : null };
  });
  return { ok: true, roster: roster, subs: subs, votes: votes };
}

/* ---------- 도우미 ---------- */
function rowToSub_(d) {
  var picks = [];
  try { picks = JSON.parse(d[11]); } catch (e) {}
  return {
    id: String(d[0]).trim(), name: String(d[1]), level: Number(d[3]),
    budget: Number(d[4]), spent: Number(d[5]),
    total: Number(d[6]), treat: Number(d[7]), border: Number(d[8]), enhance: Number(d[9]), side: Number(d[10]),
    picks: picks, letterType: String(d[12]),
    q1: String(d[13]), q2: String(d[14]), q3choice: String(d[15]), q3: String(d[16]), q4: String(d[17]),
    elapsed: Number(d[18]), count: Number(d[19]),
    time: (d[20] instanceof Date) ? Utilities.formatDate(d[20], 'Asia/Seoul', 'MM-dd HH:mm') : String(d[20]),
    earned: Number(d[21]) || 0,
    rate: Number(d[22]) || 0, tax: Number(d[23]) || 0, support: Number(d[24]) || 0,
    supportStatus: String(d[25] || '미신청'), loan: Number(d[26]) || 0
  };
}

// 이 학번의 제출 기록 (없으면 null)
function findSub_(ss, id) {
  var sh = ss.getSheetByName(SH_SUB);
  if (!sh || sh.getLastRow() < 2) return null;
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === id) return rowToSub_(data[i]);
  }
  return null;
}

// '반설정' 시트에서 한 반의 줄 읽기 → { row, rate, deck } 또는 null
function readClass_(ss, cls) {
  var sh = ss.getSheetByName(SH_CLASS);
  if (!sh || sh.getLastRow() < 2) return null;
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === cls) {
      return { row: i + 1, rate: data[i][1] === '' ? '' : String(data[i][1]), deck: String(data[i][3] || '') };
    }
  }
  return null;
}

function readRoster_(ss) {
  var sh = ss.getSheetByName(SH_ROSTER);
  if (!sh) throw new Error('"' + SH_ROSTER + '" 시트가 없어요.');
  var rows = sh.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var id = String(rows[i][0]).trim();
    if (/^\d{4}$/.test(id)) list.push({ id: id, name: String(rows[i][1]).trim() });
  }
  return list;
}

function findInRoster_(roster, id) {
  for (var i = 0; i < roster.length; i++) {
    if (roster[i].id === id) return roster[i];
  }
  return null;
}

function getSheet_(ss, name, header) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < header.length) {
    // 새 칸(예: 대출)이 추가된 경우 제목 줄만 다시 씀
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  }
  return sh;
}

function label_(cls) { return cls.charAt(0) + '-' + cls.charAt(1); }

// 학생 답이 = + - @ 로 시작하면 시트가 수식으로 읽지 않도록 앞에 ' 붙이기
function clean_(v) {
  var s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function now_() {
  return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- 편집기에서 직접 실행해 보는 테스트 ---------- */
function testDeck() {
  Logger.log(JSON.stringify(buildDeck_(25)));   // 25명: L1 3, L2 4, L3 10, L4 6, L5 2 (매번 다른 순서)
}
function testLogin() {
  Logger.log(JSON.stringify(handleLogin({ id: '3101' })));
}
