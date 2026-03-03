/**
 * Next.js 16 - Server Actions for Form Handling
 *
 * This template shows comprehensive Server Actions patterns including:
 * - Basic form handling
 * - Validation with Zod
 * - Loading states
 * - Error handling
 * - Optimistic updates
 * - File uploads
 */

'use server'

import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

// ============================================================================
// Example 1: Basic Server Action
// ============================================================================

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // Save to database
  await fetch('https://api.example.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  })

  // Revalidate cache
  revalidateTag('posts', 'max')

  // Redirect to posts list
  redirect('/posts')
}

// Basic form component
export function CreatePostForm() {
  return (
    <form action={createPost}>
      <label>
        Title:
        <input type="text" name="title" required />
      </label>

      <label>
        Content:
        <textarea name="content" required />
      </label>

      <button type="submit">Create Post</button>
    </form>
  )
}

// ============================================================================
// Example 2: Server Action with Validation
// ============================================================================

const PostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
})

type ActionState = {
  errors?: {
    title?: string[]
    content?: string[]
    tags?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function createPostWithValidation(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Parse form data
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
    tags: formData.get('tags')?.toString().split(',') || [],
  }

  // Validate
  const parsed = PostSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  // Save to database
  try {
    await fetch('https://api.example.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    revalidateTag('posts', 'max')

    return { success: true }
  } catch (error) {
    return {
      errors: {
        _form: ['Failed to create post. Please try again.'],
      },
    }
  }
}

// Form with validation errors
'use client'

import { useFormState, useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Post'}
    </button>
  )
}

export function ValidatedPostForm() {
  const [state, formAction] = useFormState(createPostWithValidation, {})

  return (
    <form action={formAction}>
      <div>
        <label>
          Title:
          <input type="text" name="title" required />
        </label>
        {state.errors?.title && (
          <p className="error">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label>
          Content:
          <textarea name="content" required />
        </label>
        {state.errors?.content && (
          <p className="error">{state.errors.content[0]}</p>
        )}
      </div>

      <div>
        <label>
          Tags (comma-separated):
          <input type="text" name="tags" placeholder="nextjs, react, tutorial" />
        </label>
        {state.errors?.tags && (
          <p className="error">{state.errors.tags[0]}</p>
        )}
      </div>

      {state.errors?._form && (
        <p className="error">{state.errors._form[0]}</p>
      )}

      {state.success && (
        <p className="success">Post created successfully!</p>
      )}

      <SubmitButton />
    </form>
  )
}

// ============================================================================
// Example 3: Server Action with Optimistic Updates
// ============================================================================

'use server'

import { updateTag } from 'next/cache'

export async function likePost(postId: string) {
  await fetch(`https://api.example.com/posts/${postId}/like`, {
    method: 'POST',
  })

  // Use updateTag for immediate refresh (read-your-writes)
  updateTag('posts')
}

// Client component with optimistic updates
'use client'

import { useOptimistic } from 'react'
import { likePost } from './actions'

export function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state, amount: number) => state + amount
  )

  async function handleLike() {
    // Update UI immediately
    addOptimisticLike(1)

    // Sync with server
    await likePost(postId)
  }

  return (
    <button onClick={handleLike}>
      ❤️ {optimisticLikes} likes
    </button>
  )
}

// ============================================================================
// Example 4: Server Action with File Upload
// ============================================================================

'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File

  if (!file) {
    return { error: 'No file provided' }
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { error: 'File too large. Maximum size is 5MB.' }
  }

  // Save file
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${Date.now()}-${file.name}`
  const path = join(process.cwd(), 'public', 'uploads', filename)

  await writeFile(path, buffer)

  return {
    success: true,
    url: `/uploads/${filename}`,
  }
}

// File upload form
'use client'

import { useState } from 'react'
import { uploadImage } from './actions'

export function ImageUploadForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const result = await uploadImage(formData)

    if (result.error) {
      setError(result.error)
    } else if (result.url) {
      setPreview(result.url)
      setError(null)
    }
  }

  return (
    <form action={handleSubmit}>
      <input
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp"
        required
      />

      <button type="submit">Upload Image</button>

      {error && <p className="error">{error}</p>}

      {preview && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={preview} alt="Uploaded" width={300} />
        </div>
      )}
    </form>
  )
}

// ============================================================================
// Example 5: Server Action with Progressive Enhancement
// ============================================================================

'use server'

export async function subscribe(formData: FormData) {
  const email = formData.get('email') as string

  await fetch('https://api.example.com/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  return { success: true, message: 'Subscribed successfully!' }
}

// Form works without JavaScript (progressive enhancement)
export function SubscribeForm() {
  return (
    <form action={subscribe}>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        required
      />
      <button type="submit">Subscribe</button>
    </form>
  )
}

// Enhanced with JavaScript
'use client'

import { useFormState } from 'react-dom'

export function EnhancedSubscribeForm() {
  const [state, formAction] = useFormState(subscribe, null)

  return (
    <form action={formAction}>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        required
      />
      <button type="submit">Subscribe</button>

      {state?.success && (
        <p className="success">{state.message}</p>
      )}
    </form>
  )
}

// ============================================================================
// Example 6: Server Action with Multi-Step Form
// ============================================================================

'use server'

type Step1Data = { name: string; email: string }
type Step2Data = { address: string; city: string }
type FormData = Step1Data & Step2Data

export async function submitMultiStepForm(data: FormData) {
  // Validate all data
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    address: z.string().min(5),
    city: z.string().min(2),
  })

  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  // Save to database
  await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  })

  return { success: true }
}

// Multi-step form component
'use client'

import { useState } from 'react'

export function MultiStepForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<FormData>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (step === 1) {
      const form = e.currentTarget
      setFormData({
        ...formData,
        name: (form.elements.namedItem('name') as HTMLInputElement).value,
        email: (form.elements.namedItem('email') as HTMLInputElement).value,
      })
      setStep(2)
    } else {
      const form = e.currentTarget
      const finalData = {
        ...formData,
        address: (form.elements.namedItem('address') as HTMLInputElement).value,
        city: (form.elements.namedItem('city') as HTMLInputElement).value,
      } as FormData

      const result = await submitMultiStepForm(finalData)

      if (result.success) {
        alert('Form submitted successfully!')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {step === 1 && (
        <>
          <h2>Step 1: Personal Info</h2>
          <input name="name" placeholder="Name" defaultValue={formData.name} required />
          <input name="email" type="email" placeholder="Email" defaultValue={formData.email} required />
          <button type="submit">Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Step 2: Address</h2>
          <input name="address" placeholder="Address" defaultValue={formData.address} required />
          <input name="city" placeholder="City" defaultValue={formData.city} required />
          <button type="button" onClick={() => setStep(1)}>Back</button>
          <button type="submit">Submit</button>
        </>
      )}
    </form>
  )
}

// ============================================================================
// Example 7: Server Action with Rate Limiting
// ============================================================================

'use server'

import { headers } from 'next/headers'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function submitContactForm(formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'

  // Check rate limit (5 requests per hour)
  const now = Date.now()
  const rateLimit = rateLimitMap.get(ip)

  if (rateLimit) {
    if (now < rateLimit.resetAt) {
      if (rateLimit.count >= 5) {
        return { error: 'Too many requests. Please try again later.' }
      }
      rateLimit.count++
    } else {
      // Reset rate limit
      rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 }) // 1 hour
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 })
  }

  // Process form
  const name = formData.get('name') as string
  const message = formData.get('message') as string

  await fetch('https://api.example.com/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message }),
  })

  return { success: true }
}

/**
 * Summary:
 *
 * Server Actions patterns:
 * 1. ✅ Basic form handling with formData
 * 2. ✅ Validation with Zod (safeParse)
 * 3. ✅ Loading states with useFormStatus
 * 4. ✅ Error handling with useFormState
 * 5. ✅ Optimistic updates with useOptimistic
 * 6. ✅ File uploads
 * 7. ✅ Progressive enhancement (works without JS)
 * 8. ✅ Multi-step forms
 * 9. ✅ Rate limiting
 *
 * Best practices:
 * - Always validate on server (never trust client input)
 * - Use revalidateTag() for background revalidation
 * - Use updateTag() for immediate refresh (forms, settings)
 * - Return errors instead of throwing (better UX)
 * - Use TypeScript for type safety
 * - Add rate limiting for public forms
 */
