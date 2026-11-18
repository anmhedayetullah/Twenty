/* ==========================================
   TWENTY — GLOBAL MOTION & ANIMATIONS
========================================== */

const _nativeAlert = window.alert.bind(window);
window.alert = function (msg) {
    if (typeof msg === "string" && /added to (your )?cart/i.test(msg)) {
        return;
    }
    _nativeAlert(msg);
};

document.addEventListener("DOMContentLoaded", () => {

    // 1. TOP CORAL PAGE PROGRESS BAR
    const progressBar = document.createElement("div");
    progressBar.id = "twenty-progress-bar";
    document.body.prepend(progressBar);

    requestAnimationFrame(() => {
        progressBar.style.width = "100%";
        setTimeout(() => {
            progressBar.style.opacity = "0";
        }, 400);
    });

    document.querySelectorAll("a[href]").forEach(link => {
        link.addEventListener("click", () => {
            const href = link.getAttribute("href");
            if (
                href &&
                !href.startsWith("#") &&
                !href.startsWith("javascript:") &&
                link.target !== "_blank"
            ) {
                progressBar.style.opacity = "1";
                progressBar.style.width = "75%";
            }
        });
    });

    // 2. STICKY GLASS NAVBAR ON SCROLL
    const header = document.querySelector("header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 25) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }, { passive: true });
    }

    // 3. SCROLL REVEAL OBSERVER
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    });

    function registerRevealElements(root = document) {
        const selectors = [
            "main > section:not(:first-child)",
            "#collections a",
            ".product-card",
            "#orders-container > div",
            "#admin-orders-list > div",
            "#shipping, #returns, #privacy",
            "footer .grid > div"
        ];

        const elements = root.querySelectorAll(selectors.join(", "));
        elements.forEach((el, idx) => {
            if (!el.classList.contains("reveal-up")) {
                el.classList.add("reveal-up");
                const staggerDelay = (idx % 4) * 90;
                el.style.setProperty("--reveal-delay", `${staggerDelay}ms`);
                revealObserver.observe(el);
            }
        });
    }

    registerRevealElements();

    const dynamicTargets = [
        "new-arrivals",
        "shop-products",
        "orders-container",
        "admin-orders-list"
    ];

    dynamicTargets.forEach(id => {
        const target = document.getElementById(id);
        if (target) {
            const mutationObserver = new MutationObserver(() => {
                registerRevealElements(target);
            });
            mutationObserver.observe(target, { childList: true });
        }
    });

    // 4. CART BADGE VISIBILITY & POP ANIMATION
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) {
        function syncCartBadge() {
            const count = parseInt(cartCountEl.textContent.trim(), 10) || 0;
            if (count > 0) {
                cartCountEl.classList.remove("hidden");
            } else {
                cartCountEl.classList.add("hidden");
            }
        }

        syncCartBadge();

        const badgeObserver = new MutationObserver(() => {
            syncCartBadge();
            if ((parseInt(cartCountEl.textContent.trim(), 10) || 0) > 0) {
                cartCountEl.classList.remove("badge-pop");
                void cartCountEl.offsetWidth;
                cartCountEl.classList.add("badge-pop");
            }
        });
        badgeObserver.observe(cartCountEl, { childList: true, characterData: true, subtree: true });
    }

    // 5. UNIVERSAL MOBILE MENU FALLBACK (Works on all pages)
    const headerEl = document.querySelector("header");
    const menuBtn = document.getElementById("menu-toggle")
        || document.getElementById("mobile-menu-btn")
        || document.getElementById("menu-btn")
        || (headerEl ? headerEl.querySelector("button.md\\:hidden") : null);

    if (headerEl && menuBtn) {
        let mobileDrawer = document.getElementById("mobile-menu");

        if (!mobileDrawer) {
            mobileDrawer = document.createElement("div");
            mobileDrawer.id = "mobile-menu";
            mobileDrawer.className = "hidden md:hidden px-6 pb-5 pt-2 space-y-3 text-sm font-medium border-t border-gray-100 bg-white";
            mobileDrawer.innerHTML = `
                <a href="index.html" class="block py-1.5 hover:text-coral">Home</a>
                <a href="shop.html" class="block py-1.5 hover:text-coral">Shop</a>
                <a href="shop.html?category=men" class="block py-1.5 hover:text-coral">Men</a>
                <a href="shop.html?category=women" class="block py-1.5 hover:text-coral">Women</a>
                <a href="shop.html?category=accessories" class="block py-1.5 hover:text-coral">Accessories</a>
                <a href="orders.html" class="block py-1.5 hover:text-coral">My Orders</a>
                <a href="login.html" class="block py-1.5 hover:text-coral">Account</a>
                <a href="contact.html" class="block py-1.5 hover:text-coral">Contact Us</a>
            `;
            headerEl.appendChild(mobileDrawer);
        }

        if (menuBtn.id !== "menu-toggle") {
            menuBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                mobileDrawer.classList.toggle("hidden");
            });
        }
    }

    // 6. BANGLADESH REGION & DISTRICT SELECTOR ON CHECKOUT PAGE
    if (window.location.pathname.endsWith("checkout.html")) {
        const bdCheckoutLocations = {
            "Dhaka": [
                "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj",
                "Madaripur", "Manikganj", "Munshiganj", "Narayanganj",
                "Narsingdi", "Rajbari", "Shariatpur", "Tangail"
            ],
            "Chattogram": [
                "Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla",
                "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"
            ],
            "Rajshahi": [
                "Bogura", "Chapainawabganj", "Joypurhat", "Naogaon",
                "Natore", "Pabna", "Rajshahi", "Sirajganj"
            ],
            "Khulna": [
                "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna",
                "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"
            ],
            "Barishal": [
                "Barguna", "Barishal", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur"
            ],
            "Sylhet": [
                "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"
            ],
            "Rangpur": [
                "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat",
                "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"
            ],
            "Mymensingh": [
                "Jamalpur", "Mymensingh", "Netrokona", "Sherpur"
            ]
        };

        const cityInput = document.getElementById("customer-city")
            || document.getElementById("city")
            || document.querySelector('input[name="city"]')
            || document.querySelector('input[placeholder*="City" i], input[placeholder*="District" i]');

        if (cityInput && cityInput.parentElement) {
            const fieldWrapper = cityInput.parentElement;
            const originalId = cityInput.id || "customer-city";
            const originalName = cityInput.name || "city";
            const inputClass = cityInput.className || "w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-coral";

            const locationGrid = document.createElement("div");
            locationGrid.className = "grid grid-cols-1 sm:grid-cols-2 gap-4";
            locationGrid.innerHTML = `
                <div>
                    <label for="checkout-region" class="block text-xs uppercase tracking-wider font-semibold mb-2">
                        Region *
                    </label>
                    <select id="checkout-region" required class="${inputClass} bg-white">
                        <option value="">Select Region</option>
                        ${Object.keys(bdCheckoutLocations).map(r => `<option value="${r}">${r}</option>`).join("")}
                    </select>
                </div>
                <div>
                    <label for="${originalId}" class="block text-xs uppercase tracking-wider font-semibold mb-2">
                        District *
                    </label>
                    <select id="${originalId}" name="${originalName}" required disabled class="${inputClass} bg-gray-50 disabled:cursor-not-allowed">
                        <option value="">Select Region First</option>
                    </select>
                </div>
            `;

            fieldWrapper.replaceWith(locationGrid);

            const regionSelect = document.getElementById("checkout-region");
            const districtSelect = document.getElementById(originalId);

            function fillCheckoutDistricts(region, selectedDist = "") {
                const list = bdCheckoutLocations[region] || [];
                if (!list.length) {
                    districtSelect.innerHTML = '<option value="">Select Region First</option>';
                    districtSelect.disabled = true;
                    districtSelect.classList.add("bg-gray-50");
                    districtSelect.classList.remove("bg-white");
                    return;
                }
                districtSelect.disabled = false;
                districtSelect.classList.remove("bg-gray-50");
                districtSelect.classList.add("bg-white");
                districtSelect.innerHTML = '<option value="">Select District</option>' +
                    list.map(d => `<option value="${d}" ${d === selectedDist ? "selected" : ""}>${d}</option>`).join("");
                districtSelect.dispatchEvent(new Event("change", { bubbles: true }));
            }

            regionSelect.addEventListener("change", () => {
                fillCheckoutDistricts(regionSelect.value);
            });

            // Auto-fill from saved Member Profile if logged in
            const savedUser = JSON.parse(localStorage.getItem("twentyCurrentUser"));
            if (savedUser) {
                const nameEl = document.getElementById("customer-name") || document.getElementById("name") || document.querySelector('input[name="name"]');
                const emailEl = document.getElementById("customer-email") || document.getElementById("email") || document.querySelector('input[type="email"]');
                const phoneEl = document.getElementById("customer-phone") || document.getElementById("phone") || document.querySelector('input[type="tel"]');
                const addrEl = document.getElementById("customer-address") || document.getElementById("address") || document.querySelector('textarea[name="address"], input[name="address"]');

                if (nameEl && !nameEl.value && savedUser.name) nameEl.value = savedUser.name;
                if (emailEl && !emailEl.value && savedUser.email) emailEl.value = savedUser.email;
                if (phoneEl && !phoneEl.value && savedUser.phone) phoneEl.value = savedUser.phone;
                if (addrEl && !addrEl.value && savedUser.address) addrEl.value = savedUser.address;

                if (savedUser.region && bdCheckoutLocations[savedUser.region]) {
                    regionSelect.value = savedUser.region;
                    fillCheckoutDistricts(savedUser.region, savedUser.district || savedUser.city || "");
                }
            }
        }
    }

});