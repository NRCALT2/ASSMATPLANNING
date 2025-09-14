document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    const monthTag = [
        "Janvier","Fevrier","Mars","Avril","Mai","Juin",
        "Juillet","Aout","Septembre","Octobre","Novembre","Decembre"
    ];

    const table = document.getElementById('calendar');
    const tds = Array.from(document.querySelectorAll('#calendar td'));
    let selectedDate = null;

    function pad2(n) { return String(n).padStart(2, '0'); }

    function getContrastColor(hex) {
        if (!hex) return '#000';
        hex = hex.replace('#','');
        if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
        const r = parseInt(hex.slice(0,2),16);
        const g = parseInt(hex.slice(2,4),16);
        const b = parseInt(hex.slice(4,6),16);
        const luminance = (0.299*r+0.587*g+0.114*b)/255;
        return luminance > 0.6 ? '#000' : '#fff';
    }

    function normalizeActivities() {
        let arr = JSON.parse(localStorage.getItem('activities')) || [];
        let changed = false;
        arr.forEach((a, idx) => {
            if (!a.id) { a.id = Date.now() + idx; changed = true; }
            if (!a.name && a.activity) { a.name = a.activity; changed = true; }
            if (!a.activity && a.name) { a.activity = a.name; changed = true; }
            if (!a.theme && a.themeName) { a.theme = a.themeName; changed = true; }
        });
        if (changed) localStorage.setItem('activities', JSON.stringify(arr));
        return arr;
    }

    function getActivityById(id) { return normalizeActivities().find(a => Number(a.id) === Number(id)); }

    function markDays() {
        const planningDays = JSON.parse(localStorage.getItem('planningDays')) || {};
        const activities = normalizeActivities();

        tds.forEach(td => {
            const day = td.dataset.day;
            if (!day) return;
            const dateStr = `${year}-${pad2(month+1)}-${pad2(day)}`;
            td.style.backgroundColor = '';
            td.style.color = '';
            td.style.borderRadius = '';
            td.title = '';
            td.textContent = day;

            if (planningDays[dateStr]) {
                const act = activities.find(a => Number(a.id) === Number(planningDays[dateStr].activityId));
                if (act) {
                    td.style.backgroundColor = act.color || '#666';
                    td.style.color = getContrastColor(act.color || '#666');
                    td.style.borderRadius = '6px';
                    td.title = `${act.name || 'Sans nom'} (${act.theme || 'Sans thème'})`;
                }
            }
        });
    }

    function Calendar() {
        this.draw();
        this.attachHeaderEvents();
        this.attachTableDelegation();
    }

    Calendar.prototype.draw = function() {
        this.drawDays();
        this.drawHeader();
    };

    Calendar.prototype.drawHeader = function(selectedDayString) {
        const headDay = document.querySelector('.head-day');
        const headMonth = document.querySelector('.head-month');
        if (headDay) headDay.innerHTML = selectedDayString || '';
        if (headMonth) headMonth.innerHTML = monthTag[month] + ' - ' + year;
    };

    Calendar.prototype.drawDays = function() {
        const firstDay = new Date(year, month, 1);
        const startDay = (firstDay.getDay() + 6) % 7; // lundi = 0
        const nDays = new Date(year, month+1, 0).getDate();

        tds.forEach(td => {
            td.textContent = '';
            td.dataset.day = '';
            td.style.backgroundColor = '';
            td.style.color = '';
            td.style.borderRadius = '';
            td.title = '';
        });

        for (let i=1; i<=nDays; i++) {
            const tdIndex = startDay + i - 1;
            if (!tds[tdIndex]) continue;
            const td = tds[tdIndex];
            td.textContent = i;
            td.dataset.day = i;
        }

        this.drawHeader();
        markDays();
    };

    Calendar.prototype.prevMonth = function() {
        if (month <= 0) { month = 11; year--; } 
        else { month--; }
        this.drawDays();
    };

    Calendar.prototype.nextMonth = function() {
        if (month >= 11) { month = 0; year++; } 
        else { month++; }
        this.drawDays();
    };

    Calendar.prototype.reset = function() {
        year = today.getFullYear();
        month = today.getMonth();
        this.drawDays();
    };

    Calendar.prototype.attachHeaderEvents = function() {
        const pre = document.querySelector('.pre-button');
        const next = document.querySelector('.next-button');
        const reset = document.getElementById('reset');
        const that = this;
        if (pre) pre.addEventListener('click', () => { that.prevMonth(); });
        if (next) next.addEventListener('click', () => { that.nextMonth(); });
        if (reset) reset.addEventListener('click', () => { that.reset(); });
    };

    Calendar.prototype.attachTableDelegation = function() {
        if (!table) return;
        const that = this;
        table.addEventListener('click', function(e) {
            const td = e.target.closest('td');
            if (!td || !td.dataset.day) return;
            const dayStr = td.dataset.day;
            selectedDate = `${year}-${pad2(month+1)}-${pad2(dayStr)}`;
            that.drawHeader(dayStr);
            openPopup(selectedDate);
        });
    };

    const calendar = new Calendar();

    function openPopup(dateStr) {
        const popup = document.getElementById('popup');
        popup.classList.remove('hidden');

        const activitySelect = document.getElementById('activitySelect');
        const delBtn = document.getElementById('deleteBtn');
        const list = normalizeActivities();

        activitySelect.innerHTML = '';
        if (list.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Aucune activité';
            opt.disabled = true;
            activitySelect.appendChild(opt);
        } else {
            list.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.id;
                opt.textContent = `${a.name || 'Sans nom'} (${a.theme || 'Sans thème'})`;
                activitySelect.appendChild(opt);
            });
        }

        // Supprimer anciens détails
        const oldDetails = popup.querySelector('.details');
        if (oldDetails) oldDetails.remove();

        const planningDays = JSON.parse(localStorage.getItem('planningDays')) || {};
        const selectedActivityId = planningDays[dateStr]?.activityId;
        if (selectedActivityId) {
            const activity = getActivityById(selectedActivityId);
            if (activity) {
                const details = document.createElement('div');
                details.className = 'details';
                details.style.textAlign = 'left';
                details.style.marginTop = '10px';

                details.innerHTML = `
                    <p><strong>Nom :</strong> ${activity.name}</p>
                    <p><strong>Thème :</strong> ${activity.theme}</p>
                    <p><strong>Durée :</strong> ${activity.duration || 'N/A'} min</p>
                    <p><strong>Âge :</strong> ${activity.ageRange || 'N/A'}</p>
                    <p><strong>Matériel :</strong> ${activity.materials || 'N/A'}</p>
                `;

                if (activity.image) {
                    const img = document.createElement('img');
                    img.src = activity.image;
                    img.style.width = '100%';
                    img.style.maxHeight = '250px';
                    img.style.cursor = 'pointer';
                    img.style.borderRadius = '8px';
                    img.addEventListener('click', () => window.open(activity.image, '_blank'));
                    details.appendChild(img);
                }

                popup.querySelector('.popup-content').appendChild(details);
                delBtn.style.display = 'block';
                activitySelect.value = activity.id;
            } else {
                delBtn.style.display = 'none';
            }
        } else {
            delBtn.style.display = 'none';
        }
    }

    function closePopup() {
        const popup = document.getElementById('popup');
        popup.classList.add('hidden');
        selectedDate = null;
        calendar.drawHeader('');
    }

    window.closePopup = closePopup;

    document.getElementById('saveBtn').addEventListener('click', () => {
        const sel = Number(document.getElementById('activitySelect').value);
        const activity = getActivityById(sel);
        if (!activity) { alert('Activité introuvable'); return; }
        const planningDays = JSON.parse(localStorage.getItem('planningDays')) || {};
        planningDays[selectedDate] = { activityId: activity.id };
        localStorage.setItem('planningDays', JSON.stringify(planningDays));
        closePopup();
        calendar.drawDays();
    });

    document.getElementById('deleteBtn').addEventListener('click', () => {
        const planningDays = JSON.parse(localStorage.getItem('planningDays')) || {};
        if (planningDays[selectedDate]) delete planningDays[selectedDate];
        localStorage.setItem('planningDays', JSON.stringify(planningDays));
        closePopup();
        calendar.drawDays();
    });

    calendar.drawDays();
});
