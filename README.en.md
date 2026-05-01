# Logseq Text Toolkit

A powerful and flexible Logseq plugin designed to enhance text editing and formatting capabilities, adding rich styles and features to your notes.

English Version | [中文版本](README.md)

👉 [Online Preview](https://duiliuliu.github.io/logseq-text-toolkit/)

## Plugin Overview

Logseq Text Toolkit is a plugin that provides powerful text formatting capabilities for Logseq, supporting various text styles, highlights, colors, and comment features to help users edit and organize their notes more efficiently.

### Key Features:
- ✅ Rich text formatting options (bold, italic, strikethrough, etc.)
- ✅ Multiple color background highlights
- ✅ Custom text colors
- ✅ Colorful underlines
- ✅ Annotation features
- ✅ Page and journal comment features
- ✅ **Task Progress Tracking** (new)
  - Mini Three-Color Circle
  - Dot Matrix
  - Status Cursor
  - Progress Capsule
  - Step Progress
- ✅ Customizable configuration
- ✅ Light/dark theme support
- ✅ Multi-language internationalization (English, Japanese, Chinese)

<table>
  <tr>
    <td align="center">
      <img width="180" alt="image" src="https://github.com/user-attachments/assets/4be36305-3d06-443d-8548-a121894cb46d" />
      <br>Text Operations
    </td>
    <td align="center">
      <img width="180" alt="image" src="https://github.com/user-attachments/assets/ff0810d8-b201-4680-b316-683e03013133" />
      <br>Text Operation Toolbar
    </td>
    <td align="center">
      <img width="180" alt="image" src="https://github.com/user-attachments/assets/8bb1861d-0b07-4056-a6b4-b5ebd40c5e68" />
      <br>Task Progress Tracking
    </td>
  </tr>
</table>

## Installation

### Install via Logseq Plugin Market (Recommended)
1. Open Logseq
2. Click menu in top right corner → **Plugins**
3. Search for `logseq-text-toolkit` in the plugin market
4. Click **Install**
5. The plugin will automatically enable after installation

### Load via GitHub URL
1. Open Logseq
2. Click menu in top right corner → **Plugins**
3. Click **Load plugin from URL**
4. Enter plugin's GitHub URL: `https://github.com/duiliuliu/logseq-text-toolkit/`
5. Click **Load**

### Install for Local Development
1. Clone plugin code locally: `git clone https://github.com/duiliuliu/logseq-text-toolkit.git`
2. Enter plugin directory: `cd logseq-text-toolkit`
3. Install dependencies: `npm install`
4. Build plugin: `npm run build`
5. In Logseq, click menu in top right corner → **Plugins** → **Load unpacked plugin**
6. Select plugin root directory

## Basic Usage

### Using Toolbar
1. Open any page in Logseq
2. Enter edit mode
3. **Select text to format**
4. Formatting toolbar will automatically appear
5. Click corresponding button on toolbar to format

### Using Shortcuts
- **Italic**: `mod+shift+i`
- **Remove Formatting**: `mod+shift+x`

### Customizing Shortcuts
1. Click menu in top right corner → **Plugins** → find `logseq-text-toolkit` → click **Settings**
2. Find corresponding command in configuration
3. Set desired shortcut combination in `binding` field
4. Save configuration and restart plugin

## Detailed Feature Description

### Text Formatting Features

#### Basic Styles
- **Bold**: Select text → Click bold button in toolbar → **bold text**
  ![Toolbar bold option](docs/screenshots/toolbar-bold.png)
- **Italic**: Select text → Click italic button in toolbar → *italic text*
  ![Toolbar italic option](docs/screenshots/toolbar-italic.png)
- **Strikethrough**: Select text → Click strikethrough button in toolbar → ~~strikethrough text~~
- **Subscript**: Select text → Click subscript button in toolbar → <sub>subscript text</sub>
- **Superscript**: Select text → Click superscript button in toolbar → <sup>superscript text</sup>
- **Code Block**: Select text → Click code block button in toolbar → `code text`

#### Background Highlights
- **Red highlight**: Select text → Click highlight button in toolbar → Choose red
- **Yellow highlight**: Select text → Click highlight button in toolbar → Choose yellow
- **Blue highlight**: Select text → Click highlight button in toolbar → Choose blue
- **Green highlight**: Select text → Click highlight button in toolbar → Choose green
- **Purple highlight**: Select text → Click highlight button in toolbar → Choose purple
  ![Toolbar highlight option](docs/screenshots/toolbar-highlight.png)

#### Text Colors
- **Red text**: Select text → Click text color button in toolbar → Choose red
- **Yellow text**: Select text → Click text color button in toolbar → Choose yellow
- **Blue text**: Select text → Click text color button in toolbar → Choose blue
- **Green text**: Select text → Click text color button in toolbar → Choose green
- **Purple text**: Select text → Click text color button in toolbar → Choose purple

#### Underline Highlights
- **Red underline**: Select text → Click underline button in toolbar → Choose red
- **Yellow underline**: Select text → Click underline button in toolbar → Choose yellow
- **Blue underline**: Select text → Click underline button in toolbar → Choose blue
- **Green underline**: Select text → Click underline button in toolbar → Choose green
- **Purple underline**: Select text → Click underline button in toolbar → Choose purple

#### File Link Feature
- **File link**: Select text → Click file link button in toolbar → [[link text]]

---

## 📊 Task Progress Tracking

### Feature Overview

Task progress tracking allows you to visualize task completion progress in Logseq, supporting five different display styles.

### Usage

1. In the parent task block where you want to show progress, enter:
   ```
   {{renderer :taskprogress}}
   ```
2. Or use slash command: Type `/` then select "[Text Toolkit] Insert Task Progress"
3. Subtask recognition conditions (any one met):
   - Contains `#task` tag
   - Block has `status` property

### Example

```
- My Project {{renderer :taskprogress}}
  - Task 1 #task status:: todo
  - Task 2 #task status:: doing
  - Task 3 #task status:: done
  - Task 4 #task status:: in review
```

### Five Progress Display Styles

#### 1. Mini Three-Color Circle
![Mini Three-Color Circle](docs/screenshots/task-progress-mini-circle.png)
- SVG circle with segment display, each segment represents a status
- Center of circle shows completion rate or completed/total count
- Supports percentage or fraction label display

#### 2. Dot Matrix
![Dot Matrix](docs/screenshots/task-progress-dot-matrix.png)
- Colorful dots arranged horizontally
- Each dot represents a task, color indicates status
- Automatically shows +N when tasks exceed 10

#### 3. Status Cursor
![Status Cursor](docs/screenshots/task-progress-status-cursor.png)
- Clean icon + number display style
- Uses icons like ✓(done), ○(doing), ●(todo)
- Mouse hover shows detailed status statistics

#### 4. Progress Capsule
![Progress Capsule](docs/screenshots/task-progress-capsule.png)
- Capsule-shaped progress bar
- Internal progress bar with segmented coloring, displayed in proportion to status
- Right side shows completed/total count

#### 5. Step Progress
![Step Progress](docs/screenshots/task-progress-step.png)
- Step-shaped vertical progress bar
- Each step represents a status
- Step height changes dynamically based on status count ratio

### Configuration Options

In plugin settings, you can:
- Select default progress display style
- Configure whether to show labels
- Set label format (percentage/fraction)
- Customize colors for each status
- Select size (small/medium/large)

---

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

### Test Mode
```bash
npm run test
```

Visit in browser: `http://localhost:3004/` to test plugin functionality.

## Project Structure

- `src/components/` - Component directory
  - `Toolbar/` - Base toolbar component
  - `SelectToolbar/` - Select toolbar component
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
  - `testAPP.tsx` - Test app
  - `testData.ts` - Test data
  - `components/` - Test components
    - `HiccupRenderer/` - Hiccup renderer component

## Configuration Guide

### Open Configuration
1. Click menu in top right corner → **Plugins**
2. Find `logseq-text-toolkit` → click **Settings**

### Main Configuration Items

#### Basic Configuration
```json
{
  "disabled": false,          // Whether to disable plugin
  "toolbar": true,            // Whether to show toolbar
  "toolbarShortcut": ""       // Shortcut for showing/hiding toolbar
}
```

#### Wrap Command Configuration (wrap-*)
```json
{
  "wrap-bold": {
    "label": "Bold",                // Label shown on toolbar
    "binding": "",                  // Shortcut (optional)
    "template": "**$^**",          // Wrap template, $^ represents selected text
    "icon": "<svg ...></svg>"    // Icon (supports SVG string or lucide-react icon)
  }
}
```

## Custom Styles

### CSS File Replacement

Logseq Text Toolkit supports custom plugin styles by modifying CSS files. The plugin will try to load the following CSS files at startup:

- `settingsModal.css` - Settings modal styles
- `modal.css` - Basic modal styles
- `toolbar.css` - Toolbar styles
- `inlineComment.css` - Inline comment styles
- `customsToolbarItems.css` - Custom toolbar item styles

### Usage

1. Find above CSS files in plugin directory (usually `logseq-text-toolkit` directory)
2. Modify CSS files to customize styles
3. Reload plugin in Logseq
4. New styles take effect immediately after plugin reload

### Notes

- If CSS file doesn't exist, plugin will use built-in CSS styles as fallback
- When modifying CSS files, it's recommended to keep original file structure and class names, only modify style properties
- After reloading plugin, new styles are applied immediately, no need to rebuild plugin

## Custom Languages

### Language File Management

Logseq Text Toolkit supports customizing and adding new languages by modifying language files. The plugin will try to load the following language files at startup:

- `translations/zh-CN.json` - Chinese language file
- `translations/en.json` - English language file
- `translations/ja.json` - Japanese language file

### Adding New Language

1. Create new language file in `dist/translations/` directory, e.g. `fr.json`
2. Modify `settings.json` file, add new language configuration in `meta.language.languages`:

```json
{
  "meta": {
    "language": {
      "languages": [
        // Existing languages...
        {
          "code": "fr",
          "name": "Français",
          "path": "translations/fr.json"
        }
      ],
      "fallbackLanguage": "zh-CN"
    }
  }
}
```

3. Reload plugin in Logseq
4. New language will appear in settings language dropdown

### Customizing Language File

1. Edit language file in `dist/translations/` directory
2. Reload plugin in Logseq
3. New translations take effect immediately

### Notes

- If language file doesn't exist, plugin will use built-in language file as fallback
- Newly added language file must include all necessary translation keys
- Language file path must be relative to plugin root directory

## Contributing

Contributions welcome! Please feel free to submit Pull Requests.

## Support

If you find this project helpful, please consider supporting the developer:

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

## License

MIT
