import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  // Check admin auth
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const apiKey = process.env.CAMBERCO_IMAGES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Image transform API not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { imageDataUri, prompt } = body

    if (!imageDataUri || !prompt) {
      return NextResponse.json({ error: 'imageDataUri and prompt are required' }, { status: 400 })
    }

    let response: Response | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch('https://images.camberco.co.uk/api/v1/transform', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageDataUri, prompt }),
      })

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after')) || (10 * (attempt + 1))
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }
      break
    }

    if (!response || !response.ok) {
      const errorText = await response?.text() ?? 'No response'
      return NextResponse.json(
        { error: `Transform API error: ${response?.status}`, details: errorText },
        { status: response?.status ?? 502 }
      )
    }

    const result = await response.json()

    // Resize transformed image to match original dimensions
    const origBuffer = Buffer.from(imageDataUri.split(',')[1], 'base64')
    const origMeta = await sharp(origBuffer).metadata()

    if (origMeta.width && origMeta.height && result.resultDataUri) {
      const resultBuffer = Buffer.from(result.resultDataUri.split(',')[1], 'base64')
      const resized = await sharp(resultBuffer)
        .resize(origMeta.width, origMeta.height, { fit: 'fill' })
        .png()
        .toBuffer()
      result.resultDataUri = `data:image/png;base64,${resized.toString('base64')}`
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Image transform error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
