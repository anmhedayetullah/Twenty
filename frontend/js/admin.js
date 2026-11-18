/* ==========================================
   TWENTY — ADMIN DASHBOARD FUNCTIONALITY
========================================== */

const API_BASE = "http://localhost:5000/api";
let dashboardOrders = [];

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
        if (totalItems > 0) {
            counter.classList.remove("hidden");
        } else {
            counter.classList.add("hidden");
        }
    }
}

// 3. HELPERS
function getAuthHeaders() {
    const token = localStorage.getItem("twentyAuthToken");
    return token
        ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };
}

async function getOrders() {
    if (dashboardOrders.length) return dashboardOrders;
    const response = await fetch(`${API_BASE}/orders`);
    if (!response.ok) return JSON.parse(localStorage.getItem("twentyOrders")) || [];
    dashboardOrders = await response.json();
    return dashboardOrders;
}

async function loadDashboard() {
    const response = await fetch(`${API_BASE}/orders/admin/dashboard`, { headers: getAuthHeaders() });
    if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("twentyAdminLoggedIn");
        await checkAdminSession();
        return;
    }
    if (!response.ok) return;
    const data = await response.json();
    dashboardOrders = data.orders;
    if (data.stats) {
        document.getElementById("stat-total-orders").textContent = data.stats.totalOrders;
        document.getElementById("stat-revenue").textContent = formatPrice(data.stats.revenue);
        document.getElementById("stat-pending").textContent = data.stats.pendingOrders;
        document.getElementById("stat-delivered").textContent = data.stats.deliveredOrders;
        document.getElementById("stat-customers").textContent = data.stats.customers;
        document.getElementById("stat-products").textContent = data.stats.products;
    }
    renderDashboard();
}

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

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "Confirmed":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "Shipped":
            return "bg-purple-50 text-purple-700 border-purple-200";
        case "Delivered":
            return "bg-green-50 text-green-700 border-green-200";
        case "Cancelled":
            return "bg-red-50 text-red-700 border-red-200";
        default:
            return "bg-amber-50 text-amber-700 border-amber-200";
    }
}

function getQuickActionButtons(orderId, status) {
    if (status === "Pending") {
        return `
            <button onclick="changeOrderStatus('${orderId}', 'Confirmed')"
                class="bg-blue-600 text-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-blue-700 transition">
                Confirm Order
            </button>
            <button onclick="changeOrderStatus('${orderId}', 'Shipped')"
                class="bg-dark text-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-coral transition">
                Mark Shipped
            </button>
        `;
    }
    if (status === "Confirmed") {
        return `
            <button onclick="changeOrderStatus('${orderId}', 'Shipped')"
                class="bg-purple-600 text-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-purple-700 transition">
                Mark Shipped
            </button>
        `;
    }
    if (status === "Shipped") {
        return `
            <button onclick="changeOrderStatus('${orderId}', 'Delivered')"
                class="bg-green-600 text-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-green-700 transition">
                Mark Delivered
            </button>
        `;
    }
    return "";
}

// 4. ADMIN SESSION CHECK
async function checkAdminSession() {
    const loginBox = document.getElementById("admin-login-box");
    const dashboard = document.getElementById("admin-dashboard");

    const token = localStorage.getItem("twentyAuthToken");
    if (!token) {
        loginBox.classList.remove("hidden");
        dashboard.classList.add("hidden");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
        const user = await response.json();
        if (!response.ok || user.role !== "admin") throw new Error("Admin access required");
        loginBox.classList.add("hidden");
        dashboard.classList.remove("hidden");
        await loadDashboard();
    } catch (error) {
        loginBox.classList.remove("hidden");
        dashboard.classList.add("hidden");
    }
}

document.getElementById("admin-login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const enteredUser = document.getElementById("admin-username-input").value.trim();
    const enteredPass = document.getElementById("admin-password-input").value;
    const errorMsg = document.getElementById("admin-login-error");

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: enteredUser, password: enteredPass })
        });
        const data = await response.json();
        if (!response.ok || data.user?.role !== "admin") {
            throw new Error(data.message || "Invalid admin account");
        }
        localStorage.setItem("twentyAuthToken", data.token);
        localStorage.setItem("twentyCurrentUser", JSON.stringify(data.user));
        sessionStorage.setItem("twentyAdminLoggedIn", "true");
        errorMsg.classList.add("hidden");
        document.getElementById("admin-login-form").reset();
        await checkAdminSession();
    } catch (error) {
        errorMsg.textContent = error.message || "Unable to sign in. Please try again.";
        errorMsg.classList.remove("hidden");
    }
});

document.getElementById("admin-logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("twentyAdminLoggedIn");
    checkAdminSession();
});

// 5. UPDATE DASHBOARD STATS
function updateStats(orders) {
    const totalOrders = orders.length;
    const revenue = orders
        .filter(o => o.status !== "Cancelled")
        .reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);
    const pendingCount = orders.filter(o => (o.status || "Pending") === "Pending").length;
    const deliveredCount = orders.filter(o => o.status === "Delivered").length;

    document.getElementById("stat-total-orders").textContent = totalOrders;
    document.getElementById("stat-revenue").textContent = formatPrice(revenue);
    document.getElementById("stat-pending").textContent = pendingCount;
    document.getElementById("stat-delivered").textContent = deliveredCount;
}

// 6. RENDER ORDERS IN ADMIN PANEL
async function renderDashboard() {
    const allOrders = dashboardOrders.length ? dashboardOrders : await getOrders();
    updateStats(allOrders);

    const statusFilter = document.getElementById("admin-status-filter").value;
    const searchQuery = document.getElementById("admin-search").value.trim().toLowerCase();
    const container = document.getElementById("admin-orders-list");

    let filtered = allOrders.slice().reverse();

    if (statusFilter !== "All") {
        filtered = filtered.filter(o => (o.status || "Pending") === statusFilter);
    }

    if (searchQuery) {
        filtered = filtered.filter(o => {
            const idMatch = (o.orderId || "").toLowerCase().includes(searchQuery);
            const nameMatch = (o.customer?.fullName || "").toLowerCase().includes(searchQuery);
            const phoneMatch = (o.customer?.phone || "").toLowerCase().includes(searchQuery);
            return idMatch || nameMatch || phoneMatch;
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="border border-gray-200 p-12 text-center bg-white">
                <p class="text-sm text-gray-500">No orders found matching the current filter.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(order => {
        const currentStatus = order.status || "Pending";
        const badgeClass = getStatusBadgeClass(currentStatus);
        const quickButtons = getQuickActionButtons(order.orderId, currentStatus);
        const adminNote = escapeHtml(order.adminNote || "");

        const itemsList = order.items.map(item => {
            const variantText = item.color
                ? `(Size: ${item.size}, Color: ${item.color})`
                : `(Size: ${item.size})`;

            return `
                <div class="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-b-0">
                    <span>
                        <strong class="text-dark">${escapeHtml(item.name)}</strong>
                        <span class="text-gray-500">${variantText} × ${item.quantity}</span>
                    </span>
                    <span class="font-semibold">${formatPrice(Number(item.price) * Number(item.quantity))}</span>
                </div>
            `;
        }).join("");

        return `
            <div class="border border-gray-200 bg-white">
                <!-- Header -->
                <div class="bg-cream px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div class="flex flex-wrap items-center gap-6">
                        <div>
                            <span class="text-[11px] uppercase text-gray-500 block">Order ID</span>
                            <span class="text-sm font-bold text-dark">${escapeHtml(order.orderId)}</span>
                        </div>
                        <div>
                            <span class="text-[11px] uppercase text-gray-500 block">Date</span>
                            <span class="text-xs font-medium text-dark">${formatDate(order.createdAt)}</span>
                        </div>
                        <div>
                            <span class="text-[11px] uppercase text-gray-500 block">Payment</span>
                            <span class="text-xs font-medium text-dark">
                                ${escapeHtml(order.payment?.method || "COD")}
                                ${order.payment?.trxId ? `<strong class="text-coral">[${escapeHtml(order.payment.trxId)}]</strong>` : ""}
                            </span>
                        </div>
                        <div>
                            <span class="text-[11px] uppercase text-gray-500 block">Status</span>
                            <span class="inline-block border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${badgeClass}">
                                ${currentStatus}
                            </span>
                        </div>
                    </div>

                    <!-- Actions & Controls -->
                    <div class="flex flex-wrap items-center gap-2.5">
                        ${quickButtons}

                        <button onclick="printInvoice('${order.orderId}')"
                            class="border border-gray-300 bg-white text-dark px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:border-coral hover:text-coral transition">
                            Print Invoice
                        </button>

                        <select onchange="changeOrderStatus('${order.orderId}', this.value)"
                            aria-label="Change order status"
                            class="border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider focus:outline-none focus:border-coral">
                            <option value="Pending" ${currentStatus === "Pending" ? "selected" : ""}>Pending</option>
                            <option value="Confirmed" ${currentStatus === "Confirmed" ? "selected" : ""}>Confirmed</option>
                            <option value="Shipped" ${currentStatus === "Shipped" ? "selected" : ""}>Shipped</option>
                            <option value="Delivered" ${currentStatus === "Delivered" ? "selected" : ""}>Delivered</option>
                            <option value="Cancelled" ${currentStatus === "Cancelled" ? "selected" : ""}>Cancelled</option>
                        </select>

                        <button onclick="deleteOrder('${order.orderId}')"
                            class="text-xs text-gray-400 hover:text-red-600 underline px-2">
                            Delete
                        </button>
                    </div>
                </div>

                <!-- Body -->
                <div class="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <!-- Customer Details -->
                    <div class="md:col-span-5 text-xs space-y-1.5 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                        <p class="uppercase tracking-wider text-gray-400 font-semibold mb-2">Customer Details</p>
                        <p><strong class="text-dark">Name:</strong> ${escapeHtml(order.customer?.fullName)}</p>
                        <p><strong class="text-dark">Phone:</strong> ${escapeHtml(order.customer?.phone)}</p>
                        ${order.customer?.email ? `<p><strong class="text-dark">Email:</strong> ${escapeHtml(order.customer.email)}</p>` : ""}
                        <p><strong class="text-dark">Area:</strong> ${order.customer?.city === "outside" ? "Outside Dhaka" : "Inside Dhaka"}</p>
                        <p><strong class="text-dark">Address:</strong> ${escapeHtml(order.customer?.address)}</p>
                        ${order.customer?.notes ? `<p class="text-coral"><strong class="text-dark">Customer Note:</strong> ${escapeHtml(order.customer.notes)}</p>` : ""}
                    </div>

                    <!-- Ordered Items -->
                    <div class="md:col-span-7 flex flex-col justify-between">
                        <div>
                            <p class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Ordered Items</p>
                            ${itemsList}
                        </div>

                        <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
                            <span class="text-gray-500 text-xs">
                                Subtotal: ${formatPrice(order.subtotal)} · Delivery: ${order.delivery === 0 ? "FREE" : formatPrice(order.delivery)}
                            </span>
                            <span class="font-bold text-base text-coral">
                                Total: ${formatPrice(order.grandTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Admin Internal Note Footer -->
                <div class="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                    <label for="note-${order.orderId}" class="text-[11px] uppercase tracking-wider font-semibold text-gray-500 shrink-0">
                        Admin Note:
                    </label>
                    <input type="text" id="note-${order.orderId}" value="${adminNote}"
                        placeholder="Add courier info, tracking ID, or internal note..."
                        class="flex-grow border border-gray-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:border-coral">
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" onclick="saveAdminNote('${order.orderId}')"
                            class="bg-dark text-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-coral transition">
                            Save Note
                        </button>
                        <span id="note-saved-${order.orderId}" class="hidden text-xs text-green-600 font-semibold">
                            Saved!
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// 7. UPDATE ORDER STATUS
async function changeOrderStatus(orderId, newStatus) {
    const order = dashboardOrders.find(item => item.orderId === orderId);
    if (!order?._id) return;
    await fetch(`${API_BASE}/orders/${order._id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
    });
    await loadDashboard();
}

// 8. SAVE ADMIN INTERNAL NOTE
async function saveAdminNote(orderId) {
    const input = document.getElementById(`note-${orderId}`);
    if (!input) return;

    const order = dashboardOrders.find(item => item.orderId === orderId);
    if (order?._id) {
        await fetch(`${API_BASE}/orders/${order._id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ adminNote: input.value.trim() })
        });
        const badge = document.getElementById(`note-saved-${orderId}`);
        if (badge) {
            badge.classList.remove("hidden");
            setTimeout(() => badge.classList.add("hidden"), 2000);
        }
    }
}

// 9. PRINT INVOICE / PARCEL SLIP
async function printInvoice(orderId) {
    const orders = await getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
        alert("Please allow pop-ups in your browser to print the invoice.");
        return;
    }

    const rowsHtml = order.items.map((item, idx) => `
        <tr>
            <td style="padding:10px; border-bottom:1px solid #eee;">${idx + 1}</td>
            <td style="padding:10px; border-bottom:1px solid #eee;"><strong>${escapeHtml(item.name)}</strong></td>
            <td style="padding:10px; border-bottom:1px solid #eee;">${escapeHtml(item.size)}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${formatPrice(item.price)}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right; font-weight:600;">${formatPrice(Number(item.price) * Number(item.quantity))}</td>
        </tr>
    `).join("");

    const invoiceHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Invoice ${escapeHtml(order.orderId)} — TWENTY</title>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'DM Sans', sans-serif; color: #171717; padding: 40px; max-width: 720px; margin: auto; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #171717; padding-bottom: 20px; margin-bottom: 28px; }
                .brand { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin: 0; }
                .dot { color: #D85A30; }
                .sub { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #666; margin-top: 4px; }
                .meta { text-align: right; font-size: 13px; line-height: 1.6; }
                .box { background: #F8F5F0; padding: 18px; margin-bottom: 24px; font-size: 13px; line-height: 1.7; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; }
                th { background: #171717; color: #fff; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
                .totals { width: 280px; margin-left: auto; font-size: 13px; }
                .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
                .grand { border-top: 2px solid #171717; font-size: 16px; font-weight: 700; color: #D85A30; padding-top: 10px !important; margin-top: 6px; }
                .footer { margin-top: 48px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 16px; }
                @media print { body { padding: 16px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1 class="brand">twenty<span class="dot">.</span></h1>
                    <p class="sub">Everyday Fashion</p>
                </div>
                <div class="meta">
                    <div style="font-size:18px; font-weight:700;">INVOICE</div>
                    <div><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</div>
                    <div><strong>Date:</strong> ${formatDate(order.createdAt)}</div>
                    <div><strong>Status:</strong> ${escapeHtml(order.status || "Pending")}</div>
                </div>
            </div>

            <div class="box">
                <div style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#D85A30; font-weight:700; margin-bottom:6px;">Deliver To</div>
                <div><strong>${escapeHtml(order.customer?.fullName)}</strong></div>
                <div>Phone: ${escapeHtml(order.customer?.phone)}</div>
                ${order.customer?.email ? `<div>Email: ${escapeHtml(order.customer.email)}</div>` : ""}
                <div>Address: ${escapeHtml(order.customer?.address)} (${order.customer?.city === "outside" ? "Outside Dhaka" : "Inside Dhaka"})</div>
                <div>Payment: <strong>${escapeHtml(order.payment?.method || "Cash on Delivery")}</strong> ${order.payment?.trxId ? `(TrxID: ${escapeHtml(order.payment.trxId)})` : ""}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Size</th>
                        <th style="text-align:center;">Qty</th>
                        <th style="text-align:right;">Price</th>
                        <th style="text-align:right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <div class="totals">
                <div><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
                <div><span>Delivery Charge</span><span>${order.delivery === 0 ? "FREE" : formatPrice(order.delivery)}</span></div>
                <div class="grand"><span>Total Payable</span><span>${formatPrice(order.grandTotal)}</span></div>
            </div>

            ${order.adminNote ? `<p style="font-size:12px; color:#555; margin-top:20px;"><strong>Note:</strong> ${escapeHtml(order.adminNote)}</p>` : ""}

            <div class="footer">
                Thank you for shopping with TWENTY — Everyday Fashion. Everyday You.
            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
}

// 10. EXPORT ALL ORDERS AS CSV
async function exportOrdersCSV() {
    const orders = dashboardOrders.length ? dashboardOrders : await getOrders();
    if (orders.length === 0) {
        alert("No orders available to export.");
        return;
    }

    const headers = [
        "Order ID",
        "Date",
        "Status",
        "Customer Name",
        "Phone",
        "Email",
        "Area",
        "Address",
        "Items",
        "Subtotal",
        "Delivery",
        "Grand Total",
        "Payment Method",
        "TrxID",
        "Admin Note"
    ];

    const csvEscape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = orders.map(order => {
        const itemsSummary = (order.items || [])
            .map(i => `${i.name} (Size: ${i.size}) x${i.quantity}`)
            .join(" | ");

        return [
            order.orderId,
            formatDate(order.createdAt),
            order.status || "Pending",
            order.customer?.fullName || "",
            order.customer?.phone || "",
            order.customer?.email || "",
            order.customer?.city === "outside" ? "Outside Dhaka" : "Inside Dhaka",
            order.customer?.address || "",
            itemsSummary,
            order.subtotal || 0,
            order.delivery || 0,
            order.grandTotal || 0,
            order.payment?.method || "Cash on Delivery",
            order.payment?.trxId || "",
            order.adminNote || ""
        ].map(csvEscape).join(",");
    });

    const csvContent = "\uFEFF" + [headers.map(csvEscape).join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `twenty-orders-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 11. DELETE ORDER
async function deleteOrder(orderId) {
    if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;
    const order = dashboardOrders.find(item => item.orderId === orderId);
    if (!order?._id) return;
    const response = await fetch(`${API_BASE}/orders/${order._id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (response.ok) await loadDashboard();
}

// 12. EVENT LISTENERS & INITIALIZE
document.getElementById("admin-status-filter").addEventListener("change", renderDashboard);
document.getElementById("admin-search").addEventListener("input", renderDashboard);
document.getElementById("export-csv-btn").addEventListener("click", exportOrdersCSV);

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    checkAdminSession();
});