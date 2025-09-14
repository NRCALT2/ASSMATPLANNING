document.addEventListener("DOMContentLoaded", function() {
  const themeFormContainer = document.getElementById("themeFormContainer");
  const showThemeFormBtn = document.getElementById("showThemeFormBtn");
  const themeForm = document.getElementById("themeForm");
  const themeSelect = document.getElementById("themeSelect");
  const activityForm = document.getElementById("activityForm");
  const ideasList = document.getElementById("ideasList");

  showThemeFormBtn.addEventListener("click", () => {
    themeFormContainer.classList.toggle("hidden");
  });

  // Sauvegarde un nouveau thème
  themeForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const newTheme = {
      name: this.themeName.value,
      startDate: this.startDate.value,
      endDate: this.endDate.value,
    };
    let themes = JSON.parse(localStorage.getItem("themes")) || [];
    themes.push(newTheme);
    localStorage.setItem("themes", JSON.stringify(themes));
    
    populateThemeSelect();
    themeForm.reset();
    themeFormContainer.classList.add("hidden");
  });
  
// Bouton pour supprimer le thème sélectionné
const deleteThemeBtn = document.getElementById("deleteThemeBtn");
deleteThemeBtn.addEventListener("click", () => {
  const selectedThemeName = themeSelect.value;
  if (!selectedThemeName) {
    alert("Veuillez sélectionner un thème à supprimer.");
    return;
  }

  if (!confirm(`Êtes-vous sûr de vouloir supprimer le thème "${selectedThemeName}" et toutes ses activités ?`)) return;

  // Supprimer le thème du localStorage
  let themes = JSON.parse(localStorage.getItem("themes")) || [];
  themes = themes.filter(t => t.name !== selectedThemeName);
  localStorage.setItem("themes", JSON.stringify(themes));

  // Supprimer toutes les activités associées à ce thème
  let activities = JSON.parse(localStorage.getItem("activities")) || [];
  activities = activities.filter(a => a.theme !== selectedThemeName);
  localStorage.setItem("activities", JSON.stringify(activities));

  // Mettre à jour l'affichage
  populateThemeSelect();
  renderActivities();
});

const ageRangeSelect = document.getElementById("ageRangeSelect");
const customAgeInput = document.getElementById("customAgeInput");
const activityPhotoInput = document.getElementById("activityPhoto");

// Affiche le champ personnalisé si sélectionné
ageRangeSelect.addEventListener("change", () => {
  if(ageRangeSelect.value === "custom"){
    customAgeInput.classList.remove("hidden");
  } else {
    customAgeInput.classList.add("hidden");
    customAgeInput.value = "";
  }
});

// Fonction pour lire l'image en base64 pour stockage local
function readImageAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}


  
  // Sauvegarde une nouvelle activité pour le thème sélectionné
  activityForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const selectedThemeName = themeSelect.value;
    if (!selectedThemeName) {
      alert("Veuillez sélectionner ou créer un thème d'abord.");
      return;
    }
    
    const newActivity = {
      theme: selectedThemeName,
      name: this.activityName.value,
      duration: this.duration.value,
      ageRange: this.ageRange.value,
      materials: this.materials.value,
      color: this.color.value,
    };
    
    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.push(newActivity);
    localStorage.setItem("activities", JSON.stringify(activities));
    
    renderActivities();
    activityForm.reset();
  });

  // Gère le changement de thème dans la liste déroulante
  themeSelect.addEventListener("change", renderActivities);

  // Affiche les thèmes dans la liste déroulante
  function populateThemeSelect() {
    let themes = JSON.parse(localStorage.getItem("themes")) || [];
    themeSelect.innerHTML = '<option value="">-- Choisir un thème --</option>';
    themes.forEach(theme => {
      let option = document.createElement("option");
      option.value = theme.name;
      option.textContent = theme.name;
      themeSelect.appendChild(option);
    });
    // Sélectionne le premier thème par défaut si nécessaire
    if (themes.length > 0) {
      themeSelect.value = themes[0].name;
    }
  }

  // Affiche les activités pour le thème sélectionné
  function renderActivities() {
    const selectedThemeName = themeSelect.value;
    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    const filteredActivities = activities.filter(a => a.theme === selectedThemeName);
    
    ideasList.innerHTML = "";
    if (filteredActivities.length === 0) {
      ideasList.innerHTML = "<p>Aucune activité pour ce thème. Ajoutez-en une !</p>";
      return;
    }

    filteredActivities.forEach((activity, index) => {
      const card = document.createElement("div");
      card.className = "idea-card";
      card.style.background = activity.color;

      card.innerHTML = `
        <button class="delete-btn" data-index="${index}">❌</button>
        <strong>${activity.name}</strong><br>
        <div class="badges">
          ${activity.duration ? `<span class="badge">⏱ ${activity.duration} min</span>` : ""}
          ${activity.ageRange ? `<span class="badge">👶 ${activity.ageRange}</span>` : ""}
        </div>
        ${activity.materials ? `<p>🛠 ${activity.materials}</p>` : ""}
      `;
      ideasList.appendChild(card);
    });
    
    // Gère la suppression d'une activité
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        let indexToRemove = e.target.dataset.index;
        // Trouver l'activité originale à partir de l'index filtré
        const originalIndex = activities.findIndex(a => a.theme === selectedThemeName && a.name === filteredActivities[indexToRemove].name);
        if (originalIndex > -1) {
            activities.splice(originalIndex, 1);
            localStorage.setItem("activities", JSON.stringify(activities));
            renderActivities();
        }
      });
    });
  }

  // Initialisation
  populateThemeSelect();
  renderActivities();

});

