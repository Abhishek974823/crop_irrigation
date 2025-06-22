// Configuration
const CONFIG = {
  API_BASE_URL: "http://localhost:5000",
  OPENWEATHER_API_KEY: "your_api_key_here", // Replace with actual API key
  UPDATE_INTERVAL: 5000, // 5 seconds
  WEATHER_UPDATE_INTERVAL: 300000, // 5 minutes
  MOISTURE_THRESHOLD: 30, // Low moisture threshold
  LOCATION: {
    lat: 40.7128,
    lon: -74.006, // New York coordinates - replace with your location
  },
}

// Crop Icons Mapping
const CROP_ICONS = {
  Wheat: "🌾",
  Maize: "🌽",
  Corn: "🌽",
  Sugarcane: "🎋",
  Cotton: "🌸",
  Rice: "🌾",
  Sunflower: "🌻",
  Tomato: "🍅",
  Potato: "🥔",
  Soybean: "🫘",
  Barley: "🌾",
  Lettuce: "🥬",
  Carrot: "🥕",
  Onion: "🧅",
  Cabbage: "🥬",
  Spinach: "🥬",
  Peas: "🟢",
  Beans: "🫘",
}

// Fetch crop recommendation from ML model API
async function fetchCropRecommendation(sensorData) {
  try {
    // In real implementation, send POST request with sensor data
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
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching crop recommendation:", error)

    // Mock response for demonstration
    const mockCrops = ["Wheat", "Sunflower", "Tomato", "Potato", "Rice", "Maize"]
    const mockReasons = [
      "Optimal NPK balance for growth",
      "Phosphorus low, Moisture adequate",
      "High nitrogen, good moisture levels",
      "Temperature and humidity suitable",
      "Nitrogen high, moisture optimal",
      "Balanced conditions detected",
    ]
    const mockStatuses = ["RECOMMENDED", "RECOMMENDED", "RECOMMENDED"]

    return {
      crop: mockCrops[Math.floor(Math.random() * mockCrops.length)],
      reason: mockReasons[Math.floor(Math.random() * mockReasons.length)],
      status: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
    }
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

function displaySingleCropRecommendation(recommendation) {
  const { crop, reason, status } = recommendation

  // Get crop icon, fallback to generic plant emoji
  const cropIcon = CROP_ICONS[crop] || "🌱"

  // Determine status class and display text
  const statusClass = status.toLowerCase().replace("_", "-")
  const statusText = status.replace("_", " ")

  const recommendationHTML = `
    <div class="recommended-crop ${statusClass}">
      <span class="crop-icon-large">${cropIcon}</span>
      <div class="crop-name-large">${crop}</div>
      <div class="crop-reason">${reason}</div>
      <div class="crop-status-tag ${statusClass}">${statusText}</div>
    </div>
  `

  elements.singleCropRecommendation.innerHTML = recommendationHTML
}

function displayErrorState() {
  const errorHTML = `
    <div class="error-message">
      <span class="error-icon">⚠️</span>
      <div class="error-text">Unable to get recommendation</div>
      <div class="error-subtitle">Please check your connection and try again</div>
    </div>
  `

  elements.singleCropRecommendation.innerHTML = errorHTML
}

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

  // Weather elements
  weatherIcon: document.getElementById("weatherIcon"),
  weatherTemp: document.getElementById("weatherTemp"),
  weatherDesc: document.getElementById("weatherDesc"),
  feelsLike: document.getElementById("feelsLike"),
  windSpeed: document.getElementById("windSpeed"),
  pressure: document.getElementById("pressure"),
  weatherUpdated: document.getElementById("weatherUpdated"),

  // System elements
  irrigationStatus: document.getElementById("irrigationStatus"),
  lastWatering: document.getElementById("lastWatering"),
  waterLevel: document.getElementById("waterLevel"),
  systemUpdated: document.getElementById("systemUpdated"),

  lastSync: document.getElementById("lastSync"),

  // Crop recommendation elements
  cropRecommendations: document.getElementById("cropRecommendations"),
  cropConditions: document.getElementById("cropConditions"),
  conditionSummary: document.getElementById("conditionSummary"),
  cropsUpdated: document.getElementById("cropsUpdated"),
  npkSummary: document.getElementById("npkSummary"),
  tempSummary: document.getElementById("tempSummary"),
  humiditySummary: document.getElementById("humiditySummary"),
  moistureSummary: document.getElementById("moistureSummary"),
  singleCropRecommendation: document.getElementById("cropRecommendations"),

  // Crop recommendation elements (single crop)
  singleCropRecommendation: document.getElementById("singleCropRecommendation"),
  currentConditions: document.getElementById("currentConditions"),
  npkSummary: document.getElementById("npkSummary"),
  tempSummary: document.getElementById("tempSummary"),
  humiditySummary: document.getElementById("humiditySummary"),
  moistureSummary: document.getElementById("moistureSummary"),
  cropsUpdated: document.getElementById("cropsUpdated"),
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
  elements.connectionStatus.className = `status-dot ${connected ? "" : "disconnected"}`
  elements.connectionText.textContent = connected ? "Connected" : "Disconnected"
  elements.connectionText.className = `status-text ${connected ? "" : "disconnected"}`
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
    elements.moistureStatus.className = "metric-status low"
    elements.moistureProgress.className = "progress-fill low"
    showAlert(`Soil moisture is critically low at ${moisture}%. Immediate irrigation recommended.`)
  } else if (moisture < 60) {
    elements.moistureStatus.textContent = "Low - Monitor Closely"
    elements.moistureStatus.className = "metric-status medium"
    elements.moistureProgress.className = "progress-fill medium"
  } else {
    elements.moistureStatus.textContent = "Optimal"
    elements.moistureStatus.className = "metric-status optimal"
    elements.moistureProgress.className = "progress-fill"
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
    elements.climateStatus.className = "climate-status"
  } else {
    elements.climateStatus.textContent = "Monitor Environmental Conditions"
    elements.climateStatus.className = "climate-status medium"
  }
}

function updateWeatherData(data) {
  elements.weatherTemp.textContent = `${data.temperature}°C`
  elements.weatherDesc.textContent = data.weather.description
  elements.feelsLike.textContent = `${data.feels_like}°C`
  elements.windSpeed.textContent = `${data.wind_speed} km/h`
  elements.pressure.textContent = `${data.pressure} hPa`
  elements.weatherUpdated.textContent = formatTime(new Date())

  // Update weather icon based on conditions
  const weatherIcons = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Sunny: "🌞",
    Snow: "❄️",
    Thunderstorm: "⛈️",
  }

  elements.weatherIcon.textContent = weatherIcons[data.weather.main] || "🌤️"
}

function updateSystemStatus() {
  const now = new Date()
  elements.systemUpdated.textContent = formatTime(now)

  // Simulate system status updates
  const statuses = ["Active", "Standby", "Maintenance"]
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

  if (randomStatus === "Active") {
    elements.irrigationStatus.innerHTML = '<span class="status-indicator-small active"></span>Active'
  } else {
    elements.irrigationStatus.innerHTML = `<span class="status-indicator-small"></span>${randomStatus}`
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
    updateCropRecommendations(data) // Add this line
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
  if (confirm("Start manual irrigation? This will run the irrigation system for 10 minutes.")) {
    alert("Manual irrigation started! System will run for 10 minutes.")
    // In real implementation, send API request to start irrigation
    console.log("Manual irrigation started")
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
function initializeDashboard() {
  console.log("Initializing Smart Irrigation Dashboard...")

  // Initial data load
  updateSensorData()
  updateWeather()

  // Set up intervals
  updateIntervals.push(setInterval(updateSensorData, CONFIG.UPDATE_INTERVAL))

  updateIntervals.push(setInterval(updateWeather, CONFIG.WEATHER_UPDATE_INTERVAL))

  // Update connection status
  updateConnectionStatus(true)

  console.log("Dashboard initialized successfully!")
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
