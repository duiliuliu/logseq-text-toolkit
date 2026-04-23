# Logseq Text Toolkit

A powerful and flexible toolbar component for Logseq plugins, designed to enhance text editing and formatting capabilities.

## Features

### Core Components
- **Toolbar**: A customizable toolbar with support for icons, groups, and dropdown menus
- **SelectToolbar**: Automatically appears when text is selected, with smart positioning

### Key Features
- **Customizable Dimensions**: Support for custom width and height
- **Theme Support**: Light and dark modes
- **Icon Support**: Compatible with lucide-react icons and SVG icons
- **Smart Positioning**: Automatically appears above or below selected text based on available space
- **Scroll Tracking**: Follows selected text when scrolling
- **Delay Hiding**: Configurable delay for dropdown menus to improve user experience
- **Event Handling**: Support for custom click functions and modes
- **Iframe Environment Support**: Compatible with Logseq plugin's iframe runtime environment
- **Precise Text Replacement**: Support for precise replacement of selected text

## Usage

### Basic Toolbar
```jsx
import Toolbar from './components/Toolbar'

<Toolbar 
  items={toolbarItems} 
  theme="light"
  width="110px"
  height="24px"
/>
```

### Select Toolbar
```jsx
import SelectToolbar from './components/SelectToolbar'

<SelectToolbar 
  targetElement={document.getElementById('content')}
  items={toolbarItems} 
  theme="light"
  hoverDelay={500}
/>
```

## Development

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Project Structure

- `src/components/` - Components directory
  - `Toolbar/` - Basic toolbar component
  - `SelectToolbar/` - Selection toolbar component
  - `SettingsModal/` - Settings modal component
  - `Toast/` - Toast message component

- `src/config/` - Configuration directory
  - `useSettings.tsx` - Settings management
  - `defaultSettings.ts` - Default settings
  - `types.ts` - Type definitions

- `src/logseq/` - Logseq related
  - `index.ts` - Logseq API management
  - `mock/` - Mock Logseq API
  - `utils.ts` - Utility functions

- `src/test/` - Test directory
  - `testAPP.tsx` - Test application
  - `testData.ts` - Test data

## Configuration

### Toolbar Items Configuration

```typescript
const toolbarItems = {
  "wrap-bold": {
    id: "wrap-bold",
    label: "Bold",
    binding: "",
    icon: "bold",
    funcmode: "replace",
    clickfunc: "**${selectedText}**"
  },
  "group-style": {
    id: "group-style",
    isGroup: true,
    label: "Style",
    items: {
      // sub-items...
    }
  }
}
```

### Supported Function Modes
- `replace`: Replace selected text
- `add`: Add content
- `invoke`: Invoke function
- `console`: Console operation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you find this project helpful, consider supporting the developer:

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

## License

MIT