const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export async function extractInvoiceData(imageBase64, mimeType = 'image/jpeg') {
  const response = await fetch(`${SERVER_URL}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error || 'Server error during extraction')
  }

  return await response.json()
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function getMimeType(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const map = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  }
  return map[ext] || file.type || 'image/jpeg'
}
```

---

**Also update `.env.example`** in root to:
```
VITE_SERVER_URL=http://localhost:3001