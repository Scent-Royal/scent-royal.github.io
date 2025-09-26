document.addEventListener("DOMContentLoaded", () => {
    // Use digits-only international phone (no +). If you include + it will be stripped.
    const YOUR_WHATSAPP_NUMBER = "923493546246";

    fetch("products.json")
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch products.json: " + res.status);
            return res.json();
        })
        .then(products => renderTable(products || [], YOUR_WHATSAPP_NUMBER))
        .catch(err => {
            console.error("Error fetching products.json:", err);
            const tbody = document.querySelector("#productTable tbody");
            // FIX 1: Added backticks to fix syntax error for the error message
            if (tbody) tbody.innerHTML = `<tr><td colspan="5">Error loading products — check console.</td></tr>`;
        });

    function renderTable(products, whatsappNumber) {
        const tbody = document.querySelector("#productTable tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (!Array.isArray(products) || products.length === 0) {
            // FIX 2: Added backticks to fix syntax error for the 'no products' message
            tbody.innerHTML = `<tr><td colspan="5">No products found.</td></tr>`;
            return;
        }

        products.forEach((product, idx) => {
            // safe text for wa message
            const message = (product.whatsapp_message && product.whatsapp_message.trim())
                ? product.whatsapp_message
                // FIX 3: Added backticks to fix syntax error for the default message
                : `Hi, I'm interested in ${product.name || "this product"}`;

            const whatsappLink = whatsappNumber
                ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
                : "#";

            // escape name/desc so innerHTML doesn't break
            const safeName = escapeHtml(product.name || "");
            const safeDesc = escapeHtml(product.description || "");
            // escape double quotes inside URL attribute
            const safeImg = (product.image || "").replace(/"/g, "&quot;");

            tbody.innerHTML += `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${safeName}</td>
                    <td>${safeDesc}</td>
                    <td>
                        <button class="buy-btn" title="Buy on WhatsApp: ${whatsappLink}" data-walink="${whatsappLink}">
                            <i class="fa fa-shopping-cart"></i>
                        </button>
                    </td>
                    <td>
                        <button class="pic-btn" title="View Picture" data-image="${safeImg}">
                            <i class="fa fa-camera"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        // Attach listeners AFTER building the table
        document.querySelectorAll(".buy-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const url = btn.getAttribute("data-walink");
                if (!url || url === "#") {
                    alert("WhatsApp number not configured. Edit script.js");
                    return;
                }
                window.open(url, "_blank", "noopener");
            });
        });

        // Modal wiring — matches your index.html: id="imageModal", id="modalImage", class="close-btn"
        const modal = document.getElementById("imageModal");
        const modalImg = document.getElementById("modalImage");
        const closeBtn = document.querySelector(".close-btn");

        document.querySelectorAll(".pic-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const imgSrc = btn.getAttribute("data-image");
                if (!imgSrc) {
                    alert("No image URL provided for this product.");
                    return;
                }
                // Set src and show modal
                modalImg.src = imgSrc;
                modalImg.alt = btn.closest("tr").querySelector("td:nth-child(2)")?.textContent || "Product image";

                // if image fails to load, hide modal and alert user
                modalImg.onerror = () => {
                    modal.style.display = "none";
                    alert("Unable to load image. Open the image URL directly to debug (CORS/invalid URL).");
                };

                modal.style.display = "block";
            });
        });

        if (closeBtn) closeBtn.addEventListener("click", () => modal.style.display = "none");
        window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
        window.addEventListener("keydown", e => { if (e.key === "Escape") modal.style.display = "none"; });
    }

    // simple HTML-escape to avoid broken markup when using innerHTML
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
});
