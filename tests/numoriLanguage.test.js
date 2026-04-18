/**
 * Tests for the numori stream parser's fenced code block handling.
 * The parser must skip tokenizing content inside ``` blocks so that
 * highlight.js decorations are the only colour source.
 */
import { describe, it, expect } from 'vitest'
import { numoriStreamParser } from '../composables/useNumoriLanguage.js'

// Minimal stream mock that behaves like CodeMirror's StringStream
class MockStream {
  constructor(line) {
    this.string = line
    this.pos = 0
    this.start = 0
    this._sol = true
  }
  sol() {
    return this._sol
  }
  eol() {
    return this.pos >= this.string.length
  }
  peek() {
    return this.pos < this.string.length ? this.string[this.pos] : undefined
  }
  next() {
    if (this.pos < this.string.length) return this.string[this.pos++]
    return undefined
  }
  match(pattern, consume = true) {
    if (typeof pattern === 'string') {
      if (this.string.slice(this.pos).startsWith(pattern)) {
        if (consume) this.pos += pattern.length
        return true
      }
      return false
    }
    const match = this.string.slice(this.pos).match(pattern)
    if (match && match.index === 0) {
      if (consume) this.pos += match[0].length
      return match
    }
    return null
  }
  eatSpace() {
    const before = this.pos
    while (this.pos < this.string.length && /\s/.test(this.string[this.pos])) this.pos++
    return this.pos > before
  }
  skipToEnd() {
    this.pos = this.string.length
  }
  current() {
    return this.string.slice(this.start, this.pos)
  }
}

/**
 * Tokenize a full document (array of lines) using the raw stream parser.
 * Returns an array of { line, tokens: [{ text, type }] } objects.
 */
function tokenizeDoc(lines) {
  const state = numoriStreamParser.startState()
  const result = []

  for (const lineStr of lines) {
    const stream = new MockStream(lineStr)
    const tokens = []

    while (!stream.eol()) {
      stream.start = stream.pos
      stream._sol = stream.pos === 0
      const type = numoriStreamParser.token(stream, state)
      const text = stream.current()
      if (text) tokens.push({ text, type })
      if (stream.pos === stream.start) stream.next()
    }

    result.push({ line: lineStr, tokens })
  }

  return result
}

describe('Stream parser — code block skipping', () => {
  it('tokenizes normal lines with types', () => {
    const doc = tokenizeDoc(['10 + 20'])
    expect(doc[0].tokens.length).toBeGreaterThan(0)
    expect(doc[0].tokens.some((t) => t.type !== null)).toBe(true)
  })

  it('returns null type for content inside a fenced code block', () => {
    const doc = tokenizeDoc(['```javascript', 'const x = 1', 'var y = 2', '```'])
    expect(doc[0].tokens[0].type).toBe('comment')
    for (const tok of doc[1].tokens) expect(tok.type).toBeNull()
    for (const tok of doc[2].tokens) expect(tok.type).toBeNull()
    expect(doc[3].tokens[0].type).toBe('comment')
  })

  it('resumes normal tokenizing after closing fence', () => {
    const doc = tokenizeDoc(['```', 'code here', '```', '10 + 20'])
    expect(doc[3].tokens.some((t) => t.type !== null)).toBe(true)
  })

  it('handles code block without language tag', () => {
    const doc = tokenizeDoc(['```', 'just text', '```'])
    expect(doc[0].tokens[0].type).toBe('comment')
    for (const tok of doc[1].tokens) expect(tok.type).toBeNull()
    expect(doc[2].tokens[0].type).toBe('comment')
  })

  it('handles unclosed code block (rest of doc is code)', () => {
    const doc = tokenizeDoc(['```python', 'def hello():', '  pass'])
    expect(doc[0].tokens[0].type).toBe('comment')
    for (const tok of doc[1].tokens) expect(tok.type).toBeNull()
    for (const tok of doc[2].tokens) expect(tok.type).toBeNull()
  })

  it('does not treat inline backticks as code blocks', () => {
    const doc = tokenizeDoc(['use `code` inline'])
    expect(doc[0].tokens.every((t) => t.type === null)).toBe(false)
  })

  it('handles multiple code blocks in one document', () => {
    const doc = tokenizeDoc([
      'sum',
      '```bash',
      'echo hi',
      '```',
      'total',
      '```python',
      'x = 1',
      '```',
      'prev',
    ])
    expect(doc[0].tokens.some((t) => t.type === 'keyword')).toBe(true)
    expect(doc[1].tokens[0].type).toBe('comment')
    for (const tok of doc[2].tokens) expect(tok.type).toBeNull()
    expect(doc[3].tokens[0].type).toBe('comment')
    expect(doc[4].tokens.some((t) => t.type === 'keyword')).toBe(true)
    expect(doc[5].tokens[0].type).toBe('comment')
    for (const tok of doc[6].tokens) expect(tok.type).toBeNull()
    expect(doc[7].tokens[0].type).toBe('comment')
    expect(doc[8].tokens.some((t) => t.type === 'keyword')).toBe(true)
  })

  it('code block with c++ language tag', () => {
    const doc = tokenizeDoc(['```c++', 'int main() {}', '```'])
    expect(doc[0].tokens[0].type).toBe('comment')
    for (const tok of doc[1].tokens) expect(tok.type).toBeNull()
  })

  it('code block with .env language tag', () => {
    const doc = tokenizeDoc(['```.env', 'KEY=value', '```'])
    expect(doc[0].tokens[0].type).toBe('comment')
    for (const tok of doc[1].tokens) expect(tok.type).toBeNull()
  })

  it('```lang inside code block does not close it', () => {
    const doc = tokenizeDoc(['```', '```python', 'still inside', '```'])
    expect(doc[0].tokens[0].type).toBe('comment')
    for (const tok of doc[1].tokens) expect(tok.type).toBeNull()
    for (const tok of doc[2].tokens) expect(tok.type).toBeNull()
    expect(doc[3].tokens[0].type).toBe('comment')
  })
})

describe('Stream parser — normal tokenizing outside code blocks', () => {
  it('tokenizes headings', () => {
    const doc = tokenizeDoc(['# Hello'])
    expect(doc[0].tokens[0].type).toBe('heading')
  })

  it('tokenizes comments', () => {
    const doc = tokenizeDoc(['// a comment'])
    expect(doc[0].tokens[0].type).toBe('comment')
  })

  it('tokenizes numbers', () => {
    const doc = tokenizeDoc(['42'])
    expect(doc[0].tokens.some((t) => t.type === 'number')).toBe(true)
  })

  it('tokenizes keywords', () => {
    const doc = tokenizeDoc(['sum'])
    expect(doc[0].tokens.some((t) => t.type === 'keyword')).toBe(true)
  })

  it('tokenizes operators', () => {
    const doc = tokenizeDoc(['1 + 2'])
    expect(doc[0].tokens.some((t) => t.type === 'operator')).toBe(true)
  })

  it('tokenizes variables', () => {
    const doc = tokenizeDoc(['myVar'])
    expect(doc[0].tokens.some((t) => t.type === 'variableName')).toBe(true)
  })
})
