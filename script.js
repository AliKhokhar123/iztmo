// Toggle buttons
const toggleButtons = document.querySelectorAll('.search-toggle button');
toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Custom dropdown functionality
const dropdown = document.getElementById('tipoDropdown');
const optionsBox = dropdown.querySelector('.dropdown-options');
const tipoHidden = document.getElementById('tipoInput');
const selectedLabel = dropdown.querySelector('.selected-label');

function openDropdown(open) {
    if (open) {
        optionsBox.classList.add('show');
        dropdown.classList.add('open');
        dropdown.setAttribute('aria-expanded', 'true');
    } else {
        optionsBox.classList.remove('show');
        dropdown.classList.remove('open');
        dropdown.setAttribute('aria-expanded', 'false');
    }
}

dropdown.addEventListener('click', (e) => {
    // Don't let clicks inside options propagate to document
    if (e.target.closest('.dropdown-options')) return;
    openDropdown(!optionsBox.classList.contains('show'));
});

// Option click
optionsBox.querySelectorAll('[role="option"]').forEach(opt => {
    opt.addEventListener('click', () => {
        optionsBox.querySelectorAll('[role="option"]').forEach(o => o.setAttribute('aria-selected', 'false'));
        opt.setAttribute('aria-selected', 'true');
        const val = opt.dataset.value;
        selectedLabel.textContent = val;
        tipoHidden.value = val;
        openDropdown(false);
    });
});

// Keyboard support
dropdown.addEventListener('keydown', (e) => {
    const opts = Array.from(optionsBox.querySelectorAll('[role="option"]'));
    const currentIndex = opts.findIndex(o => o.getAttribute('aria-selected') === 'true');
    switch (e.key) {
        case 'Enter':
        case ' ': // Space
            e.preventDefault();
            openDropdown(!optionsBox.classList.contains('show'));
            break;
        case 'Escape':
            openDropdown(false);
            break;
        case 'ArrowDown':
            e.preventDefault();
            openDropdown(true);
            const next = opts[Math.min(currentIndex + 1, opts.length - 1)];
            if (next) next.focus?.();
            break;
        case 'ArrowUp':
            e.preventDefault();
            openDropdown(true);
            const prev = opts[Math.max(currentIndex - 1, 0)];
            if (prev) prev.focus?.();
            break;
    }
});

// Click outside to close
document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) openDropdown(false);
});