// planning.js
document.addEventListener("DOMContentLoaded", () => {
  const planningContainer = document.getElementById("planning");
  if (!planningContainer) return;

  // heures de 6h à 19h
  for (let h = 6; h <= 19; h++) {
    const hourBlock = document.createElement("div");
    hourBlock.className = "hour";
    hourBlock.dataset.hour = h;
    hourBlock.innerHTML = `<strong>${h}h</strong><div class="slot"></div>`;
    planningContainer.appendChild(hourBlock);
    hourBlock.addEventListener("click", () => openPopupForHour(h));
  }

  // popup elements
  const popup = createPopup();
  document.body.appendChild(popup);

  function createPopup() {
    const wrapper = document.createElement("div");
    wrapper.className = "popup hidden";
    wrapper.id = "planningPopup";
    wrapper.innerHTML = `
      <div class="popup-content">
        <span class="close-btn" id="planningClose">&times;</span>
        <h2>Sélectionner une activité</h2>
        <label>Thème (filtre): <select id="popupThemeFilter"><option value="">-- tous --</option></select></label>
        <label>Activité: <select id="popupActivitySelect"></select></label>
        <button id="popupSave">Enregistrer</button>
        <button id="popupDelete" style="background:#e53935;color:#fff;margin-top:8px;display:none">Supprimer</button>
      </div>
    `;
    // close handler
    wrapper.querySelector("#planningClose").addEventListener("click", () => { wrapper.classList.add("hidden"); });
    return wrapper;
  }

  function normalizeActivities() {
    let arr = JSON.parse(localStorage.getItem("activities")) || [];
    let changed = false;
    arr.forEach((a, idx) => {
      if (!a.id) { a.id = Date.now() + idx; changed = true; }
      if (!a.name && a.activity) { a.name = a.activity; changed = true; }
      if (!a.activity && a.name) { a.activity = a.name; changed = true; }
    });
    if (changed) localStorage.setItem("activities", JSON.stringify(arr));
    return arr;
  }

  function populatePopup() {
    const activities = normalizeActivities();
    const themes = (JSON.parse(localStorage.getItem("themes")) || []);
    const themeFilter = document.getElementById("popupThemeFilter");
    const activitySelect = document.getElementById("popupActivitySelect");

    // fill themes dropdown
    themeFilter.innerHTML = `<option value="">-- tous --</option>`;
    themes.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      themeFilter.appendChild(opt);
    });

    // fill activities dropdown
    function fillActivities(filterThemeId) {
      activitySelect.innerHTML = "";
      const list = filterThemeId ? activities.filter(a => Number(a.themeId) === Number(filterThemeId)) : activities;
      if (list.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Aucune activité";
        opt.disabled = true;
        activitySelect.appendChild(opt);
      } else {
        list.forEach(a => {
          const opt = document.createElement("option");
          opt.value = a.id;
          opt.textContent = `${a.name || a.activity} (${getThemeName(a.themeId)})`;
          activitySelect.appendChild(opt);
        });
      }
    }

    themeFilter.addEventListener("change", () => fillActivities(themeFilter.value));
    fillActivities(); // initial
  }

  function getThemeName(themeId) {
    const themes = JSON.parse(localStorage.getItem("themes")) || [];
    const t = themes.find(x => Number(x.id) === Number(themeId));
    return t ? t.name : "Sans thème";
  }

  let editingHour = null;

  function openPopupForHour(hour) {
    editingHour = hour;
    const popupEl = document.getElementById("planningPopup");
    popupEl.classList.remove("hidden");
    populatePopup();

    // preselect if exists
    const planning = JSON.parse(localStorage.getItem("planning")) || {};
    const entry = planning[hour];
    const activitySelect = document.getElementById("popupActivitySelect");
    const deleteBtn = document.getElementById("popupDelete");
    if (entry && entry.activityId) {
      activitySelect.value = entry.activityId;
      deleteBtn.style.display = "block";
    } else {
      deleteBtn.style.display = "none";
    }

    // handlers
    document.getElementById("popupSave").onclick = () => {
      const sel = activitySelect.value;
      if (!sel) { alert("Choisissez une activité"); return; }
      const chosen = normalizeActivities().find(a => a.id === Number(sel));
      if (!chosen) { alert("Activité introuvable"); return; }
      const planning = JSON.parse(localStorage.getItem("planning")) || {};
      planning[hour] = { activityId: chosen.id };
      localStorage.setItem("planning", JSON.stringify(planning));
      renderPlanning();
      popupEl.classList.add("hidden");
    };

    document.getElementById("popupDelete").onclick = () => {
      const planning = JSON.parse(localStorage.getItem("planning")) || {};
      if (planning[hour]) delete planning[hour];
      localStorage.setItem("planning", JSON.stringify(planning));
      renderPlanning();
      popupEl.classList.add("hidden");
    };
  }

  function renderPlanning() {
    const planning = JSON.parse(localStorage.getItem("planning")) || {};
    const activities = normalizeActivities();
    document.querySelectorAll(".hour").forEach(div => {
      const h = div.dataset.hour;
      const slot = div.querySelector(".slot");
      slot.innerHTML = "";
      if (planning[h]) {
        const act = activities.find(a => Number(a.id) === Number(planning[h].activityId));
        if (act) {
          const el = document.createElement("div");
          el.className = "activity";
          el.style.background = act.color || "#4caf50";
          el.style.color = (getContrastColor(act.color || "#4caf50"));
          el.textContent = `${act.name || act.activity} ${act.duration ? `(${act.duration}m)` : ""}`;
          slot.appendChild(el);
        }
      }
    });
  }

  function getContrastColor(hex) {
    if (!hex) return "#fff";
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#000" : "#fff";
  }

  // initial render
  renderPlanning();
});
