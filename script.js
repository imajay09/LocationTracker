// script.js

let watchId;
let locationHistory = JSON.parse(localStorage.getItem('locationHistory')) || [];
let trackingInterval;
let map;
let marker;

// Initialize the map
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13); // Default view

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

// Start automatic tracking every minute
document.getElementById('startAutomaticTracking').addEventListener('click', function() {
    if (navigator.geolocation) {
        trackingInterval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        }, 60000); // 1 minute in milliseconds
        alert("Automatic tracking started every minute.");
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// Start manual tracking
document.getElementById('startManualTracking').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// Stop automatic tracking
document.getElementById('stopTracking').addEventListener('click', function() {
    clearInterval(trackingInterval);
    alert("Automatic tracking stopped.");
});

// Show position and save it
function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Display the latitude and longitude
    document.getElementById('location').innerText = `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

    // Save the location data
    saveLocation(latitude, longitude);

    // Update the map
    updateMap(latitude, longitude);
}

// Save location to history
function saveLocation(latitude, longitude) {
    const locationData = {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        timestamp: new Date().toISOString()
    };

    // Add to history
    locationHistory.push(locationData);
    localStorage.setItem('locationHistory', JSON.stringify(locationHistory));

    // Display the history
    displayLocationHistory();
}

// Display location history
function displayLocationHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = ''; // Clear previous history

    locationHistory.forEach((location, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerText = `Location ${index + 1}: Latitude: ${location.latitude}, Longitude: ${location.longitude}, Time: ${new Date(location.timestamp).toLocaleString()}`;

        // Create a button to show location on map
        const showOnMapButton = document.createElement('button');
        showOnMapButton.innerText = 'Show on Map';
        showOnMapButton.className = 'btn';
        showOnMapButton.onclick = function() {
            const latLng = { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) };
            addMarker(latLng);
        };

        // Create a delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = function() {
            deleteLocation(index);
        };

        historyItem.appendChild(showOnMapButton); // Append show on map button
        historyItem.appendChild(deleteButton); // Append delete button
        historyList.appendChild(historyItem);
    });
}

// Delete location from history
function deleteLocation(index) {
    locationHistory.splice(index, 1); // Remove the location from the array
    localStorage.setItem('locationHistory', JSON.stringify(locationHistory)); // Update local storage
    displayLocationHistory(); // Refresh the displayed history
}

// Update the map with the new position
function updateMap(latitude, longitude) {
    if (marker) {
        marker.setLatLng([latitude, longitude]);
    } else {
        marker = L.marker([latitude, longitude]).addTo(map);
    }
    map.setView([latitude, longitude], 13); // Center the map on the new location
}

// Add marker to the map
function addMarker(location) {
    if (marker) {
        map.removeLayer(marker); // Remove previous marker
    }
    marker = L.marker(location).addTo(map);
    map.setView(location, 13); // Center the map on the clicked location
}

// Handle geolocation errors
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User  denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

// Initialize the map when the page loads
window.onload = initMap;