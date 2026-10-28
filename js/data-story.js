/* =========================================================
   data-story.js — 20년 후 뉴스, 아이의 편지, 성찰 질문
   s = 요약 정보 (simulate.js 의 summarize 결과)
     s.total, s.treat, s.border, s.enhance, s.side, s.ids[옵션id], s.firstSide, s.firstEnh
   ========================================================= */
GL.STORY = {};

/* ---------- 2065년 뉴스 ----------
   탄생할 때 4개를 골라 저장해요 (새로고침해도 그대로)
   ① 좋은 소식 1개  ② 내 선택과 관련된 뉴스 2개  ③ 사회 전체 뉴스 1개
   tone: good(초록) · bad(빨강) · warn(주황) */
GL.STORY.NEWS = {
  // ① 좋은 소식 — 기술의 장점
  good: [
    { t: '유전성 빈혈 신규 환자 90% 감소', sec: '보건' },
    { t: '헌팅턴병 신규 진단 3년 연속 "0명"', sec: '보건' },
    { t: '희귀 유전병 환자 단체 해산… "우리가 마지막 세대이길"', sec: '보건' },
    { t: '맞춤형 유전자 치료, 생후 100일 이내 아기 건강보험 적용', sec: '보건' },
    { t: '근이영양증 어린이 병동 문 닫아… "휠체어 대신 자전거"', sec: '보건' },
    { t: '소아 유전 질환 사망률 20년 새 85% 줄어', sec: '보건' },
    { t: '유전자 편집 치료 받은 1세대, 첫 "건강한 부모"가 되다', sec: '사회' }
  ],
  // ③ 사회 전체 뉴스 — 누가 고르든 나올 수 있는 변화
  social: [
    { t: '대기업 신입사원 87%가 유전자 편집 출신', sec: '경제', tone: 'bad' },
    { t: '유전자 편집 클리닉, 서울 강남에만 40곳 몰려', sec: '사회', tone: 'bad' },
    { t: '보험사, 비편집자 보험료 인상 논란', sec: '경제', tone: 'bad' },
    { t: '유전자 편집 비용 건강보험 적용 법안, 3년째 국회 계류', sec: '정치', tone: 'warn' },
    { t: '"이력서에 편집 여부 묻지 마라"… 유전자 차별 금지법 국회 통과', sec: '정치', tone: 'warn' },
    { t: '결혼정보회사 "편집 등급" 도입 논란', sec: '사회', tone: 'bad' },
    { t: '대학 입시 "편집 이력 공개" 요구에 교육부 "검토 안 해"', sec: '교육', tone: 'warn' },
    { t: '"편집 안 한 아이가 진짜 아이" 자연 출산 모임 회원 10만 명 넘어', sec: '사회', tone: 'warn' },
    { t: '유전자 편집 상품 광고 금지 법안… 업계 "선택의 자유 침해"', sec: '정치', tone: 'warn' }
  ],
  // ② 형편 단계에 따른 뉴스
  low: [
    { t: '비편집 청년 취업률 역대 최저', sec: '경제', tone: 'bad' },
    { t: '"편집 격차 해소" 국가 지원 확대 법안, 또 부결', sec: '정치', tone: 'bad' },
    { t: '차상위 가구 "지원 사각지대" 헌법소원… "가난해서가 아니라 덜 가난해서 못 받았다"', sec: '사회', tone: 'bad' },
    { t: '지방 소도시 초등학교, 편집 아동 비율 서울의 4분의 1', sec: '교육', tone: 'warn' }
  ],
  high: [
    { t: '상위 1% 가정 자녀, 평균 유전자 편집 11개', sec: '경제', tone: 'bad' },
    { t: '부유층 "편집 패키지" 해외 원정 성행… 1인 10억 원대', sec: '사회', tone: 'bad' },
    { t: '"부모 잘 만난 유전자"… 편집 세대 자녀들 "우리도 불행하다" 호소', sec: '사회', tone: 'warn' }
  ],
  // ② 편집 결과에 따른 뉴스
  side: [
    { t: '"편집 실패 아동" 첫 집단 소송 제기', sec: '사회', tone: 'warn' },
    { t: '의도하지 않은 변화 피해자 보상 기금 출범… "누가 책임지나"', sec: '사회', tone: 'warn' }
  ],
  none: [
    { t: '"효과 없는 편집" 환불 소송 패소… 법원 "결과를 보장하는 상품 아니다"', sec: '사회', tone: 'warn' },
    { t: '"편집했는데 왜 평범하냐"… 부모 기대에 지친 20대 상담 늘어', sec: '사회', tone: 'warn' }
  ],
  zero: [
    { t: '편집하지 않은 20대, 이제 전체의 15%… "우리도 같은 출발선에 서고 싶다"', sec: '사회', tone: 'bad' }
  ],
  // ② 고른 유전자에 따른 뉴스 (옵션 id별)
  item: {
    hbb: [{ t: '겸상적혈구 빈혈 전문 병동, 마지막 환자 퇴원', sec: '보건', tone: 'good' }],
    cftr: [{ t: '낭포성 섬유증 없는 첫 세대, 마라톤 대회 단체 완주', sec: '보건', tone: 'good' }],
    htt: [{ t: '헌팅턴병 가족 모임 "대물림되던 공포가 끝났다"', sec: '보건', tone: 'good' }],
    dmd: [{ t: '휠체어 농구 리그 선수 부족… "장애인 스포츠 문화도 지켜야"', sec: '스포츠', tone: 'warn' }],
    brca1: [{ t: '암 예방 수술 받는 20대 사라져… "엄마 세대의 두려움 끝"', sec: '보건', tone: 'good' }],
    apoe: [{ t: '"치매 걱정 없는 노후" 광고 과장 논란… 효과는 50년 뒤에야 확인', sec: '보건', tone: 'warn' }],
    allergy: [{ t: '급식 알레르기 표시 폐지 논의… "아직 알레르기 있는 아이는?"', sec: '교육', tone: 'warn' }],
    ccr5: [{ t: 'CCR5 편집 세대, 신종 바이러스 유행에 더 취약하다는 연구 나와', sec: '보건', tone: 'warn' }],
    gjb2: [{ t: '수어 공동체 "우리 문화가 사라지고 있다"', sec: '문화', tone: 'warn' }],
    mstn: [{ t: '올림픽 "편집 선수" 별도 리그 논란', sec: '스포츠', tone: 'warn' },
           { t: '체육 특기자 전형, 편집 여부 공개 의무화', sec: '교육', tone: 'warn' }],
    actn3: [{ t: '100m 세계 기록 30년 만에 1초 단축… "인간의 기록인가"', sec: '스포츠', tone: 'warn' }],
    mc4r: [{ t: '"먹어도 안 찌는 몸" 편집 인기… 청소년 몸 평가 압박은 오히려 커져', sec: '사회', tone: 'warn' },
           { t: '비만 치료제 시장 반토막… 제약사 구조조정', sec: '경제', tone: 'warn' }],
    lrp5: [{ t: '교통사고 골절 환자 급감… 보험사 "편집자 할인" 상품 출시', sec: '경제', tone: 'warn' }],
    slc30a8: [{ t: '20대 당뇨 환자 절반 줄어… 그러나 저소득층 당뇨는 그대로', sec: '보건', tone: 'warn' }],
    pcsk9: [{ t: '심장병 사망 역대 최저… "약 대신 태어나기 전 편집"', sec: '보건', tone: 'good' }],
    dec2: [{ t: '"4시간 수면 인재" 우대 채용 공고 논란… 노동 시간 늘어날까', sec: '경제', tone: 'bad' }],
    hla: [{ t: '20대 자가면역 질환 환자 3배 증가… 면역 편집 원인 지목', sec: '보건', tone: 'warn' }],
    aging: [{ t: '부유층 평균 수명 100세 돌파… 계층 간 수명 격차 30년', sec: '사회', tone: 'bad' },
            { t: '국민연금 고갈 10년 앞당겨져… "장수 편집" 책임 논쟁', sec: '경제', tone: 'warn' }],
    iq: [{ t: '영재고 합격자 절반이 "지능 편집"… 사교육 대신 "유전자 교육" 시대', sec: '교육', tone: 'bad' },
         { t: '수능 만점자 12명 전원 편집 출신', sec: '교육', tone: 'bad' }],
    mem: [{ t: '"외우는 시험은 의미 없다"… 편집 세대 맞춰 시험 제도 개편 논의', sec: '교육', tone: 'warn' }],
    focus: [{ t: '"집중력 편집" 학생 학습 시간 하루 14시간… 건강 우려', sec: '교육', tone: 'warn' }],
    dance: [{ t: '아이돌 오디션 합격자 90%가 편집 출신… "타고난 재능만 남았다"', sec: '문화', tone: 'warn' }],
    voice: [{ t: '보컬 학원 폐업 속출… "노력으로는 편집 목소리 못 따라가"', sec: '문화', tone: 'warn' }],
    pitch: [{ t: '음대 입시 "절대음감 편집자" 별도 전형 신설 논란', sec: '교육', tone: 'warn' }],
    lang: [{ t: '통번역대학원 "편집자만 합격"… 비편집 지원자 사라져', sec: '교육', tone: 'warn' }],
    scn9a: [{ t: '"통증 없는 세대" 응급실 늦은 방문 사고 잇따라', sec: '보건', tone: 'warn' }],
    model: [{ t: '"복사 얼굴 세대"… 오디션 심사위원 "개성이 사라졌다"', sec: '사회', tone: 'warn' }],
    features: [{ t: '성형외과 절반 폐업… 대신 "얼굴 편집 상담소" 성업', sec: '경제', tone: 'warn' }],
    eyelid: [{ t: '홑꺼풀 아이돌 데뷔에 "용기 있다" 반응… 외모 기준 논쟁', sec: '문화', tone: 'warn' }],
    skin: [{ t: '"여드름 난 얼굴은 편집 안 한 증거"… 청소년 외모 차별 신조어 등장', sec: '사회', tone: 'bad' }],
    teeth: [{ t: '치아 교정 수요 80% 감소… 교정 치과 "편집 못 한 아이만 온다"', sec: '보건', tone: 'warn' }],
    oca2: [{ t: '파란 눈 신생아 10배 증가… "한국인다운 얼굴"이란 무엇인가', sec: '문화', tone: 'warn' }],
    height: [{ t: '20대 남녀 평균 키 7cm 커져… 비편집 청년 "작다는 이유로 탈락"', sec: '사회', tone: 'bad' }],
    sex: [{ t: '출생 성비 불균형 심화… 20년 뒤 결혼 문제 우려', sec: '사회', tone: 'bad' }],
    maoa: [{ t: '"성격 편집 이력" 요구하는 기업 등장… 인권위 "차별"', sec: '사회', tone: 'bad' }],
    anx: [{ t: '"겁 없는 세대" 안전사고 증가… 불안 편집 부작용 논란', sec: '사회', tone: 'warn' }],
    extro: [{ t: '"진짜 나를 찾고 싶다"… 성격 편집 세대 상담 급증', sec: '사회', tone: 'warn' }],
    lead: [{ t: '학생회장 선거 후보 전원 "리더십 편집"… 학생들 "뽑을 이유가 없다"', sec: '교육', tone: 'warn' }],
    oxtr: [{ t: '공감 편집 세대, 간호·상담 직업 쏠림… "감정 노동 대물림" 우려', sec: '사회', tone: 'warn' }],
    myopia: [{ t: '안경점 절반 문 닫아… 근시 편집 세대 성인 돼', sec: '경제', tone: 'warn' }],
    ar: [{ t: '탈모 치료제 시장 붕괴… "아버지 세대의 고민이 사라졌다"', sec: '경제', tone: 'warn' }]
  }
};

GL.STORY.pickNews = function (s, level) {
  var N = GL.STORY.NEWS;
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    arr = arr.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // ① 좋은 소식
  var good = rand(N.good);
  var out = [{ t: good.t, sec: good.sec, tone: 'good' }];

  // ② 내 선택과 관련된 뉴스 후보
  var mine = [];
  Object.keys(s.ids).forEach(function (id) { (N.item[id] || []).forEach(function (n) { mine.push(n); }); });
  var outcome = [];
  if (s.side > 0) outcome = outcome.concat(N.side);
  if (s.none > 0) outcome = outcome.concat(N.none);
  if (s.total === 0) outcome = outcome.concat(N.zero);
  var lvNews = level <= 2 ? N.low : level >= 4 ? N.high : [];

  // 의도하지 않은 변화·편집 없음은 꼭 한 개 넣고, '효과 없음' 뉴스는 반반 확률로 넣음
  // 나머지는 고른 유전자·형편 뉴스에서 무작위
  var picked = [];
  if (outcome.length && (s.side > 0 || s.total === 0 || Math.random() < 0.5)) picked.push(rand(outcome));
  shuffle(mine.concat(lvNews)).forEach(function (n) {
    if (picked.length < 2 && picked.indexOf(n) < 0) picked.push(n);
  });
  // 후보가 모자라면 사회 뉴스로 채움
  var socialPool = shuffle(N.social);
  while (picked.length < 2) picked.push(socialPool.pop());

  // ③ 사회 전체 뉴스 1개 (겹치지 않게)
  var social = socialPool.filter(function (n) { return picked.indexOf(n) < 0; })[0];
  out = out.concat(picked, [social]);

  // 날짜: 서로 다른 달 4개를 골라 순서대로
  var months = shuffle(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']).slice(0, 4).sort();
  return shuffle(out).map(function (n, i) {
    return { t: n.t, sec: n.sec, tone: n.tone || 'warn', date: '2065.' + months[i] };
  });
};

/* ---------- 리포트 첫 줄: 스무 살 아이 소개 ---------- */
GL.STORY.profileLine = function (s) {
  if (s.side > 0) return '건강하게 자랐지만, 몸에 예상하지 못한 변화가 생겼어요.';
  if (s.enhance >= 3) return '어릴 때부터 "특별하게 태어난 아이"라는 말을 들으며 자랐어요.';
  if (s.enhance >= 1) return '남들보다 조금 앞선 채로 스무 살이 되었어요.';
  if (s.total > 0) return '큰 병 없이 건강하게 스무 살이 되었어요.';
  return '유전자 편집 없이 태어나 스무 살이 되었어요.';
};

/* ---------- 성찰 질문 ---------- */
GL.STORY.Q3_CHOICES = ['전면 금지', '질병 치료만 허용', '능력 향상까지 허용'];

GL.STORY.QUESTIONS = [
  { key: 'q1', label: 'Q1. 유전자 편집 기술의 좋은 점은 무엇일까요?',
    ph: '예: 유전병으로 고통받는 사람이 줄어든다…' },
  { key: 'q2', label: 'Q2. 이 기술이 널리 쓰이면 어떤 문제가 생길 수 있을까요?',
    ph: '오늘 활동에서 느낀 점을 떠올려 보세요' },
  { key: 'q3', label: 'Q3. 유전자 편집을 어디까지 허용해야 할까요? 고르고 이유를 써 보세요.',
    ph: '그렇게 생각한 이유는…', choice: true },
  { key: 'q4', label: 'Q4. 아이의 편지에 한 줄로 답장해 보세요.',
    ph: '사랑하는 우리 아이에게…' }
];
