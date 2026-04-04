import hljs from 'highlight.js/lib/core'

// Register only the languages we need
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import perl from 'highlight.js/lib/languages/perl'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import ini from 'highlight.js/lib/languages/ini'
import diff from 'highlight.js/lib/languages/diff'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import java from 'highlight.js/lib/languages/java'
import kotlin from 'highlight.js/lib/languages/kotlin'
import swift from 'highlight.js/lib/languages/swift'
import lua from 'highlight.js/lib/languages/lua'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('perl', perl)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('ini', ini)
hljs.registerLanguage('diff', diff)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('java', java)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('lua', lua)
hljs.registerLanguage('dockerfile', dockerfile)

// Aliases for common fence tags
const LANG_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  fish: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  toml: 'ini',
  dotenv: 'ini',
  env: 'ini',
  html: 'xml',
  htm: 'xml',
  svg: 'xml',
  'c++': 'cpp',
  'c#': 'csharp',
  cs: 'csharp',
  kt: 'kotlin',
  rs: 'rust',
  md: 'markdown',
  docker: 'dockerfile',
}

/**
 * Tokenize a code string using highlight.js.
 * Returns an array of { text, className, offset } spans covering the full string.
 * className is null for unhighlighted text.
 */
export function highlightCode(code, lang) {
  const resolved = LANG_ALIASES[lang?.toLowerCase()] || lang?.toLowerCase() || ''

  let result
  try {
    if (resolved && hljs.getLanguage(resolved)) {
      result = hljs.highlight(code, { language: resolved, ignoreIllegals: true })
    } else {
      result = hljs.highlightAuto(code)
    }
  } catch {
    return [{ text: code, className: null, offset: 0 }]
  }

  // Parse the HTML output into flat spans with character offsets
  const spans = []
  parseEmittedHtml(result.value, spans, { offset: 0 })
  return spans
}

// Recursively parse hljs HTML output into flat text spans
function parseEmittedHtml(html, spans, state) {
  // Split on tags while keeping them
  const parts = html.split(/(<\/?[^>]+>)/)
  const classStack = []

  for (const part of parts) {
    if (!part) continue

    const openMatch = part.match(/^<span class="([^"]*)"/)
    if (openMatch) {
      classStack.push(openMatch[1])
      continue
    }
    if (part.startsWith('</')) {
      classStack.pop()
      continue
    }

    // Text node — decode HTML entities
    const text = decodeHtmlEntities(part)
    if (text.length > 0) {
      const className = classStack.length > 0 ? classStack[classStack.length - 1] : null
      spans.push({ text, className, offset: state.offset })
      state.offset += text.length
    }
  }
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
}
