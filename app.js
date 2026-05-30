// KOFRANO 3D Travel Experience — Application Script
let cart = [];

// Swatch names map
const colorNamesMap = {
    black: "Matte Black",
    silver: "Titanium Silver",
    navy: "Deep Navy",
    champagne: "Champagne Gold",
    banana: "Banana Gold"
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Navigation Scroll Effect
    const header = document.getElementById("main-header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        updateActiveNavLink();
    });

    // 2. Active Nav Link Highlighter
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section");

    function updateActiveNavLink() {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").slice(1) === current) {
                link.classList.add("active");
            }
        });
    }

    // 3. Cart Drawer open/close triggers
    const openCartBtn = document.getElementById("open-cart-btn");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartDrawer = document.getElementById("cart-drawer");

    openCartBtn.addEventListener("click", openCart);
    closeCartBtn.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    function openCart() {
        cartDrawer.classList.add("open");
        cartOverlay.classList.add("open");
    }

    function closeCart() {
        cartDrawer.classList.remove("open");
        cartOverlay.classList.remove("open");
    }

    // 4. Cart Add and Operations
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
            // Get selected configuration
            const productTitle = document.getElementById("product-title").textContent;
            
            const activeSizeBtn = document.querySelector(".size-btn.active");
            const sizeLabel = activeSizeBtn.firstChild.textContent.trim();
            const sizePrice = parseInt(activeSizeBtn.getAttribute("data-price"));
            
            const activeSwatch = document.querySelector(".swatch-btn.active");
            const colorCode = activeSwatch.getAttribute("data-color");
            const colorName = colorNamesMap[colorCode];
            
            // Image mapping
            let itemImg = "nmd_kofrano_black_orange.png";
            if (colorCode === "banana") itemImg = "banana_luggage.png";
            else if (colorCode === "champagne" || colorCode === "silver") itemImg = "nmd_kofrano_collection.png";
            else if (colorCode === "navy") itemImg = "nmd_lifestyle_zurich.png";

            addItemToCart({
                id: `nmd-${colorCode}-${activeSizeBtn.getAttribute("data-size")}`,
                name: `${productTitle}`,
                price: sizePrice,
                img: itemImg,
                color: colorName,
                size: sizeLabel,
                qty: 1
            });
            
            // Animate Add to Cart feedback on button
            gsap.to(addToCartBtn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    openCart(); // Show drawer
                }
            });
        });
    }

    // Quick Add buttons on Collection Cards
    document.querySelectorAll(".quick-add-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const btnEl = e.currentTarget;
            const itemId = btnEl.getAttribute("data-id");
            const name = btnEl.getAttribute("data-name");
            const price = parseInt(btnEl.getAttribute("data-price"));
            const img = btnEl.getAttribute("data-img");
            
            addItemToCart({
                id: `nmd-${itemId}`,
                name: name,
                price: price,
                img: img,
                color: itemId.includes("banana") ? "Banana Gold" : "Matte Black",
                size: "Cabin S",
                qty: 1
            });
            
            openCart();
        });
    });

    function addItemToCart(item) {
        // Check if item already exists
        const existingIdx = cart.findIndex(cartItem => cartItem.id === item.id);
        if (existingIdx > -1) {
            cart[existingIdx].qty += 1;
        } else {
            cart.push(item);
        }
        renderCart();
    }

    window.updateQty = (index, delta) => {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        renderCart();
    };

    function renderCart() {
        const cartContainer = document.getElementById("cart-items-container");
        const emptyMsg = document.getElementById("cart-empty-msg");
        const subtotalVal = document.getElementById("cart-subtotal");
        const cartCount = document.getElementById("cart-count");
        
        // Remove existing items (keep empty message template)
        document.querySelectorAll(".cart-item").forEach(item => item.remove());
        
        if (cart.length === 0) {
            emptyMsg.style.display = "flex";
            subtotalVal.textContent = "€0";
            cartCount.classList.remove("active");
            cartCount.textContent = "0";
            return;
        }
        
        emptyMsg.style.display = "none";
        let subtotal = 0;
        let totalItems = 0;
        
        cart.forEach((item, idx) => {
            subtotal += item.price * item.qty;
            totalItems += item.qty;
            
            const cartItemHTML = `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div>
                            <h3 class="cart-item-name">${item.name}</h3>
                            <div class="cart-item-meta">${item.size} / ${item.color}</div>
                        </div>
                        <div class="cart-item-qty-price">
                            <div class="qty-counter">
                                <button class="qty-btn" onclick="updateQty(${idx}, -1)">-</button>
                                <span class="qty-val">${item.qty}</span>
                                <button class="qty-btn" onclick="updateQty(${idx}, 1)">+</button>
                            </div>
                            <span class="cart-item-price">€${item.price * item.qty}</span>
                        </div>
                    </div>
                </div>
            `;
            cartContainer.insertAdjacentHTML("beforeend", cartItemHTML);
        });
        
        subtotalVal.textContent = `€${subtotal}`;
        cartCount.textContent = totalItems;
        cartCount.classList.add("active");
    }

    // Checkout Alert
    document.getElementById("checkout-btn").addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty. Choose a luxury suitcase to checkout.");
            return;
        }
        alert("Redirecting to NMDTrendz.com secure payment gateway... Integration successful!");
    });


    // 5. GSAP Collection Horizontal Scroll (Desktop)
    if (gsap && ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        
        const container = document.getElementById("horizontal-container");
        
        // MatchMedia to run horizontal scroll only on desktop/tablets (min-width: 1025px)
        ScrollTrigger.matchMedia({
            "(min-width: 1025px)": function() {
                gsap.to(container, {
                    x: () => -(container.scrollWidth - window.innerWidth + window.innerWidth * 0.1),
                    ease: "none",
                    scrollTrigger: {
                        trigger: "#collection",
                        start: "top top",
                        end: () => `+=${container.scrollWidth}`,
                        scrub: 1,
                        pin: true,
                        invalidateOnRefresh: true
                    }
                });
            }
        });

        // 6. GSAP Timeline block animations
        gsap.utils.toArray('.timeline-item').forEach(item => {
            gsap.to(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%",
                    onEnter: () => item.classList.add("visible"),
                    once: true
                }
            });
        });
    }
});
