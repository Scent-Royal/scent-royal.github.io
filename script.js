document.addEventListener("DOMContentLoaded", () => {
    // ⚠️ IMPORTANT: Your products.json must include a 'price' field for each product.
    // Example: { "id": 1, "name": "Rose Bloom", "price": "Rs. 2500", "description": "...", "image": "..." }
    
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
            // Colspan updated from 5 to 6
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Error loading products — check console.</td></tr>`;
        });

    function renderTable(products, whatsappNumber) {
        const tbody = document.querySelector("#productTable tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (!Array.isArray(products) || products.length === 0) {
            // Colspan updated from 5 to 6
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No products found.</td></tr>`;
            return;
        }

        // Use a DocumentFragment or insertAdjacentHTML for better performance than innerHTML +=
        // const fragment = document.createDocumentFragment();

        products.forEach((product, idx) => {
            // safe text for wa message
            const defaultMessage = `Hi, I'm interested in ${product.name || "this product"}${product.price ? ` priced at ${product.price}` : ""}.`;
            const message = (product.whatsapp_message && product.whatsapp_message.trim())
                ? product.whatsapp_message
                : defaultMessage;

            const whatsappLink = whatsappNumber
                ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
                : "#";

            // escape name/desc/price so innerHTML doesn't break
            const safeName = escapeHtml(product.name || "");
            const safeDesc = escapeHtml(product.description || "");
            const safePrice = escapeHtml(product.price || "N/A"); // Handle missing price
            // escape double quotes inside URL attribute
            const safeImg = (product.image || "").replace(/"/g, "&quot;");

            const rowHtml = `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${safeName}</td>
                    <td>${safeDesc}</td>
                    <td class="col-price">${safePrice}</td> <td>
                        <button class="buy-btn" title="Buy on WhatsApp: ${safeName}" data-walink="${whatsappLink}">
                            <i class="fa fa-shopping-cart"></i> Buy
                        </button>
                    </td>
                    <td>
                        <button class="pic-btn" title="View Picture" data-image="${safeImg}">
                            <i class="fa fa-camera"></i>
                        </button>
                    </td>
                </tr>
            `;
            
            // Append the row to the tbody efficiently
            tbody.insertAdjacentHTML('beforeend', rowHtml);
        });

        // --- Event Listeners for Buy and Picture Buttons ---

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
                
                // Set alt text to the product name
                const productName = btn.closest("tr").querySelector("td:nth-child(2)")?.textContent || "Product image";
                
                // Set src and show modal
                modalImg.src = imgSrc;
                modalImg.alt = productName;

                // if image fails to load, hide modal and alert user
                modalImg.onerror = () => {
                    modal.style.display = "none";
                    alert(`Unable to load image for: ${productName}. Check the image URL for issues (e.g., CORS/invalid URL).`);
                };

                modal.style.display = "block";
            });
        });

        // Modal closing listeners
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
