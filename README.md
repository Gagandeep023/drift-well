# @gagandeep023/drift-well

**Master gravity. Find the well.**

A physics-based browser game where you navigate a particle through invisible gravity wells to reach checkpoints. Built as a React component with Canvas 2D rendering.

## Install

```bash
npm install @gagandeep023/drift-well
```

## Usage

```tsx
import { DriftWell } from '@gagandeep023/drift-well/frontend';
import '@gagandeep023/drift-well/frontend/styles.css';

function App() {
  return (
    <DriftWell
      width={600}
      height={500}
      onGameOver={(score) => console.log(score)}
    />
  );
}
```

## How It Works

- Tap/click and drag to aim, release to push your particle
- Your particle drifts with momentum through invisible gravity fields
- Reach each glowing checkpoint ring in order
- Each push costs energy; hitting walls drains more
- Complete all checkpoints to advance to harder levels

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `600` | Canvas width in pixels |
| `height` | `number` | `500` | Canvas height in pixels |
| `onGameOver` | `(score: number) => void` | - | Callback when game ends |

## Requests and feedback

[![Request a feature](https://img.shields.io/badge/request-a%20feature-64ffda)](https://github.com/Gagandeep023/drift-well/discussions/new?category=ideas)
[![Report a bug](https://img.shields.io/badge/report-a%20bug-cc4444)](https://github.com/Gagandeep023/drift-well/issues/new?template=bug_report.yml)

Ideas and questions go to Discussions, bugs to Issues.

## License

MIT
