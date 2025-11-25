// Fonction principale pour charger et afficher la roadmap
async function loadRoadmap() {
    const container = document.getElementById('roadmap-container');
    
    try {
        // Chargement du fichier JSON
        const response = await fetch('roadmap.json');
        if (!response.ok) {
            throw new Error('Impossible de charger la roadmap');
        }
        
        const data = await response.json();
        
        // Stockage des données globalement pour le filtrage
        window.roadmapData = data;
        
        // Affichage initial
        displayRoadmap(data.phases);
        
        // Configuration des filtres
        setupFilters();
        
    } catch (error) {
        container.innerHTML = `
            <div class="error">
                ❌ Erreur: ${error.message}
            </div>
        `;
    }
}

// Fonction pour afficher la roadmap
function displayRoadmap(phases, filterStatus = 'all') {
    const container = document.getElementById('roadmap-container');
    
    // Filtrer les phases si nécessaire
    const filteredPhases = filterStatus === 'all' 
        ? phases 
        : phases.filter(phase => phase.status === filterStatus);
    
    if (filteredPhases.length === 0) {
        container.innerHTML = '<div class="loading">Aucune phase trouvée pour ce filtre.</div>';
        return;
    }
    
    container.innerHTML = filteredPhases.map(phase => {
        const progress = calculateProgress(phase.tasks);
        
        return `
            <div class="phase" data-status="${phase.status}">
                <div class="phase-header">
                    <div>
                        <h2 class="phase-title">${phase.title}</h2>
                        ${phase.date ? `<span class="phase-date">📅 ${phase.date}</span>` : ''}
                    </div>
                    <span class="status-badge ${phase.status}">
                        ${getStatusLabel(phase.status)}
                    </span>
                </div>
                
                ${phase.description ? `<p class="phase-description">${phase.description}</p>` : ''}
                
                ${phase.tasks && phase.tasks.length > 0 ? `
                    <ul class="tasks">
                        ${phase.tasks.map(task => `
                            <li class="task-item">
                                <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                                <span class="task-text ${task.completed ? 'completed' : ''}">${task.name}</span>
                            </li>
                        `).join('')}
                    </ul>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Calcul de la progression d'une phase
function calculateProgress(tasks) {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
}

// Obtenir le label du statut
function getStatusLabel(status) {
    const labels = {
        'todo': 'À faire',
        'in-progress': 'En cours',
        'completed': 'Terminé'
    };
    return labels[status] || status;
}

// Configuration des boutons de filtre
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');
            
            // Récupérer le statut du filtre
            const filterStatus = button.dataset.status;
            
            // Afficher la roadmap filtrée
            displayRoadmap(window.roadmapData.phases, filterStatus);
        });
    });
}

// Chargement au démarrage de la page
document.addEventListener('DOMContentLoaded', loadRoadmap);