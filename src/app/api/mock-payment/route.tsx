import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createElement } from "react"
import PurchaseReceiptEmail from "@/email/PurchaseReceipt"
import { processPayment } from "@/lib/plugnpay"

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email,
      productId,
      priceInCents,
      cardNumber,
      cardName,
      cardExp,
      cardCvv
    } = body

    // Validate required fields
    if (!email || !productId || !priceInCents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate card details
    if (!cardNumber || !cardName || !cardExp) {
      return NextResponse.json(
        { error: "Missing card details" },
        { status: 400 }
      )
    }

    // Get product details
    const product = await db.product.findUnique({ where: { id: productId } })
    if (product == null) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Convert cents to dollars for Plug n Pay
    const amountInDollars = (priceInCents / 100).toFixed(2)

    // Get client IP address
    const ipAddress = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown'

    // Process payment through Plug n Pay
    const paymentResult = await processPayment({
      cardNumber,
      cardName,
      cardExp,
      cardCvv,
      amount: amountInDollars,
      email,
      orderID: `PROD-${productId}-${Date.now()}`,
      description: `Purchase: ${product.name}`,
      ipAddress: ipAddress.split(',')[0].trim(),
    })

    // Check if payment was successful
    if (!paymentResult.success) {
      return NextResponse.json(
        {
          error: "Payment failed",
          message: paymentResult.errorMessage || "Payment could not be processed"
        },
        { status: 402 }
      )
    }

    // Use the real transaction ID as the payment intent ID
    const paymentIntentId = paymentResult.transactionId || `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create or update user and create order
    const userFields = {
      email,
      orders: { create: { productId, pricePaidInCents: priceInCents } },
    }

    const {
      orders: [order],
    } = await db.user.upsert({
      where: { email },
      create: userFields,
      update: userFields,
      select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
    })

    // Create download verification
    const downloadVerification = await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    })

    // Send confirmation email (if Resend is configured)
    if (resend && process.env.SENDER_EMAIL) {
      try {
        await resend.emails.send({
          from: `Support <${process.env.SENDER_EMAIL}>`,
          to: email,
          subject: "Order Confirmation",
          react: createElement(PurchaseReceiptEmail, {
            order,
            product,
            downloadVerificationId: downloadVerification.id
          })
        })
        console.log("Confirmation email sent to:", email)
      } catch (emailError) {
        console.error("Failed to send email:", emailError)
        // Continue even if email fails
      }
    } else {
      console.log("Email not sent: Resend not configured")
    }

    // Return success with payment intent ID
    return NextResponse.json({
      paymentIntentId,
      downloadVerificationId: downloadVerification.id,
      transactionId: paymentResult.transactionId,
      authorizationCode: paymentResult.authCode,
      success: true
    })

  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json(
      {
        error: "Payment processing failed",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}