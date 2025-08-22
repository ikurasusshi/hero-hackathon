// 後で /api/chunk を叩く窓口（今はオフ）
export async function sendAudioChunk(formData) {
  // return fetch('/api/chunk', {method:'POST', body: formData}).then(r=>r.json());
  return { ok: true, results: [] };
}
