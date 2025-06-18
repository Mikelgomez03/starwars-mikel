document.addEventListener('DOMContentLoaded', () => {
    const listSection = document.getElementById('list-section');
    const listTitle = listSection.querySelector('h2');
    const loadingList = document.getElementById('loading-list');
    const itemsContainer = document.getElementById('items-container');

    const detailsSection = document.getElementById('details-section');
    const detailsTitle = detailsSection.querySelector('h2');
    const backButton = document.getElementById('back-button');
    const detailsContent = document.getElementById('details-content');

    const navButtons = document.querySelectorAll('.nav-button');

    const SWAPI_BASE_URL = 'https://swapi.py4e.com/api/';
    let currentResource = 'people';

    const resourceConfig = {
        people: {
            title: 'Personajes',
            nameKey: 'name',
            details: [
                { label: 'Altura', key: 'height', unit: ' cm' },
                { label: 'Peso', key: 'mass', unit: ' kg' },
                { label: 'Pelo', key: 'hair_color' },
                { label: 'Piel', key: 'skin_color' },
                { label: 'Ojos', key: 'eye_color' },
                { label: 'Nacimiento', key: 'birth_year' },
                { label: 'Género', key: 'gender' },
                { label: 'Planeta Natal', key: 'homeworld', fetchUrl: true, class: 'detail-homeworld' }
            ]
        },
        species: {
            title: 'Especies',
            nameKey: 'name',
            details: [
                { label: 'Clasificación', key: 'classification' },
                { label: 'Designación', key: 'designation' },
                { label: 'Altura Promedio', key: 'average_height', unit: ' cm' },
                { label: 'Esperanza de Vida', key: 'average_lifespan', unit: ' años' },
                { label: 'Pelo', key: 'hair_colors' },
                { label: 'Piel', key: 'skin_colors' },
                { label: 'Ojos', key: 'eye_colors' },
                { label: 'Idioma', key: 'language' },
                { label: 'Planeta Natal', key: 'homeworld', fetchUrl: true, class: 'detail-homeworld' }
            ]
        },
        planets: {
            title: 'Planetas',
            nameKey: 'name',
            details: [
                { label: 'Rotación', key: 'rotation_period', unit: ' horas' },
                { label: 'Órbita', key: 'orbital_period', unit: ' días' },
                { label: 'Diámetro', key: 'diameter', unit: ' km' },
                { label: 'Clima', key: 'climate' },
                { label: 'Gravedad', key: 'gravity' },
                { label: 'Terreno', key: 'terrain' },
                { label: 'Agua', key: 'surface_water', unit: '%' },
                { label: 'Población', key: 'population' }
            ]
        },
        vehicles: {
            title: 'Vehículos',
            nameKey: 'name',
            details: [
                { label: 'Modelo', key: 'model' },
                { label: 'Fabricante', key: 'manufacturer' },
                { label: 'Costo', key: 'cost_in_credits', unit: ' créditos' },
                { label: 'Longitud', key: 'length', unit: ' metros' },
                { label: 'Velocidad Máx.', key: 'max_atmosphering_speed' },
                { label: 'Tripulación', key: 'crew' },
                { label: 'Pasajeros', key: 'passengers' },
                { label: 'Carga', key: 'cargo_capacity', unit: ' kg' },
                { label: 'Consumibles', key: 'consumables' },
                { label: 'Clase', key: 'vehicle_class' }
            ]
        }
    };

    async function fetchAndDisplayResource(resourceType) {
        currentResource = resourceType;
        const config = resourceConfig[resourceType];

        listTitle.textContent = config.title;
        loadingList.style.display = 'block';
        itemsContainer.innerHTML = '';

        try {
            const response = await fetch(`${SWAPI_BASE_URL}${resourceType}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayListItems(data.results, config.nameKey);
        } catch (error) {
            console.error(`Error al obtener ${resourceType}:`, error);
            itemsContainer.innerHTML = `<p class="error-message">No se pudieron cargar ${config.title.toLowerCase()}. Intenta de nuevo más tarde.</p>`;
        } finally {
            loadingList.style.display = 'none';
        }
    }

    function displayListItems(items, nameKey) {
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add('character-item');
            listItem.innerHTML = `<h3>${item[nameKey]}</h3>`;
            listItem.addEventListener('click', () => showDetails(item));
            itemsContainer.appendChild(listItem);
        });
    }

    async function showDetails(item) {
        listSection.classList.add('hidden');
        detailsSection.classList.remove('hidden');
        detailsTitle.textContent = `${resourceConfig[currentResource].title}: ${item[resourceConfig[currentResource].nameKey]}`;
        detailsContent.innerHTML = '';

        const config = resourceConfig[currentResource];

        for (const detail of config.details) {
            const p = document.createElement('p');
            let value = item[detail.key];

            if (detail.fetchUrl && value) {
                p.innerHTML = `<strong>${detail.label}:</strong> <span id="detail-${detail.key}" class="${detail.class || ''}">Cargando...</span>`;
                detailsContent.appendChild(p);
                try {
                    const response = await fetch(value);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const fetchedData = await response.json();
                    document.getElementById(`detail-${detail.key}`).textContent = fetchedData.name || fetchedData.title || 'Desconocido';
                } catch (error) {
                    console.error(`Error al obtener ${detail.label}:`, error);
                    document.getElementById(`detail-${detail.key}`).textContent = 'Desconocido';
                }
            } else {
                value = value || 'N/A';
                if (detail.unit && value !== 'N/A') {
                    value += detail.unit;
                }
                p.innerHTML = `<strong>${detail.label}:</strong> <span class="${detail.class || ''}">${value}</span>`;
                detailsContent.appendChild(p);
            }
        }
    }

    backButton.addEventListener('click', () => {
        detailsSection.classList.add('hidden');
        listSection.classList.remove('hidden');
    });

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            fetchAndDisplayResource(e.target.dataset.resource);
        });
    });

    fetchAndDisplayResource(currentResource);
});