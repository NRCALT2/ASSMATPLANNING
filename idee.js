document.addEventListener('DOMContentLoaded', () => {
    // Sélection des éléments du DOM
    const themeForm = document.getElementById('theme-form');
    const themeNameInput = document.getElementById('theme-name');
    const themeColorInput = document.getElementById('theme-color');
    const themesList = document.getElementById('themes-list');
    const activityThemeSelect = document.getElementById('activity-theme-select');
    const filterButtonsContainer = document.getElementById('filter-buttons');
    const activitiesList = document.getElementById('activities-list');
    const activityForm = document.getElementById('activity-form');
    const activityTitleInput = document.getElementById('activity-title');
    const activityDescriptionInput = document.getElementById('activity-description');
    
    // Éléments pour les nouvelles fonctionnalités
    const themeStartDateInput = document.getElementById('theme-start-date');
    const themeEndDateInput = document.getElementById('theme-end-date');
    const themeImageUpload = document.getElementById('theme-image-upload');
    const ageRangeSelect = document.getElementById('age-range');
    const customAgeInput = document.getElementById('custom-age-input');
    const activityImageUpload = document.getElementById('activity-image-upload');
    const activityMaterialInput = document.getElementById('activity-material');

    // Récupération des données depuis le stockage local (localStorage)
    let themes = JSON.parse(localStorage.getItem('themes')) || [];
    let activities = JSON.parse(localStorage.getItem('activities')) || [];

    // --- Fonctions de rendu et de gestion des données ---

    /**
     * Affiche les thèmes dans la liste.
     * Met à jour également les options de sélection de thème.
     */
    const renderThemes = () => {
        themesList.innerHTML = '';
        themes.forEach(theme => {
            const div = document.createElement('div');
            div.className = 'theme-item';
            div.style.backgroundColor = theme.color;
            const dateInfo = theme.startDate && theme.endDate ? `(${new Date(theme.startDate).toLocaleDateString()} - ${new Date(theme.endDate).toLocaleDateString()})` : '';
            div.innerHTML = `
                <span>${theme.name} ${dateInfo}</span>
                <button class="delete-btn" data-id="${theme.id}">x</button>
            `;
            themesList.appendChild(div);
        });
        renderThemeSelectOptions();
        renderFilterButtons();
    };

    /**
     * Met à jour le menu déroulant des thèmes pour le formulaire d'activité.
     */
    const renderThemeSelectOptions = () => {
        activityThemeSelect.innerHTML = '<option value="">-- Choisir un thème --</option>';
        themes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.id;
            option.textContent = theme.name;
            activityThemeSelect.appendChild(option);
        });
    };

    /**
     * Crée les boutons de filtre pour chaque thème.
     */
    const renderFilterButtons = () => {
        filterButtonsContainer.innerHTML = '';
        const allButton = document.createElement('button');
        allButton.className = 'filter-btn';
        allButton.textContent = 'Tous les thèmes';
        allButton.dataset.id = 'all';
        allButton.style.backgroundColor = '#555';
        filterButtonsContainer.appendChild(allButton);

        themes.forEach(theme => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = theme.name;
            button.dataset.id = theme.id;
            button.style.backgroundColor = theme.color;
            filterButtonsContainer.appendChild(button);
        });
    };

    /**
     * Affiche les activités dans la liste, éventuellement filtrées.
     * @param {Array} filteredActivities - Liste des activités à afficher.
     */
    const renderActivities = (filteredActivities = activities) => {
        activitiesList.innerHTML = '';
        if (filteredActivities.length === 0) {
            activitiesList.innerHTML = '<p>Aucune activité trouvée.</p>';
        }
        filteredActivities.forEach(activity => {
            const div = document.createElement('div');
            div.className = 'activity-item';
            const theme = themes.find(t => t.id === activity.themeId);
            const ageInfo = activity.ageRange === 'custom' ? activity.customAge : activity.ageRange;
            const imageHtml = activity.image ? `<img src="${activity.image}" alt="${activity.title}" style="max-width: 100%; height: auto;">` : '';
            const materialHtml = activity.material ? `<p><strong>Matériel:</strong> ${activity.material}</p>` : '';

            div.innerHTML = `
                <h3>${activity.title}</h3>
                <p><strong>Tranche d'âge:</strong> ${ageInfo || 'Non spécifié'}</p>
                <p><strong>Thème:</strong> ${theme ? theme.name : 'Non classé'}</p>
                <p><strong>Description:</strong> ${activity.description}</p>
                ${materialHtml}
                ${imageHtml}
            `;
            activitiesList.appendChild(div);
        });
    };

    /**
     * Génère un identifiant unique.
     * @returns {string} ID unique.
     */
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };

    /**
     * Lit un fichier (image) et le convertit en chaîne de caractères Base64.
     * @param {File} file - Fichier image.
     * @returns {Promise<string>} Promesse contenant la chaîne Base64.
     */
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // --- Écouteurs d'événements ---

    // Gère la soumission du formulaire de thème
    themeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let imageUrl = '';
        if (themeImageUpload.files.length > 0) {
            imageUrl = await fileToBase64(themeImageUpload.files[0]);
        }
        
        const newTheme = {
            id: generateId(),
            name: themeNameInput.value,
            color: themeColorInput.value,
            startDate: themeStartDateInput.value,
            endDate: themeEndDateInput.value,
            image: imageUrl 
        };
        themes.push(newTheme);
        localStorage.setItem('themes', JSON.stringify(themes));
        themeForm.reset();
        renderThemes();
        renderActivities();
    });

    // Gère la suppression d'un thème
    themesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            themes = themes.filter(t => t.id !== id);
            activities = activities.filter(a => a.themeId !== id);
            localStorage.setItem('themes', JSON.stringify(themes));
            localStorage.setItem('activities', JSON.stringify(activities));
            renderThemes();
            renderActivities();
        }
    });

    // Gère le filtrage des activités par thème
    filterButtonsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            const themeId = e.target.dataset.id;
            if (themeId === 'all') {
                renderActivities();
            } else {
                const filtered = activities.filter(a => a.themeId === themeId);
                renderActivities(filtered);
            }
        }
    });

    // Gère le champ "tranche d'âge personnalisée"
    ageRangeSelect.addEventListener('change', () => {
        if (ageRangeSelect.value === 'custom') {
            customAgeInput.classList.remove('hidden');
        } else {
            customAgeInput.classList.add('hidden');
        }
    });

    // Gère la soumission du formulaire d'activité
    activityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let imageUrl = '';
        if (activityImageUpload.files.length > 0) {
            imageUrl = await fileToBase64(activityImageUpload.files[0]);
        }
        
        const newActivity = {
            id: generateId(),
            title: activityTitleInput.value,
            description: activityDescriptionInput.value,
            themeId: activityThemeSelect.value,
            ageRange: ageRangeSelect.value,
            customAge: customAgeInput.value,
            material: activityMaterialInput.value,
            image: imageUrl
        };
        
        activities.push(newActivity);
        localStorage.setItem('activities', JSON.stringify(activities));
        activityForm.reset();
        customAgeInput.classList.add('hidden');
        renderActivities();
    });

    // Initialisation : affichage des éléments au chargement de la page
    renderThemes();
    renderActivities();
});
