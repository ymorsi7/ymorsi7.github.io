// Define your cities and corresponding photos here
const cities = [
  { name: 'sd', lat: 32.7157, lng: -117.1611, photos: ['san-diego1.jpg', 'san-diego2.jpg'] },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, photos: ['los-angeles1.jpg', 'los-angeles2.jpg'] },
  { name: 'Seattle', lat: 47.6062, lng: -122.3321, photos: ['seattle1.jpg', 'seattle2.jpg'] },
  { name: 'Portland, Oregon', lat: 45.5051, lng: -122.6750, photos: ['portland1.jpg', 'portland2.jpg'] },
  { name: 'Las Vegas', lat: 36.1699, lng: -115.1398, photos: ['las-vegas1.jpg', 'las-vegas2.jpg'] },
  { name: 'Albuquerque', lat: 35.0853, lng: -106.6056, photos: ['albuquerque1.jpg', 'albuquerque2.jpg'] },
  { name: 'Dallas', lat: 32.7767, lng: -96.7970, photos: ['dallas1.jpg', 'dallas2.jpg'] },
  { name: 'Tampa', lat: 27.9506, lng: -82.4572, photos: ['tampa1.jpg', 'tampa2.jpg'] },
  { name: 'Suffolk', lat: 36.7282, lng: -76.5836, photos: ['suffolk1.jpg', 'suffolk2.jpg'] },
  { name: 'Chesapeake', lat: 36.7682, lng: -76.2875, photos: ['chesapeake1.jpg', 'chesapeake2.jpg'] },
  { name: 'Washington, D.C.', lat: 38.9072, lng: -77.0379, photos: ['dc1.jpg', 'dc2.jpg'] },
  { name: 'Baltimore', lat: 39.2904, lng: -76.6122, photos: ['baltimore1.jpg', 'baltimore2.jpg'] },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298, photos: ['chicago1.jpg', 'chicago2.jpg'] },
  { name: 'Alexandria, Egypt', lat: 31.2156, lng: 29.9553, photos: ['alexandria1.jpg', 'alexandria2.jpg'] },
  { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, photos: ['cairo1.jpg', 'cairo2.jpg'] },
  { name: 'Sharm El Sheikh, Egypt', lat: 27.9158, lng: 34.3290, photos: ['sharm-el-sheikh1.jpg', 'sharm-el-sheikh2.jpg'] },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, photos: ['istanbul1.jpg', 'istanbul2.jpg'] },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, photos: ['san-francisco1.jpg', 'san-francisco2.jpg'] },
  { name: 'Sacramento', lat: 38.5816, lng: -121.4944, photos: ['sacramento1.jpg', 'sacramento2.jpg'] },
  { name: 'Phoenix', lat: 33.4484, lng: -112.0740, photos: ['phoenix1.jpg', 'phoenix2.jpg'] },
  { name: 'Honolulu', lat: 21.3069, lng: -157.8583, photos: ['honolulu1.jpg', 'honolulu2.jpg'] },
  { name: 'Redmond', lat: 47.6736, lng: -122.1215, photos: ['redmond1.jpg', 'redmond2.jpg'] },
  { name: 'Williamsburg, VA', lat: 37.2707, lng: -76.7075, photos: ['williamsburg1.jpg', 'williamsburg2.jpg'] },
  { name: 'Palm Springs, CA', lat: 33.8303, lng: -116.5453, photos: ['palm-springs1.jpg', 'palm-springs2.jpg'] }
];

// Create the map and add pinpoints for each city
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: { lat: 40, lng: -60 } // Adjust the latitude and longitude values as per your preference
  });

  const citiesContainer = document.getElementById('cities-container');

  cities.forEach((city, index) => {
    const marker = new google.maps.Marker({
      position: { lat: city.lat, lng: city.lng },
      map: map,
      title: city.name
    });

    const cityElement = document.createElement('div');
    cityElement.className = 'city';
    cityElement.innerHTML = `<h3 data-filter="${city.name}"></h3>`;

    marker.addListener('click', function () {
      showPhotoAlbum(city.photos);
    });

    cityElement.addEventListener('click', function () {
      showPhotoAlbum(city.photos);
    });

    citiesContainer.appendChild(cityElement);
  });

  google.maps.event.addListenerOnce(map, 'idle', function() {
    mapDiv.style.position = 'relative';
    mapDiv.style.width = '85%';
    google.maps.event.trigger(map, 'resize');
  });
}

// Display the photo album for a selected city
function showPhotoAlbum(photos) {
  const photoAlbum = document.getElementById('photo-album');
  photoAlbum.innerHTML = '';

  photos.forEach(photo => {
    const img = document.createElement('img');
    img.src = photo;
    photoAlbum.appendChild(img);
  });

  photoAlbum.style.display = 'block';
}