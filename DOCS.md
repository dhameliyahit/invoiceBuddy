# Invoice Buddy - Project Documentation

## Project Overview
**Invoice Buddy** is a centralized billing and invoice management system. It enables business owners to configure their professional profile, generate professional PDF invoices, and track their revenue through a unified dashboard.

---

## 🚀 Recent Key Enhancements

### 1. High-Performance Image Optimization
- **Technology**: Integrated `sharp` for server-side image processing.
- **Implementation**:
    - Logos uploaded by businesses are automatically resized (max 500x500px).
    - Converted to **WebP format** (80% quality) for maximum speed and minimal storage.
    - Stored as **Data URLs** directly in the database to eliminate external storage dependencies and latency.
- **PDF Compatibility**: The PDF generator (`pdfGenerator.js`) automatically converts these WebP images to **PNG** on-the-fly to ensure compatibility with standard PDF readers.

### 2. Unified Dashboard System
- **Frontend**:
    - Created a new `DashboardLayout` with a responsive sidebar.
    - Navigation between the **Dashboard Summary**, **Invoice Creator**, and **Business Settings**.
- **Metrics**: 
    - **Total Revenue**: Aggregated from all historical invoices.
    - **Invoice Count**: Real-time tracking of generated bills.
    - **Recent History**: Quick view of the last 5 invoices.

### 3. Business Configuration Updates
- **Flexibility**: Users can now update their business name, address, or contact details from the dashboard without being forced to re-upload a logo.
- **Data Persistence**: Business profiles are pre-filled in the settings form, making updates quick and easy.

### 4. Invoice History Tracking
- **Persistence**: Every generated invoice is now saved to the `Invoice` collection in the database.
- **Reporting**: Metadata (customer info, product list, grand totals) is tracked for reporting and dashboard visualization.

---

## 🛠 Tech Stack

### Backend (Server)
- **Node.js & Express**: Core API framework.
- **MongoDB & Mongoose**: Data persistence (Users, Invoices).
- **Sharp**: Image processing and optimization.
- **pdfmake**: Professional PDF generation.
- **JWT (JsonWebToken)**: Secure user authentication.

### Frontend (Client)
- **React (Vite)**: Fast, modern UI framework.
- **Tailwind CSS**: Rapid, customized styling.
- **Lucide-React**: Premium iconography.
- **React-Router-Dom**: Client-side routing with nested dashboard layouts.
- **Axios**: API communication with Bearer Token auth.

---

## 📡 API Reference (Core Endpoints)

| Endpoint | Method | Description | Auth |
| :--- | :--- | :--- | :--- |
| `/api/login` | `POST` | User authentication & Profile redirection | Public |
| `/api/config` | `POST` | Setup or Update Business Profile | Private |
| `/api/profile` | `GET` | Fetch Current Business Profile | Private |
| `/api/dashboard` | `GET` | Fetch Business Stats & Invoice History | Private |
| `/api/invoice` | `POST` | Generate PDF & Save Invoice Metadata | Private |

---

## 📂 Project Structure

```bash
invoiceBuddy/
├── client/                 # React Application
│   ├── src/
│   │   ├── components/     # Dashboard, Invoice, Config, Login
│   │   ├── utils/          # Alerts, Analytics
│   │   └── App.jsx         # Routing Logic
├── server/                 # Express API
│   ├── controller/         # Business Logic (User, Dashboard)
│   ├── model/              # Database Schemas (User, Invoice)
│   ├── routes/             # API Route Definitions
│   └── utils/              # PDF Generator, Image Processing
└── DOCS.md                 # Project Documentation
```

---

## 📘 Summary of Workflow
1. **Login**: Authenticate with email and password.
2. **Setup**: Configure business name, address, and logo (optimized via Sharp).
3. **Dashboard**: View high-level metrics and history.
4. **Generate**: Create professional invoices (saved to DB and returned as PDF).
5. **Update**: Modify business details seamlessly from the Sidebar settings.
