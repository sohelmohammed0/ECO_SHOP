$(document).ready(function () {
  // Sample Inventory
  let inventory = [
    { id: 1, name: "Bamboo Toothbrush", price: 425, category: "personal", rating: 4.5, image: "assets/svgs/toothbrush.svg" },
    { id: 2, name: "Organic Cotton Tote Bag", price: 1700, category: "accessories", rating: 4.8, image: "assets/svgs/tote-bag.svg" },
    { id: 3, name: "Stainless Steel Straw", price: 300, category: "accessories", rating: 4.2, image: "assets/svgs/straw.svg" },
    { id: 4, name: "Eco-Friendly Notebook", price: 600, category: "home", rating: 4.0, image: "assets/svgs/notebook.svg" },
    { id: 5, name: "Solar Charger", price: 2500, category: "electronics", rating: 4.7, image: "assets/svgs/solar-charger.svg" },
  ];

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let compare = JSON.parse(localStorage.getItem("compare")) || [];
  let recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
  let user = JSON.parse(localStorage.getItem("user")) || null;
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  // Initialize AOS
  AOS.init({ duration: 800, once: true });

  // Initialize ScrollReveal
  ScrollReveal().reveal(".product-card", { delay: 200, distance: "20px", origin: "bottom", interval: 100 });

  // Dark Mode
  $("#dark-mode-toggle").on("click", function () {
    $("html").toggleClass("dark");
    localStorage.setItem("darkMode", $("html").hasClass("dark"));
    $("#dark-mode-toggle i").toggleClass("fa-moon fa-sun");
  });
  if (localStorage.getItem("darkMode") === "true") {
    $("html").addClass("dark");
    $("#dark-mode-toggle i").removeClass("fa-moon").addClass("fa-sun");
  }

  // User Authentication
  $("#login-form").on("submit", function (e) {
    e.preventDefault();
    const email = $(this).find('input[type="email"]').val();
    const password = $(this).find('input[type="password"]').val();
    if (email && password) {
      user = { email, name: email.split("@")[0], role: email.includes("admin") ? "admin" : "user" };
      localStorage.setItem("user", JSON.stringify(user));
      updateUserUI();
      $("#auth-modal").modal("hide");
      gsap.from("#user-name", { opacity: 0, duration: 0.5 });
    } else {
      $(this).find(".invalid-feedback").show();
    }
  });

  $("#signup-form").on("submit", function (e) {
    e.preventDefault();
    const name = $(this).find('input[type="text"]').val();
    const email = $(this).find('input[type="email"]').val();
    const password = $(this).find('input[type="password"]').val();
    if (name && email && password) {
      user = { email, name, role: email.includes("admin") ? "admin" : "user" };
      localStorage.setItem("user", JSON.stringify(user));
      updateUserUI();
      $("#auth-modal").modal("hide");
      gsap.from("#user-name", { opacity: 0, duration: 0.5 });
    }
  });

  $("#logout-link").on("click", function () {
    user = null;
    localStorage.removeItem("user");
    updateUserUI();
  });

  function updateUserUI() {
    if (user) {
      $("#user-name").text(user.name).removeClass("hidden");
      $("#profile-link, #logout-link").removeClass("hidden");
      if (user.role === "admin") {
        $("#admin-link").removeClass("hidden");
      }
      $("#auth-modal").find(".nav-link").removeClass("active").first().addClass("active");
      $("#auth-modal").find(".tab-pane").removeClass("show active").first().addClass("show active");
    } else {
      $("#user-name, #profile-link, #admin-link, #logout-link").addClass("hidden");
    }
  }
  updateUserUI();

  // Profile
  $("#profile-form").on("submit", function (e) {
    e.preventDefault();
    const name = $(this).find('input[type="text"]').val();
    const email = $(this).find('input[type="email"]').val();
    user = { ...user, name, email };
    localStorage.setItem("user", JSON.stringify(user));
    updateUserUI();
    alert("Profile updated successfully!");
    gsap.from("#profile-form", { scale: 0.95, duration: 0.3 });
  });

  // Navigation
  $("a[href*='#']").on("click", function (e) {
    e.preventDefault();
    const target = $(this).attr("href");
    if (target === "#home") {
      $("html, body").animate({ scrollTop: 0 }, 600);
    } else {
      const section = $(target);
      if (section.length) {
        $("html, body").animate({ scrollTop: section.offset().top - 80 }, 600);
        section.removeClass("hidden");
      }
    }
    $("#navbarContent").collapse("hide");
  });

  // Sticky Cart Visibility
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 300 && cart.length > 0) {
      $("#sticky-cart").removeClass("hidden");
    } else {
      $("#sticky-cart").addClass("hidden");
    }
  });

  // Product Rendering
  function renderProducts(products = inventory, container = "#product-grid") {
    $(container).empty();
    if (!products.length) {
      $(container).html('<p class="text-center text-gray-600 dark:text-gray-400 text-lg p-8 bg-gray-100 dark:bg-gray-700 rounded-xl">No items to show</p>');
      return;
    }
    products.forEach((product) => {
      const isWishlisted = wishlist.some((item) => item.id === product.id);
      const isCompared = compare.some((item) => item.id === product.id);
      const card = `
        <div class="product-card bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105" data-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" class="w-full h-32 object-contain mb-4" loading="lazy" />
          <h5 class="font-poppins text-indigo-900 dark:text-indigo-200 mb-2 line-clamp-2 text-base">${product.name}</h5>
          <p class="text-tangerine-500 font-semibold mb-2">₹${product.price.toLocaleString()}</p>
          <div class="flex items-center gap-1 mb-4">
            ${'<i class="fas fa-star text-amber-400"></i>'.repeat(Math.floor(product.rating))}
            ${product.rating % 1 ? '<i class="fas fa-star-half-alt text-amber-400"></i>' : ''}
            <span class="text-gray-600 dark:text-gray-400 text-sm">(${product.rating})</span>
          </div>
          <div class="flex justify-center gap-2">
            <button class="btn-icon bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform" onclick="addToCart(${product.id})" aria-label="Add to cart">
              <i class="fas fa-cart-plus"></i>
            </button>
            <button class="btn-icon bg-gray-200 dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform ${isWishlisted ? 'bg-tangerine-500 text-white' : ''}" onclick="toggleWishlist(${product.id})" aria-label="Toggle wishlist">
              <i class="far fa-heart"></i>
            </button>
            <button class="btn-icon bg-gray-200 dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform ${isCompared ? 'bg-tangerine-500 text-white' : ''}" onclick="toggleCompare(${product.id})" aria-label="Toggle compare">
              <i class="fas fa-exchange-alt"></i>
            </button>
            <button class="btn-icon bg-gray-200 dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform" onclick="showQuickView(${product.id})" aria-label="Quick view">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      `;
      $(container).append(card);
    });
    AOS.refresh();
    ScrollReveal().sync();
  }

  // Deals
  function renderDeals() {
    const deals = inventory.filter((p) => p.price < 1000);
    renderProducts(deals, "#deals-grid");
  }

  // Recently Viewed
  function renderRecentlyViewed() {
    renderProducts(recentlyViewed, "#recent-grid");
  }

  // Recommendations
  function renderRecommendations() {
    const recommended = inventory.filter((p) => !wishlist.some((w) => w.id === p.id)).slice(0, 4);
    renderProducts(recommended, "#recommendation-grid");
  }

  // Cart
  function addToCart(id, size = "default", color = "default") {
    const product = inventory.find((p) => p.id === id);
    if (!product) return;
    const existing = cart.find((item) => item.id === id && item.size === size && item.color === color);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, size, color });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateStickyCart();
    gsap.from("#cart-count", { scale: 1.5, duration: 0.3 });
  }

  function updateQuantity(id, size, color, delta) {
    const item = cart.find((i) => i.id === id && i.size === size && i.color === color);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter((i) => i.id !== id || i.size !== size || i.color !== color);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
      updateStickyCart();
      gsap.from(`.cart-item[data-id="${id}-${size}-${color}"]`, { opacity: 0.5, duration: 0.3 });
    }
  }

  function renderCart() {
    $("#cart-items").empty();
    if (!cart.length) {
      $("#cart-items").html('<p class="text-center text-gray-600 dark:text-gray-400 text-lg p-8 bg-gray-100 dark:bg-gray-700 rounded-xl">Your cart is empty</p>');
      $("#cart-total").text("Total: ₹0");
      $("#cart-count").text("0");
      return;
    }
    let total = 0;
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const cartItem = `
        <div class="cart-item flex gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl" data-id="${item.id}-${item.size}-${item.color}">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain rounded-lg" loading="lazy" />
          <div class="flex-1">
            <h6 class="font-poppins text-indigo-900 dark:text-indigo-200">${item.name}</h6>
            <p class="text-gray-600 dark:text-gray-400 text-sm">₹${item.price.toLocaleString()} | ${item.size} | ${item.color}</p>
            <div class="flex items-center gap-2 mt-2">
              <button class="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white" onclick="updateQuantity(${item.id}, '${item.size}', '${item.color}', -1)">-</button>
              <span>${item.quantity}</span>
              <button class="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white" onclick="updateQuantity(${item.id}, '${item.size}', '${item.color}', 1)">+</button>
            </div>
          </div>
          <p class="text-tangerine-500 font-semibold">₹${itemTotal.toLocaleString()}</p>
        </div>
      `;
      $("#cart-items").append(cartItem);
    });
    $("#cart-total").text(`Total: ₹${total.toLocaleString()}`);
    $("#cart-count").text(cart.reduce((sum, item) => sum + item.quantity, 0));
  }

  function updateStickyCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    $("#sticky-cart-count").text(totalItems);
    $("#sticky-cart-total").text(`₹${totalPrice.toLocaleString()}`);
    if (totalItems > 0) {
      $("#sticky-cart").removeClass("hidden");
    }
  }

  // Wishlist
  function toggleWishlist(id) {
    const product = inventory.find((p) => p.id === id);
    if (!product) return;
    const isWishlisted = wishlist.some((item) => item.id === id);
    if (isWishlisted) {
      wishlist = wishlist.filter((item) => item.id !== id);
    } else {
      wishlist.push(product);
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    renderProducts();
    renderWishlist();
    renderRecommendations();
    gsap.from(`.btn-icon[data-id="${id}"], #wishlist-count`, { scale: 1.3, duration: 0.3 });
  }

  function renderWishlist() {
    $("#wishlist-items").empty();
    $("#wishlist-count").text(wishlist.length);
    if (!wishlist.length) {
      $("#wishlist-items").html('<p class="text-center text-gray-600 dark:text-gray-400 text-lg p-8 bg-gray-100 dark:bg-gray-700 rounded-xl">Your wishlist is empty</p>');
      return;
    }
    wishlist.forEach((item) => {
      const wishlistItem = `
        <div class="flex gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain rounded-lg" loading="lazy" />
          <div class="flex-1">
            <h6 class="font-poppins text-indigo-900 dark:text-indigo-200">${item.name}</h6>
            <p class="text-tangerine-500 font-semibold">₹${item.price.toLocaleString()}</p>
          </div>
          <button class="bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700" onclick="addToCart(${item.id})">Add to Cart</button>
        </div>
      `;
      $("#wishlist-items").append(wishlistItem);
    });
  }

  // Compare
  function toggleCompare(id) {
    const product = inventory.find((p) => p.id === id);
    if (!product) return;
    if (compare.some((item) => item.id === id)) {
      compare = compare.filter((item) => item.id !== id);
    } else if (compare.length < 4) {
      compare.push(product);
    } else {
      alert("You can compare up to 4 products.");
      return;
    }
    localStorage.setItem("compare", JSON.stringify(compare));
    renderProducts();
    renderCompare();
    $("#compare-count").text(compare.length);
    gsap.from(`.btn-icon[data-id="${id}"], #compare-count`, { scale: 1.3, duration: 0.3 });
  }

  function renderCompare() {
    $("#compare-table").empty();
    if (!compare.length) {
      $("#compare-table").html('<p class="text-center text-gray-600 dark:text-gray-400 text-lg p-8 bg-gray-100 dark:bg-gray-700 rounded-xl">No products to compare</p>');
      return;
    }
    compare.forEach((product) => {
      const compareItem = `
        <div class="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl text-center">
          <img src="${product.image}" alt="${product.name}" class="w-32 h-32 object-contain mx-auto mb-4" loading="lazy" />
          <h6 class="font-poppins text-indigo-900 dark:text-indigo-200 mb-2">${product.name}</h6>
          <p class="text-tangerine-500 font-semibold mb-2">₹${product.price.toLocaleString()}</p>
          <p class="text-gray-600 dark:text-gray-400 mb-2">Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
          <p class="text-gray-600 dark:text-gray-400">Rating: ${product.rating}</p>
          <button class="mt-4 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700" onclick="toggleCompare(${product.id});$('#compare-modal').modal('hide')">Remove</button>
        </div>
      `;
      $("#compare-table").append(compareItem);
    });
  }

  // Quick View
  function showQuickView(id) {
    const product = inventory.find((p) => p.id === id);
    if (!product) return;
    $("#quick-view-title").text(product.name);
    $("#quick-view-image").attr({ src: product.image, alt: product.name });
    $("#quick-view-price").text(`₹${product.price.toLocaleString()}`);
    $("#quick-view-category").text(`Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}`);
    $("#quick-view-rating").html(
      '<i class="fas fa-star text-amber-400"></i>'.repeat(Math.floor(product.rating)) +
      (product.rating % 1 ? '<i class="fas fa-star-half-alt text-amber-400"></i>' : '') +
      ` (${product.rating})`
    );
    const isWishlisted = wishlist.some((item) => item.id === id);
    $("#quick-view-wishlist")
      .toggleClass("bg-tangerine-500 text-white", isWishlisted)
      .toggleClass("bg-gray-200 dark:bg-gray-700", !isWishlisted);
    const isCompared = compare.some((item) => item.id === id);
    $("#quick-view-compare")
      .toggleClass("bg-tangerine-500 text-white", isCompared)
      .toggleClass("bg-gray-200 dark:bg-gray-700", !isCompared);
    $("#quick-view-cart").off("click").on("click", () => {
      const size = $("#quick-view-size").val();
      const color = $("#quick-view-color").val();
      addToCart(id, size, color);
      $("#quick-view-modal").modal("hide");
    });
    $("#quick-view-wishlist").off("click").on("click", () => {
      toggleWishlist(id);
      $("#quick-view-modal").modal("hide");
    });
    $("#quick-view-compare").off("click").on("click", () => {
      toggleCompare(id);
      $("#quick-view-modal").modal("hide");
    });
    $("#quick-view-modal").modal("show");
    addToRecentlyViewed(id);
    gsap.from("#quick-view-modal .modal-content", { opacity: 0, scale: 0.9, duration: 0.3 });
    // Image Zoom
    $("#quick-view-image").on("mousemove", function (e) {
      const { left, top, width, height } = this.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      $(this).css({
        transformOrigin: `${x * 100}% ${y * 100}%`,
        transform: "scale(2)",
      });
    }).on("mouseleave", function () {
      $(this).css({ transformOrigin: "center", transform: "scale(1)" });
    });
  }

  // Recently Viewed
  function addToRecentlyViewed(id) {
    const product = inventory.find((p) => p.id === id);
    if (!product) return;
    recentlyViewed = recentlyViewed.filter((item) => item.id !== id);
    recentlyViewed.unshift(product);
    recentlyViewed = recentlyViewed.slice(0, 4);
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    renderRecentlyViewed();
  }

  // Filter and Sort
  function filterAndSortProducts() {
    let filteredProducts = [...inventory];
    const category = $('input[name="category"]:checked').val();
    const price = $("#price-filter").val();
    const query = ($("#search-input").val() || $("#search-input-mobile").val()).toLowerCase();
    if (category !== "all") {
      filteredProducts = filteredProducts.filter((p) => p.category === category);
    }
    filteredProducts = filteredProducts.filter((p) => p.price <= price);
    if (query) {
      filteredProducts = filteredProducts.filter((p) => p.name.toLowerCase().includes(query));
      // Live Search Preview
      const preview = filteredProducts.slice(0, 3).map((p) => `<div class="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onclick="showQuickView(${p.id})">${p.name}</div>`).join("");
      $("#search-preview").html(preview).removeClass("hidden");
    } else {
      $("#search-preview").addClass("hidden");
    }
    const sort = $("#sort-filter").val();
    if (sort === "name-asc") {
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name-desc") {
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "price-asc") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      filteredProducts.sort((a, b) => b.price - a.price);
    }
    renderProducts(filteredProducts);
  }

  $("#search-input, #search-input-mobile").on("input", filterAndSortProducts);
  $('input[name="category"]').on("change", filterAndSortProducts);
  $("#price-filter").on("input", function () {
    $("#price-value").text(`Up to ₹${$(this).val()}`);
    filterAndSortProducts();
  });
  $("#sort-filter").on("change", filterAndSortProducts);

  // Checkout
  window.openCheckout = function () {
    if (!cart.length) {
      alert("Your cart is empty!");
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    $("#checkout-total").text(`₹${total.toLocaleString()}`);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    $("#est-delivery").text(deliveryDate.toLocaleDateString());
    $("#checkout-modal").modal("show");
  };

  $("#checkout-form").on("submit", function (e) {
    e.preventDefault();
    const orderId = "ECO" + Math.floor(Math.random() * 100000);
    orders.push({ id: orderId, items: [...cart], status: "Processing", date: new Date() });
    localStorage.setItem("orders", JSON.stringify(orders));
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateStickyCart();
    $("#checkout-modal").modal("hide");
    alert(`Order placed! Your order ID is ${orderId}.`);
  });

  // Order Tracking
  window.trackOrder = function () {
    const orderId = $("#order-id").val();
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      $("#order-status").html('<p class="text-center text-red-500">Order not found</p>');
      return;
    }
    const statusSteps = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
    const currentStep = statusSteps.indexOf(order.status);
    const progress = ((currentStep + 1) / statusSteps.length) * 100;
    const statusHtml = `
      <p class="text-gray-600 dark:text-gray-400 mb-4">Order ID: ${order.id} | Placed on ${new Date(order.date).toLocaleDateString()}</p>
      <div class="progress mb-4">
        <div class="progress-bar bg-emerald-600" style="width: ${progress}%"></div>
      </div>
      <div class="flex justify-between text-sm">
        ${statusSteps.map((step, i) => `<span class="${i <= currentStep ? "text-emerald-600" : "text-gray-400"}">${step}</span>`).join("")}
      </div>
    `;
    $("#order-status").html(statusHtml);
  };

  // Admin Panel
  $("#add-product-form").on("submit", function (e) {
    e.preventDefault();
    const name = $(this).find('input[type="text"]').val();
    const price = parseFloat($(this).find('input[type="number"]').val());
    const category = $(this).find("select").val();
    const imageInput = $(this).find('input[type="file"]')[0];
    const image = imageInput.files[0] ? URL.createObjectURL(imageInput.files[0]) : "assets/svgs/default.svg";
    const newProduct = {
      id: inventory.length + 1,
      name,
      price,
      category,
      rating: 4.0,
      image,
    };
    inventory.push(newProduct);
    renderProducts();
    renderDeals();
    renderInventory();
    $(this)[0].reset();
    alert("Product added successfully!");
  });

  function renderInventory() {
    $("#inventory-table").empty();
    inventory.forEach((product) => {
      const row = `
        <tr class="border-b border-gray-300 dark:border-gray-600">
          <td class="py-3 px-4 text-gray-700 dark:text-gray-300">${product.name}</td>
          <td class="py-3 px-4 text-gray-700 dark:text-gray-300">₹${product.price.toLocaleString()}</td>
          <td class="py-3 px-4 text-gray-700 dark:text-gray-300">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
          <td class="py-3 px-4">
            <button class="bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700" onclick="deleteProduct(${product.id})">Delete</button>
          </td>
        </tr>
      `;
      $("#inventory-table").append(row);
    });
  }

  window.deleteProduct = function (id) {
    inventory = inventory.filter((p) => p.id !== id);
    cart = cart.filter((item) => item.id !== id);
    wishlist = wishlist.filter((item) => item.id !== id);
    compare = compare.filter((item) => item.id !== id);
    recentlyViewed = recentlyViewed.filter((item) => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    localStorage.setItem("compare", JSON.stringify(compare));
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    renderProducts();
    renderCart();
    renderWishlist();
    renderCompare();
    renderRecentlyViewed();
    renderRecommendations();
    renderInventory();
  };

  // Newsletter
  $("#newsletter-form, #footer-newsletter").on("submit", function (e) {
    e.preventDefault();
    const email = $(this).find('input[type="email"]').val();
    if (email) {
      alert("Thank you for subscribing!");
      $(this)[0].reset();
      $("#newsletter-popup").modal("hide");
    }
  });

  // Initial Render
  renderProducts();
  renderDeals();
  renderCart();
  renderWishlist();
  renderCompare();
  renderRecentlyViewed();
  renderRecommendations();
  renderInventory();
  updateStickyCart();

  // Show Newsletter Popup
  setTimeout(() => {
    if (!localStorage.getItem("newsletterShown")) {
      $("#newsletter-popup").modal("show");
      localStorage.setItem("newsletterShown", "true");
    }
  }, 5000);
});