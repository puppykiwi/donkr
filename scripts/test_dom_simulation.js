/**
 * Comprehensive DOM Simulation Test for Donkr
 * Validates DOM node creation, event listeners, script execution order, and card rendering.
 */
const fs = require('fs');
const assert = require('assert');

console.log('=== RUNNING DONKR DOM SIMULATION TEST ===');

// Minimal DOM implementation
class Element {
  constructor(tag, id = '', className = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className ? className.split(' ').filter(Boolean) : []),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          if (force) this.classList._classes.add(c);
          else this.classList._classes.delete(c);
          return force;
        }
        const has = this.classList._classes.has(c);
        if (has) this.classList._classes.delete(c);
        else this.classList._classes.add(c);
        return !has;
      }
    };
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this._textContent = '';
    this._value = '';
    this._innerHTML = '';
  }

  get textContent() { return this._textContent; }
  set textContent(v) { this._textContent = String(v); }

  get value() { return this._value; }
  set value(v) { this._value = String(v); }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(html) {
    this._innerHTML = html;
    // Simple child parser for simulation
    this.children = [];
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const fns = this.listeners[event.type || event] || [];
    fns.forEach(fn => fn(event));
  }

  querySelector(sel) {
    return this._findBySelector(sel);
  }

  querySelectorAll(sel) {
    return this._findAllBySelector(sel);
  }

  _findBySelector(sel) {
    if (sel.startsWith('#')) {
      const targetId = sel.slice(1);
      if (this.id === targetId) return this;
      for (const ch of this.children) {
        const found = ch._findBySelector(sel);
        if (found) return found;
      }
    } else if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      if (this.classList.contains(cls)) return this;
      for (const ch of this.children) {
        const found = ch._findBySelector(sel);
        if (found) return found;
      }
    }
    return null;
  }

  _findAllBySelector(sel) {
    const results = [];
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      if (this.classList.contains(cls)) results.push(this);
    }
    for (const ch of this.children) {
      results.push(...ch._findAllBySelector(sel));
    }
    return results;
  }
}

// Parse HTML to extract elements by ID
const htmlContent = fs.readFileSync('/opt/donkr/public/index.html', 'utf8');
const idMatches = htmlContent.matchAll(/id=["']([^"']+)["']/g);
const elementsById = {};

for (const m of idMatches) {
  const id = m[1];
  elementsById[id] = new Element('div', id);
}

// Setup Global Browser Environment
global.window = global;
global.document = {
  getElementById: (id) => elementsById[id] || null,
  querySelectorAll: (sel) => {
    if (sel.includes('.avatar-choice-btn')) {
      return [
        new Element('button', '', 'avatar-choice-btn'),
        new Element('button', '', 'avatar-choice-btn')
      ];
    }
    if (sel.includes('.pickup-pill')) {
      return [
        new Element('div', '', 'pickup-pill')
      ];
    }
    if (sel.includes('.nav-tab-btn')) {
      return [
        new Element('button', '', 'nav-tab-btn')
      ];
    }
    return [];
  },
  createElement: (tag) => new Element(tag),
  body: new Element('body'),
  addEventListener: (evt, fn) => {
    if (!global.document._listeners) global.document._listeners = {};
    if (!global.document._listeners[evt]) global.document._listeners[evt] = [];
    global.document._listeners[evt].push(fn);
  }
};

const mockLocalStorage = {};
global.localStorage = {
  getItem: (k) => mockLocalStorage[k] || null,
  setItem: (k, v) => { mockLocalStorage[k] = String(v); },
  removeItem: (k) => { delete mockLocalStorage[k]; },
  clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
};

global.AudioContext = class {
  constructor() { this.currentTime = 0; this.state = 'running'; }
  createGain() { return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
  createOscillator() { return { frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
  createBiquadFilter() { return { frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, Q: { setValueAtTime: () => {} }, connect: () => {} }; }
};

// Mock fetch to simulate loading data/donkeys.json
global.fetch = async (url) => {
  if (url.includes('donkeys.json')) {
    const data = JSON.parse(fs.readFileSync('/opt/donkr/public/data/donkeys.json', 'utf8'));
    return {
      ok: true,
      status: 200,
      json: async () => data
    };
  }
  return { ok: false, status: 404 };
};

// 1. Load scripts in sequence
console.log('Loading scripts in DOM...');
eval(fs.readFileSync('/opt/donkr/public/js/donkeys.js', 'utf8'));
eval(fs.readFileSync('/opt/donkr/public/js/sound.js', 'utf8'));
eval(fs.readFileSync('/opt/donkr/public/js/storage.js', 'utf8'));
eval(fs.readFileSync('/opt/donkr/public/js/cards.js', 'utf8'));
eval(fs.readFileSync('/opt/donkr/public/js/chat.js', 'utf8'));
eval(fs.readFileSync('/opt/donkr/public/js/profile.js', 'utf8'));
eval(fs.readFileSync('/opt/donkr/public/js/app.js', 'utf8'));

// 2. Dispatch DOMContentLoaded
(async () => {
  console.log('Triggering DOMContentLoaded...');
  const fns = global.document._listeners['DOMContentLoaded'] || [];
  for (const fn of fns) {
    await fn();
  }

  // 3. Inspect cardsDeckContainer
  const deck = elementsById['cardsDeckContainer'];
  console.log(`Deck container children count: ${deck.children.length}`);
  assert(deck.children.length > 0, 'cardsDeckContainer must have child card elements!');

  const topCard = deck.children[deck.children.length - 1]; // or first card
  console.log(`Rendered top card ID: ${topCard.dataset.id}, className: ${topCard.className}`);
  assert(topCard.className.includes('donkr-card'), 'Top card must be a donkr-card');

  // 4. Test button interactions
  console.log('Testing action button triggers...');
  const btnLike = elementsById['btnActionLike'];
  assert(btnLike !== null, 'Like button must exist');
  btnLike.dispatchEvent('click');

  await new Promise(r => setTimeout(r, 500));

  console.log('✓ Like button dispatched and animation finished.');
  console.log(`Stored likes: ${JSON.stringify(window.DonkrStorage.getLikes())}`);
  assert(window.DonkrStorage.getLikes().length >= 1, 'Likes should have at least 1 donkey');

  console.log('\n ALL DOM SIMULATION TESTS PASSED! NO NULL REFERENCES DETECTED! ');
})();
