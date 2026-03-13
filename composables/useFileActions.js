/**
 * Composable for file-related actions: export, import, duplicate, copy, print.
 * Works with the note objects from useNotes.
 */
export const useFileActions = () => {

  /**
   * Trigger a browser file download with the given content.
   */
  const downloadFile = (filename, content, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Sanitize a note title into a safe filename.
   */
  const sanitizeFilename = (title) => {
    return (title || 'untitled')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
      .slice(0, 80) || 'untitled'
  }

  /**
   * Merge note content lines with calculator results.
   * Each line gets " = result" appended when a result exists.
   * @param {string} content - The raw note content
   * @param {Function} evaluateLines - The calculator's evaluateLines function
   * @returns {string} - Content with results appended to each line
   */
  const mergeContentWithResults = (content, evaluateLines) => {
    if (!content || !evaluateLines) return content || ''
    const lines = content.split('\n')
    const results = evaluateLines(lines)
    return lines.map((line, i) => {
      const r = results[i]
      if (r && r.result) return `${line}  = ${r.result}`
      return line
    }).join('\n')
  }

  /**
   * Export a single note as a .txt file (plain content).
   * @param {Object} note
   * @param {Function|null} evaluateLines - pass to include results
   */
  const exportNoteAsText = (note, evaluateLines = null) => {
    if (!note) return false
    const filename = `${sanitizeFilename(note.title)}.txt`
    const content = evaluateLines
      ? mergeContentWithResults(note.content, evaluateLines)
      : (note.content || '')
    downloadFile(filename, content, 'text/plain')
    return true
  }

  /**
   * Export a single note as a .json file (full metadata).
   */
  const exportNoteAsJson = (note) => {
    if (!note) return false
    const filename = `${sanitizeFilename(note.title)}.json`
    const data = {
      title: note.title,
      description: note.description,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }
    downloadFile(filename, JSON.stringify(data, null, 2), 'application/json')
    return true
  }

  /**
   * Export all notes as a single .json file.
   */
  const exportAllNotes = (notes) => {
    if (!notes || notes.length === 0) return false
    const data = notes.map(n => ({
      title: n.title,
      description: n.description,
      content: n.content,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }))
    downloadFile('calcnotes_backup.json', JSON.stringify(data, null, 2), 'application/json')
    return true
  }

  /**
   * Export a single note as a .md (markdown) file.
   * @param {Object} note
   * @param {Function|null} evaluateLines - pass to include results
   */
  const exportNoteAsMarkdown = (note, evaluateLines = null) => {
    if (!note) return false
    const filename = `${sanitizeFilename(note.title)}.md`
    const body = evaluateLines
      ? mergeContentWithResults(note.content, evaluateLines)
      : (note.content || '')
    const header = `# ${note.title}\n\n`
    downloadFile(filename, header + body, 'text/markdown')
    return true
  }

  /**
   * Export a single note as a PDF via the browser's print dialog.
   * @param {Object} note
   * @param {Function|null} evaluateLines - pass to include results
   */
  const exportNoteAsPdf = (note, evaluateLines = null) => {
    if (!note) return false
    const body = evaluateLines
      ? mergeContentWithResults(note.content, evaluateLines)
      : (note.content || '')
    const escaped = body.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const printWindow = window.open('', '_blank')
    if (!printWindow) return false
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${note.title || 'Note'}</title>
<style>
  body { font-family: monospace; white-space: pre-wrap; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }
  @media print { body { padding: 0; } }
</style>
</head><body>${escaped}</body></html>`)
    printWindow.document.close()
    printWindow.print()
    return true
  }

  /**
   * Open a .txt or .md file as a new note.
   * Returns a promise that resolves with { title, description, content }.
   */
  const openFile = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.txt,.md'

      input.onchange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return reject(new Error('No file selected'))

        try {
          const text = await file.text()
          let title = file.name.replace(/\.[^.]+$/, '') || 'Opened Note'
          let content = text

          // For markdown files, extract title from first # heading if present
          if (file.name.endsWith('.md')) {
            const headerMatch = text.match(/^#\s+(.+)\n\n?/)
            if (headerMatch) {
              title = headerMatch[1].trim()
              content = text.slice(headerMatch[0].length)
            }
          }

          resolve({ title, description: '', content })
        } catch (err) {
          reject(new Error('Failed to read file: ' + err.message))
        }
      }

      input.oncancel = () => reject(new Error('Open cancelled'))
      input.click()
    })
  }

  /**
   * Read a user-selected file and return its parsed content.
   * Returns a promise that resolves with { type: 'single'|'multiple', notes: [...] }
   */
  const importNotes = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'

      input.onchange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return reject(new Error('No file selected'))

        try {
          const text = await file.text()
          const parsed = JSON.parse(text)

          // Array of notes (backup file)
          if (Array.isArray(parsed)) {
            const notes = parsed.map(n => ({
              title: n.title || 'Imported Note',
              description: n.description || '',
              content: n.content || '',
            }))
            resolve({ type: 'multiple', notes })
          } else {
            // Single note JSON
            resolve({
              type: 'single',
              notes: [{
                title: parsed.title || 'Imported Note',
                description: parsed.description || '',
                content: parsed.content || '',
              }],
            })
          }
        } catch (err) {
          reject(new Error('Failed to read file: ' + err.message))
        }
      }

      // Handle cancel (no file chosen)
      input.oncancel = () => reject(new Error('Import cancelled'))

      input.click()
    })
  }

  /**
   * Duplicate a note, returning the new note data (without id — caller assigns that).
   */
  const duplicateNote = (note) => {
    if (!note) return null
    return {
      title: `${note.title} (copy)`,
      description: note.description || '',
      content: note.content || '',
    }
  }

  /**
   * Copy note content to clipboard. Returns a promise.
   */
  const copyToClipboard = async (note) => {
    if (!note?.content) return false
    await navigator.clipboard.writeText(note.content)
    return true
  }

  /**
   * Print the current note content.
   * @param {Object} note
   * @param {Function|null} evaluateLines - pass to include results
   */
  const printNote = (note, evaluateLines = null) => {
    if (!note) return false
    const body = evaluateLines
      ? mergeContentWithResults(note.content, evaluateLines)
      : (note.content || '')
    const printWindow = window.open('', '_blank')
    if (!printWindow) return false
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${note.title || 'Note'}</title>
<style>body{font-family:monospace;white-space:pre-wrap;padding:2rem;max-width:800px;margin:0 auto;line-height:1.6}</style>
</head><body>${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`)
    printWindow.document.close()
    printWindow.print()
    return true
  }

  return {
    downloadFile,
    sanitizeFilename,
    mergeContentWithResults,
    exportNoteAsText,
    exportNoteAsJson,
    exportNoteAsMarkdown,
    exportNoteAsPdf,
    exportAllNotes,
    openFile,
    importNotes,
    duplicateNote,
    copyToClipboard,
    printNote,
  }
}
