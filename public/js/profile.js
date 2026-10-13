/**
 * Donkr Profile & Filters Management
 * Allows user to customize their donkey persona and match filter criteria.
 */
class DonkrProfileManager {
  constructor(options = {}) {
    this.onProfileUpdate = options.onProfileUpdate || (() => {});
    this.onFiltersUpdate = options.onFiltersUpdate || (() => {});
  }

  init() {
    try {
      this.populateProfileForm();
      this.populateFiltersForm();
      this.bindEvents();
      this.updateStorageStats();
    } catch (err) {
      console.error('Error initializing ProfileManager:', err);
    }
  }

  // Safe DOM helper
  _setTxt(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  _setSrc(id, val) {
    const el = document.getElementById(id);
    if (el) el.src = val;
  }

  _setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  populateProfileForm() {
    const profile = window.DonkrStorage ? window.DonkrStorage.getProfile() : null;
    if (!profile) return;

    // View elements (safe)
    this._setSrc('profilePreviewAvatar', profile.avatar || 'assets/avatars/user-default.svg');
    this._setTxt('profilePreviewName', profile.name || 'Barnaby Jr.');
    this._setTxt('profilePreviewAge', profile.age || '5');
    this._setTxt('profilePreviewBreed', profile.breed || 'Standard Donkey');
    this._setTxt('profilePreviewBio', profile.bio || 'Grazing quietly in the pasture...');
    this._setTxt('profilePreviewSnack', profile.favoriteSnack || 'Carrots 🥕');
    this._setTxt('profilePreviewEars', `${profile.earLengthCm || 35} cm`);
    this._setTxt('profilePreviewBray', `${profile.brayVolumeDb || 95} dB`);

    // Form inputs (safe)
    this._setVal('inputProfileName', profile.name || '');
    this._setVal('inputProfileAge', profile.age || 5);
    this._setVal('selectProfileGender', profile.gender || 'Jack');
    this._setVal('selectProfileBreed', profile.breed || 'Standard American Donkey');
    this._setVal('inputProfileLocation', profile.location || 'Sunny Pasture');
    this._setVal('inputProfileSnack', profile.favoriteSnack || 'Carrots 🥕');
    this._setVal('inputProfileBio', profile.bio || '');
    this._setVal('inputProfileEarLength', profile.earLengthCm || 35);
    this._setTxt('valProfileEarLength', `${profile.earLengthCm || 35} cm`);
    this._setVal('inputProfileBrayVolume', profile.brayVolumeDb || 95);
    this._setTxt('valProfileBrayVolume', `${profile.brayVolumeDb || 95} dB`);
  }

  populateFiltersForm() {
    const settings = window.DonkrStorage ? window.DonkrStorage.getSettings() : {};

    const maxDist = settings.maxDistance || 30;
    this._setVal('filterDistance', maxDist);
    this._setTxt('valFilterDistance', `${maxDist} miles`);

    const minEar = settings.minEarLength || 25;
    this._setVal('filterEarLength', minEar);
    this._setTxt('valFilterEarLength', `${minEar} cm`);

    this._setVal('filterBreed', settings.selectedBreed || 'All');

    const filterVerified = document.getElementById('filterVerifiedOnly');
    if (filterVerified) {
      filterVerified.checked = settings.showOnlyVerified || false;
    }

    // Sound toggle state
    const soundToggle = document.getElementById('soundToggleBtn');
    if (soundToggle && window.DonkrSound) {
      soundToggle.classList.toggle('muted', !window.DonkrSound.enabled);
    }
  }

  bindEvents() {
    // Ear length slider in profile
    const profileEarInput = document.getElementById('inputProfileEarLength');
    if (profileEarInput) {
      profileEarInput.addEventListener('input', (e) => {
        this._setTxt('valProfileEarLength', `${e.target.value} cm`);
      });
    }

    // Bray volume slider in profile
    const profileBrayInput = document.getElementById('inputProfileBrayVolume');
    if (profileBrayInput) {
      profileBrayInput.addEventListener('input', (e) => {
        this._setTxt('valProfileBrayVolume', `${e.target.value} dB`);
      });
    }

    // Filter distance slider
    const filterDistInput = document.getElementById('filterDistance');
    if (filterDistInput) {
      filterDistInput.addEventListener('input', (e) => {
        this._setTxt('valFilterDistance', `${e.target.value} miles`);
      });
    }

    // Filter ear length slider
    const filterEarInput = document.getElementById('filterEarLength');
    if (filterEarInput) {
      filterEarInput.addEventListener('input', (e) => {
        this._setTxt('valFilterEarLength', `${e.target.value} cm`);
      });
    }

    // Save Profile Form
    const profileForm = document.getElementById('formEditProfile');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const current = (window.DonkrStorage && window.DonkrStorage.getProfile()) || {};
        const nameInput = document.getElementById('inputProfileName');
        const ageInput = document.getElementById('inputProfileAge');
        const genderInput = document.getElementById('selectProfileGender');
        const breedInput = document.getElementById('selectProfileBreed');
        const locInput = document.getElementById('inputProfileLocation');
        const snackInput = document.getElementById('inputProfileSnack');
        const bioInput = document.getElementById('inputProfileBio');
        const earInput = document.getElementById('inputProfileEarLength');
        const brayInput = document.getElementById('inputProfileBrayVolume');

        const updated = {
          ...current,
          name: (nameInput ? nameInput.value.trim() : '') || 'Barnaby Jr.',
          age: parseInt(ageInput ? ageInput.value : 5, 10) || 5,
          gender: genderInput ? genderInput.value : 'Jack',
          breed: breedInput ? breedInput.value : 'Standard American Donkey',
          location: (locInput ? locInput.value.trim() : '') || 'Meadow',
          favoriteSnack: (snackInput ? snackInput.value.trim() : '') || 'Carrots 🥕',
          bio: bioInput ? bioInput.value.trim() : '',
          earLengthCm: parseInt(earInput ? earInput.value : 35, 10) || 35,
          brayVolumeDb: parseInt(brayInput ? brayInput.value : 95, 10) || 95
        };

        if (window.DonkrStorage) {
          window.DonkrStorage.saveProfile(updated);
        }
        this.populateProfileForm();
        this.updateStorageStats();
        if (window.DonkrSound) window.DonkrSound.playPop(600);

        // Flash notification
        const toast = document.getElementById('toastNotification');
        if (toast) {
          toast.textContent = 'Profile updated successfully! 🥕';
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }

        this.onProfileUpdate(updated);
      });
    }

    // Apply Filters Form
    const filtersForm = document.getElementById('formDiscoveryFilters');
    if (filtersForm) {
      filtersForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const distInput = document.getElementById('filterDistance');
        const earInput = document.getElementById('filterEarLength');
        const breedInput = document.getElementById('filterBreed');
        const verInput = document.getElementById('filterVerifiedOnly');

        const settings = {
          soundEnabled: window.DonkrSound ? window.DonkrSound.enabled : true,
          maxDistance: parseInt(distInput ? distInput.value : 50, 10),
          minEarLength: parseInt(earInput ? earInput.value : 20, 10),
          selectedBreed: breedInput ? breedInput.value : 'All',
          showOnlyVerified: verInput ? verInput.checked : false
        };

        if (window.DonkrStorage) {
          window.DonkrStorage.saveSettings(settings);
        }
        this.updateStorageStats();
        if (window.DonkrSound) window.DonkrSound.playPop(550);

        const toast = document.getElementById('toastNotification');
        if (toast) {
          toast.textContent = 'Pasture filters applied! 🌾';
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }

        this.onFiltersUpdate(settings);
      });
    }

    // Avatar Selection Buttons
    document.querySelectorAll('.avatar-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const avatarSrc = btn.dataset.avatar;
        document.querySelectorAll('.avatar-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        if (window.DonkrStorage) {
          const profile = window.DonkrStorage.getProfile() || {};
          profile.avatar = avatarSrc;
          window.DonkrStorage.saveProfile(profile);
        }

        this._setSrc('profilePreviewAvatar', avatarSrc);
        if (window.DonkrSound) window.DonkrSound.playPop(480);
      });
    });

    // Reset Data button
    const btnResetData = document.getElementById('btnResetAllData');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all likes, matches, and chats?')) {
          if (window.DonkrStorage) window.DonkrStorage.resetAll();
          this.populateProfileForm();
          this.populateFiltersForm();
          this.updateStorageStats();
          if (window.DonkrSound) window.DonkrSound.playBray();
          alert('Pasture memory cleared! Fresh herd loaded.');
          window.location.reload();
        }
      });
    }

    // Export Data button
    const btnExportData = document.getElementById('btnExportData');
    if (btnExportData) {
      btnExportData.addEventListener('click', () => {
        if (!window.DonkrStorage) return;
        const fullBackup = {
          profile: window.DonkrStorage.getProfile(),
          likes: window.DonkrStorage.getLikes(),
          dislikes: window.DonkrStorage.getDislikes(),
          matches: window.DonkrStorage.getMatches(),
          chats: window.DonkrStorage.getChats(),
          settings: window.DonkrStorage.getSettings()
        };
        const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `donkr-static-storage-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  updateStorageStats() {
    if (!window.DonkrStorage) return;
    const bytes = window.DonkrStorage.getStorageUsageBytes();
    const likesCount = window.DonkrStorage.getLikes().length;
    const matchesCount = window.DonkrStorage.getMatches().length;

    const statsEl = document.getElementById('storageStatsText');
    if (statsEl) {
      statsEl.textContent = `Static LocalStorage: ${(bytes / 1024).toFixed(2)} KB • ${likesCount} Swipes • ${matchesCount} Matches`;
    }
  }
}

window.DonkrProfileManager = DonkrProfileManager;
