/**
 * End-to-end Headless Simulation Test for Donkr
 * Tests data loading, storage operations, card matching, and chat bot replies.
 */
const fs = require('fs');
const assert = require('assert');

console.log('--- STARTING DONKR E2E LOGIC TESTS ---');

// Mock localStorage
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

// Mock AudioContext
global.window = global;
global.window.AudioContext = class {
  constructor() {
    this.currentTime = 0;
    this.state = 'running';
    this.destination = {};
  }
  createGain() {
    return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} };
  }
  createOscillator() {
    return { type: '', frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} };
  }
  createBiquadFilter() {
    return { type: '', frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, Q: { setValueAtTime: () => {} }, connect: () => {} };
  }
};

// Load code files
eval(fs.readFileSync('/opt/donkr/public/js/donkeys.js', 'utf8'));
eval(fs.readFileSync('/opt/donkr/public/js/sound.js', 'utf8'));
eval(fs.readFileSync('/opt/donkr/public/js/storage.js', 'utf8'));
eval(fs.readFileSync('/opt/donkr/public/js/chat.js', 'utf8'));

// Test 1: Fallback donkeys data
console.log('Test 1: Donkey database length');
assert(Array.isArray(window.FALLBACK_DONKEYS), 'FALLBACK_DONKEYS should be an array');
assert(window.FALLBACK_DONKEYS.length >= 10, 'Should have at least 10 donkeys');
console.log(`✓ Loaded ${window.FALLBACK_DONKEYS.length} donkeys.`);

// Test 2: Sound synthesis
console.log('Test 2: Web Audio Synthesizer');
window.DonkrSound.playBray();
window.DonkrSound.playPop();
window.DonkrSound.playMatchFanfare();
window.DonkrSound.playSuperLike();
console.log('✓ Sound synthesis executed without errors.');

// Test 3: Static LocalStorage manager
console.log('Test 3: LocalStorage Manager');
const profile = window.DonkrStorage.getProfile();
assert(profile !== null, 'Default profile should be created');
assert.strictEqual(profile.gender, 'Jack', 'Default gender matches');

window.DonkrStorage.addLike('donkey_barnaby');
assert(window.DonkrStorage.getLikes().includes('donkey_barnaby'), 'Barnaby should be in likes');

window.DonkrStorage.addDislike('donkey_winston');
assert(window.DonkrStorage.getDislikes().includes('donkey_winston'), 'Winston should be in dislikes');

window.DonkrStorage.addSuperLike('donkey_penelope');
assert(window.DonkrStorage.getSuperLikes().includes('donkey_penelope'), 'Penelope should be in superlikes');
console.log('✓ Storage like/dislike/superlike operations pass.');

// Test 4: Match & Chat Engine
console.log('Test 4: Matchmaking and Chat responses');
const chatManager = new window.DonkrChatManager({ donkeys: window.FALLBACK_DONKEYS });

window.DonkrStorage.addMatch({ id: 'donkey_barnaby', isSuper: true });
assert(window.DonkrStorage.isMatched('donkey_barnaby'), 'Barnaby is matched');

const barnaby = chatManager.getDonkeyById('donkey_barnaby');
assert(barnaby !== null, 'Barnaby found');

// Send message containing keyword
const carrotReply = chatManager.generateDonkeyReply(barnaby, 'Here is a fresh carrot for you');
console.log(`Carrot prompt reply: "${carrotReply}"`);
assert(carrotReply.toLowerCase().includes('carrot') || carrotReply.toLowerCase().includes('nectar'), 'Should trigger carrot reaction');

// Generic response
const genericReply = chatManager.generateDonkeyReply(barnaby, 'Good morning');
console.log(`Generic prompt reply: "${genericReply}"`);
assert(typeof genericReply === 'string' && genericReply.length > 5, 'Should generate witty reply');

// Chat storage persistence
window.DonkrStorage.addMessage('donkey_barnaby', { sender: 'user', text: 'Hello Barnaby' });
window.DonkrStorage.addMessage('donkey_barnaby', { sender: 'donkey', text: genericReply });
const messages = window.DonkrStorage.getMessages('donkey_barnaby');
assert.strictEqual(messages.length, 2, 'Should have 2 messages stored');
console.log('✓ Match and Chat logic pass.');

// Test 5: Rewind logic
console.log('Test 5: History Rewind');
window.DonkrStorage.pushHistory({ donkeyId: 'donkey_rusty', action: 'dislike', matched: false });
assert(window.DonkrStorage.getDislikes().includes('donkey_rusty') === false);
window.DonkrStorage.addDislike('donkey_rusty');
assert(window.DonkrStorage.getDislikes().includes('donkey_rusty') === true);

const popped = window.DonkrStorage.popHistory();
assert.strictEqual(popped.donkeyId, 'donkey_rusty');
assert(window.DonkrStorage.getDislikes().includes('donkey_rusty') === false, 'Rusty removed from dislikes after rewind');
console.log('✓ Rewind functionality passes.');

console.log('\n ALL TESTS COMPLETED SUCCESSFULLY! ');
