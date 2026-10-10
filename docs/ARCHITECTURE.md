# 🏗️ KisanSaathi Architecture & Technical Documentation

## 1. System Overview

**KisanSaathi** is an agricultural marketplace, quality grading, and supply-chain platform designed to eliminate rural exploitation by connecting smallholder farmers directly with wholesale food processors and bulk buyers across **Telangana**.

```mermaid
flowchart TD
    subgraph Farmer Interaction
        PWA["Responsive PWA<br>(Mobile Frame / Desktop)"]
        Voice["Bilingual Voice AI<br>(Kisan Mitra en-IN / hi-IN)"]
        Auth["1-Tap OTP / Quick Access<br>(Aadhaar-Linked Mobile)"]
    end

    subgraph Core AI & ML Engines
        CV["Computer Vision Grading<br>(Grain Defect Ratio & Color)"]
        Price["Price Prediction Engine<br>(Elite/Premium/Classic)"]
        Cluster["Cluster Aggregation<br>(Sub-500kg Logistics Pooling)"]
    end

    subgraph Transaction & Logistics
        Nego["Counter-Offer Desk<br>(Direct Buyer Bids)"]
        Escrow["Escrow Vault & Payouts<br>(24h DBT Settlement)"]
        GIS["Leaflet GPS Route Engine<br>(Warangal ➔ Bowenpally)"]
        Ledger["Blockchain Credit Ledger<br>(785 Score & 4% KCC Loan)"]
    end

    Farmer Interaction --> Core AI & ML Engines
    Core AI & ML Engines --> Transaction & Logistics
```

---

## 2. Core Architectural Components

### 2.1 Responsive PWA Client (`index.html`, `app.js`, `styles.css`)
- **Dual Display Mode**: Native smartphone frame simulation (430px viewport with notch, status bar, and bottom navigation) and full widescreen desktop portal view.
- **Client-Side Storage**: Leverages HTML5 `localStorage` for offline state caching, orders, inventory, and transaction history.
- **Micro-Interaction UI**: Tailwind CSS utility design with Lucide SVG iconography and mobile drawer gestures.

### 2.2 Computer Vision Quality Grading (`app.js`)
- **Inspection Metric**: Client-side scanning of uploaded grain samples (paddy, wheat, pulses).
- **Uniformity & Defect Analysis**: Computes ratio score (84–95/100) and assigns quality grades:
  - **Elite Grade**: High uniform seed density (Top 10% premium pricing).
  - **Premium Grade**: Market-standard clean harvest.
  - **Classic Grade**: Standard fair-average quality.
- **Fair Price Band**: Automatically bounds minimum and maximum recommended ₹/Kg rates based on live mandi market indices.

### 2.3 Automated Cluster Aggregation Engine
- When an individual farmer lists **< 500 Kg**, individual freight charges (₹3.80/Kg) make transportation economically unfeasible.
- The platform automatically triggers a recommendation dialog to join **Warangal Agri-Cluster #12** (covering Geesugonda, Atmakur, Wardhannapet).
- Producing aggregation cuts freight expenses down to **₹2.35/Kg (38% net logistics savings)**.

### 2.4 Bilingual Voice Assistant (Kisan Mitra)
- Built on the native W3C **Web Speech Synthesis API**.
- Supports dynamic switching between **Indian English (`en-IN`)** and **Hindi (`hi-IN`)**.
- Domain knowledge base covers Telangana mandis (Enumamula Warangal, Bowenpally Secunderabad), organic remedies (Neemastra), government schemes (Rythu Bandhu, PMFBY), and credit evaluation.

### 2.5 Leaflet GIS & Route Navigation
- Interactive map powered by **Leaflet.js** and OpenStreetMap tiles.
- Maps transit paths from farm origins (Geesugonda: `17.9689, 79.5941`) through highway waypoints (Jangaon, Bhongir) to terminal mandis (Bowenpally: `17.4770, 78.4870`).
- Provides 1-click navigation links directly into Google Maps with pre-computed GPS waypoints.

### 2.6 Blockchain Agri-Credit Ledger
- Simulates cryptographic block hashing with SHA-256 genesis chaining.
- Computes an **Agri Credit Score (785/900)** based on verified harvest history and soil health cards.
- Unlocks pre-approved **₹3,00,000 crop working capital loans** at a subsidized 4% interest rate through Telangana State Cooperative Bank.
