const CONFIG = {
  API_BASE_URL: "http://localhost:5000",
  OPENWEATHER_API_KEY: "your_api_key_here",
  UPDATE_INTERVAL: 5000,
  WEATHER_UPDATE_INTERVAL: 300000,
  MOISTURE_THRESHOLD: 30,
  PH_THRESHOLD_LOW: 5.5,
  PH_THRESHOLD_HIGH: 7.5,
  LOCATION: {
    lat: 40.7128,
    lon: -74.006,
  },
}

// Crop Icons Mapping
// const CROP_ICONS = {
//   Wheat: "🌾",
//   Maize: "🌽",
//   Corn: "🌽",
//   Sugarcane: "🎋",
//   Cotton: "🌸",
//   Rice: "🌾",
//   Sunflower: "🌻",
//   Tomato: "🍅",
//   Potato: "🥔",
//   Soybean: "🫘",
//   Barley: "🌾",
//   Lettuce: "🥬",
//   Carrot: "🥕",
//   Onion: "🧅",
//   Cabbage: "🥬",
//   Spinach: "🥬",
//   Peas: "🟢",
//   Beans: "🫘",
// }

//updated
// Crop Icons Mapping - Only keep the 5 crops
const CROP_ICONS = {
  Rice: "🌾",
  Maize: "🌽",
  Potato: "🥔",
  Cotton: "🌸",
  Sugarcane: "🎋"
};

// Global state
let updateIntervals = []
let isConnected = false
let lastAlertTime = 0

// DOM Elements
const elements = {
  connectionStatus: document.getElementById("connectionStatus"),
  connectionText: document.getElementById("connectionText"),
  alertContainer: document.getElementById("alertContainer"),
  alertMessage: document.getElementById("alertMessage"),

  // Moisture elements
  moistureValue: document.getElementById("moistureValue"),
  moistureProgress: document.getElementById("moistureProgress"),
  moistureStatus: document.getElementById("moistureStatus"),
  moistureUpdated: document.getElementById("moistureUpdated"),

  // NPK elements
  nitrogenValue: document.getElementById("nitrogenValue"),
  phosphorusValue: document.getElementById("phosphorusValue"),
  potassiumValue: document.getElementById("potassiumValue"),
  npkUpdated: document.getElementById("npkUpdated"),

  // Climate elements
  temperatureValue: document.getElementById("temperatureValue"),
  humidityValue: document.getElementById("humidityValue"),
  climateStatus: document.getElementById("climateStatus"),
  climateUpdated: document.getElementById("climateUpdated"),

  // pH elements (new)
  phValue: document.getElementById("phValue"),
  phProgress: document.getElementById("phProgress"),
  phStatus: document.getElementById("phStatus"),
  phUpdated: document.getElementById("phUpdated"),

  // Weather elements
  // weatherIcon: document.getElementById("weatherIcon"),
  // weatherTemp: document.getElementById("weatherTemp"),
  // weatherDesc: document.getElementById("weatherDesc"),
  // feelsLike: document.getElementById("feelsLike"),
  // windSpeed: document.getElementById("windSpeed"),
  // pressure: document.getElementById("pressure"),
  // weatherUpdated: document.getElementById("weatherUpdated"),

  // System elements
  irrigationStatus: document.getElementById("irrigationStatus"),
  lastWatering: document.getElementById("lastWatering"),
  waterLevel: document.getElementById("waterLevel"),
  systemUpdated: document.getElementById("systemUpdated"),
  systemModeToggle: document.getElementById("systemModeToggle"),
  systemModeText: document.getElementById("systemModeText"),

  lastSync: document.getElementById("lastSync"),

  // Crop recommendation elements
  singleCropRecommendation: document.getElementById("singleCropRecommendation"),
  npkSummary: document.getElementById("npkSummary"),
  tempSummary: document.getElementById("tempSummary"),
  humiditySummary: document.getElementById("humiditySummary"),
  moistureSummary: document.getElementById("moistureSummary"),
  cropsUpdated: document.getElementById("cropsUpdated"),

  //quick access- start irrigation button
  irrigationButton: document.getElementById("irrigationButton"),
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle')
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light')
})

//updated
// System Mode Toggle
elements.systemModeToggle.addEventListener('change', function() {
  const mode = this.checked ? 'Manual' : 'Auto';
  elements.systemModeText.textContent = mode;
  
  // Enable/disable irrigation button based on mode
  elements.irrigationButton.disabled = mode === 'Auto';
  
  // Change button style based on disabled state (preserving existing classes)
  if (mode === 'Auto') {
    elements.irrigationButton.classList.add('opacity-50', 'cursor-not-allowed');
    elements.irrigationButton.classList.remove('hover:-translate-y-0.5', 'hover:shadow-lg', 'hover:from-blue-600', 'hover:to-blue-700');
  } else {
    elements.irrigationButton.classList.remove('opacity-50', 'cursor-not-allowed');
    elements.irrigationButton.classList.add('hover:-translate-y-0.5', 'hover:shadow-lg', 'hover:from-blue-600', 'hover:to-blue-700');
  }
  
  // alert(`System mode changed to ${mode}`);
});

// Set initial theme
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

// System Mode Toggle
elements.systemModeToggle.addEventListener('change', function() {
  const mode = this.checked ? 'Manual' : 'Auto'
  elements.systemModeText.textContent = mode
  alert(`System mode changed to ${mode}`)
})

// Fetch crop recommendation from ML model API
// async function fetchCropRecommendation(sensorData) {
//   try {
//     // In real implementation, send POST request with sensor data
//     const response = await fetch(`${CONFIG.API_BASE_URL}/recommendation`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         nitrogen: sensorData.nitrogen,
//         phosphorus: sensorData.phosphorus,
//         potassium: sensorData.potassium,
//         moisture: sensorData.moisture,
//         temperature: sensorData.temperature,
//         humidity: sensorData.humidity,
//         ph: sensorData.ph,
//       }),
//     })

//     if (!response.ok) {
//       throw new Error(`API Error: ${response.status}`)
//     }

//     const data = await response.json()
//     return data
//   } catch (error) {
//     console.error("Error fetching crop recommendation:", error)

//     // Mock response for demonstration
//     const mockCrops = ["Wheat", "Sunflower", "Tomato", "Potato", "Rice", "Maize"]
//     const mockReasons = [
//       "Optimal NPK balance for growth",
//       "Phosphorus low, Moisture adequate",
//       "High nitrogen, good moisture levels",
//       "Temperature and humidity suitable",
//       "Nitrogen high, moisture optimal",
//       "Balanced conditions detected",
//     ]
//     const mockStatuses = ["RECOMMENDED", "SUITABLE", "NOT_SUITABLE"]

//     return {
//       crop: mockCrops[Math.floor(Math.random() * mockCrops.length)],
//       reason: mockReasons[Math.floor(Math.random() * mockReasons.length)],
//       status: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
//     }
//   }
// }


//updated

async function fetchCropRecommendation(sensorData) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nitrogen: sensorData.nitrogen,
        phosphorus: sensorData.phosphorus,
        potassium: sensorData.potassium,
        moisture: sensorData.moisture,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        ph: sensorData.ph,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      crop: data.crop,
      reason: data.reason || "Optimal conditions for this crop",
      status: "RECOMMENDED" // Force status to RECOMMENDED
    };
  } catch (error) {
    console.error("Error fetching crop recommendation:", error);

    // Mock response with only the 5 crops
    const mockCrops = ["Rice", "Maize", "Potato", "Cotton", "Sugarcane"];
    const mockReasons = [
      "Optimal NPK balance for growth",
      "Phosphorus low, Moisture adequate",
      "High nitrogen, good moisture levels",
      "Temperature and humidity suitable",
      "Nitrogen high, moisture optimal",
    ];

    return {
      crop: mockCrops[Math.floor(Math.random() * mockCrops.length)],
      reason: mockReasons[Math.floor(Math.random() * mockReasons.length)],
      status: "RECOMMENDED" // Only recommended status
    };
  }
}

function updateCropRecommendations(sensorData) {
  // Update current conditions display
  const npkText = `N:${sensorData.nitrogen} P:${sensorData.phosphorus} K:${sensorData.potassium}`
  elements.npkSummary.textContent = npkText
  elements.tempSummary.textContent = `${sensorData.temperature}°C`
  elements.humiditySummary.textContent = `${sensorData.humidity}%`
  elements.moistureSummary.textContent = `${sensorData.moisture}%`

  // Fetch and display crop recommendation
  fetchCropRecommendation(sensorData)
    .then((recommendation) => {
      displaySingleCropRecommendation(recommendation)
      elements.cropsUpdated.textContent = formatTime(new Date())
    })
    .catch((error) => {
      console.error("Failed to get crop recommendation:", error)
      displayErrorState()
    })
}

// function displaySingleCropRecommendation(recommendation) {
//   const { crop, reason, status } = recommendation

//   // Get crop icon, fallback to generic plant emoji
//   const cropIcon = CROP_ICONS[crop] || "🌱"

//   // Determine status class and display text
//   const statusClass = status.toLowerCase().replace("_", "-")
//   const statusText = status.replace("_", " ")

//   const recommendationHTML = `
//     <div class="recommended-crop ${statusClass} text-center p-6 rounded-xl transition-all duration-300 ${
//       statusClass === 'recommended' 
//         ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50' 
//         : statusClass === 'suitable' 
//           ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50' 
//           : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50'
//     }">
//       <span class="crop-icon-large text-6xl mb-4">${cropIcon}</span>
//       <div class="crop-name-large text-2xl font-bold ${
//         statusClass === 'recommended' 
//           ? 'text-green-800 dark:text-green-200' 
//           : statusClass === 'suitable' 
//             ? 'text-yellow-800 dark:text-yellow-200' 
//             : 'text-red-800 dark:text-red-200'
//       } mb-2">${crop}</div>
//       <div class="crop-reason text-gray-700 dark:text-gray-300 mb-4">${reason}</div>
//       <div class="crop-status-tag ${statusClass} inline-block px-4 py-2 rounded-full text-sm font-semibold ${
//         statusClass === 'recommended' 
//           ? 'bg-green-600 text-white' 
//           : statusClass === 'suitable' 
//             ? 'bg-yellow-600 text-white' 
//             : 'bg-red-600 text-white'
//       }">${statusText}</div>
//     </div>
//   `

//   elements.singleCropRecommendation.innerHTML = recommendationHTML
// }

//updated

function displaySingleCropRecommendation(recommendation) {
  const { crop, reason } = recommendation;
  const cropIcon = CROP_ICONS[crop] || "🌱";

  const recommendationHTML = `
    <div class="recommended-crop recommended text-center p-6 rounded-xl transition-all duration-300 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50">
      <span class="crop-icon-large text-6xl mb-4">${cropIcon}</span>
      <div class="crop-name-large text-2xl font-bold text-green-800 dark:text-green-200 mb-2">${crop}</div>
      <div class="crop-reason text-gray-700 dark:text-gray-300 mb-4">${reason}</div>
      <div class="crop-status-tag recommended inline-block px-4 py-2 rounded-full text-sm font-semibold bg-green-600 text-white">RECOMMENDED</div>
    </div>
  `;

  elements.singleCropRecommendation.innerHTML = recommendationHTML;
}

function displayErrorState() {
  const errorHTML = `
    <div class="error-message text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700/50">
      <span class="error-icon text-4xl text-red-500 dark:text-red-300 mb-3">⚠️</span>
      <div class="error-text text-lg font-medium text-red-700 dark:text-red-300 mb-1">Unable to get recommendation</div>
      <div class="error-subtitle text-sm text-red-600 dark:text-red-400">Please check your connection and try again</div>
    </div>
  `

  elements.singleCropRecommendation.innerHTML = errorHTML
}

// Utility Functions
function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  })
}

function updateConnectionStatus(connected) {
  isConnected = connected
  elements.connectionStatus.className = connected 
    ? "status-dot w-3 h-3 rounded-full bg-green-500 animate-pulse-slow" 
    : "status-dot w-3 h-3 rounded-full bg-red-500"
  elements.connectionText.textContent = connected ? "Connected" : "Disconnected"
  elements.connectionText.className = connected 
    ? "status-text text-sm font-medium text-green-800 dark:text-green-300" 
    : "status-text text-sm font-medium text-red-800 dark:text-red-300"
}

function showAlert(message) {
  const now = Date.now()
  if (now - lastAlertTime < 60000) return // Prevent spam alerts

  elements.alertMessage.textContent = message
  elements.alertContainer.style.display = "block"
  lastAlertTime = now
}

function dismissAlert() {
  elements.alertContainer.style.display = "none"
}

// API Functions with Mock Data
async function fetchSensorData() {
  try {
    // Simulate API call with mock data
    const mockData = {
      moisture: Math.floor(Math.random() * 100),
      temperature: (Math.random() * 15 + 20).toFixed(1), // 20-35°C
      humidity: Math.floor(Math.random() * 40 + 40), // 40-80%
      nitrogen: Math.floor(Math.random() * 50 + 100), // 100-150 ppm
      phosphorus: Math.floor(Math.random() * 30 + 20), // 20-50 ppm
      potassium: Math.floor(Math.random() * 80 + 120), // 120-200 ppm
      ph: (Math.random() * 4 + 5).toFixed(1), // 5-9 pH
      timestamp: new Date().toISOString(),
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    updateConnectionStatus(true)
    return mockData
  } catch (error) {
    console.error("Error fetching sensor data:", error)
    updateConnectionStatus(false)
    throw error
  }
}

async function fetchWeatherData() {
  try {
    // Mock weather data - in real implementation, use OpenWeather API
    const mockWeatherData = {
      temperature: (Math.random() * 10 + 20).toFixed(1),
      feels_like: (Math.random() * 10 + 22).toFixed(1),
      humidity: Math.floor(Math.random() * 30 + 50),
      pressure: Math.floor(Math.random() * 50 + 1000),
      wind_speed: (Math.random() * 10 + 5).toFixed(1),
      weather: {
        main: ["Clear", "Clouds", "Rain", "Sunny"][Math.floor(Math.random() * 4)],
        description: "partly cloudy",
      },
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    return mockWeatherData
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}

// Update Functions
function updateMoistureData(data) {
  const moisture = data.moisture
  elements.moistureValue.textContent = moisture
  elements.moistureUpdated.textContent = formatTime(new Date())

  // Update progress bar
  elements.moistureProgress.style.width = `${moisture}%`

  // Update status and styling
  if (moisture < 30) {
    elements.moistureStatus.textContent = "Critical - Irrigation Needed"
    elements.moistureStatus.className = "metric-status text-sm font-medium px-3 py-1.5 rounded text-center bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
    elements.moistureProgress.className = "progress-fill h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-400 to-red-600"
    showAlert(`Soil moisture is critically low at ${moisture}%. Immediate irrigation recommended.`)
  } else if (moisture < 60) {
    elements.moistureStatus.textContent = "Low - Monitor Closely"
    elements.moistureStatus.className = "metric-status text-sm font-medium px-3 py-1.5 rounded text-center bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
    elements.moistureProgress.className = "progress-fill h-full rounded-full transition-all duration-500 bg-gradient-to-r from-yellow-400 to-yellow-600"
  } else {
    elements.moistureStatus.textContent = "Optimal"
    elements.moistureStatus.className = "metric-status text-sm font-medium px-3 py-1.5 rounded text-center bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
    elements.moistureProgress.className = "progress-fill h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-600"
  }
}

function updateNPKData(data) {
  elements.nitrogenValue.textContent = data.nitrogen
  elements.phosphorusValue.textContent = data.phosphorus
  elements.potassiumValue.textContent = data.potassium
  elements.npkUpdated.textContent = formatTime(new Date())
}

function updateClimateData(data) {
  elements.temperatureValue.textContent = data.temperature
  elements.humidityValue.textContent = data.humidity
  elements.climateUpdated.textContent = formatTime(new Date())

  // Update climate status
  const temp = Number.parseFloat(data.temperature)
  const humidity = Number.parseInt(data.humidity)

  if (temp >= 20 && temp <= 30 && humidity >= 40 && humidity <= 70) {
    elements.climateStatus.textContent = "Optimal Growing Conditions"
    elements.climateStatus.className = "climate-status text-sm font-medium px-3 py-1.5 rounded text-center bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
  } else {
    elements.climateStatus.textContent = "Monitor Environmental Conditions"
    elements.climateStatus.className = "climate-status text-sm font-medium px-3 py-1.5 rounded text-center bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
  }
}

// New pH update function
function updatePHData(data) {
  const ph = parseFloat(data.ph)
  elements.phValue.textContent = ph
  elements.phUpdated.textContent = formatTime(new Date())
  
// Update progress bar (scaled from 0 to 14 pH)
const phPercentage = (ph / 14) * 100;
elements.phProgress.style.width = `${phPercentage}%`;

  
  // Update status and styling
  if (ph < CONFIG.PH_THRESHOLD_LOW) {
    elements.phStatus.textContent = "Too Acidic - Add Lime"
    elements.phStatus.className = "metric-status text-sm font-medium px-3 py-1.5 rounded text-center bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
    elements.phProgress.className = "progress-fill h-full rounded-full transition-all duration-500 bg-gradient-to-r from-pink-500 to-red-500"
  } else if (ph > CONFIG.PH_THRESHOLD_HIGH) {
    elements.phStatus.textContent = "Too Alkaline - Add Sulfur"
    elements.phStatus.className = "metric-status text-sm font-medium px-3 py-1.5 rounded text-center bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
    elements.phProgress.className = "progress-fill h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-pink-500"
  } else {
    elements.phStatus.textContent = "Optimal for Most Crops"
    elements.phStatus.className = "metric-status text-sm font-medium px-3 py-1.5 rounded text-center bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
    elements.phProgress.className = "progress-fill h-full rounded-full transition-all duration-500 bg-gradient-to-r from-green-400 to-teal-400"
  }
}

// function updateWeatherData(data) {
//   elements.weatherTemp.textContent = `${data.temperature}°C`
//   elements.weatherDesc.textContent = data.weather.description
//   elements.feelsLike.textContent = `${data.feels_like}°C`
//   elements.windSpeed.textContent = `${data.wind_speed} km/h`
//   elements.pressure.textContent = `${data.pressure} hPa`
//   elements.weatherUpdated.textContent = formatTime(new Date())

//   // Update weather icon based on conditions
//   const weatherIcons = {
//     Clear: "☀️",
//     Clouds: "☁️",
//     Rain: "🌧️",
//     Sunny: "🌞",
//     Snow: "❄️",
//     Thunderstorm: "⛈️",
//   }

//   elements.weatherIcon.textContent = weatherIcons[data.weather.main] || "🌤️"
// }

function updateSystemStatus() {
  const now = new Date()
  elements.systemUpdated.textContent = formatTime(now)

  // Simulate system status updates
  const statuses = ["Active", "Standby", "Maintenance"]
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

  if (randomStatus === "Active") {
    elements.irrigationStatus.innerHTML = '<span class="status-indicator-small w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></span> Active'
  } else {
    elements.irrigationStatus.innerHTML = `<span class="status-indicator-small w-2 h-2 rounded-full bg-gray-500"></span> ${randomStatus}`
  }

  // Update water level
  const waterLevel = Math.floor(Math.random() * 30 + 70) // 70-100%
  elements.waterLevel.textContent = `${waterLevel}%`

  // Update last watering time
  const hoursAgo = Math.floor(Math.random() * 12 + 1)
  elements.lastWatering.textContent = `${hoursAgo} hours ago`
}

// Main update functions
async function updateSensorData() {
  try {
    const data = await fetchSensorData()
    updateMoistureData(data)
    updateNPKData(data)
    updateClimateData(data)
    updatePHData(data) // Update pH data
    updateCropRecommendations(data)
    updateSystemStatus()
    elements.lastSync.textContent = formatTime(new Date())
  } catch (error) {
    console.error("Failed to update sensor data:", error)
    updateConnectionStatus(false)
  }
}

async function updateWeather() {
  try {
    const data = await fetchWeatherData()
    updateWeatherData(data)
  } catch (error) {
    console.error("Failed to update weather data:", error)
  }
}

// Action Functions
function manualIrrigation() {
  // Double-check we're in manual mode
  if (!elements.systemModeToggle.checked) {
    alert("Please switch to Manual mode first!");
    return;
  }

  if (confirm("Start manual irrigation? This will run the irrigation system for 10 minutes.")) {
    alert("Manual irrigation started! System will run for 10 minutes.");
    // In real implementation, send API request to start irrigation
    console.log("Manual irrigation started");
  }
}

function refreshData() {
  updateSensorData()
  updateWeather()
  alert("Data refreshed successfully!")
}

function exportData() {
  // Simulate data export
  const data = {
    timestamp: new Date().toISOString(),
    moisture: elements.moistureValue.textContent,
    temperature: elements.temperatureValue.textContent,
    humidity: elements.humidityValue.textContent,
    nitrogen: elements.nitrogenValue.textContent,
    phosphorus: elements.phosphorusValue.textContent,
    potassium: elements.potassiumValue.textContent,
    ph: elements.phValue.textContent,
  }

  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement("a")
  link.href = url
  link.download = `irrigation-data-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  alert("Data exported successfully!")
}

// Initialize Dashboard
// Initialize Dashboard
function initializeDashboard() {
  console.log("Initializing Smart Irrigation Dashboard...");

  // Set initial button state based on default mode
  const initialMode = elements.systemModeToggle.checked ? 'Manual' : 'Auto';
  elements.irrigationButton.disabled = initialMode === 'Auto';
  
  if (initialMode === 'Auto') {
    elements.irrigationButton.classList.add('opacity-50', 'cursor-not-allowed');
    elements.irrigationButton.classList.remove('hover:bg-blue-600');
  } else {
    elements.irrigationButton.classList.remove('opacity-50', 'cursor-not-allowed');
    elements.irrigationButton.classList.add('hover:bg-blue-600');
  }

  // Initial data load
  updateSensorData();
  updateWeather();

  // Set up intervals
  updateIntervals.push(setInterval(updateSensorData, CONFIG.UPDATE_INTERVAL));
  updateIntervals.push(setInterval(updateWeather, CONFIG.WEATHER_UPDATE_INTERVAL));

  // Update connection status
  updateConnectionStatus(true);

  console.log("Dashboard initialized successfully!");
}

// Cleanup function
function cleanup() {
  updateIntervals.forEach((interval) => clearInterval(interval))
  updateIntervals = []
}

// Event Listeners
window.addEventListener("load", initializeDashboard)
window.addEventListener("beforeunload", cleanup)

// Handle visibility change to pause/resume updates when tab is not active
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cleanup()
  } else {
    initializeDashboard()
  }
})

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case "r":
        event.preventDefault()
        refreshData()
        break
      case "i":
        event.preventDefault()
        manualIrrigation()
        break
      case "e":
        event.preventDefault()
        exportData()
        break
    }
  }
})



// Make functions globally available
window.manualIrrigation = manualIrrigation
window.refreshData = refreshData
window.exportData = exportData
window.dismissAlert = dismissAlert
