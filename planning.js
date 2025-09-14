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

    closeBtn.addEventListener("click", () => popup.classList.add("hidden"));

    // -----------------------------
    // 1️⃣ Affichage des numéros de jours
    // -----------------------------
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = dimanche
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarCells.forEach((cell, index) => {
        cell.innerHTML = "";
        let dayNum = index - (firstDay === 0 ? 6 : firstDay - 1) + 1;
        if(dayNum > 0 && dayNum <= daysInMonth){
            const span = document.createElement("span");
            span.textContent = dayNum;
            span.classList.add("day-number");
            cell.appendChild(span);
            cell.dataset.day = dayNum;
        } else {
            cell.dataset.day = "";
        }
    });

    // -----------------------------
    // 2️⃣ Placer activités
    // -----------------------------
    const activities = JSON.parse(localStorage.getItem("activities")) || [];

    activities.forEach(act => {
        // date de l'activité = act.date (format "YYYY-MM-DD")
        if(!act.date) return;

        const actDate = new Date(act.date);
        if(actDate.getMonth() !== month) return;
        const dayNum = actDate.getDate();

        const cell = Array.from(calendarCells).find(td => td.dataset.day == dayNum);
        if(!cell) return;

        const div = document.createElement("div");
        div.classList.add("item");
        div.textContent = act.name;
        div.style.cursor = "pointer";
        div.dataset.nom = act.name;
        div.dataset.theme = act.theme;
        div.dataset.duration = act.duration;
        div.dataset.age = act.ageRange;
        div.dataset.materials = act.materials;
        div.dataset.image = act.photo;

        cell.appendChild(div);

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
});
