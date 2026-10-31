import hljs from 'highlight.js/lib/core'
import java from 'highlight.js/lib/languages/java'
import 'highlight.js/styles/atom-one-dark.css'

// 项目只在错误日志/定时任务日志中高亮 Java 代码，按需注册即可，
// 避免把 highlight.js 全部语言打进首屏。
hljs.registerLanguage('java', java)

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
