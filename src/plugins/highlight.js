import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const highlight = (el, binding) => {
  const code = el.querySelector('code') || el
  code.textContent = binding.value == null ? '' : String(binding.value)
  code.removeAttribute('data-highlighted')
  hljs.highlightElement(code)
}

export default {
  install(app) {
    app.directive('highlightjs', {
      mounted: highlight,
      updated: highlight
    })
  }
}
