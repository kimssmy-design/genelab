/* =========================================================
   GENE LAB — Google Apps Script 백엔드
   시트 3개: 학생명단(직접 입력) / 카드배정(자동) / 제출데이터(자동)
   ⚠️ 코드를 고친 뒤에는 반드시 [배포 → 새 배포] 해야 적용돼요.
   ========================================================= */

var DASHBOARD_PW = '1234';            // 대시보드 비밀번호
var RATIO = [12, 16, 40, 24, 8];      // 형편 카드 L1~L5 비율(%) — 합계 100
var SHUFFLE_SALT = 'genelab-2026';    // 바꾸면 반별 카드 순서가 새로 섞여요

var SH_ROSTER = '학생명단';
var SH_CARD = '카드배정';
var SH_SUB = '제출데이터';

var CARD_HEADER = ['학번', '이름', '반', '단계', '배정일시'];
var SUB_HEADER = ['학번', '이름', '반', '단계', '예산(만원)', '사용금액(만원)', '편집수', '치료', '경계', '향상',
  '의도치않은변화', '선택결과(JSON)', '편지유형', 'Q1 좋은점', 'Q2 문제점', 'Q3 선택', 'Q3 이유', 'Q4 답장',
  '소요시간(초)', '제출횟수', '최종제출일시'];

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
    else if (action === 'submit') result = handleSubmit(params);
    else if (action === 'dashboard') result = handleDashboard(params);
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
  var me = null;
  for (var i = 0; i < roster.length; i++) {
    if (roster[i].id === id) { me = roster[i]; break; }
  }
  if (!me) return { ok: false, msg: '명단에 없는 학번이에요. 선생님께 확인해 주세요.' };

  var cls = id.substr(0, 2);

  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); }
  catch (e) { return { ok: false, msg: '지금 친구들이 한꺼번에 접속 중이에요. 잠시 후 다시 눌러 주세요.' }; }

  try {
    var sh = getSheet_(ss, SH_CARD, CARD_HEADER);
    var data = sh.getDataRange().getValues();
    var used = 0;
    for (var r = 1; r < data.length; r++) {
      var rid = String(data[r][0]).trim();
      if (rid === id) return { ok: true, name: me.name, level: Number(data[r][3]), sub: findSub_(ss, id) };
      if (rid.substr(0, 2) === cls) used++;
    }

    var classSize = 0;
    for (var k = 0; k < roster.length; k++) {
      if (roster[k].id.substr(0, 2) === cls) classSize++;
    }
    var deck = buildDeck_(classSize, cls);
    var level = used < deck.length ? deck[used] : 3;

    var row = sh.getLastRow() + 1;
    sh.getRange(row, 1, 1, 3).setNumberFormat('@');   // 학번·반('3-1'이 날짜로 바뀌지 않게) 텍스트로
    sh.getRange(row, 1, 1, 5).setValues([[id, me.name, cls.charAt(0) + '-' + cls.charAt(1), level, now_()]]);
    SpreadsheetApp.flush();
    return { ok: true, name: me.name, level: level, sub: null };
  } finally {
    lock.releaseLock();
  }
}

/* 반 인원 n명에 맞춰 RATIO대로 카드 더미를 만들고, 반마다 정해진 순서로 섞기 */
function buildDeck_(n, cls) {
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
  var seed = (hash_(SHUFFLE_SALT + cls) % 2147483646) + 1;
  for (i = deck.length - 1; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    var p = seed % (i + 1);
    var t = deck[i]; deck[i] = deck[p]; deck[p] = t;
  }
  return deck;
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
      Number(params.elapsed) || 0, count + 1, now_()
    ];

    // 쇼핑은 1회만: 이미 제출한 학생이면 예산~편지유형(5~13열)·소요시간(19열)은 첫 제출 값 유지
    if (rowIdx > 0) {
      var old = data[rowIdx - 1];
      for (var k = 4; k <= 12; k++) row[k] = old[k];
      row[18] = old[18];
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
  for (var r = 0; r < roster.length; r++) {
    roster[r].level = levelMap[roster[r].id] || 0;
  }

  var subs = [];
  var data = getSheet_(ss, SH_SUB, SUB_HEADER).getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (!String(data[i][0]).trim()) continue;
    subs.push(rowToSub_(data[i]));
  }
  return { ok: true, roster: roster, subs: subs };
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
    time: (d[20] instanceof Date) ? Utilities.formatDate(d[20], 'Asia/Seoul', 'MM-dd HH:mm') : String(d[20])
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

function getSheet_(ss, name, header) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

// 학생 답이 = + - @ 로 시작하면 시트가 수식으로 읽지 않도록 앞에 ' 붙이기
function clean_(v) {
  var s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function hash_(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647;
  return h;
}

function now_() {
  return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- 편집기에서 직접 실행해 보는 테스트 ---------- */
function testDeck() {
  Logger.log(JSON.stringify(buildDeck_(25, '31')));   // 25명: L1 3, L2 4, L3 10, L4 6, L5 2
  Logger.log(JSON.stringify(buildDeck_(22, '32')));
}
function testLogin() {
  Logger.log(JSON.stringify(handleLogin({ id: '3101' })));
}
