// src/pages/store.js
import { supabase } from '../supabase.js';

const CART_KEY = 'pawpatrol_cart_v1';
const TABS = ['browse', 'cart', 'pets', 'orders', 'account'];

const state = {
  customerId: null,
  customerData: null,
  products: [],
  pets: [],
  myPets: [],
  orders: [],
  cart: loadCart(),
  shopView: 'products',
  search: '',
  errors: {},
  checkingOut: false,
};

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const money = (n) =>
  '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  const date = new Date(d);
  return isNaN(date) ? '' : date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
};

function toast(message, type = 'info') {
  const container = $('#toasts');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'err' : ''}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function thumb(url, emoji) {
  return `<div class="thumb"><span class="ph" aria-hidden="true">${emoji}</span>${
    url ? `<img src="${esc(url)}" alt="" loading="lazy" />` : ''
  }</div>`;
}

function empty(emoji, title, text, actionHtml = '') {
  return `<div class="empty"><span class="big">${emoji}</span><strong>${esc(title)}</strong>${esc(text)}${actionHtml ? `<div style="margin-top:20px">${actionHtml}</div>` : ''}</div>`;
}

document.addEventListener('error', (e) => { if (e.target && e.target.tagName === 'IMG') e.target.remove(); }, true);

/* ---------- Identity & Profile ---------- */
async function resolveCustomerId() {
  try {
    const { data } = await supabase.auth.getSession();
    if (data && data.session && data.session.user) {
      const user = data.session.user;
      state.customerId = user.id;
      
      // Initial data galing sa Auth
      state.customerData = { 
        id: user.id, 
        name: user.user_metadata?.full_name || '', 
        email: user.email, 
        phone: '', 
        address: '' 
      };
      
      return user.id;
    }
  } catch (_) {}
  return null;
}

async function loadCustomerProfile() {
  if (!state.customerId) return;
  const { data, error } = await supabase.from('customers').select('*').eq('id', state.customerId).single();
  if (!error && data) {
    state.customerData = { ...state.customerData, ...data };
  }
}

/* ---------- Cart storage ---------- */
function loadCart() {
  try { const c = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(c) ? c : []; } catch (_) { return []; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch (_) {}
  const count = state.cart.reduce((s, l) => s + l.qty, 0);
  const badge = $('#cart-badge');
  if (badge) { badge.textContent = count; badge.hidden = count === 0; }
}
const lineKey = (l) => `${l.type}:${l.id}`;
const cartTotal = () => state.cart.reduce((s, l) => s + l.price * l.qty, 0);

/* ---------- Data loading ---------- */
async function loadProducts() {
  const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
  if (error) { state.errors.products = error.message; state.products = []; return; }
  state.errors.products = null; state.products = data || [];
}
async function loadPets() {
  const { data, error } = await supabase.from('pets').select('*').order('name', { ascending: true });
  if (error) { state.errors.pets = error.message; state.pets = []; return; }
  state.errors.pets = null;
  state.pets = (data || []).filter((p) => String(p.status || 'available').toLowerCase() === 'available');
}
async function loadMyPets() {
  if (!state.customerId) return;
  const { data, error } = await supabase.from('customer_pets').select('*').eq('owner_id', state.customerId).order('created_at', { ascending: false });
  if (error) { state.errors.myPets = error.message; state.myPets = []; return; }
  state.errors.myPets = null; state.myPets = data || [];
}
async function loadOrders() {
  if (!state.customerId) return;
  const { data, error } = await supabase.from('sales').select('*').eq('customer_id', state.customerId).order('created_at', { ascending: false });
  if (error) { state.errors.orders = error.message; state.orders = []; return; }
  state.errors.orders = null; state.orders = data || [];
}

/* ---------- Rendering ---------- */
function renderShop() {
  const grid = $('#shop-grid');
  if (!grid) return;
  const q = state.search.trim().toLowerCase();
  const isProducts = state.shopView === 'products';
  const err = isProducts ? state.errors.products : state.errors.pets;

  if (err) { grid.innerHTML = empty('⚠️', 'Could not load items', err); return; }

  if (isProducts) {
    const list = state.products.filter((p) => !q || `${p.name} ${p.category || ''}`.toLowerCase().includes(q));
    if (!list.length) { grid.innerHTML = empty('🦴', 'No products found', q ? 'Try a different search.' : 'Check back soon.'); return; }
    grid.innerHTML = list.map((p) => {
      const stock = Number(p.stock) || 0;
      const inCart = (state.cart.find((l) => l.type === 'product' && l.id === String(p.id)) || {}).qty || 0;
      const maxed = inCart >= stock;
      return `<article class="card glass">
        ${thumb(p.image_url, '🦴')}
        <div class="card-body">
          <div class="meta">${p.category ? `<span class="chip">${esc(p.category)}</span>` : ''}${
            stock <= 0 ? '<span class="chip warn">Out of stock</span>' : stock <= 5 ? `<span class="chip sun">Only ${stock} left</span>` : ''}</div>
          <h3>${esc(p.name)}</h3>
          <div class="card-foot">
            <span class="price">${money(p.price)}</span>
            <button class="btn primary sm" data-action="add" data-type="product" data-id="${esc(p.id)}" ${maxed ? 'disabled' : ''}>${stock <= 0 ? 'Sold out' : maxed ? 'In cart' : 'Add'}</button>
          </div>
        </div></article>`;
    }).join('');
  } else {
    const list = state.pets.filter((p) => !q || `${p.name} ${p.breed || ''}`.toLowerCase().includes(q));
    if (!list.length) { grid.innerHTML = empty('🐕', 'No pets available', q ? 'Try a different search.' : 'Check back soon.'); return; }
    grid.innerHTML = list.map((p) => {
      const inCart = state.cart.some((l) => l.type === 'pet' && l.id === String(p.id));
      return `<article class="card glass">
        ${thumb(p.image_url, '🐶')}
        <div class="card-body">
          <div class="meta">
            ${p.breed ? `<span class="chip">${esc(p.breed)}</span>` : ''}
            ${p.gender ? `<span class="chip sun">${esc(p.gender)}</span>` : ''}
          </div>
          <h3>${esc(p.name)}</h3>
          <div class="card-foot">
            <span class="price">${money(p.price)}</span>
            <button class="btn primary sm" data-action="add" data-type="pet" data-id="${esc(p.id)}" ${inCart ? 'disabled' : ''}>${inCart ? 'In cart' : 'Add'}</button>
          </div>
        </div></article>`;
    }).join('');
  }
}

function renderCart() {
  const list = $('#cart-list');
  const summary = $('#cart-summary');
  if (!list || !summary) return;

  if (!state.cart.length) {
    list.innerHTML = empty('🛒', 'Your cart is empty', 'Add food, toys or a new friend to get started.', '<button class="btn primary" data-tab="browse">Start shopping</button>');
    summary.hidden = true;
    return;
  }
  summary.hidden = false;

  list.innerHTML = state.cart.map((l) => {
    const isPet = l.type === 'pet';
    return `<div class="line glass">
      ${thumb(l.image_url, isPet ? '🐶' : '🦴')}
      <div class="line-info">
        <h3>${esc(l.name)}</h3>
        <span class="unit">${money(l.price)} each</span>
      </div>
      <div class="line-side">
        ${isPet ? '' : `<div class="qty">
          <button data-action="dec" data-key="${esc(lineKey(l))}">−</button>
          <span>${l.qty}</span>
          <button data-action="inc" data-key="${esc(lineKey(l))}">+</button>
        </div>`}
        <span class="line-total">${money(l.price * l.qty)}</span>
        <button class="btn ghost sm" data-action="remove" data-key="${esc(lineKey(l))}" style="color:var(--danger)">Remove</button>
      </div>
    </div>`;
  }).join('');

  summary.innerHTML = `
    <h2 style="font-family:var(--head);font-size:1.25rem;margin-bottom:14px">Order summary</h2>
    <div class="sum-row"><span>Items</span><span>${state.cart.reduce((s, l) => s + l.qty, 0)}</span></div>
    <div class="sum-row total"><span>Total</span><span>${money(cartTotal())}</span></div>
    <button class="btn primary block" data-action="checkout" style="margin-top:14px">Place order</button>
    <button class="btn ghost block" data-action="clear" style="margin-top:8px;color:var(--danger)">Clear cart</button>`;
}

function renderMyPets() {
  const box = $('#my-pets-list');
  if (!box) return;
  if (!state.myPets.length) { box.innerHTML = empty('🐾', 'No pets registered yet', 'Use the form to add your first pet.'); return; }
  box.innerHTML = state.myPets.map((p) => `
    <article class="card pet-card glass">
      <div class="thumb"><span class="ph">${/female/i.test(p.gender || '') ? '🐱' : '🐶'}</span></div>
      <div class="card-body">
        <h3>${esc(p.name)}</h3>
        <div class="meta">
          <span class="chip">${esc(p.breed)}</span>
          <span class="chip sun">${esc(p.gender)}</span>
        </div>
        <div class="card-foot">
          <button class="btn ghost sm" data-action="delete-pet" data-id="${esc(p.id)}" style="color:var(--danger)">Remove</button>
        </div>
      </div>
    </article>`).join('');
}

function renderOrders() {
  const box = $('#orders-list');
  if (!box) return;
  
  if (!state.orders.length) {
    box.innerHTML = empty('📦', 'No orders yet', 'Once you place an order it will show up here.');
    return;
  }

  box.innerHTML = state.orders.map((o) => {
    const orderDate = o.created_at || o.sold_at;
    const dateStr = orderDate ? new Date(orderDate).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now';
    
    let items = o.items;
    if (typeof items === 'string') { try { items = JSON.parse(items); } catch (_) { items = []; } }
    if (!Array.isArray(items)) items = [];

    let itemsHtml = '';
    if (items.length > 0) {
        itemsHtml = `<ul style="margin-top: 15px; border-top: 1px solid var(--border); padding-top: 15px; list-style:none; padding-left:0">
            ${items.map(i => `
                <li style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px; padding: 8px 0; border-bottom: none;">
                    <img src="${i.image_url || 'https://placehold.co/40x40/e2e8f0/718096?text=Img'}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border);">
                    <div style="flex: 1;">
                        <span style="font-weight: 600; display: block; font-size: 0.95rem;">${esc(i.name)}</span>
                        <span style="font-size: 0.85rem; color: var(--muted);">${esc(i.qty)} × ${money(i.price)}</span>
                    </div>
                    <span style="font-weight: 700;">${money(i.qty * i.price)}</span>
                </li>
            `).join('')}
        </ul>`;
    }

    return `
    <article class="order glass" style="padding: 24px; display: block;">
      <div class="order-head">
        <span class="id" style="font-weight:700;">Order #${esc(String(o.id).slice(0, 8).toUpperCase())}</span>
        <span class="chip">${esc(o.status || 'Processing')}</span>
        <span class="date">${esc(dateStr)}</span>
      </div>
      
      ${itemsHtml}

      <div class="order-total" style="margin-top: 16px; border-top: 1px solid var(--border); display:flex; justify-content:space-between; font-weight:700;">
        <span>Total</span>
        <span>${money(o.total)}</span>
      </div>
    </article>`;
  }).join('');
}

function renderAccount() {
  if (!state.customerData) return;
  
  // 1. I-update ang header profile
  const nameEl = $('#account-name');
  const emailEl = $('#account-email');
  if (nameEl) nameEl.textContent = state.customerData.name || 'Guest User';
  if (emailEl) emailEl.textContent = state.customerData.email || 'Not logged in';
  
  // 2. I-populate ang form fields
  const nameInput = $('#profile-name');
  const emailInput = $('#profile-email');
  const phoneInput = $('#profile-phone');
  const addressInput = $('#profile-address');
  
  if (nameInput) nameInput.value = state.customerData.name || '';
  if (emailInput) emailInput.value = state.customerData.email || '';
  if (phoneInput) phoneInput.value = state.customerData.phone || '';
  if (addressInput) addressInput.value = state.customerData.address || '';
}

/* ---------- Actions ---------- */
function addToCart(type, id) {
  const source = (type === 'pet' ? state.pets : state.products).find((x) => String(x.id) === String(id));
  if (!source) return toast('Item unavailable.', 'error');
  
  const key = `${type}:${id}`;
  const line = state.cart.find((l) => lineKey(l) === key);

  if (line) {
    if (type !== 'pet') line.qty += 1;
  } else {
    state.cart.push({ type, id: String(source.id), name: source.name, price: Number(source.price) || 0, qty: 1, image_url: source.image_url || '' });
  }

  saveCart(); renderCart(); renderShop();
  toast(`${source.name} added to cart.`, 'success');
}

function changeQty(key, delta) {
  const line = state.cart.find((l) => lineKey(l) === key);
  if (!line) return;
  const next = line.qty + delta;
  if (next < 1) { removeLine(key); return; }
  line.qty = next;
  saveCart(); renderCart(); renderShop();
}

function removeLine(key) {
  state.cart = state.cart.filter((l) => lineKey(l) !== key);
  saveCart(); renderCart(); renderShop();
}

function clearCart() {
  state.cart = [];
  saveCart(); renderCart(); renderShop();
}

/* ---------- Checkout ---------- */
function showCheckoutModal() {
  if (state.checkingOut || !state.cart.length) return;
  const modal = $('#checkout-modal');
  if (!modal) return;
  $('#checkout-total').textContent = cartTotal().toFixed(2);
  
  if (state.customerData) {
    $('#checkout-name').value = state.customerData.name || '';
    $('#checkout-phone').value = state.customerData.phone || '';
    $('#checkout-address').value = state.customerData.address || '';
  }
  
  modal.classList.add('show');
  modal.style.display = 'grid';
}

async function processOrder(event) {
  event.preventDefault();
  const btn = $('#confirm-order-btn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Processing...';

  const name = $('#checkout-name').value;
  const phone = $('#checkout-phone').value;
  const address = $('#checkout-address').value;
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const payload = state.cart.map((l) => ({ type: l.type, id: l.id, qty: l.qty }));

  try {
    const { error } = await supabase.rpc('checkout_order', { 
      p_customer_id: state.customerId, 
      p_items: payload 
    });
    if (error) throw error;

    if (state.customerId) {
      await supabase.from('customers').upsert({ 
        id: state.customerId,
        name, 
        phone, 
        address,
        email: state.customerData.email
      });
    }

    state.cart = [];
    saveCart();
    toast(`Order placed via ${payment}! Thank you, ${name}.`, 'success');
    
    await Promise.all([loadProducts(), loadPets(), loadOrders()]);
    renderShop(); renderOrders(); renderCart();
    
    const modal = $('#checkout-modal');
    modal.classList.remove('show');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
    $('#checkout-form').reset();
    setTab('orders');

  } catch (err) {
    toast(err.message || 'Checkout failed.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function submitProfile(e) {
  e.preventDefault();
  const btn = $('#save-profile-btn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const name = $('#profile-name').value.trim();
  const phone = $('#profile-phone').value.trim();
  const address = $('#profile-address').value.trim();

  if (!name || !phone || !address) {
    toast('Please fill all fields.', 'error');
    btn.disabled = false;
    btn.textContent = originalText;
    return;
  }

  try {
    if (state.customerId) {
      const { error } = await supabase.from('customers').upsert({ 
        id: state.customerId,
        name: name,
        phone: phone,
        address: address,
        email: state.customerData.email
      });
      if (error) throw error;
      
      // I-update ang local state
      state.customerData.name = name;
      state.customerData.phone = phone;
      state.customerData.address = address;
      
      toast('Profile updated successfully!', 'success');
      renderAccount();
    }
  } catch (err) {
    toast(err.message || 'Failed to update profile.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function submitPet(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const fd = new FormData(form);
  const name = String(fd.get('name') || '').trim();
  const breed = String(fd.get('breed') || '').trim();
  const age = Number(fd.get('age'));
  const gender = String(fd.get('gender') || '');
  if (!name || !breed || !gender) return toast('Please fill all fields.', 'error');

  const { error } = await supabase.from('customer_pets').insert({ owner_id: state.customerId, name, breed, age, gender });
  if (error) { toast(error.message, 'error'); return; }
  form.reset();
  toast(`${name} has been registered.`, 'success');
  await loadMyPets();
  renderMyPets();
}

async function deletePet(id) {
  const { error } = await supabase.from('customer_pets').delete().eq('id', id).eq('owner_id', state.customerId);
  if (error) { toast(error.message, 'error'); return; }
  toast('Pet removed.', 'success');
  await loadMyPets();
  renderMyPets();
}

/* ---------- Tabs ---------- */
function setTab(name) {
  if (!TABS.includes(name)) name = 'browse';
  $$('.side-nav a').forEach((a) => a.classList.toggle('active', a.dataset.tab === name));
  TABS.forEach((t) => { 
    const panel = $(`#panel-${t}`);
    if (panel) panel.hidden = t !== name; 
  });
  if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
  window.scrollTo({ top: 0 });
}

/* ---------- Events ---------- */
function bindEvents() {
  document.addEventListener('click', (e) => {
    const navLink = e.target.closest('[data-tab], [data-goto]');
    if (navLink) {
      e.preventDefault();
      setTab(navLink.dataset.tab || navLink.dataset.goto);
      return;
    }

    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const { action, type, id, key } = el.dataset;

    if (action === 'add') addToCart(type, id);
    else if (action === 'inc') changeQty(key, 1);
    else if (action === 'dec') changeQty(key, -1);
    else if (action === 'remove') removeLine(key);
    else if (action === 'clear') clearCart();
    else if (action === 'checkout') showCheckoutModal(); 
    else if (action === 'delete-pet') deletePet(id);
  });

  const shopSwitch = $('#shop-switch');
  if (shopSwitch) {
    shopSwitch.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      state.shopView = btn.dataset.view;
      $$('.seg-btn').forEach((b) => b.classList.toggle('active', b === btn));
      renderShop();
    });
  }

  const search = $('#search');
  if (search) search.addEventListener('input', (e) => { state.search = e.target.value; renderShop(); });

  const petForm = $('#pet-form');
  if (petForm) petForm.addEventListener('submit', submitPet);

  const accountForm = $('#account-form');
  if (accountForm) accountForm.addEventListener('submit', submitProfile);

  const logoutBtn = $('#btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.replace("/customer-login.html");
    });
  }

  const closeCheckout = $('#close-checkout');
  if (closeCheckout) {
    closeCheckout.addEventListener('click', () => {
      const modal = $('#checkout-modal');
      modal.classList.remove('show');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    });
  }

  const checkoutForm = $('#checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', processOrder);
  }
}

/* ---------- INIT ---------- */
export async function initStorePage() {
  const container = document.querySelector('.page');
  if (!container) return;

  bindEvents();
  setTab(location.hash.replace('#', '') || 'browse');
  saveCart();

  const grid = $('#shop-grid');
  if (grid) grid.innerHTML = empty('🐾', 'Fetching goodies…', '');
  
  state.customerId = await resolveCustomerId();
  
  // I-load ang totoong profile data mula sa database
  await loadCustomerProfile();

  await Promise.all([loadProducts(), loadPets(), loadMyPets(), loadOrders()]);

  renderShop(); 
  renderCart(); 
  renderMyPets(); 
  renderOrders();
  renderAccount();
}