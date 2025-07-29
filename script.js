// Dummy produk
const products = [
  {
    id: 1,
    name: "Smartphone Android X",
    price: 3500000,
    img: "https://placehold.co/300x200.png?text=Smartphone+Android+X",
    description: "Smartphone canggih dengan fitur terbaru."
  },
  {
    id: 2,
    name: "Smartwatch Android Fit",
    price: 1200000,
    img: "https://placehold.co/300x200.png?text=Smartwatch+Android+Fit",
    description: "Jam tangan pintar dengan berbagai fitur kesehatan."
  },
  {
    id: 3,
    name: "Wireless Earbuds Android",
    price: 700000,
    img: "https://placehold.co/300x200.png?text=Wireless+Earbuds+Android",
    description: "Earbuds nirkabel dengan suara jernih dan bass mantap."
  },
  {
    id: 4,
    name: "Tablet Android Pro",
    price: 4800000,
    img: "https://placehold.co/300x200.png?text=Tablet+Android+Pro",
    description: "Tablet performa tinggi untuk bekerja dan hiburan."
  }
];

// State keranjang
let cart = {};

// Format harga ke rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
}

// Rendering produk
function renderProducts() {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";
  products.forEach(prod => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-3";
    col.innerHTML = `
      <div class="card h-100 border-2">
        <a href="${prod.img}" class="glightbox" data-gallery="products" data-title="${prod.name}">
          <img src="${prod.img}" class="card-img-top" alt="${prod.name}" />
        </a>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.name}</h5>
          <p class="card-text flex-grow-1">${prod.description}</p>
          <p class="card-text fw-bold text-success">${formatRupiah(prod.price)}</p>
          <button class="btn btn-android mt-auto" onclick="addToCart(${prod.id})">Tambah ke Keranjang</button>
        </div>
      </div>
    `;
    productList.appendChild(col);
  });

  // Init Glightbox
  if(window.lightbox) lightbox.destroy();
  window.lightbox = GLightbox({ selector: '.glightbox' });
}

// Tambah ke keranjang
function addToCart(id) {
  if(cart[id]){
    cart[id].qty++;
  } else {
    const product = products.find(p => p.id === id);
    cart[id] = { ...product, qty: 1 };
  }
  renderCart();
}

// Hapus item dari keranjang
function removeFromCart(id) {
  if(cart[id]){
    cart[id].qty--;
    if(cart[id].qty <= 0){
      delete cart[id];
    }
    renderCart();
  }
}

// Render isi keranjang
function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const orderBtn = document.getElementById("order-btn");
  cartItems.innerHTML = "";
  const ids = Object.keys(cart);
  if(ids.length === 0){
    cartItems.innerHTML = "<li id='cart-empty'>Keranjang kosong</li>";
    document.getElementById("cart-total").textContent = formatRupiah(0);
    orderBtn.disabled = true;
    return;
  }

  let total = 0;
  ids.forEach(id => {
    const item = cart[id];
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.name}</span>
      <span>
        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${id})" title="Kurangi">-</button>
        <span class="qty">${item.qty}</span>
        <button class="btn btn-sm btn-outline-success" onclick="addToCart(${id})" title="Tambah">+</button>
      </span>
      <span>${formatRupiah(item.price * item.qty)}</span>
    `;
    li.classList.add("d-flex", "justify-content-between", "align-items-center", "mb-2");
    cartItems.appendChild(li);
  });

  document.getElementById("cart-total").textContent = formatRupiah(total);
  orderBtn.disabled = false;
}

// Kirim order via WhatsApp
function orderViaWhatsapp() {
  const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp tujuan (format internasional tanpa tanda +)
  const ids = Object.keys(cart);
  if(ids.length === 0) return alert("Keranjang kosong.");

  let message = "Halo, saya ingin memesan produk berikut:%0A";
  ids.forEach(id => {
    const item = cart[id];
    message += `- ${item.name} (qty: ${item.qty}) - ${formatRupiah(item.price * item.qty)}%0A`;
  });
  message += `Total: ${document.getElementById("cart-total").textContent}%0ASilakan konfirmasi lebih lanjut. Terima kasih!`;

  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank");
}

// Event listener pada tombol order
document.getElementById("order-btn").addEventListener("click", orderViaWhatsapp);

// Initial render
renderProducts();
renderCart();
