document.addEventListener('DOMContentLoaded', () => {
    // --- Sélection des éléments du DOM ---
    const currentMonthYearEl = document.getElementById('current-month-year');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const popup = document.getElementById('popup');
    const closeBtn = document.querySelector('.popup-content .close-btn');
    const popupDateEl = document.getElementById('popup-date');
    const activitySelect = document.getElementById('activity-select');
    const saveBtn = document.getElementById('save-activity-btn');
    const deleteBtn = document.getElementById('delete-activity-btn');
    const activityInfoDisplay = document.getElementById('activity-info-display');
    const themeInfoDisplay = document.getElementById('theme-info-display');

    // --- État de l'application ---
    let currentDate = new Date();
    let selectedDate = null;
    
    // Récupération des données depuis le stockage local
    const themes = JSON.parse(localStorage.getItem('themes')) || [];
    let activities = JSON.parse(localStorage.getItem('activities')) || [];

    // --- Fonctions de rendu et de gestion du calendrier ---

    /**
     * Génère et affiche le calendrier pour le mois donné.
     * @param {Date} date - La date pour le mois à afficher.
     */
    const renderCalendar = (date) => {
        calendarBody.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();
        
        currentMonthYearEl.textContent = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const startingDay = (firstDayOfMonth.getDay() + 6) % 7; 

        // Remplir les jours vides du début du mois
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell', 'inactive');
            calendarBody.appendChild(emptyCell);
        }

        // Remplir les jours du mois
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');
            dayCell.textContent = day;
            
            const fullDate = new Date(year, month, day);
            const dateString = fullDate.toISOString().split('T')[0];
            dayCell.dataset.date = dateString;
            
            // Marquer le jour actuel
            if (fullDate.toDateString() === new Date().toDateString()) {
                dayCell.classList.add('current-day');
            }

            // Appliquer la couleur de thème si le jour est dans une période de thème
            const themeForDay = themes.find(t => {
                if (!t.startDate || !t.endDate) return false;
                const startDate = new Date(t.startDate);
                const endDate = new Date(t.endDate);
                return fullDate >= startDate && fullDate <= endDate;
            });

            if (themeForDay) {
                dayCell.style.backgroundColor = themeForDay.color;
            }

            // Ajouter un point si une activité est prévue ce jour-là
            const activityForDay = activities.find(act => act.date === dateString);
            if (activityForDay) {
                const dot = document.createElement('div');
                dot.classList.add('activity-dot');
                dayCell.appendChild(dot);
            }

            // Gérer le clic pour ouvrir le pop-up
            dayCell.addEventListener('click', () => {
                selectedDate = dateString;
                openPopup(fullDate);
            });

            calendarBody.appendChild(dayCell);
        }
    };

    /**
     * Ouvre et gère le pop-up d'informations/sélection d'activité.
     * @param {Date} date - La date du jour sélectionné.
     */
    const openPopup = (date) => {
        popup.classList.remove('hidden');
        popupDateEl.textContent = `Informations pour le ${date.toLocaleDateString('fr-FR')}`;
        
        const activityForDate = activities.find(act => act.date === selectedDate);
        const themeForDate = themes.find(t => {
            if (!t.startDate || !t.endDate) return false;
            const startDate = new Date(t.startDate);
            const endDate = new Date(t.endDate);
            return date >= startDate && date <= endDate;
        });

        // Afficher les infos du thème si le jour en a un
        if (themeForDate) {
            document.getElementById('theme-name').textContent = themeForDate.name;
            document.getElementById('theme-period').textContent = `Du ${new Date(themeForDate.startDate).toLocaleDateString()} au ${new Date(themeForDate.endDate).toLocaleDateString()}`;
            const themeImageEl = document.getElementById('theme-image');
            if (themeForDate.image) {
                themeImageEl.src = themeForDate.image;
                themeImageEl.classList.remove('hidden');
            } else {
                themeImageEl.classList.add('hidden');
            }
            themeInfoDisplay.classList.remove('hidden');
        } else {
            themeInfoDisplay.classList.add('hidden');
        }

        // Afficher les infos de l'activité si le jour en a une
        if (activityForDate) {
            document.getElementById('activity-name').textContent = activityForDate.title;
            const ageInfo = activityForDate.ageRange === 'custom' ? activityForDate.customAge : activityForDate.ageRange;
            document.getElementById('activity-age-range').textContent = `Tranche d'âge: ${ageInfo || 'Non spécifié'}`;
            document.getElementById('activity-description').textContent = `Description: ${activityForDate.description || ''}`;
            document.getElementById('activity-material').textContent = `Matériel: ${activityForDate.material || ''}`;
            const activityImageEl = document.getElementById('activity-image');
            if (activityForDate.image) {
                activityImageEl.src = activityForDate.image;
                activityImageEl.classList.remove('hidden');
            } else {
                activityImageEl.classList.add('hidden');
            }
            activityInfoDisplay.classList.remove('hidden');
            activitySelect.classList.add('hidden');
            saveBtn.classList.add('hidden');
            deleteBtn.classList.remove('hidden');
        } else {
            // Sinon, afficher le formulaire de sélection
            activityInfoDisplay.classList.add('hidden');
            activitySelect.classList.remove('hidden');
            saveBtn.classList.remove('hidden');
            deleteBtn.classList.add('hidden');
            
            activitySelect.innerHTML = '<option value="">-- Choisir une activité --</option>';
            activities.forEach(act => {
                if (!act.date) {
                    const option = document.createElement('option');
                    option.value = act.id;
                    option.textContent = act.title;
                    activitySelect.appendChild(option);
                }
            });
        }
    };

    /**
     * Ferme le pop-up.
     */
    const closePopup = () => {
        popup.classList.add('hidden');
    };

    // --- Écouteurs d'événements ---

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    closeBtn.addEventListener('click', closePopup);

    saveBtn.addEventListener('click', () => {
        const activityId = activitySelect.value;
        if (activityId) {
            const activityToUpdate = activities.find(act => act.id === activityId);
            if (activityToUpdate) {
                const existingActivity = activities.find(act => act.date === selectedDate);
                if (existingActivity) {
                    delete existingActivity.date;
                }
                activityToUpdate.date = selectedDate;
                localStorage.setItem('activities', JSON.stringify(activities));
                renderCalendar(currentDate);
                closePopup();
            }
        }
    });

    deleteBtn.addEventListener('click', () => {
        const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cette activité de ce jour?');
        if (confirmDelete) {
            const activityForDate = activities.find(act => act.date === selectedDate);
            if (activityForDate) {
                delete activityForDate.date;
                localStorage.setItem('activities', JSON.stringify(activities));
                renderCalendar(currentDate);
                closePopup();
            }
        }
    });

    // Initialisation : affichage du calendrier
    renderCalendar(currentDate);
});
