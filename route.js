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
function c() {
  // Create the start point text field
  var startPoint = document.createElement("div");
  startPoint.className = "end-point";
  startPoint.innerHTML = '<input type="text" id="end-point-1" value="WA4 1RX">';
  document.getElementById("route-form").appendChild(startPoint);

  // Create the end point text fields
  for (var i = 2; i <= 4; i++) {
    var endPoint = document.createElement("div");
    endPoint.className = "end-point";
    endPoint.innerHTML = '<input type="text" id="end-point-' + i + '">';
    document.getElementById("route-form").appendChild(endPoint);
  }

  // Add an event listener to the form to check if all fields are filled and add additional fields if necessary
  document.getElementById("route-form").addEventListener("input", function(event) {
    if (event.target.value && event.target.className === "end-point" && document.getElementsByClassName("end-point").length < 25) {
      var endPoint = document.createElement("div");
      endPoint.className = "end-point";
      endPoint.innerHTML = '<input type="text" id="end-point-' + (document.getElementsByClassName("end-point").length + 1) + '">';
      document.getElementById("route-form").appendChild(endPoint);
      for (var i = 0; i < document.getElementsByClassName("end-point").length - 1; i++) {
        document.getElementsByClassName("end-point")[i].children[0].removeAttribute("label");
      }
    }
  });
}
