/**
 * PRÁXIS — Frontend App
 * Chat Widget + Comunicação com Backend
 */

const API_URL = window.location.origin;

let sessionId = null;
let isLoading = false;

// ============================================
// CHAT OPEN / CLOSE
// ============================================

function openChat() {
  const container = document.getElementById('chatContainer');
  const toggle = document.getElementById('chatToggle');

  container.classList.add('open');
  toggle.style.display = 'none';

  // Se primeira vez, enviar welcome
  if (!sessionId) {
    initChat();
  }
}

function closeChat() {
  const container = document.getElementById('chatContainer');
  const toggle = document.getElementById('chatToggle');

  container.classList.remove('open');
  toggle.style.display = 'flex';
}

// ============================================
// INIT CHAT (Welcome Message)
// ============================================

async function initChat() {
  try {
    showTyping();

    const res = await fetch(`${API_URL}/api/triagem/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });

    const data = await res.json();
    sessionId = data.sessionId;

    removeTyping();
    addMessage('assistant', data.message);
  } catch (error) {
    console.error('Erro ao iniciar chat:', error);
    removeTyping();
    addMessage('assistant', 'Olá! Estou tendo um problema técnico. Tente novamente em instantes.');
  }
}

// ============================================
// SEND MESSAGE
// ============================================

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();

  if (!message || isLoading) return;

  // Clear input
  input.value = '';
  input.style.height = 'auto';

  // Show user message
  addMessage('user', message);

  // Hide quick actions after first message
  const quickActions = document.getElementById('quickActions');
  if (quickActions) {
    quickActions.style.display = 'none';
  }

  // Send to API
  isLoading = true;
  showTyping();

  try {
    const res = await fetch(`${API_URL}/api/triagem/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message })
    });

    const data = await res.json();
    sessionId = data.sessionId;

    removeTyping();

    if (data.response) {
      addMessage('assistant', data.response);
    }

    // Se houve agendamento, mostrar confirmação
    if (data.bookingId) {
      setTimeout(() => {
        addMessage('assistant', '✅ Consulta agendada com sucesso! Você receberá uma confirmação.');
      }, 500);
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    removeTyping();
    addMessage('assistant', 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?');
  } finally {
    isLoading = false;
  }
}

function sendQuickMessage(text) {
  const input = document.getElementById('chatInput');
  input.value = text;
  sendMessage();
}

// ============================================
// UI HELPERS
// ============================================

function addMessage(role, content) {
  const messagesContainer = document.getElementById('chatMessages');

  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;

  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  messageEl.innerHTML = `
    <div class="message-content">${formatMessage(content)}</div>
    <span class="message-time">${time}</span>
  `;

  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessage(text) {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '<br>• ')
    .replace(/□ /g, '<br>☐ ');
}

function showTyping() {
  const messagesContainer = document.getElementById('chatMessages');

  const typingEl = document.createElement('div');
  typingEl.id = 'typingIndicator';
  typingEl.className = 'message assistant';
  typingEl.innerHTML = `
    <div class="typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;

  messagesContainer.appendChild(typingEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTyping() {
  const typingEl = document.getElementById('typingIndicator');
  if (typingEl) {
    typingEl.remove();
  }
}

// ============================================
// TEXTAREA AUTO-RESIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('chatInput');

  if (input) {
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }
});
