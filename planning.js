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

    // 1️⃣ Afficher les numéros de jours
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0 = janvier
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = dimanche

    calendarCells.forEach((cell, index) => {
        let dayNum = index - (firstDay === 0 ? 6 : firstDay - 1) + 1; // ajustement pour lundi=0
        if (dayNum > 0 && dayNum <= daysInMonth) {
            cell.textContent = dayNum;
            cell.dataset.day = dayNum; // stocke le numéro du jour
        } else {
            cell.textContent = "";
        }
    });

    // 2️⃣ Récupérer les activités depuis localStorage
    const activities = JSON.parse(localStorage.getItem("activities")) || [];

    // 3️⃣ Placer les activités dans les cellules du calendrier
    activities.forEach(activity => {
        // Vérifier que l'activité a une propriété "day"
        // Sinon placer dans la première cellule disponible
        let dayCell;
        if(activity.day) {
            dayCell = Array.from(calendarCells).find(td => td.dataset.day == activity.day);
        } 
        if(!dayCell) {
            dayCell = Array.from(calendarCells).find(td => td.textContent !== "");
        }
        if(!dayCell) return;

        // Créer l'élément activité
        const div = document.createElement("div");
        div.textContent = activity.name;
        div.classList.add("item");
        div.style.cursor = "pointer";

        // Ajouter les data-* pour le popup
        div.dataset.nom = activity.name;
        div.dataset.theme = activity.theme;
        div.dataset.duration = activity.duration;
        div.dataset.age = activity.ageRange;
        div.dataset.materials = activity.materials;
        div.dataset.image = activity.photo;

        // Ajouter à la cellule
        dayCell.appendChild(div);

        // Clic sur l'activité ouvre le popup
        div.addEventListener("click", (e) => {
            e.stopPropagation(); // empêche propagation au td
            detailPhoto.src = div.dataset.image || "";
            detailName.textContent = div.dataset.nom || "";
            detailTheme.textContent = div.dataset.theme || "";
            detailDuration.textContent = div.dataset.duration || "";
            detailAge.textContent = div.dataset.age || "";
            detailMaterials.textContent = div.dataset.materials || "";

            popup.classList.remove("hidden");
        });
    });
});
