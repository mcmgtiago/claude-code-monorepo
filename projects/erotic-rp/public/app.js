const $ = (id) => document.getElementById(id);

let currentSessionId = null;

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json()).error || 'API error');
  return res.json();
}

async function loadSessions() {
  const sessions = await api('/api/sessions');
  const list = $('sessionList');
  list.innerHTML = '';
  sessions.forEach((s) => {
    const li = document.createElement('li');
    li.textContent = s.title;
    li.dataset.id = s.id;
    if (s.id === currentSessionId) li.classList.add('active');
    li.onclick = () => openSession(s.id);
    list.appendChild(li);
  });
}

async function openSession(id) {
  currentSessionId = id;
  const session = await api(`/api/sessions/${id}`);
  $('chatTitle').textContent = session.title;
  $('input').disabled = false;
  $('sendBtn').disabled = false;
  const messages = $('messages');
  messages.innerHTML = '';
  session.messages.forEach((m) => appendMessage(m.role, m.content));
  await loadSessions();
  scrollDown();
}

function appendMessage(role, content) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const roleLabel = role === 'user' ? 'Você' : 'AI';
  div.innerHTML = `<span class="role">${roleLabel}</span>${escapeHtml(content)}`;
  $('messages').appendChild(div);
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function scrollDown() {
  const m = $('messages');
  m.scrollTop = m.scrollHeight;
}

function showThinking() {
  const div = document.createElement('div');
  div.className = 'msg thinking';
  div.id = 'thinking';
  div.textContent = '... digitando';
  $('messages').appendChild(div);
  scrollDown();
}
function hideThinking() {
  document.getElementById('thinking')?.remove();
}

async function sendMessage() {
  const input = $('input');
  const text = input.value.trim();
  if (!text || !currentSessionId) return;
  appendMessage('user', text);
  input.value = '';
  showThinking();
  try {
    const { reply } = await api('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ sessionId: currentSessionId, message: text }),
    });
    hideThinking();
    appendMessage('ai', reply);
    scrollDown();
  } catch (err) {
    hideThinking();
    appendMessage('ai', `[erro: ${err.message}]`);
  }
}

// --- Modal ---
function openModal() { $('modal').classList.remove('hidden'); }
function closeModal() {
  $('modal').classList.add('hidden');
  $('systemPromptInput').value = '';
}

async function createSession() {
  const prompt = $('systemPromptInput').value.trim();
  if (!prompt) return;
  try {
    const { id } = await api('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ systemPrompt: prompt }),
    });
    closeModal();
    await loadSessions();
    await openSession(id);
  } catch (err) {
    alert('Erro: ' + err.message);
  }
}

async function deleteCurrent() {
  if (!currentSessionId) return;
  if (!confirm('Apagar esta sessão?')) return;
  await api(`/api/sessions/${currentSessionId}`, { method: 'DELETE' });
  currentSessionId = null;
  $('chatTitle').textContent = 'Sem sessão';
  $('messages').innerHTML = '';
  $('input').disabled = true;
  $('sendBtn').disabled = true;
  await loadSessions();
}

async function renameCurrent() {
  if (!currentSessionId) return;
  const title = prompt('Novo título:', $('chatTitle').textContent);
  if (!title) return;
  await api(`/api/sessions/${currentSessionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
  $('chatTitle').textContent = title;
  await loadSessions();
}

// --- Wire up ---
$('sendBtn').onclick = sendMessage;
$('input').onkeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};
$('newSessionBtn').onclick = openModal;
$('cancelBtn').onclick = closeModal;
$('createBtn').onclick = createSession;
$('deleteBtn').onclick = deleteCurrent;
$('renameBtn').onclick = renameCurrent;
$('systemPromptInput').onkeydown = (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) createSession();
};

// --- Init ---
loadSessions().catch(console.error);
