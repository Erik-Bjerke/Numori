/**
 * File menu action handlers for notes (export, import, duplicate, copy, print).
 */
export function useNoteActions({
  notes,
  currentNote,
  selectedNoteIds,
  createNote,
  updateNoteMeta,
  updateNoteContent,
  evaluateLines,
  fileActions,
}) {
  const {
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
  } = fileActions

  const showExportOptions = ref(false)
  const pendingExportAction = ref(null)

  const askExportOptions = (action) => {
    pendingExportAction.value = action
    showExportOptions.value = true
  }

  const handleExportConfirm = (withResults) => {
    showExportOptions.value = false
    const calc = withResults ? evaluateLines : null
    const note = currentNote.value
    switch (pendingExportAction.value) {
      case 'text':
        exportNoteAsText(note, calc)
        break
      case 'markdown':
        exportNoteAsMarkdown(note, calc)
        break
      case 'pdf':
        exportNoteAsPdf(note, calc)
        break
      case 'print':
        printNote(note, calc)
        break
    }
    pendingExportAction.value = null
  }

  const handleOpenFile = async () => {
    try {
      const data = await openFile()
      const newNote = createNote()
      updateNoteMeta(newNote.id, {
        title: data.title,
        description: data.description,
        tags: data.tags,
      })
      updateNoteContent(newNote.id, data.content)
    } catch {
      // User cancelled or file read failed
    }
  }

  const handleDuplicate = () => {
    if (!currentNote.value) return
    const data = duplicateNote(currentNote.value)
    if (data) {
      const newNote = createNote()
      updateNoteMeta(newNote.id, {
        title: data.title,
        description: data.description,
        tags: data.tags,
      })
      updateNoteContent(newNote.id, data.content)
    }
  }

  const getSelectedOrAll = () => {
    if (selectedNoteIds.value.length > 0) {
      return notes.value.filter((n) => selectedNoteIds.value.includes(n.id))
    }
    return null
  }

  const handleExportText = () => {
    const selected = getSelectedOrAll()
    if (selected) {
      exportAllNotes(selected)
    } else {
      askExportOptions('text')
    }
  }

  const handleExportMarkdown = () => {
    const selected = getSelectedOrAll()
    if (selected) {
      exportAllNotes(selected)
    } else {
      askExportOptions('markdown')
    }
  }

  const handleExportPdf = () => {
    const selected = getSelectedOrAll()
    if (selected) {
      exportAllNotes(selected)
    } else {
      askExportOptions('pdf')
    }
  }

  const handleExportJson = () => {
    const selected = getSelectedOrAll()
    if (selected) {
      exportAllNotes(selected)
    } else {
      exportNoteAsJson(currentNote.value)
    }
  }

  const handleExportAll = () => {
    const selected = getSelectedOrAll()
    if (selected) {
      exportAllNotes(selected)
    } else {
      exportAllNotes(notes.value)
    }
  }

  const handleImport = async () => {
    try {
      const result = await importNotes()
      for (const noteData of result.notes) {
        const newNote = createNote()
        updateNoteMeta(newNote.id, {
          title: noteData.title,
          description: noteData.description,
          tags: noteData.tags,
        })
        updateNoteContent(newNote.id, noteData.content)
      }
    } catch {
      // User cancelled or file read failed
    }
  }

  const handleCopy = async () => {
    try {
      await copyToClipboard(currentNote.value)
    } catch {
      // Clipboard API not available
    }
  }

  const handlePrint = () => askExportOptions('print')

  // Per-note action handlers (receive note ID)
  const findNote = (id) => notes.value.find((n) => n.id === id)

  const handleDuplicateById = (id) => {
    const note = findNote(id)
    if (!note) return
    const data = duplicateNote(note)
    if (data) {
      const newNote = createNote()
      updateNoteMeta(newNote.id, {
        title: data.title,
        description: data.description,
        tags: data.tags,
      })
      updateNoteContent(newNote.id, data.content)
    }
  }

  const handleExportById = (id) => {
    const note = findNote(id)
    if (!note) return
    exportNoteAsJson(note)
  }

  const handleCopyById = async (id) => {
    const note = findNote(id)
    if (!note) return
    try {
      await copyToClipboard(note)
    } catch {
      /* ignore */
    }
  }

  const handlePrintById = (id) => {
    const note = findNote(id)
    if (!note) return
    printNote(note)
  }

  return {
    showExportOptions,
    handleExportConfirm,
    handleOpenFile,
    handleDuplicate,
    handleExportText,
    handleExportMarkdown,
    handleExportPdf,
    handleExportJson,
    handleExportAll,
    handleImport,
    handleCopy,
    handlePrint,
    handleDuplicateById,
    handleExportById,
    handleCopyById,
    handlePrintById,
  }
}
