# Logseq Text Toolkit ✨

Make your Logseq notes more fun and powerful!

👉 [Online Preview](https://duiliuliu.github.io/logseq-text-toolkit/) | [Experimental Page](https://duiliuliu.github.io/logseq-text-toolkit/dev/) | [User Guide](docs/USER_GUIDE.en.md)

---

## 🚀 Quick Start

```markdown
{{renderer :block-view, view=table}}
{{renderer :taskprogress}}
{{renderer :heatmap, month, tag=work}}
```

**How to use**: Enter the macro command in any block

---

## 🎯 Key Features

### 📋 Block View
Multi-view display for Logseq content: List, Table, Gallery, Board

![Block View Table](docs/screenshots/tableView.png)

| Feature | Description |
|---------|-------------|
| **Multiple Views** | List 📋 / Table 📊 / Gallery 🖼️ / Board 📋 |
| **7 Themes** | Default, Notion, Linear, Dark, Gradient, Tana, Custom |
| **Theme Switching** | Click view switcher to change instantly |
| **Custom Config** | Independent color, border, radius settings per view |

**Usage Examples**:
```markdown
{{renderer :block-view}}
{{renderer :block-view, view=table}}
{{renderer :block-view, view=gallery}}
{{renderer :block-view, view=board, theme=notion}}
```

### 📊 Task Progress Tracking
Auto-track task completion with various display styles

| Style | Command Parameter |
|-------|-----------------|
| Mini Circle | `mini-circle` |
| Dot Matrix | `dot-matrix` |
| Status Cursor | `status-cursor` |
| Progress Capsule | `progress-capsule` |
| Step Progress | `step-progress` |

**Usage Example**:
```markdown
- Project {{renderer :taskprogress}}
  - Task 1 #task status:: todo
  - Task 2 #task status:: doing
  - Task 3 #task status:: done
```

### 🔥 Heatmap
Visualize task/activity distribution with year/month/week views

**Usage Examples**:
```markdown
{{renderer :heatmap, view=year, tag=work}}
{{renderer :heatmap, view=month, page=MyPage}}
```

### 🖼️ Gallery View
Card-based content display

![Gallery View](docs/screenshots/gallery.png)

### 📋 Board View
Kanban-style column display for task management

![Board View](docs/screenshots/board.png)

### 📝 Text Formatting
Auto-popup toolbar when selecting text, supports bold, italic, highlight, colors, etc.

---

## ⚙️ Installation

### Method 1: Plugin Marketplace (Recommended)
1. Logseq → Menu → **Plugins**
2. Search `logseq-text-toolkit` → **Install**

### Method 2: GitHub URL
```
https://github.com/duiliuliu/logseq-text-toolkit/
```

---

## 🎨 Theme & Multi-language

| Setting | Options |
|---------|---------|
| **Theme** | Follow System / Light / Dark |
| **Language** | Chinese, English, Japanese |
| **Toolbar** | Custom buttons and shortcuts supported |

---

## 📖 Detailed Documentation

👉 [English User Guide](docs/USER_GUIDE.en.md) - Complete feature details and configuration guide

---

## 📝 Block View Parameters

| Parameter | Description | Values |
|-----------|-------------|--------|
| `view` | View Type | `list`, `table`, `gallery`, `board` |
| `theme` | Theme Style | `default`, `notion`, `linear`, `dark`, `gradient`, `tana`, `custom` |
| `hideBar` | Hide Switcher | `true`, `false` |

---

## 🛠️ Development

```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Build
```

---

## 📄 License

MIT
