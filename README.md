# AyuAstro 🌌 — Next-Generation Vedic Astrology & Cosmic Wellness Platform

![AyuAstro Banner](public/zodiac-icon.png)

> **A production-grade, full-stack Vedic astrology & cosmic intelligence platform featuring server-side Swiss Ephemeris calculations, DeepSeek RAG AI astrologer counselor, cross-platform Flutter mobile client, Supabase PostgreSQL database, automated WhatsApp report delivery, and Model Context Protocol (MCP) server.**

---

## 🌟 Executive Overview

**AyuAstro** bridges ancient Vedic astrological wisdom with modern artificial intelligence and cross-platform mobile engineering. Built with high precision astrometric calculations powered by Swiss Ephemeris Node C-bindings, AyuAstro offers instant birth chart (Kundali) generation, Vimshottari Dasha timelines, planetary strength scoring (Shadbala), DeepSeek AI report generation, and an automated WhatsApp bot for report delivery.

---

## 🚀 Key Features & System Modules

### 🌌 1. Vedic Kundali & Astrometric Engine
* **High-Precision Calculations:** Node C-bindings (`sweph`) for Swiss Ephemeris planetary positions, houses, Ascendant (Lagna), and Nakshatra Padas.
* **Dual Chart Rendering:** North Indian diamond chart & South Indian square chart painters with interactive planet overlays.
* **Planetary Strength & Dosha Analysis:** Real-time detection of Manglik Dosha, Kaal Sarp Dosha, Sade Sati phase tracking, and Jaimini Karakas.
* **Vimshottari Dasha Timeline:** Multi-level Mahadasha, Antardasha, and Pratyantardasha timeline calculation.

### 🧠 2. DeepSeek AI Astrologer Counselor & RAG Engine
* **Rishi AI Chat Counselor (`/api/chat/astrologer`):** Conversational AI astrologer fine-tuned with Vedic knowledge bases, personalized tone remediation, and birth chart awareness.
* **Deep Intelligence Reports (`/api/ai/deep-intelligence`):** RAG-augmented automated PDF report generation covering career, relationships, health, and karmic lessons.
* **Numerology Blueprint:** Life Path, Expression, Soul Urge, and daily cosmic numbers calculator.

### 📱 3. Cross-Platform Native Flutter Application (`flutter_app/`)
* **24 Native Screens (Dart 3):** Fully styled with AyuAstro's signature soft cream background, glowing gold accents, and Playfair Display typography.
* **Cosmic Wellness Suite:** 
  * 🧘 **Breathing Meditation:** Guided pranayama timer with visual breath synchronization.
  * 🎵 **Cosmic Soundscapes:** Ambient planetary frequencies and meditation audio.
  * 📖 **Gratitude Journal:** Daily reflection log with cosmic prompts.
  * 🎮 **Zodiac Mini-Game:** Interactive astrology trivia and sign matching.
* **Offline Storage & Auth:** Local session caching with `SharedPreferences` and encrypted Supabase auth tokens (`flutter_secure_storage`).

### 💬 4. Automated WhatsApp Bot Worker (`src/whatsapp/`)
* **Intake & Delivery Pipeline:** Headless Node.js worker (`whatsapp-web.js`) that receives birth details via WhatsApp messages and automatically replies with typeset PDF Kundali reports.

### 🔌 5. Model Context Protocol (MCP) & Universal Commerce Protocol (UCP)
* **AyuAstro MCP Server (`mcp-server/`):** Exposes Vedic calculation tools to AI assistant agents.
* **UCP E-Commerce Endpoints (`/api/ucp/*`):** Standardized catalog, checkout, and context API routes for automated astrological consultations.

---

## 🏗️ System Architecture

```
                                 ┌──────────────────────────────────────────┐
                                 │           AyuAstro Ecosystem             │
                                 └────────────────────┬─────────────────────┘
                                                      │
              ┌───────────────────────────────────────┴───────────────────────────────────────┐
              │                                                                               │
   ┌──────────▼──────────┐                                                         ┌──────────▼──────────┐
   │ Next.js 16 Web App  │                                                         │ Flutter Mobile App  │
   │ (React 19 + TS)     │                                                         │ (Android & iOS)     │
   └──────────┬──────────┘                                                         └──────────┬──────────┘
              │                                                                               │
              ├───────────────────────────────┬───────────────────────────────┬───────────────┘
              │                               │                               │
   ┌──────────▼──────────┐         ┌──────────▼──────────┐         ┌──────────▼──────────┐
   │ Swiss Ephemeris     │         │ DeepSeek AI RAG     │         │ Supabase PostgreSQL │
   │ C-Bindings (`sweph`)│         │ Engine (LLM Chat)   │         │ (Prisma ORM 6.11)   │
   └─────────────────────┘         └─────────────────────┘         └─────────────────────┘
              │                               │                               │
              └───────────────────────────────┼───────────────────────────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │ WhatsApp Bot Worker │
                                   │ (`whatsapp-web.js`) │
                                   └─────────────────────┘
```

---

## 📁 Project Directory Structure

```
AyuAstro/
├── src/                                  # Next.js 16 Full-Stack Source Code
│   ├── app/                              # App Router Pages & API Routes
│   │   ├── api/                          # 40 Active REST API Endpoints
│   │   │   ├── ai/                       # DeepSeek Report Generation
│   │   │   ├── astrology/                # Kundali & Planetary Calculators
│   │   │   ├── auth/                     # Supabase & JWT Auth Handlers
│   │   │   ├── chat/                     # Rishi AI Counselor Endpoints
│   │   │   ├── ucp/                      # Universal Commerce Protocol APIs
│   │   │   └── admin/whatsapp/           # WhatsApp Delivery Metrics
│   │   ├── page.tsx                      # Primary PWA Web Interface
│   │   └── layout.tsx                    # Theme & Context Provider
│   ├── components/                       # React UI Components
│   │   ├── ayuastro/                     # Vedic Astrological & Wellness Views
│   │   └── ui/                           # Shadcn UI Primitives
│   ├── lib/                              # Core Domain Logic & Engines
│   │   ├── ai/                           # DeepSeek AI Prompts & RAG Templates
│   │   ├── astrology/                    # Swiss Ephemeris, Dasha, & Yogas Logic
│   │   ├── numerology/                   # Numerology Calculator Engine
│   │   ├── reports/                      # PDF Report Generation & Formatting
│   │   ├── whatsapp/                     # WhatsApp Bot Repository & Guidance
│   │   └── supabase/                     # Supabase Client & Middleware
│   └── whatsapp/                         # Standalone WhatsApp Bot Worker
│       └── worker.ts                     # WhatsApp Automation Entrypoint
│
├── flutter_app/                          # Native Flutter Mobile Client
│   ├── lib/
│   │   ├── main.dart                     # Flutter App Router & State Switcher
│   │   ├── models/                       # Type-Safe JSON Data Models
│   │   ├── providers/                    # AppState & Shared Preferences Store
│   │   ├── screens/                      # 24 Native Screens (Kundali, Chat, Games)
│   │   ├── services/                     # HTTP API Client (`api_service.dart`)
│   │   └── widgets/                      # Starfield Painters & Glassmorphic Cards
│   └── pubspec.yaml                      # Flutter Dependencies Configuration
│
├── prisma/                               # Database Schema & Migrations
│   └── schema.prisma                     # 16 PostgreSQL Database Models
├── mcp-server/                           # Model Context Protocol (MCP) Server
├── public/                               # Static Assets, Vectors, & Logos
├── .env                                  # Environment Variables (Secrets Ignored)
└── README.md                             # Project Documentation
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Web Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion |
| **Mobile Client** | Flutter 3, Dart 3, Provider, Health Sync, Local Notifications, PDF Viewer |
| **Astrometric Engine** | Node C-bindings (`sweph` Swiss Ephemeris) |
| **AI / LLM** | DeepSeek AI (`DEEPSEEK_API_KEY`), RAG-augmented prompt templates |
| **Database & ORM** | PostgreSQL (Supabase Cloud), Prisma ORM 6.11 |
| **Bot Automation** | Node.js, `whatsapp-web.js`, Puppeteer |
| **API Protocols** | REST APIs, MCP Server (`ayuastro-mcp-server`), UCP E-Commerce |

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the project root:

```env
# Database Credentials
DATABASE_URL="postgresql://postgres.maomqpepajpfulmrbayh:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.maomqpepajpfulmrbayh:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# Supabase Auth
SUPABASE_URL="https://maomqpepajpfulmrbayh.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# DeepSeek AI
DEEPSEEK_API_KEY="sk-your-deepseek-api-key"

# Vercel Deployment
VERCEL_ENV="production"
```

---

## ⚡ Quick Start & Installation

### 1. Web Application (Next.js)
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma db push

# Start Next.js development server (Port 3000)
npm run dev
```

### 2. Mobile Application (Flutter)
```bash
# Navigate to flutter_app directory
cd flutter_app

# Get Flutter packages
flutter pub get

# Run on connected device or emulator
flutter run
```

### 3. WhatsApp Automated Bot Worker
```bash
# Start WhatsApp worker script
npm run whatsapp:dev
```

---

## 📄 License & Attribution

Copyright © 2026 **AyuAstro**. All rights reserved.
Developed with high-precision Swiss Ephemeris astrometric library and DeepSeek AI intelligence.
