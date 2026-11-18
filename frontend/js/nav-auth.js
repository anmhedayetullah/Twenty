const accountLink = document.querySelector('a[aria-label="Account"]');

function clearStoredSession() {
    localStorage.removeItem("twentyAuthToken");
    localStorage.removeItem("twentyCurrentUser");
    localStorage.removeItem("twentyAdminLoggedIn");
    sessionStorage.removeItem("twentyAdminLoggedIn");
}

async function initializeAccountMenu() {
    if (!accountLink) return;

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("twentyCurrentUser"));
    } catch (error) {
        user = null;
    }

    const token = localStorage.getItem("twentyAuthToken");
    if (!token || !user) return;

    try {
        const response = await fetch("https://twenty-topaz-six.vercel.app/api/auth/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Expired session");
        user = await response.json();
        localStorage.setItem("twentyCurrentUser", JSON.stringify(user));
    } catch (error) {
        clearStoredSession();
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "relative";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.className = "w-9 h-9 rounded-full bg-dark text-white flex items-center justify-center text-sm font-bold";
    trigger.textContent = (user.name || user.email || "U").charAt(0).toUpperCase();

    const menu = document.createElement("div");
    menu.setAttribute("role", "menu");
    menu.className = "hidden absolute right-0 top-12 w-52 border border-gray-200 bg-white shadow-xl py-2 z-[120]";

    const links = user.role === "admin"
        ? [
            ["Profile", "admin.html"],
            ["Admin Dashboard", "admin-dash.html"],
        ]
        : [
            ["Profile", "login.html"],
            ["Dashboard", "orders.html"],
        ];

    menu.innerHTML = links.map(([label, href]) =>
        `<a role="menuitem" href="${href}" class="block px-4 py-2.5 text-sm hover:bg-cream hover:text-coral">${label}</a>`
    ).join("") + `
        <button id="nav-logout" role="menuitem" type="button"
            class="w-full text-left px-4 py-2.5 text-sm text-red-600 border-t border-gray-100 hover:bg-red-50">
            Logout
        </button>
    `;

    trigger.addEventListener("click", () => {
        const open = menu.classList.toggle("hidden") === false;
        trigger.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (event) => {
        if (!wrapper.contains(event.target)) {
            menu.classList.add("hidden");
            trigger.setAttribute("aria-expanded", "false");
        }
    });

    wrapper.append(trigger, menu);
    accountLink.replaceWith(wrapper);

    document.getElementById("nav-logout").addEventListener("click", () => {
        clearStoredSession();
        window.location.href = "login.html";
    });
}

initializeAccountMenu();
