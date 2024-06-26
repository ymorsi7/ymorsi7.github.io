
// Define your cities and corresponding photos here
const cities = [
  { name: 'San Diego, CA', lat: 32.7157, lng: -117.1611, photos: '' },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, photos: '' },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, photos: '' },
  { name: 'Portland, OR', lat: 45.5051, lng: -122.6750, photos: '' },
  { name: 'Las Vegas, NV', lat: 36.1699, lng: -115.1398, photos: '' },
  { name: 'Albuquerque, MN', lat: 35.0853, lng: -106.6056, photos: '' },
  { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970, photos: '' },
  { name: 'Tampa, FL', lat: 27.9506, lng: -82.4572, photos: '' },
  { name: 'Suffolk, VA', lat: 36.7282, lng: -76.5836, photos: '' },
  { name: 'Chesapeake, VA', lat: 36.7682, lng: -76.2875, photos: '' },
  { name: 'Washington, D.C.', lat: 38.9072, lng: -77.0379, photos: '' },
  { name: 'Baltimore, MD', lat: 39.2904, lng: -76.6122, photos: '' },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, photos: '' },
  { name: 'Alexandria, EG', lat: 31.2156, lng: 29.9553, photos: '' },
  { name: 'Cairo, EG', lat: 30.0444, lng: 31.2357, photos: '' },
  { name: 'Sharm El Sheikh, EG', lat: 27.9158, lng: 34.3290, photos: '' },
  { name: 'Istanbul, TR', lat: 41.0082, lng: 28.9784, photos: '' },
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, photos: '' },
  { name: 'Sacramento, CA', lat: 38.5816, lng: -121.4944, photos: '' },
  { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740, photos: '' },
  { name: 'Honolulu, HI', lat: 21.3069, lng: -157.8583, photos: '' },
  { name: 'Redmond, WA', lat: 47.6736, lng: -122.1215, photos: '' },
  { name: 'Williamsburg, VA', lat: 37.2707, lng: -76.7075, photos: '' },
  { name: 'Palm Springs, CA', lat: 33.8303, lng: -116.5453, photos: '' },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431, photos: ''},
  {name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652, photos: ''},
  {name: 'Wilmington, DE', lat: 39.7391, lng: -75.5398, photos: ''},
  {name: 'New Brunswick, NJ', lat: 40.4862, lng: -74.4518, photos: ''},
  {name: 'Jersey City, NJ', lat: 40.7282, lng: -74.0776, photos: ''},
{name: 'Brooklyn, NY', lat: 40.6782, lng: -73.9442, photos: ''},
{name: 'Yuma, AZ', lat: 32.6922, lng: -114.6277, photos: ''}


  //   { name: 'St. Louis', lat: 38.6270, lng: -90.1994, photos: ['st-louis1.jpg', 'st-louis2.jpg'] },
  //   { name: 'Kansas City', lat: 39.0997, lng: -94.5786, photos: ['kansas-city1.jpg', 'kansas-city2.jpg'] },
  //   { name: 'Jefferson City, MO', lat: 38.5767, lng: -92.1735, photos: ['jefferson-city1.jpg', 'jefferson-city2.jpg'] },
  //   { name: 'Columbia, MO', lat: 38.9517, lng: -92.3341, photos: ['columbia1.jpg', 'columbia2.jpg'] },
  //   { name: 'Denver', lat: 39.7392, lng: -104.9903, photos: ['denver1.jpg', 'denver2.jpg'] },
 //   { name: 'Vancouver, BC', lat: 49.2827, lng: -123.1207, photos: ['vancouver1.jpg', 'vancouver2.jpg'] },
  //   { name: 'Nashville', lat: 36.1627, lng: -86.7816, photos: []},
];

// Create the map and add pinpoints for each city
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: { lat: 40, lng: -60 } // Adjust the latitude and longitude values as per your preference
  });



  google.maps.event.addListenerOnce(map, 'idle', function () {
    mapDiv.style.position = 'relative';
    mapDiv.style.width = '85%';
    google.maps.event.trigger(map, 'resize');
  });

  cities.forEach(city => {
    const marker = new google.maps.Marker({
      position: { lat: city.lat, lng: city.lng },
      map: map,
      title: city.name
    });

    marker.addListener('click', function () {
      showPhotoAlbum(city.photos);
    });
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
