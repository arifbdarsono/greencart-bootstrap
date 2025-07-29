// Dummy product data
const products = [
  { id: 1, name: "Produk A", price: 25000, image: "https://placehold.co/300x180?text=Produk+A" },
  { id: 2, name: "Produk B", price: 50000, image: "https://placehold.co/300x180?text=Produk+B" },
  { id: 3, name: "Produk C", price: 75000, image: "https://placehold.co/300x180?text=Produk+C" }
];

// Penyimpanan keranjang dalam objek { productId: { id, name, price, qty } }
let cart = {};

// Helper: Format angka ke rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
}

// Render produk ke halaman
function renderProducts() {
  const productListEl = document.getElementById("productList");
  productListEl.innerHTML = "";
  products.forEach(product => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-4";

    col.innerHTML = `
      <div class="card product-card shadow-sm">
        <img src="${product.image}" alt="${product.name}" class="card-img-top" />
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${formatRupiah(product.price)}</p>
          <button class="btn btn-success w-100" data-id="${product.id}"><i class="fa fa-cart-plus"></i> Tambah ke Keranjang</button>
        </div>
      </div>
    `;

    productListEl.appendChild(col);
  });
}

// Render keranjang belanja
function renderCart() {
  const cartItemsList = document.getElementById("cartItemsList");
  cartItemsList.innerHTML = "";

  const itemIds = Object.keys(cart);
  if (itemIds.length === 0) {
    cartItemsList.innerHTML = '<p class="text-center text-muted">Keranjang kosong</p>';
    document.getElementById("orderWhatsAppBtn").disabled = true;
    updateCartBadge();
    updateTotal();
    return;
  }

  itemIds.forEach(id => {
    const item = cart[id];
    const cartItemEl = document.createElement("div");
    cartItemEl.className = "cart-item d-flex align-items-center";

    cartItemEl.innerHTML = `
      <img src="${products.find(p => p.id == id).image}" alt="${item.name}" width="48" height="48" style="border-radius:0.375rem; object-fit:cover;" />
      <div class="cart-item-name ms-2">${item.name}</div>
      <div class="cart-item-qty">
        <input type="number" min="1" max="99" value="${item.qty}" data-id="${id}" aria-label="Jumlah ${item.name}" />
      </div>
      <div class="cart-item-price ms-3">${formatRupiah(item.price * item.qty)}</div>
      <button class="btn btn-link text-danger p-0 ms-3 remove-item-btn" data-id="${id}" aria-label="Hapus ${item.name}"><i class="fa fa-trash"></i></button>
    `;

    cartItemsList.appendChild(cartItemEl);
  });

  document.getElementById("orderWhatsAppBtn").disabled = false;
  updateCartBadge();
  updateTotal();

  // Tambah event listener untuk mengubah qty
  const qtyInputs = cartItemsList.querySelectorAll("input[type=number]");
  qtyInputs.forEach(input => {
    input.addEventListener("change", onQtyChange);
  });

  // Event hapus item
  const removeBtns = cartItemsList.querySelectorAll(".remove-item-btn");
  removeBtns.forEach(btn => {
    btn.addEventListener("click", onRemoveItem);
  });
}

// Update total harga di footer keranjang
function updateTotal() {
  const totalEl = document.getElementById("cartTotal");
  const total = Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
  totalEl.textContent = formatRupiah(total);
}

// Update badge jumlah item di tombol keranjang
function updateCartBadge() {
  const badgeEl = document.getElementById("cartBadge");
  const totalQty = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  if (totalQty > 0) {
    badgeEl.textContent = totalQty;
    badgeEl.style.display = "inline-block";
  } else {
    badgeEl.style.display = "none";
  }
}

// Fungsi handle perubahan qty input
function onQtyChange(e) {
  const input = e.target;
  let newQty = parseInt(input.value);
  if (isNaN(newQty) || newQty < 1) newQty = 1;
  if (newQty > 99) newQty = 99;
  input.value = newQty;

  const id = input.dataset.id;
  if (cart[id]) {
    cart[id].qty = newQty;
  }
  renderCart();
}

// Fungsi menghapus item dari keranjang
function onRemoveItem(e) {
  const id = e.currentTarget.dataset.id;
  if (cart[id]) {
    delete cart[id];
  }
  renderCart();
}

// Tambah produk ke keranjang
function addToCart(id) {
  const product = products.find(p => p.id == id);
  if (!product) return;

  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = {
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1
    };
  }
  renderCart();
  openCart();
}

// Buka dan tutup keranjang drawer
const cartSidebar = document.getElementById("cartSidebar");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");

function openCart() {
  cartSidebar.classList.add("open");
}

function closeCart() {
  cartSidebar.classList.remove("open");
}

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);

// Tombol order via WhatsApp
const orderBtn = document.getElementById("orderWhatsAppBtn");
orderBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) return;

  let message = "Halo, saya ingin memesan produk:\n";
  Object.keys(cart).forEach(id => {
    const item = cart[id];
    message += `- ${item.name} (x${item.qty}) - ${formatRupiah(item.price * item.qty)}\n`;
  });
  message += `Total: ${formatRupiah(Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0))}\n\nTerima kasih.`;

  // Ganti nomor di bawah dengan nomor WhatsApp tujuan Anda (dengan kode negara tanpa tanda +)
  const phoneNumber = "6281234567890";

  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank");
});

// Inisialisasi render produk dan keranjang
renderProducts();
renderCart();

// Delegasi event klik tombol tambah ke keranjang
document.getElementById("productList").addEventListener("click", e => {
  if (e.target.closest("button[data-id]")) { 
    const id = e.target.closest("button[data-id]").dataset.id;
    addToCart(id);
  }
});
