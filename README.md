# 🌍 Terrasense — Carbon Footprint Platform

[![GCP Deployed](https://img.shields.io/badge/Google_Cloud_Run-Deployed-10b981?logo=googlecloud&logoColor=white)](https://terrasense-mquwiikjcq-uc.a.run.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Language: JS](https://img.shields.io/badge/Language-ES6_JavaScript-blue.svg?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Server: Nginx](https://img.shields.io/badge/Server-Nginx_Alpine-purple?logo=nginx)](https://nginx.org)

**Terrasense** is a premium, high-fidelity web application built to allow individuals to track, calculate, and systematically offset their daily environmental footprint. Designed with glassmorphic aesthetics, fluid animations, and real-time interactive dashboards, Terrasense couples IoT utility simulators with AI-driven natural language activity logging.

---

## 🚀 Key Features

*   **Wizard Carbon Calculator**: A 4-step questionnaire (Transport, Utility Energy, Diet, Shopping) estimating baseline carbon outputs.
*   **Live Dashboard**: High-fidelity gauge analytics comparing user metrics to national averages and Paris Agreement targets. Includes streak trackers and badges.
*   **AI Natural Language Logger**: Submit logs in plain English (e.g. *"I commuted 10 km by train and had a vegan lunch"*) to dynamically compute offsets.
*   **TerraAI Chatbot Assistant**: Embedded context-aware conversational advisor using local emissions to provide custom conservation tips.
*   **Smart Nest/IoT Grid Simulator**: Circular smart thermostat dial showing live renewable/fossil grid intensity stats to schedule energy usage.
*   **Gold Standard Offset Marketplace**: Project registry, animated checkout simulation, and generated/printable Carbon Offset Certificates.
*   **Pro Eco Auditing**: Evaluates metrics to compile detailed printable sustainability report cards with carbon letter grades (A-F).
*   **Dynamic Analytics**: Visual doughnuts and weekly reduction trends powered by Chart.js.

---

## 📊 System Architecture

```mermaid
graph TD
    User([User]) -->|Interacts| UI[HTML5/CSS3 Interface]
    UI -->|Navigates tabs| Router[app.js Router]
    
    Router -->|Renders view| Views[View Modules]
    Views --> Dashboard[dashboard.js]
    Views --> Calculator[calculator.js]
    Views --> Tracker[tracker.js]
    Views --> Planner[planner.js]
    Views --> Marketplace[marketplace.js]
    Views --> IoTGrid[iotGrid.js]
    Views --> Analytics[analytics.js]
    
    Tracker -->|Natural Language Input| AINLP[aiNlp.js Parser]
    AINLP -->|Extract Actions| State[app.js State Manager]
    
    Dashboard -->|Profile Data| AICoach[aiCoach.js Advisor]
    AICoach -->|Guides & Tips| UI
    
    IoTGrid -->|Set Eco-Temp| Thermostat[Nest Dial]
    Thermostat -->|Daily Energy Savings| State
    
    Marketplace -->|Support Credits| Checkout[Checkout Simulation]
    Checkout -->|Order Serial ID| Cert[Offset Certificate]
    
    Analytics -->|Visual Reports| ChartJS[Chart.js Canvas]
    
    State -->|Read/Write| LocalStorage[(Browser LocalStorage)]
    
    classDef primary fill:#10b981,stroke:#0f172a,stroke-width:1px,color:#fff;
    classDef secondary fill:#1e293b,stroke:#cbd5e1,stroke-width:1px,color:#cbd5e1;
    class UI,Router,State primary;
    class Views,Dashboard,Calculator,Tracker,Planner,Marketplace,IoTGrid,Analytics secondary;
```

---

## 🛠️ Getting Started

### Prerequisites
*   Python 3 (to serve locally)
*   Docker (optional, for local container runs)

### 1. Run Locally
Serve the application locally using Python's static HTTP server:
```bash
python3 -m http.server 8000
```
Open your browser and navigate to `http://localhost:8000`.

### 2. Run with Docker
Compile and run the container locally:
```bash
# Build the container image
docker build -t terrasense .

# Run the container (maps Nginx port 8888 locally)
docker run -d -p 8888:8080 terrasense
```
Visit `http://localhost:8888`.

### 3. Deploy to Cloud Run
Deploy directly via Google Cloud Build (does not require local Docker daemon):
```bash
gcloud run deploy terrasense --source . --region us-central1 --allow-unauthenticated
```

---

## 📁 Repository Structure

```
.
├── components/
│   ├── aiChatTab.js     # Full-screen chatbot dashboard view
│   ├── aiCoach.js       # Conversation prompt response manager
│   ├── aiNlp.js         # Semantic keyword parsing regex module
│   ├── analytics.js     # Chart.js wrappers
│   ├── calculator.js    # Wizard Questionnaire controller
│   ├── dashboard.js     # Stats dashboard
│   ├── iotGrid.js       # Smart Grid & Thermostat controllers
│   ├── marketplace.js   # Carbon Offset marketplace
│   ├── planner.js       # Action Planner & Eco Auditing
│   └── tracker.js       # Daily action log timelines
├── Dockerfile           # Alpine Nginx container recipe
├── default.conf         # Custom Nginx port 8080 server configurations
├── .dockerignore        # Exclude artifacts and build dependencies
├── data.js              # Multipliers, pledges, and chat knowledge base
├── styles.css           # Core styling framework & CSS variables
├── index.html           # Central shell viewport
└── app.js               # Router, state machine, and localStorage hooks
```
