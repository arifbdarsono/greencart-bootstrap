const products = [
  {
    id: 1,
    name: "Produk A",
    price: 50000,
    img: "https://placehold.co/300x200/png?text=Product",
  },
  {
    id: 2,
    name: "Produk B",
    price: 75000,
    img: "https://placehold.co/300x200/png?text=Product",
  },
  {
    id: 3,
    name: "Produk C",
    price: 100000,
    img: "https://placehold.co/300x200/png?text=Product",
  },
];

const cart = {};

const productListEl = document.getElementById("productList");
const cartSidebar = document.getElementById("cartSidebar");
const cartToggleBtn = document.getElementById("cartToggleBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsList = document.getElementById("cartItemsList");
const cartCountBadge = document.getElementById("cartCountBadge");
const orderWhatsAppBtn = document.getElementById("orderWhatsAppBtn");
const cartTotalPriceEl = document.getElementById("cartTotalPrice");

// Fungsi format mata uang Indonesia Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

function renderProducts() {
  productListEl.innerHTML = "";
  products.forEach((product) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";
    col.innerHTML = `
      <div class="card product-card h-100 shadow-sm">
        <img src="${product.img}" alt="${product.name}" class="card-img-top" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-success fw-bold">${formatRupiah(product.price)}</p>
          <button class="btn btn-success mt-auto add-to-cart-btn" data-id="${product.id}">
            <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
          </button>
        </div>
      </div>
    `;
    productListEl.appendChild(col);
  });
}

function renderCart() {
  cartItemsList.innerHTML = "";
  let totalPrice = 0;
  let totalQty = 0;
  for (const [id, item] of Object.entries(cart)) {
    totalPrice += item.price * item.qty;
    totalQty += item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-name">${item.name}</div>
      <input
        type="number"
        min="1"
        max="99"
        value="${item.qty}"
        class="form-control form-control-sm cart-item-qty"
        data-id="${id}"
        aria-label="Jumlah ${item.name}"
      />
      <div class="cart-item-price text-success">${formatRupiah(item.price * item.qty)}</div>
      <button class="btn btn-sm btn-outline-danger" aria-label="Hapus ${item.name}" data-id="${id}">
        <i class="fas fa-trash"></i>
      </button>
    `;
    cartItemsList.appendChild(div);
  }

  cartCountBadge.textContent = totalQty;
  if (totalQty === 0) {
    cartCountBadge.style.display = "none";
    orderWhatsAppBtn.disabled = true;
    orderWhatsAppBtn.setAttribute("aria-disabled", "true");
  } else {
    cartCountBadge.style.display = "inline-block";
    orderWhatsAppBtn.disabled = false;
    orderWhatsAppBtn.removeAttribute("aria-disabled");
  }

  cartTotalPriceEl.textContent = formatRupiah(totalPrice);
}

function addToCart(id) {
  const product = products.find((p) => p.id == id);
  if (!product) return;

  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = { ...product, qty: 1 };
  }
  renderCart();
}

function updateQty(id, qty) {
  if (!cart[id]) return;
  qty = Math.max(1, Math.min(99, qty));
  cart[id].qty = qty;
  renderCart();
}

function removeFromCart(id) {
  if (!cart[id]) return;
  delete cart[id];
  renderCart();
}

// Kirim pesan order via WhatsApp
function sendOrderWhatsApp() {
  const items = Object.values(cart).map(
    (item) => `${item.name} x${item.qty} = ${formatRupiah(item.price * item.qty)}`
  );
  const total = cartTotalPriceEl.textContent;
  let message = "Halo, saya ingin memesan produk berikut:%0A";
  message += items.join("%0A");
  message += `%0ATotal Belanja: ${total}`;
  const waUrl = `https://wa.me/?text=${message}`;
  window.open(waUrl, "_blank");
}

// Event listeners
productListEl.addEventListener("click", (e) => {
  if (e.target.closest(".add-to-cart-btn")) {
    const id = e.target.closest(".add-to-cart-btn").dataset.id;
    addToCart(id);
  }
});

cartToggleBtn.addEventListener("click", () => {
  cartSidebar.classList.add("open");
});

closeCartBtn.addEventListener("click", () => {
  cartSidebar.classList.remove("open");
});

cartItemsList.addEventListener("input", (e) => {
  if (e.target.classList.contains("cart-item-qty")) {
    const id = e.target.dataset.id;
    const qty = parseInt(e.target.value, 10);
    if (!isNaN(qty)) updateQty(id, qty);
  }
});

cartItemsList.addEventListener("click", (e) => {
  if (e.target.closest("button")) {
    const id = e.target.closest("button").dataset.id;
    if (id) removeFromCart(id);
  }
});

orderWhatsAppBtn.addEventListener("click", sendOrderWhatsApp);

// Inisialisasi tampilan
renderProducts();
renderCart();
