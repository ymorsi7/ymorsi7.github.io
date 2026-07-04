(function () {
	'use strict';

	// Maps parsed place (from h6 title) → metro album id.
	// Pasadena, Orange, etc. roll up into greater city areas.
	const PLACE_TO_METRO = {
		'San Francisco, CA': 'bay-area',
		'San Jose, CA': 'bay-area',
		'Santa Clara, CA': 'bay-area',
		'Hillsborough, CA': 'bay-area',
		'Oakland, CA': 'bay-area',
		'Mountain View, CA': 'bay-area',
		'Brisbane, CA': 'bay-area',
		'Marin County, CA': 'bay-area',
		'Stanford, CA': 'bay-area',
		'Capitola, CA': 'bay-area',
		'Mount Tamalpais, CA': 'bay-area',
		'Gilroy, CA': 'bay-area',
		'Los Banos, CA': 'bay-area',
		'Cantua Creek, CA': 'bay-area',
		'Sacramento, CA': 'sacramento',

		'Los Angeles, CA': 'los-angeles',
		'Pasadena, CA': 'los-angeles',
		'Fullerton, CA': 'los-angeles',
		'Orange, CA': 'los-angeles',
		'Santa Ana, CA': 'los-angeles',
		'Beverly Hills, CA': 'los-angeles',
		'Malibu, Los Angeles, CA': 'los-angeles',
		'Palm Springs, CA': 'los-angeles',
		'Avalon, CA': 'los-angeles',

		'San Diego, CA': 'san-diego',
		'Poway, CA': 'san-diego',
		'Jacumba Hot Springs, CA': 'san-diego',
		'Julian, CA': 'san-diego',

		'Carmel, CA': 'monterey-bay',

		'Seattle, WA': 'seattle',
		'Redmond, WA': 'seattle',

		'New York, NY': 'new-york',
		'Brooklyn, NY': 'new-york',

		'Chicago, IL': 'chicago',
		'Joliet, IL': 'chicago',
		'Lombard, IL': 'chicago',

		'Washington, DC': 'dmv',
		'Baltimore, MD': 'dmv',
		'Lanham, MD': 'dmv',

		'Miami, FL': 'miami',
		'Miami Beach, FL': 'miami',
		'Marco Island, FL': 'miami',
		'Tampa, FL': 'florida',

		'Portland, OR': 'portland',
		'Phoenix, AZ': 'phoenix',
		'Austin, TX': 'texas',
		'Dallas, TX': 'texas',
		'Atlanta, GA': 'atlanta',
		'Boston, MA': 'boston',
		'Honolulu, HI': 'hawaii',
		'Waikiki, Honolulu, HI': 'hawaii',
		'Las Vegas, NV': 'las-vegas',
		'Albuquerque, NM': 'new-mexico',
		'Williamsburg, VA': 'virginia',
		'Chesapeake, VA': 'virginia',

		'London, UK': 'london',
		'City of London, UK': 'london',
		'Canary Wharf, London, UK': 'london',
		'Feltham, UK': 'london',
		'Cambridge, UK': 'uk',
		'Whittlesford, UK': 'uk',

		'Rome, Italy': 'italy',
		'Athens, Greece': 'greece',
		'Swiss Alps, Switzerland': 'switzerland',
		'Istanbul, Turkey': 'turkey',

		'Alexandria, Egypt': 'egypt',
		'Cairo, Egypt': 'egypt',
		'Zamalek, Cairo, Egypt': 'egypt',
		'Damanhour, Egypt': 'egypt',
		'New Cairo, Egypt': 'egypt',
		'Marina El Alamein, Egypt': 'egypt',
		'Borg Al Arab, Egypt': 'egypt',
		'New Administrative Capital, Egypt': 'egypt',
		'El Alamein, Egypt': 'egypt',
		'Gleem Bay, Alexandria, Egypt': 'egypt',
		'Giza, Egypt': 'egypt',

		'Mecca, Saudi Arabia': 'saudi-arabia',
		'Medina, Saudi Arabia': 'saudi-arabia',

		'Dubai, UAE': 'uae',
		'Sharjah, UAE': 'uae',
		'Ras Al-Khaimah, UAE': 'uae',
		'Fujairah, UAE': 'uae',
		'Dibba Al-Fujairah, UAE': 'uae',

		'Kuwait City, Kuwait': 'kuwait',
		'Vancouver, BC': 'canada',
		'Whiting, IN': 'chicago',
		'Bristol, WI': 'chicago'
	};

	const METRO_LABELS = {
		'bay-area': 'Bay Area',
		'los-angeles': 'Los Angeles',
		'san-diego': 'San Diego',
		'monterey-bay': 'Monterey Bay',
		'sacramento': 'Sacramento',
		'seattle': 'Seattle',
		'new-york': 'New York',
		'chicago': 'Chicago',
		'dmv': 'DC / Baltimore',
		'miami': 'Miami',
		'florida': 'Florida',
		'portland': 'Portland',
		'phoenix': 'Phoenix',
		'texas': 'Texas',
		'atlanta': 'Atlanta',
		'boston': 'Boston',
		'hawaii': 'Hawaii',
		'las-vegas': 'Las Vegas',
		'new-mexico': 'New Mexico',
		'virginia': 'Virginia',
		'london': 'London',
		'uk': 'United Kingdom',
		'italy': 'Italy',
		'greece': 'Greece',
		'switzerland': 'Switzerland',
		'turkey': 'Turkey',
		'egypt': 'Egypt',
		'saudi-arabia': 'Saudi Arabia',
		'uae': 'UAE',
		'kuwait': 'Kuwait',
		'canada': 'Canada',
		'misc': 'Other'
	};

	function placeFromTitle(title) {
		if (!title) return '';
		const trimmed = title.trim();
		if (trimmed.includes(' · ')) {
			return trimmed.split(' · ').pop().trim();
		}
		return trimmed;
	}

	function slugify(text) {
		return text.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') || 'other';
	}

	function resolveMetro(place) {
		if (!place) return 'misc';
		if (PLACE_TO_METRO[place]) return PLACE_TO_METRO[place];
		return slugify(place);
	}

	function getMetroLabel(metroId) {
		if (METRO_LABELS[metroId]) return METRO_LABELS[metroId];
		return metroId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
	}

	function tagPortfolioBoxes() {
		document.querySelectorAll('.portfolio-box').forEach(box => {
			const title = box.querySelector('h6')?.textContent?.trim() || '';
			const place = placeFromTitle(title);
			const album = resolveMetro(place);
			box.dataset.album = album;
			box.dataset.place = place;
		});
	}

	function buildAlbumOptions() {
		const counts = new Map();
		document.querySelectorAll('.portfolio-box[data-album]').forEach(box => {
			const album = box.dataset.album;
			counts.set(album, (counts.get(album) || 0) + 1);
		});

		return Array.from(counts.entries())
			.sort((a, b) => getMetroLabel(a[0]).localeCompare(getMetroLabel(b[0])))
			.map(([id, count]) => ({ id, count, label: getMetroLabel(id) }));
	}

	function populateAlbumSelect(selectEl) {
		if (!selectEl) return;
		const current = selectEl.value || 'all';
		selectEl.innerHTML = '';

		const allOpt = document.createElement('option');
		allOpt.value = 'all';
		allOpt.textContent = 'All cities';
		selectEl.appendChild(allOpt);

		buildAlbumOptions().forEach(({ id, count, label }) => {
			const opt = document.createElement('option');
			opt.value = id;
			opt.textContent = `${label} (${count})`;
			selectEl.appendChild(opt);
		});

		if (selectEl.querySelector(`option[value="${current}"]`)) {
			selectEl.value = current;
		}
	}

	function getActiveTagFilter() {
		const active = document.querySelector('.filter-btn.active');
		return active?.getAttribute('data-filter') || 'all';
	}

	function getActiveAlbumFilter() {
		const select = document.getElementById('albumFilter');
		return select?.value || 'all';
	}

	function boxMatchesFilters(box) {
		const tag = getActiveTagFilter();
		const album = getActiveAlbumFilter();
		const tagOk = tag === 'all' || box.classList.contains(tag);
		const albumOk = album === 'all' || box.dataset.album === album;
		return tagOk && albumOk;
	}

	function applyGalleryFilters() {
		document.querySelectorAll('.portfolio-box').forEach(box => {
			box.style.display = boxMatchesFilters(box) ? 'block' : 'none';
		});

		const browseBtn = document.getElementById('browseGalleryBtn');
		const album = getActiveAlbumFilter();
		if (browseBtn) {
			const label = album === 'all'
				? 'Browse All Photos'
				: `Browse ${getMetroLabel(album)} Album`;
			browseBtn.innerHTML = `<i class="fa-solid fa-images" aria-hidden="true"></i><span>${label}</span>`;
		}
	}

	function setActiveFilterButton(activeBtn) {
		document.querySelectorAll('.filter-btn').forEach(btn => {
			const isActive = btn === activeBtn;
			btn.classList.toggle('active', isActive);
			btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
		});
	}

	function init() {
		tagPortfolioBoxes();
		const albumSelect = document.getElementById('albumFilter');
		populateAlbumSelect(albumSelect);

		document.querySelectorAll('.filter-btn').forEach(button => {
			button.addEventListener('click', () => {
				setActiveFilterButton(button);
				applyGalleryFilters();
			});
		});

		if (albumSelect) {
			albumSelect.addEventListener('change', applyGalleryFilters);
		}

		applyGalleryFilters();
	}

	window.PhotographyAlbums = {
		placeFromTitle,
		resolveMetro,
		getMetroLabel,
		boxMatchesFilters,
		getActiveAlbumFilter,
		init
	};
})();
