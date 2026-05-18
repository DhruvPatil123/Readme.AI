# 🚀 Readme.AI

![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white)

**Readme.AI** is an elite documentation engine designed to bridge the gap between raw source code and professional, high-impact project presentation. By leveraging advanced generative AI and deep [...]

LIVE DEMOO 🤙🏻☃️.  :  
---README Pro | AI Documentation Architect https://share.google/1DB30Nkxtl77xfuzC

## ✨ Key Features

- 🤖 **AI-Driven Synthesis**: Powered by Google Gemini to understand code context and intent.
- 🐙 **GitHub Integration**: Seamless repository fetching via `@octokit/rest`.
- 🎨 **Modern UI/UX**: Built with React, Tailwind CSS, and Framer Motion for a fluid user experience.
- ⚡ **High Performance**: Optimized build pipeline using Vite and TypeScript.
- 📄 **Markdown Excellence**: Generates standard-compliant Markdown with professional formatting.
- 🔥 **Real-time Preview**: Live documentation rendering with `react-markdown`.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite-powered)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown)

### Backend & AI
- **Runtime**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- **AI Engine**: [@google/genai](https://ai.google.dev/) (Gemini Pro)
- **VCS API**: [@octokit/rest](https://github.com/octokit/rest.js/)

### Infrastructure
- **Database/Auth**: [Firebase](https://firebase.google.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 📂 Project Structure

```text
├── server.ts              # Express backend for API processing
├── src/
│   ├── components/        # Reusable UI components (Form, Preview, etc.)
│   ├── lib/               # Shared logic (Gemini & Firebase config)
│   ├── App.tsx            # Main application entry point
│   └── main.tsx           # React DOM mounting
├── firestore.rules        # Security rules for Firebase
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key
- A GitHub Personal Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/readme-ai.git
   cd readme-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key
   GITHUB_TOKEN=your_github_token
   # Add Firebase credentials
   ```

4. **Run the application**
   ```bash
   # Start the development server
   npm run dev
   
   # Start the Express backend
   npm run tsx server.ts
   ```

---

## 🗺️ Roadmap

- [x] Core AI integration with Google Gemini.
- [x] Repository analysis logic via Octokit.
- [x] Dynamic Markdown previewer.
- [ ] **Next Phase**: Auto-generate full README file directly to GitHub PR.
- [ ] Support for multiple template styles (Enterprise, CLI, Minimal).
- [ ] Multi-language support for generated documentation.
- [ ] Export to PDF and HTML formats.

---

## ❤️ Show your support

Give a ⭐ if this project helped you! It motivates us to keep building elite tools for the developer community.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---FILE_SEPARATOR---[ARCHITECTURE.md]---

# 🏗️ Architecture Documentation

## System Overview
Readme.AI follows a decoupled architecture, separating the concerns of repository ingestion, AI processing, and UI rendering.

### 1. Data Ingestion Layer
The application uses `@octokit/rest` to communicate with the GitHub API. It traverses the file tree, identifying key files (`package.json`, `.env`, `src/`) to create a context-rich metadata objec[...]

### 2. Processing Layer (The "Brain")
The Express server (`server.ts`) acts as a middleware between the client and Google's Gemini Pro. It constructs a complex prompt containing the code structure and key file contents, instructing t[...]

### 3. Presentation Layer
Built with Vite and React, the frontend utilizes a reactive state to manage the lifecycle of the documentation generation. `react-markdown` ensures that the AI's output is rendered instantly with[...]

### 4. Persistence Layer
Firebase provides the backbone for user configuration and potentially storing generated documentation blueprints for future retrieval.

---FILE_SEPARATOR---[CONTRIBUTING.md]---

# 🤝 Contributing to Readme.AI

First off, thank you for considering contributing to Readme.AI! It’s people like you that make this tool better for everyone.

### How Can I Contribute?

#### Reporting Bugs
- Use the GitHub Issue Tracker.
- Describe the bug in detail, including steps to reproduce.
- Attach screenshots if applicable.

#### Pull Requests
1. Fork the repo.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

### Style Guide
- Use TypeScript for all logic.
- Follow the existing Tailwind CSS patterns for UI consistency.
- Ensure all components are responsive.

---FILE_SEPARATOR---[CHANGELOG.md]---

# 📜 Changelog

All notable changes to this project will be documented in this file.

### [1.0.0] - 2023-10-27
#### Added
- Initial release of Readme.AI.
- Gemini Pro AI integration for README generation.
- Support for GitHub repository scanning.
- React/Vite frontend with Tailwind CSS styling.
- Live Markdown preview feature.
- Firebase configuration for app metadata.

---FILE_SEPARATOR---[SECURITY.md]---

# 🛡️ Security Policy

## Supported Versions
We currently provide security updates for the latest stable release only.

## Reporting a Vulnerability
We take the security of Readme.AI seriously. If you discover a vulnerability:
1. Please **do not** open a public issue.
2. Email the maintainers directly at `security@readme-ai.dev` (placeholder).
3. We will acknowledge your report within 48 hours and provide a timeline for a fix.

## API Key Safety
- Never commit your `.env` file.
- We recommend using GitHub Secrets if deploying via CI/CD.
- The backend is configured to sanitize inputs before sending them to the Gemini API.
