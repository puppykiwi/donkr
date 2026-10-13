/**
 * Donkr Main Application Controller
 * Coordinates Cards, Sound, Chat, Storage, and UI navigation.
 */
document.addEventListener('DOMContentLoaded', async () => {
  let allDonkeys = [];
  let filteredDonkeys = [];
  let cardManager = null;
  let chatManager = null;
  let profileManager = null;

  // --- Load Donkey Catalog ---
  try {
    const res = await fetch('/data/donkeys.json');
    if (!res.ok) throw new Error('Network error loading donkeys');
    allDonkeys = await res.json();
  } catch (err) {
    console.warn('Fallback to embedded dataset:', err);
    // Fallback if accessed without server
    allDonkeys = window.FALLBACK_DONKEYS || [];
  }

  // --- Initialize Managers ---
  chatManager = new DonkrChatManager({
    donkeys: allDonkeys
  });

  profileManager = new DonkrProfileManager({
    onProfileUpdate: (updated) => {
      // Re-render chat headers if current chat is open
      console.log('Profile updated', updated);
    },
    onFiltersUpdate: () => {
      applyFiltersAndReloadCards();
    }
  });
  profileManager.init();

  // --- Filter Logic ---
  function getFilteredDonkeys() {
    const settings = window.DonkrStorage.getSettings();
    const likes = window.DonkrStorage.getLikes();
    const dislikes = window.DonkrStorage.getDislikes();

    const maxDist = settings.maxDistance || 50;
    const minEar = settings.minEarLength || 20;
    const selectedBreed = settings.selectedBreed || 'All';
    const verifiedOnly = settings.showOnlyVerified || false;

    return allDonkeys.filter(donkey => {
      // Exclude already swiped donkeys
      if (likes.includes(donkey.id) || dislikes.includes(donkey.id)) {
        return false;
      }
      // Distance filter
      if (donkey.distanceMiles > maxDist) return false;
      // Ear length filter
      if (donkey.earLengthCm < minEar) return false;
      // Breed filter
      if (selectedBreed !== 'All' && donkey.breed !== selectedBreed) return false;
      // Verified filter
      if (verifiedOnly && !donkey.verified) return false;

      return true;
    });
  }

  function applyFiltersAndReloadCards() {
    filteredDonkeys = getFilteredDonkeys();
    if (cardManager) {
      cardManager.setDonkeys(filteredDonkeys);
    }
    updateBadgeCounts();
  }

  // --- Card Manager Setup ---
  const cardsContainer = document.getElementById('cardsDeckContainer');
  cardManager = new DonkrCardManager(cardsContainer, {
    donkeys: getFilteredDonkeys(),
    onSwipe: (direction, donkey) => {
      handleSwipeResult(direction, donkey);
    },
    onEmpty: () => {
      updateBadgeCounts();
    }
  });
  cardManager.renderCards();

  // --- Swipe Resolution & Matchmaking ---
  function handleSwipeResult(direction, donkey) {
    const isSuper = direction === 'superlike';
    let matched = false;

    if (direction === 'like' || isSuper) {
      if (isSuper) {
        window.DonkrStorage.addSuperLike(donkey.id);
      } else {
        window.DonkrStorage.addLike(donkey.id);
      }

      // Check match probability (Super Bray guarantees match!)
      const matchChance = isSuper ? 1.0 : (donkey.matchProbability || 0.85);
      if (Math.random() < matchChance) {
        matched = true;
        window.DonkrStorage.addMatch({
          id: donkey.id,
          isSuper: isSuper
        });

        // Delay popup slightly for smooth card fly-out
        setTimeout(() => {
          chatManager.showMatchModal(donkey, isSuper);
          chatManager.renderMatchesView();
          updateBadgeCounts();
        }, 300);
      }
    } else {
      window.DonkrStorage.addDislike(donkey.id);
    }

    // Save in history for Rewind
    window.DonkrStorage.pushHistory({
      donkeyId: donkey.id,
      action: direction,
      matched: matched,
      timestamp: Date.now()
    });

    profileManager.updateStorageStats();
    updateBadgeCounts();
  }

  // --- Action Bar Buttons ---
  const btnRewind = document.getElementById('btnActionRewind');
  const btnDislike = document.getElementById('btnActionDislike');
  const btnSuper = document.getElementById('btnActionSuper');
  const btnLike = document.getElementById('btnActionLike');
  const btnBoost = document.getElementById('btnActionBoost');

  if (btnRewind) {
    btnRewind.addEventListener('click', () => {
      const success = cardManager.rewind();
      if (!success) {
        showToast('Nothing to rewind! ↺');
      } else {
        showToast('Rewound last donkey! ⏪');
      }
    });
  }

  if (btnDislike) {
    btnDislike.addEventListener('click', () => cardManager.swipeDislike());
  }

  if (btnSuper) {
    btnSuper.addEventListener('click', () => cardManager.swipeSuperLike());
  }

  if (btnLike) {
    btnLike.addEventListener('click', () => cardManager.swipeLike());
  }

  if (btnBoost) {
    btnBoost.addEventListener('click', () => {
      window.DonkrSound.playSuperLike();
      showToast('⚡ CARROT BOOST ACTIVATED! Your profile is shining across the meadow!');
      // Shake animation on cards container
      cardsContainer.classList.add('boost-shake');
      setTimeout(() => cardsContainer.classList.remove('boost-shake'), 600);
    });
  }

  // --- Sound Toggle ---
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const enabled = window.DonkrSound.toggleSound();
      soundToggleBtn.classList.toggle('muted', !enabled);
      if (enabled) {
        window.DonkrSound.playPop(520);
        showToast('Sound effects enabled 🔔');
      } else {
        showToast('Sound muted 🔕');
      }
    });
  }

  // --- Navigation Tabs ---
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  const appViews = document.querySelectorAll('.app-view');

  function switchView(viewId) {
    appViews.forEach(v => v.classList.remove('active'));
    navTabs.forEach(t => t.classList.remove('active'));

    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');

    const activeTab = document.querySelector(`.nav-tab-btn[data-target="${viewId}"]`);
    if (activeTab) activeTab.classList.add('active');

    if (viewId === 'viewMatches') {
      chatManager.renderMatchesView();
    } else if (viewId === 'viewProfile') {
      profileManager.updateStorageStats();
    }

    window.DonkrSound.playPop(440);
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      switchView(target);
    });
  });

  // Filters Button in Discover Header
  const btnOpenFilters = document.getElementById('btnOpenFilters');
  if (btnOpenFilters) {
    btnOpenFilters.addEventListener('click', () => {
      switchView('viewFilters');
    });
  }

  // Back to Discover from Filters
  const btnCloseFilters = document.getElementById('btnCloseFilters');
  if (btnCloseFilters) {
    btnCloseFilters.addEventListener('click', () => {
      switchView('viewDiscover');
    });
  }

  // Back from Chat to Matches list
  const btnBackFromChat = document.getElementById('btnBackFromChat');
  if (btnBackFromChat) {
    btnBackFromChat.addEventListener('click', () => {
      switchView('viewMatches');
    });
  }

  // --- Chat Messaging Events ---
  const chatForm = document.getElementById('chatInputForm');
  const chatInput = document.getElementById('chatTextInput');

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value;
      if (text.trim()) {
        chatManager.sendMessage(text);
        chatInput.value = '';
      }
    });
  }

  // Pickup line pills
  document.querySelectorAll('.pickup-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const line = pill.dataset.line;
      if (line) {
        chatManager.sendMessage(line);
      }
    });
  });

  // Bray Audio Button in Chat
  const btnChatBray = document.getElementById('btnChatBray');
  if (btnChatBray) {
    btnChatBray.addEventListener('click', () => {
      window.DonkrSound.playBray();
      showToast('You sent a live HEE-HAW! 📢');
    });
  }

  // --- Helper UI Updates ---
  function updateBadgeCounts() {
    const matches = window.DonkrStorage.getMatches();
    const badge = document.getElementById('matchesCountBadge');
    if (badge) {
      badge.textContent = matches.length;
      badge.style.display = matches.length > 0 ? 'inline-block' : 'none';
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }
  }

  // Initial badge update
  updateBadgeCounts();

  // Test sound on initial click anywhere if context suspended
  document.body.addEventListener('click', () => {
    if (window.DonkrSound.ctx && window.DonkrSound.ctx.state === 'suspended') {
      window.DonkrSound.ctx.resume();
    }
  }, { once: true });
});
