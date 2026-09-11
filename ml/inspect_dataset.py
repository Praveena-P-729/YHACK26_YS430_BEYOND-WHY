import pandas as pd

file_path = "../GLIF dataset.csv"

print("Loading dataset...")

df = pd.read_csv(file_path)

print("\n========== DATASET SHAPE ==========")
print(df.shape)

print("\n========== FIRST 5 ROWS ==========")
print(df.head())

print("\n========== COLUMN NAMES ==========")
for i, column in enumerate(df.columns):
    print(f"{i}: {column}")

print("\n========== DATA TYPES ==========")
print(df.dtypes)

print("\n========== MISSING VALUES ==========")
print(df.isnull().sum())

print("\n========== DUPLICATE ROWS ==========")
print(df.duplicated().sum())

print("\n========== TARGET CANDIDATE ==========")
if "landslide" in df.columns:
    print(df["landslide"].value_counts())
else:
    print("'landslide' column was not found.")