(() => {
  "use strict";

  // Dummy produk - image dari unsplash, harga dalam IDR
  const products = [
    {
      id: 1,
      name: "Kaos Hijau Muda",
      price: 95000,
      img: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=400&q=80",
      description: "Kaos dengan warna hijau muda cerah dan nyaman dipakai."
    },
    {
      id: 2,
      name: "Topi Baseball Hijau",
      price: 75000,
      img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
      description: "Topi model baseball dengan warna hijau muda stylish."
    },
    {
      id: 3,
      name: "Tas Selempang Kecil",
      price: 120000,
      img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80",
      description: "Tas kecil selempang yang praktis dan modis."
    },
    {
      id: 4,
      name: "Sepatu Sneakers Hijau",
      price: 230000,
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
      description: "Sepatu sneakers nyaman dengan detail hijau muda."
    }
  ];

  // Format angka ke Rupiah
  function formatRupiah(angka) {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Elemen utama
  const productsGrid = document.getElementById("productsGrid");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartItemsContainerMobile = document.getElementById("cartItemsContainerMobile");
  const orderBtn = document.getElementById("orderBtn");
  const orderBtnMobile = document.getElementById("orderBtnMobile");
  const cartSidebar = document.getElementById("cartSidebar");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartToggleBtn = document.getElementById("cartToggleBtn");
  const cartCloseBtn = document.getElementById("cartCloseBtn");

  // Keranjang dalam format object { productId: { ...produk, qty: number } }
  let cart = {};

  // Render produk ke dalam grid
  function renderProducts() {
    productsGrid.innerHTML = "";
    products.forEach(prod => {
      // Kartu produk dengan Glightbox linked image
      const col = document.createElement("div");
      col.className = "col-6 col-md-4";

      col.innerHTML = `
        <div class="card product-card h-100 shadow-sm">
          <a href="${prod.img}" class="glightbox" data-gallery="products" data-title="${prod.name}">
            <img src="${prod.img}" alt="${prod.name}" loading="lazy" class="card-img-top" />
          </a>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${prod.name}</h5>
            <p class="card-text text-muted small mb-2">${prod.description}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="text-success fw-semibold">${formatRupiah(prod.price)}</span>
              <button class="btn btn-sm btn-success" data-product-id="${prod.id}">Tambah</button>
            </div>
          </div>
        </div>
      `;

      productsGrid.appendChild(col);
    });

    // Reinit Glightbox setiap render produk
    if (window.glightbox instanceof GLightbox) {
      window.glightbox.destroy();
    }
    window.glightbox = GLightbox({ selector: 'a.glightbox' });
  }

  // Update tampilan keranjang
  function renderCart() {
    function createItemElement(item) {
      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-qty">
          <button class="btn btn-sm btn-outline-success btn-decrease" data-product-id="${item.id}" aria-label="Kurangi jumlah">−</button>
          <span class="mx-2">${item.qty}</span>
          <button class="btn btn-sm btn-success btn-increase" data-product-id="${item.id}" aria-label="Tambah jumlah">+</button>
        </div>
        <div class="cart-item-price">${formatRupiah(item.price * item.qty)}</div>
      `;
      return div;
    }

    // Bersihkan container
    cartItemsContainer.innerHTML = "";
    cartItemsContainerMobile.innerHTML = "";

    const items = Object.values(cart);

    if (items.length === 0) {
      cartItemsContainer.innerHTML = `<p class="text-muted">Keranjang kosong</p>`;
      cartItemsContainerMobile.innerHTML = `<p class="text-muted">Keranjang kosong</p>`;
      orderBtn.disabled = true;
      orderBtnMobile.disabled = true;
      return;
    }

    items.forEach(item => {
      const elDesktop = createItemElement(item);
      const elMobile = elDesktop.cloneNode(true);
      cartItemsContainer.appendChild(elDesktop);
      cartItemsContainerMobile.appendChild(elMobile);
    });

    orderBtn.disabled = false;
    orderBtnMobile.disabled = false;
  }

  // Tambah produk ke keranjang
  function addToCart(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (cart[productId]) {
      cart[productId].qty += 1;
    } else {
      cart[productId] = { ...prod, qty: 1 };
    }
    renderCart();
  }

  // Kurangi jumlah produk di keranjang
  function decreaseCartItem(productId) {
    if (!cart[productId]) return;

    cart[productId].qty -= 1;
    if (cart[productId].qty <= 0) {
      delete cart[productId];
    }
    renderCart();
  }

  // Event delegation untuk tombol tambah/kurang item
  function handleCartBtnClick(e) {
    if (e.target.matches("button[data-product-id]")) {
      const productId = parseInt(e.target.getAttribute("data-product-id"), 10);
      if (e.target.classList.contains("btn-increase")) {
        addToCart(productId);
      } else if (e.target.classList.contains("btn-decrease")) {
        decreaseCartItem(productId);
      } else if (e.target.classList.contains("btn-success") && !e.target.classList.contains("btn-increase")) {
        // tombol tambah pada produk
        addToCart(productId);
      }
    }
  }

  // Generate pesan WhatsApp dan buka URL order
  function orderViaWhatsApp() {
    const phoneNumber = "6281234567890"; // Ganti dengan no WhatsApp penerima (format internasional tanpa +)
    const items = Object.values(cart);
    if (items.length === 0) {
      alert("Keranjang kosong, mohon tambahkan produk terlebih dahulu.");
      return;
    }

    let message = "Halo, saya ingin memesan produk:\n";
    items.forEach(item => {
      message += `- ${item.name} (x${item.qty}) - ${formatRupiah(item.price * item.qty)}\n`;
    });
    message += `Total: ${formatRupiah(items.reduce((sum, item) => sum + item.price * item.qty, 0))}\n\nTerima kasih.`;

    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  }

  // Toggle drawer keranjang mobile
  function toggleCartDrawer(open) {
    if (open) {
      cartDrawer.classList.add("open");
      document.body.style.overflow = "hidden";
    } else {
      cartDrawer.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  // Initialization function
  function init() {
    renderProducts();
    renderCart();

    // Event listener tombol tambah produk di grid (event delegation pada parent)
    productsGrid.addEventListener("click", e => {
      if (e.target.matches("button.btn-success")) {
        const productId = parseInt(e.target.getAttribute("data-product-id"), 10);
        addToCart(productId);
      }
    });

    // Event listener tombol + / - pada keranjang desktop dan mobile (event delegation)
    cartItemsContainer.addEventListener("click", handleCartBtnClick);
    cartItemsContainerMobile.addEventListener("click", handleCartBtnClick);

    // Tombol order WhatsApp (desktop dan mobile)
    orderBtn.addEventListener("click", orderViaWhatsApp);
    orderBtnMobile.addEventListener("click", orderViaWhatsApp);

    // Tombol open/close drawer keranjang mobile
    if (cartToggleBtn && cartCloseBtn && cartDrawer) {
      cartToggleBtn.addEventListener("click", () => toggleCartDrawer(true));
      cartCloseBtn.addEventListener("click", () => toggleCartDrawer(false));
      window.addEventListener("resize", () => {
        // tutup drawer jika resize ke desktop agar tidak tertutup UI
        if (window.innerWidth >= 768) toggleCartDrawer(false);
      });
    }
  }

  // Jalankan init saat DOM siap
  document.addEventListener("DOMContentLoaded", init);

})();
