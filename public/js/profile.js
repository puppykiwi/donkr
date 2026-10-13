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
    this.populateProfileForm();
    this.populateFiltersForm();
    this.bindEvents();
    this.updateStorageStats();
  }

  populateProfileForm() {
    const profile = window.DonkrStorage.getProfile();
    if (!profile) return;

    // View elements
    document.getElementById('profilePreviewAvatar').src = profile.avatar || '/assets/avatars/user-default.svg';
    document.getElementById('profilePreviewName').textContent = profile.name || 'Unnamed Jack';
    document.getElementById('profilePreviewAge').textContent = profile.age || '5';
    document.getElementById('profilePreviewBreed').textContent = profile.breed || 'Standard Donkey';
    document.getElementById('profilePreviewBio').textContent = profile.bio || 'Grazing quietly...';
    document.getElementById('profilePreviewSnack').textContent = profile.favoriteSnack || 'Carrots 🥕';
    document.getElementById('profilePreviewEars').textContent = `${profile.earLengthCm || 35} cm`;
    document.getElementById('profilePreviewBray').textContent = `${profile.brayVolumeDb || 95} dB`;

    // Form inputs
    document.getElementById('inputProfileName').value = profile.name || '';
    document.getElementById('inputProfileAge').value = profile.age || 5;
    document.getElementById('selectProfileGender').value = profile.gender || 'Jack';
    document.getElementById('selectProfileBreed').value = profile.breed || 'Standard American Donkey';
    document.getElementById('inputProfileLocation').value = profile.location || 'Sunny Pasture';
    document.getElementById('inputProfileSnack').value = profile.favoriteSnack || 'Carrots 🥕';
    document.getElementById('inputProfileBio').value = profile.bio || '';
    document.getElementById('inputProfileEarLength').value = profile.earLengthCm || 35;
    document.getElementById('valProfileEarLength').textContent = `${profile.earLengthCm || 35} cm`;
    document.getElementById('inputProfileBrayVolume').value = profile.brayVolumeDb || 95;
    document.getElementById('valProfileBrayVolume').textContent = `${profile.brayVolumeDb || 95} dB`;
  }

  populateFiltersForm() {
    const settings = window.DonkrStorage.getSettings();

    const maxDist = settings.maxDistance || 30;
    document.getElementById('filterDistance').value = maxDist;
    document.getElementById('valFilterDistance').textContent = `${maxDist} miles`;

    const minEar = settings.minEarLength || 25;
    document.getElementById('filterEarLength').value = minEar;
    document.getElementById('valFilterEarLength').textContent = `${minEar} cm`;

    document.getElementById('filterBreed').value = settings.selectedBreed || 'All';
    document.getElementById('filterVerifiedOnly').checked = settings.showOnlyVerified || false;

    // Sound toggle state
    const soundToggle = document.getElementById('soundToggleBtn');
    if (soundToggle) {
      soundToggle.classList.toggle('muted', !window.DonkrSound.enabled);
    }
  }

  bindEvents() {
    // Ear length slider in profile
    const profileEarInput = document.getElementById('inputProfileEarLength');
    profileEarInput.addEventListener('input', (e) => {
      document.getElementById('valProfileEarLength').textContent = `${e.target.value} cm`;
    });

    // Bray volume slider in profile
    const profileBrayInput = document.getElementById('inputProfileBrayVolume');
    profileBrayInput.addEventListener('input', (e) => {
      document.getElementById('valProfileBrayVolume').textContent = `${e.target.value} dB`;
    });

    // Filter distance slider
    const filterDistInput = document.getElementById('filterDistance');
    filterDistInput.addEventListener('input', (e) => {
      document.getElementById('valFilterDistance').textContent = `${e.target.value} miles`;
    });

    // Filter ear length slider
    const filterEarInput = document.getElementById('filterEarLength');
    filterEarInput.addEventListener('input', (e) => {
      document.getElementById('valFilterEarLength').textContent = `${e.target.value} cm`;
    });

    // Save Profile Form
    const profileForm = document.getElementById('formEditProfile');
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = window.DonkrStorage.getProfile() || {};
      const updated = {
        ...current,
        name: document.getElementById('inputProfileName').value.trim() || 'Barnaby Jr.',
        age: parseInt(document.getElementById('inputProfileAge').value, 10) || 5,
        gender: document.getElementById('selectProfileGender').value,
        breed: document.getElementById('selectProfileBreed').value,
        location: document.getElementById('inputProfileLocation').value.trim() || 'Meadow',
        favoriteSnack: document.getElementById('inputProfileSnack').value.trim() || 'Carrots 🥕',
        bio: document.getElementById('inputProfileBio').value.trim(),
        earLengthCm: parseInt(document.getElementById('inputProfileEarLength').value, 10) || 35,
        brayVolumeDb: parseInt(document.getElementById('inputProfileBrayVolume').value, 10) || 95
      };

      window.DonkrStorage.saveProfile(updated);
      this.populateProfileForm();
      this.updateStorageStats();
      window.DonkrSound.playPop(600);

      // Flash notification
      const toast = document.getElementById('toastNotification');
      if (toast) {
        toast.textContent = 'Profile updated successfully! 🥕';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      }

      this.onProfileUpdate(updated);
    });

    // Apply Filters Form
    const filtersForm = document.getElementById('formDiscoveryFilters');
    filtersForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const settings = {
        soundEnabled: window.DonkrSound.enabled,
        maxDistance: parseInt(document.getElementById('filterDistance').value, 10),
        minEarLength: parseInt(document.getElementById('filterEarLength').value, 10),
        selectedBreed: document.getElementById('filterBreed').value,
        showOnlyVerified: document.getElementById('filterVerifiedOnly').checked
      };

      window.DonkrStorage.saveSettings(settings);
      this.updateStorageStats();
      window.DonkrSound.playPop(550);

      const toast = document.getElementById('toastNotification');
      if (toast) {
        toast.textContent = 'Pasture filters applied! 🌾';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      }

      this.onFiltersUpdate(settings);
    });

    // Avatar Selection Buttons
    document.querySelectorAll('.avatar-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const avatarSrc = btn.dataset.avatar;
        document.querySelectorAll('.avatar-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const profile = window.DonkrStorage.getProfile() || {};
        profile.avatar = avatarSrc;
        window.DonkrStorage.saveProfile(profile);

        document.getElementById('profilePreviewAvatar').src = avatarSrc;
        window.DonkrSound.playPop(480);
      });
    });

    // Reset Data button
    const btnResetData = document.getElementById('btnResetAllData');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all likes, matches, and chats?')) {
          window.DonkrStorage.resetAll();
          this.populateProfileForm();
          this.populateFiltersForm();
          this.updateStorageStats();
          window.DonkrSound.playBray();
          alert('Pasture memory cleared! Fresh herd loaded.');
          window.location.reload();
        }
      });
    }

    // Export Data button
    const btnExportData = document.getElementById('btnExportData');
    if (btnExportData) {
      btnExportData.addEventListener('click', () => {
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
