# 🐦 RAVEN

### **Real-time Automated Vulnerability & Exposure Notifier**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Groq AI](https://img.shields.io/badge/AI-Llama--3.1-orange?style=for-the-badge)](https://groq.com/)

**RAVEN** is a comprehensive, enterprise-grade cybersecurity platform specifically engineered for small-to-medium businesses (SMBs). It provides a central hub for threat intelligence, vulnerability assessment, and incident governance, all wrapped in a sleek, high-performance dark glassmorphism interface.
deploymet :https://raven-security-platform-8es37ikwf-saif8671s-projects.vercel.app/
---

## 🛡️ Core Capabilities

### 🔍 Vulnerability Scanner
Full domain and asset auditing. Scans for SSL health, critical security headers (HSTS, CSP, X-Frame-Options), and identifies exposed sensitive administrative pages.

### 🔑 AI-Powered Password Audit
Goes beyond basic regex checks. Uses mathematical entropy analysis to match real-world AI brute-force crack times, helping users understand true credential risk.

### 📧 Email Security (SPF/DKIM/DMARC)
Automated verification of domain authentication records to prevent spoofing and ensure your business emails reach their destination safely.

### 🔎 Breach Detection
Integrated with global data breach databases (HIBP) to cross-check emails and domains against thousands of known leaks and historical compromises.

### 🎣 Phishing Simulation
Train your workforce with realistic, safe phishing campaigns. Move from reactive security to proactive employee awareness with tracked simulation metrics.

### 🛡️ AI Incident Response
A built-in **Senior Incident Responder** chatbot powered by Llama 3.1. Provides immediate, actionable playbooks for ransomware, data breaches, and active compromises.

### 📄 Policy Generator
Instantly create professional Security, Acceptable Use, and Incident Response policies tailored to your company's specific needs.

---

## 🚀 Tech Stack

- **Frontend**: React 19, Framer Motion (Animations), Lucide React (Icons), Vite (Build Tool).
- **Backend**: Express.js (Node v24), Groq SDK (AI Integration), Axios, Nodemailer.
- **Styling**: Vanilla CSS with modern Glassmorphism design system.
- **API Integration**: Have I Been Pwned (HIBP) for breach data.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js v20+
- A [Groq API Key](https://console.groq.com/) (for AI features)
- An optional HIBP API Key (for real breach data)

### 2. Installation

Clone the repository and install dependencies for both layers:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../raven-app-vite
npm install
```

### 3. Environment Setup
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
GROQ_API_KEY=your_key_here
HIBP_API_KEY=your_key_here
HIBP_MODE=live # or 'mock'
```

### 4. Running the Project

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd raven-app-vite
npm run dev
```

---

## 📂 Project Structure

- `backend/` - Node.js API server and cybersecurity analysis logic.
- `raven-app-vite/` - React frontend with modern glassmorphism UI.
- `docs/` - Technical documentation and planning artifacts.

---

## 🔒 Security First
RAVEN is built with privacy in mind. While it communicates with external APIs for threat intelligence (Groq, HIBP), all analysis logic and simulation tracking remain within your controlled environment.

---

## 📜 License
Distributable under the **MIT License**. See `LICENSE` for more information.

---

*“Your silent guardian. Always watching.”*
