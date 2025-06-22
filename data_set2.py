import numpy as np
import pandas as pd

# Samples per crop (approximate prevalence)
crop_counts = {'rice': 4500, 'maize': 3750, 'potato': 3000, 'cotton': 2250, 'sugarcane': 1500}

# Define (mean, std, min, max) for each feature by crop
params = {
    'rice': {'temp': (30, 2, 25, 35),
             'humidity': (85, 5, 0, 100),
             'moisture': (80, 5, 0, 100),
             'nitrogen': (50, 10, 0, 80),
             'phosphorus': (20, 5, 0, 30),
             'potassium': (200, 20, 0, 250),
             'pH': (6.0, 0.3, 5.5, 7.0)},
    'maize': {'temp': (28, 3, 20, 35),
              'humidity': (70, 5, 0, 100),
              'moisture': (55, 5, 0, 100),
              'nitrogen': (30, 5, 0, 50),
              'phosphorus': (15, 3, 0, 25),
              'potassium': (150, 20, 0, 200),
              'pH': (6.8, 0.3, 6.0, 7.5)},
    'potato': {'temp': (18, 3, 10, 25),
               'humidity': (75, 5, 0, 100),
               'moisture': (65, 5, 0, 100),
               'nitrogen': (25, 5, 0, 35),
               'phosphorus': (10, 2, 0, 15),
               'potassium': (120, 15, 0, 150),
               'pH': (6.0, 0.3, 5.5, 7.0)},
    'cotton': {'temp': (26, 3, 18, 35),
               'humidity': (60, 5, 0, 100),
               'moisture': (35, 5, 0, 100),
               'nitrogen': (20, 3, 0, 30),
               'phosphorus': (8, 2, 0, 15),
               'potassium': (160, 20, 0, 200),
               'pH': (6.3, 0.2, 6.0, 6.5)},
    'sugarcane': {'temp': (32, 3, 25, 40),
                  'humidity': (65, 5, 0, 100),
                  'moisture': (75, 5, 0, 100),
                  'nitrogen': (60, 10, 0, 80),
                  'phosphorus': (8, 2, 0, 15),
                  'potassium': (220, 20, 0, 300),
                  'pH': (6.2, 0.2, 6.0, 6.5)}
}

# Generate synthetic data
records = []
for crop, n in crop_counts.items():
    p = params[crop]
    temp = np.random.normal(p['temp'][0], p['temp'][1], n)
    humidity = np.random.normal(p['humidity'][0], p['humidity'][1], n)
    moisture = np.random.normal(p['moisture'][0], p['moisture'][1], n)
    nitrogen = np.random.normal(p['nitrogen'][0], p['nitrogen'][1], n)
    phosphorus = np.random.normal(p['phosphorus'][0], p['phosphorus'][1], n)
    potassium = np.random.normal(p['potassium'][0], p['potassium'][1], n)
    ph = np.random.normal(p['pH'][0], p['pH'][1], n)
    # Clip each feature to [min,max]
    temp = np.clip(temp, p['temp'][2], p['temp'][3])
    humidity = np.clip(humidity, p['humidity'][2], p['humidity'][3])
    moisture = np.clip(moisture, p['moisture'][2], p['moisture'][3])
    nitrogen = np.clip(nitrogen, p['nitrogen'][2], p['nitrogen'][3])
    phosphorus = np.clip(phosphorus, p['phosphorus'][2], p['phosphorus'][3])
    potassium = np.clip(potassium, p['potassium'][2], p['potassium'][3])
    ph = np.clip(ph, p['pH'][2], p['pH'][3])
    # Record each sample with label
    for i in range(n):
        records.append({
            'temperature': temp[i],
            'humidity': humidity[i],
            'soil_moisture': moisture[i],
            'nitrogen': nitrogen[i],
            'phosphorus': phosphorus[i],
            'potassium': potassium[i],
            'soil_pH': ph[i],
            'crop': crop
        })

# Create DataFrame, shuffle and save to CSV
df = pd.DataFrame(records)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df.to_csv('crop_dataset.csv', index=False)
