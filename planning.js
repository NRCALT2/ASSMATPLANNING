// --- Génération du calendrier ---
function Calendar() {
    this.date = new Date();
    this.renderCalendar();
    this.attachHeaderEvents();
}

Calendar.prototype.renderCalendar = function() {
    const month = this.date.getMonth();
    const year = this.date.getFullYear();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const headMonth = document.querySelector('.head-month');
    headMonth.textContent = this.date.toLocaleString("fr-FR", { month: "long", year: "numeric" });

    const cells = document.querySelectorAll("#calendar td");
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.dataset.date = "";
    });

    let day = 1;
    let startIndex = (firstDay === 0 ? 6 : firstDay - 1); // ajustement pour que lundi = 0
    for (let i = startIndex; i < startIndex + lastDate; i++) {
        const cell = cells[i];
        cell.innerHTML = `<span class="day-number">${day}</span>`;
        cell.dataset.date = `${year}-${month + 1}-${day}`;
        cell.onclick = () => openPopup(cell.dataset.date);
        day++;
    }
};

Calendar.prototype.attachHeaderEvents = function() {
    document.querySelector(".pre-button").onclick = () => {
        this.date.setMonth(this.date.getMonth() - 1);
        this.renderCalendar();
    };
    document.querySelector(".next-button").onclick = () => {
        this.date.setMonth(this.date.getMonth() + 1);
        this.renderCalendar();
    };
    const reset = document.getElementById("reset");
    if (reset) {
        reset.onclick = () => {
            this.date = new Date();
            this.renderCalendar();
        };
    }
};

// --- Données thèmes -> activités ---
const activitiesByTheme = {
    noel: ["Décorer le sapin", "Chants de Noël", "Atelier biscuits"],
    vacances: ["Sortie au parc", "Piscine", "Pique-nique"],
    halloween: ["Atelier citrouille", "Déguisements", "Chasse aux bonbons"]
};

// --- Données sauvegardées (date → infos) ---
let savedData = JSON.parse(localStorage.getItem("planningData")) || {};

// --- Gestion du popup ---
const popup = document.getElementById("popup");
const themeSelect = document.getElementById("themeSelect");
const activitySelect = document.getElementById("activitySelect");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");
const popupDetails = document.getElementById("popupDetails");
const popupImage = document.getElementById("popupImage");

let currentDate = null;

function openPopup(date) {
    currentDate = date;

    // Réinitialiser les champs
    themeSelect.value = "";
    activitySelect.innerHTML = '<option value="">-- Choisir une activité --</option>';
    activitySelect.disabled = true;
    popupDetails.innerHTML = "";
    popupImage.src = "";

    if (savedData[date]) {
        const data = savedData[date];
        themeSelect.value = data.theme;
        fillActivities(data.theme);
        activitySelect.value = data.activity;

        popupDetails.innerHTML = `
            <p><strong>Âge :</strong> ${data.age || "—"}</p>
            <p><strong>Matériel :</strong> ${data.material || "—"}</p>
        `;
        if (data.image) popupImage.src = data.image;

        deleteBtn.style.display = "inline-block";
    } else {
        deleteBtn.style.display = "none";
    }

    popup.classList.remove("hidden");
}

function closePopup() {
    popup.classList.add("hidden");
}

// --- Remplissage activités selon le thème ---
function fillActivities(theme) {
    activitySelect.innerHTML = '<option value="">-- Choisir une activité --</option>';
    if (theme && activitiesByTheme[theme]) {
        activitiesByTheme[theme].forEach(activity => {
            const option = document.createElement("option");
            option.value = activity;
            option.textContent = activity;
            activitySelect.appendChild(option);
        });
        activitySelect.disabled = false;
    } else {
        activitySelect.disabled = true;
    }
}

themeSelect.addEventListener("change", () => {
    fillActivities(themeSelect.value);
});

// --- Boutons ---
saveBtn.addEventListener("click", () => {
    if (!currentDate) return;

    const theme = themeSelect.value;
    const activity = activitySelect.value;

    if (!theme || !activity) {
        alert("Merci de sélectionner un thème et une activité !");
        return;
    }

    savedData[currentDate] = {
        theme,
        activity,
        age: "5-8 ans", // Exemple fixe, tu peux brancher un input
        material: "Ciseaux, colle", // Exemple fixe, pareil
        image: "asmat.png" // Exemple fixe, tu peux brancher un input file
    };

    localStorage.setItem("planningData", JSON.stringify(savedData));
    closePopup();
});

deleteBtn.addEventListener("click", () => {
    if (currentDate && savedData[currentDate]) {
        delete savedData[currentDate];
        localStorage.setItem("planningData", JSON.stringify(savedData));
    }
    closePopup();
});

// Fermer avec clic extérieur
popup.addEventListener("click", (e) => {
    if (e.target === popup) closePopup();
});

// --- Lancer le calendrier ---
window.onload = () => {
    new Calendar();
};
