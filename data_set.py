import numpy as np
import pandas as pd

# Number of samples
n_rows = 5500
np.random.seed(42)

# List of crops
crops = ["Wheat", "Maize", "Corn", "Sugarcane", "Cotton", "Rice", "Sunflower", 
         "Tomato", "Potato", "Soybean", "Barley", "Lettuce", "Carrot", 
         "Onion", "Cabbage", "Spinach", "Peas", "Beans"]

# Moisture thresholds (%), derived from crop MAD values:contentReference[oaicite:20]{index=20} 
thresholds = {
    "Lettuce": 25, "Onion": 25, "Carrot": 25, "Tomato": 25,
    "Cabbage": 25, "Spinach": 25, "Peas": 25, "Beans": 25,
    "Wheat": 22, "Barley": 22, "Maize": 22, "Corn": 22,
    "Sunflower": 22, "Soybean": 22,
    "Cotton": 18, "Potato": 18,
    "Rice": 30, "Sugarcane": 30
}

data = []
for _ in range(n_rows):
    crop = np.random.choice(crops)
    # Simulate soil moisture (%) as Normal(~25,10), clipped to [5,45]
    moisture = np.random.normal(25, 10)
    moisture = float(np.clip(moisture, 5, 45))
    # Soil nitrogen (ppm) ~ Normal(20,10), min 0
    nitrogen = np.random.normal(20, 10)
    nitrogen = float(max(nitrogen, 0))
    # Soil phosphorus (ppm) ~ Normal(20,5), min 0
    phosphorus = np.random.normal(20, 5)
    phosphorus = float(max(phosphorus, 0))
    # Soil potassium (ppm) ~ Normal(300,100), clipped [50,800]
    potassium = np.random.normal(300, 100)
    potassium = float(np.clip(potassium, 50, 800))
    # Ambient temperature (°C) ~ Normal(25,8), clipped [-5,50]
    temperature = np.random.normal(25, 8)
    temperature = float(np.clip(temperature, -5, 50))
    # Relative humidity (%) ~ Uniform(20, 90)
    humidity = float(np.random.uniform(20, 90))
    # Determine irrigation label
    thresh = thresholds[crop]
    irrigation = 1 if moisture < thresh else 0

    # Append rounded values
    data.append({
        "SoilMoisture": round(moisture, 1),
        "Nitrogen": round(nitrogen, 1),
        "Phosphorus": round(phosphorus, 1),
        "Potassium": round(potassium, 1),
        "Temperature": round(temperature, 1),
        "Humidity": round(humidity, 1),
        "Crop": crop,
        "Irrigation": irrigation
    })

df = pd.DataFrame(data)
df.to_csv("synthetic_crop_data.csv", index=False)
