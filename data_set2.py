import pandas as pd
import numpy as np
from sklearn.utils import resample

np.random.seed(42)


# LOAD DATASETS


irrigation_df = pd.read_csv("updated_dataset_without_crop.csv")
crop_df = pd.read_csv("crop_dataset.csv")


# FUNCTION FOR REALISTIC AUGMENTATION


def augment_numeric_column(series, noise_percent=0.05):
    """
    Add gaussian noise proportional to feature std deviation
    """
    std = series.std()
    noise = np.random.normal(0, std * noise_percent, size=len(series))
    return series + noise



# IRRIGATION DATASET AUGMENTATION


TARGET_IRRIGATION_SIZE = 50000

# Resample existing data
irrigation_aug = resample(
    irrigation_df,
    replace=True,
    n_samples=TARGET_IRRIGATION_SIZE,
    random_state=42
).reset_index(drop=True)

# Add realistic sensor noise
irrigation_aug["temperature"] = augment_numeric_column(
    irrigation_aug["temperature"], 0.08
)

irrigation_aug["humidity"] = augment_numeric_column(
    irrigation_aug["humidity"], 0.10
)

irrigation_aug["soil_moisture"] = augment_numeric_column(
    irrigation_aug["soil_moisture"], 0.12
)

# Clip realistic ranges
irrigation_aug["temperature"] = irrigation_aug["temperature"].clip(10, 50)
irrigation_aug["humidity"] = irrigation_aug["humidity"].clip(10, 100)
irrigation_aug["soil_moisture"] = irrigation_aug["soil_moisture"].clip(0, 100)

# Introduce small label uncertainty (2%)
flip_indices = np.random.choice(
    irrigation_aug.index,
    size=int(0.02 * len(irrigation_aug)),
    replace=False
)

irrigation_aug.loc[flip_indices, "pump_on"] = (
    1 - irrigation_aug.loc[flip_indices, "pump_on"]
)

# Save dataset
irrigation_aug.to_csv(
    "augmented_irrigation_dataset.csv",
    index=False
)

print("Augmented irrigation dataset created.")



# CROP DATASET AUGMENTATION


TARGET_CROP_SIZE = 50000

crop_aug = resample(
    crop_df,
    replace=True,
    n_samples=TARGET_CROP_SIZE,
    random_state=42
).reset_index(drop=True)

# Add realistic agricultural variability
crop_aug["temperature"] = augment_numeric_column(
    crop_aug["temperature"], 0.08
)

crop_aug["humidity"] = augment_numeric_column(
    crop_aug["humidity"], 0.10
)

crop_aug["soil_moisture"] = augment_numeric_column(
    crop_aug["soil_moisture"], 0.12
)

crop_aug["nitrogen"] = augment_numeric_column(
    crop_aug["nitrogen"], 0.15
)

crop_aug["phosphorus"] = augment_numeric_column(
    crop_aug["phosphorus"], 0.15
)

crop_aug["potassium"] = augment_numeric_column(
    crop_aug["potassium"], 0.15
)

crop_aug["soil_pH"] = augment_numeric_column(
    crop_aug["soil_pH"], 0.04
)

# Clip realistic agricultural ranges
crop_aug["temperature"] = crop_aug["temperature"].clip(10, 50)
crop_aug["humidity"] = crop_aug["humidity"].clip(10, 100)
crop_aug["soil_moisture"] = crop_aug["soil_moisture"].clip(0, 100)

crop_aug["nitrogen"] = crop_aug["nitrogen"].clip(0, 200)
crop_aug["phosphorus"] = crop_aug["phosphorus"].clip(0, 200)
crop_aug["potassium"] = crop_aug["potassium"].clip(0, 300)

crop_aug["soil_pH"] = crop_aug["soil_pH"].clip(4.5, 9)

# Introduce slight crop overlap confusion (1.5%)
crop_labels = crop_aug["crop"].unique()

noise_idx = np.random.choice(
    crop_aug.index,
    size=int(0.015 * len(crop_aug)),
    replace=False
)

for idx in noise_idx:
    current_crop = crop_aug.loc[idx, "crop"]
    other_crops = [c for c in crop_labels if c != current_crop]
    crop_aug.loc[idx, "crop"] = np.random.choice(other_crops)

# Save dataset
crop_aug.to_csv(
    "augmented_crop_dataset.csv",
    index=False
)

print("Augmented crop dataset created.")

print("\nDONE")