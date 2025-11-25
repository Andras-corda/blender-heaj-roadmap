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
        displayTimeline(data.phases);
        
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

// Fonction pour afficher la timeline
function displayTimeline(phases, filterStatus = 'all') {
    const container = document.getElementById('roadmap-container');
    
    // Filtrer les phases si nécessaire
    const filteredPhases = filterStatus === 'all' 
        ? phases 
        : phases.filter(phase => phase.status === filterStatus);
    
    if (filteredPhases.length === 0) {
        container.innerHTML = '<div class="loading">Aucune phase trouvée pour ce filtre.</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="timeline">
            ${filteredPhases.map((phase, index) => {
                const progress = calculateProgress(phase.tasks);
                const completedTasks = phase.tasks ? phase.tasks.filter(t => t.completed).length : 0;
                const totalTasks = phase.tasks ? phase.tasks.length : 0;
                
                return `
                    <div class="timeline-item" data-status="${phase.status}" data-index="${index}">
                        <div class="timeline-marker ${phase.status}"></div>
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <div>
                                    <h3 class="timeline-title">${phase.title}</h3>
                                    ${phase.date ? `<div class="timeline-date">${phase.date}</div>` : ''}
                                </div>
                                <span class="status-badge ${phase.status}">
                                    ${getStatusLabel(phase.status)}
                                </span>
                            </div>
                            
                            ${phase.description ? `
                                <p class="timeline-description">${phase.description}</p>
                            ` : ''}
                            
                            <div class="timeline-details">
                                ${phase.tasks && phase.tasks.length > 0 ? `
                                    <ul class="tasks">
                                        ${phase.tasks.map(task => `
                                            <li class="task-item">
                                                <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                                                <span class="task-text ${task.completed ? 'completed' : ''}">${task.name}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                    
                                    <div class="progress-container">
                                        <div class="progress-label">
                                            <span>Progress</span>
                                            <span>${completedTasks}/${totalTasks} tasks</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${progress}%"></div>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            ${phase.tasks && phase.tasks.length > 0 ? `
                                <div class="expand-hint">Click to expand</div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Ajouter les event listeners pour l'expansion
    setupTimelineExpansion();
}

// Configuration de l'expansion au clic
function setupTimelineExpansion() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        const content = item.querySelector('.timeline-content');
        
        content.addEventListener('click', (e) => {
            // Ne pas toggle si on clique sur un checkbox ou un lien
            if (e.target.closest('.task-checkbox')) return;
            
            // Toggle la classe expanded
            item.classList.toggle('expanded');
            
            // Fermer les autres items (optionnel - commentez si vous voulez plusieurs items ouverts)
            // timelineItems.forEach(otherItem => {
            //     if (otherItem !== item) {
            //         otherItem.classList.remove('expanded');
            //     }
            // });
        });
    });
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
        'todo': 'To do',
        'in-progress': 'In progress',
        'completed': 'Completed'
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
            
            // Afficher la timeline filtrée
            displayTimeline(window.roadmapData.phases, filterStatus);
        });
    });
}

// Chargement au démarrage de la page
document.addEventListener('DOMContentLoaded', loadRoadmap);