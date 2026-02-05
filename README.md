# 🦷 DentaVision AI
### AI-Powered Dental Clinic Management Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Stack: React & Node.js](https://img.shields.io/badge/Stack-Fullstack-blue.svg)](#-tech-stack)
[![AI: Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange.svg)](#-ai-features)

DentaVision AI is an enterprise-grade management platform designed for modern dental clinics. It integrates cutting-edge AI for radiograph analysis and treatment planning with robust clinic management tools.

---

## ✨ Key Features

### 🧠 Intelligent Clinical Tools
- **Radiograph Analysis:** Automated tooth detection and pathology analysis using YOLO and Google Gemini AI.
- **AI Treatment Planning:** Intelligent procedure recommendations based on clinical findings and patient history.
- **Patient Risk Assessment:** Automated risk scoring for patient intake and clinical status.

### 📅 Advanced Clinic Management
- **Smart Appointment Calendar:** Drag-and-drop scheduling with status tracking.
- **Inventory & Supply Tracking:** Real-time stock management with critical level alerts and automated tracking.
- **Laboratory Job Tracking:** End-to-end management of lab orders (Sent, In Lab, Received, Delivered).
- **Automated Reminders:** Daily email notifications for appointments and overdue tasks via SMTP & Cron Jobs.

### 📊 Business Intelligence
- **Financial Dashboard:** Visual reports for revenue, costs, and clinic performance.
- **Secure Records:** Comprehensive patient history and digital dental charts.

---

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Chart.js.
- **Backend:** Node.js, Express.js (Controller-Service Architecture).
- **Database:** MongoDB Atlas (Mongoose ODM) with optimized indexing.
- **AI Services:** Google Gemini 1.5 Pro, Vision-AI models.
- **Validation:** Joi (Enterprise-grade request validation).
- **Automation:** Node-Cron, Nodemailer.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/dentavision-ai.git
   cd dentavision-ai
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Update your .env with MongoDB URI, Gemini Key, and SMTP settings
   npm install
   ```

3. **Setup Frontend:**
   ```bash
   cd ..
   npm install
   ```

4. **Run Application:**
   ```bash
   # From root:
   npm run dev
   # From backend folder:
   node server.js
   ```

---

## 🛡️ Architecture Highlights
The project follows **Clean Architecture** and **SOLID** principles:
- **Separation of Concerns:** Controllers handle requests, Services handle business logic.
- **Validation Middleware:** Generic Joi middleware for all API endpoints.
- **Security:** Helmet, Rate Limiting, and CORS configurations included.
- **Reusability:** Atomic components like `ConfirmModal` for UI consistency.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <p>Built by with ❤️ for the Dental Community</p>
</div>
