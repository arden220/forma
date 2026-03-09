# FORMA - 3D Shape Generator

A browser-based 3D shape generator with advanced effects and exports, featuring a brutalist design aesthetic.

## Quick Start

### Installation
```bash
cd forma
npm install
npm run dev
```

### Development Server
- **URL**: http://localhost:3000
- **Browser Preview**: Available through IDE

---

## Architecture Overview

### Core Technologies
- **Frontend**: Next.js 14.2.15 with React 18.3.1
- **3D Engine**: Three.js via React Three Fiber
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS + Custom CSS
- **Typography**: Geist fonts (local loading)

### Project Structure
```
forma/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with fonts
│   │   ├── page.tsx        # Main 3D interface
│   │   └── globals.css     # Global styles
│   └── types/
│       └── framer-motion.d.ts
├── public/                 # Static assets
├── ROADMAP.md             # Development roadmap
└── package.json           # Dependencies
```

---

## Current Features

### ✅ Implemented
- Brutalist UI with optical illusion background
- 3D shape rendering (Box, Sphere, Torus)
- Wireframe materials with red/white colors
- Orbit controls for 3D navigation
- Framer Motion UI animations
- Geist font integration
- Responsive full-screen layout

### 🔄 In Progress
- Interactive menu functionality
- Shape state management
- Real-time shape manipulation

---

## Key Components

### Main Interface (`src/app/page.tsx`)
```typescript
// Core components:
- Canvas: 3D rendering container
- Shape: Individual 3D shape component
- Menu: Interactive control panel
- UI Elements: Brutalist design elements
```

### Layout (`src/app/layout.tsx`)
```typescript
// Features:
- Geist font loading
- Dark theme configuration
- FORMA branding
- Responsive meta tags
```

### Styling (`src/app/globals.css`)
```typescript
// Custom styles:
- Brutalist borders
- Optical illusion animation
- Grainy texture overlay
- CSS variables for theming
```

---

## Development Notes

### Known Issues
- Tailwind CSS warnings (IDE only, doesn't affect functionality)
- TypeScript strict mode disabled for rapid development
- Node.js 18 compatibility (downgraded versions)

### Performance Considerations
- Wireframe materials for better performance
- Single 3D scene with multiple shapes
- Optimized font loading
- Minimal bundle size

### Browser Compatibility
- Requires WebGL 2.0
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Desktop-first design (mobile PWA planned)

---

## Next Development Steps

1. **Menu Interactions**: Connect menu items to shape manipulation
2. **State Management**: Implement shape and animation state
3. **Export System**: Add glTF and video export options
4. **Advanced Effects**: Shaders, textures, post-processing
5. **PWA Features**: Offline functionality, mobile optimization

---

## Configuration Files

### Package.json Dependencies
```json
{
  "next": "14.2.15",
  "react": "^18.3.1",
  "@react-three/fiber": "^8.15.11",
  "@react-three/drei": "^9.88.17",
  "framer-motion": "^12.35.2",
  "three": "^0.183.2",
  "geist": "^1.7.0"
}
```

### TypeScript Configuration
- Strict mode disabled
- JSX preserve mode
- Path aliases configured (`@/*`)

### Next.js Configuration
- CommonJS module format
- App directory enabled
- No experimental features

---

*For detailed development roadmap, see ROADMAP.md*
