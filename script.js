const products = [
  { id: 1, title: "Aurora Wireless Headphones", category: "Electronics", price: 89.99, rating: 4.7, image: "assets/headphones.svg" },
  { id: 2, title: "Stride Running Shoes", category: "Fashion", price: 59.99, rating: 4.5, image: "assets/shoes.svg" },
  { id: 3, title: "BrewMaster Coffee Maker", category: "Home", price: 74.99, rating: 4.6, image: "assets/coffee-maker.svg" },
  { id: 4, title: "Smart Fitness Watch", category: "Electronics", price: 129.0, rating: 4.8, image: "assets/watch.svg" },
  { id: 5, title: "Comfy Lounge Chair", category: "Home", price: 149.5, rating: 4.4, image: "assets/chair.svg" },
  { id: 6, title: "Classic Denim Jacket", category: "Fashion", price: 69.5, rating: 4.3, image: "assets/jacket.svg" }
];

const state = {
  search: "",
  category: "all",
  sort: "featured",
  cart: JSON.parse(localStorage.getItem("novacart-cart") || "[]")
};

const productGrid = document.getElementById("productGrid");
const template = document.getElementById("productCardTemplate");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const shippingEl = document.getElementById("shipping");
const grandTotalEl = document.getElementById("grandTotal");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function getFilteredProducts() {
  const query = state.search.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
    const matchesCategory = state.category === "all" || product.category === state.category;
    return matchesSearch && matchesCategory;
  });

  switch (state.sort) {
    case "priceAsc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "priceDesc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return filtered;
}

function renderProducts() {
  productGrid.innerHTML = "";
  const filteredProducts = getFilteredProducts();

  if (!filteredProducts.length) {
    productGrid.innerHTML = `<p>No products found. Try a different search or filter.</p>`;
    return;
  }

  filteredProducts.forEach((product) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".product-image").src = product.image;
    clone.querySelector(".product-image").alt = product.title;
    clone.querySelector(".product-title").textContent = product.title;
    clone.querySelector(".product-category").textContent = product.category;
    clone.querySelector(".product-rating").textContent = `⭐ ${product.rating}`;
    clone.querySelector(".product-price").textContent = formatCurrency(product.price);
    clone.querySelector(".add-to-cart").addEventListener("click", () => addToCart(product.id));
    productGrid.appendChild(clone);
  });
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ productId, quantity: 1 });
  }
  persistCart();
  renderCart();
}

function updateCart(productId, delta) {
  const item = state.cart.find((cartItem) => cartItem.productId === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((cartItem) => cartItem.productId !== productId);
  }
  persistCart();
  renderCart();
}

function calculateTotals() {
  const subtotal = state.cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const promo = document.getElementById("promoCode").value.trim().toUpperCase();
  const discount = promo === "SAVE10" ? subtotal * 0.1 : 0;
  const shipping = subtotal > 0 && subtotal < 100 ? 7.5 : 0;
  const total = subtotal - discount + shipping;

  return { subtotal, discount, shipping, total };
}

function renderTotals() {
  const totals = calculateTotals();
  subtotalEl.textContent = formatCurrency(totals.subtotal);
  discountEl.textContent = `- ${formatCurrency(totals.discount)}`;
  shippingEl.textContent = formatCurrency(totals.shipping);
  grandTotalEl.textContent = formatCurrency(totals.total);
}

function renderCart() {
  cartItems.innerHTML = "";

  state.cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${product.title}</strong><br>
      ${formatCurrency(product.price)} x ${item.quantity}
    `;

    const decreaseButton = document.createElement("button");
    decreaseButton.className = "ghost-btn";
    decreaseButton.textContent = "−";
    decreaseButton.addEventListener("click", () => updateCart(product.id, -1));

    const increaseButton = document.createElement("button");
    increaseButton.className = "ghost-btn";
    increaseButton.textContent = "+";
    increaseButton.addEventListener("click", () => updateCart(product.id, 1));

    li.appendChild(document.createElement("br"));
    li.appendChild(decreaseButton);
    li.appendChild(increaseButton);
    cartItems.appendChild(li);
  });

  cartCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  renderTotals();
}

function persistCart() {
  localStorage.setItem("novacart-cart", JSON.stringify(state.cart));
}

function setupFilters() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(products.map((product) => product.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderProducts();
  });

  document.getElementById("sortFilter").addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });
}

function setupCartControls() {
  document.getElementById("cartToggle").addEventListener("click", () => {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
  });

  document.getElementById("closeCart").addEventListener("click", () => {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
  });

  document.getElementById("clearCart").addEventListener("click", () => {
    state.cart = [];
    persistCart();
    renderCart();
  });

  document.getElementById("promoCode").addEventListener("input", renderTotals);
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("novacart-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    localStorage.setItem("novacart-theme", dark ? "dark" : "light");
    themeToggle.textContent = dark ? "☀️" : "🌙";
  });
}

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  checkoutMessage.className = "status-msg";

  if (!state.cart.length) {
    checkoutMessage.classList.add("error");
    checkoutMessage.textContent = "Your cart is empty. Please add at least one product.";
    return;
  }

  if (!checkoutForm.checkValidity()) {
    checkoutMessage.classList.add("error");
    checkoutMessage.textContent = "Please complete all required checkout fields correctly.";
    checkoutForm.reportValidity();
    return;
  }

  const orderId = `NC-${Date.now().toString().slice(-6)}`;
  const total = calculateTotals().total;
  checkoutMessage.classList.add("success");
  checkoutMessage.textContent = `Order ${orderId} placed successfully. Charged ${formatCurrency(total)}.`;
  state.cart = [];
  persistCart();
  renderCart();
  checkoutForm.reset();
});

setupFilters();
setupCartControls();
setupTheme();
renderProducts();
renderCart();
