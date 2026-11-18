/* ==========================================
   TWENTY - SHOPPING CART FUNCTIONALITY
========================================== */


// 1. GET CART DATA

function getCart() {
    return JSON.parse(localStorage.getItem("twentyCart")) || [];
}


// 2. SAVE CART DATA

function saveCart(cart) {
    localStorage.setItem("twentyCart", JSON.stringify(cart));
}


// 3. UPDATE CART COUNTER

function updateCartCount() {

    const cart = getCart();

    const totalItems = cart.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
    );

    const counter = document.getElementById("cart-count");

    if (counter) {
        counter.textContent = totalItems;
    }

}


// 4. FORMAT PRICE

function formatPrice(price) {
    return "৳" + Number(price).toLocaleString("en-BD");
}


// 5. DISPLAY CART ITEMS

function displayCart() {

    const cart = getCart();

    const container = document.getElementById("cart-items");
    const emptyCart = document.getElementById("empty-cart");

    if (!container || !emptyCart) return;

    updateCartCount();

    if (cart.length === 0) {

        container.innerHTML = "";

        emptyCart.classList.remove("hidden");

        updateSummary();

        return;
    }

    emptyCart.classList.add("hidden");

    container.innerHTML = cart.map((item, index) => {

        const itemTotal = Number(item.price) * Number(item.quantity);

        return `

            <div class="cart-item">

                <!-- Product -->
                <div class="cart-product">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                        onerror="this.src='https://placehold.co/300x400/F8F5F0/D85A30?text=TWENTY'"
                    >

                    <div>

                        <h3 class="text-sm font-bold">
                            ${item.name}
                        </h3>

                        <p class="text-xs text-gray-500 mt-2">
                            Size: ${item.size}
                        </p>

                        <p class="text-xs text-gray-500 mt-1">
                            Color: ${item.color}
                        </p>

                        <button
                            class="remove-item"
                            onclick="removeCartItem(${index})">
                            REMOVE
                        </button>

                    </div>

                </div>


                <!-- Price -->
                <div class="cart-price">
                    ${formatPrice(item.price)}
                </div>


                <!-- Quantity -->
                <div class="cart-quantity">

                    <div class="quantity-control">

                        <button
                            onclick="changeCartQuantity(${index}, -1)">
                            −
                        </button>

                        <span>${item.quantity}</span>

                        <button
                            onclick="changeCartQuantity(${index}, 1)">
                            +
                        </button>

                    </div>

                </div>


                <!-- Total -->
                <div class="cart-total">
                    ${formatPrice(itemTotal)}
                </div>

            </div>

        `;

    }).join("");

    updateSummary();

}


// 6. CHANGE QUANTITY

function changeCartQuantity(index, change) {

    const cart = getCart();

    if (!cart[index]) return;

    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    if (cart[index] && cart[index].quantity > 10) {
        cart[index].quantity = 10;
    }

    saveCart(cart);

    displayCart();

}


// 7. REMOVE PRODUCT

function removeCartItem(index) {

    const cart = getCart();

    if (!cart[index]) return;

    cart.splice(index, 1);

    saveCart(cart);

    displayCart();

}


// 8. UPDATE ORDER SUMMARY

function updateSummary() {

    const cart = getCart();

    const subtotal = cart.reduce(
        (sum, item) =>
            sum + Number(item.price) * Number(item.quantity),
        0
    );

    // Free delivery on orders over ৳3000
    const delivery = subtotal === 0 || subtotal >= 3000 ? 0 : 80;

    const total = subtotal + delivery;

    document.getElementById("cart-subtotal").textContent =
        formatPrice(subtotal);

    document.getElementById("delivery-charge").textContent =
        delivery === 0 && subtotal > 0 ? "FREE" : formatPrice(delivery);

    document.getElementById("cart-total").textContent =
        formatPrice(total);

    const shippingMessage = document.getElementById("shipping-message");

    if (subtotal === 0) {

        shippingMessage.textContent =
            "Add products to see delivery information.";

    } else if (subtotal >= 3000) {

        shippingMessage.textContent =
            "Congratulations! You get FREE delivery.";

    } else {

        shippingMessage.textContent =
            "Add " + formatPrice(3000 - subtotal) +
            " more to get FREE delivery.";

    }

}


// 9. CHECKOUT BUTTON

document.getElementById("checkout-button").addEventListener("click", () => {

    const cart = getCart();

    if (cart.length === 0) {

        alert("Your cart is empty! Please add a product first.");

        return;
    }

    window.location.href = "checkout.html";

});


// 10. INITIALIZE

document.addEventListener("DOMContentLoaded", () => {

    displayCart();

    console.log("TWENTY Shopping Cart Loaded!");

});

