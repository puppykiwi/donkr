/**
 * Donkr Static Storage Manager
 * Uses browser LocalStorage for 100% client-side persistence.
 */
class DonkrStorage {
  constructor() {
    this.KEYS = {
      PROFILE: 'donkr_user_profile',
      LIKES: 'donkr_likes',
      DISLIKES: 'donkr_dislikes',
      SUPERLIKES: 'donkr_superlikes',
      MATCHES: 'donkr_matches',
      CHATS: 'donkr_chats',
      HISTORY: 'donkr_swipe_history',
      SETTINGS: 'donkr_settings'
    };

    this.initDefaults();
  }

  initDefaults() {
    if (!localStorage.getItem(this.KEYS.PROFILE)) {
      const defaultProfile = {
        id: 'user_donkey_main',
        name: 'Barnaby Jr.',
        age: 5,
        gender: 'Jack',
        breed: 'Standard American Donkey',
        location: 'Sunny Pasture, Montana',
        earLengthCm: 37,
        brayVolumeDb: 98,
        stubbornnessPercent: 92,
        favoriteSnack: 'Crisp Carrots & Molasses Cubes 🥕',
        bio: 'Just an honest donkey looking for a trustworthy pasture partner. I enjoy standing in the shade, mutual back scratches, and braying at tractors.',
        avatar: '/assets/avatars/user-default.svg',
        verified: true,
        tags: ['Velvet Muzzle ☁️', 'Carrot Lover 🥕', 'Loyal 💚', 'Tractor Skeptic 🚜']
      };
      this.saveProfile(defaultProfile);
    }

    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      const defaultSettings = {
        soundEnabled: true,
        maxDistance: 25,
        minEarLength: 25,
        minAge: 2,
        maxAge: 12,
        selectedBreed: 'All',
        showOnlyVerified: false
      };
      this.saveSettings(defaultSettings);
    }

    if (!localStorage.getItem(this.KEYS.LIKES)) this.saveLikes([]);
    if (!localStorage.getItem(this.KEYS.DISLIKES)) this.saveDislikes([]);
    if (!localStorage.getItem(this.KEYS.SUPERLIKES)) this.saveSuperLikes([]);
    if (!localStorage.getItem(this.KEYS.MATCHES)) this.saveMatches([]);
    if (!localStorage.getItem(this.KEYS.CHATS)) this.saveChats({});
    if (!localStorage.getItem(this.KEYS.HISTORY)) this.saveHistory([]);
  }

  // --- Profile ---
  getProfile() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.PROFILE));
    } catch (e) {
      return null;
    }
  }

  saveProfile(profile) {
    localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(profile));
  }

  // --- Settings & Filters ---
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || {};
    } catch (e) {
      return {};
    }
  }

  saveSettings(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- Likes, Dislikes, SuperLikes ---
  getLikes() {
    return this._getArray(this.KEYS.LIKES);
  }

  saveLikes(arr) {
    this._saveArray(this.KEYS.LIKES, arr);
  }

  addLike(donkeyId) {
    const likes = this.getLikes();
    if (!likes.includes(donkeyId)) {
      likes.push(donkeyId);
      this.saveLikes(likes);
    }
  }

  getDislikes() {
    return this._getArray(this.KEYS.DISLIKES);
  }

  saveDislikes(arr) {
    this._saveArray(this.KEYS.DISLIKES, arr);
  }

  addDislike(donkeyId) {
    const dislikes = this.getDislikes();
    if (!dislikes.includes(donkeyId)) {
      dislikes.push(donkeyId);
      this.saveDislikes(dislikes);
    }
  }

  getSuperLikes() {
    return this._getArray(this.KEYS.SUPERLIKES);
  }

  saveSuperLikes(arr) {
    this._saveArray(this.KEYS.SUPERLIKES, arr);
  }

  addSuperLike(donkeyId) {
    const superlikes = this.getSuperLikes();
    if (!superlikes.includes(donkeyId)) {
      superlikes.push(donkeyId);
      this.saveSuperLikes(superlikes);
    }
    this.addLike(donkeyId);
  }

  // --- Swipe History (for Rewind) ---
  getHistory() {
    return this._getArray(this.KEYS.HISTORY);
  }

  saveHistory(history) {
    this._saveArray(this.KEYS.HISTORY, history);
  }

  pushHistory(entry) {
    const history = this.getHistory();
    history.push(entry);
    this.saveHistory(history);
  }

  popHistory() {
    const history = this.getHistory();
    const last = history.pop();
    this.saveHistory(history);
    if (last) {
      // Remove from likes or dislikes
      if (last.action === 'like') {
        const likes = this.getLikes().filter(id => id !== last.donkeyId);
        this.saveLikes(likes);
      } else if (last.action === 'dislike') {
        const dislikes = this.getDislikes().filter(id => id !== last.donkeyId);
        this.saveDislikes(dislikes);
      } else if (last.action === 'superlike') {
        const superlikes = this.getSuperLikes().filter(id => id !== last.donkeyId);
        const likes = this.getLikes().filter(id => id !== last.donkeyId);
        this.saveSuperLikes(superlikes);
        this.saveLikes(likes);
      }
      // If it caused a match, remove the match too
      if (last.matched) {
        this.removeMatch(last.donkeyId);
      }
    }
    return last;
  }

  // --- Matches ---
  getMatches() {
    return this._getArray(this.KEYS.MATCHES);
  }

  saveMatches(matches) {
    this._saveArray(this.KEYS.MATCHES, matches);
  }

  addMatch(matchData) {
    const matches = this.getMatches();
    const existingIdx = matches.findIndex(m => m.id === matchData.id);
    if (existingIdx === -1) {
      matches.unshift({
        id: matchData.id,
        matchedAt: Date.now(),
        lastActivity: Date.now(),
        isSuper: matchData.isSuper || false
      });
      this.saveMatches(matches);
    }
  }

  removeMatch(donkeyId) {
    const matches = this.getMatches().filter(m => m.id !== donkeyId);
    this.saveMatches(matches);
  }

  isMatched(donkeyId) {
    return this.getMatches().some(m => m.id === donkeyId);
  }

  // --- Chats ---
  getChats() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.CHATS)) || {};
    } catch (e) {
      return {};
    }
  }

  saveChats(chats) {
    localStorage.setItem(this.KEYS.CHATS, JSON.stringify(chats));
  }

  getMessages(donkeyId) {
    const chats = this.getChats();
    return chats[donkeyId] || [];
  }

  addMessage(donkeyId, message) {
    const chats = this.getChats();
    if (!chats[donkeyId]) {
      chats[donkeyId] = [];
    }
    chats[donkeyId].push({
      ...message,
      timestamp: message.timestamp || Date.now()
    });
    this.saveChats(chats);

    // Update match lastActivity
    const matches = this.getMatches();
    const match = matches.find(m => m.id === donkeyId);
    if (match) {
      match.lastActivity = Date.now();
      match.lastMessage = message.text;
      this.saveMatches(matches);
    }
  }

  // --- Clear / Reset ---
  resetAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
    this.initDefaults();
  }

  getStorageUsageBytes() {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length + x.length) * 2;
      }
    }
    return total;
  }

  // Internal Helpers
  _getArray(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  _saveArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }
}

window.DonkrStorage = new DonkrStorage();
