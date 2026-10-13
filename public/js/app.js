/**
 * Donkr Main Application Controller
 * Coordinates Cards, Sound, Chat, Storage, and UI navigation.
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Donkr] Initializing application...');

  let allDonkeys = [];
  let filteredDonkeys = [];
  let cardManager = null;
  let chatManager = null;
  let profileManager = null;

  // --- Load Donkey Catalog ---
  try {
    console.log('[Donkr] Fetching donkey dataset from data/donkeys.json...');
    const res = await fetch('data/donkeys.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    allDonkeys = await res.json();
    console.log(`[Donkr] Successfully fetched ${allDonkeys.length} donkeys from server.`);
  } catch (err) {
    console.warn('[Donkr] Fetch failed or offline, loading embedded FALLBACK_DONKEYS:', err);
    allDonkeys = window.FALLBACK_DONKEYS || [];
  }

  // Final safety check: ensure dataset is non-empty
  if (!allDonkeys || allDonkeys.length === 0) {
    console.warn('[Donkr] Dataset empty, falling back to window.FALLBACK_DONKEYS');
    allDonkeys = window.FALLBACK_DONKEYS || [];
  }

  console.log(`[Donkr] Active catalog size: ${allDonkeys.length} donkeys.`);

  // --- Safe Initializations ---
  try {
    if (window.DonkrChatManager) {
      chatManager = new DonkrChatManager({ donkeys: allDonkeys });
    }
  } catch (e) {
    console.error('[Donkr] Error initializing ChatManager:', e);
  }

  try {
    if (window.DonkrProfileManager) {
      profileManager = new DonkrProfileManager({
        onProfileUpdate: (updated) => {
          console.log('[Donkr] Profile updated:', updated);
        },
        onFiltersUpdate: () => {
          applyFiltersAndReloadCards();
        }
      });
      profileManager.init();
    }
  } catch (e) {
    console.error('[Donkr] Error initializing ProfileManager:', e);
  }

  // --- Filter Logic ---
  function getFilteredDonkeys() {
    if (!window.DonkrStorage) return allDonkeys;

    const settings = window.DonkrStorage.getSettings() || {};
    const likes = window.DonkrStorage.getLikes() || [];
    const dislikes = window.DonkrStorage.getDislikes() || [];

    const maxDist = settings.maxDistance || 50;
    const minEar = settings.minEarLength || 20;
    const selectedBreed = settings.selectedBreed || 'All';
    const verifiedOnly = settings.showOnlyVerified || false;

    const filtered = allDonkeys.filter(donkey => {
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

    // If user has filtered out everything or swiped everything, don't leave screen dead
    console.log(`[Donkr] getFilteredDonkeys returned ${filtered.length} donkeys.`);
    return filtered;
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
  if (cardsContainer && window.DonkrCardManager) {
    const initialList = getFilteredDonkeys();
    console.log(`[Donkr] Initializing cards with ${initialList.length} donkeys.`);

    cardManager = new DonkrCardManager(cardsContainer, {
      donkeys: initialList,
      onSwipe: (direction, donkey) => {
        handleSwipeResult(direction, donkey);
      },
      onEmpty: () => {
        console.log('[Donkr] Pasture deck is empty.');
        updateBadgeCounts();
      }
    });
    cardManager.renderCards();
    console.log('[Donkr] Cards rendered successfully.');
  } else {
    console.error('[Donkr] cardsDeckContainer or DonkrCardManager not found!');
  }

  // --- Swipe Resolution & Matchmaking ---
  function handleSwipeResult(direction, donkey) {
    const isSuper = direction === 'superlike';
    let matched = false;

    if (window.DonkrStorage) {
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
            if (chatManager) {
              chatManager.showMatchModal(donkey, isSuper);
              chatManager.renderMatchesView();
            }
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
    }

    if (profileManager) profileManager.updateStorageStats();
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
      if (!cardManager) return;
      const success = cardManager.rewind();
      if (!success) {
        showToast('Nothing to rewind! ↺');
      } else {
        showToast('Rewound last donkey! ⏪');
      }
    });
  }

  if (btnDislike) {
    btnDislike.addEventListener('click', () => {
      if (cardManager) cardManager.swipeDislike();
    });
  }

  if (btnSuper) {
    btnSuper.addEventListener('click', () => {
      if (cardManager) cardManager.swipeSuperLike();
    });
  }

  if (btnLike) {
    btnLike.addEventListener('click', () => {
      if (cardManager) cardManager.swipeLike();
    });
  }

  if (btnBoost) {
    btnBoost.addEventListener('click', () => {
      if (window.DonkrSound) window.DonkrSound.playSuperLike();
      showToast('⚡ CARROT BOOST ACTIVATED! Your profile is shining across the meadow!');
      if (cardsContainer) {
        cardsContainer.classList.add('boost-shake');
        setTimeout(() => cardsContainer.classList.remove('boost-shake'), 600);
      }
    });
  }

  // --- Sound Toggle ---
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn && window.DonkrSound) {
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

    if (viewId === 'viewMatches' && chatManager) {
      chatManager.renderMatchesView();
    } else if (viewId === 'viewProfile' && profileManager) {
      profileManager.updateStorageStats();
    }

    if (window.DonkrSound) window.DonkrSound.playPop(440);
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
    btnOpenFilters.addEventListener('click', () => switchView('viewFilters'));
  }

  // Back to Discover from Filters
  const btnCloseFilters = document.getElementById('btnCloseFilters');
  if (btnCloseFilters) {
    btnCloseFilters.addEventListener('click', () => switchView('viewDiscover'));
  }

  // Back from Chat to Matches list
  const btnBackFromChat = document.getElementById('btnBackFromChat');
  if (btnBackFromChat) {
    btnBackFromChat.addEventListener('click', () => switchView('viewMatches'));
  }

  // --- Chat Messaging Events ---
  const chatForm = document.getElementById('chatInputForm');
  const chatInput = document.getElementById('chatTextInput');

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value;
      if (text.trim() && chatManager) {
        chatManager.sendMessage(text);
        chatInput.value = '';
      }
    });
  }

  // Pickup line pills
  document.querySelectorAll('.pickup-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const line = pill.dataset.line;
      if (line && chatManager) {
        chatManager.sendMessage(line);
      }
    });
  });

  // Bray Audio Button in Chat
  const btnChatBray = document.getElementById('btnChatBray');
  if (btnChatBray) {
    btnChatBray.addEventListener('click', () => {
      if (window.DonkrSound) window.DonkrSound.playBray();
      showToast('You sent a live HEE-HAW! 📢');
    });
  }

  // --- Helper UI Updates ---
  function updateBadgeCounts() {
    if (!window.DonkrStorage) return;
    const matches = window.DonkrStorage.getMatches() || [];
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

  updateBadgeCounts();

  document.body.addEventListener('click', () => {
    if (window.DonkrSound && window.DonkrSound.ctx && window.DonkrSound.ctx.state === 'suspended') {
      window.DonkrSound.ctx.resume();
    }
  }, { once: true });
});
