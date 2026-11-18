/* ==========================================
   TWENTY — MY ORDERS PAGE FUNCTIONALITY
========================================== */

// 1. MOBILE MENU TOGGLE
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });
}

// 2. UPDATE CART COUNTER
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("twentyCart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
    const counter = document.getElementById("cart-count");

    if (counter) {
        counter.textContent = totalItems;
    }
}

// 3. GET ORDERS (NEWEST FIRST)
function getOrders() {
    const orders = JSON.parse(localStorage.getItem("twentyOrders")) || [];
    return orders.slice().reverse();
}

// 4. FORMAT PRICE & DATE
function formatPrice(price) {
    return "৳" + Number(price).toLocaleString("en-BD");
}

function formatDate(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// 5. STATUS BADGE
function getStatusBadge(status) {
    const current = status || "Pending";

    if (current === "Delivered") {
        return `<span class="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 uppercase tracking-wider">Delivered</span>`;
    }
    if (current === "Shipped") {
        return `<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 uppercase tracking-wider">Shipped</span>`;
    }
    if (current === "Cancelled") {
        return `<span class="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1.5 uppercase tracking-wider">Cancelled</span>`;
    }
    return `<span class="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 uppercase tracking-wider">Pending</span>`;
}

// 6. DISPLAY ORDERS
function renderOrders(searchTerm = "") {
    const container = document.getElementById("orders-container");
    if (!container) return;

    const allOrders = getOrders();

    // Empty State
    if (allOrders.length === 0) {
        container.innerHTML = `
            <div class="bg-cream p-12 md:p-16 text-center">
                <p class="text-coral text-xs tracking-[4px] uppercase font-semibold mb-3">
                    No History Found
                </p>
                <h3 class="text-2xl md:text-3xl font-bold mb-3">
                    You haven't placed any orders yet<span class="text-coral">.</span>
                </h3>
                <p class="text-sm text-gray-500 max-w-md mx-auto mb-8">
                    Explore our everyday essentials and place your first order today.
                </p>
                <a href="shop.html"
                    class="inline-block bg-coral text-white px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:bg-black transition">
                    SHOP NOW →
                </a>
            </div>
        `;
        return;
    }

    // Filter by Order ID or Phone
    const query = searchTerm.trim().toLowerCase();
    const filteredOrders = allOrders.filter(order => {
        const idMatch = (order.orderId || "").toLowerCase().includes(query);
        const phoneMatch = (order.customer?.phone || "").toLowerCase().includes(query);
        return idMatch || phoneMatch;
    });

    if (filteredOrders.length === 0) {
        container.innerHTML = `
            <div class="border border-gray-200 p-12 text-center">
                <p class="text-sm text-gray-500">
                    No orders matched "<strong class="text-dark">${searchTerm}</strong>".
                </p>
            </div>
        `;
        return;
    }

    // Render Order Cards
    container.innerHTML = filteredOrders.map(order => {
        const itemsHtml = order.items.map(item => `
            <div class="flex items-center justify-between gap-4 py-4">
                <div class="flex items-center gap-4">
                    <img src="${item.image}"
                        alt="${item.name}"
                        onerror="this.src='https://placehold.co/150x200/F8F5F0/D85A30?text=TWENTY'"
                        class="w-16 h-20 object-cover bg-cream border border-gray-100">
                    <div>
                        <h4 class="text-sm font-bold text-dark">${item.name}</h4>
                        <p class="text-xs text-gray-500 mt-1">
                            Size: <span class="text-dark font-medium">${item.size}</span> |
                            Color: <span class="text-dark font-medium">${item.color}</span> |
                            Qty: <span class="text-dark font-medium">${item.quantity}</span>
                        </p>
                    </div>
                </div>
                <p class="text-sm font-bold text-dark">
                    ${formatPrice(Number(item.price) * Number(item.quantity))}
                </p>
            </div>
        `).join("");

        return `
            <div class="border border-gray-200 bg-white">
                <!-- Order Top Bar -->
                <div class="bg-cream px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div class="flex flex-wrap items-center gap-6 md:gap-10">
                        <div>
                            <p class="text-[11px] uppercase tracking-wider text-gray-500">Order ID</p>
                            <p class="text-sm font-bold text-dark mt-0.5">${order.orderId}</p>
                        </div>
                        <div>
                            <p class="text-[11px] uppercase tracking-wider text-gray-500">Date</p>
                            <p class="text-xs font-medium text-dark mt-0.5">${formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                            <p class="text-[11px] uppercase tracking-wider text-gray-500">Payment</p>
                            <p class="text-xs font-medium text-dark mt-0.5">
                                ${order.payment?.method || "Cash on Delivery"}
                                ${order.payment?.trxId ? `<span class="text-coral">(TrxID: ${order.payment.trxId})</span>` : ""}
                            </p>
                        </div>
                    </div>

                    <div>
                        ${getStatusBadge(order.status)}
                    </div>
                </div>

                <!-- Ordered Items -->
                <div class="px-6 divide-y divide-gray-100">
                    ${itemsHtml}
                </div>

                <!-- Order Bottom Summary -->
                <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div class="text-gray-600 space-y-1">
                        <p><strong class="text-dark">Deliver to:</strong> ${order.customer?.fullName} (${order.customer?.phone})</p>
                        <p>${order.customer?.address}</p>
                    </div>

                    <div class="sm:text-right">
                        <p class="text-gray-500">
                            Subtotal: ${formatPrice(order.subtotal)} · Delivery: ${order.delivery === 0 ? "FREE" : formatPrice(order.delivery)}
                        </p>
                        <p class="text-base font-bold text-coral mt-1">
                            Total: ${formatPrice(order.grandTotal)}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// 7. SEARCH LISTENER
document.getElementById("order-search").addEventListener("input", (e) => {
    renderOrders(e.target.value);
});

// 8. INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    renderOrders();
});