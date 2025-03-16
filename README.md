# MindLock - Exam Prep System

MindLock is a sleek, distraction-free platform to organize and practice your exam questions. Ditch the Word docs and get everything in one place, neatly organized and easy to use.

## Key Features

- **Organize Questions**: Enter, edit, and categorize your exam questions.
- **Easy Tagging**: Label questions by course, difficulty, and type.
- **Study Mode**: Focused practice session with your questions.
- **Color-Coded Courses**: Keep everything neat with color-coded course sections.

## Tech Stack

- **Frontend**: React + Vite
- **UI Framework**: Tailwind CSS
- **Backend**: Firebase (Firestore)

## Getting Started

### Requirements

- Node.js (v20+)
- npm

### Setup

1. Clone the repo
```bash
git clone <repository-url>
cd mindlock
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - The app is set to use the my own Firebase project. (just for development)
   - To use your own Firebase project, update `src/firebase/config.js`.

4. Run the app
```bash
npm run dev
```

5. Go to `http://localhost:5173` in your browser.

## Usage

1. **Create Courses**: Add your courses and group questions under them.
2. **Add Questions**: Organize questions by type, difficulty, and topic.
3. **Study Mode**: Select a course and practice without distractions (In future versions I will implement this feature)