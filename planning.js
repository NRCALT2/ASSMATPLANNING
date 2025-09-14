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

    // Récupérer les activités depuis localStorage
    const activities = JSON.parse(localStorage.getItem("activities")) || [];

    // Placer les activités dans les cellules du calendrier
    activities.forEach((activity, index) => {
        const cell = calendarCells[index % calendarCells.length]; // répartir sur les cellules
        cell.textContent = activity.name;
        cell.classList.add("item");

        // Ajouter les data-* pour le popup
        cell.dataset.nom = activity.name;
        cell.dataset.theme = activity.theme;
        cell.dataset.duration = activity.duration;
        cell.dataset.age = activity.ageRange;
        cell.dataset.materials = activity.materials;
        cell.dataset.image = activity.photo;

        // Clic sur la cellule ouvre le popup
        cell.addEventListener("click", () => {
            detailPhoto.src = cell.dataset.image || "";
            detailName.textContent = cell.dataset.nom || "";
            detailTheme.textContent = cell.dataset.theme || "";
            detailDuration.textContent = cell.dataset.duration || "";
            detailAge.textContent = cell.dataset.age || "";
            detailMaterials.textContent = cell.dataset.materials || "";

            popup.classList.remove("hidden");
        });
    });
});
