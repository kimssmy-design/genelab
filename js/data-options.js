/* =========================================================
   data-options.js — 유전자 옵션 41개 (수업 내용 수정은 여기서)
   price: 만 원 / rate: 원하는 효과가 나타날 확률(%)
   tag: treat(치료) · border(경계) · enhance(향상)
   side: '의도하지 않은 변화'가 생겼을 때 보여 줄 문장 (없으면 기본 문장)
   ========================================================= */
GL.CATS = [
  { key: 'disease', name: '질병 예방',   note: '실제로 연구 중이거나 치료 사례가 있는 기술을 바탕으로 했어요.' },
  { key: 'body',    name: '건강한 체질', note: '실제로 보고된 유전자 변이를 바탕으로 했지만, 편집 기술은 가상의 미래 기술이에요.' },
  { key: 'ability', name: '능력·재능',   note: '이 분류는 모두 가상의 미래 기술이에요.' },
  { key: 'look',    name: '외모',        note: '이 분류는 모두 가상의 미래 기술이에요.' },
  { key: 'mind',    name: '성격·특별',   note: '성별 선택을 빼면 모두 가상의 미래 기술이에요.' }
];

GL.TAGS = {
  treat:   { name: '치료', cls: 'tag-treat' },
  border:  { name: '경계', cls: 'tag-border' },
  enhance: { name: '향상', cls: 'tag-enh' }
};

GL.DEFAULT_SIDE = '의도하지 않은 다른 유전자가 함께 바뀌었어요';

GL.OPTIONS = [
  /* ---------- 질병 예방 (8) ---------- */
  { id: 'hbb', cat: 'disease', gene: 'HBB', name: '겸상적혈구 빈혈 예방', price: 300, rate: 95, tag: 'treat',
    desc: '적혈구가 낫 모양으로 변해 심한 통증과 빈혈을 일으키는 유전병을 막아요. 2023년에 실제 유전자 치료제가 승인됐어요.',
    side: '피가 쉽게 멈추지 않는 체질이 되었어요' },
  { id: 'cftr', cat: 'disease', gene: 'CFTR', name: '낭포성 섬유증 예방', price: 400, rate: 92, tag: 'treat',
    desc: '폐와 소화기관에 끈적한 점액이 쌓여 숨쉬기 어려워지는 유전병을 막아요.',
    side: '폐는 건강해졌지만 소화가 잘 안 돼요' },
  { id: 'htt', cat: 'disease', gene: 'HTT', name: '헌팅턴병 예방', price: 500, rate: 90, tag: 'treat',
    desc: '어른이 된 뒤 몸이 마음대로 움직이고 기억이 사라지는 유전병을 막아요.',
    side: '감정이 쉽게 가라앉는 기질이 생겼어요' },
  { id: 'dmd', cat: 'disease', gene: 'DMD', name: '근이영양증 예방', price: 500, rate: 88, tag: 'treat',
    desc: '근육이 점점 약해져 걷기 어려워지는 유전병을 막아요.',
    side: '심장 박동이 가끔 불규칙해졌어요' },
  { id: 'brca1', cat: 'disease', gene: 'BRCA1', name: '유방암·난소암 위험 감소', price: 800, rate: 85, tag: 'treat',
    desc: '암에 걸릴 위험을 크게 높이는 유전자 변이를 고쳐요.',
    side: '호르몬 균형이 쉽게 무너지는 체질이 되었어요' },
  { id: 'apoe', cat: 'disease', gene: 'APOE', name: '알츠하이머 위험 감소', price: 1000, rate: 75, tag: 'treat',
    desc: '나이 들어 치매에 걸릴 위험을 높이는 유전자형을 바꿔요.',
    side: '잠을 깊이 자지 못하게 되었어요' },
  { id: 'ccr5', cat: 'disease', gene: 'CCR5', name: 'HIV 감염 저항', price: 700, rate: 80, tag: 'border',
    desc: 'HIV 바이러스가 세포로 들어오는 문을 닫아요. 2018년 중국에서 이 편집으로 아기가 태어나 전 세계가 충격을 받았어요.',
    side: '다른 바이러스 감염에는 오히려 약해졌어요' },
  { id: 'gjb2', cat: 'disease', gene: 'GJB2', name: '선천성 난청 예방', price: 400, rate: 90, tag: 'border',
    desc: '태어날 때부터 잘 듣지 못하는 것을 막아요. 수어를 쓰는 사람들은 청각장애를 "고칠 병이 아닌 하나의 문화"라고 말하기도 해요.',
    side: '작은 소리에도 귀가 아플 만큼 예민해졌어요' },

  /* ---------- 건강한 체질 (8) ---------- */
  { id: 'mstn', cat: 'body', gene: 'MSTN', name: '근육이 잘 붙는 체질', price: 3000, rate: 80, tag: 'enhance',
    desc: '근육이 자라는 것을 막는 유전자를 꺼요. 운동을 조금만 해도 근육이 붙어요. 실제로 이 유전자가 꺼진 "근육 소"와 "근육 개"가 있어요.',
    side: '심장이 쉽게 지쳐요' },
  { id: 'mc4r', cat: 'body', gene: 'MC4R', name: '살이 잘 찌지 않는 체질', price: 5000, rate: 75, tag: 'border',
    desc: '식욕과 에너지 사용을 조절하는 유전자를 바꿔요. 실제로 이 유전자의 일부 변이를 가진 사람은 비만 위험이 낮다는 연구가 있어요.',
    side: '배고픔을 잘 느끼지 못해 영양이 자주 부족해요' },
  { id: 'lrp5', cat: 'body', gene: 'LRP5', name: '뼈가 단단한 체질', price: 1500, rate: 85, tag: 'border',
    desc: '뼈가 아주 단단해져 잘 부러지지 않아요. 실제로 교통사고에도 뼈가 부러지지 않은 가족에게서 이 변이가 발견됐어요.',
    side: '뼈가 너무 두꺼워져 신경을 눌러 두통이 잦아요' },
  { id: 'slc30a8', cat: 'body', gene: 'SLC30A8', name: '당뇨 걱정 없는 체질', price: 1200, rate: 85, tag: 'border',
    desc: '혈당 조절과 관련된 유전자를 바꿔 당뇨 위험을 낮춰요. 실제로 이 변이를 가진 사람은 당뇨 위험이 낮다는 연구가 있어요.',
    side: '혈당이 너무 떨어져 어지러울 때가 많아요' },
  { id: 'pcsk9', cat: 'body', gene: 'PCSK9', name: '심장이 튼튼한 체질', price: 600, rate: 85, tag: 'border',
    desc: '콜레스테롤 수치를 낮춰 심장병 위험을 줄여요. 성인을 대상으로 실제 연구가 진행 중이에요.',
    side: '간 수치가 자주 높게 나와요' },
  { id: 'dec2', cat: 'body', gene: 'DEC2', name: '4시간만 자도 충분', price: 4000, rate: 70, tag: 'enhance',
    desc: '하루 4시간만 자도 개운해요. 실제로 이런 변이를 가진 가족이 있지만, 오랫동안 몸에 어떤 영향이 있는지는 아직 몰라요.',
    side: '나이가 들수록 쉽게 피곤해져요' },
  { id: 'hla', cat: 'body', gene: 'HLA 등', name: '면역력 강화', price: 1500, rate: 70, tag: 'border',
    desc: '감기 같은 병에 거의 걸리지 않아요.', side: '면역이 내 몸을 공격하는 자가면역 질환이 생겼어요' },
  { id: 'aging', cat: 'body', gene: '다유전자', name: '노화 지연 (수명 +20년)', price: 20000, rate: 50, tag: 'enhance',
    desc: '늙는 속도를 늦춰 평균보다 20년 더 살 수 있어요.', side: '세포가 비정상적으로 자랄 위험이 커졌어요' },

  /* ---------- 능력·재능 (9) ---------- */
  { id: 'iq', cat: 'ability', gene: '다유전자', name: '지능(IQ) 향상', price: 15000, rate: 25, tag: 'enhance',
    desc: '머리가 좋아져요. 지능에는 수천 개의 유전자와 환경이 함께 관여해서, 가장 비싸고 가장 성공률이 낮은 옵션이에요.',
    side: '생각이 너무 빨라 감정이 따라가지 못해 자주 지쳐요' },
  { id: 'mem', cat: 'ability', gene: '다유전자', name: '기억력 강화', price: 10000, rate: 40, tag: 'enhance',
    desc: '한 번 본 것을 오래 기억해요. 기억력에는 수백 개의 유전자가 함께 관여해서 성공률이 낮아요.',
    side: '기억력은 그대로인데 잠을 깊이 못 자요' },
  { id: 'focus', cat: 'ability', gene: '다유전자', name: '집중력 향상', price: 5000, rate: 45, tag: 'enhance',
    desc: '한 가지 일에 오래 집중할 수 있어요.', side: '작은 소리에도 쉽게 예민해져요' },
  { id: 'dance', cat: 'ability', gene: '다유전자', name: '춤·리듬감', price: 4000, rate: 35, tag: 'enhance',
    desc: '음악을 들으면 몸이 먼저 반응해요. 한 번 본 안무를 금방 따라 춰요.', side: '균형 감각이 너무 예민해져 멀미가 심해요' },
  { id: 'voice', cat: 'ability', gene: '다유전자', name: '노래 잘하는 목소리', price: 4000, rate: 40, tag: 'enhance',
    desc: '음색이 좋고 높은 음도 편하게 내요.', side: '성대가 약해져 목이 자주 쉬어요' },
  { id: 'pitch', cat: 'ability', gene: '다유전자', name: '절대음감', price: 2000, rate: 50, tag: 'enhance',
    desc: '어떤 소리를 들어도 정확한 음 이름을 알 수 있어요.', side: '조금만 어긋난 소리도 견디기 힘들어요' },
  { id: 'actn3', cat: 'ability', gene: 'ACTN3', name: '단거리 순발력', price: 3000, rate: 80, tag: 'enhance',
    desc: '짧은 거리를 폭발적으로 빠르게 달릴 수 있어요. 실제로 단거리 선수들에게 많은 유전자형이 있어요.',
    side: '근육이 자주 찢어져요' },
  { id: 'lang', cat: 'ability', gene: '다유전자', name: '외국어 습득력', price: 6000, rate: 40, tag: 'enhance',
    desc: '새로운 언어를 아주 빠르게 배워요.', side: '모국어로 글 쓰는 게 오히려 어려워졌어요' },
  { id: 'scn9a', cat: 'ability', gene: 'SCN9A', name: '통증을 덜 느낌', price: 1000, rate: 85, tag: 'enhance',
    desc: '아픔을 거의 느끼지 않아요. 그런데 다쳐도 아픈 줄 몰라 상처를 늦게 발견할 수 있어요.',
    side: '뜨거운 것에 데어도 몰라서 큰 화상을 입었어요' },

  /* ---------- 외모 (8) ---------- */
  { id: 'model', cat: 'look', gene: '다유전자', name: '모델 비율 (긴 팔다리)', price: 8000, rate: 35, tag: 'enhance',
    desc: '팔다리가 길고 균형 잡힌 비율로 자라요. 수많은 유전자가 관여해서 결과를 예측하기 어려워요.',
    side: '관절이 약해 자주 빠지거나 다쳐요' },
  { id: 'height', cat: 'look', gene: '다유전자', name: '키 +10cm', price: 3000, rate: 55, tag: 'enhance',
    desc: '평균보다 10cm 더 자라요. 키에는 수천 개의 유전자가 관여해요.', side: '뼈가 약해져 골절이 잦아요' },
  { id: 'features', cat: 'look', gene: '다유전자', name: '뚜렷한 이목구비', price: 6000, rate: 40, tag: 'enhance',
    desc: '눈, 코, 입이 또렷한 얼굴로 자라요. 같은 옵션을 고른 아이들끼리 얼굴이 비슷해질 수 있어요.',
    side: '코뼈가 비뚤게 자라 숨쉬기가 불편해요' },
  { id: 'eyelid', cat: 'look', gene: '다유전자', name: '쌍꺼풀', price: 1000, rate: 60, tag: 'enhance',
    desc: '쌍꺼풀이 있는 눈으로 자라요.', side: '눈꺼풀이 처져 시야를 가려요' },
  { id: 'skin', cat: 'look', gene: '다유전자', name: '여드름 없는 맑은 피부', price: 2000, rate: 55, tag: 'enhance',
    desc: '사춘기에도 여드름이 거의 나지 않아요.', side: '피부가 너무 건조해 늘 갈라지고 가려워요' },
  { id: 'teeth', cat: 'look', gene: '다유전자', name: '교정 필요 없는 고른 치아', price: 1500, rate: 50, tag: 'enhance',
    desc: '치아 교정 없이도 가지런한 이로 자라요.', side: '사랑니가 잇몸 속에서 옆으로 자라 큰 수술을 받았어요' },
  { id: 'oca2', cat: 'look', gene: 'OCA2', name: '눈 색깔 선택', price: 1500, rate: 85, tag: 'enhance',
    desc: '원하는 눈동자 색을 고를 수 있어요.', side: '빛에 눈이 쉽게 부셔요' },
  { id: 'ar', cat: 'look', gene: 'AR', name: '탈모 예방', price: 1200, rate: 75, tag: 'border',
    desc: '나이가 들어도 머리카락이 잘 빠지지 않아요.', side: '호르몬 변화로 여드름이 심해졌어요' },

  /* ---------- 성격·특별 (8) ---------- */
  { id: 'sex', cat: 'mind', gene: '착상 전 선별', name: '성별 선택', price: 500, rate: 99, tag: 'enhance',
    desc: '유전자를 고치는 대신 원하는 성별의 수정란을 골라요. 많은 나라에서 법으로 금지하고 있어요.',
    side: '고르는 과정에서 다른 유전 질환을 놓쳤어요' },
  { id: 'maoa', cat: 'mind', gene: 'MAOA', name: '공격성 감소', price: 3000, rate: 50, tag: 'enhance',
    desc: '화를 덜 내는 성향이 되도록 해요. 실제로 성격은 유전자보다 자라는 환경의 영향이 커요.',
    side: '화뿐 아니라 기쁨도 잘 못 느껴요' },
  { id: 'anx', cat: 'mind', gene: '다유전자', name: '불안 감소', price: 3000, rate: 45, tag: 'enhance',
    desc: '걱정과 불안을 덜 느껴요.', side: '위험한 상황에서도 겁을 내지 않아 자주 다쳐요' },
  { id: 'extro', cat: 'mind', gene: '다유전자', name: '외향적 성격', price: 2500, rate: 40, tag: 'enhance',
    desc: '사람들과 어울리는 것을 즐기는 성격이 돼요.', side: '혼자 있으면 불안해서 견디기 힘들어요' },
  { id: 'lead', cat: 'mind', gene: '다유전자', name: '리더십', price: 5000, rate: 30, tag: 'enhance',
    desc: '사람들을 이끄는 성향이 강해져요. 리더십이 유전자로 정해지는지는 과학자들도 잘 몰라요.',
    side: '다른 사람의 의견을 듣기가 무척 어려워졌어요' },
  { id: 'oxtr', cat: 'mind', gene: 'OXTR', name: '공감 능력 강화', price: 2000, rate: 50, tag: 'enhance',
    desc: '다른 사람의 감정을 잘 알아차려요.', side: '다른 사람의 슬픔에 너무 쉽게 무너져요' },
  { id: 'allergy', cat: 'mind', gene: '다유전자', name: '알레르기 없음', price: 800, rate: 75, tag: 'border',
    desc: '꽃가루나 음식 알레르기가 생기지 않아요.', side: '작은 감염에도 몸이 크게 반응해요' },
  { id: 'myopia', cat: 'mind', gene: '다유전자', name: '근시 예방', price: 600, rate: 80, tag: 'border',
    desc: '안경 없이도 먼 곳이 잘 보여요.', side: '가까운 글씨가 흐릿해졌어요' }
];

/* 편지·해설에서 '성격 편집'으로 보는 옵션 */
GL.PERSONALITY_IDS = ['maoa', 'anx', 'extro', 'lead', 'oxtr'];

/* id로 옵션 찾기용 */
GL.optById = {};
GL.OPTIONS.forEach(function (o) { GL.optById[o.id] = o; });

/* 옵션 합계(약 12억)가 L5 예산(10억)보다 많아져서 안내 문구만 여기서 바꿔요.
   (GAS 주소가 들어 있는 config.js는 건드리지 않기 위해) */
GL.LEVELS[5].note = '원하는 옵션은 거의 다 고를 수 있어요.';

/* 옵션 합계(약 13억)가 L5 예산(10억)보다 커져서 L5 안내 문구만 여기서 바꿔요
   (config.js는 GAS 주소가 들어 있어 건드리지 않음) */
GL.LEVELS[5].note = '거의 모든 옵션을 고를 수 있어요.';
