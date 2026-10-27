/* =========================================================
   data-options.js — 유전자 옵션 36개 (수업 내용 수정은 여기서)
   price: 만 원 / rate: 원하는 효과가 나타날 확률(%)
   tag: treat(치료) · border(경계) · enhance(향상)
   side: '의도하지 않은 변화'가 생겼을 때 보여 줄 문장 (없으면 기본 문장)
   ========================================================= */
GL.CATS = [
  { key: 'disease', name: '질병 예방', note: '실제로 연구 중이거나 치료 사례가 있는 기술을 바탕으로 했어요.' },
  { key: 'ability', name: '능력 향상', note: '이 분류는 모두 가상의 미래 기술이에요.' },
  { key: 'look',    name: '외모',      note: '이 분류는 모두 가상의 미래 기술이에요.' },
  { key: 'mind',    name: '성격·특별', note: '성별 선택을 빼면 모두 가상의 미래 기술이에요.' }
];

GL.TAGS = {
  treat:   { name: '치료', cls: 'tag-treat' },
  border:  { name: '경계', cls: 'tag-border' },
  enhance: { name: '향상', cls: 'tag-enh' }
};

GL.DEFAULT_SIDE = '의도하지 않은 다른 유전자가 함께 바뀌었어요';

GL.OPTIONS = [
  /* ---------- 질병 예방 ---------- */
  { id: 'hbb', cat: 'disease', gene: 'HBB', name: '겸상적혈구 빈혈 예방', price: 300, rate: 95, tag: 'treat',
    desc: '적혈구가 낫 모양으로 변해 심한 통증과 빈혈을 일으키는 유전병을 막아요. 2023년에 실제 유전자 치료제가 승인됐어요.' },
  { id: 'cftr', cat: 'disease', gene: 'CFTR', name: '낭포성 섬유증 예방', price: 400, rate: 92, tag: 'treat',
    desc: '폐와 소화기관에 끈적한 점액이 쌓여 숨쉬기 어려워지는 유전병을 막아요.' },
  { id: 'htt', cat: 'disease', gene: 'HTT', name: '헌팅턴병 예방', price: 500, rate: 90, tag: 'treat',
    desc: '어른이 된 뒤 몸이 마음대로 움직이고 기억이 사라지는 유전병을 막아요.' },
  { id: 'dmd', cat: 'disease', gene: 'DMD', name: '근이영양증 예방', price: 500, rate: 88, tag: 'treat',
    desc: '근육이 점점 약해져 걷기 어려워지는 유전병을 막아요.' },
  { id: 'opn', cat: 'disease', gene: 'OPN1LW', name: '색약 예방', price: 300, rate: 93, tag: 'treat',
    desc: '빨강과 초록을 구별하기 어려운 색각 이상을 막아요.' },
  { id: 'pcsk9', cat: 'disease', gene: 'PCSK9', name: '심장병 위험 감소', price: 600, rate: 85, tag: 'treat',
    desc: '콜레스테롤 수치를 낮춰 심장병 위험을 줄여요. 성인을 대상으로 실제 연구가 진행 중이에요.' },
  { id: 'brca1', cat: 'disease', gene: 'BRCA1', name: '유방암·난소암 위험 감소', price: 800, rate: 85, tag: 'treat',
    desc: '암에 걸릴 위험을 크게 높이는 유전자 변이를 고쳐요.' },
  { id: 'apoe', cat: 'disease', gene: 'APOE', name: '알츠하이머 위험 감소', price: 1000, rate: 75, tag: 'treat',
    desc: '나이 들어 치매에 걸릴 위험을 높이는 유전자형을 바꿔요.' },
  { id: 'ccr5', cat: 'disease', gene: 'CCR5', name: 'HIV 감염 저항', price: 700, rate: 80, tag: 'border',
    desc: 'HIV 바이러스가 세포로 들어오는 문을 닫아요. 2018년 중국에서 이 편집으로 아기가 태어나 전 세계가 충격을 받았어요.',
    side: '다른 바이러스 감염에는 오히려 약해졌어요' },
  { id: 'gjb2', cat: 'disease', gene: 'GJB2', name: '선천성 난청 예방', price: 400, rate: 90, tag: 'border',
    desc: '태어날 때부터 잘 듣지 못하는 것을 막아요. 수어를 쓰는 사람들은 청각장애를 "고칠 병이 아닌 하나의 문화"라고 말하기도 해요.' },

  /* ---------- 능력 향상 (가상의 미래 기술) ---------- */
  { id: 'mem', cat: 'ability', gene: '다유전자', name: '기억력 강화', price: 10000, rate: 40, tag: 'enhance',
    desc: '한 번 본 것을 오래 기억해요. 기억력에는 수백 개의 유전자가 함께 관여해서 성공률이 낮아요.',
    side: '기억력은 그대로인데 잠을 깊이 못 자요' },
  { id: 'focus', cat: 'ability', gene: '다유전자', name: '집중력 향상', price: 5000, rate: 45, tag: 'enhance',
    desc: '한 가지 일에 오래 집중할 수 있어요.', side: '작은 소리에도 쉽게 예민해져요' },
  { id: 'mstn', cat: 'ability', gene: 'MSTN', name: '근력 강화', price: 3000, rate: 80, tag: 'enhance',
    desc: '근육이 자라는 것을 막는 유전자를 꺼서 힘이 세져요.', side: '심장이 쉽게 지쳐요' },
  { id: 'actn3', cat: 'ability', gene: 'ACTN3', name: '단거리 순발력', price: 3000, rate: 80, tag: 'enhance',
    desc: '짧은 거리를 폭발적으로 빠르게 달릴 수 있어요.' },
  { id: 'dec2', cat: 'ability', gene: 'DEC2', name: '4시간만 자도 충분', price: 4000, rate: 70, tag: 'enhance',
    desc: '하루 4시간만 자도 개운해요. 오랫동안 몸에 어떤 영향이 있는지는 아직 아무도 몰라요.',
    side: '나이가 들수록 쉽게 피곤해져요' },
  { id: 'pitch', cat: 'ability', gene: '다유전자', name: '절대음감', price: 2000, rate: 50, tag: 'enhance',
    desc: '어떤 소리를 들어도 정확한 음 이름을 알 수 있어요.' },
  { id: 'lang', cat: 'ability', gene: '다유전자', name: '외국어 습득력', price: 6000, rate: 40, tag: 'enhance',
    desc: '새로운 언어를 아주 빠르게 배워요.' },
  { id: 'aging', cat: 'ability', gene: '다유전자', name: '노화 지연 (수명 +20년)', price: 20000, rate: 50, tag: 'enhance',
    desc: '늙는 속도를 늦춰 평균보다 20년 더 살 수 있어요.', side: '세포가 비정상적으로 자랄 위험이 커졌어요' },
  { id: 'hla', cat: 'ability', gene: 'HLA 등', name: '면역력 강화', price: 1500, rate: 70, tag: 'border',
    desc: '감기 같은 병에 거의 걸리지 않아요.', side: '면역이 내 몸을 공격하는 자가면역 질환이 생겼어요' },
  { id: 'scn9a', cat: 'ability', gene: 'SCN9A', name: '통증을 덜 느낌', price: 1000, rate: 85, tag: 'enhance',
    desc: '아픔을 거의 느끼지 않아요. 그런데 다쳐도 아픈 줄 몰라 상처를 늦게 발견할 수 있어요.',
    side: '뜨거운 것에 데어도 몰라서 큰 화상을 입었어요' },

  /* ---------- 외모 (가상의 미래 기술) ---------- */
  { id: 'height', cat: 'look', gene: '다유전자', name: '키 +10cm', price: 2000, rate: 55, tag: 'enhance',
    desc: '평균보다 10cm 더 자라요. 키에는 수천 개의 유전자가 관여해요.', side: '뼈가 약해져 골절이 잦아요' },
  { id: 'oca2', cat: 'look', gene: 'OCA2', name: '눈 색깔 선택', price: 1500, rate: 85, tag: 'enhance',
    desc: '원하는 눈동자 색을 고를 수 있어요.', side: '빛에 눈이 쉽게 부셔요' },
  { id: 'mc1r', cat: 'look', gene: 'MC1R', name: '머리카락 색 선택', price: 1000, rate: 85, tag: 'enhance',
    desc: '원하는 머리카락 색을 고를 수 있어요.' },
  { id: 'tchh', cat: 'look', gene: 'TCHH', name: '직모·곱슬 선택', price: 800, rate: 80, tag: 'enhance',
    desc: '곧은 머리카락이나 곱슬머리를 고를 수 있어요.' },
  { id: 'ar', cat: 'look', gene: 'AR', name: '탈모 예방', price: 1200, rate: 75, tag: 'border',
    desc: '나이가 들어도 머리카락이 잘 빠지지 않아요.' },
  { id: 'dimple', cat: 'look', gene: '다유전자', name: '보조개', price: 500, rate: 70, tag: 'enhance',
    desc: '웃을 때 볼에 보조개가 생겨요.' },
  { id: 'freckle', cat: 'look', gene: '다유전자', name: '주근깨 없음', price: 400, rate: 75, tag: 'enhance',
    desc: '얼굴에 주근깨가 생기지 않아요.' },
  { id: 'face', cat: 'look', gene: '다유전자', name: '얼굴형 선택', price: 4000, rate: 40, tag: 'enhance',
    desc: '원하는 얼굴형을 고를 수 있어요. 수많은 유전자가 관여해서 결과를 예측하기 어려워요.',
    side: '턱뼈가 고르게 자라지 않았어요' },

  /* ---------- 성격·특별 ---------- */
  { id: 'sex', cat: 'mind', gene: '착상 전 선별', name: '성별 선택', price: 500, rate: 99, tag: 'enhance',
    desc: '유전자를 고치는 대신 원하는 성별의 수정란을 골라요. 많은 나라에서 법으로 금지하고 있어요.' },
  { id: 'maoa', cat: 'mind', gene: 'MAOA', name: '공격성 감소', price: 3000, rate: 50, tag: 'enhance',
    desc: '화를 덜 내는 성향이 되도록 해요. 실제로 성격은 유전자보다 자라는 환경의 영향이 커요.',
    side: '화뿐 아니라 기쁨도 잘 못 느껴요' },
  { id: 'anx', cat: 'mind', gene: '다유전자', name: '불안 감소', price: 3000, rate: 45, tag: 'enhance',
    desc: '걱정과 불안을 덜 느껴요.', side: '위험한 상황에서도 겁을 내지 않아 자주 다쳐요' },
  { id: 'extro', cat: 'mind', gene: '다유전자', name: '외향적 성격', price: 2500, rate: 40, tag: 'enhance',
    desc: '사람들과 어울리는 것을 즐기는 성격이 돼요.' },
  { id: 'lead', cat: 'mind', gene: '다유전자', name: '리더십', price: 5000, rate: 30, tag: 'enhance',
    desc: '사람들을 이끄는 성향이 강해져요. 리더십이 유전자로 정해지는지는 과학자들도 잘 몰라요.' },
  { id: 'oxtr', cat: 'mind', gene: 'OXTR', name: '공감 능력 강화', price: 2000, rate: 50, tag: 'enhance',
    desc: '다른 사람의 감정을 잘 알아차려요.', side: '다른 사람의 슬픔에 너무 쉽게 무너져요' },
  { id: 'allergy', cat: 'mind', gene: '다유전자', name: '알레르기 없음', price: 800, rate: 75, tag: 'border',
    desc: '꽃가루나 음식 알레르기가 생기지 않아요.' },
  { id: 'myopia', cat: 'mind', gene: '다유전자', name: '근시 예방', price: 600, rate: 80, tag: 'border',
    desc: '안경 없이도 먼 곳이 잘 보여요.' }
];

/* 편지 ②번(성격 편집)에 쓰는 성격 옵션 */
GL.PERSONALITY_IDS = ['maoa', 'anx', 'extro', 'lead', 'oxtr'];

/* id로 옵션 찾기용 */
GL.optById = {};
GL.OPTIONS.forEach(function (o) { GL.optById[o.id] = o; });
