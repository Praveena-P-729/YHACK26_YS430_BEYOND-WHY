import pandas as pd

# Load dataset
file_path = "../GLIF dataset.csv"

df = pd.read_csv(file_path, low_memory=False)

print("Original dataset shape:", df.shape)

# Remove unnecessary / leakage columns
remove_columns = [
    "row",
    "id",
    "date",
    "country",
    "location",
    "fatalities",
    "injuries",
    "trigger",
    "severity",
    "type",
    "type.1",
    "lat",
    "lon"
]

df = df.drop(columns=remove_columns, errors="ignore")

print("\nAfter removing unnecessary columns:")
print(df.shape)

# Separate features and target
X = df.drop(columns=["landslide"])
y = df["landslide"]

print("\nFeature shape:", X.shape)
print("Target shape:", y.shape)

# Categorical features
categorical_columns = X.select_dtypes(
    include=["object", "string"]
).columns.tolist()

print("\nCategorical features:")
print(categorical_columns)

# Numerical features
numerical_columns = X.select_dtypes(
    include=["int64", "float64"]
).columns.tolist()

print("\nNumber of numerical features:")
print(len(numerical_columns))

# Target distribution
print("\nTarget distribution:")
print(y.value_counts())

# Save clean dataset
output_file = "clean_landslide_dataset.csv"

df.to_csv(output_file, index=False)

print("\nClean dataset saved successfully:")
print(output_file)

print("\nFinal dataset shape:")
print(df.shape)