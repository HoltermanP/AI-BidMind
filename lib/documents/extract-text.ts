/**
 * Tekstextractie uit PDF en DOCX voor AI-analyse.
 * Alleen gebruikt in API-routes (Node).
 */

export async function extractTextFromBuffer(
  buffer: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  const mime = contentType.split(';')[0]?.toLowerCase().trim() ?? ''

  if (mime === 'application/pdf') {
    try {
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: buffer })
      const textResult = await parser.getText()
      await parser.destroy()
      return typeof textResult?.text === 'string' ? textResult.text.trim() || null : null
    } catch {
      return null
    }
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword'
  ) {
    try {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
      return result?.value?.trim() || null
    } catch {
      return null
    }
  }

  return null
}
