/* NexTech Store: shared functionality on all five pages. No external dependencies. */
document.addEventListener('DOMContentLoaded', () => {
  const search = document.querySelector('#productSearch');
  const filter = document.querySelector('#categoryFilter');
  const productCards = [...document.querySelectorAll('.product-card')];
  const productStatus = document.querySelector('#productStatus');

  // Function 1: Live product search.
  function searchProducts() { updateProducts(); }

  // Function 2: Category filtering (also cooperates with search).
  function filterByCategory() { updateProducts(); }

  function updateProducts() {
    if (!productCards.length) return;
    const query = (search?.value || '').trim().toLowerCase();
    const category = filter?.value || 'All';
    let visible = 0;
    productCards.forEach(card => {
      const matchesText = card.dataset.name.toLowerCase().includes(query);
      const matchesCategory = category === 'All' || card.dataset.category === category;
      card.hidden = !(matchesText && matchesCategory);
      if (!card.hidden) visible++;
    });
    if (productStatus) productStatus.textContent = visible === 0 ? 'No matching products found. Try a different search.' : `Showing ${visible} product${visible === 1 ? '' : 's'}.`;
  }
  search?.addEventListener('input', searchProducts);
  filter?.addEventListener('change', filterByCategory);
  const fromUrl = new URLSearchParams(location.search).get('category');
  if (filter && ['Laptops', 'Phones', 'Accessories'].includes(fromUrl)) { filter.value = fromUrl; filterByCategory(); }

  // Function 3: Demonstration cart. Uses localStorage only, never sends orders.
  const cartKey = 'nextech-demo-cart';
  function getCart() {
    try { const data = JSON.parse(localStorage.getItem(cartKey) || '[]'); return Array.isArray(data) ? data : []; }
    catch { return []; }
  }
  function saveCart(cart) { try { localStorage.setItem(cartKey, JSON.stringify(cart)); } catch {} }
  function renderCart() {
    const cart = getCart();
    const count = cart.reduce((n, item) => n + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(e => e.textContent = count);
    const cartList = document.querySelector('#cartItems');
    const total = document.querySelector('#cartTotal');
    if (!cartList) return;
    cartList.replaceChildren();
    if (!cart.length) { const li = document.createElement('li'); li.textContent = 'Your cart is empty.'; cartList.append(li); }
    cart.forEach(item => {
      const li = document.createElement('li');
      const label = document.createElement('span'); label.textContent = `${item.name} × ${item.qty} — $${(item.price * item.qty).toFixed(2)}`;
      const remove = document.createElement('button'); remove.className = 'remove-cart'; remove.type = 'button'; remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove one ${item.name}`);
      remove.addEventListener('click', () => manageCart('remove', item.name));
      li.append(label, remove); cartList.append(li);
    });
    if (total) total.textContent = `$${cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}`;
  }
  function manageCart(action, name, price = 0) {
    let cart = getCart();
    if (action === 'clear') cart = [];
    if (action === 'add') {
      const existing = cart.find(item => item.name === name);
      if (existing) existing.qty++; else cart.push({name, price, qty: 1});
    }
    if (action === 'remove') {
      const existing = cart.find(item => item.name === name);
      if (existing) { existing.qty--; if (existing.qty <= 0) cart = cart.filter(item => item.name !== name); }
    }
    saveCart(cart); renderCart();
    const message = document.querySelector('#cartMessage');
    if (message) message.textContent = action === 'add' ? `${name} added to demo cart.` : action === 'clear' ? 'Demo cart cleared.' : `${name} removed from demo cart.`;
  }
  document.querySelectorAll('.add-cart').forEach(button => button.addEventListener('click', () => manageCart('add', button.dataset.product, Number(button.dataset.price))));
  document.querySelector('#clearCart')?.addEventListener('click', () => manageCart('clear'));
  renderCart();

  // Function 4: Validate contact form locally (no server submission).
  function validateContactForm(event) {
    event.preventDefault();
    const fields = [
      ['contactName', 'nameError', v => v.trim().length >= 2, 'Please enter at least 2 characters for your name.'],
      ['contactEmail', 'emailError', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), 'Please enter a valid email address.'],
      ['contactMessage', 'messageError', v => v.trim().length >= 10, 'Please enter a message with at least 10 characters.']
    ];
    let valid = true;
    for (const [id, errorId, test, message] of fields) {
      const input = document.getElementById(id); const error = document.getElementById(errorId);
      const fieldValid = test(input.value);
      input.setAttribute('aria-invalid', String(!fieldValid));
      if (error) error.textContent = fieldValid ? '' : message;
      if (!fieldValid) valid = false;
    }
    const status = document.querySelector('#formStatus');
    if (status) status.textContent = valid ? 'Validation successful! This is a demo: your message has NOT been sent.' : 'Please correct the highlighted fields and try again.';
    if (!valid) document.querySelector('[aria-invalid="true"]')?.focus();
  }
  document.querySelector('#contactForm')?.addEventListener('submit', validateContactForm);

  // Function 5: Accessible expandable FAQ panels.
  function toggleFAQ(event) {
    const button = event.currentTarget;
    const answer = document.getElementById(button.getAttribute('aria-controls'));
    if (!answer) return;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    answer.hidden = expanded;
    const symbol = button.querySelector('span');
    if (symbol) symbol.textContent = expanded ? '+' : '−';
  }
  document.querySelectorAll('.faq-question').forEach(button => button.addEventListener('click', toggleFAQ));
  document.querySelectorAll('.year').forEach(node => node.textContent = new Date().getFullYear());
});
