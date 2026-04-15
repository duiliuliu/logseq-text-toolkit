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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you find this project helpful, consider supporting the developer:

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

## License

MIT
