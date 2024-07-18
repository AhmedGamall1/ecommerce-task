// CATCH DOM ELEMENTS & DEFINE GLOBAL VARIABLES
let productSection = document.getElementById("product-section");
let pageNumber = document.getElementById("page-num");
let categoryFilter = document.getElementById("categoryFilter");
let form = document.getElementById("form-filter");
let cartProductSection = document.getElementById("cart-products");
let AddToCart = document.getElementById("cartAdd");
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
let pages;
let productsData;

//FETCH DATA ONCE THE WEBSITE OPEN AND RELOAD
window.onload = async () => {
  console.log("run");
  // FETCH PRODUCTS
  const endpoint = `https://fakestoreapi.com/products`;
  const response = await fetch(endpoint);
  productsData = await response.json();

  // ADD CATEGORY TO DOM FOR SORTING
  const usedCategories = new Set();

  productsData.map((ele) => {
    if (!usedCategories.has(ele.category)) {
      const newOption = document.createElement("option");
      newOption.text = `${ele.category}`;
      newOption.value = `${ele.category}`;
      usedCategories.add(ele.category);
      categoryFilter.appendChild(newOption);
    }
  });

  // DISPLAY FIRST FOUR PRODUCTS
  displayProducts(productsData, 4);
};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // CATCH INPUT DATA
  const title = form.elements.titleFilter.value;
  const category = form.elements.categoryFilter.value;
  const minPrice = form.elements.minPriceFilter.value;
  const maxPrice = form.elements.maxPriceFilter.value;
  const price = form.elements.priceFilter.value;
  console.log(minPrice, maxPrice);

  if (title !== "") {
    sortByTitle(title);
    return;
  }

  if (category !== "" && minPrice == "" && maxPrice == "" && price == "") {
    sortByCategory(category);
    return;
  }

  sortByCategoryOrPrice(category, minPrice, maxPrice, price);
});

const sortByCategoryOrPrice = (category, minPrice, maxPrice, price) => {
  let filteredProducts = [];

  if (category !== "") {
    filteredProducts = productsData.filter(
      (product) => product.category === category
    );
  }

  if (minPrice != "" && maxPrice == "") {
    if (filteredProducts.length !== 0) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= minPrice
      );
    } else {
      filteredProducts = productsData.filter(
        (product) => product.price >= minPrice
      );
    }
  }

  if (maxPrice != "" && minPrice == "") {
    if (filteredProducts.length !== 0) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price <= maxPrice
      );
    } else {
      filteredProducts = productsData.filter(
        (product) => product.price <= maxPrice
      );
    }
  }

  if (maxPrice != "" && minPrice != "") {
    if (filteredProducts.length !== 0) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price <= maxPrice && product.price >= minPrice
      );
    } else {
      filteredProducts = productsData.filter(
        (product) => product.price <= maxPrice && product.price >= minPrice
      );
    }
  }

  if (price === "From Highest To Lowest") {
    if (filteredProducts.length !== 0) {
      filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
    } else {
      filteredProducts = productsData.sort((a, b) => b.price - a.price);
    }
  }

  if (price === "From Lowest To Highest") {
    if (filteredProducts.length !== 0) {
      filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
    } else {
      filteredProducts = productsData.sort((a, b) => a.price - b.price);
    }
  }

  displayProducts(filteredProducts, 4);
};

const sortByTitle = (title) => {
  const filteredProducts = productsData.filter(
    (product) => product.title == title
  );

  if (filteredProducts.length === 0) {
    alert("No Product Found");
  }

  displayProducts(filteredProducts, 4);
};

const sortByCategory = (category) => {
  const filteredProducts = productsData.filter(
    (product) => product.category === category
  );
  if (filteredProducts.length === 0) {
    alert("No Product Found");
  }

  displayProducts(filteredProducts, 4);
};

const displayProducts = (products, limit) => {
  // CLEAR ANY EXISTING PRODUCTS FIRST
  if (productSection.hasChildNodes()) {
    productSection.textContent = "";
    pageNumber.innerHTML = "";
  }
  // CALC THE NUMBER OF PAGES
  pages = products.length / 4;
  for (i = 1; i <= pages; i++) {
    let page = document.createElement("div");
    page.innerHTML = i;
    page.className += " btn";
    pageNumber.appendChild(page);
  }

  // SHOW THE PRODUCTS
  products.map((ele, index) => {
    if (index <= limit - 1) {
      // // CREATE CARD
      let productCard = document.createElement("div");
      productCard.className += " product-card";

      // CREATE PRODUCT DATA
      let productTitle = document.createElement("div");
      productTitle.className += " product-title";
      productTitle.innerHTML = ele.title;

      let productImg = document.createElement("img");
      productImg.className += " product-img";
      productImg.src = ele.image;

      let productPrice = document.createElement("div");
      productPrice.innerHTML = `$${ele.price}`;

      let cardBtns = document.createElement("div");
      cardBtns.className += " card-btns";
      let detailBtn = document.createElement("div");
      detailBtn.className += " card-btn";

      let cartBtn = document.createElement("div");
      cartBtn.id = "cartAdd";
      cartBtn.className += " card-btn";
      cartBtn.addEventListener("click", () => {
        addToCart(ele.id);
      });

      detailBtn.innerHTML = "View details";
      cartBtn.innerHTML = "Add to cart";

      // ADDING DATA TO DOM
      cardBtns.append(detailBtn, cartBtn);
      productCard.append(productImg, productTitle, productPrice, cardBtns);
      productSection.appendChild(productCard);
    }
  });
};

const addToCart = (id) => {
  // CHECK IF ITEM ALREADY EXIST IN CART
  const existingItem = cartItems.find((item) => item.id === id);

  if (existingItem) {
    // INCREASE QTY IF FOUND
    existingItem.quantity++;
  } else {
    // PUSH IT TO CART IF NOT FOUND
    const product = productsData.find((item) => item.id === id);
    cartItems.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cartItems", JSON.stringify(cartItems));

  updateCartData();
};

const removeFromCart = (id) => {
  cartItems = cartItems.filter((product) => product.id !== id);
  localStorage.setItem("cartItems", JSON.stringify(cartItems));

  updateCartData();
};

const updateCartData = () => {
  let empty = document.getElementById("empty");
  // CLEAR ANY EXISTING PRODUCTS FIRST
  if (cartProductSection?.hasChildNodes()) {
    cartProductSection.textContent = "";
  }

  let totalQty = 0;
  let totalPrice = 0;

  cartItems.map((ele, index) => {
    totalPrice += ele.price * ele.quantity;
    totalQty += ele.quantity;
    let cartProduct = document.createElement("div");
    cartProduct.className += "cart-product";

    let cartProductTitle = document.createElement("div");
    cartProductTitle.className += "cart-product-name";
    cartProductTitle.innerHTML = ele.title;

    let cartProductPrice = document.createElement("div");
    cartProductPrice.className += "cart-product-price";
    cartProductPrice.innerHTML = ele.price;

    let cartProductQty = document.createElement("div");
    cartProductQty.className += "cart-product-quantity";
    cartProductQty.innerHTML = ele.quantity;

    let removeBtn = document.createElement("button");
    removeBtn.className += "remove-btn";
    removeBtn.innerHTML = "Remove";
    removeBtn.addEventListener("click", () => {
      removeFromCart(ele.id);
    });

    cartProduct.append(
      cartProductTitle,
      cartProductPrice,
      cartProductQty,
      removeBtn
    );

    cartProductSection.appendChild(cartProduct);
  });
  let qty = document.createElement("div");
  qty.className += "total-qty";
  if (totalPrice != 0) {
    empty.innerHTML = "";

    qty.innerHTML = `Total Quantity : ${totalQty}`;
    let price = document.createElement("div");
    price.innerHTML = `Total Price : ${totalPrice.toFixed(2)}`;

    cartProductSection.append(qty, price);
  } else {
    cartProductSection.innerHTML = "";
    empty.innerHTML = "Empty...";
  }
};
