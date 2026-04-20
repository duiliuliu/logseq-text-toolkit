# Logseq Text Toolkit

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

A powerful and flexible Logseq plugin designed to enhance text editing and formatting capabilities, adding rich styles and features to your notes.

## Plugin Overview

Logseq Text Toolkit is a plugin that provides powerful text formatting features for Logseq, supporting various text styles, highlights, colors, and annotation functions to help users edit and organize note content more efficiently.

### Key Features:
- Rich text formatting options (bold, italic, strikethrough, etc.)
- Multiple color background highlights
- Custom text colors
- Colored underlines
- Annotation functionality
- Support for custom configuration
- Support for light/dark themes
- Multi-language internationalization support

## Toolbar Demo

### Basic Usage
1. Open any page in Logseq
2. Enter edit mode
3. **Select the text you want to format**
4. A formatting toolbar will automatically appear
5. Click the corresponding buttons on the toolbar to format

### Toolbar Functions

#### Text Formatting
- **Bold**: Convert selected text to bold
- **Italic**: Convert selected text to italic
- **Strikethrough**: Add strikethrough to selected text

#### Background Highlights
- **Yellow Highlight**: Add yellow background to selected text
- **Red Highlight**: Add red background to selected text
- **Blue Highlight**: Add blue background to selected text

#### Text Colors
- **Red Text**: Set selected text color to red
- **Blue Text**: Set selected text color to blue

#### Underline Highlights
- **Red Underline**: Add red underline to selected text

## Installation

### Install via Logseq Plugin Market (Recommended)
1. Open Logseq
2. Click the menu in the top right corner → **Plugins**
3. Search for `logseq-text-toolkit` in the plugin market
4. Click **Install**
5. After installation, the plugin will be automatically enabled

### Load via GitHub Link
1. Open Logseq
2. Click the menu in the top right corner → **Plugins**
3. Click **Load plugin from URL**
4. Enter the plugin's GitHub link: `https://github.com/duiliuliu/logseq-text-toolkit/`
5. Click **Load**

### Local Development Mode Installation
1. Clone the plugin code to your local machine: `git clone https://github.com/duiliuliu/logseq-text-toolkit.git`
2. Enter the plugin directory: `cd logseq-text-toolkit`
3. Install dependencies: `npm install`
4. Build the plugin: `npm run build`
5. In Logseq, click the menu in the top right corner → **Plugins** → **Load unpacked plugin**
6. Select the plugin's root directory

## Usage Instructions

### Using the Toolbar
1. Open any page in Logseq
2. Enter edit mode
3. **Select the text you want to format**
4. A formatting toolbar will automatically appear
5. Click the corresponding buttons on the toolbar to format

### Using Keyboard Shortcuts
- **Italic**: `mod+shift+i`

### Customizing Keyboard Shortcuts
1. Click the menu in the top right corner → **Plugins** → Find `logseq-text-toolkit` → Click **Settings**
2. Find the corresponding command in the configuration
3. Set your desired keyboard shortcut combination in the `binding` field
4. Save the configuration and restart the plugin

## Detailed Function Description

### Text Formatting Functions

#### Basic Styles
- **Bold**: Select text → Click the bold button in the toolbar → **Bold text**
- **Italic**: Select text → Click the italic button in the toolbar → *Italic text*
- **Strikethrough**: Select text → Click the strikethrough button in the toolbar → ~~Strikethrough text~~

#### Background Highlights
- **Red Highlight**: Select text → Click the highlight button in the toolbar → Select red
- **Yellow Highlight**: Select text → Click the highlight button in the toolbar → Select yellow
- **Blue Highlight**: Select text → Click the highlight button in the toolbar → Select blue

#### Text Colors
- **Red Text**: Select text → Click the text color button in the toolbar → Select red
- **Blue Text**: Select text → Click the text color button in the toolbar → Select blue

#### Underline Highlights
- **Red Underline**: Select text → Click the underline button in the toolbar → Select red

## Development Guide

### Install Dependencies
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

## Configuration Instructions

### Open Configuration
1. Click the menu in the top right corner → **Plugins**
2. Find `logseq-text-toolkit` → Click **Settings**

### Main Configuration Items

#### Basic Configuration
```json
{
  "disabled": false,          // Whether to disable the plugin
  "toolbar": true,            // Whether to show the toolbar
  "toolbarShortcut": ""       // Keyboard shortcut for showing/hiding the toolbar
}
```

#### Wrap Command Configuration (wrap-*)
```json
{
  "wrap-bold": {
    "label": "Bold",                // Label displayed in the toolbar
    "binding": "",                  // Keyboard shortcut (optional)
    "template": "**$^**",          // Wrap template, $^ represents selected text
    "icon": "<svg ...></svg>"    // Icon (supports SVG strings)
  },
  "wrap-italic": {
    "label": "Italic",
    "binding": "mod+shift+i",
    "template": "*$^*",
    "icon": "<svg ...></svg>"
  },
  "wrap-strike-through": {
    "label": "Strike through",
    "binding": "",
    "template": "~~$^~~",
    "icon": "<svg ...></svg>"
  },
  "wrap-yellow-hl": {
    "label": "Yellow highlight",
    "binding": "",
    "template": "==$^==",
    "icon": "<svg ...></svg>"
  },
  "wrap-red-hl": {
    "label": "Red highlight",
    "binding": "",
    "template": "[:mark.red $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-blue-hl": {
    "label": "Blue highlight",
    "binding": "",
    "template": "[:mark.blue $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-green-hl": {
    "label": "Green highlight",
    "binding": "",
    "template": "[:mark.green $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-purple-hl": {
    "label": "Purple highlight",
    "binding": "",
    "template": "[:mark.purple $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-red-text": {
    "label": "Red text",
    "binding": "",
    "template": "[:span.red $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-blue-text": {
    "label": "Blue text",
    "binding": "",
    "template": "[:span.blue $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-yellow-text": {
    "label": "Yellow text",
    "binding": "",
    "template": "[:span.yellow $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-green-text": {
    "label": "Green text",
    "binding": "",
    "template": "[:span.green $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-purple-text": {
    "label": "Purple text",
    "binding": "",
    "template": "[:span.purple $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-red-underline": {
    "label": "Red underline",
    "binding": "",
    "template": "[:u.red $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-blue-underline": {
    "label": "Blue underline",
    "binding": "",
    "template": "[:u.blue $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-yellow-underline": {
    "label": "Yellow underline",
    "binding": "",
    "template": "[:u.yellow $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-green-underline": {
    "label": "Green underline",
    "binding": "",
    "template": "[:u.green $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-purple-underline": {
    "label": "Purple underline",
    "binding": "",
    "template": "[:u.purple $^]",
    "icon": "<svg ...></svg>"
  },
  "wrap-cloze": {
    "label": "Cloze",
    "binding": "",
    "template": " {{cloze $^}}",
    "icon": "<svg ...></svg>"
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you find this project helpful, consider supporting the developer:

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

## License

MIT