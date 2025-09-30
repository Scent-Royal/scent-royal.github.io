document.addEventListener("DOMContentLoaded", () => {
    // Use digits-only international phone (no +). If you include + it will be stripped.
    const YOUR_WHATSAPP_NUMBER = "923369410170";

    fetch("products.json")
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch products.json: " + res.status);
            return res.json();
        })
        .then(products => renderTable(products || [], YOUR_WHATSAPP_NUMBER))
        .catch(err => {
            console.error("Error fetching products.json:", err);
            const tbody = document.querySelector("#productTable tbody");
            // Corrected Colspan: 6 columns (S/No, Items, Description, Price, Buy, Picture)
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Error loading products — check console.</td></tr>`;
        });

    function renderTable(products, whatsappNumber) {
        const tbody = document.querySelector("#productTable tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (!Array.isArray(products) || products.length === 0) {
            // Corrected Colspan: 6 columns
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No products found.</td></tr>`;
            return;
        }

        products.forEach((product, idx) => {
            // safe text for wa message (uses existing whatsapp_message)
            const message = (product.whatsapp_message && product.whatsapp_message.trim())
                ? product.whatsapp_message
                // Fallback message now uses product.price
                : `Hi, I'm interested in ${product.name || "this product"}${product.price ? ` priced at Rs. ${product.price}` : ""}`;

            const whatsappLink = whatsappNumber
                ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
                : "#";

            // escape data fields
            const safeName = escapeHtml(product.name || "");
            const safeDesc = escapeHtml(product.description || "");
            // Display price with "Rs " prefix and escape the value
            const safePrice = "Rs " + escapeHtml(product.price || "N/A"); 
            const safeImg = (product.image || "").replace(/"/g, "&quot;");

            const rowHtml = `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${safeName}</td>
                    <td>${safeDesc}</td>
                    <td>${safePrice}</td> <td>
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
            // Using insertAdjacentHTML is more efficient than innerHTML +=
            tbody.insertAdjacentHTML('beforeend', rowHtml);
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
                
                // This still correctly targets the product name in the 2nd <td>
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
