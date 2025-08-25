export async function sendAudioChunk(serverBase, formData) {
  const url = `${serverBase}/api/chunk`;
  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function ping(serverBase) {
  try {
    const r = await fetch(`${serverBase}/health`, { cache: "no-store" });
    return r.ok;
  } catch (e) {
    return false;
  }
}
