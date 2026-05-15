# Logseq Text Toolkit User Guide

[English Version](USER_GUIDE.en.md) | [返回 README](../README.en.md)

---

## Table of Contents

1. [Text Formatting](#1-text-formatting)
2. [Task Progress Tracking](#2-task-progress-tracking)
3. [Heatmap](#3-heatmap)
4. [Block View](#4-block-view)
5. [Summary Generator](#5-summary-generator)
6. [Toolbar Configuration](#6-toolbar-configuration)
7. [Themes & Multi-language](#7-themes--multi-language)
8. [FAQ](#8-faq)

---

## 1. Text Formatting

### 1.1 Basic Operations

The text formatting feature auto-pops up a toolbar when you select text, supporting the following operations:

| Feature | Description | Usage |
|---------|-------------|-------|
| Bold | Make text bold | Select text → Click ** |
| Italic | Make text italic | Select text → Click * |
| Strikethrough | Add strikethrough effect | Select text → Click ~~ |
| Highlight | Background highlight | Select text → Select color button |
| Text Color | Change text color | Select text → Select color button |
| Underline | Add colorful underline | Select text → Select color button |
| Code | Inline code formatting | Select text → Click ` |
| File Link | Quick file link insertion | Click 📎 button |

### 1.2 Toolbar Tips

- **Shortcut Support**: Toolbar supports customizable shortcuts in settings
- **Internationalized Icons**: Toolbar buttons use emoji icons with multi-language support
- **Auto-popup**: Toolbar automatically appears at cursor position when text is selected

### 1.3 Color Options

Highlight, text color, and colorful underline support the following colors:

- 🔴 Red
- 🟡 Yellow
- 🔵 Blue
- 🟢 Green
- 🟣 Purple

---

## 2. Task Progress Tracking

### 2.1 Basic Usage

Use the task progress renderer in any block:

```markdown
- My Project {{renderer :taskprogress}}
  - Task 1 #task status:: todo
  - Task 2 #task status:: doing
  - Task 3 #task status:: done
```

### 2.2 Supported Task Statuses

| Status | Label | Description |
|--------|-------|-------------|
| todo | To Do | Tasks not yet started |
| doing | In Progress | Currently executing tasks |
| in-review | In Review | Tasks awaiting review |
| done | Done | Completed tasks |
| waiting | Waiting | Tasks waiting for other tasks |
| canceled | Canceled | Canceled tasks |

### 2.3 Display Styles

Task progress supports multiple display styles:

| Style | Description | Command Parameter |
|-------|-------------|-------------------|
| Mini Circle | Mini circular progress | `mini-circle` |
| Dot Matrix | Dot grid progress | `dot-matrix` |
| Status Cursor | Status cursor indicator | `status-cursor` |
| Progress Capsule | Progress capsule | `progress-capsule` |
| Step Progress | Step-by-step progress | `step-progress` |

**Specify style example**:
```markdown
{{renderer :taskprogress, step-progress}}
{{renderer :taskprogress, display=step-progress, size=small}}
```

### 2.4 Nested Statistics

Task progress supports nested level statistics:

| Nested Level | Description |
|--------------|-------------|
| Current Level Only | Only count direct subtasks |
| 2 Levels Deep | Count current and next level |
| 3 Levels Deep | Count current and two levels down |
| All Levels | Count all nested levels |

**Advanced Settings**:
- **Count Only Leaf Tasks**: When enabled, only count tasks without subtasks
- **Show Nesting Indicator**: Display task nesting depth indicator

### 2.5 Label Format

Task progress supports multiple label formats:

| Format | Example | Description |
|--------|---------|-------------|
| Fraction | 10/20 | Shows completed/total |
| Percentage | 50% | Shows completion percentage |
| Both | 10/20 50% | Shows both fraction and percentage |

### 2.6 Achievement Fireworks

Enable "Fireworks on Complete All Tasks" option for a dazzling firework effect when all tasks are completed.

### 2.7 Custom Colors

Customize status display colors in settings:

```markdown
Status Color Settings:
- To Do: Gray tones
- In Progress: Blue tones
- Done: Green tones
- In Review: Yellow tones
- Waiting: Orange tones
- Canceled: Red tones
```

---

## 3. Heatmap

### 3.1 Basic Usage

```markdown
{{renderer :heatmap, month, tag=work}}
```

### 3.2 View Types

| View | Parameter | Description |
|------|-----------|-------------|
| Year View | `year` | Display full year heatmap |
| Month View | `month` | Display single month heatmap |
| Week View | `week` | Display single week heatmap |

### 3.3 Query Methods

| Query Type | Parameter Format | Example |
|------------|------------------|---------|
| Tag Query | `tag=tagname` | `tag=work` |
| Page Query | `page=pagename` | `page=My Page` |
| Property Query | `property=property::value` | `property=category::work` |

### 3.4 Parameter Combination Examples

```markdown
{{renderer :heatmap, view=year, tag=work}}
{{renderer :heatmap, view=month, page=My Page}}
{{renderer :heatmap, view=week, property=category::work, week=20, year=2026}}
```

### 3.5 Color Scheme

Heatmap supports custom color schemes:

- **Min Color**: Color when data is 0
- **Max Color**: Color when data is maximum
- **Color Formula**:
  - Simple Mode: Linear gradient
  - Weighted Mode: Non-linear weighted calculation

### 3.6 Page Auto-creation (In Development)

Configure automatic monthly/weekly summary page creation:

- **Page Name Template**: Customize generated page name format
- **Logseq Template**: Select template for content generation

---

## 4. Block View

### 4.1 Introduction

Block View is a powerful feature that allows you to display Logseq block content in multiple view formats.

**Supported View Types**:
- 📋 **List View**: Traditional list display
- 📊 **Table View**: Table format display
- 🖼️ **Gallery View**: Card gallery display
- 📋 **Board View**: Kanban column display

### 4.2 Basic Usage

```markdown
{{renderer :block-view}}
```

Specify view type:
```markdown
{{renderer :block-view, view=table}}
{{renderer :block-view, view=gallery}}
{{renderer :block-view, view=board}}
```

### 4.3 Theme Support

Block View supports multiple preset themes:

| Theme | Description | Features |
|-------|-------------|----------|
| Default | Default theme | Clean and clear |
| Notion | Notion style | Notion-like minimalist style |
| Linear | Linear style | Tech-focused dark theme |
| Dark | Dark theme | Full dark color scheme |
| Gradient | Gradient theme | Gradient color design |
| Tana | Tana style | Soft Tana-like colors |
| Custom | Custom theme | User-defined color configuration |

**Specify theme example**:
```markdown
{{renderer :block-view, theme=notion}}
{{renderer :block-view, view=table, theme=linear}}
```

### 4.4 View Switcher Bar

You can show or hide the view switcher bar:

```markdown
{{renderer :block-view, hideBar=true}}
```

- `hideBar=true`: Hide switcher, use default view
- `hideBar=false`: Show switcher (default)

### 4.5 Custom Theme Configuration

Configure custom themes in Settings → Block View:

#### Table View

| Config Item | Description |
|-------------|-------------|
| Border Color | Table border color |
| Header Background | Header cell background color |
| Header Text Color | Header text color |
| Cell Text Color | Table content text color |
| Header Border Color | Border color between header and other rows |
| Header Height | Header row height |
| Row Background | Data row background color |
| Row Hover Background | Row background on mouse hover |
| Row Border Color | Border color between rows |
| Cell Padding | Text-to-border distance in cells |
| Table Border Radius | Corner roundness of the table |

#### Gallery View

| Config Item | Description |
|-------------|-------------|
| Border Color | Card border color |
| Card Background | Card background color |
| Card Hover Background | Card background on mouse hover |
| Header Border Color | Title area border color |
| Header Background | Title area background color |
| Header Text Color | Title text color |
| Card Text Color | Card content text color |
| Card Border Radius | Corner roundness of cards |
| Card Shadow | Card shadow effect |

#### Board View

| Config Item | Description |
|-------------|-------------|
| Border Color | Column border color |
| Column Background | Column background color |
| Column Hover Background | Column background on mouse hover |
| Header Background | Column title background color |
| Header Text Color | Column title text color |
| Card Background | Card background color |
| Card Text Color | Card content text color |
| Card Border Color | Card border color |
| Card Border Radius | Card corner roundness |

### 4.6 Parameter Quick Reference

| Parameter | Description | Values |
|-----------|-------------|--------|
| view | View Type | `list`, `table`, `gallery`, `board` |
| theme | Theme Style | `default`, `notion`, `linear`, `dark`, `gradient`, `tana`, `custom` |
| hideBar | Hide Switcher | `true`, `false` |

---

## 5. Summary Generator

> ⚠️ **Feature under development, currently unavailable**

### 5.1 Introduction

The Summary Generator feature helps you automatically generate weekly, monthly, yearly, and other summary documents.

### 5.2 Planned Features

#### Summary Types
| Type | Description |
|------|-------------|
| Weekly Summary | Generate weekly work/study summary |
| Monthly Summary | Generate monthly summary report |
| Yearly Summary | Generate yearly summary |
| Custom Time | Specify any time range |

#### Template Types
| Template | Description |
|----------|-------------|
| GTD Work Review | Work review based on GTD methodology |
| Minimal Dashboard | Clean data dashboard format |
| Bullet Journal | Bullet Journal style log |
| OKR Review | OKR objectives and key results review |
| Study Summary | Summary suitable for students and knowledge workers |

#### AI Enhancement
- OpenAI API support
- Claude API support
- Custom prompt templates

### 5.3 Usage (After Development Complete)

```markdown
{{renderer :summary}}
```

Or configure default template and summary type in settings.

---

## 6. Toolbar Configuration

### 6.1 Basic Configuration

Toolbar buttons can be configured via JSON format:

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

### 6.2 Configuration Field Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| label | string | Yes | Button display name |
| icon | string | Yes | Button icon (supports emoji) |
| invoke | string | Yes | Logseq command to invoke |
| invokeParams | object | Yes | Command parameters |
| hidden | boolean | No | Hide button |
| binding | string | No | Shortcut key binding (in development) |
| subItems | array | No | Grouped sub-elements |

### 6.3 Common Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `editor/insert-batch-edit` | Batch edit insert | Format text |
| `editor/insert-space` | Insert space | Adjust formatting |
| `page/insert-file-link` | Insert file link | Add file reference |

### 6.4 Reset Toolbar

If configuration goes wrong, you can use "Reset to Default" option to restore default configuration.

---

## 7. Themes & Multi-language

### 7.1 Theme Settings

The plugin supports the following theme settings:

| Option | Description |
|--------|-------------|
| Follow System | Auto-follow Logseq theme settings |
| Light Mode | Force light theme |
| Dark Mode | Force dark theme |

### 7.2 Language Settings

Supports the following languages:

| Language | Option Name |
|----------|------------|
| 中文 | 简体中文 |
| English | English |
| 日本語 | 日本語 |

You can choose "Follow System" to automatically match Logseq's language settings.

### 7.3 CSS Customization

You can override plugin default styles via Logseq CSS:

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

## 8. FAQ

### Q1: Toolbar not popping up?
**A**: Please make sure you've selected text content; the toolbar only auto-pops up when text is selected.

### Q2: Task progress not displaying?
**A**: Check if tasks correctly use the `#task` tag and `status::` property.

### Q3: Block View theme not taking effect?
**A**: Make sure the correct view type and theme are selected in settings, then refresh the page.

### Q4: How to reset all settings?
**A**: Each Tab in the settings panel has a "Reset to Default" button to independently reset settings for each functional area.

### Q5: Which Logseq versions are supported?
**A**: It is recommended to use the latest version of Logseq for best compatibility and latest features.

---

## Get Help

- **GitHub Issues**: [Submit bug reports](https://github.com/duiliuliu/logseq-text-toolkit/issues)
- **Feature Suggestions**: Welcome to submit feature suggestions in GitHub Issues
- **Community Discussion**: Welcome to join the discussion

---

*Last updated: 2026-04-25*
