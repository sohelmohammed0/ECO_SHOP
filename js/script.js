const products = [
    { id: 1, name: "Bamboo Toothbrush (Pack of 4)", price: 425, category: "personal", image: "assets/svgs/toothbrush.svg", rating: 4.5 },
    { id: 2, name: "Organic Cotton Tote Bag", price: 1700, category: "accessories", image: "assets/svgs/tote-bag.svg", rating: 4.2 },
    { id: 3, name: "Stainless Steel Straws (Set of 6)", price: 1105, category: "home", image: "assets/svgs/straws.svg", rating: 4.8 },
    { id: 4, name: "Soy Wax Eco Candle", price: 1275, category: "home", image: "assets/svgs/candle.svg", rating: 4.0 },
    { id: 5, name: "Hemp Backpack (20L)", price: 4250, category: "accessories", image: "assets/svgs/backpack.svg", rating: 4.7 },
    { id: 6, name: "Natural Soap Bar (100g)", price: 595, category: "personal", image: "assets/svgs/soap.svg", rating: 4.3 },
    { id: 7, name: "Bamboo Cutlery Set", price: 1315, category: "home", image: "assets/svgs/cutlery.svg", rating: 4.6 },
    { id: 8, name: "Recycled Paper Notebook (A5)", price: 850, category: "accessories", image: "assets/svgs/notebook.svg", rating: 4.1 },
    { id: 9, name: "Eco Water Bottle (750ml)", price: 2125, category: "accessories", image: "assets/svgs/water-bottle.svg", rating: 4.9 },
    { id: 10, name: "Organic Cotton Towel (Large)", price: 2550, category: "home", image: "assets/svgs/towel.svg", rating: 4.4 },
    { id: 11, name: "Solar USB Charger (10W)", price: 3400, category: "electronics", image: "assets/svgs/solar-charger.svg", rating: 4.5 },
    { id: 12, name: "Biodegradable Shampoo (200ml)", price: 1020, category: "personal", image: "assets/svgs/shampoo.svg", rating: 4.2 },
    { id: 13, name: "Eco Wireless Headphones", price: 5100, category: "electronics", image: "assets/svgs/headphones.svg", rating: 4.7 },
    { id: 14, name: "Reusable Ceramic Coffee Mug", price: 1275, category: "home", image: "assets/svgs/coffee-mug.svg", rating: 4.3 },
    { id: 15, name: "Bamboo Frame Sunglasses", price: 2975, category: "accessories", image: "assets/svgs/sunglasses.svg", rating: 4.6 },
  ];
  
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let compare = JSON.parse(localStorage.getItem("compare")) || [];
  let recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
  let inventory = JSON.parse(localStorage.getItem("inventory")) || products;
  let user = null;
  let filterTimeout = null;
  
  function renderProducts(filteredProducts = inventory, gridId = "product-grid") {
    const $grid = $(`#${gridId}`);
    $grid.empty();
    filteredProducts.forEach((product) => {
      const isWishlisted = wishlist.some((w) => w.id === product.id);
      const isCompared = compare.some((c) => c.id === product.id);
      const stars = '<i class="fas fa-star text-tangerine"></i>'.repeat(Math.floor(product.rating)) +
        (product.rating % 1 ? '<i class="fas fa-star-half-alt text-tangerine"></i>' : '');
      $grid.append(`
        <div class="col" data-aos="fade-up">
          <div class="product-card bg-white p-4 rounded-lg text-center">
            <div class="zoom-container">
              <img src="${product.image}" alt="${product.name}" class="mx-auto mb-3" />
            </div>
            <h5 class="font-poppins text-indigo">${product.name}</h5>
            <p class="text-tangerine font-semibold">₹${product.price}</p>
            <div class="rating-stars text-sm">${stars} (${product.rating})</div>
            <div class="d-flex justify-content-center gap-2 mt-2">
              <button class="btn btn-emerald btn-sm rounded-pill" onclick="addToCart(${product.id})">Add to Cart</button>
              <button class="btn btn-outline-emerald btn-sm rounded-pill" onclick="toggleWishlist(${product.id})">
                <i class="far fa-heart ${isWishlisted ? 'text-tangerine' : ''}"></i>
              </button>
              <button class="btn btn-outline-tangerine btn-sm rounded-pill quick-view" data-id="${product.id}">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-outline-tangerine btn-sm rounded-pill" onclick="toggleCompare(${product.id})">
                <i class="fas fa-exchange-alt ${isCompared ? 'text-tangerine' : ''}"></i>
              </button>
            </div>
          </div>
        </div>
      `);
    });
  }
  
  function renderCart() {
    $("#cart-items").empty();
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;
      $("#cart-items").append(`
        <div class="border-bottom py-3">
          <div class="d-flex align-items-center">
            <img src="${item.image}" alt="${item.name}" class="w-12 h-12 me-3 rounded" />
            <div class="flex-1">
              <h6 class="font-poppins text-indigo">${item.name}</h6>
              <p class="text-tangerine">₹${item.price} x ${item.quantity}</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
              <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
              <button class="btn btn-sm btn-outline-emerald rounded-circle" onclick="saveForLater(${item.id})">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      `);
    });
    $("#cart-total, #checkout-total").text(`₹${total}`);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    $("#cart-count, #sticky-cart-count").text(itemCount);
    $("#sticky-cart-total").text(`₹${total}`);
    $("#sticky-cart").toggleClass("d-none", itemCount === 0);
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
  function renderWishlist() {
    $("#wishlist-items").empty();
    wishlist.forEach((item) => {
      $("#wishlist-items").append(`
        <div class="border-bottom py-3">
          <div class="d-flex align-items-center">
            <img src="${item.image}" alt="${item.name}" class="w-12 h-12 me-3 rounded" />
            <div class="flex-1">
              <h6 class="font-poppins text-indigo">${item.name}</h6>
              <p class="text-tangerine">₹${item.price}</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-emerald rounded-circle" onclick="addToCart(${item.id})">
                <i class="fas fa-cart-plus"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="toggleWishlist(${item.id})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `);
    });
    $("#wishlist-count").text(wishlist.length);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }
  
  function renderCompare() {
    $("#compare-table").empty();
    if (compare.length === 0) {
      $("#compare-table").html('<p class="text-center text-charcoal">No products selected.</p>');
    } else {
      compare.forEach((product) => {
        $("#compare-table").append(`
          <div class="col">
            <div class="card bg-white p-4 rounded-lg text-center">
              <img src="${product.image}" alt="${product.name}" class="w-32 h-32 mx-auto mb-3" />
              <h6 class="font-poppins text-indigo">${product.name}</h6>
              <p class="text-tangerine">₹${product.price}</p>
              <p class="text-charcoal">${product.category}</p>
              <p class="text-charcoal">Rating: ${product.rating}</p>
              <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="toggleCompare(${product.id})">
                Remove
              </button>
            </div>
          </div>
        `);
      });
    }
    $("#compare-count").text(compare.length);
    localStorage.setItem("compare", JSON.stringify(compare));
  }
  
  function renderRecentlyViewed() {
    $("#recent-grid").empty();
    if (recentlyViewed.length === 0) {
      $("#recent-grid").html('<p class="text-center text-charcoal">No products viewed recently.</p>');
    } else {
      renderProducts(recentlyViewed.slice(0, 4), "recent-grid");
    }
  }
  
  function renderRecommendations() {
    const randomProducts = [...inventory].sort(() => Math.random() - 0.5).slice(0, 4);
    renderProducts(randomProducts, "recommendation-grid");
  }
  
  function addToCart(id, size = "default", color = "default") {
    const product = inventory.find((p) => p.id === id);
    const existingItem = cart.find((item) => item.id === id && item.size === size && item.color === color);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...product, quantity: 1, size, color });
    renderCart();
    gsap.from("#cart-items > div:last-child", { opacity: 0, y: 20, duration: 0.5 });
  }
  
  function updateQuantity(id, quantity) {
    if (quantity <= 0) cart = cart.filter((item) => item.id !== id);
    else cart.find((item) => item.id === id).quantity = quantity;
    renderCart();
  }
  
  function saveForLater(id) {
    const item = cart.find((c) => c.id === id);
    if (item && !wishlist.some((w) => w.id === id)) {
      wishlist.push({ ...item, quantity: undefined, size: undefined, color: undefined });
      cart = cart.filter((c) => c.id !== id);
    }
    renderCart();
    renderWishlist();
  }
  
  function toggleWishlist(id) {
    const product = inventory.find((p) => p.id === id);
    const isWishlisted = wishlist.some((item) => item.id === id);
    if (isWishlisted) wishlist = wishlist.filter((item) => item.id !== id);
    else wishlist.push(product);
    renderProducts();
    renderWishlist();
  }
  
  function toggleCompare(id) {
    const product = inventory.find((p) => p.id === id);
    const isCompared = compare.some((item) => item.id === id);
    if (isCompared) compare = compare.filter((item) => item.id !== id);
    else if (compare.length < 4) compare.push(product);
    else alert("You can compare up to 4 products.");
    renderProducts();
    renderCompare();
  }
  
  function addToRecentlyViewed(id) {
    const product = inventory.find((p) => p.id === id);
    recentlyViewed = recentlyViewed.filter((p) => p.id !== id);
    recentlyViewed.unshift(product);
    if (recentlyViewed.length > 10) recentlyViewed.pop();
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    renderRecentlyViewed();
  }
  
  function openCheckout() {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    $("#est-delivery").text(deliveryDate.toLocaleDateString("en-IN"));
    $("#cart-offcanvas").offcanvas("hide");
    $("#checkout-modal").modal("show");
  }
  
  function showQuickView(id) {
    const product = inventory.find((p) => p.id === id);
    $("#quick-view-title").text(product.name);
    $("#quick-view-image").attr("src", product.image);
    $("#quick-view-price").text(`₹${product.price}`);
    $("#quick-view-category").text(`Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}`);
    $("#quick-view-rating").html(
      '<i class="fas fa-star text-tangerine"></i>'.repeat(Math.floor(product.rating)) +
      (product.rating % 1 ? '<i class="fas fa-star-half-alt text-tangerine"></i>' : '') +
      ` (${product.rating})`
    );
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
  }
  
  function renderInventory() {
    $("#inventory-table").empty();
    inventory.forEach((product) => {
      $("#inventory-table").append(`
        <tr>
          <td>${product.name}</td>
          <td>₹${product.price}</td>
          <td>${product.category}</td>
          <td>
            <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="deleteProduct(${product.id})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `);
    });
  }
  
  function addProduct(name, price, category, image) {
    const id = inventory.length ? Math.max(...inventory.map((p) => p.id)) + 1 : 1;
    inventory.push({ id, name, price: parseFloat(price), category, image, rating: 4.0 });
    localStorage.setItem("inventory", JSON.stringify(inventory));
    renderProducts();
    renderInventory();
    renderRecommendations();
  }
  
  function deleteProduct(id) {
    inventory = inventory.filter((p) => p.id !== id);
    cart = cart.filter((c) => c.id !== id);
    wishlist = wishlist.filter((w) => w.id !== id);
    compare = compare.filter((c) => c.id !== id);
    recentlyViewed = recentlyViewed.filter((r) => r.id !== id);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    renderProducts();
    renderCart();
    renderWishlist();
    renderCompare();
    renderRecentlyViewed();
    renderRecommendations();
  }
  
  function trackOrder() {
    const orderId = $("#order-id").val();
    if (!orderId) {
      $("#order-status").html('<p class="text-danger">Please enter an order ID.</p>');
      return;
    }
    const status = Math.floor(Math.random() * 4);
    const statuses = ["Order Placed", "Processing", "Shipped", "Delivered"];
    const progress = (status + 1) * 25;
    $("#order-status").html(`
      <p class="font-poppins text-indigo mb-3">Status: ${statuses[status]}</p>
      <div class="progress order-progress">
        <div class="progress-bar bg-emerald" style="width: ${progress}%"></div>
      </div>
      <div class="d-flex justify-content-between mt-2 order-step">
        <span>Placed</span>
        <span>Processing</span>
        <span>Shipped</span>
        <span>Delivered</span>
      </div>
    `);
    gsap.from("#order-status", { opacity: 0, y: 20, duration: 0.5 });
  }
  
  function filterAndSortProducts() {
    clearTimeout(filterTimeout);
    $("#loading-spinner").removeClass("d-none");
    $("#product-grid").addClass("loading");
    filterTimeout = setTimeout(() => {
      let filteredProducts = [...inventory];
      const query = $("#search-input").val().toLowerCase();
      const category = $("input[name='category']:checked").val();
      const sort = $("#sort-filter").val();
      const maxPrice = parseInt($("#price-filter").val());
  
      if (query) filteredProducts = filteredProducts.filter((p) => p.name.toLowerCase().includes(query));
      if (category !== "all") filteredProducts = filteredProducts.filter((p) => p.category === category);
      filteredProducts = filteredProducts.filter((p) => p.price <= maxPrice);
  
      switch (sort) {
        case "name-asc":
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "price-asc":
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case "relevance":
          break;
      }
  
      renderProducts(filteredProducts);
      renderProducts(filteredProducts.filter((p) => p.price < 1700), "deals-grid");
      $("#loading-spinner").addClass("d-none");
      $("#product-grid").removeClass("loading");
    }, 300);
  }
  
  $("#login-form").on("submit", (e) => {
    e.preventDefault();
    user = { role: Math.random() > 0.9 ? "admin" : "user", name: $("#login-form input[placeholder='Email']").val().split("@")[0] };
    $("#user-name").text(user.name).removeClass("d-none");
    $("#auth-modal").modal("hide");
    $("#profile-link, #logout-link").removeClass("d-none");
    $("#admin-link").toggleClass("d-none", user.role !== "admin");
    $("#admin, #profile").toggleClass("d-none", user.role !== "admin");
  });
  
  $("#signup-form").on("submit", (e) => {
    e.preventDefault();
    user = { role: "user", name: $("#signup-form input[placeholder='Full Name']").val() };
    $("#user-name").text(user.name).removeClass("d-none");
    $("#auth-modal").modal("hide");
    $("#profile-link, #logout-link").removeClass("d-none");
  });
  
  $("#logout-link").on("click", () => {
    user = null;
    $("#user-name").addClass("d-none");
    $("#profile-link, #logout-link, #admin-link").addClass("d-none");
    $("#admin, #profile").addClass("d-none");
  });
  
  $("#add-product-form").on("submit", (e) => {
    e.preventDefault();
    const name = $("#add-product-form input[placeholder='Product Name']").val();
    const price = $("#add-product-form input[placeholder='Price (₹)']").val();
    const category = $("#add-product-form select").val();
    const image = $("#add-product-form input[type='file']").val() || "assets/svgs/placeholder.svg";
    addProduct(name, price, category, image);
    e.target.reset();
  });
  
  $("#checkout-form").on("submit", (e) => {
    e.preventDefault();
    $("#checkout-modal").modal("hide");
    cart = [];
    renderCart();
    alert("Order placed! Track it in Orders.");
  });
  
  $("#newsletter-form, #footer-newsletter").on("submit", (e) => {
    e.preventDefault();
    $("#newsletter-popup").modal("hide");
    alert("Subscribed to EcoShop updates!");
    e.target.reset();
  });
  
  $("#profile-form").on("submit", (e) => {
    e.preventDefault();
    user.name = $("#profile-form input[placeholder='Full Name']").val();
    $("#user-name").text(user.name);
    alert("Profile updated!");
  });
  
  $("#search-input, #sort-filter, input[name='category']").on("input change", filterAndSortProducts);
  $("#price-filter").on("input", () => {
    $("#price-value").text(`Up to ₹${$("#price-filter").val()}`);
    filterAndSortProducts();
  });
  
  $("a[href^='#']").on("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const $target = $(targetId);
    if ($target.length) {
      gsap.to(window, { scrollTo: $target.offset().top - 80, duration: 0.8 });
      $(".offcanvas").offcanvas("hide");
    }
  });
  
  $(document).on("click", ".quick-view", function () {
    showQuickView($(this).data("id"));
  });
  
  setTimeout(() => $("#newsletter-popup").modal("show"), 5000);
  
  AOS.init({ duration: 800 });
  renderProducts();
  renderCart();
  renderWishlist();
  renderCompare();
  renderRecentlyViewed();
  renderRecommendations();