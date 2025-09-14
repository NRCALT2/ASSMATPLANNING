document.addEventListener("DOMContentLoaded", () => {
    const calendarCells = document.querySelectorAll("#calendar tbody td");
    const popup = document.getElementById("popup");
    const closeBtn = popup.querySelector(".close-btn");

    const detailPhoto = document.getElementById("detailPhoto");
    const detailName = document.getElementById("detailName");
    const detailTheme = document.getElementById("detailTheme");
    const detailDuration = document.getElementById("detailDuration");
    const detailAge = document.getElementById("detailAge");
    const detailMaterials = document.getElementById("detailMaterials");

    closeBtn.addEventListener("click", () => {
        popup.classList.add("hidden");
    });

    // -----------------------------
    // 1️⃣ Afficher les numéros de jours
    // -----------------------------
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0 = janvier
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = dimanche

    calendarCells.forEach((cell, index) => {
        let dayNum = index - (firstDay === 0 ? 6 : firstDay - 1) + 1; // lundi=0
        if(dayNum > 0 && dayNum <= daysInMonth){
            const span = document.createElement("span");
            span.textContent = dayNum;
            span.classList.add("day-number");
            cell.innerHTML = "";      // vide la cellule avant d'ajouter
            cell.appendChild(span);
            cell.dataset.day = dayNum;
        } else {
            cell.textContent = "";
        }
    });

    // -----------------------------
    // 2️⃣ Placer les activités selon la période du thème
    // -----------------------------
    const themes = JSON.parse(localStorage.getItem("themes")) || [];
    const activities = JSON.parse(localStorage.getItem("activities")) || [];

    themes.forEach(theme => {
        const themeActivities = activities.filter(a => a.theme === theme.name);

        if(!theme.startDate || !theme.endDate) return;

        const start = new Date(theme.startDate);
        const end = new Date(theme.endDate);

        for(let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)){
            if(d.getMonth() !== month) continue; // ignore autres mois
            const dayNum = d.getDate();
            const cell = Array.from(calendarCells).find(td => td.dataset.day == dayNum);
            if(!cell) continue;

            themeActivities.forEach(activity => {
                // Vérifier doublons
                const exists = Array.from(cell.querySelectorAll(".item"))
                                    .some(div => div.dataset.nom === activity.name);
                if(exists) return;

                const div = document.createElement("div");
                div.textContent = activity.name;
                div.classList.add("item");
                div.style.cursor = "pointer";

                // data-* pour popup
                div.dataset.nom = activity.name;
                div.dataset.theme = activity.theme;
                div.dataset.duration = activity.duration;
                div.dataset.age = activity.ageRange;
                div.dataset.materials = activity.materials;
                div.dataset.image = activity.photo;

                cell.appendChild(div);

                // clic pour popup
                div.addEventListener("click", (e) => {
                    e.stopPropagation();
                    detailPhoto.src = div.dataset.image || "";
                    detailName.textContent = div.dataset.nom || "";
                    detailTheme.textContent = div.dataset.theme || "";
                    detailDuration.textContent = div.dataset.duration || "";
                    detailAge.textContent = div.dataset.age || "";
                    detailMaterials.textContent = div.dataset.materials || "";

                    popup.classList.remove("hidden");
                });
            });
        }
    });
});
