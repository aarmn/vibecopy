# VibeCopy: Code Context at Lightspeed 🚀✨

[![Version](https://img.shields.io/visual-studio-marketplace/v/aarmn.vibecopy?style=flat-square&label=VS%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=aarmn.vibecopy)
[![Open VSX Version](https://img.shields.io/open-vsx/v/aarmn/vibecopy?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/aarmn/vibecopy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/aarmn.vibecopy?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=aarmn.vibecopy)

Tired of the endless copy-paste dance when feeding code context to your AI assistant? Need to quickly bundle multiple files for sharing or documentation?

**Stop the madness. Start the vibe.**

VibeCopy is your slick VS Code sidekick designed to grab the contents of selected files and instantly format them into a clean, structured Markdown block. Perfect for **vibe coding**, prompt engineering, or just getting code out of your editor and into the context you need, *fast*.

---

## ✨ Vibe Check: What Does It Do? ✨

Select one or multiple files in your VS Code explorer, right-click, and VibeCopy magically combines their content into a structured format, ready for action.

*   **Get Context Quicker:** Seamlessly copy code for LLMs like ChatGPT, Claude, Copilot, etc.
*   **Effortless Sharing:** Bundle related files into a single block.
*   **Streamlined Workflow:** No more opening, selecting all, copying, pasting... repeat. Just select, click, done.

---

## 🎬 See It In Action! 🎬

**Web version:**
![web version demo](https://raw.githubusercontent.com/aarmn/vibecopy/main/web-ver.gif)

**Desktop version:**
![desktop version demo](https://raw.githubusercontent.com/aarmn/vibecopy/main/node-ver.gif)

---

## 🚀 Features 🚀

*   **Multi-File Select:** Grab as many files as you need from the Explorer.
*   **Copy to Clipboard (Desktop):** Instantly copies the formatted Markdown to your clipboard. (`VibeCopy: Copy Selected as Markdown`)
*   **Open in Editor (Web & Desktop):** Opens the formatted Markdown in a new, untitled editor tab – perfect for VS Code for the Web or when you want to review/edit before copying. (`VibeCopy: Open Selected as Markdown`)
*   **Smart Formatting:** Each file's content is wrapped in Markdown code fences with the language identifier automatically detected from the file extension.
*   **Clear File Separation:** Files are clearly marked using `--- file: filename.ext ---` separators.
*   **Web Extension Ready:** Works smoothly in VS Code for the Web (with the "Open in Editor" command).

---

## 🛠️ How to Use 🛠️

1.  **Select:** In the VS Code File Explorer, select one or more files (use `Ctrl`/`Cmd` or `Shift` for multiple).
2.  **Right-Click:** Right-click on any of the selected files.
3.  **Choose Your Vibe:**
    *   Click **`VibeCopy: Copy Selected as Markdown`** to copy the formatted content directly to your clipboard (Available on Desktop VS Code only).
    *   Click **`VibeCopy: Open Selected as Markdown`** to open the formatted content in a new Markdown editor tab (Works everywhere!).
4.  **Paste or Profit:** Paste the content into your AI chat, document, or wherever you need it! If you used "Open", the content is ready for review in the new tab.

---

## 📋 Output Format Example 📋

If you select `src/utils.ts` and `styles/main.css`, the "Copy" command gives you this on the clipboard:

```markdown
---
---
file: utils.ts
\`\`\`typescript
// src/utils.ts
export function helperFunction(param: string): string {
  return `Processed: ${param}`;
}
\`\`\`
---

\-\-\-
file: main.css
\`\`\`css
/* styles/main.css */
body {
  font-family: sans-serif;
  color: #333;
}
\`\`\`
---
---
```

The "Open" command opens a new tab with this content:

```markdown
<codes-list>
---
file: utils.ts
```typescript
// src/utils.ts
export function helperFunction(param: string): string {
  return `Processed: ${param}`;
}
```
---

---
file: main.css
```css
/* styles/main.css */
body {
  font-family: sans-serif;
  color: #333;
}
```
---
</codes-list>
```

*(Note the surrounding `<codes-list>` tags added by the "Open" command, potentially useful for specific parsing needs or just structure in the editor).*

---

## 💾 Installation 💾

1.  Open **VS Code**.
2.  Go to the **Extensions** view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3.  Search for `VibeCopy`.
4.  Click **Install**.
5.  Reload VS Code if prompted.

*Alternatively, install from:*

*   [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=aarmn.vibecopy)
*   [Open VSX Registry](https://open-vsx.org/extension/aarmn/vibecopy)

---

## ⌨️ Commands ⌨️

*   **`VibeCopy: Copy Selected as Markdown`** (ID: `vibecopy.copySelectedAsMarkdown`)
    *   Copies formatted content of selected file(s) to the clipboard.
    *   *Context Menu visible only in Desktop VS Code (`when: "!isWeb"`).*
*   **`VibeCopy: Open Selected as Markdown`** (ID: `vibecopy.openSelectedAsMarkdown`)
    *   Opens formatted content of selected file(s) in a new editor tab.
    *   *Context Menu visible in both Desktop and Web VS Code.*

---

## 🌐 Compatibility Note 🌐

*   The **Copy to Clipboard** command relies on VS Code's clipboard API, which is generally restricted in web browser environments for security reasons. Therefore, this command is only enabled in the context menu for Desktop VS Code.
*   The **Open in Editor** command works perfectly in both Desktop and Web versions of VS Code.

---

## 💡 Issues & Contributions 💡

Found a bug? Have a suggestion? Feel free to open an issue on the [GitHub Repository](https://github.com/aarmn/vibecopy/issues)!

Contributions are welcome! Fork the repo and submit a pull request.

---

## 📜 License 📜

[MIT License](https://github.com/aarmn/vibecopy/blob/main/LICENSE) © [aarmn](https://github.com/aarmn)

---

Keep the vibe flowing! Happy Coding! ✨