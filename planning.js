document.addEventListener("DOMContentLoaded", () => {
  const calendar = new Calendar("calendar");
  calendar.render();
});

/* ---------------------- CALENDRIER ---------------------- */
function Calendar(id) {
  this.today = new Date();
  this.currentMonth = this.today.getMonth();
  this.currentYear = this.today.getFullYear();
  this.table = document.getElementById(id).getElementsByTagName("tbody")[0];
  this.headMonth = document.querySelector(".head-month");

  this.render = () => {
    this.showMonth(this.currentYear, this.currentMonth);
    this.attachHeaderEvents();
  };

  this.showMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    this.table.innerHTML = "";

    let date = 1;
    for (let i = 0; i < 6; i++) {
      let row = document.createElement("tr");
      for (let j = 1; j <= 7; j++) {
        let cell = document.createElement("td");
        if (i === 0 && j < firstDay) {
          cell.innerHTML = "";
        } else if (date > daysInMonth) {
          cell.innerHTML = "";
        } else {
          cell.innerHTML = date;
          cell.classList.add("day");
          cell.addEventListener("click", () =>
            openPopup(new Date(year, month, date))
          );
          date++;
        }
        row.appendChild(cell);
      }
      this.table.appendChild(row);
    }
    this.headMonth.innerHTML = `${year} - ${month + 1}`;
  };

  this.attachHeaderEvents = () => {
    document.querySelector(".pre-button").onclick = () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.showMonth(this.currentYear, this.currentMonth);
    };
    document.querySelector(".next-button").onclick = () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.showMonth(this.currentYear, this.currentMonth);
    };
  };
}

/* ---------------------- POPUP ---------------------- */
const popup = document.getElementById("popup");
const themeSelect = document.createElement("select");
themeSelect.id = "themeSelect";

const activitySelect = document.getElementById("activitySelect");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");

let selectedDate = null;
let currentTheme = null;

/* ---------------------- OUVRIR POPUP ---------------------- */
function openPopup(date) {
  selectedDate = date;

  // Récupération des activités et thèmes
  const activities = normalizeActivities();
  const themes = [...new Set(activities.map((a) => a.theme))];

  // Nettoyage
  themeSelect.innerHTML = "";
  activitySelect.innerHTML = "";
  activitySelect.disabled = true;

  // Ajout options thèmes
  if (themes.length === 0) {
    let opt = document.createElement("option");
    opt.textContent = "Aucun thème";
    themeSelect.appendChild(opt);
  } else {
    let opt = document.createElement("option");
    opt.textContent = "Sélectionner un thème";
    opt.disabled = true;
    opt.selected = true;
    themeSelect.appendChild(opt);

    themes.forEach((t) => {
      let option = document.createElement("option");
      option.value = t;
      option.textContent = t;
      themeSelect.appendChild(option);
    });
  }

  // Quand un thème est choisi → remplir activités
  themeSelect.onchange = () => {
    currentTheme = themeSelect.value;
    activitySelect.innerHTML = "";
    activitySelect.disabled = false;

    const filtered = activities.filter((a) => a.theme === currentTheme);

    if (filtered.length === 0) {
      let opt = document.createElement("option");
      opt.textContent = "Aucune activité";
      activitySelect.appendChild(opt);
    } else {
      let opt = document.createElement("option");
      opt.textContent = "Sélectionner une activité";
      opt.disabled = true;
      opt.selected = true;
      activitySelect.appendChild(opt);

      filtered.forEach((a) => {
        let option = document.createElement("option");
        option.value = a.id;
        option.textContent = a.name;
        activitySelect.appendChild(option);
      });
    }
  };

  // Insérer themeSelect AVANT activitySelect si pas déjà fait
  if (!document.getElementById("themeSelect")) {
    activitySelect.parentNode.insertBefore(themeSelect, activitySelect);
  }

  popup.classList.remove("hidden");
}

/* ---------------------- FERMER POPUP ---------------------- */
function closePopup() {
  popup.classList.add("hidden");
  selectedDate = null;
  currentTheme = null;
}

/* ---------------------- NORMALISER ACTIVITÉS ---------------------- */
function normalizeActivities() {
  let arr = JSON.parse(localStorage.getItem("activities")) || [];
  arr.forEach((a, idx) => {
    if (!a.id) a.id = Date.now() + idx;
    if (!a.name && a.activity) a.name = a.activity;
    if (!a.theme && a.themeName) a.theme = a.themeName;
  });
  localStorage.setItem("activities", JSON.stringify(arr));
  return arr;
}

/* ---------------------- SAUVEGARDE ---------------------- */
saveBtn.onclick = () => {
  const activities = normalizeActivities();
  const selectedId = parseInt(activitySelect.value);
  const activity = activities.find((a) => a.id === selectedId);

  if (selectedDate && activity) {
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    localStorage.setItem(
      `planning-${key}`,
      JSON.stringify({
        ...activity,
        date: key,
      })
    );
  }
  closePopup();
};

/* ---------------------- SUPPRESSION ---------------------- */
deleteBtn.onclick = () => {
  if (selectedDate) {
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    localStorage.removeItem(`planning-${key}`);
  }
  closePopup();
};
