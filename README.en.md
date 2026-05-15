# Logseq Text Toolkit

A powerful and flexible Logseq plugin designed to enhance text editing and formatting capabilities.

English Version | [中文版本](README.md)

👉 [Online Preview](https://duiliuliu.github.io/logseq-text-toolkit/) | [Experimental Page](https://duiliuliu.github.io/logseq-text-toolkit/dev/)

---

## Showcase

<table>
  <tr>
    <td align="center">
      <img width="280" alt="文本操作" src="https://github.com/user-attachments/assets/4be36305-3d06-443d-8548-a121894cb46d" />
      <br>Text Formatting
    </td>
    <td align="center">
      <img width="280" alt="工具栏" src="https://github.com/user-attachments/assets/ff0810d8-b201-4680-b316-683e03013133" />
      <br>Toolbar
    </td>
      <td align="center">
      <img width="280" alt="任务进度" src="https://github.com/user-attachments/assets/8bb1861d-0b07-4056-a6b4-b5ebd40c5e68" />
      <br>Task Progress
    </td>
  </tr>
  <tr>
    <td align="center">
       <img width="280" alt="toolbar设置面板" src="https://github.com/user-attachments/assets/383a176b-f94a-4f1c-b50a-a4f738d0ac0f" />
      <br>Toolbar Settings
    </td>
      <td align="center">
       <img width="280" alt="taskprogress设置面板" src="https://github.com/user-attachments/assets/73c9eb90-2c4f-4ace-99ea-a9eb510f7bcf" />
      <br>Task Progress Settings
    </td>
    <td align="center">
      <img width="280" alt="heatmap" src="docs/screenshots/heatmap.png" />
      <br>Heatmap
    </td>
  </tr>
</table>

---

## Key Features

### 📝 Text Formatting
| Feature | Description |
|---------|-------------|
| Bold, Italic, Strikethrough, Subscript, Superscript, Code | Common text formatting operations |
| Background Highlights | 5 colors available: Red/Yellow/Blue/Green/Purple |
| Text Colors | Multiple colors available |
| Colorful Underlines | 5 colors available |
| File Links | Quick insert file links |

### 📊 Task Progress Tracking
| Feature | Description |
|---------|-------------|
| Display Styles | Mini Circle, Dot Matrix, Status Cursor, Progress Capsule, Step Progress |
| Nested Statistics | Supports 1-N level nesting, only counts leaf tasks |
| Status Recognition | Auto-detects todo/doing/done/waiting/in-review etc. |
| Custom Colors | Customizable status colors |
| 🎆 Achievement Fireworks | Fireworks when all tasks complete (toggleable) |

### 🔥 Heatmap
| Feature | Description |
|---------|-------------|
| Views | year / month / week |
| Query | tag / page / property |
| Colors | min/max gradient and two formulas |

### 📋 Block View 🆕
| Feature | Description |
|---------|-------------|
| View Types | List, Table, Gallery, Board |
| Theme Support | Default, Notion, Linear, Dark, Gradient, Tana, Custom |
| Custom Themes | Independent color, border, radius configuration per view |
| View Switcher | Show/hide toggle |

**Usage**:
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

### 📝 Summary Generator (Summary) ⚠️ **Currently Unavailable**
| Feature | Description |
|---------|-------------|
| Summary Types | Weekly, Monthly, Yearly, Custom |
| Templates | GTD Work Review, Minimal Dashboard, Bullet Journal, OKR Review, Study Summary |
| AI Enhancement | OpenAI/Claude support |
| Data Analysis | Blocks, Tasks, Pages statistics |

> ⚠️ Summary feature is under development and currently unavailable.

### 🎛️ Toolbar
- Auto-popup when text is selected
- Customizable shortcuts
- Internationalized button icons (✨/📝/🎨 etc.)

### ⚙️ Theme & Multi-language
| Feature | Description |
|---------|-------------|
| Theme | Light/dark auto-follows Logseq |
| Languages | Chinese, English, Japanese |
| Extensibility | CSS override, language file extension |

---

## Installation

### Method 1: Plugin Marketplace (Recommended)
1. Logseq → Menu → **Plugins**
2. Search `logseq-text-toolkit` → **Install**

### Method 2: GitHub URL
1. Logseq → Menu → **Plugins**
2. Click **Load plugin from URL**
3. Enter: `https://github.com/duiliuliu/logseq-text-toolkit/`

---

## Usage

### Text Formatting
Select text → Toolbar auto-pops up → Click button

### Task Progress Tracking
```markdown
- My Project {{renderer :taskprogress}}
  - Task 1 #task status:: todo
  - Task 2 #task status:: doing
  - Task 3 #task status:: done
```

**Specify display style**:
```markdown
{{renderer :taskprogress, step-progress}}
{{renderer :taskprogress, display=step-progress, size=small}}
```
Supported styles: mini-circle, dot-matrix, status-cursor, progress-capsule, step-progress

### Heatmap
```markdown
{{renderer :heatmap, month, tag=work}}
```
More examples (recommended key=value):
```markdown
{{renderer :heatmap, view=year, tag=work}}
{{renderer :heatmap, view=month, page=My Page}}
{{renderer :heatmap, view=week, property=category::work, week=20, year=2026}}
```

### Block View
```markdown
{{renderer :block-view}}
{{renderer :block-view, view=table}}
{{renderer :block-view, view=gallery}}
{{renderer :block-view, view=board}}
```

**Parameters**:
| Parameter | Description | Values |
|-----------|-------------|--------|
| view | View Type | list, table, gallery, board |
| theme | Theme Style | default, notion, linear, dark, gradient, tana, custom |
| hideBar | Hide Switcher | true, false |

---

## Configuration Guide

### Language Settings
| Option | Description |
|--------|-------------|
| System | Follow Logseq language |
| Chinese | Chinese interface |
| English | English interface |
| Japanese | Japanese interface |

Language files are located in `dist/translations/` directory.

### CSS Customization
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

### Toolbar Configuration
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
| binding | string | Shortcut key binding (in development) |
| subItems | array | Group with multiple sub-items |

---

## User Guide

For detailed operation instructions, please refer to:
- [中文用户手册](docs/USER_GUIDE.md)
- [English User Guide](docs/USER_GUIDE.en.md)

---

## Development

```bash
npm install          # Install dependencies
npm run dev          # Development server (http://localhost:3000)
npm run build        # Build
npm run test         # Test mode
```

---

## License

MIT
