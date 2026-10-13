/**
 * Donkr Chat & Matchmaking System
 * Handles Match celebrations, chat messaging, and donkey AI responses.
 */
class DonkrChatManager {
  constructor(options = {}) {
    this.allDonkeys = options.donkeys || [];
    this.activeChatDonkey = null;
    this.onNewMessage = options.onNewMessage || (() => {});
  }

  setDonkeys(donkeys) {
    this.allDonkeys = donkeys;
  }

  getDonkeyById(id) {
    return this.allDonkeys.find(d => d.id === id) || null;
  }

  // --- Match Modal Trigger ---
  showMatchModal(donkey, isSuper = false) {
    const userProfile = window.DonkrStorage.getProfile();
    const modal = document.getElementById('matchModal');
    if (!modal) return;

    window.DonkrSound.playMatchFanfare();

    modal.querySelector('#matchedDonkeyName').textContent = donkey.name;
    modal.querySelector('#matchedUserImg').src = userProfile.avatar || 'assets/avatars/user-default.svg';
    modal.querySelector('#matchedDonkeyImg').src = donkey.avatar;
    modal.querySelector('#matchSubtext').textContent = isSuper
      ? `You sent a Super Bray and ${donkey.name} brayed back with joy!`
      : `You and ${donkey.name} have mutual equine interest!`;

    // Confetti particles
    this.triggerCarrotConfetti();

    modal.classList.add('active');

    // Button actions
    const sendBrayBtn = modal.querySelector('#btnMatchChat');
    const keepBrowsingBtn = modal.querySelector('#btnMatchKeepBrowsing');

    sendBrayBtn.onclick = () => {
      modal.classList.remove('active');
      this.openChat(donkey.id);
    };

    keepBrowsingBtn.onclick = () => {
      modal.classList.remove('active');
      window.DonkrSound.playPop(400);
    };
  }

  triggerCarrotConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    container.innerHTML = '';

    const emojis = ['🥕', '💚', '🌾', '🍎', '✨', '⭐'];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 0.8}s`;
      p.style.animationDuration = `${1.8 + Math.random() * 1.5}s`;
      p.style.fontSize = `${16 + Math.random() * 20}px`;
      container.appendChild(p);
    }
  }

  // --- Matches List UI Rendering ---
  renderMatchesView() {
    const matchesListEl = document.getElementById('matchesCarousel');
    const messageThreadsEl = document.getElementById('messageThreadsList');
    const emptyMatchesEl = document.getElementById('emptyMatchesState');

    const matches = window.DonkrStorage.getMatches();

    if (!matchesListEl || !messageThreadsEl) return;

    if (matches.length === 0) {
      if (emptyMatchesEl) emptyMatchesEl.style.display = 'flex';
      matchesListEl.innerHTML = '';
      messageThreadsEl.innerHTML = '';
      return;
    }

    if (emptyMatchesEl) emptyMatchesEl.style.display = 'none';

    // 1. Matches horizontal avatars carousel
    matchesListEl.innerHTML = matches.map(m => {
      const donkey = this.getDonkeyById(m.id);
      if (!donkey) return '';
      return `
        <div class="match-avatar-item" data-id="${donkey.id}">
          <div class="avatar-ring ${m.isSuper ? 'super-ring' : ''}">
            <img src="${donkey.avatar}" alt="${donkey.name}" />
            ${m.isSuper ? '<span class="super-badge-icon">⭐</span>' : ''}
          </div>
          <span class="avatar-name">${donkey.name}</span>
        </div>
      `;
    }).join('');

    // Attach click listeners to carousel items
    matchesListEl.querySelectorAll('.match-avatar-item').forEach(item => {
      item.addEventListener('click', () => {
        this.openChat(item.dataset.id);
      });
    });

    // 2. Chat Threads list
    const chats = window.DonkrStorage.getChats();
    messageThreadsEl.innerHTML = matches.map(m => {
      const donkey = this.getDonkeyById(m.id);
      if (!donkey) return '';
      const donkeyMsgs = chats[m.id] || [];
      const lastMsg = donkeyMsgs.length > 0 ? donkeyMsgs[donkeyMsgs.length - 1] : null;
      const previewText = lastMsg
        ? (lastMsg.sender === 'user' ? `You: ${lastMsg.text}` : lastMsg.text)
        : `Matched! Say hee-haw to ${donkey.name} 🌾`;

      const timeStr = lastMsg ? this.formatTime(lastMsg.timestamp) : 'New';

      return `
        <div class="chat-thread-row" data-id="${donkey.id}">
          <div class="thread-avatar">
            <img src="${donkey.avatar}" alt="${donkey.name}" />
            <span class="online-dot"></span>
          </div>
          <div class="thread-info">
            <div class="thread-header">
              <span class="thread-name">${donkey.name}</span>
              <span class="thread-time">${timeStr}</span>
            </div>
            <div class="thread-preview">${this.escapeHtml(previewText)}</div>
          </div>
        </div>
      `;
    }).join('');

    messageThreadsEl.querySelectorAll('.chat-thread-row').forEach(row => {
      row.addEventListener('click', () => {
        this.openChat(row.dataset.id);
      });
    });
  }

  // --- Open Specific Chat ---
  openChat(donkeyId) {
    const donkey = this.getDonkeyById(donkeyId);
    if (!donkey) return;

    this.activeChatDonkey = donkey;

    // Switch view to chat screen
    const mainViews = document.querySelectorAll('.app-view');
    mainViews.forEach(v => v.classList.remove('active'));
    document.getElementById('viewChatRoom').classList.add('active');

    // Update Chat Header
    document.getElementById('chatHeaderAvatar').src = donkey.avatar;
    document.getElementById('chatHeaderName').textContent = donkey.name;
    document.getElementById('chatHeaderSubtitle').textContent = `${donkey.breed} • ${donkey.location}`;

    // Load initial message if first time chatting
    const msgs = window.DonkrStorage.getMessages(donkeyId);
    if (msgs.length === 0 && donkey.chatPersonality && donkey.chatPersonality.greeting) {
      window.DonkrStorage.addMessage(donkeyId, {
        sender: 'donkey',
        text: donkey.chatPersonality.greeting,
        timestamp: Date.now()
      });
    }

    this.renderMessages();
    window.DonkrSound.playPop(480);
  }

  renderMessages() {
    if (!this.activeChatDonkey) return;
    const donkey = this.activeChatDonkey;
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    const msgs = window.DonkrStorage.getMessages(donkey.id);

    container.innerHTML = msgs.map(m => {
      const isUser = m.sender === 'user';
      return `
        <div class="chat-bubble-wrapper ${isUser ? 'user-message' : 'donkey-message'}">
          ${!isUser ? `<img src="${donkey.avatar}" class="chat-tiny-avatar" alt="${donkey.name}" />` : ''}
          <div class="chat-bubble">
            <div class="bubble-text">${this.escapeHtml(m.text)}</div>
            <div class="bubble-time">${this.formatTime(m.timestamp)}</div>
          </div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  sendMessage(text) {
    if (!text || !text.trim() || !this.activeChatDonkey) return;
    const donkey = this.activeChatDonkey;

    // Add user message
    window.DonkrStorage.addMessage(donkey.id, {
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now()
    });

    this.renderMessages();
    window.DonkrSound.playPop(520);

    // Show typing indicator
    this.showTypingIndicator(donkey);

    // Generate Donkey reply
    const replyDelay = 1200 + Math.random() * 1400;
    setTimeout(() => {
      this.hideTypingIndicator();
      const replyText = this.generateDonkeyReply(donkey, text);
      window.DonkrStorage.addMessage(donkey.id, {
        sender: 'donkey',
        text: replyText,
        timestamp: Date.now()
      });
      this.renderMessages();
      window.DonkrSound.playPop(620);
    }, replyDelay);
  }

  showTypingIndicator(donkey) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    let typingEl = document.getElementById('chatTypingIndicator');
    if (!typingEl) {
      typingEl = document.createElement('div');
      typingEl.id = 'chatTypingIndicator';
      typingEl.className = 'chat-bubble-wrapper donkey-message typing-wrap';
      typingEl.innerHTML = `
        <img src="${donkey.avatar}" class="chat-tiny-avatar" alt="${donkey.name}" />
        <div class="chat-bubble typing-bubble">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `;
      container.appendChild(typingEl);
      container.scrollTop = container.scrollHeight;
    }
  }

  hideTypingIndicator() {
    const typingEl = document.getElementById('chatTypingIndicator');
    if (typingEl) typingEl.remove();
  }

  generateDonkeyReply(donkey, userText) {
    const p = donkey.chatPersonality || {};
    const lower = userText.toLowerCase();

    // Check keyword triggers
    if (p.keywords) {
      for (const [kw, response] of Object.entries(p.keywords)) {
        if (lower.includes(kw)) {
          return response;
        }
      }
    }

    // Default responses pool
    if (p.responses && p.responses.length > 0) {
      const idx = Math.floor(Math.random() * p.responses.length);
      return p.responses[idx];
    }

    // Fallback generic donkey replies
    const genericReplies = [
      "Hee-hawww! My ears twitched with absolute delight at that! 🌾",
      "I was just about to take a dust bath, but talking with you is much better! 🧼",
      "The farmer is waving a halter at me, but I'm standing firm right here for you. 🛑",
      "Did you know donkeys remember other donkeys for over 25 years? You're already locked into my memory! 💭",
      "I'd love to share my salt lick with you sometime. Extra salty, extra sweet! 🧂"
    ];
    return genericReplies[Math.floor(Math.random() * genericReplies.length)];
  }

  formatTime(ts) {
    if (!ts) return '';
    const date = new Date(ts);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.DonkrChatManager = DonkrChatManager;

