const HTML = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Transkription</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #f5f3ef; --surface: #ffffff; --surface2: #f0ede8;
    --border: #e2ddd7; --text: #1a1814; --muted: #8a8480;
    --accent: #c17f3e; --accent-light: #f5ebe0;
    --green: #3a7d5c; --green-bg: #eaf4ee;
    --red: #c0392b; --red-bg: #fdf0ee;
    --mono: 'DM Mono', monospace; --sans: 'DM Sans', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; display: flex; flex-direction: column; }
  .topbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; border-bottom: 1px solid var(--border); background: var(--surface); }
  .logo { font-family: var(--mono); font-size: 13px; font-weight: 500; color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); display: inline-block; margin-right: 6px; }
  .status-label { font-size: 12px; color: var(--muted); font-family: var(--mono); }
  .main { flex: 1; display: grid; grid-template-columns: 420px 1fr; height: calc(100vh - 57px); }
  .left { background: var(--surface); border-right: 1px solid var(--border); padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; overflow-y: auto; }
  .panel-title { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); font-family: var(--mono); }
  .input-group { display: flex; flex-direction: column; gap: 8px; }
  .input-label { font-size: 13px; color: var(--muted); }
  .url-input { width: 100%; padding: 12px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-family: var(--mono); background: var(--surface2); color: var(--text); outline: none; transition: border-color 0.2s; resize: vertical; min-height: 80px; }
  .url-input:focus { border-color: var(--accent); }
  .url-input::placeholder { color: var(--muted); font-size: 12px; }
  .api-input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 12px; font-family: var(--mono); background: var(--surface2); color: var(--text); outline: none; transition: border-color 0.2s; }
  .api-input:focus { border-color: var(--accent); }
  .hint { font-size: 11px; color: var(--muted); line-height: 1.5; }
  .hint a { color: var(--accent); text-decoration: none; }
  .divider { height: 1px; background: var(--border); }
  .btn-transcribe { width: 100%; padding: 14px; background: var(--accent); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; font-family: var(--sans); cursor: pointer; transition: opacity 0.15s, transform 0.1s; letter-spacing: 0.02em; }
  .btn-transcribe:hover:not(:disabled) { opacity: 0.88; }
  .btn-transcribe:active:not(:disabled) { transform: scale(0.98); }
  .btn-transcribe:disabled { opacity: 0.4; cursor: not-allowed; }
  .progress-wrap { display: none; flex-direction: column; gap: 10px; }
  .progress-step { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); transition: color 0.3s; }
  .progress-step.active { color: var(--text); }
  .progress-step.done { color: var(--green); }
  .step-icon { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; transition: all 0.3s; font-family: var(--mono); }
  .progress-step.active .step-icon { border-color: var(--accent); color: var(--accent); }
  .progress-step.done .step-icon { border-color: var(--green); background: var(--green); color: #fff; }
  .spinner { width: 10px; height: 10px; border: 1.5px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-box { display: none; background: var(--red-bg); border: 1px solid #f5c6c2; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: var(--red); line-height: 1.5; }
  .stats { display: none; gap: 12px; }
  .stat { flex: 1; background: var(--surface2); border-radius: 8px; padding: 12px; text-align: center; }
  .stat-val { font-size: 20px; font-weight: 500; font-family: var(--mono); color: var(--accent); }
  .stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .right { display: flex; flex-direction: column; overflow: hidden; }
  .right-header { padding: 1.25rem 2rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--surface); flex-shrink: 0; }
  .right-title { font-size: 13px; font-family: var(--mono); color: var(--muted); }
  .action-btns { display: flex; gap: 8px; }
  .btn-small { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; font-family: var(--mono); background: var(--surface); color: var(--text); cursor: pointer; transition: background 0.15s; }
  .btn-small:hover { background: var(--surface2); }
  .btn-small:disabled { opacity: 0.3; cursor: not-allowed; }
  .transcript-area { flex: 1; overflow-y: auto; padding: 2rem; background: var(--bg); }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; color: var(--muted); }
  .empty-icon { width: 56px; height: 56px; border: 1.5px dashed var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .empty-text { font-size: 14px; }
  .empty-sub { font-size: 12px; font-family: var(--mono); }
  .transcript-content { display: none; }
  .t-line { display: flex; gap: 1.5rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border); animation: fadeIn 0.3s ease; }
  .t-line:last-child { border-bottom: none; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  .t-time { font-family: var(--mono); font-size: 12px; color: var(--accent); padding-top: 2px; flex-shrink: 0; width: 64px; }
  .t-text { font-size: 15px; line-height: 1.65; color: var(--text); }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
</head>
<body>
<div class="topbar">
  <span class="logo">Transkription</span>
  <span><span class="status-dot"></span><span class="status-label">bereit</span></span>
</div>
<div class="main">
  <div class="left">
    <span class="panel-title">Einstellungen</span>
    <div class="input-group">
      <span class="input-label">Gladia API Key</span>
      <input class="api-input" id="apiKey" type="password" placeholder="your_gladia_api_key" />
      <span class="hint">Kostenlos unter <a href="https://app.gladia.io" target="_blank">app.gladia.io</a> — einmal eintragen, fertig.</span>
    </div>
    <div class="divider"></div>
    <span class="panel-title">Video</span>
    <div class="input-group">
      <span class="input-label">Google Drive Link</span>
      <textarea class="url-input" id="driveUrl" placeholder="https://drive.google.com/file/d/..."></textarea>
      <span class="hint">Rechtsklick auf die Datei in Drive → „Link kopieren" → hier einfügen.</span>
    </div>
    <button class="btn-transcribe" id="transcribeBtn" onclick="startTranscription()">Transkribieren</button>
    <div class="progress-wrap" id="progressWrap">
      <div class="progress-step" id="step1"><div class="step-icon">1</div><span>Datei wird heruntergeladen</span></div>
      <div class="progress-step" id="step2"><div class="step-icon">2</div><span>Datei wird hochgeladen</span></div>
      <div class="progress-step" id="step3"><div class="step-icon">3</div><span>Transkription läuft</span></div>
      <div class="progress-step" id="step4"><div class="step-icon">4</div><span>Fertig</span></div>
    </div>
    <div class="error-box" id="errorBox"></div>
    <div class="stats" id="statsWrap">
      <div class="stat"><div class="stat-val" id="statDuration">—</div><div class="stat-label">Dauer</div></div>
      <div class="stat"><div class="stat-val" id="statWords">—</div><div class="stat-label">Wörter</div></div>
    </div>
  </div>
  <div class="right">
    <div class="right-header">
      <span class="right-title" id="rightTitle">transkript.txt</span>
      <div class="action-btns">
        <button class="btn-small" id="copyBtn" onclick="copyTranscript()" disabled>Kopieren</button>
        <button class="btn-small" id="downloadBtn" onclick="downloadTranscript()" disabled>Download</button>
      </div>
    </div>
    <div class="transcript-area" id="transcriptArea">
      <div class="empty-state" id="emptyState">
        <div class="empty-icon">🎙</div>
        <span class="empty-text">Noch kein Transkript</span>
        <span class="empty-sub">Link einfügen → Transkribieren klicken</span>
      </div>
      <div class="transcript-content" id="transcriptContent"></div>
    </div>
  </div>
</div>
<script>
let fullTranscriptText = '';

function convertDriveLink(url) {
  url = url.trim();
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return null;
}

function formatTime(seconds) {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  return String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
}

function setStep(n, state) {
  const el = document.getElementById('step' + n);
  el.className = 'progress-step ' + state;
  const icon = el.querySelector('.step-icon');
  if (state === 'active') icon.innerHTML = '<div class="spinner"></div>';
  else if (state === 'done') icon.innerHTML = '✓';
  else icon.innerHTML = n;
}

function showError(msg) {
  const box = document.getElementById('errorBox');
  box.textContent = msg;
  box.style.display = 'block';
  document.getElementById('transcribeBtn').disabled = false;
  document.getElementById('transcribeBtn').textContent = 'Erneut versuchen';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function startTranscription() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const driveUrl = document.getElementById('driveUrl').value.trim();
  if (!apiKey) { showError('Bitte Gladia API Key eintragen.'); return; }
  if (!driveUrl) { showError('Bitte einen Google Drive Link einfügen.'); return; }

  const fileId = convertDriveLink(driveUrl);
  if (!fileId) { showError('Ungültiger Google Drive Link.'); return; }

  document.getElementById('errorBox').style.display = 'none';
  document.getElementById('transcriptContent').innerHTML = '';
  document.getElementById('transcriptContent').style.display = 'none';
  document.getElementById('emptyState').style.display = 'flex';
  document.getElementById('statsWrap').style.display = 'none';
  document.getElementById('copyBtn').disabled = true;
  document.getElementById('downloadBtn').disabled = true;
  document.getElementById('transcribeBtn').disabled = true;
  document.getElementById('transcribeBtn').textContent = 'Läuft...';
  document.getElementById('progressWrap').style.display = 'flex';
  fullTranscriptText = '';
  [1,2,3,4].forEach(n => setStep(n, ''));

  try {
    setStep(1, 'active');
    const proxyUrl = '/proxy?id=' + fileId;
    const fileRes = await fetch(proxyUrl);
    if (!fileRes.ok) throw new Error('Datei konnte nicht heruntergeladen werden. Ist der Drive-Link auf Jeder mit dem Link gesetzt?');
    const fileBlob = await fileRes.blob();
    setStep(1, 'done');

    setStep(2, 'active');
    const formData = new FormData();
    formData.append('audio', fileBlob, 'video.mp4');
    const uploadRes = await fetch('https://api.gladia.io/v2/upload', {
      method: 'POST',
      headers: { 'x-gladia-key': apiKey },
      body: formData
    });
    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(err.message || 'Upload fehlgeschlagen (' + uploadRes.status + ')');
    }
    const { audio_url } = await uploadRes.json();
    setStep(2, 'done');

    setStep(3, 'active');
    const transcribeRes = await fetch('https://api.gladia.io/v2/transcription', {
      method: 'POST',
      headers: { 'x-gladia-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_url, language_config: { languages: ['de'], code_switching: false } })
    });
    if (!transcribeRes.ok) {
      const err = await transcribeRes.json().catch(() => ({}));
      throw new Error(err.message || 'Transkription fehlgeschlagen (' + transcribeRes.status + ')');
    }
    const { result_url } = await transcribeRes.json();

    let result = null;
    for (let i = 0; i < 120; i++) {
      await sleep(3000);
      const pollRes = await fetch(result_url, { headers: { 'x-gladia-key': apiKey } });
      const pollData = await pollRes.json();
      if (pollData.status === 'done') { result = pollData; break; }
      if (pollData.status === 'error') throw new Error('Gladia Fehler: ' + (pollData.error_message || 'Unbekannt'));
    }
    if (!result) throw new Error('Timeout - bitte erneut versuchen.');
    setStep(3, 'done');

    setStep(4, 'active');
    renderTranscript(result);
    setStep(4, 'done');

  } catch(e) {
    showError(e.message || 'Ein Fehler ist aufgetreten.');
  } finally {
    document.getElementById('transcribeBtn').disabled = false;
    document.getElementById('transcribeBtn').textContent = 'Erneut transkribieren';
  }
}

function renderTranscript(result) {
  const utterances = result?.result?.transcription?.utterances || [];
  if (!utterances.length) { showError('Keine Sprache erkannt.'); return; }
  const content = document.getElementById('transcriptContent');
  content.innerHTML = '';
  fullTranscriptText = '';
  utterances.forEach(item => {
    const start = item.start ?? 0;
    const text = item.text ?? '';
    const time = formatTime(start);
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = '<span class="t-time">' + time + '</span><span class="t-text">' + text.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span>';
    content.appendChild(line);
    fullTranscriptText += '[' + time + '] ' + text + '\\n';
  });
  const last = utterances[utterances.length - 1];
  document.getElementById('statDuration').textContent = formatTime(last?.end ?? 0);
  document.getElementById('statWords').textContent = fullTranscriptText.split(/\\s+/).filter(Boolean).length;
  document.getElementById('statsWrap').style.display = 'flex';
  document.getElementById('emptyState').style.display = 'none';
  content.style.display = 'block';
  document.getElementById('copyBtn').disabled = false;
  document.getElementById('downloadBtn').disabled = false;
  document.getElementById('rightTitle').textContent = 'transkript — ' + new Date().toLocaleDateString('de-DE');
}

function copyTranscript() {
  navigator.clipboard.writeText(fullTranscriptText).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Kopiert ✓';
    setTimeout(() => btn.textContent = 'Kopieren', 2000);
  });
}

function downloadTranscript() {
  const blob = new Blob([fullTranscriptText], { type: 'text/plain; charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'transkript_' + new Date().toISOString().slice(0,10) + '.txt';
  a.click();
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('gladia_key');
  if (saved) document.getElementById('apiKey').value = saved;
  document.getElementById('apiKey').addEventListener('change', e => localStorage.setItem('gladia_key', e.target.value));
});
</script>
</body>
</html>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Proxy route — fetches Google Drive file server-side
    if (url.pathname === '/proxy') {
      const fileId = url.searchParams.get('id');
      if (!fileId) return new Response('Missing id', { status: 400 });

      // Try direct download first, follow confirmation page if needed
      const driveUrl = 'https://drive.google.com/uc?export=download&id=' + fileId + '&confirm=t';
      try {
        const res = await fetch(driveUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          redirect: 'follow'
        });
        if (!res.ok) return new Response('Drive fetch failed: ' + res.status, { status: res.status });
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'video/mp4';
        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch(e) {
        return new Response('Proxy error: ' + e.message, { status: 500 });
      }
    }

    // Serve HTML for all other routes
    return new Response(HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};