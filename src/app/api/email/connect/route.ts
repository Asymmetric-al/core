/**
 * SendGrid Connection API Route
 *
 * POST /api/email/connect
 *
 * Validates a SendGrid API key and returns account configuration details.
 * This is called when a tenant first connects their SendGrid account.
 *
 * ## Request Body
 *
 * ```json
 * {
 *   "apiKey": "SG.xxxxx",              // Required: SendGrid API key
 *   "defaultFromEmail": "hello@co.com", // Required: Default sender email
 *   "defaultFromName": "Company Name",  // Required: Default sender name
 *   "replyToEmail": "support@co.com"    // Optional: Reply-to address
 * }
 * ```
 *
 * ## Success Response (200)
 *
 * ```json
 * {
 *   "success": true,
 *   "connectionId": "uuid",
 *   "senderIdentities": [...],        // Verified senders in account
 *   "domainAuthentication": [...],    // Authenticated domains
 *   "deliverabilityScore": 80,        // 0-100 score
 *   "warnings": [...]                 // Issues to address
 * }
 * ```
 *
 * ## Error Response (400)
 *
 * ```json
 * {
 *   "success": false,
 *   "error": "Invalid API key",
 *   "errorCode": "unauthorized"
 * }
 * ```
 *
 * ## Security Notes
 *
 * - API key is validated server-side only
 * - Key is NOT stored by this endpoint (caller must handle storage)
 * - Rate limited by SendGrid's API limits
 *
 * @module app/api/email/connect
 */

import { NextResponse } from 'next/server'
import { validateSendGridApiKey } from '@/lib/email/sendgrid'
import type { ConnectSendGridRequest, ConnectSendGridResponse } from '@/types/email'

export async function POST(request: Request) {
  try {
    const body = await request.json() as ConnectSendGridRequest

    if (!body.apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      )
    }

    if (!body.defaultFromEmail) {
      return NextResponse.json(
        { success: false, error: 'From email is required' },
        { status: 400 }
      )
    }

    if (!body.defaultFromName) {
      return NextResponse.json(
        { success: false, error: 'From name is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.defaultFromEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const validationResult = await validateSendGridApiKey(body.apiKey)

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
          errorCode: validationResult.errorCode,
        },
        { status: 400 }
      )
    }

    const senderEmail = body.defaultFromEmail.toLowerCase()
    const senderDomain = senderEmail.split('@')[1]

    const isVerifiedSender = validationResult.senderIdentities?.some(
      sender => sender.from_email.toLowerCase() === senderEmail && sender.verified
    )

    const isAuthenticatedDomain = validationResult.domainAuthentication?.some(
      domain => domain.domain === senderDomain && domain.valid
    )

    const warnings = [...(validationResult.warnings || [])]

    if (!isVerifiedSender && !isAuthenticatedDomain) {
      warnings.push({
        code: 'SENDER_NOT_VERIFIED',
        message: `The sender email "${body.defaultFromEmail}" is not verified. You must verify this email address or authenticate its domain in SendGrid before sending emails.`,
        severity: 'error',
        helpUrl: 'https://docs.sendgrid.com/ui/sending-email/sender-verification',
      })
    }

    const response: ConnectSendGridResponse = {
      success: true,
      connectionId: crypto.randomUUID(),
      senderIdentities: validationResult.senderIdentities,
      domainAuthentication: validationResult.domainAuthentication,
      deliverabilityScore: validationResult.deliverabilityScore,
      warnings,
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[API] Email connect error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
