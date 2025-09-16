document.addEventListener("DOMContentLoaded", function() {
  const params = new URLSearchParams(window.location.search);
  const themeId = parseInt(params.get("themeId"));

  const themes = JSON.parse(localStorage.getItem("themes")) || [];
  const activities = JSON.parse(localStorage.getItem("activities")) || [];

  const theme = themes.find(t => t.id === themeId);
  if (!theme) {
    document.getElementById("agenda-content").innerHTML = "<p>Thème introuvable.</p>";
    return;
  }

  const filteredActivities = activities.filter(a => Number(a.themeId) === Number(themeId));

  const agendaContent = document.getElementById("agenda-content");
  if (filteredActivities.length === 0) {
    agendaContent.innerHTML = `
      <div class="agenda-header">
        <h1>${theme.name}</h1>
        <p>Aucune activité pour ce thème.</p>
      </div>
    `;
    return;
  }

  agendaContent.innerHTML = `
    <div class="agenda-header">
      <h1>${theme.name}</h1>
      <h2>Du ${theme.startDate || "?"} au ${theme.endDate || "?"}</h2>
    </div>
  `;

  filteredActivities.forEach(activity => {
    const card = document.createElement("div");
    card.className = "idea-card";
    card.style.background = activity.color || "#4caf50";

    card.innerHTML = `
      <strong>${activity.name || activity.activity}</strong><br>
      <div class="badges">
        ${activity.duration ? `<span class="badge">⏱ ${activity.duration} min</span>` : ""}
        ${activity.ageRange ? `<span class="badge">👶 ${activity.ageRange}</span>` : ""}
      </div>
      ${activity.materials ? `<p>🛠 ${activity.materials}</p>` : ""}
    `;
    agendaContent.appendChild(card);
  });
});
