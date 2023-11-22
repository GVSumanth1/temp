let current_temperature;
let celsius_true = 1;
let current_location = "";

const API_ID = "17822b5332a932c4bac8091af7f7cc3d";
const PRIMARY_URL = "https://api.openweathermap.org/data/2.5/weather?";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/onecall?";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// const forecastDays = ["Sunday", "Monday", "Tuesday", "Wednesady", "Thursday", "Friday", "Saturday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const compassDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW","N"];

class Data {

}
let forecastData = [];

function openSidebar() {
	document.getElementById("sidebar").style.transform = "translateX(0)";
}

function closeSidebar() {
	document.getElementById("sidebar").style.transform = "translateX(-100%)";
}

document.getElementById("search-btn").addEventListener("click",openSidebar);
document.getElementById("close-btn").addEventListener("click",closeSidebar);

function celsiusScale() {
	celsius_true = 1;
	document.getElementById("celsius").className = "temp-btn on-state";
	document.getElementById("fahrenheit").className = "temp-btn off-state";

	document.getElementById("current-temp").innerHTML = convertToCelsius(main_temperature) + "<span id='units'>&deg;C</span>";
	displayForecastData(forecastData,celsius_true);
}

function fahrenheitScale() {
	celsius_true = 0;
	document.getElementById("celsius").className = "temp-btn off-state";
	document.getElementById("fahrenheit").className = "temp-btn on-state";

	document.getElementById("current-temp").innerHTML = main_temperature.toFixed(0) + "<span id='units'>&deg;F</span>";
	displayForecastData(forecastData,celsius_true);
}

document.getElementById("celsius").addEventListener("click",celsiusScale);
document.getElementById("fahrenheit").addEventListener("click",fahrenheitScale);

function convertToCelsius(number) {
	return (((number - 32)* 5)/9).toFixed(0);
}

function metresToMiles(number) {
	return (number*0.000621371).toFixed(1);
}

function coordinates(location) {
	let latitude = location.coords.latitude;
	let longitude = location.coords.longitude;

	requestWeather(latitude,longitude)
}

function currentLocation() {
	if(navigator.geolocation) {
		current_location = "current";
		navigator.geolocation.getCurrentPosition(coordinates);
	}
	else {
		alert("Your browser does not support geolocation please try searching your location.");
	}
}

function gpsFunction() {
	if (current_location !== "current") {
		current_location = "current";
		currentLocation();
	}
}

document.getElementById("gps-btn").addEventListener("click",gpsFunction);

document.getElementById("search-location-btn").addEventListener("click", ()=>{
	given_location = document.getElementById("search").value;
	if(current_location !== given_location) {
		current_location = given_location;
		searchLocationCoordinates(current_location);
	}
})

function searchLocationCoordinates(searchCity) {
	console.log(typeof(searchCity));
	let url = `${PRIMARY_URL}q=${searchCity}&appid=${API_ID}`
	let latitude="";
	let longitude="";

	fetch(url)
	.then(response => response.json())
	.then(data => {
		console.log(data);
		latitude = data.coord.lat;
		longitude = data.coord.lon;

		document.getElementById("invalid-city").style.display = "none";
		requestWeather(latitude, longitude);

	})
	.catch(error => {
		console.log(error);
		alert("Something went wrong!");
		document.getElementById("invalid-city").style.display = "block";
	})
}

function requestWeather(latitude, longitude) {
	let url = `${FORECAST_URL}lat=${latitude}&lon=${longitude}&units=imperial&appid=${API_ID}`;

	fetch(url)
	.then(response => response.json())
	.then(data => {
		console.log(data);
		setTodaysData(data,latitude,longitude);
		setTodaysHighlights(data);
		getForecastData(data);
		displayForecastData(forecastData,celsius_true);

	})
	.catch(error => {
		console.log(error);
		alert("Something went wrong!");
	})
}

currentLocation();

function setTodaysData(data,latitude,longitude) {
	let icon_id = data.current.weather[0].icon.slice(0,2);
	main_temperature = data.current.temp;

	document.getElementById("current-icon").src = "./assets/images/" + icon_id + ".png";
	document.getElementById("current-temp").innerHTML = convertToCelsius(main_temperature) + "<span id='units'>&deg;C</span>";
	document.getElementById("current-weather").innerHTML = data.current.weather[0].main;

	let current_day = new Date(data.current.dt*1000);
	document.getElementById("date").innerHTML = weekDays[current_day.getDay()] + ", " + months[current_day.getMonth()] + " " + current_day.getDate();

	setLocation(latitude,longitude);
}

function setTodaysHighlights(data) {
	let direction = data.current.wind_deg;
	document.getElementById("todays-wind").innerHTML = data.current.wind_speed.toFixed(1);
	document.getElementById("icon-direction").style.transform = "rotate(" + (direction-45) + "deg)";
	document.getElementById("wind-direction").innerHTML = compassDirections[(Math.round((direction%360)/22.5))];

	document.getElementById("todays-humidity").innerHTML = data.current.humidity;
	document.getElementById("bar").style.width = data.current.humidity + "%";

	document.getElementById("todays-visibility").innerHTML = metresToMiles(data.current.visibility);

	document.getElementById("todays-air-pressure").innerHTML = data.current.pressure;
}

function setLocation(lat,lon) {
	let url = `${PRIMARY_URL}lat=${lat}&lon=${lon}&appid=${API_ID}`;

	fetch(url)
	.then(response => response.json())
	.then(data => {
		console.log(data);
		document.getElementById("current-location").innerHTML = data.sys.country;
	})
	.catch(error => {
		console.log(error);
		alert("Something went wrong!")
	})
}

function getForecastData(data) {
	forecastData = [];

	for(let i=1; i<6; i++) {
		let newData = new Data();

		let current_day = new Date(data.daily[i].dt *1000)
		newData["day"] = weekDays[current_day.getDay()] + ", " + months[current_day.getMonth()] + " " + current_day.getDate();

		if(i === 1) {
			newData["day"] = "Tomorrow";
		}

		newData["temp_max"] = data.daily[i].temp.max;
		newData["temp_min"] = data.daily[i].temp.min;
		newData["icon_id"] = data.daily[i].weather[0].icon.slice(0,2);
		newData["main"] = data.daily[i].weather[0].main;

		forecastData.push(newData);
	}
}

function displayForecastData(forecastData,celsius_true) {
	let inner_html = ""

	for(let i=0; i<forecastData.length; i++) {
		inner_html += 
			`<div class="forecast-item">
				<div class="forecast-item-header">
					${forecastData[i].day}
				</div>

				<div class="forecast-item-icon">
					<img src="./assets/images/${forecastData[i].icon_id}.png">
				</div>

				<div class="forecast-item-description">
					${forecastData[i].main}
				</div>
	
				<div class="forecast-item-footer">
					<div class="max-temp">${(celsius_true === 1) ? (convertToCelsius(forecastData[i].temp_max) + "&deg;C") : (forecastData[i].temp_max.toFixed(0) + "&deg;F")}</div>
					<div class="min-temp">${(celsius_true === 1) ? (convertToCelsius(forecastData[i].temp_min) + "&deg;C") : (forecastData[i].temp_min.toFixed(0) + "&deg;F")}</div>
				</div>
			</div>`;
	}
	document.getElementById("forecast").innerHTML = inner_html;
}
