import pandas as pd

# Load dataset
file_path = "../GLIF dataset.csv"
df = pd.read_csv(file_path, low_memory=False)

print("Original shape:", df.shape)

# -----------------------------------------
# 1. Remove columns that should NOT be used
# -----------------------------------------

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
    "type"
]

df = df.drop(columns=remove_columns, errors="ignore")

# -----------------------------------------
# 2. Check remaining columns
# -----------------------------------------

print("\nRemaining columns:")
print(df.columns.tolist())

# -----------------------------------------
# 3. Check categorical columns
# -----------------------------------------

print("\nCategorical columns:")
print(df.select_dtypes(include=["object", "string"]).columns.tolist())

# -----------------------------------------
# 4. Check lithology values
# -----------------------------------------

if "lithology" in df.columns:
    print("\nLithology values:")
    print(df["lithology"].value_counts())

# -----------------------------------------
# 5. Check target
# -----------------------------------------

print("\nTarget distribution:")
print(df["landslide"].value_counts())

# -----------------------------------------
# 6. Check missing values
# -----------------------------------------

print("\nMissing values:")
print(df.isnull().sum().sum())

print("\nFinal shape:")
print(df.shape)