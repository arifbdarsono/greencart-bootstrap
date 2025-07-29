// Dummy data produk
const products = [
  {
    id: 1,
    name: "Produk A",
    price: 100000,
    image: "https://placehold.co/600x400?text=Produk+A"
  },
  {
    id: 2,
    name: "Produk B",
    price: 150000,
    image: "https://placehold.co/600x400?text=Produk+B"
  },
  {
    id: 3,
    name: "Produk C",
    price: 200000,
    image: "https://placehold.co/600x400?text=Produk+C"
  },
  {
    id: 4,
    name: "Produk D",
    price: 120000,
    image: "https://placehold.co/600x400?text=Produk+D"
  }
];

// Keranjang belanja (object dengan id produk sebagai key)
let cart = {};

// Elemen DOM
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const orderBtn = document.getElementById("orderBtn");
const cartSidebar = document.getElementById("cartSidebar");
const cartToggleBtn = document.getElementById("cartToggleBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const cartItemsMobile = document.getElementById("cart-items-mobile");
const cartTotalMobile = document.getElementById("cart-total-mobile");
const orderBtnMobile = document.getElementById("orderBtnMobile");
const cartCountMobile = document.getElementById("cart-count-mobile");

// Nomor WhatsApp tujuan (isi dengan nomor Anda, tanpa tanda + atau spasi)
const waNumber = "6281234567890";

// Fungsi utilitas format rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(number);
}

// Inisialisasi Glightbox
const lightbox = GLightbox({
  selector: ".glightbox"
});

// Render daftar produk
function renderProducts() {
  products.forEach(product => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
    col.innerHTML = `
      <div class="card product-card h-100 shadow-sm">
        <a href="${product.image}" class="glightbox" data-gallery="products" title="${product.name}">
          <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy" />
        </a>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-success fw-bold">${formatRupiah(product.price)}</p>
          <button class="btn btn-success mt-auto" data-id="${product.id}">Tambah ke Keranjang</button>
        </div>
      </div>
    `;
    productList.appendChild(col);
  });

  // Setelah elemen dibuat, inisialisasi ulang lightbox
  lightbox.reload();

  // Tambah event listener tombol
  document.querySelectorAll(".btn-success[data-id]").forEach(button => {
    button.addEventListener("click", () => {
      addToCart(parseInt(button.dataset.id));
    });
  });
}

// Tambah produk ke keranjang
function addToCart(productId) {
  if (cart[productId]) {
    cart[productId].qty += 1;
  } else {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    cart[productId] = { ...product, qty: 1 };
  }
  updateCartUI();
}

// Hapus 1 qty produk dari keranjang
function removeFromCart(productId) {
  if (!cart[productId]) return;
  cart[productId].qty -= 1;
  if (cart[productId].qty <= 0) {
    delete cart[productId];
  }
  updateCartUI();
}

// Hapus produk sepenuhnya dari keranjang
function deleteFromCart(productId) {
  if (!cart[productId]) return;
  delete cart[productId];
  updateCartUI();
}

// Update tampilan keranjang
function updateCartUI() {
  // Update desktop sidebar
  cartItems.innerHTML = "";
  let total = 0;
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    cartItems.innerHTML = "<p>Keranjang kosong</p>";
    orderBtn.disabled = true;
  } else {
    ids.forEach(id => {
      const item = cart[id];
      total += item.price * item.qty;

      const itemDiv = document.createElement("div");
      itemDiv.className = "cart-item";

      itemDiv.innerHTML = `
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" aria-label="Kurangi jumlah" data-action="minus" data-id="${id}">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" aria-label="Tambah jumlah" data-action="plus" data-id="${id}">+</button>
        </div>
        <div class="cart-item-price">${formatRupiah(item.price * item.qty)}</div>
      `;

      cartItems.appendChild(itemDiv);
    });
    orderBtn.disabled = false;
  }
  cartTotal.textContent = formatRupiah(total);

  // Update mobile drawer
  cartItemsMobile.innerHTML = cartItems.innerHTML;
  cartTotalMobile.textContent = formatRupiah(total);
  orderBtnMobile.disabled = orderBtn.disabled;

  // Update mobile cart count badge
  let count = 0;
  ids.forEach(id => { count += cart[id].qty; });
  cartCountMobile.textContent = count;
}

// Event delegation tombol qty di keranjang desktop
cartItems.addEventListener("click", e => {
  if (e.target.classList.contains("qty-btn")) {
    const id = e.target.dataset.id;
    if (e.target.dataset.action === "plus") {
      addToCart(parseInt(id));
    } else if (e.target.dataset.action === "minus") {
      removeFromCart(id);
    }
  }
});

// Event delegation tombol qty di keranjang mobile
cartItemsMobile.addEventListener("click", e => {
  if (e.target.classList.contains("qty-btn")) {
    const id = e.target.dataset.id;
    if (e.target.dataset.action === "plus") {
      addToCart(parseInt(id));
    } else if (e.target.dataset.action === "minus") {
      removeFromCart(id);
    }
  }
});

// Tombol order via WhatsApp (desktop)
orderBtn.addEventListener("click", () => {
  sendOrderViaWhatsApp();
});

// Tombol order via WhatsApp (mobile)
orderBtnMobile.addEventListener("click", () => {
  sendOrderViaWhatsApp();
});

// Kirim order via WhatsApp
function sendOrderViaWhatsApp() {
  const ids = Object.keys(cart);
  if (ids.length === 0) return alert("Keranjang belanja masih kosong!");

  let message = "Halo, saya ingin memesan produk:\n";
  ids.forEach(id => {
    const item = cart[id];
    message += `- ${item.name} (x${item.qty}) - ${formatRupiah(item.price * item.qty)}\n`;
  });
  message += `Total: ${formatRupiah(
    ids.reduce((sum, id) => sum + cart[id].price * cart[id].qty, 0)
  )}\n\nTerima kasih!`;

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank");
}

// Toggle keranjang drawer mobile
cartToggleBtn.addEventListener("click", () => {
  cartDrawer.classList.add("open");
});

cartCloseBtn.addEventListener("click", () => {
  cartDrawer.classList.remove("open");
});

// Inisialisasi produk dan keranjang saat halaman siap
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();
});
