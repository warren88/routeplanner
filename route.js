// Initialize the map
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.38, lng: -2.59 },
    zoom: 8,
  });
}

// The start point (WA4 1RX)
var startPoint = "WA4 1RX";

// Submit the form and generate the route when the user clicks the "Plan Route" button
document.getElementById("route-form").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the form from reloading the page

  // Get the end points (postcodes) from the form
  var endPoints = document.getElementById("end-points").value.split("\n");

  // The waypoints for the route (includes the start and end points)
  var waypoints = [{ location: startPoint }];
  for (var i = 0; i < endPoints.length; i++) {
    waypoints.push({ location: endPoints[i] });
  }
  waypoints.push({ location: startPoint }); // Add the start point as the final waypoint

  // The DirectionsService object that will calculate the route
  var directionsService = new google.maps.DirectionsService();

  // The DirectionsRenderer object that will display the route on the map
  var directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // The distance and duration of each leg of the route
  var legDistances = [];
  var legDurations = [];

  // The total distance and duration of the route
  var totalDistance = 0;
  var totalDuration = 0;

  // The request object for the DirectionsService
  var request = {
    origin: startPoint,
    destination: startPoint,
    waypoints: waypoints,
    optimizeWaypoints: true, // Find the most efficient route
    travelMode: "DRIVING",
  };

  // Calculate the route and display it on the map
  directionsService.route(request, function (response, status) {
    if (status == "OK") {
      directionsRenderer.setDirections(response);

            // Get the distance and duration for each leg of the route
      var legs = response.routes[0].legs;
      for (var i = 0; i < legs.length; i++) {
        legDistances.push(legs[i].distance.text);
        legDurations.push(legs[i].duration.text);
        totalDistance += legs[i].distance.value;
        totalDuration += legs[i].duration.value;
      }

      // Calculate the total time on the road (duration minus any time spent at the end points)
      var timeOnRoad = totalDuration - (endPoints.length * 600); // 600 seconds (10 minutes) spent at each end point
      var timeOnRoadHours = Math.floor(timeOnRoad / 3600);
      var timeOnRoadMinutes = Math.floor((timeOnRoad % 3600) / 60);

      // Calculate the ETA
      var currentTime = new Date();
      var eta = new Date(currentTime.getTime() + totalDuration * 1000);
      var etaHours = eta.getHours();
      var etaMinutes = eta.getMinutes();

      // Display the route details in a table
      var details = "<table><tr><th>Stop</th><th>Distance</th><th>Duration</th></tr>";
      for (var i = 0; i < legDistances.length; i++) {
        details +=
          "<tr" + (i % 2 == 0 ? ' class="stop"' : "") + "><td>" + (i + 1) + "</td><td>" + legDistances[i] + "</td><td>" + legDurations[i] + "</td></tr>";
      }
      details +=
        "<tr><td colspan='2'>Total Distance</td><td>" +
        Math.round(totalDistance / 1000) +
        " km</td></tr>";
      details +=
        "<tr><td colspan='2'>Total Duration</td><td>" +
        Math.floor(totalDuration / 3600) +
        " hours " +
        Math.floor((totalDuration % 3600) / 60) +
        " minutes</td></tr>";
      details +=
        "<tr><td colspan='2'>Total Time on Road</td><td>" +
        timeOnRoadHours +
        " hours " +
        timeOnRoadMinutes +
        " minutes</td></tr>";
      details += "<tr><td colspan='2'>ETA</td><td>" + etaHours + ":" + etaMinutes + "</td></tr>";
      details += "</table>";
      document.getElementById("route-details").innerHTML = details;
    } else {
      window.alert("Directions request failed due to " + status);
    }
  });
});

//Form function adding text fields
function createEndPoints() {
  // Create the start point text field
  var startPoint = document.createElement("div");
  startPoint.className = "end-point";
  startPoint.innerHTML = '<label for="end-point-1">Start Point (postcode):</label><br><input type="text" id="end-point-1" value="WA4 1RX">';
  document.getElementById("route-form").appendChild(startPoint);

  // Create the stop point text fields
  for (var i = 2; i <= 3; i++) {
    var stopPoint = document.createElement("div");
    stopPoint.className = "end-point";
    stopPoint.innerHTML = '<label for="end-point-' + i + '">Stop Point (postcode):</label><br><input type="text" id="end-point-' + i + '">';
    document.getElementById("route-form").appendChild(stopPoint);
  }

  // Create the end point text field
  var endPoint = document.createElement("div");
  endPoint.className = "end-point";
  endPoint.innerHTML = '<label for="end-point-4">End Point (postcode):</label><br><input type="text" id="end-point-4">';
  document.getElementById("route-form").appendChild(endPoint);

  // Add an event listener to the end point text field to add additional fields if necessary
  document.getElementById("end-point-4").addEventListener("input", function() {
    // Check if there are already the maximum number of fields
    if (document.getElementsByClassName("end-point").length >= 25) {
      return;
    }

    // If the end point field is not empty, add another field
    if (this.value) {
      var newEndPoint = document.createElement("div");
      newEndPoint.className = "end-point";
      newEndPoint.innerHTML = '<label for="end-point-' + (document.getElementsByClassName("end-point").length + 1) + '">Stop Point (postcode):</label><br><input type="text" id="end-point-' + (document.getElementsByClassName("end-point").length + 1) + '">';
      document.getElementById("route-form").appendChild(newEndPoint);
    }
  });
}

// Call the createEndPoints function when the page loads
window.onload = createEndPoints;
