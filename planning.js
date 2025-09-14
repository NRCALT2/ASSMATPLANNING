document.addEventListener("DOMContentLoaded", () => {
    // Sélectionne tous les éléments à cliquer pour ouvrir le popup
    const items = document.querySelectorAll(".item"); // adapte le sélecteur à tes items
    const body = document.body;

    // Création du popup
    const popup = document.createElement("div");
    popup.id = "custom-popup";
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.backgroundColor = "rgba(0,0,0,0.6)";
    popup.style.display = "none";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.zIndex = "1000";

    const popupContent = document.createElement("div");
    popupContent.style.backgroundColor = "#fff";
    popupContent.style.padding = "20px";
    popupContent.style.borderRadius = "12px";
    popupContent.style.maxWidth = "500px";
    popupContent.style.width = "90%";
    popupContent.style.position = "relative";
    popupContent.style.textAlign = "center";

    // Bouton de fermeture
    const closeBtn = document.createElement("span");
    closeBtn.textContent = "×";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "15px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "24px";
    closeBtn.style.fontWeight = "bold";

    closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
        popupContent.innerHTML = ""; // supprime tout le contenu
        popupContent.appendChild(closeBtn); // remet le bouton
    });

    popupContent.appendChild(closeBtn);
    popup.appendChild(popupContent);
    body.appendChild(popup);

    // Fonction pour créer le contenu du popup
    function openPopup(item) {
        popupContent.querySelectorAll("p, img").forEach(el => el.remove()); // supprime anciens contenus

        const data = {
            nom: item.dataset.nom || "Nom inconnu",
            theme: item.dataset.theme || "Thème inconnu",
            image: item.dataset.image || null,
            description: item.dataset.description || ""
        };

        // Créer un élément pour chaque info, éviter doublons
        const seen = new Set();

        for (const key in data) {
            if (data[key] && !seen.has(data[key])) {
                if (key === "image") {
                    const img = document.createElement("img");
                    img.src = data[key];
                    img.alt = data["nom"];
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

    // Attacher l'événement à tous les items
    items.forEach(item => {
        item.addEventListener("click", () => openPopup(item));
    });
});
