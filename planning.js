document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".item");
    const body = document.body;

    // Création du popup et du bouton de fermeture
    const popup = document.createElement("div");
    popup.id = "custom-popup";
    Object.assign(popup.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "none",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "1000"
    });

    const popupContent = document.createElement("div");
    Object.assign(popupContent.style, {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "12px",
        maxWidth: "500px",
        width: "90%",
        position: "relative",
        textAlign: "center"
    });

    const closeBtn = document.createElement("span");
    closeBtn.textContent = "×";
    Object.assign(closeBtn.style, {
        position: "absolute",
        top: "10px",
        right: "15px",
        cursor: "pointer",
        fontSize: "24px",
        fontWeight: "bold"
    });
    closeBtn.addEventListener("click", () => popup.style.display = "none");

    popupContent.appendChild(closeBtn);
    popup.appendChild(popupContent);
    body.appendChild(popup);

    function openPopup(item) {
        // Supprime tout sauf le bouton
        Array.from(popupContent.children).forEach(child => {
            if (child !== closeBtn) child.remove();
        });

        const data = {
            nom: item.dataset.nom,
            theme: item.dataset.theme,
            description: item.dataset.description,
            image: item.dataset.image
        };

        const seen = new Set();

        for (const key in data) {
            if (data[key] && !seen.has(data[key])) {
                if (key === "image") {
                    const img = document.createElement("img");
                    img.src = data[key];
                    img.alt = data["nom"] || "";
                    img.style.maxWidth = "100%";
                    img.style.borderRadius = "8px";
                    img.style.marginBottom = "10px";
                    popupContent.appendChild(img);
                } else {
                    const p = document.createElement("p");
                    p.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${data[key]}`;
                    p.style.margin = "5px 0";
                    popupContent.appendChild(p);
                }
                seen.add(data[key]);
            }
        }

        popup.style.display = "flex";
    }

    items.forEach(item => item.addEventListener("click", () => openPopup(item)));
});
