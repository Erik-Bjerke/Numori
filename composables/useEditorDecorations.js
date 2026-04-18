import { Decoration, WidgetType, EditorView } from '@codemirror/view'
import { StateField, StateEffect } from '@codemirror/state'
import { highlightCode } from '~/composables/useCodeHighlight'

// --- Widget classes ---

export class InlineResultWidget extends WidgetType {
  constructor(text, className, padText) {
    super()
    this.text = text
    this.className = className
    this.padText = padText
  }
  toDOM() {
    const wrapper = document.createElement('span')
    const pad = document.createElement('span')
    pad.className = 'numori-inline-pad'
    pad.textContent = this.padText
    wrapper.appendChild(pad)
    const result = document.createElement('span')
    result.className = this.className
    result.textContent = this.text
    wrapper.appendChild(result)
    return wrapper
  }
  eq(other) {
    return (
      this.text === other.text &&
      this.className === other.className &&
      this.padText === other.padText
    )
  }
  ignoreEvent() {
    return false
  }
}

export class MdPrefixWidget extends WidgetType {
  constructor(content, className, lineNumber) {
    super()
    this.content = content
    this.className = className
    this.lineNumber = lineNumber ?? -1
  }
  toDOM() {
    const span = document.createElement('span')
    span.className = this.className
    span.textContent = this.content
    if (this.lineNumber >= 0) {
      span.dataset.line = String(this.lineNumber)
    }
    return span
  }
  eq(other) {
    return (
      this.content === other.content &&
      this.className === other.className &&
      this.lineNumber === other.lineNumber
    )
  }
  ignoreEvent() {
    return false
  }
}

export class MdCodeBlockFenceWidget extends WidgetType {
  constructor(lang) {
    super()
    this.lang = lang
  }
  toDOM() {
    const span = document.createElement('span')
    span.className = 'numori-md-code-fence-label'
    span.textContent = this.lang || ''
    return span
  }
  eq(other) {
    return this.lang === other.lang
  }
  ignoreEvent() {
    return false
  }
}

export class MdCodeBlockCopyWidget extends WidgetType {
  constructor(code) {
    super()
    this.code = code
  }
  toDOM() {
    const btn = document.createElement('button')
    btn.className = 'numori-md-code-copy-btn'
    btn.setAttribute('aria-label', 'Copy code')
    btn.title = 'Copy code'
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      navigator.clipboard.writeText(this.code).catch(() => {})
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
      btn.classList.add('numori-md-code-copy-btn--copied')
      setTimeout(() => {
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
        btn.classList.remove('numori-md-code-copy-btn--copied')
      }, 1500)
    })
    return btn
  }
  eq(other) {
    return this.code === other.code
  }
  ignoreEvent() {
    return false
  }
}

// --- State effects & fields ---

export const setInlineResults = StateEffect.define()
export const setMdDecorations = StateEffect.define()

export const inlineResultField = StateField.define({
  create() {
    return Decoration.none
  },
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setInlineResults)) return e.value
    }
    return decos.map(tr.changes)
  },
  provide: (f) => EditorView.decorations.from(f),
})

export const mdPreviewField = StateField.define({
  create() {
    return Decoration.none
  },
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setMdDecorations)) return e.value
    }
    return decos.map(tr.changes)
  },
  provide: (f) => EditorView.decorations.from(f),
})

// --- Inline markdown decoration helper ---

export const applyInlineMarkdown = (text, lineFrom, widgets) => {
  const spans = []

  const codeRe = /`([^`]+)`/g
  let m
  while ((m = codeRe.exec(text)) !== null) {
    spans.push({ from: m.index, to: m.index + m[0].length, type: 'code', openLen: 1, closeLen: 1 })
  }

  const boldRe = /\*\*(.+?)\*\*/g
  while ((m = boldRe.exec(text)) !== null) {
    spans.push({ from: m.index, to: m.index + m[0].length, type: 'bold', openLen: 2, closeLen: 2 })
  }

  const strikeRe = /~~(.+?)~~/g
  while ((m = strikeRe.exec(text)) !== null) {
    spans.push({
      from: m.index,
      to: m.index + m[0].length,
      type: 'strike',
      openLen: 2,
      closeLen: 2,
    })
  }

  const italicRe = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g
  while ((m = italicRe.exec(text)) !== null) {
    spans.push({
      from: m.index,
      to: m.index + m[0].length,
      type: 'italic',
      openLen: 1,
      closeLen: 1,
    })
  }

  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g
  while ((m = linkRe.exec(text)) !== null) {
    spans.push({
      from: m.index,
      to: m.index + m[0].length,
      type: 'link',
      linkText: m[1],
      linkUrl: m[2],
      openLen: 1,
    })
  }

  spans.sort((a, b) => a.from - b.from)
  const used = []
  for (const s of spans) {
    if (used.some((u) => s.from < u.to && s.to > u.from)) continue
    used.push(s)
  }

  const classMap = {
    bold: 'numori-md-bold',
    italic: 'numori-md-italic',
    strike: 'numori-md-strike',
    code: 'numori-md-inline-code',
  }

  for (const s of used) {
    if (s.type === 'link') {
      widgets.push(
        Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(
          lineFrom + s.from,
          lineFrom + s.from + 1,
        ),
      )
      const textEnd = s.from + 1 + s.linkText.length
      widgets.push(
        Decoration.mark({
          class: 'numori-md-link',
          attributes: { title: s.linkUrl, 'data-href': s.linkUrl },
        }).range(lineFrom + s.from + 1, lineFrom + textEnd),
      )
      widgets.push(
        Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(
          lineFrom + textEnd,
          lineFrom + s.to,
        ),
      )
    } else {
      const cls = classMap[s.type]
      widgets.push(
        Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(
          lineFrom + s.from,
          lineFrom + s.from + s.openLen,
        ),
      )
      widgets.push(
        Decoration.mark({ class: cls }).range(
          lineFrom + s.from + s.openLen,
          lineFrom + s.to - s.closeLen,
        ),
      )
      widgets.push(
        Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(
          lineFrom + s.to - s.closeLen,
          lineFrom + s.to,
        ),
      )
    }
  }
}

// --- Build inline result decorations ---

export const buildInlineDecorations = (
  view,
  { showInline, displayLines, inlineAlign, localePreferences, editorFontSize },
) => {
  if (!showInline) return Decoration.none
  const lines = displayLines
  if (!lines.length) return Decoration.none

  const doc = view.state.doc
  const docLines = doc.lines
  const maxLine = Math.min(lines.length, docLines)
  const alignRight = (inlineAlign ?? localePreferences?.inlineResultAlign ?? 'left') === 'right'

  let targetCol = 0
  if (alignRight) {
    const scroller = view.scrollDOM
    const gutters = view.dom.querySelector('.cm-gutters')
    const gutterWidth = gutters ? gutters.offsetWidth : 0
    const availableWidth = (scroller ? scroller.clientWidth : 0) - gutterWidth - 16
    const charWidth = editorFontSize * 0.6
    if (charWidth > 0 && availableWidth > 0) targetCol = Math.floor(availableWidth / charWidth)
  }

  const widgets = []
  for (let i = 0; i < maxLine; i++) {
    const line = lines[i]
    if (!line.result && !line.error) continue
    if (line.hideResult) continue

    const docLine = doc.line(i + 1)
    const lineLength = docLine.length
    const resultStr = line.result ? `= ${line.result}` : `⚠ ${line.error}`
    const className = line.result ? 'numori-inline-result' : 'numori-inline-error'

    let padText
    if (alignRight && targetCol > 0) {
      const padCount = Math.max(2, targetCol - lineLength - resultStr.length)
      padText = ' '.repeat(padCount)
    } else {
      padText = '  '
    }

    const widget = Decoration.widget({
      widget: new InlineResultWidget(resultStr, className, padText),
      side: 1,
    })
    widgets.push(widget.range(docLine.to))
  }

  return Decoration.set(widgets)
}

// --- Build markdown preview decorations ---

export const buildMdDecorations = (view, { markdownMode }) => {
  if (markdownMode === 'off') return Decoration.none

  const doc = view.state.doc
  const cursorLine =
    markdownMode === 'edit' ? doc.lineAt(view.state.selection.main.head).number : -1
  const widgets = []

  // First pass: identify fenced code block ranges
  const codeBlockRanges = []
  let fenceStart = null
  let fenceLang = ''
  for (let ln = 1; ln <= doc.lines; ln++) {
    const text = doc.line(ln).text
    const trimmed = text.trim()
    if (fenceStart === null) {
      const fenceMatch = trimmed.match(/^```([\w+#.-]*)$/)
      if (fenceMatch) {
        fenceStart = ln
        fenceLang = fenceMatch[1] || ''
      }
    } else {
      if (trimmed === '```') {
        codeBlockRanges.push({ startLn: fenceStart, endLn: ln, lang: fenceLang })
        fenceStart = null
        fenceLang = ''
      }
    }
  }
  if (fenceStart !== null) {
    codeBlockRanges.push({ startLn: fenceStart, endLn: doc.lines, lang: fenceLang })
  }

  const getCodeBlock = (ln) => codeBlockRanges.find((r) => ln >= r.startLn && ln <= r.endLn)

  // Pre-highlight code blocks
  const codeBlockHighlights = new Map()
  for (const block of codeBlockRanges) {
    const contentStart = block.startLn + 1
    const contentEnd = block.endLn - (doc.line(block.endLn).text.trim() === '```' ? 1 : 0)
    if (contentStart > contentEnd) continue
    const lines = []
    for (let ln = contentStart; ln <= contentEnd; ln++) {
      lines.push(doc.line(ln).text)
    }
    const code = lines.join('\n')
    try {
      const spans = highlightCode(code, block.lang)
      codeBlockHighlights.set(block, spans)
    } catch (e) {
      console.warn('[numori] highlightCode failed:', e)
    }
  }

  // Pre-compute max content line length per code block
  const codeBlockMaxLen = new Map()
  for (const block of codeBlockRanges) {
    const contentStart = block.startLn + 1
    const contentEnd = block.endLn - (doc.line(block.endLn).text.trim() === '```' ? 1 : 0)
    let maxLen = block.lang ? block.lang.length : 0
    for (let ln = contentStart; ln <= contentEnd; ln++) {
      maxLen = Math.max(maxLen, doc.line(ln).text.length)
    }
    codeBlockMaxLen.set(block, maxLen)
  }

  for (let ln = 1; ln <= doc.lines; ln++) {
    const docLine = doc.line(ln)
    const text = docLine.text
    const trimmed = text.trim()

    const codeBlock = getCodeBlock(ln)
    if (codeBlock) {
      if (
        markdownMode === 'edit' &&
        cursorLine >= codeBlock.startLn &&
        cursorLine <= codeBlock.endLn
      )
        continue

      if (ln === codeBlock.startLn) {
        widgets.push(
          Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(docLine.from, docLine.to),
        )
        if (codeBlock.lang) {
          widgets.push(
            Decoration.widget({
              widget: new MdCodeBlockFenceWidget(codeBlock.lang),
              side: 1,
            }).range(docLine.from),
          )
        }
        const contentStartLn = codeBlock.startLn + 1
        const contentEndLn =
          codeBlock.endLn - (doc.line(codeBlock.endLn).text.trim() === '```' ? 1 : 0)
        const codeLines = []
        for (let cl = contentStartLn; cl <= contentEndLn; cl++) {
          codeLines.push(doc.line(cl).text)
        }
        widgets.push(
          Decoration.widget({
            widget: new MdCodeBlockCopyWidget(codeLines.join('\n')),
            side: 1,
          }).range(docLine.from),
        )
        const blockW = (codeBlockMaxLen.get(codeBlock) || 0) + 8
        widgets.push(
          Decoration.line({
            class: 'numori-md-code-block-line numori-md-code-block-first',
            attributes: { style: `width: ${blockW}ch` },
          }).range(docLine.from),
        )
      } else if (ln === codeBlock.endLn && trimmed === '```') {
        widgets.push(
          Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(docLine.from, docLine.to),
        )
        const blockW = (codeBlockMaxLen.get(codeBlock) || 0) + 8
        widgets.push(
          Decoration.line({
            class: 'numori-md-code-block-line numori-md-code-block-last',
            attributes: { style: `width: ${blockW}ch` },
          }).range(docLine.from),
        )
      } else {
        const blockW = (codeBlockMaxLen.get(codeBlock) || 0) + 8
        widgets.push(
          Decoration.line({
            class: 'numori-md-code-block-line',
            attributes: { style: `width: ${blockW}ch` },
          }).range(docLine.from),
        )

        const spans = codeBlockHighlights.get(codeBlock)
        if (spans) {
          const contentStartLn = codeBlock.startLn + 1
          let charOffset = 0
          for (let cl = contentStartLn; cl < ln; cl++) {
            charOffset += doc.line(cl).text.length + 1
          }
          const lineLen = text.length

          for (const span of spans) {
            if (!span.className) continue
            const spanEnd = span.offset + span.text.length
            if (spanEnd <= charOffset || span.offset >= charOffset + lineLen) continue
            const from = Math.max(0, span.offset - charOffset)
            const to = Math.min(lineLen, spanEnd - charOffset)
            if (from >= to) continue
            widgets.push(
              Decoration.mark({
                class: 'numori-hl ' + span.className,
              }).range(docLine.from + from, docLine.from + to),
            )
          }
        }
      }
      continue
    }

    if (!trimmed || ln === cursorLine) continue

    // # Headers
    const headerMatch = trimmed.match(/^(#{1,6})\s(.+)$/)
    if (headerMatch) {
      const hashes = headerMatch[1]
      const prefixLen = text.indexOf(hashes) + hashes.length + 1
      widgets.push(
        Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(
          docLine.from,
          docLine.from + prefixLen,
        ),
      )
      widgets.push(
        Decoration.mark({ class: `numori-md-h${hashes.length}` }).range(
          docLine.from + prefixLen,
          docLine.to,
        ),
      )
      applyInlineMarkdown(text.substring(prefixLen), docLine.from + prefixLen, widgets)
      continue
    }

    // // Comments
    if (trimmed.startsWith('//')) {
      const slashIdx = text.indexOf('//')
      const afterSlash = text.substring(slashIdx + 2)
      const spaceAfter = afterSlash.startsWith(' ') ? 1 : 0
      const prefixEnd = slashIdx + 2 + spaceAfter
      widgets.push(
        Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(
          docLine.from,
          docLine.from + prefixEnd,
        ),
      )
      widgets.push(
        Decoration.mark({ class: 'numori-md-comment' }).range(docLine.from + prefixEnd, docLine.to),
      )
      continue
    }

    // - [x] / - [ ] Checkboxes
    const checkMatch = text.match(/^(\s*)- \[([ x])\]\s(.+)$/)
    if (checkMatch) {
      const indent = checkMatch[1].length
      const checked = checkMatch[2] === 'x'
      const prefixEnd = indent + 6
      widgets.push(
        Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(
          docLine.from,
          docLine.from + prefixEnd,
        ),
      )
      const nestLevel = Math.floor(indent / 2)
      const padStr = '\u2003'.repeat(nestLevel)
      let icon
      if (nestLevel === 0) {
        icon = checked ? '\u25A3\u2009' : '\u25A2\u2009'
      } else {
        icon = checked ? '\u25C9\u2009' : '\u25CB\u2009'
      }
      const iconClass = nestLevel === 0 ? 'numori-md-check-icon' : 'numori-md-check-icon-nested'
      widgets.push(
        Decoration.widget({
          widget: new MdPrefixWidget(padStr + icon, iconClass, ln),
          side: -1,
        }).range(docLine.from + prefixEnd),
      )
      widgets.push(
        Decoration.mark({
          class: checked ? 'numori-md-checked' : 'numori-md-unchecked',
        }).range(docLine.from + prefixEnd, docLine.to),
      )
      applyInlineMarkdown(text.substring(prefixEnd), docLine.from + prefixEnd, widgets)
      continue
    }

    // - List items
    const listMatch = text.match(/^(\s*)- (.+)$/)
    if (listMatch) {
      const indent = listMatch[1].length
      const prefixEnd = indent + 2
      widgets.push(
        Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(
          docLine.from,
          docLine.from + prefixEnd,
        ),
      )
      const nestLevel = Math.floor(indent / 2)
      const bullets = ['\u2022', '\u25E6', '\u25AA', '\u25AB']
      const bullet = bullets[Math.min(nestLevel, bullets.length - 1)]
      const padStr = '\u2003'.repeat(nestLevel)
      widgets.push(
        Decoration.widget({
          widget: new MdPrefixWidget(padStr + bullet + '\u2009', 'numori-md-bullet'),
          side: -1,
        }).range(docLine.from + prefixEnd),
      )
      widgets.push(
        Decoration.mark({ class: 'numori-md-list-item' }).range(
          docLine.from + prefixEnd,
          docLine.to,
        ),
      )
      applyInlineMarkdown(text.substring(prefixEnd), docLine.from + prefixEnd, widgets)
      continue
    }

    // > Blockquotes
    const quoteMatch = trimmed.match(/^>\s?(.+)$/)
    if (quoteMatch) {
      const gtIdx = text.indexOf('>')
      const afterGt = text.substring(gtIdx + 1)
      const spaceAfterGt = afterGt.startsWith(' ') ? 1 : 0
      const prefixEnd = gtIdx + 1 + spaceAfterGt
      widgets.push(
        Decoration.mark({ class: 'numori-md-hidden-syntax' }).range(
          docLine.from,
          docLine.from + prefixEnd,
        ),
      )
      widgets.push(
        Decoration.widget({
          widget: new MdPrefixWidget('\u2503\u2009', 'numori-md-quote-bar'),
          side: -1,
        }).range(docLine.from + prefixEnd),
      )
      widgets.push(
        Decoration.mark({ class: 'numori-md-quote' }).range(docLine.from + prefixEnd, docLine.to),
      )
      continue
    }

    // Inline markdown on plain lines
    applyInlineMarkdown(text, docLine.from, widgets)
  }

  try {
    return Decoration.set(widgets, true)
  } catch (e) {
    console.warn('[numori] Decoration.set failed, falling back to sorted:', e.message)
    widgets.sort((a, b) => a.from - b.from || a.value.startSide - b.value.startSide)
    try {
      return Decoration.set(widgets)
    } catch {
      return Decoration.none
    }
  }
}
