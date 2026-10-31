import { ElMessage } from 'element-plus'

function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

export default async function handleClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else if (!fallbackCopy(text)) {
      throw new Error('copy failed')
    }
    ElMessage({
      message: 'Copy successfully',
      type: 'success',
      duration: 1500
    })
  } catch (e) {
    ElMessage({
      message: 'Copy failed',
      type: 'error'
    })
  }
}
