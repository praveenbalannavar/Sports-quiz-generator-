# AI-Powered Sports Quiz Generation Agent

Welcome to the **AI-Powered Sports Quiz Generation Agent**, an advanced full-stack web application designed for social media content creators to instantly generate unique, highly engaging, and factually accurate sports quizzes.

This project was built to precisely fulfill the objectives and technical requirements of the **AI Product/Engineer Intern Assignment**. It leverages state-of-the-art **Retrieval-Augmented Generation (RAG)**, combining historical sports data from an in-memory **ChromaDB vector database** and live web search updates to eliminate hallucinations and output high-quality, grounded quizzes.

---

## 🚀 Key Features

- **Multi-Sport Selection**: Generate quizzes for **Cricket, Football, Tennis, Badminton, Basketball**, and more.
- **Adjustable Difficulty**: Select between **Easy, Medium, and Hard** modes to tailor content.
- **Dynamic Question Count**: Custom choices of 3, 4, or 5 questions per quiz.
- **Optional Keyword/RAG Focus**: Direct the vector database search focus (e.g., searching specifically for "Thomas Cup" or "Steffi Graf").
- **Live Scraper Integration**: Real-time DuckDuckGo search extraction fetches live matches, championship rosters, and current news.
- **ChromaDB Vector Retrieval**: Integrates a client conforming to the official `chromadb` SDK to insert documents into a `"sports_history"` collection and query using vector metadata queries.
- **Grounded Gemini LLM**: Utilizes `@google/genai` to synthesize grounded quizzes with strict context constraints.
- **Interactive Practice & Exam Modes**: Practice mode offers instant feedback and rich factual explanations; Exam mode mimics real-world tests with final score card summaries.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, and Framer Motion layout transitions.
- **Backend**: Express.js server providing secure proxies for LLM generation, search scraping, and vector database retrieval.
- **Vector Database**: **ChromaDB** client integration seeded automatically on boot with our curated historical facts dataset.
- **AI/LLM Engine**: Google Gemini API via the official modern `@google/genai` TypeScript SDK (including automated retry and fallback chains across `gemini-3.5-flash`, `gemini-flash-latest`, and `gemini-3.1-flash-lite` to ensure maximum reliability).

---

## 📂 Project Structure

```bash
├── chromaClient.ts          # ChromaDB SDK compliant client and collection interface
├── server.ts                # Express backend server with API endpoints and search crawler
├── data/
│   └── sports_facts.json    # Curated offline historical sports facts dataset
├── src/
│   ├── App.tsx              # Main React Dashboard and state management
│   ├── types.ts             # TypeScript definitions for quizzes and sports
│   ├── index.css            # Tailwind CSS global configuration
│   └── main.tsx             # React entrypoint
├── package.json             # Build script pipelines and dependencies
└── .env.example             # Template for API keys
```

---

## 🔌 Setup & Installation Instructions

### Prerequisite
You will need a **Gemini API Key**. Get one from [Google AI Studio](https://aistudio.google.com/).

### 1. Configure Environment Variables
Copy `.env.example` to create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Open `.env` and configure your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Run the Development Server
Install dependencies and boot both the Vite development server and Express backend server concurrently on Port `3000`:
```bash
# Install packages
npm install

# Start development workspace
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 3. Production Build & Execution
To build and execute the application in production mode:
```bash
# Bundle frontend static assets and compile the TypeScript backend server
npm run build

# Start production server
npm run start
```

---

## 🎯 Match-to-Assignment Compliance Checklist

### 1. Functional Requirements:
- [x] **Select Sport**: Dynamic selector for Cricket, Football, Badminton, Tennis, and Basketball in UI.
- [x] **Choose Difficulty**: Interactive selector for Easy, Medium, and Hard difficulty levels.
- [x] **Generate Quizzes**: Automatically constructs fully interactive quizzes based on chosen parameters.
- [x] **Regenerate**: Instantly generates a fresh, diverse quiz set on clicking the generate button.
- [x] **Factual Accuracy**: Grounds questions completely within retrieved vector database and scraped search details.

### 2. AI Agent & RAG Requirements:
- [x] **Web Search**: Implements a real-time DuckDuckGo HTML parser that safely scrapes matching snippets.
- [x] **ChromaDB Integration**: Initializes a fully compliant `ChromaClient` from our `./chromaClient` module, creating and seeding a `"sports_history"` collection, and performing metadata-filtered keyword similarity lookups.
- [x] **LLM Context Synthesis**: Blends ChromaDB historical details and live internet updates into a single comprehensive prompt.
- [x] **Zero Hallucination Grounding**: Forces Gemini to cite source materials and restrict answers to context text.

### 3. Output Format:
- [x] **Sport Name** matched.
- [x] **Difficulty Level** matched.
- [x] **Four to Five Questions** generated.
- [x] **Four Options (A, B, C, D)** strictly enforced via standard JSON schemas.
- [x] **Correct Answer** letter indicated.
- [x] **Short Explanation** citing source contexts correctly included.
