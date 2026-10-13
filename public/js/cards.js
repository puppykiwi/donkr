/**
 * Donkr Card Swiping Engine
 * Tinder-style touch/pointer drag physics with dynamic rotation, badges & gestures.
 */
class DonkrCardManager {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.donkeys = options.donkeys || [];
    this.currentIndex = 0;
    this.onSwipe = options.onSwipe || (() => {});
    this.onEmpty = options.onEmpty || (() => {});
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.activeCard = null;
    this.animating = false;
  }

  setDonkeys(donkeys) {
    this.donkeys = donkeys;
    this.currentIndex = 0;
    this.renderCards();
  }

  getCurrentDonkey() {
    return this.donkeys[this.currentIndex] || null;
  }

  renderCards() {
    this.container.innerHTML = '';

    if (this.currentIndex >= this.donkeys.length) {
      this.renderEmptyState();
      this.onEmpty();
      return;
    }

    // Render up to 3 cards in the deck stack
    const maxVisible = Math.min(3, this.donkeys.length - this.currentIndex);
    for (let i = maxVisible - 1; i >= 0; i--) {
      const donkey = this.donkeys[this.currentIndex + i];
      const cardEl = this.createCardElement(donkey, i);
      this.container.appendChild(cardEl);
      if (i === 0) {
        this.activeCard = cardEl;
        this.bindCardEvents(cardEl, donkey);
      }
    }
  }

  createCardElement(donkey, stackPosition) {
    const card = document.createElement('div');
    card.className = `donkr-card stack-pos-${stackPosition}`;
    card.dataset.id = donkey.id;

    // Apply stack transforms
    const scale = 1 - stackPosition * 0.04;
    const translateY = stackPosition * 12;
    card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
    card.style.zIndex = 10 - stackPosition;

    card.innerHTML = `
      <div class="card-image-wrapper">
        <img src="${donkey.avatar}" alt="${donkey.name}" class="card-avatar" draggable="false" />
        <div class="card-gradient-overlay"></div>
        
        <!-- Swipe Stamps -->
        <div class="swipe-badge badge-like">HEE-HAW! 💚</div>
        <div class="swipe-badge badge-nope">NOPE ❌</div>
        <div class="swipe-badge badge-super">SUPER BRAY ⭐</div>
      </div>

      <div class="card-content">
        <div class="card-header-row">
          <div class="card-name-age">
            <span class="card-name">${donkey.name}</span>
            <span class="card-age">${donkey.age}</span>
            ${donkey.verified ? '<span class="verified-badge" title="Verified Donkey">✓</span>' : ''}
          </div>
          <button class="card-info-btn" title="View Full Bio" aria-label="View Bio">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        </div>

        <div class="card-subtitle">
          <span class="card-breed">${donkey.breed}</span> • 
          <span class="card-distance">${donkey.distanceMiles} miles away</span>
        </div>

        <div class="card-tagline">"${donkey.tagline}"</div>

        <!-- Equine Stats Pill Bar -->
        <div class="card-stats-row">
          <div class="stat-pill" title="Ear Length">
            <span class="stat-icon">👂</span>
            <span class="stat-val">${donkey.earLengthCm} cm</span>
          </div>
          <div class="stat-pill" title="Bray Volume">
            <span class="stat-icon">📢</span>
            <span class="stat-val">${donkey.brayVolumeDb} dB</span>
          </div>
          <div class="stat-pill" title="Stubbornness Rating">
            <span class="stat-icon">🛑</span>
            <span class="stat-val">${donkey.stubbornnessPercent}% stubborn</span>
          </div>
        </div>

        <!-- Expandable Details Section -->
        <div class="card-details-drawer">
          <div class="detail-section">
            <h4>About ${donkey.name}</h4>
            <p class="detail-bio">${donkey.bio}</p>
          </div>
          <div class="detail-section">
            <h4>Favorite Snack</h4>
            <p class="detail-snack">${donkey.favoriteSnack}</p>
          </div>
          <div class="detail-section">
            <h4>Location</h4>
            <p class="detail-location">📍 ${donkey.location}</p>
          </div>
          <div class="detail-tags">
            ${donkey.tags.map(t => `<span class="badge-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    // Toggle info drawer
    const infoBtn = card.querySelector('.card-info-btn');
    const drawer = card.querySelector('.card-details-drawer');
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.toggle('open');
      infoBtn.classList.toggle('active', isOpen);
      window.DonkrSound.playPop(520);
    });

    return card;
  }

  bindCardEvents(card, donkey) {
    const handleStart = (clientX, clientY) => {
      if (this.animating) return;
      this.isDragging = true;
      this.startX = clientX;
      this.startY = clientY;
      this.currentX = clientX;
      this.currentY = clientY;
      card.classList.add('dragging');
      card.style.transition = 'none';
    };

    const handleMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      this.currentX = clientX;
      this.currentY = clientY;
      const deltaX = this.currentX - this.startX;
      const deltaY = this.currentY - this.startY;

      // Card rotation based on deltaX
      const rotation = deltaX * 0.08;
      card.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${rotation}deg)`;

      // Dynamic Badge Opacity
      const likeBadge = card.querySelector('.badge-like');
      const nopeBadge = card.querySelector('.badge-nope');
      const superBadge = card.querySelector('.badge-super');

      const dragThreshold = 80;
      if (deltaY < -50 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
        // Super Bray Drag Up
        superBadge.style.opacity = Math.min(1, Math.max(0, -deltaY / dragThreshold));
        likeBadge.style.opacity = '0';
        nopeBadge.style.opacity = '0';
      } else {
        superBadge.style.opacity = '0';
        if (deltaX > 0) {
          likeBadge.style.opacity = Math.min(1, Math.max(0, deltaX / dragThreshold));
          nopeBadge.style.opacity = '0';
        } else {
          nopeBadge.style.opacity = Math.min(1, Math.max(0, -deltaX / dragThreshold));
          likeBadge.style.opacity = '0';
        }
      }
    };

    const handleEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      card.classList.remove('dragging');

      const deltaX = this.currentX - this.startX;
      const deltaY = this.currentY - this.startY;
      const threshold = 110;

      if (deltaY < -threshold && Math.abs(deltaY) > Math.abs(deltaX) * 1.3) {
        this.executeSwipe('superlike', donkey, card);
      } else if (deltaX > threshold) {
        this.executeSwipe('like', donkey, card);
      } else if (deltaX < -threshold) {
        this.executeSwipe('dislike', donkey, card);
      } else {
        // Snap back to original position
        card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
        const badges = card.querySelectorAll('.swipe-badge');
        badges.forEach(b => b.style.opacity = '0');
      }
    };

    // Pointer Events (Mouse + Touch)
    card.addEventListener('pointerdown', (e) => {
      // Don't drag if clicking buttons or inside open drawer
      if (e.target.closest('.card-info-btn') || e.target.closest('.card-details-drawer.open')) {
        return;
      }
      handleStart(e.clientX, e.clientY);
      card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    const onPointerFinish = (e) => {
      if (this.isDragging) {
        try { card.releasePointerCapture(e.pointerId); } catch (_) {}
        handleEnd();
      }
    };

    card.addEventListener('pointerup', onPointerFinish);
    card.addEventListener('pointercancel', onPointerFinish);
  }

  executeSwipe(direction, donkey, cardEl = this.activeCard) {
    if (this.animating || !cardEl || !donkey) return;
    this.animating = true;

    let targetTransform = '';
    if (direction === 'like') {
      window.DonkrSound.playSwish();
      targetTransform = 'translate3d(120vw, 40px, 0) rotate(35deg)';
      const likeBadge = cardEl.querySelector('.badge-like');
      if (likeBadge) likeBadge.style.opacity = '1';
    } else if (direction === 'dislike') {
      window.DonkrSound.playSwish();
      targetTransform = 'translate3d(-120vw, 40px, 0) rotate(-35deg)';
      const nopeBadge = cardEl.querySelector('.badge-nope');
      if (nopeBadge) nopeBadge.style.opacity = '1';
    } else if (direction === 'superlike') {
      window.DonkrSound.playSuperLike();
      targetTransform = 'translate3d(0, -120vh, 0) scale(1.15)';
      const superBadge = cardEl.querySelector('.badge-super');
      if (superBadge) superBadge.style.opacity = '1';
    }

    cardEl.style.transition = 'transform 0.45s ease-out, opacity 0.45s ease-out';
    cardEl.style.transform = targetTransform;
    cardEl.style.opacity = '0';

    setTimeout(() => {
      this.currentIndex++;
      this.animating = false;
      this.renderCards();
      this.onSwipe(direction, donkey);
    }, 400);
  }

  // Programmatic Button Triggers
  swipeLike() {
    const donkey = this.getCurrentDonkey();
    if (donkey) this.executeSwipe('like', donkey);
  }

  swipeDislike() {
    const donkey = this.getCurrentDonkey();
    if (donkey) this.executeSwipe('dislike', donkey);
  }

  swipeSuperLike() {
    const donkey = this.getCurrentDonkey();
    if (donkey) this.executeSwipe('superlike', donkey);
  }

  rewind() {
    const last = window.DonkrStorage.popHistory();
    if (!last) return false;

    // Find index of that donkey
    const idx = this.donkeys.findIndex(d => d.id === last.donkeyId);
    if (idx !== -1) {
      this.currentIndex = idx;
      this.renderCards();
      window.DonkrSound.playPop(350);
      return true;
    }
    return false;
  }

  renderEmptyState() {
    this.container.innerHTML = `
      <div class="empty-deck-card">
        <div class="empty-icon">🌾</div>
        <h3 class="empty-title">Pasture is Quiet!</h3>
        <p class="empty-desc">You've trotted through all available donkeys in your area. Adjust your ear length filters or rewind to explore again!</p>
        <div class="empty-actions">
          <button class="btn-refresh-deck" id="btnRefreshDeck">
            <span>↺ Refresh Pasture</span>
          </button>
          <button class="btn-rewind-deck" id="btnRewindEmpty">
            <span>⏪ Rewind Last Swipe</span>
          </button>
        </div>
      </div>
    `;

    const refreshBtn = this.container.querySelector('#btnRefreshDeck');
    const rewindBtn = this.container.querySelector('#btnRewindEmpty');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        window.DonkrStorage.saveLikes([]);
        window.DonkrStorage.saveDislikes([]);
        window.DonkrStorage.saveSuperLikes([]);
        this.currentIndex = 0;
        this.renderCards();
        window.DonkrSound.playPop(500);
      });
    }

    if (rewindBtn) {
      rewindBtn.addEventListener('click', () => {
        this.rewind();
      });
    }
  }
}

window.DonkrCardManager = DonkrCardManager;
