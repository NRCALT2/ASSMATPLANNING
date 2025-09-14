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

  // Modal pour afficher activité
  const modal = document.createElement("div");
  modal.id = "activityModal";
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.5)";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = 1000;
  modal.innerHTML = `
    <div style="background:white; padding:20px; border-radius:12px; max-width:500px; width:90%; position:relative; max-height:90%; overflow:auto;">
      <button id="modalCloseBtn" style="position:absolute; top:10px; right:10px; background:#e53935; border:none; color:white; font-size:1em; width:25px; height:25px; border-radius:50%; cursor:pointer;">×</button>
      <div id="modalContent"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalContent = document.getElementById("modalContent");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  modalCloseBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
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

  // Supprimer thème
  const deleteThemeBtn = document.getElementById("deleteThemeBtn");
  deleteThemeBtn.addEventListener("click", () => {
    const selectedThemeName = themeSelect.value;
    if (!selectedThemeName) {
      alert("Veuillez sélectionner un thème à supprimer.");
      return;
    }
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le thème "${selectedThemeName}" et toutes ses activités ?`)) return;

    let themes = JSON.parse(localStorage.getItem("themes")) || [];
    themes = themes.filter(t => t.name !== selectedThemeName);
    localStorage.setItem("themes", JSON.stringify(themes));

    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities = activities.filter(a => a.theme !== selectedThemeName);
    localStorage.setItem("activities", JSON.stringify(activities));

    populateThemeSelect();
    renderActivities();
  });

  function readImageAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(e);
      reader.readAsDataURL(file);
    });
  }

  activityForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const selectedThemeName = themeSelect.value;
    if (!selectedThemeName) {
      alert("Veuillez sélectionner ou créer un thème d'abord.");
      return;
    }

    let photoData = null;
    if (this.photo && this.photo.files.length > 0) {
      photoData = await readImageAsDataURL(this.photo.files[0]);
    }

    let age = this.ageRange.value;
    if (age === "custom") {
      age = this.customAge.value || "Non défini";
    }

    const newActivity = {
      theme: selectedThemeName,
      name: this.activityName.value,
      duration: this.duration.value,
      ageRange: age,
      materials: this.materials.value,
      color: this.color.value,
      photo: photoData
    };

    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.push(newActivity);
    localStorage.setItem("activities", JSON.stringify(activities));

    renderActivities();
    activityForm.reset();
  });

  themeSelect.addEventListener("change", renderActivities);

  function populateThemeSelect() {
    let themes = JSON.parse(localStorage.getItem("themes")) || [];
    themeSelect.innerHTML = '<option value="">-- Choisir un thème --</option>';
    themes.forEach(theme => {
      let option = document.createElement("option");
      option.value = theme.name;
      option.textContent = theme.name;
      themeSelect.appendChild(option);
    });
    if (themes.length > 0) themeSelect.value = themes[0].name;
  }

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
        <button class="delete-btn" data-index="${index}" style="position:absolute; top:5px; right:5px; font-size:1em; width:20px; height:20px;">×</button>
        <strong>${activity.name}</strong><br>
        ${activity.photo ? `<img src="${activity.photo}" alt="${activity.name}" style="max-width:150px; max-height:150px; margin-top:5px; border-radius:6px; cursor:pointer;">` : ""}
        <div class="badges">
          ${activity.duration ? `<span class="badge">⏱ ${activity.duration} min</span>` : ""}
          ${activity.ageRange ? `<span class="badge">👶 ${activity.ageRange}</span>` : ""}
        </div>
        ${activity.materials ? `<p>🛠 ${activity.materials}</p>` : ""}
      `;
      ideasList.appendChild(card);

      // Suppression
      card.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation(); // empêche le clic sur la carte
        const originalIndex = activities.findIndex(a => a.theme === selectedThemeName && a.name === filteredActivities[index].name);
        if (originalIndex > -1) {
          activities.splice(originalIndex, 1);
          localStorage.setItem("activities", JSON.stringify(activities));
          renderActivities();
        }
      });

      // Cliquer sur la carte ouvre le modal avec détails
      card.addEventListener("click", () => {
        modalContent.innerHTML = `
          <h3>${activity.name}</h3>
          ${activity.photo ? `<img src="${activity.photo}" alt="${activity.name}" style="width:100%; max-height:400px; object-fit:contain; margin-bottom:10px; border-radius:6px;">` : ""}
          <p><strong>Durée :</strong> ${activity.duration || '-' } min</p>
          <p><strong>Tranche d'âge :</strong> ${activity.ageRange || '-'}</p>
          <p><strong>Matériel :</strong> ${activity.materials || '-'}</p>
          <p><strong>Couleur :</strong> ${activity.color}</p>
        `;
        modal.style.display = "flex";
      });

      // Cliquer sur l'aperçu ouvre la version plus grande
      const imgPreview = card.querySelector("img");
      if(imgPreview) {
        imgPreview.addEventListener("click", (e) => {
          e.stopPropagation();
          modalContent.innerHTML = `
            <h3>${activity.name}</h3>
            <img src="${activity.photo}" alt="${activity.name}" style="width:100%; max-height:400px; object-fit:contain; margin-bottom:10px; border-radius:6px;">
          `;
          modal.style.display = "flex";
        });
      }
    });
  }

  populateThemeSelect();
  renderActivities();
});
