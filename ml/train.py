import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score
import joblib

def generate_synthetic_workforce_data(n_samples=2500, random_state=42):
    """
    Generates synthetic employee attrition dataset reflecting real-world HR patterns.
    Key attrition drivers:
    - High overtime + low work-life balance
    - Low job satisfaction + low performance rating
    - Stagnant tenure (high years without promotion/training)
    - Low monthly income relative to age/experience
    """
    np.random.seed(random_state)
    
    departments = ['Engineering', 'Data & AI', 'Sales & Marketing', 'Human Resources', 'Product & Design', 'Finance']
    job_roles = [
        'Software Engineer', 'Senior Developer', 'Data Analyst', 'Data Scientist',
        'Sales Executive', 'HR Specialist', 'Product Manager', 'UX Designer', 'Financial Analyst'
    ]
    
    ages = np.random.randint(22, 60, size=n_samples)
    experience = np.maximum(0, ages - 22 + np.random.randint(-2, 3, size=n_samples))
    years_at_company = np.array([np.random.randint(0, min(exp + 1, 20)) for exp in experience])
    
    # Monthly income correlated with experience + role
    base_salaries = 3000 + experience * 400 + np.random.normal(0, 800, size=n_samples)
    monthly_incomes = np.clip(base_salaries, 2500, 20000).astype(int)
    
    job_satisfaction = np.random.randint(1, 5, size=n_samples)  # 1 to 4
    work_life_balance = np.random.randint(1, 5, size=n_samples) # 1 to 4
    performance_rating = np.random.choice([2, 3, 4, 5], p=[0.1, 0.5, 0.3, 0.1], size=n_samples)
    training_hours = np.random.randint(5, 60, size=n_samples)
    overtime = np.random.choice([0, 1], p=[0.68, 0.32], size=n_samples)
    
    dept_choices = np.random.choice(departments, size=n_samples)
    role_choices = np.random.choice(job_roles, size=n_samples)
    
    # Calculate attrition probability score (Ground truth underlying risk)
    # High risk if overtime=1, low satisfaction, low WLB, low pay for exp, low training
    logits = (
        -1.2
        + (overtime * 1.35)
        - ((job_satisfaction - 1) * 0.55)
        - ((work_life_balance - 1) * 0.45)
        - (training_hours / 35.0 * 0.35)
        - ((monthly_incomes / 10000.0) * 0.5)
        + ((years_at_company > 4).astype(int) * (job_satisfaction <= 2).astype(int) * 0.6)
        - ((performance_rating >= 4).astype(int) * 0.25)
    )
    
    probs = 1.0 / (1.0 + np.exp(-logits))
    attrition = (np.random.rand(n_samples) < probs).astype(int)
    
    df = pd.DataFrame({
        'age': ages,
        'experience': experience,
        'yearsAtCompany': years_at_company,
        'monthlyIncome': monthly_incomes,
        'jobSatisfaction': job_satisfaction,
        'workLifeBalance': work_life_balance,
        'performanceRating': performance_rating,
        'trainingHours': training_hours,
        'overtime': overtime,
        'department': dept_choices,
        'jobRole': role_choices,
        'attrition': attrition
    })
    
    return df

def train_and_save():
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    os.makedirs(model_dir, exist_ok=True)
    
    print("[1/4] Generating realistic synthetic workforce dataset...")
    df = generate_synthetic_workforce_data(n_samples=3000, random_state=42)
    
    # Numerical and categorical features
    numeric_features = [
        'age', 'experience', 'yearsAtCompany', 'monthlyIncome',
        'jobSatisfaction', 'workLifeBalance', 'performanceRating',
        'trainingHours', 'overtime'
    ]
    
    X = df[numeric_features].copy()
    y = df['attrition']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("[2/4] Fitting feature scaler and Random Forest + Logistic Regression...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # We train a calibrated Random Forest Classifier
    rf_clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=6,
        min_samples_split=8,
        random_state=42,
        class_weight='balanced'
    )
    rf_clf.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = rf_clf.predict(X_test_scaled)
    y_prob = rf_clf.predict_proba(X_test_scaled)[:, 1]
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    
    print(f"[3/4] Model Evaluation:")
    print(f"      Accuracy: {acc:.4f}")
    print(f"      ROC-AUC:  {auc:.4f}")
    print(classification_report(y_test, y_pred, target_names=['Retain (0)', 'Attrition (1)']))
    
    # Feature importances
    feature_importance_dict = dict(zip(numeric_features, [float(v) for v in rf_clf.feature_importances_]))
    print(f"      Feature Importances: {feature_importance_dict}")
    
    # Baseline stats for factor explainability
    means = df[numeric_features].mean().to_dict()
    
    metadata = {
        'numeric_features': numeric_features,
        'feature_importances': feature_importance_dict,
        'feature_means': means,
        'thresholds': {
            'low': [0.0, 0.39],
            'medium': [0.40, 0.69],
            'high': [0.70, 1.00]
        },
        'accuracy': float(acc),
        'roc_auc': float(auc)
    }
    
    # Save artifacts
    model_path = os.path.join(model_dir, 'attrition_model.pkl')
    scaler_path = os.path.join(model_dir, 'scaler.pkl')
    metadata_path = os.path.join(model_dir, 'metadata.json')
    
    joblib.dump(rf_clf, model_path)
    joblib.dump(scaler, scaler_path)
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"[4/4] Successfully saved model artifacts to {model_dir}")
    print("      - attrition_model.pkl")
    print("      - scaler.pkl")
    print("      - metadata.json")

if __name__ == '__main__':
    train_and_save()
