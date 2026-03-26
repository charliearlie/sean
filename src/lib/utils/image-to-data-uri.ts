export async function imageUrlToDataUri(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
  }
  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = blob.type || 'image/jpeg'
  return `data:${mimeType};base64,${base64}`
}
