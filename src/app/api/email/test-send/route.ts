/**
 * SendGrid Test Email API Route
 *
 * POST /api/email/test-send
 *
 * Sends a test email to verify SendGrid configuration is working.
 * Called from the admin settings UI after connecting SendGrid.
 *
 * ## Request Body
 *
 * ```json
 * {
 *   "apiKey": "SG.xxxxx",           // Required: SendGrid API key
 *   "toEmail": "test@example.com",  // Required: Recipient email
 *   "fromEmail": "hello@co.com",    // Required: Sender email (must be verified)
 *   "fromName": "Company Name"      // Required: Sender display name
 * }
 * ```
 *
 * ## Success Response (200)
 *
 * ```json
 * {
 *   "success": true,
 *   "messageId": "abc123",
 *   "message": "Test email sent successfully to test@example.com"
 * }
 * ```
 *
 * ## Error Response (400)
 *
 * ```json
 * {
 *   "success": false,
 *   "error": "The from address does not match a verified Sender Identity",
 *   "errors": [{ "code": "unknown", "message": "..." }]
 * }
 * ```
 *
 * ## Common Errors
 *
 * | Error | Cause | Solution |
 * |-------|-------|----------|
 * | "does not match a verified Sender Identity" | From email not verified | Verify sender in SendGrid |
 * | "Invalid API key" | Bad key | Check API key |
 * | "Permission denied" | Key lacks mail.send | Create key with proper scope |
 *
 * @module app/api/email/test-send
 */

import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/email/sendgrid";

interface TestSendRequest {
  apiKey: string;
  toEmail: string;
  fromEmail: string;
  fromName: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TestSendRequest;

    if (!body.apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 },
      );
    }

    if (!body.toEmail) {
      return NextResponse.json(
        { success: false, error: "Recipient email is required" },
        { status: 400 },
      );
    }

    if (!body.fromEmail) {
      return NextResponse.json(
        { success: false, error: "From email is required" },
        { status: 400 },
      );
    }

    if (!body.fromName) {
      return NextResponse.json(
        { success: false, error: "From name is required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.toEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient email format" },
        { status: 400 },
      );
    }

    if (!emailRegex.test(body.fromEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid from email format" },
        { status: 400 },
      );
    }

    const result = await sendTestEmail(
      body.apiKey,
      body.toEmail,
      body.fromEmail,
      body.fromName,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors?.[0]?.message || "Failed to send test email",
          errors: result.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `Test email sent successfully to ${body.toEmail}`,
    });
  } catch (error) {
    console.error("[API] Test send error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
