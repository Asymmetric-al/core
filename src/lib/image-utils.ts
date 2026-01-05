export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const

export const MAX_SAFEGUARD_SIZE_MB = 50
export const MAX_SAFEGUARD_SIZE_BYTES = MAX_SAFEGUARD_SIZE_MB * 1024 * 1024

export const MAX_PREVIEW_DIMENSION = 4096

export type ImageValidationError =
  | 'invalid_type'
  | 'file_too_large'
  | 'corrupt_image'
  | 'unknown'

export interface ImageValidationResult {
  valid: boolean
  error?: ImageValidationError
  message?: string
}

export function validateImageFile(file: File): ImageValidationResult {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  const isValidExtension = ALLOWED_EXTENSIONS.includes(extension as any)
  const isValidMime = ALLOWED_IMAGE_TYPES.includes(file.type as any)

  if (!isValidMime && !isValidExtension) {
    return {
      valid: false,
      error: 'invalid_type',
      message: `Unsupported file type. Please use ${ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  if (file.size > MAX_SAFEGUARD_SIZE_BYTES) {
    return {
      valid: false,
      error: 'file_too_large',
      message: `File is extremely large (>${MAX_SAFEGUARD_SIZE_MB}MB). Please use a smaller image.`,
    }
  }

  return { valid: true }
}

export function loadImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export async function validateImageLoads(dataUrl: string): Promise<ImageValidationResult> {
  try {
    await createImage(dataUrl)
    return { valid: true }
  } catch {
    return {
      valid: false,
      error: 'corrupt_image',
      message: 'The image appears to be corrupt or invalid',
    }
  }
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Failed to load image')))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface CropOptions {
  rotation?: number
  flip?: { horizontal: boolean; vertical: boolean }
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png'
  quality?: number
  preserveTransparency?: boolean
  maxOutputDimension?: number
}

export async function createDownscaledPreview(
  imageSrc: string,
  maxDimension: number = MAX_PREVIEW_DIMENSION
): Promise<string> {
  const image = await createImage(imageSrc)
  
  if (image.width <= maxDimension && image.height <= maxDimension) {
    return imageSrc
  }

  const scale = Math.min(maxDimension / image.width, maxDimension / image.height)
  const newWidth = Math.round(image.width * scale)
  const newHeight = Math.round(image.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = newWidth
  canvas.height = newHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return imageSrc
  }

  ctx.drawImage(image, 0, 0, newWidth, newHeight)
  return canvas.toDataURL('image/jpeg', 0.92)
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  options: Partial<CropOptions> = {}
): Promise<Blob | null> {
  const {
    outputFormat = 'image/webp',
    quality = 0.92,
    preserveTransparency = false,
    maxOutputDimension,
  } = options

  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(data, 0, 0)

  if (maxOutputDimension && (canvas.width > maxOutputDimension || canvas.height > maxOutputDimension)) {
    const scale = Math.min(maxOutputDimension / canvas.width, maxOutputDimension / canvas.height)
    const newWidth = Math.round(canvas.width * scale)
    const newHeight = Math.round(canvas.height * scale)
    
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = newWidth
    tempCanvas.height = newHeight
    const tempCtx = tempCanvas.getContext('2d')
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight)
      canvas.width = newWidth
      canvas.height = newHeight
      ctx.drawImage(tempCanvas, 0, 0)
    }
  }

  const finalFormat = preserveTransparency ? 'image/png' : outputFormat

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      finalFormat,
      finalFormat === 'image/png' ? undefined : quality
    )
  })
}

export function getErrorMessage(error: ImageValidationError): string {
  switch (error) {
    case 'invalid_type':
      return `Please select a valid image (${ALLOWED_EXTENSIONS.join(', ')})`
    case 'file_too_large':
      return `Image is extremely large (>${MAX_SAFEGUARD_SIZE_MB}MB). Please use a smaller image.`
    case 'corrupt_image':
      return 'This image appears to be corrupt or invalid'
    default:
      return 'An error occurred while processing the image'
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
