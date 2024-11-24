// fetch example products from an API and transform data for use
fetch("https://fakestoreapi.com/products")
  .then((response) => response.json())
  .then((data) => {
    const products = data.map((product) => ({
      id: product.id,
      product_name: product.title,
      product_description: product.description,
      product_price: product.price.toFixed(2),
      product_image: product.image,
      added_to_cart: false,
      quantity: 0,
    }));

    let cartItems = [];

    // select DOM elements for cart and product display
    const cartIndicators = document.querySelectorAll(".cart-indicator");
    const productsContainer = document.querySelector(".product-container");
    const shoppingCartItems = document.querySelector(".shopping-cart-items");
    const modal = document.querySelector(".modal");
    const totalPriceElement = document.querySelector(
      ".shopping-cart-total-price"
    );

    // helper function to format numbers as currency
    const formatCurrency = (value) =>
      new Intl.NumberFormat("us-US", {
        style: "currency",
        currency: "USD",
      }).format(value);

    // update cart indicator with current item count
    const updateCartIndicator = () => {
      const cartCount = cartItems.length;
      cartIndicators.forEach((indicator) => {
        indicator.innerText =
          cartCount > 0 ? String(cartCount).padStart(2, "0") : cartCount;
        indicator.dataset.indicator = cartCount;
      });
    };

    // update the total price displayed in the cart
    const updateTotalPrice = () => {
      const totalPriceValue = cartItems.reduce(
        (acc, product) =>
          acc + parseFloat(product.product_price) * product.quantity,
        0
      );
      totalPriceElement.textContent = formatCurrency(totalPriceValue);
    };

    // toggle between "Add to Cart" and "Remove" buttons depending on cart state
    const toggleCartButton = (buttons, isAdded) => {
      buttons.forEach((btn) => {
        btn.classList.toggle("add-to-cart", !isAdded);
        btn.classList.toggle("delete-from-cart", isAdded);
        btn.classList.toggle("delete-style", isAdded);
        btn.textContent = isAdded ? "Remove" : "Add To Cart";
      });
    };

    // render a product item in the shopping cart
    const renderCartItem = (product) => {
      const html = `
    <li class="product li-product-${product.id}" data-id="${product.id}">
      <img class="item-image" src="${product.product_image}" alt="${
        product.product_name
      } product" />
      <div class="product-all-info">
        <div class="product-info">
          <span class="item-name">${product.product_name}</span>
          <span class="item-price">${formatCurrency(
            product.product_price
          )}</span>
        </div>
        <div class="item-actions">
          <div class="item-qty-container">
            <button class="qty-btn qty-decrease" data-id="${
              product.id
            }">-</button>
            <span class="item-qty">${String(product.quantity).padStart(
              2,
              "0"
            )}</span>
            <button class="qty-btn qty-increase" data-id="${
              product.id
            }">+</button>
          </div>
          <img class="item-delete delete-from-cart-icon" src="/assets/svg/remove.svg"/>
        </div>
      </div>
    </li>
  `;
      shoppingCartItems.insertAdjacentHTML("beforeend", html);
    };

    // handle quantity change in cart (increase/decrease)
    const handleQuantityChange = (e) => {
      const isIncrease = e.target.classList.contains("qty-increase");
      const isDecrease = e.target.classList.contains("qty-decrease");

      if (!isIncrease && !isDecrease) return;

      const id = parseInt(e.target.dataset.id, 10);
      const cartItem = cartItems.find((item) => item.id === id);

      if (cartItem) {
        if (isIncrease) {
          cartItem.quantity = Math.min(99, cartItem.quantity + 1);
        } else if (isDecrease) {
          cartItem.quantity = Math.max(1, cartItem.quantity - 1);
        }
        updateCartItemUI(cartItem);
        updateTotalPrice();
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
      }
    };

    // update the quantity displayed for a cart item
    const updateCartItemUI = (cartItem) => {
      const qtyElement = document.querySelector(
        `.li-product-${cartItem.id} .item-qty`
      );
      if (qtyElement)
        qtyElement.textContent = String(cartItem.quantity).padStart(2, "0");
    };

    // render all cart items in the shopping cart
    const renderCartItems = () => {
      shoppingCartItems.innerHTML = "";
      cartItems.forEach((product) => renderCartItem(product));
    };

    // render a product card in the product list
    const renderProductCard = (product) => {
      const html = `
    <div class="product-card product-card-${product.id} product" data-id="${
        product.id
      }">
      <img src='${product.product_image}' alt="${
        product.product_name
      } product" />
      <h3>${product.product_name}</h3>
      <p class="price">${formatCurrency(product.product_price)}</p>
      <div class='card-buttons'>
        <button class='add-to-cart add-to-cart-btn-${
          product.id
        }'>Add to Cart</button>
        <button class='quick-view'>Quick View</button>
      </div>
    </div>
  `;
      productsContainer.insertAdjacentHTML("beforeend", html);
    };

    // render all product cards in the product container
    const renderProducts = () => {
      products.forEach(renderProductCard);
    };

    // open the quick view modal for a selected product
    const openQuickViewModal = (product) => {
      const html = `
    <div class="product modal-box" data-id="${product.id}">
      <img class="modal-img" src="${product.product_image}" alt="${
        product.product_name
      }" />
      <div>
        <h2 class="product-name">${product.product_name}</h2>
        <p class="price">${formatCurrency(product.product_price)}</p>
        <p class="product-description">${product.product_description}</p>
        <div class="modal-buttons">
          <button class="add-to-cart-btn-${product.id} ${
        product.added_to_cart ? "delete-from-cart delete-style" : "add-to-cart"
      }">
            ${product.added_to_cart ? "Remove" : "Add To Cart"}
          </button>
          <div class="close-modal-btn close-modal-global">
            <img class="close-modal-btn" src="assets/svg/close.svg" alt="close icon" />
          </div>
        </div>
      </div>
    </div>
  `;
      modal.innerHTML = html;
      modal.style.top = `${window.scrollY}px`;
      document.body.style.overflow = "hidden";
      modal.classList.remove("hidden");
    };

    // close the quick view modal
    const closeQuickViewModal = () => {
      modal.innerHTML = "";
      modal.classList.add("hidden");
      document.body.style.overflow = "scroll";
    };

    // add or remove items from the cart and update UI
    const manageCartItems = (product, buttons, action) => {
      if (action === "add") {
        product.added_to_cart = true;
        cartItems.push({ ...product, quantity: 1 });
      } else {
        cartItems = cartItems.filter((item) => item.id !== product.id);
        product.added_to_cart = false;
        product.quantity = 0;
      }

      renderCartItems();
      toggleCartButton(buttons, product.added_to_cart);
      updateCartIndicator();
      updateTotalPrice();
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    };

    // handle product click events (add/remove from cart, quick view)
    const handleProductClick = (e) => {
      const productElement = e.target.closest(".product");
      if (!productElement) return;

      const id = parseInt(productElement.dataset.id, 10);
      const product = products[id - 1];
      const buttons = document.querySelectorAll(`.add-to-cart-btn-${id}`);

      if (e.target.classList.contains("add-to-cart")) {
        manageCartItems(product, buttons, "add");
      } else if (
        e.target.classList.contains("delete-from-cart") ||
        e.target.classList.contains("delete-from-cart-icon")
      ) {
        manageCartItems(product, buttons, "remove");
      } else if (e.target.classList.contains("quick-view")) {
        openQuickViewModal(product);
      }
    };

    // handle modal close event
    const handleCloseModal = (e) => {
      if (
        e.target.classList.contains("modal") ||
        e.target.classList.contains("close-modal-btn")
      ) {
        closeQuickViewModal();
      }
    };

    // toggle visibility of the shopping cart sidebar
    const handleSidebarVisibility = (e) => {
      if (
        e.target.classList.contains("show-cart-btn") ||
        e.target.classList.contains("hide-cart-button")
      ) {
        document.querySelector(".shopping-cart").classList.toggle("visible");
      }
    };

    // handle remove all product from the shopping cart
    const handleRemoveAllProductFromCart = (e) => {
      if (e.target.classList.contains("remove-all-from-cart")) {
        cartItems = [];
        products.forEach((product) => {
          product.added_to_cart = false;
        });
        renderCartItems();
        updateCartIndicator();
        updateTotalPrice();
        localStorage.setItem("cartItems", JSON.stringify(cartItems));

        document
          .querySelectorAll(".add-to-cart, .delete-from-cart")
          .forEach((btn) => {
            btn.classList.remove("delete-from-cart", "delete-style");
            btn.classList.add("add-to-cart");
            btn.textContent = "Add To Cart";
          });
      }
    };

    // initialization of the page to get stored data if exist
    const initializeCart = () => {
      const storedCartItems =
        JSON.parse(localStorage.getItem("cartItems")) || [];
      cartItems = storedCartItems;

      products.forEach((product) => {
        const cartItem = cartItems.find((item) => item.id === product.id);
        if (cartItem) {
          product.added_to_cart = true;
        }
      });

      renderCartItems();
      updateCartIndicator();
      updateTotalPrice();

      products.forEach((product) => {
        const buttons = document.querySelectorAll(
          `.add-to-cart-btn-${product.id}`
        );
        toggleCartButton(buttons, product.added_to_cart);
      });
    };

    // main function
    const main = () => {
      renderProducts();
      initializeCart();
      window.addEventListener("click", handleProductClick);
      window.addEventListener("click", handleCloseModal);
      window.addEventListener("click", handleSidebarVisibility);
      window.addEventListener("click", handleRemoveAllProductFromCart);
      shoppingCartItems.addEventListener("click", handleQuantityChange);
    };

    // calling the main function so the program execute
    main();
  });
