/* =========================================================
   api.js — GAS 서버와 통신 (자동 재시도 3회 + 워밍업)
   ========================================================= */
GL.api = {
  isReady: function () {
    return /^https:\/\/script\.google\.com\/.+\/exec$/.test(GL.CONFIG.GAS_URL);
  },

  // 페이지가 열릴 때 서버를 미리 깨워 둠 (첫 응답 지연 줄이기)
  warmup: function () {
    if (GL.api.isReady()) fetch(GL.CONFIG.GAS_URL, { method: 'GET' }).catch(function () {});
  },

  call: async function (action, data, retries) {
    if (!GL.api.isReady()) {
      return { ok: false, msg: '서버 주소가 설정되지 않았어요. 선생님: js/config.js 의 GAS_URL을 확인해 주세요.' };
    }
    retries = retries || 3;
    var url = GL.CONFIG.GAS_URL + '?action=' + encodeURIComponent(action);
    var body = JSON.stringify(Object.assign({}, data || {}, { action: action }));
    for (var i = 1; i <= retries; i++) {
      try {
        var res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: body
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
      } catch (e) {
        if (i === retries) {
          return { ok: false, msg: '인터넷 연결이 불안정해요. 잠시 후 다시 눌러 주세요.' };
        }
        await new Promise(function (r) { setTimeout(r, i * 1000); });
      }
    }
  }
};
