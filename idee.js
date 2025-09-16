document.addEventListener("DOMContentLoaded", function () {
  const themeFormContainer = document.getElementById("themeFormContainer");
  const showThemeFormBtn = document.getElementById("showThemeFormBtn");
  const themeForm = document.getElementById("themeForm");
  const themeSelect = document.getElementById("themeSelect");
  const activityForm = document.getElementById("activityForm");
  const ideasList = document.getElementById("ideasList");

  // helpers
  function genId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  function loadThemes() {
    return JSON.parse(localStorage.getItem("themes")) || [];
  }
  function saveThemes(arr) {
    localStorage.setItem("themes", JSON.stringify(arr));
  }

  function loadActivities() {
    // normalization + id assignment if missing
    let arr = JSON.parse(localStorage.getItem("activities")) || [];
    let changed = false;
    arr.forEach((a, idx) => {
      if (!a.id) { a.id = genId() + idx; changed = true; }
      if (!a.name && a.activity) { a.name = a.activity; changed = true; }
      if (!a.activity && a.name) { a.activity = a.name; changed = true; }
      if (!a.theme && a.themeName) { a.theme = a.themeName; changed = true; }
    });
    if (changed) localStorage.setItem("activities", JSON.stringify(arr));
    return arr;
  }
  function saveActivities(arr) {
    localStorage.setItem("activities", JSON.stringify(arr));
  }

  // toggle theme form
  if (showThemeFormBtn && themeFormContainer) {
    showThemeFormBtn.addEventListener("click", () => {
      themeFormContainer.classList.toggle("hidden");
    });
  }

  // save a new theme
  if (themeForm) {
    themeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = this.themeName.value.trim();
      if (!name) return alert("Nom du thème requis");
      const newTheme = {
        id: genId(),
        name,
        startDate: this.startDate.value || null,
        endDate: this.endDate.value || null,
      };
      let themes = loadThemes();
      themes.push(newTheme);
      saveThemes(themes);
      populateThemeSelect();
      themeForm.reset();
      themeFormContainer.classList.add("hidden");
    });
  }

  // populate theme select
  function populateThemeSelect() {
    let themes = loadThemes();
    themeSelect.innerHTML = '<option value="">-- Choisir un thème --</option>';
    themes.forEach(t => {
      let opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      themeSelect.appendChild(opt);
    });
    if (themes.length > 0) themeSelect.value = themes[0].id;
  }

  // save a new activity
  if (activityForm) {
    activityForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!themeSelect.value) {
        alert("Veuillez sélectionner ou créer un thème d'abord.");
        return;
      }
      const newActivity = {
        id: genId(),
        themeId: Number(this.themeId ? this.themeId.value : themeSelect.value) || Number(themeSelect.value),
        theme: null, // we will fill with theme name when rendering
        name: this.activityName.value.trim(),
        activity: this.activityName.value.trim(), // for compatibility
        duration: this.duration.value || null,
        ageRange: this.ageRange.value || null,
        materials: this.materials.value || null,
        color: this.color.value || "#4caf50"
      };

      // store
      let activities = loadActivities();
      activities.push(newActivity);
      saveActivities(activities);

      renderActivities();
      this.reset();
    });
  }

  // re-generate activities list in UI
  function renderActivities() {
    const activities = loadActivities();
    const themes = loadThemes();
    const selectedThemeId = Number(themeSelect.value);

    // if theme selected, filter; else show all
    const filtered = selectedThemeId ? activities.filter(a => Number(a.themeId) === selectedThemeId) : activities;

    ideasList.innerHTML = "";
    if (filtered.length === 0) {
      ideasList.innerHTML = "<p>Aucune activité pour ce thème. Ajoutez-en une !</p>";
      return;
    }

    filtered.forEach((act, idx) => {
      const card = document.createElement("div");
      card.className = "idea-card";
      card.style.background = act.color || "#4caf50";
      const themeObj = themes.find(t => Number(t.id) === Number(act.themeId));
      const themeName = themeObj ? themeObj.name : "Sans thème";
      act.theme = themeName; // keep for tooltip etc.

      card.innerHTML = `
        <button class="delete-btn" data-id="${act.id}">❌</button>
        <strong>${act.name}</strong><br>
        <div class="badges">
          ${act.duration ? `<span class="badge">⏱ ${act.duration} min</span>` : ""}
          ${act.ageRange ? `<span class="badge">👶 ${act.ageRange}</span>` : ""}
        </div>
        ${act.materials ? `<p>🛠 ${act.materials}</p>` : ""}
        <div style="opacity:0.85;font-size:0.85em;margin-top:8px">${themeName}</div>
      `;
      ideasList.appendChild(card);

      // delete handler
      card.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm("Supprimer cette activité ?")) return;
        let activities = loadActivities();
        const idToRemove = Number(e.target.dataset.id);
        activities = activities.filter(a => Number(a.id) !== idToRemove);
        saveActivities(activities);
        renderActivities();
      });
    });
  }

  // when theme select changes
  if (themeSelect) themeSelect.addEventListener("change", renderActivities);

  // preset quick fill buttons (if present)
  document.querySelectorAll(".quick-idea").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.querySelector("#activityForm input[name='activityName']");
      if (input) input.value = btn.textContent.trim();
    });
  });

  // init
  populateThemeSelect();
  renderActivities();
});
