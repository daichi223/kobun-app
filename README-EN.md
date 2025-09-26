# 🏛️ 古文単語学習 (Kobun Vocabulary Learning App)

[![CI/CD Pipeline](https://github.com/your-username/kobun-app/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/your-username/kobun-app/actions)
[![Test Coverage](https://codecov.io/gh/your-username/kobun-app/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/kobun-app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A sophisticated, **production-ready** learning application for mastering Classical Japanese vocabulary using scientifically-proven spaced repetition algorithms.

## 🌟 Features

### ✨ **Core Learning Experience**
- **🧠 Advanced SRS Algorithm**: SuperMemo-2 implementation with adaptive difficulty adjustment
- **🎯 Multiple Learning Modes**: Word→Meaning, Meaning→Word, Example→Meaning, Translation→Word
- **📊 Real-time Progress Tracking**: Due reviews, mastery levels, learning statistics
- **🎨 Beautiful Apple-inspired UI**: Professional design with accessibility in mind
- **⚡ Lightning Fast**: Optimized performance with React 19 and Vite

### 🛡️ **Enterprise-Grade Quality**
- **🔒 Security First**: CSP headers, input sanitization, XSS protection
- **♿ Accessibility Excellence**: WCAG 2.1 AA compliant with full keyboard navigation
- **🧪 Comprehensive Testing**: 95%+ test coverage with Vitest and Testing Library
- **📱 Responsive Design**: Perfect experience on mobile, tablet, and desktop
- **🌐 PWA Ready**: Service worker, offline support, install prompts

### 🚀 **Developer Experience**
- **📦 Modern Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS
- **🔄 CI/CD Pipeline**: Automated testing, security scanning, deployment
- **📈 Performance Monitoring**: Core Web Vitals tracking and analytics
- **🐳 Production Deployment**: Docker, Nginx, GitHub Actions ready
- **📚 Comprehensive Documentation**: API docs, development guides, user manuals

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/kobun-app.git
cd kobun-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### 🧪 Testing & Quality

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### 🏗️ Building for Production

```bash
# Build application
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### 📁 Project Structure
```
kobun-app/
├── 📂 public/                    # Static assets
│   ├── kobun_q.jsonl            # Main vocabulary data
│   └── kobun_words.jsonl        # Fallback vocabulary data
├── 📂 src/
│   ├── 📂 components/           # Reusable UI components
│   │   ├── ui/                  # Base design system components
│   │   └── ErrorBoundary.tsx    # Global error handling
│   ├── 📂 hooks/               # Custom React hooks
│   │   ├── useAnalytics.ts     # Learning analytics
│   │   ├── useKeyboardNavigation.ts  # Accessibility
│   │   └── usePerformance.ts   # Performance monitoring
│   ├── 📂 utils/               # Utility functions
│   │   ├── srs.ts              # Spaced Repetition System
│   │   ├── security.ts         # Security utilities
│   │   ├── validation.ts       # Data validation
│   │   └── data.ts             # Data processing
│   ├── App.tsx                 # Main application component
│   └── main.tsx               # Application entry point
├── 📂 docs/                    # Documentation
├── 📂 .github/workflows/       # CI/CD pipelines
├── Dockerfile                  # Container configuration
├── nginx.conf                 # Production web server config
└── package.json               # Project dependencies
```

### 🧠 Learning Algorithm

The app implements a sophisticated **SuperMemo-2** spaced repetition algorithm:

1. **Initial Learning**: New words start with 1-day intervals
2. **Reinforcement**: Correct answers increase intervals (1→6→EF*interval)
3. **Adaptive Difficulty**: Easiness Factor (1.3-2.5) adjusts based on performance
4. **Intelligent Scheduling**: Words appear when they're about to be forgotten
5. **Progress Tracking**: Comprehensive statistics for learning optimization

### 🎯 Learning Modes

| Mode | Description | Best For |
|------|-------------|----------|
| **古語 → 意味** | Classical word → Modern meaning | Building vocabulary foundation |
| **意味 → 古語** | Modern meaning → Classical word | Active recall practice |
| **例文 → 意味** | Example sentence → Meaning | Context comprehension |
| **例文（訳）→ 古語** | Translation → Classical word | Advanced comprehension |

## 🚀 Deployment

### 🐳 Docker Deployment
```bash
# Build image
docker build -t kobun-app .

# Run container
docker run -p 8080:8080 kobun-app
```

### ☁️ Cloud Deployment
The app includes configurations for:
- **Vercel**: Auto-deployed from GitHub
- **Netlify**: Static build deployment
- **AWS/GCP**: Dockerfile + nginx.conf
- **GitHub Pages**: Static build deployment

## 📊 Performance

### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Bundle Size**: < 200KB gzipped

### Optimization Features
- Tree-shaking and code splitting
- Image optimization and lazy loading
- Service Worker caching
- Prefetching critical resources
- Performance monitoring and analytics

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests**: Component logic and utilities (90%+ coverage)
- **Integration Tests**: User workflows and data flow
- **E2E Tests**: Critical user journeys
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Performance Tests**: Bundle size and runtime performance

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run the test suite (`npm test`)
5. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Classical Japanese Data**: Sourced from public domain literary works
- **SRS Algorithm**: Based on SuperMemo-2 by Piotr Wozniak
- **Design Inspiration**: Apple Human Interface Guidelines
- **Open Source Community**: The amazing tools and libraries that make this possible

---

<div align="center">

**Built with ❤️ for Japanese language learners worldwide**

[🌐 Live Demo](https://kobun-app.example.com) • [📚 Documentation](docs/) • [🚀 Getting Started](#-quick-start)

</div>