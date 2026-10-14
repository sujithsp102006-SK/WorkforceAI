import sys
import os
import json
import warnings
warnings.filterwarnings('ignore')
import numpy as np
import pandas as pd

def get_risk_level(prob):
    if prob >= 0.70:
        return 'HIGH'
    elif prob >= 0.40:
        return 'MEDIUM'
    return 'LOW'

def derive_contributing_factors(data, prob):
    """
    Identifies notable model-related indicators that elevate attrition risk.
    Clearly designated as correlational/model-related indicators rather than deterministic causality.
    """
    factors = []
    
    # Check overtime
    overtime_val = data.get('overtime')
    is_overtime = overtime_val is True or str(overtime_val).lower() in ['yes', 'true', '1']
    if is_overtime:
        factors.append("Frequent overtime schedule detected (strong indicator of burnout risk)")
        
    # Job satisfaction (1 to 4)
    job_sat = float(data.get('jobSatisfaction', 3))
    if job_sat <= 1:
        factors.append(f"Severely low job satisfaction rating ({int(job_sat)}/4)")
    elif job_sat <= 2:
        factors.append(f"Below-average job satisfaction rating ({int(job_sat)}/4)")
        
    # Work-life balance (1 to 4)
    wlb = float(data.get('workLifeBalance', 3))
    if wlb <= 1:
        factors.append(f"Critical work-life balance strain reported ({int(wlb)}/4)")
    elif wlb <= 2:
        factors.append(f"Challenging work-life balance reported ({int(wlb)}/4)")
        
    # Monthly income relative to experience
    income = float(data.get('monthlyIncome', 5000))
    experience = float(data.get('experience', 3))
    expected_baseline = 3200 + (experience * 380)
    if income < expected_baseline * 0.85:
        factors.append(f"Compensation tier (${int(income):,}/mo) is below industry baseline for {int(experience)} yrs experience")
        
    # Training hours
    training = float(data.get('trainingHours', 20))
    if training < 15:
        factors.append(f"Limited professional upskilling/training hours recorded ({int(training)} hrs/year)")
        
    # Tenure vs satisfaction
    tenure = float(data.get('yearsAtCompany', 2))
    if tenure >= 4 and job_sat <= 2:
        factors.append(f"Prolonged tenure ({int(tenure)} yrs) without marked satisfaction progression")

    # If probability is medium/high but no strict triggers fired, add primary drivers
    if prob >= 0.40 and len(factors) == 0:
        if job_sat < 3:
            factors.append("Sub-optimal job satisfaction sentiment")
        if wlb < 3:
            factors.append("Work-life balance boundary pressures")
        if is_overtime:
            factors.append("Overtime workload demands")
            
    if len(factors) == 0:
        factors.append("Stable tenure and positive engagement metrics indicate strong retention likelihood")
        
    return factors

def run_prediction(payload):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(current_dir, 'model')
    model_path = os.path.join(model_dir, 'attrition_model.pkl')
    scaler_path = os.path.join(model_dir, 'scaler.pkl')
    
    # Feature extraction
    age = float(payload.get('age', 30))
    exp = float(payload.get('experience', 4))
    tenure = float(payload.get('yearsAtCompany', 2))
    income = float(payload.get('monthlyIncome', 5500))
    sat = float(payload.get('jobSatisfaction', 3))
    wlb = float(payload.get('workLifeBalance', 3))
    perf = float(payload.get('performanceRating', 3))
    training = float(payload.get('trainingHours', 24))
    
    overtime_val = payload.get('overtime')
    overtime_num = 1 if (overtime_val is True or str(overtime_val).lower() in ['yes', 'true', '1']) else 0
    
    feature_names = ['age', 'experience', 'yearsAtCompany', 'monthlyIncome', 'jobSatisfaction', 'workLifeBalance', 'performanceRating', 'trainingHours', 'overtime']
    input_df = pd.DataFrame([[age, exp, tenure, income, sat, wlb, perf, training, overtime_num]], columns=feature_names)
    
    prob = 0.25 # baseline fallback
    model_used = "Scikit-Learn RandomForestClassifier"
    
    # Try loading trained scikit-learn model
    if os.path.exists(model_path) and os.path.exists(scaler_path):
        try:
            import joblib
            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            scaled_vec = scaler.transform(input_df)
            prob_arr = model.predict_proba(scaled_vec)
            prob = float(prob_arr[0][1])
        except Exception as e:
            # Fallback heuristic calculation if pickle fails
            model_used = f"Fallback Calibrated Heuristic ({str(e)})"
            prob = heuristic_prob(age, exp, tenure, income, sat, wlb, perf, training, overtime_num)
    else:
        # Calibrated formula if model file not yet compiled
        model_used = "Rule-Calibrated Inference Engine"
        prob = heuristic_prob(age, exp, tenure, income, sat, wlb, perf, training, overtime_num)
        
    prob = float(np.clip(prob, 0.02, 0.98))
    prob = round(prob, 2)
    risk_level = get_risk_level(prob)
    factors = derive_contributing_factors(payload, prob)
    
    return {
        "status": "success",
        "risk": risk_level,
        "probability": prob,
        "factors": factors,
        "modelUsed": model_used,
        "inputEcho": {
            "age": age,
            "experience": exp,
            "yearsAtCompany": tenure,
            "monthlyIncome": income,
            "jobSatisfaction": sat,
            "workLifeBalance": wlb,
            "performanceRating": perf,
            "trainingHours": training,
            "overtime": bool(overtime_num)
        }
    }

def heuristic_prob(age, exp, tenure, income, sat, wlb, perf, training, overtime_num):
    # Logit approximation consistent with training model
    logit = (
        -1.25
        + (overtime_num * 1.4)
        - ((sat - 1) * 0.58)
        - ((wlb - 1) * 0.48)
        - (training / 35.0 * 0.35)
        - ((income / 10000.0) * 0.5)
        + (1.0 if tenure > 4 and sat <= 2 else 0.0)
        - (0.3 if perf >= 4 else 0.0)
    )
    p = 1.0 / (1.0 + np.exp(-logit))
    return float(p)

def main():
    try:
        input_data = None
        if len(sys.argv) > 1 and sys.argv[1].strip():
            raw_arg = sys.argv[1].strip()
            if os.path.exists(raw_arg):
                with open(raw_arg, 'r') as f:
                    input_data = json.load(f)
            else:
                input_data = json.loads(raw_arg)
        else:
            # Read from stdin
            stdin_content = sys.stdin.read().strip()
            if stdin_content:
                input_data = json.loads(stdin_content)
            else:
                # Default sample
                input_data = {
                    "age": 32,
                    "experience": 6,
                    "yearsAtCompany": 4,
                    "monthlyIncome": 4800,
                    "jobSatisfaction": 1,
                    "workLifeBalance": 1,
                    "performanceRating": 3,
                    "trainingHours": 10,
                    "overtime": "Yes"
                }
                
        result = run_prediction(input_data)
        print(json.dumps(result, indent=2))
    except Exception as err:
        err_response = {
            "status": "error",
            "message": str(err),
            "risk": "MEDIUM",
            "probability": 0.50,
            "factors": ["Prediction pipeline encountered an error; default fallback score assigned."]
        }
        print(json.dumps(err_response))

if __name__ == '__main__':
    main()
