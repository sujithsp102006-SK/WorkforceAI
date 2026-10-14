# Enterprise Workforce Predictive Analytics Engine for Talent Retention Forecasting and Automated Skill-Mapping

An AI-powered, full-stack workforce analytics platform built for enterprise HR and talent management teams. The application delivers end-to-end personnel record management, explainable machine-learning attrition risk predictions, rule-based automated skill-gap mapping, and external career upskilling recommendations powered by SerpApi.

---

## 1. Project Overview

Voluntary employee turnover imposes substantial direct replacement costs and institutional knowledge loss on enterprises. Traditional HR tools are reactive, logging resignations after the fact rather than preempting them. 

The **Enterprise Workforce Predictive Analytics Engine** solves this challenge by fusing:
1. **Predictive Machine Learning**: Assessing attrition probabilities using scikit-learn models calibrated against multi-dimensional workforce indicators (compensation, tenure, overtime burnout, work-life balance, job satisfaction).
2. **Rule-Based Skill Mapping**: Dynamically benchmarking an employee's existing competencies against standardized enterprise role definitions to identify precise skill gaps.
3. **Live Opportunity & Course Integration**: Querying Google Jobs, Coursera, edX, and accredited certification directories via **SerpApi** to formulate actionable learning curricula and career pathways.

---

## 2. Problem Statement

* **Talent Attrition Blindspots**: HR leaders often lack quantitative visibility into early flight-risk indicators prior to an employee submitting a two-week notice.
* **Disconnected Upskilling**: Training budgets are frequently spent on generic seminars rather than addressing specific competency deficits tied to realistic internal career mobility.
* **Manual Market Discovery**: Finding relevant open roles, external credential standards, and accredited training programs requires tedious cross-referencing across separate web portals.

---

## 3. Core Features

* **Real-time Analytics Dashboard**:
  * Headcount metrics, High / Medium / Low retention risk distributions, and department breakdowns.
  * Recent high-risk personnel registry with direct jump links to employee dossiers.
  * Aggregate company health indicators (average tenure, satisfaction ratings, total identified skill gaps).
* **Employee Management (CRUD)**:
  * Full roster view with instantaneous search (name, ID, role, department) and multi-factor filters.
  * Modal-driven employee creation and editing.
  * Automatic ML risk scoring upon creating or modifying employee records.
  * Safe record deletion with confirmation dialog.
* **Employee Intelligence Dossier (Details)**:
  * Comprehensive individual profile with compensation benchmarks, satisfaction indices, and tenure history.
  * ML Attrition Assessment box with confidence probability meter and explainable contributing indicators.
  * Current skills vs. Target Role requirements breakdown.
* **AI Attrition Risk Simulator**:
  * Interactive parameter adjustments (Age, Experience, Tenure, Monthly Income, Satisfaction 1-4, Work-Life Balance 1-4, Overtime, Performance, Training).
  * One-click pre-fill from any active employee in the database to test hypothetical counter-factuals.
  * Real-time Scikit-Learn inference returning risk categorization (HIGH / MEDIUM / LOW), exact probability, and contributing indicators.
* **Automated Skill Mapping Engine**:
  * Visual 5-step workflow pipeline: `Current Skills` → `Target Job Role` → `Required Skills` → `Skill Gap` → `Recommended Learning`.
  * Quantified percentage match and prioritization badges (High vs Medium Priority).
  * Direct action link to live SerpApi recommendations.
* **External Career & Upskilling Recommendations (SerpApi)**:
  * Live Google Jobs search for openings matching the employee's target role.
  * Targeted course recommendations across Coursera, edX, and Udemy for identified missing skills.
  * Professional industry credential search tailored to the target role.
  * Custom live query search bar for on-the-fly exploration with graceful curated fallback if an API key is not configured.

---

## 4. System Architecture

```text
                                  ┌──────────────────────────────┐
                                  │   React 18 + Vite Frontend   │
                                  │  (Tailwind CSS, Dashboard UI)│
                                  └──────────────┬───────────────┘
                                                 │ HTTP / REST
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │    Node.js / Express Server  │
                                  │   (Port 5000 / Proxy 5173)   │
                                  └──┬───────────┬────────────┬──┘
                                     │           │            │
            ┌────────────────────────┘           │            └─────────────────────────┐
            ▼                                    ▼                                      ▼
┌────────────────────────┐          ┌─────────────────────────┐           ┌───────────────────────────┐
│     Database Layer     │          │    ML Inference Engine  │           │    External Search API    │
│  - MongoDB / Mongoose  │          │  - Python 3.13          │           │  - SerpApi Google Engine  │
│  - Fallback JSON Store │          │  - Scikit-Learn RF Clf  │           │  - Live Jobs / Courses    │
└────────────────────────┘          │  - Predict / Train CLI  │           │  - Curated Fallback Feed  │
                                    └─────────────────────────┘           └───────────────────────────┘
```

---

## 5. Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ESM), Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, REST APIs, Mongoose, Axios, Morgan, Dotenv |
| **Database** | MongoDB with Mongoose ODM (includes automatic zero-downtime file store fallback) |
| **Machine Learning** | Python 3, scikit-learn, pandas, numpy, joblib (Random Forest & Logistic Regression) |
| **External API** | SerpApi (Google Search & Google Jobs engines) |

---

## 6. Folder Structure

```text
workforce-analytics/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   ├── EmployeeModal.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── EmployeeDetails.jsx
│   │   │   ├── AttritionPrediction.jsx
│   │   │   ├── SkillMapping.jsx
│   │   │   └── Recommendations.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── employeeController.js
│   │   ├── predictController.js
│   │   ├── skillController.js
│   │   ├── recommendationController.js
│   │   └── dashboardController.js
│   ├── data/
│   │   ├── rolesCatalog.js
│   │   ├── seedData.js
│   │   ├── employeeRepo.js
│   │   └── seed.js
│   ├── models/
│   │   └── Employee.js
│   ├── routes/
│   │   ├── employeeRoutes.js
│   │   ├── predictRoutes.js
│   │   ├── skillRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   ├── mlService.js
│   │   ├── skillEngine.js
│   │   └── serpApiService.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── ml/
│   ├── train.py
│   ├── predict.py
│   ├── requirements.txt
│   ├── sample_input.json
│   ├── sample_output.json
│   └── model/
│       ├── attrition_model.pkl
│       ├── scaler.pkl
│       └── metadata.json
│
├── README.md
└── .env.example
```

---

## 7. Environment Variables

Create a `.env` file in `backend/` (or copy `.env.example`):

```bash
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas or Local)
# If local MongoDB is unavailable, backend automatically falls back to persistent JSON storage
MONGODB_URI=mongodb://127.0.0.1:27017/workforce_analytics

# SerpApi External API Key for live job, course, and certification queries
# Obtain key at: https://serpapi.com/
SERPAPI_KEY=your_serpapi_key_here

# Frontend Client URL
CLIENT_URL=http://localhost:5173
```

---

## 8. Installation & Setup

### 8.1 Prerequisites
* Node.js (v18 or v20+)
* Python (3.10, 3.11, 3.12, or 3.13)
* Git

### 8.2 Machine Learning Setup
Install Python dependencies and generate the trained model artifacts:

```bash
cd ml
pip install -r requirements.txt
python train.py
cd ..
```

To test inference via CLI:
```bash
python ml/predict.py ml/sample_input.json
```

### 8.3 Backend Setup
Install Node dependencies and launch server:

```bash
cd backend
npm install
npm run seed     # Seeds 16 realistic employee profiles across 6 departments
npm run dev      # Starts API server at http://localhost:5000
```

### 8.4 Frontend Setup
Install frontend packages and run Vite development server:

```bash
cd frontend
npm install
npm run dev      # Starts React client at http://localhost:5173
```

---

## 9. How SerpApi is Used

SerpApi provides programmatic access to search engines. The engine queries SerpApi when generating employee mobility paths:
1. **Target Role Job Discovery**: Calls `engine=google_jobs` with the query `${targetRole} jobs hiring remote or on-site` to extract live job listings, salaries, company names, locations, and direct apply URLs.
2. **Missing Skill Upskilling**: Calls `engine=google` with `best ${missingSkill} certification course online coursera edx udemy` to surface accredited courses from top providers.
3. **Professional Credentials**: Searches for industry-recognized accreditation bodies for the target role.

> **Resilient Fallback Mode**: If `SERPAPI_KEY` is not provided or API quota is exceeded, the service returns curated fallback data, ensuring the application remains 100% demoable during hackathon presentations.

---

## 10. API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and SerpApi connectivity check |
| `GET` | `/api/dashboard/stats` | Workforce KPI aggregates, risk splits, and department counts |
| `GET` | `/api/employees` | List employees with optional query params `?q=`, `?department=`, `?riskLevel=` |
| `GET` | `/api/employees/:id` | Retrieve single employee by MongoDB `_id` or `employeeId` |
| `POST` | `/api/employees` | Create new employee (runs automatic ML attrition scoring) |
| `PUT` | `/api/employees/:id` | Update employee attributes (re-calculates ML attrition score) |
| `DELETE`| `/api/employees/:id` | Delete employee record |
| `POST` | `/api/predict` | Run standalone ML attrition simulation on payload variables |
| `GET` | `/api/skills/:employeeId` | Compute competency alignment, matched skills, and missing gaps |
| `POST` | `/api/skills/recommend` | Custom rule-based skill gap analysis for `{ currentSkills, targetRole }` |
| `GET` | `/api/skills/roles/catalog` | Get list of all standardized enterprise benchmark roles |
| `GET` | `/api/recommendations/:employeeId` | Fetch jobs, courses, and certifications via SerpApi |
| `POST` | `/api/recommendations/search` | Live custom SerpApi query search |

---

## 11. Model Interpretability & Risk Thresholds

Prediction probabilities are mapped to discrete risk categories according to application benchmarks:
* **`0.00 - 0.39` → LOW RISK**: High retention stability, favorable satisfaction indices.
* **`0.40 - 0.69` → MEDIUM RISK**: Moderate retention concerns, emerging work-life balance strain.
* **`0.70 - 1.00` → HIGH RISK**: Acute attrition indicator, typically marked by frequent overtime workload combined with sub-benchmark compensation or low satisfaction.

Contributing factors are presented as **model-related indicators** based on feature importance and statistical deviations rather than deterministic causal claims.

---

## 12. End-to-End Demo Flow for Evaluators

1. **Dashboard Overview**: Start on the Dashboard to view headcount (16 seeded employees), risk distribution bars, department breakdown, and recent high-risk employees.
2. **Inspect Employee Dossier**: Click "Inspect Dossier" on **Sarah Chen (EMP-1001)** to view her high attrition risk (84%), overtime burnout indicator, and skill gaps for *Full Stack Developer*.
3. **Simulate Retention Intervention**: Click "Simulate in ML Engine" to transfer Sarah's data into the Attrition Predictor. Change **Overtime** from `Yes` to `No` and increase **Job Satisfaction** from `1` to `3`. Re-run prediction to watch the probability drop from 84% down to ~25% (Low Risk).
4. **Automated Skill Mapping**: Open the Skill Mapping tab to inspect the 5-step visual pipeline (`Current Skills` → `Target Role` → `Required Skills` → `Skill Gap` → `Recommended Learning`). Select *Data Analyst* and observe missing skills like *Power BI* and *Statistics*.
5. **SerpApi Live Recommendations**: Click "Find SerpApi Live Courses & Jobs" to load real jobs, certification links, and courses for the employee's target role. Run a live custom query using the search bar.
6. **Add / Edit Employee**: Open the Employee Directory, click "Add Employee", enter a new employee profile, and observe instant ML risk indexing upon submission.
