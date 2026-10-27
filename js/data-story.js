/* =========================================================
   data-story.js — 20년 후 뉴스, 아이의 편지, 성찰 질문
   s = 요약 정보 (simulate.js 의 summarize 결과)
     s.total, s.treat, s.border, s.enhance, s.side, s.ids[옵션id], s.firstSide, s.firstEnh
   ========================================================= */
GL.STORY = {};

/* ---------- 뉴스: 항상 나오는 2개 + 조건 뉴스 + 채움 뉴스 → 총 4개 ---------- */
GL.STORY.PINNED_NEWS = [
  { t: '유전성 빈혈 신규 환자 90% 감소', tone: 'good', sec: '보건' },
  { t: '대기업 신입사원 87%가 유전자 편집 출신', tone: 'bad', sec: '경제' }
];

GL.STORY.COND_NEWS = [ // 위에 있을수록 우선
  { t: '"편집 실패 아동" 첫 집단 소송 제기', tone: 'warn', sec: '사회',
    when: function (s) { return s.side > 0; } },
  { t: '비편집 청년 취업률 역대 최저', tone: 'bad', sec: '경제',
    when: function (s) { return s.total === 0; } },
  { t: '부유층 평균 수명 100세 돌파… 계층 간 수명 격차 30년', tone: 'bad', sec: '사회',
    when: function (s) { return !!s.ids.aging; } },
  { t: '출생 성비 불균형 심화… 20년 뒤 결혼 문제 우려', tone: 'bad', sec: '사회',
    when: function (s) { return !!s.ids.sex; } },
  { t: '수어 공동체 "우리 문화가 사라지고 있다"', tone: 'warn', sec: '문화',
    when: function (s) { return !!s.ids.gjb2; } },
  { t: '올림픽 "편집 선수" 별도 리그 논란', tone: 'warn', sec: '스포츠',
    when: function (s) { return !!(s.ids.mstn || s.ids.actn3); } },
  { t: '"편집 아이" 부모 기대 압박… 청소년 상담 급증', tone: 'warn', sec: '교육',
    when: function (s) { return s.enhance >= 3; } },
  { t: '유전병 걱정 없는 첫 세대, 성인이 되다', tone: 'good', sec: '보건',
    when: function (s) { return s.total > 0 && s.enhance === 0; } }
];

GL.STORY.FILLER_NEWS = [
  { t: '유전자 편집 클리닉, 서울 강남에만 40곳 몰려', tone: 'bad', sec: '사회' },
  { t: '보험사, 비편집자 보험료 인상 논란', tone: 'bad', sec: '경제' },
  { t: '유전자 편집 비용 건강보험 적용 법안, 3년째 국회 계류', tone: 'warn', sec: '정치' }
];

GL.STORY.pickNews = function (s) {
  var list = GL.STORY.PINNED_NEWS.slice();
  var extra = GL.STORY.COND_NEWS.filter(function (n) { return n.when(s); })
    .concat(GL.STORY.FILLER_NEWS);
  return list.concat(extra.slice(0, 2));
};

/* ---------- 아이의 편지 (위에서부터 먼저 맞는 것 하나) ---------- */
GL.STORY.pickLetter = function (s) {
  var hasPersonality = GL.PERSONALITY_IDS.some(function (id) { return s.ids[id]; });

  if (s.side > 0) {
    return { type: '①의도치않은변화', text:
      '요즘 몸이 이상해서 병원에 갔는데, 의사 선생님이 태어나기 전에 받은 「' + s.firstSide.name +
      '」 편집 때문일 수도 있대요. 두 분이 저 잘되라고 한 거 알아요. 그런데 그때 저는 아무것도 고를 수 없었잖아요. ' +
      '저한테 물어볼 수 있었다면, 저는 뭐라고 대답했을까요?' };
  }
  if (hasPersonality) {
    return { type: '②성격편집', text:
      '친구가 그러는데, 제 성격도 태어나기 전에 고른 거래요. 정말이에요? ' +
      '그럼 지금 친구를 걱정하는 이 마음은 진짜 제 마음일까요, 아니면 두 분이 돈을 주고 산 마음일까요?' };
  }
  if (s.enhance >= 3) {
    return { type: '③향상다수', text:
      '상을 받아도 사람들이 그래요. "원래 그렇게 태어났잖아." 밤새 연습한 날도 많았는데, ' +
      '이게 제 노력인지 유전자 덕분인지 이제는 저도 모르겠어요. 가끔은 그냥 평범하게 태어났으면 어땠을까 생각해요.' };
  }
  if (s.enhance >= 1) {
    return { type: '⑥향상일부', text:
      '엄마 아빠가 골라 준 「' + s.firstEnh.name + '」 덕분에 좋은 일이 많았어요. ' +
      '그런데 친구들 중에는 이런 걸 고를 수 없었던 아이가 훨씬 많아요. 제가 노력해서 얻은 게 아닌 걸로 앞서가는 게 가끔은 미안해요. 이게 공평한 걸까요?' };
  }
  if (s.total > 0) {
    return { type: '④치료만', text:
      '아프지 않게 해 줘서 고마워요. 덕분에 하고 싶은 걸 마음껏 하면서 자랐어요. ' +
      '그런데 같은 병을 가진 친구는 아직도 병원에 다녀요. 그 친구네 집도 할 수 있었으면 좋았을 텐데요.' };
  }
  return { type: '⑤편집없음', text:
    '우리 집이 못 해 준 거, 원망 안 해요. 진짜로요. 그런데 면접에서 "편집 안 하셨네요?"라는 말을 들었을 때는 기분이 좀 이상했어요. ' +
    '저는 그냥 저인데, 왜 모자란 사람이 된 것 같을까요?' };
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
