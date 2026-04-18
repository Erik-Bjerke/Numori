let inlineStylesInjected = false

export function injectInlineStyles() {
  if (inlineStylesInjected) return
  inlineStylesInjected = true
  const existing = document.getElementById('numori-inline-styles')
  if (existing) existing.remove()
  const style = document.createElement('style')
  style.id = 'numori-inline-styles'
  style.textContent = `
    .cm-scroller { overscroll-behavior: none; -webkit-overflow-scrolling: auto; }
    .numori-inline-result { color: #CC2D56; font-style: italic; opacity: 0.75; cursor: pointer; }
    .cm-theme-dark .numori-inline-result,
    .dark .numori-inline-result { color: #FF6188; opacity: 0.7; }
    .numori-inline-error { color: #dc2626; font-style: italic; opacity: 0.65; cursor: default; }
    .cm-theme-dark .numori-inline-error,
    .dark .numori-inline-error { color: #FC9867; }
    .numori-inline-pad { cursor: default; }
    .numori-md-hidden-syntax { font-size: 0 !important; letter-spacing: 0 !important; width: 0 !important; display: inline-block; overflow: hidden; }
    .numori-md-h1 { font-size: 1.7em !important; font-weight: 700 !important; }
    .numori-md-h2 { font-size: 1.4em !important; font-weight: 600 !important; }
    .numori-md-h3 { font-size: 1.2em !important; font-weight: 600 !important; }
    .numori-md-h4 { font-size: 1.1em !important; font-weight: 600 !important; }
    .numori-md-h5 { font-size: 1.05em !important; font-weight: 600 !important; }
    .numori-md-h6 { font-size: 1em !important; font-weight: 600 !important; }
    .numori-md-comment { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; font-style: normal !important; color: #939293 !important; }
    .cm-theme-dark .numori-md-comment,
    .dark .numori-md-comment { color: #727072 !important; }
    .numori-md-list-item { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; }
    .numori-md-bullet { opacity: 0.6; }
    .numori-md-checked { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; text-decoration: line-through !important; opacity: 0.6 !important; }
    .numori-md-unchecked { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; }
    .numori-md-check-icon { font-style: normal !important; font-size: 1.1em !important; vertical-align: baseline !important; cursor: pointer !important; }
    .numori-md-check-icon-nested { font-style: normal !important; font-size: 1.05em !important; vertical-align: baseline !important; cursor: pointer !important; }
    .numori-md-quote { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; font-style: italic !important; opacity: 0.85 !important; }
    .numori-md-quote-bar { color: #FF6188 !important; font-style: normal !important; }
    .cm-theme-dark .numori-md-quote-bar,
    .dark .numori-md-quote-bar { color: #FF6188 !important; }
    .numori-md-bold { font-weight: 700 !important; }
    .numori-md-italic { font-style: italic !important; }
    .numori-md-strike { text-decoration: line-through !important; opacity: 0.6 !important; }
    .numori-md-inline-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
      background: rgba(135,131,120,0.15) !important; border-radius: 3px !important;
      padding: 1px 4px !important; font-size: 0.9em !important;
    }
    .cm-theme-dark .numori-md-inline-code,
    .dark .numori-md-inline-code { background: rgba(255,255,255,0.1) !important; }
    .numori-md-link {
      color: #2563eb !important; text-decoration: underline !important;
      text-underline-offset: 2px !important; cursor: pointer !important;
    }
    .cm-theme-dark .numori-md-link,
    .dark .numori-md-link { color: #60a5fa !important; }
    .numori-md-code-block-line {
      background: rgba(135,131,120,0.1) !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
      padding-left: 12px !important;
      padding-right: 12px !important;
      margin-left: 8px !important;
    }
    .cm-theme-dark .numori-md-code-block-line,
    .dark .numori-md-code-block-line { background: rgba(255,255,255,0.06) !important; }
    .numori-md-code-block-first { border-radius: 6px 6px 0 0 !important; padding-top: 4px !important; }
    .numori-md-code-block-last { border-radius: 0 0 6px 6px !important; }
    .numori-md-code-fence-label {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 0.75em !important; opacity: 0.5 !important; font-style: italic !important;
    }
    .numori-md-code-copy-btn {
      float: right; margin-right: 0px; margin-top: 8px;
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border: none; border-radius: 4px; cursor: pointer;
      background: rgba(135,131,120,0.15); color: #6b7280;
      opacity: 0.6; transition: opacity 0.15s ease, background 0.15s ease;
      -webkit-tap-highlight-color: transparent; touch-action: manipulation;
    }
    .numori-md-code-copy-btn:hover,
    .numori-md-code-copy-btn:focus { opacity: 1; background: rgba(135,131,120,0.3); }
    .cm-theme-dark .numori-md-code-copy-btn,
    .dark .numori-md-code-copy-btn { background: rgba(255,255,255,0.1); color: #9ca3af; }
    .cm-theme-dark .numori-md-code-copy-btn:hover,
    .dark .numori-md-code-copy-btn:hover { background: rgba(255,255,255,0.2); }
    .numori-md-code-copy-btn--copied { opacity: 1 !important; color: #22c55e !important; }
    /* highlight.js syntax colors — light */
    .numori-hl.hljs-keyword,
    .numori-hl.hljs-selector-tag,
    .numori-hl.hljs-built_in { color: #CC2D56 !important; }
    .numori-hl.hljs-string,
    .numori-hl.hljs-addition { color: #4D8C2A !important; }
    .numori-hl.hljs-comment,
    .numori-hl.hljs-quote { color: #939293 !important; font-style: italic !important; }
    .numori-hl.hljs-number,
    .numori-hl.hljs-literal { color: #A68A1B !important; }
    .numori-hl.hljs-title,
    .numori-hl.hljs-title.class_,
    .numori-hl.hljs-title.function_ { color: #7B5FC4 !important; }
    .numori-hl.hljs-type,
    .numori-hl.hljs-template-variable { color: #1A8A9A !important; }
    .numori-hl.hljs-variable,
    .numori-hl.hljs-params { color: #2D2A2E !important; }
    .numori-hl.hljs-regexp { color: #C4621A !important; }
    .numori-hl.hljs-symbol,
    .numori-hl.hljs-bullet { color: #7B5FC4 !important; }
    .numori-hl.hljs-meta,
    .numori-hl.hljs-meta .hljs-keyword { color: #C4621A !important; }
    .numori-hl.hljs-deletion { color: #CC2D56 !important; background: rgba(204,45,86,0.08) !important; }
    .numori-hl.hljs-section { color: #2D2A2E !important; font-weight: 700 !important; }
    .numori-hl.hljs-name,
    .numori-hl.hljs-tag { color: #CC2D56 !important; }
    .numori-hl.hljs-attr,
    .numori-hl.hljs-attribute { color: #C4621A !important; }
    .numori-hl.hljs-selector-class,
    .numori-hl.hljs-selector-id { color: #7B5FC4 !important; }
    .numori-hl.hljs-property { color: #1A8A9A !important; }
    .numori-hl.hljs-operator { color: #939293 !important; }
    .numori-hl.hljs-punctuation { color: #727072 !important; }
    .numori-hl.hljs-subst { color: #2D2A2E !important; }
    /* highlight.js syntax colors — dark */
    .cm-theme-dark .numori-hl.hljs-keyword,
    .dark .numori-hl.hljs-keyword,
    .cm-theme-dark .numori-hl.hljs-selector-tag,
    .dark .numori-hl.hljs-selector-tag,
    .cm-theme-dark .numori-hl.hljs-built_in,
    .dark .numori-hl.hljs-built_in { color: #FF6188 !important; }
    .cm-theme-dark .numori-hl.hljs-string,
    .dark .numori-hl.hljs-string,
    .cm-theme-dark .numori-hl.hljs-addition,
    .dark .numori-hl.hljs-addition { color: #A9DC76 !important; }
    .cm-theme-dark .numori-hl.hljs-comment,
    .dark .numori-hl.hljs-comment,
    .cm-theme-dark .numori-hl.hljs-quote,
    .dark .numori-hl.hljs-quote { color: #727072 !important; font-style: italic !important; }
    .cm-theme-dark .numori-hl.hljs-number,
    .dark .numori-hl.hljs-number,
    .cm-theme-dark .numori-hl.hljs-literal,
    .dark .numori-hl.hljs-literal { color: #FFD866 !important; }
    .cm-theme-dark .numori-hl.hljs-title,
    .dark .numori-hl.hljs-title,
    .cm-theme-dark .numori-hl.hljs-title.class_,
    .dark .numori-hl.hljs-title.class_,
    .cm-theme-dark .numori-hl.hljs-title.function_,
    .dark .numori-hl.hljs-title.function_ { color: #AB9DF2 !important; }
    .cm-theme-dark .numori-hl.hljs-type,
    .dark .numori-hl.hljs-type,
    .cm-theme-dark .numori-hl.hljs-template-variable,
    .dark .numori-hl.hljs-template-variable { color: #78DCE8 !important; }
    .cm-theme-dark .numori-hl.hljs-variable,
    .dark .numori-hl.hljs-variable,
    .cm-theme-dark .numori-hl.hljs-params,
    .dark .numori-hl.hljs-params { color: #FCFCFA !important; }
    .cm-theme-dark .numori-hl.hljs-regexp,
    .dark .numori-hl.hljs-regexp { color: #FC9867 !important; }
    .cm-theme-dark .numori-hl.hljs-symbol,
    .dark .numori-hl.hljs-symbol,
    .cm-theme-dark .numori-hl.hljs-bullet,
    .dark .numori-hl.hljs-bullet { color: #AB9DF2 !important; }
    .cm-theme-dark .numori-hl.hljs-meta,
    .dark .numori-hl.hljs-meta { color: #FC9867 !important; }
    .cm-theme-dark .numori-hl.hljs-deletion,
    .dark .numori-hl.hljs-deletion { color: #FF6188 !important; background: rgba(255,97,136,0.1) !important; }
    .cm-theme-dark .numori-hl.hljs-section,
    .dark .numori-hl.hljs-section { color: #FCFCFA !important; font-weight: 700 !important; }
    .cm-theme-dark .numori-hl.hljs-name,
    .dark .numori-hl.hljs-name,
    .cm-theme-dark .numori-hl.hljs-tag,
    .dark .numori-hl.hljs-tag { color: #FF6188 !important; }
    .cm-theme-dark .numori-hl.hljs-attr,
    .dark .numori-hl.hljs-attr,
    .cm-theme-dark .numori-hl.hljs-attribute,
    .dark .numori-hl.hljs-attribute { color: #FC9867 !important; }
    .cm-theme-dark .numori-hl.hljs-selector-class,
    .dark .numori-hl.hljs-selector-class,
    .cm-theme-dark .numori-hl.hljs-selector-id,
    .dark .numori-hl.hljs-selector-id { color: #AB9DF2 !important; }
    .cm-theme-dark .numori-hl.hljs-property,
    .dark .numori-hl.hljs-property { color: #78DCE8 !important; }
    .cm-theme-dark .numori-hl.hljs-operator,
    .dark .numori-hl.hljs-operator { color: #727072 !important; }
    .cm-theme-dark .numori-hl.hljs-punctuation,
    .dark .numori-hl.hljs-punctuation { color: #939293 !important; }
    .cm-theme-dark .numori-hl.hljs-subst,
    .dark .numori-hl.hljs-subst { color: #FCFCFA !important; }
    .numori-inline-copied-toast {
      position: absolute; pointer-events: none; z-index: 100;
      padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;
      color: #4D8C2A; background: #F0FDF4; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      white-space: nowrap;
    }
    .dark .numori-inline-copied-toast { color: #A9DC76; background: #221F22; }
    .numori-toast-float-up { animation: numori-float-up 0.8s ease-out forwards; }
    @keyframes numori-float-up {
      0% { opacity: 1; transform: translateY(0); }
      70% { opacity: 1; transform: translateY(-4px); }
      100% { opacity: 0; transform: translateY(-8px); }
    }
    .numori-toast-fade { animation: numori-fade 0.8s ease-in-out forwards; }
    @keyframes numori-fade {
      0% { opacity: 0; } 15% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; }
    }
    .numori-toast-scale-pop { animation: numori-scale-pop 0.8s ease-out forwards; }
    @keyframes numori-scale-pop {
      0% { opacity: 0; transform: scale(0.5); }
      20% { opacity: 1; transform: scale(1.15); }
      35% { transform: scale(1); } 70% { opacity: 1; }
      100% { opacity: 0; transform: scale(0.9); }
    }
    .numori-toast-slide-right { animation: numori-slide-right 0.8s ease-out forwards; }
    @keyframes numori-slide-right {
      0% { opacity: 0; transform: translateX(-12px); }
      20% { opacity: 1; transform: translateX(0); }
      70% { opacity: 1; }
      100% { opacity: 0; transform: translateX(8px); }
    }
    .numori-toast-bounce { animation: numori-bounce 0.8s ease-out forwards; }
    @keyframes numori-bounce {
      0% { opacity: 0; transform: translateY(6px); }
      25% { opacity: 1; transform: translateY(-6px); }
      45% { transform: translateY(2px); } 60% { transform: translateY(-2px); }
      75% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; }
    }
    .numori-toast-glow { animation: numori-glow 0.8s ease-out forwards; }
    @keyframes numori-glow {
      0% { opacity: 0; box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
      20% { opacity: 1; box-shadow: 0 0 8px 2px rgba(16,185,129,0.5); }
      60% { opacity: 1; box-shadow: 0 0 2px 0 rgba(16,185,129,0.2); }
      100% { opacity: 0; box-shadow: 0 0 0 0 rgba(16,185,129,0); }
    }
    .numori-toast-none { animation: numori-none 0.6s forwards; }
    @keyframes numori-none {
      0% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; }
    }
  `
  document.head.appendChild(style)
}
