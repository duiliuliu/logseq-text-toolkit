# Logseq Text Toolkit ✨

A powerful and flexible Logseq plugin designed to enhance text editing and formatting capabilities.

[English Version](README.en.md) | [中文版本](README.md)

👉 [Online Preview](https://duiliuliu.github.io/logseq-text-toolkit/) | [Experimental Preview](https://duiliuliu.github.io/logseq-text-toolkit/dev/) | [Detailed User Guide](docs/USER_GUIDE.en.md)

---

## 一、Showcase

<table>
  <tr>
    <td align="center">
      <img width="280" alt="文本操作" src="https://github.com/user-attachments/assets/4be36305-3d06-443d-8548-a121894cb46d" />
      <br>Text Formatting
    </td>
    <td align="center">
      <img width="280" alt="工具栏" src="https://github.com/user-attachments/assets/ff0810d8-b201-4680-b316-683e03013133" />
      <br>Toolbar Buttons
    </td>
      <td align="center">
      <img width="280" alt="任务进度" src="https://github.com/user-attachments/assets/8bb1861d-0b07-4056-a6b4-b5ebd40c5e68" />
      <br>Task Progress Tracking
    </td>
  </tr>
  <tr>
    <td align="center">
       <img width="280" alt="toolbar设置面板" src="https://github.com/user-attachments/assets/383a176b-f94a-4f1c-b50a-a4f738d0ac0f" />
      <br>Toolbar Settings Panel
    </td>
      <td align="center">
       <img width="280" alt="taskprogress设置面板" src="https://github.com/user-attachments/assets/73c9eb90-2c4f-4ace-99ea-a9eb510f7bcf" />
      <br>Task Progress Settings
    </td>
    <td align="center">
      <img width="280" height="200" alt="heatmap" src="docs/screenshots/heatmap.png" />
      <br>Heatmap
    </td>
  </tr>
  <tr>
    <td align="center">
      <img width="280" alt="BlockView Table" src="docs/screenshots/tableView.png" />
      <br>Block View - Table
    </td>
    <td align="center">
      <img width="280" alt="BlockView Gallery" src="docs/screenshots/gallery.png" />
      <br>Block View - Gallery
    </td>
    <td align="center">
      <img width="280" alt="BlockView Board" src="docs/screenshots/board.png" />
      <br>Block View - Board
    </td>
  </tr>
</table>

---

## 二、Key Features

### 📝 Text Formatting

| Feature | Description |
|---------|-------------|
| Bold, Italic, Strikethrough, Subscript, Superscript, Code | Common text formatting operations |
| Background Highlights | 5 colors: Red/Yellow/Blue/Green/Purple |
| Text Colors | Multiple colors available |
| Colorful Underlines | 5 colors available |
| File Links | Quick file link insertion |

**Usage**: Select text → Toolbar auto-pops up → Click button

---

### 📊 Task Progress Tracking

| Feature | Description |
|---------|-------------|
| Display Styles | Mini Circle, Dot Matrix, Status Cursor, Progress Capsule, Step Progress |
| Nested Statistics | Supports 1-N level nesting, only counts leaf tasks |
| Status Recognition | Auto-detects todo/doing/done/waiting/in-review etc. |
| Custom Colors | Customizable status colors |
| 🎆 Achievement Fireworks | Fireworks when all tasks complete (toggleable) |

**Basic Usage**:
```markdown
- My Project {{renderer :taskprogress}}
  - Task 1 #task status:: todo
  - Task 2 #task status:: doing
  - Task 3 #task status:: done
```

---

### 🔥 Heatmap

| Feature | Description |
|---------|-------------|
| Views | year / month / week three views |
| Query | Supports tag / page / property three query methods |
| Color Scheme | Min/max gradient colors and two calculation formulas |

**Basic Usage**:
```markdown
{{renderer :heatmap, month, tag=work}}
{{renderer :heatmap, view=year, tag=work}}
{{renderer :heatmap, view=month, page=My Page}}
```

---

### 📋 Block View 🆕

| Feature | Description |
|---------|-------------|
| View Types | List, Table, Gallery, Board |
| Theme Support | Default, Notion, Linear, Dark, Gradient, Tana, Custom |
| Custom Themes | Independent color, border, radius configuration per view |
| View Switcher | Show/hide toggle |

**Basic Usage**:
```markdown
{{renderer :block-view}}
{{renderer :block-view, view=table}}
{{renderer :block-view, view=gallery}}
{{renderer :block-view, view=board}}
```

**Specify Theme**:
```markdown
{{renderer :block-view, theme=notion}}
{{renderer :block-view, view=table, theme=linear}}
```

**Parameters**:
| Parameter | Description | Values |
|-----------|-------------|--------|
| view | View Type | list, table, gallery, board |
| theme | Theme Style | default, notion, linear, dark, gradient, tana, custom |
| hideBar | Hide Switcher | true, false |

---

### 📝 Summary Generator (Summary) ⚠️

| Feature | Description |
|---------|-------------|
| Summary Types | Weekly, Monthly, Yearly, Custom time range |
| Templates | GTD Work Review, Minimal Dashboard, Bullet Journal, OKR Review, Study Summary |
| AI Enhancement | OpenAI/Claude support |

> ⚠️ Summary feature is under development and currently unavailable.

---

### 🎛️ Toolbar

| Feature | Description |
|---------|-------------|
| Auto-popup | Toolbar appears when text is selected |
| Shortcuts | Customizable keyboard shortcuts |
| Internationalization | Uses emoji icons with multi-language support |

---

### ⚙️ Theme & Multi-language

| Feature | Description |
|---------|-------------|
| Theme | light / dark auto-follows Logseq |
| Languages | Chinese, English, Japanese |
| Extensibility | CSS override, language file extension |

---

### 🎨 CSS Customization

Override default styles via Logseq CSS:

```css
/* Custom toolbar styles */
.ltt-toolbar {
  --ltt-bg: #ffffff;
  --ltt-border: #e5e7eb;
}

/* Custom task progress colors */
.ltt-task-progress {
  --ltt-done-color: #22c55e;
}
```

---

## 三、Installation

### Method 1: Plugin Marketplace (Recommended)

1. Logseq → Menu → **Plugins**
2. Search `logseq-text-toolkit` → **Install**

### Method 2: GitHub URL

1. Logseq → Menu → **Plugins**
2. Click **Load plugin from URL**
3. Enter: `https://github.com/duiliuliu/logseq-text-toolkit/`

---

## 四、Detailed Usage Guide

### 4.1 Text Formatting

Select text → Toolbar auto-pops up → Click button

**Color Options**:
- 🔴 Red
- 🟡 Yellow
- 🔵 Blue
- 🟢 Green
- 🟣 Purple

### 4.2 Task Progress Tracking

#### Supported Task Statuses

| Status | Label | Description |
|--------|-------|-------------|
| todo | To Do | Tasks not yet started |
| doing | In Progress | Currently executing tasks |
| in-review | In Review | Tasks awaiting review |
| done | Done | Completed tasks |
| waiting | Waiting | Tasks waiting for other tasks |
| canceled | Canceled | Canceled tasks |

#### Display Style Parameters

| Style | Command Parameter |
|-------|-----------------|
| Mini Circle | mini-circle |
| Dot Matrix | dot-matrix |
| Status Cursor | status-cursor |
| Progress Capsule | progress-capsule |
| Step Progress | step-progress |

#### Nested Levels

| Nested Level | Description |
|--------------|-------------|
| Current Level Only | Only count direct subtasks |
| 2 Levels Deep | Count current and next level |
| 3 Levels Deep | Count current and two levels down |
| All Levels | Count all nested levels |

### 4.3 Heatmap

#### View Types

| View | Parameter | Description |
|------|-----------|-------------|
| Year View | year | Display full year heatmap |
| Month View | month | Display single month heatmap |
| Week View | week | Display single week heatmap |

#### Query Methods

| Query Type | Parameter Format | Example |
|------------|------------------|---------|
| Tag Query | tag=tagname | tag=work |
| Page Query | page=pagename | page=My Page |
| Property Query | property=property::value | property=category::work |

### 4.4 Block View

#### Theme Styles

| Theme | Features | Use Case |
|-------|----------|----------|
| Default | Clean and clear | General use |
| Notion | Borderless, minimalist |追求简洁 |
| Linear | Tech-focused | Programmers |
| Dark | Dark color scheme | Night use |
| Gradient | Gradient effects | Aesthetic appeal |
| Tana | Soft colors | Fresh style |
| Custom | Fully customizable | Custom needs |

### 4.5 Toolbar Configuration

Configure toolbar elements via JSON in Settings:

```json
[
  {
    "id": "format-bold",
    "label": "Bold",
    "icon": "**",
    "invoke": "editor/insert-batch-edit",
    "invokeParams": {
      "texts": [["**{{selected}}**", "{{selected}}**"]]
    }
  }
]
```

**Configuration Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| label | string | Button display name |
| icon | string | Button icon (supports emoji) |
| invoke | string | Logseq command to invoke |
| invokeParams | object | Command parameters |
| hidden | boolean | Hide button |

---

## 五、Development Guide

### Development Environment

```bash
npm install          # Install dependencies
npm run dev          # Development server (http://localhost:3000)
npm run build        # Build production version
npm run test         # Test mode
```

### Project Structure

```
src/
├── components/       # React components
│   ├── Toolbar/     # Toolbar component
│   ├── TaskProgress/# Task Progress component
│   ├── Heatmap/     # Heatmap component
│   ├── BlockView/   # Block View component
│   ├── Summary/     # Summary component
│   └── SettingsModal/# Settings panel
├── lib/            # Business logic
│   ├── blockView/  # Block View logic
│   ├── summary/    # Summary logic
│   └── render/     # Renderer related
├── settings/       # Settings management
├── translations/    # Internationalization files
└── utils/          # Utility functions
```

### Adding New Languages

1. Create a new JSON file in `src/translations/` (e.g., `de.json`)
2. Add new language type in `translations.ts`
3. Import and register the new language in `i18n.ts`

### CSS Variables

| Variable | Description |
|----------|-------------|
| --ltt-bg | Background color |
| --ltt-border | Border color |
| --ltt-text | Text color |
| --ltt-primary | Primary color |
| --ltt-hover | Hover color |

---

## 六、License

MIT
