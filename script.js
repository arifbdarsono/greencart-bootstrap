// Dummy data produk
const products = [
  {
    id: "p1",
    name: "Smartphone Android",
    price: 2500000,
    img: "https://placehold.co/300x180/png?text=Android+Phone",
  },
  {
    id: "p2",
    name: "Headset Bluetooth",
    price: 350000,
    img: "https://placehold.co/300x180/png?text=Bluetooth+Headset",
  },
  {
    id: "p3",
    name: "Charger Cepat",
    price: 150000,
    img: "https://placehold.co/300x180/png?text=Fast+Charger",
  },
  {
    id: "p4",
    name: "Powerbank 10000mAh",
    price: 280000,
    img: "https://placehold.co/300x180/png?text=Powerbank",
  }
];

// Keranjang: objek dengan key id produk dan value detail qty dan harga
const cart = {};

const productListEl = document.getElementById("productList");
const cartSidebar = document.getElementById("cartSidebar");
const cartItemsList = document.getElementById("cartItemsList");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const orderWhatsAppBtn = document.getElementById("orderWhatsAppBtn");
const cartCountBadge = document.getElementById("cartCountBadge");

// Format angka ke Rupiah sederhana
function formatRupiah(num) {
  return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Render produk ke halaman
function renderProducts() {
  productListEl.innerHTML = "";
  products.forEach((p) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-3 product-card";

    col.innerHTML = `
      <div class="card h-100">
        <img src="${p.img}" alt="${p.name}" class="card-img-top" loading="lazy" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text fw-bold mb-3">${formatRupiah(p.price)}</p>
          <button class="btn btn-success mt-auto add-to-cart-btn" data-id="${p.id}">
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    `;
    productListEl.appendChild(col);
  });
}

// Render isi keranjang
function renderCart() {
  const ids = Object.keys(cart);
  cartItemsList.innerHTML = "";

  if (ids.length === 0) {
    cartItemsList.innerHTML = `<p class="text-center mt-4 text-muted">Keranjang kosong.</p>`;
  } else {
    ids.forEach((id) => {
      const item = cart[id];
      const row = document.createElement("div");
      row.className = "cart-item";

      row.innerHTML = `
        <span class="cart-item-name" title="${item.name}">${item.name}</span>
        <input type="number" min="1" value="${item.qty}" class="cart-item-qty form-control form-control-sm" data-id="${id}" aria-label="Jumlah ${item.name}" />
        <span class="cart-item-price">${formatRupiah(item.price * item.qty)}</span>
        <button class="btn btn-sm btn-outline-danger ms-2 remove-cart-btn" data-id="${id}" aria-label="Hapus ${item.name}">&times;</button>
      `;

      cartItemsList.appendChild(row);
    });
  }

  updateCartCount();
  updateOrderButton();
}

// Update badge jumlah item di tombol keranjang
function updateCartCount() {
  const totalQty = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  cartCountBadge.textContent = totalQty;
  cartCountBadge.style.display = totalQty > 0 ? "inline-block" : "none";
}

// Update tombol order whatsapp
function updateOrderButton() {
  orderWhatsAppBtn.disabled = Object.keys(cart).length === 0;
}

// Tambah produk ke keranjang
function addToCart(id) {
  if (cart[id]) {
    cart[id].qty++;
  } else {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    cart[id] = { ...product, qty: 1 };
  }
  renderCart();
  openCartSidebar();
}

// Remove produk dari keranjang
function removeFromCart(id) {
  if (cart[id]) {
    delete cart[id];
    renderCart();
  }
}

// Update kuantitas item di keranjang
function updateQty(id, qty) {
  if (qty < 1) return;
  if (cart[id]) {
    cart[id].qty = qty;
    renderCart();
  }
}

// Buka keranjang
function openCartSidebar() {
  cartSidebar.classList.add("open");
}

// Tutup keranjang
function closeCartSidebar() {
  cartSidebar.classList.remove("open");
}

// Event handler kirim order via WhatsApp
function orderViaWhatsApp() {
  const phoneNumber = "62895332782122"; // Ganti dengan nomor WhatsApp penerima tanpa + atau 0 di depan
  const ids = Object.keys(cart);
  if (ids.length === 0) return;

  let message = "Halo, saya ingin memesan produk:\n";
  ids.forEach((id) => {
    const item = cart[id];
    message += `- ${item.name} (x${item.qty}) - ${formatRupiah(item.price * item.qty)}\n`;
  });
  message += "\nTerima kasih.";

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// Event listeners
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const id = e.target.getAttribute("data-id");
    addToCart(id);
  }
  if (e.target.classList.contains("remove-cart-btn")) {
    const id = e.target.getAttribute("data-id");
    removeFromCart(id);
  }
});

cartItemsList.addEventListener("change", (e) => {
  if (e.target.classList.contains("cart-item-qty")) {
    const id = e.target.getAttribute("data-id");
    const qty = parseInt(e.target.value);
    if (!isNaN(qty)) updateQty(id, qty);
  }
});

openCartBtn.addEventListener("click", openCartSidebar);
closeCartBtn.addEventListener("click", closeCartSidebar);
orderWhatsAppBtn.addEventListener("click", orderViaWhatsApp);

// Inisialisasi tampilan
renderProducts();
renderCart();
