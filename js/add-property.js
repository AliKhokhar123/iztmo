document.addEventListener('DOMContentLoaded', () => {
    // ---- STEP NAVIGATION LOGIC ----
    const totalSteps = 6;
    let currentStep = 1;

    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');
    const progressBar = document.getElementById('progressBar');
    const mainScroll = document.getElementById('mainScroll');

    function updateStep() {
        // Hide all steps
        for (let i = 1; i <= totalSteps; i++) {
            document.getElementById(`step${i}`).classList.remove('active');
        }
        
        // Show current step
        document.getElementById(`step${currentStep}`).classList.add('active');

        // Scroll top
        mainScroll.scrollTop = 0;

        // Update progress bar
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Update buttons
        btnBack.disabled = (currentStep === 1);
        
        if (currentStep === totalSteps) {
            btnNext.textContent = 'Finalizar Publicación';
        } else {
            btnNext.textContent = 'Continuar';
        }

        // Init Map if step 4 is active to avoid Leaflet render issues when hidden
        if (currentStep === 4 && !mapInitialized) {
            initMap();
        }
    }

    btnNext.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStep();
        } else {
            // Submit form logic here
            alert("¡Propiedad publicada con éxito!");
            window.location.href = "property-listing.html";
        }
    });

    btnBack.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });


    // ---- CUSTOM DROPDOWN LOGIC ----
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    dropdowns.forEach(dropdown => {
        const optionsBox = dropdown.querySelector('.dropdown-options');
        const selectedLabel = dropdown.querySelector('.selected-label');

        if (optionsBox && selectedLabel) {
            dropdown.addEventListener('click', (e) => {
                if (e.target.closest('.dropdown-options')) return;
                const isOpen = optionsBox.classList.contains('show');
                
                // Close all others first
                document.querySelectorAll('.dropdown-options').forEach(opt => {
                    opt.classList.remove('show');
                    const parent = opt.closest('.custom-dropdown');
                    if (parent) {
                        parent.classList.remove('show');
                    }
                });
                
                if (!isOpen) {
                    optionsBox.classList.add('show');
                    dropdown.classList.add('show');
                }
            });

            const options = optionsBox.querySelectorAll('[role="option"]');
            options.forEach(opt => {
                opt.addEventListener('click', () => {
                    selectedLabel.textContent = opt.dataset.value;
                    optionsBox.classList.remove('show');
                    dropdown.classList.remove('show');
                });
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.dropdown-options').forEach(opt => {
                opt.classList.remove('show');
                const parent = opt.closest('.custom-dropdown');
                if (parent) {
                    parent.classList.remove('show');
                }
            });
        }
    });

    // Amenities Selection
    const amenityPills = document.querySelectorAll('.amenity-pill');
    amenityPills.forEach(pill => {
        pill.addEventListener('click', () => {
            pill.classList.toggle('selected');
        });
    });

    // Make updateCounter global so onclick works in HTML
    window.updateCounter = (id, change) => {
        const el = document.getElementById(`${id}Count`);
        let val = parseInt(el.textContent);
        val += change;
        if (val < 0) val = 0; // Prevent negative
        el.textContent = val;
    };


    // ---- MAP LOGIC (LEAFLET) ----
    let mapInitialized = false;
    let map;
    let marker;

    function initMap() {
        // Panama City coordinates as default
        const defaultLat = 8.983333;
        const defaultLng = -79.516670;

        map = L.map('propertyMap').setView([defaultLat, defaultLng], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Add a draggable marker
        marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);

        // Update fields when marker is dragged
        marker.on('dragend', function (e) {
            const position = marker.getLatLng();
            console.log("New pin position: ", position.lat, position.lng);
            // Here we would ideally reverse-geocode the lat/lng into the input fields
        });

        // Click on map moves marker
        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
        });

        // Autocomplete search logic using OpenStreetMap Nominatim API
        const searchInput = document.getElementById('mapSearchInput');
        const searchResults = document.getElementById('mapSearchResults');
        let searchTimeout = null;

        if (searchInput && searchResults) {
            // Close suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.classList.remove('show');
                    searchResults.style.display = 'none';
                }
            });

            searchInput.addEventListener('input', function (e) {
                const query = searchInput.value.trim();
                
                // Clear existing timeout to debounce
                if (searchTimeout) clearTimeout(searchTimeout);

                if (query.length < 3) {
                    searchResults.classList.remove('show');
                    searchResults.style.display = 'none';
                    return;
                }

                // Debounce API calls (wait 500ms after user stops typing)
                searchTimeout = setTimeout(() => {
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
                        .then(response => response.json())
                        .then(data => {
                            searchResults.innerHTML = ''; // Clear previous results
                            
                            if (data && data.length > 0) {
                                data.forEach(result => {
                                    const option = document.createElement('div');
                                    option.setAttribute('role', 'option');
                                    option.style.padding = '10px 15px';
                                    option.style.cursor = 'pointer';
                                    option.style.borderBottom = '1px solid #eee';
                                    option.style.fontSize = '0.9rem';
                                    
                                    // Make it look like a list item
                                    option.innerHTML = `<i class="fas fa-map-marker-alt" style="margin-right:8px; color: var(--primary);"></i> ${result.display_name}`;
                                    
                                    // Hover effect
                                    option.addEventListener('mouseover', () => option.style.backgroundColor = '#f5f6f8');
                                    option.addEventListener('mouseout', () => option.style.backgroundColor = 'transparent');
                                    
                                    // Click event
                                    option.addEventListener('click', () => {
                                        const lat = parseFloat(result.lat);
                                        const lon = parseFloat(result.lon);
                                        
                                        searchInput.value = result.display_name;
                                        searchResults.classList.remove('show');
                                        searchResults.style.display = 'none';
                                        
                                        map.setView([lat, lon], 15);
                                        marker.setLatLng([lat, lon]);
                                    });

                                    searchResults.appendChild(option);
                                });
                                
                                searchResults.style.display = 'block';
                                // Slight delay to allow CSS animation if any
                                setTimeout(() => searchResults.classList.add('show'), 10);
                            } else {
                                searchResults.innerHTML = '<div style="padding: 10px 15px; color: #999; font-size: 0.9rem;">No se encontraron resultados...</div>';
                                searchResults.style.display = 'block';
                                setTimeout(() => searchResults.classList.add('show'), 10);
                            }
                        })
                        .catch(err => {
                            console.error("Error al buscar la dirección: ", err);
                        });
                }, 500); // 500ms delay
            });
            
            // Prevent form submit on enter
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') e.preventDefault();
            });
        }

        mapInitialized = true;
    }
});
