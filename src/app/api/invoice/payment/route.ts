import { NextRequest, NextResponse } from "next/server"
import db from "@/db/db"
import { Decimal } from "@prisma/client/runtime/library"
import { processPayment, maskCardNumber, getCardBrand } from "@/lib/plugnpay"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            invoiceNumber,
            email,
            phone,
            paymentAmount,
            cardNumber,
            cardName,
            cardExp,
            cardCvv,
            billingAddress,
            billingCity,
            billingState,
            billingZip,
            billingCountry
        } = body

        // Validate required fields
        if (!invoiceNumber || !email || !phone || !paymentAmount) {
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

        // Get invoice details
        const invoice = await db.invoice.findUnique({
            where: { invoiceNumber }
        })

        if (!invoice) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            )
        }

        if (invoice.status === "PAID") {
            return NextResponse.json(
                { error: "Invoice is already paid" },
                { status: 400 }
            )
        }

        // Validate payment amount
        const amount = new Decimal(paymentAmount)
        if (amount.lte(0)) {
            return NextResponse.json(
                { error: "Invalid payment amount" },
                { status: 400 }
            )
        }

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
            amount: paymentAmount.toString(),
            email,
            phone,
            billingName: cardName,
            billingAddress1: billingAddress,
            billingCity,
            billingState,
            billingZip,
            billingCountry: billingCountry || 'US',
            orderID: `INV-${invoiceNumber}-${Date.now()}`,
            description: `Payment for Invoice #${invoiceNumber}`,
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

        // Generate payment number
        const paymentNumber = `PAY-${Date.now()}`

        // Determine card brand
        const cardBrand = getCardBrand(cardNumber)
        const last4 = maskCardNumber(cardNumber).slice(-4)

        // Create payment record
        const payment = await db.payment.create({
            data: {
                paymentNumber,
                invoiceId: invoice.id,
                customerId: invoice.customerId,
                amount: new Decimal(paymentAmount),
                paymentMethod: "CREDIT_CARD",
                paymentStatus: "COMPLETED",
                last4Digits: last4,
                cardBrand,
                transactionId: paymentResult.transactionId || `TXN-${Date.now()}`,
                authorizationCode: paymentResult.authCode,
                processorResponse: paymentResult.message,
                receiptSent: false,
                notes: `Online payment via Plug n Pay. Contact: ${email}, Phone: ${phone}`
            }
        })

        // Update invoice status
        const newPaidAmount = new Decimal(invoice.paidAmount).plus(new Decimal(paymentAmount))
        const newBalanceDue = new Decimal(invoice.totalAmount).minus(newPaidAmount)
        const isPaid = newBalanceDue.lte(0)

        await db.invoice.update({
            where: { id: invoice.id },
            data: {
                paidAmount: newPaidAmount,
                balanceDue: newBalanceDue.gte(0) ? newBalanceDue : new Decimal(0),
                status: isPaid ? "PAID" : invoice.status === "OVERDUE" ? "OVERDUE" : "PARTIALLY_PAID",
                paidDate: isPaid ? new Date() : invoice.paidDate
            }
        })

        // Return success with payment ID
        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            paymentNumber: payment.paymentNumber,
            transactionId: paymentResult.transactionId,
            authorizationCode: paymentResult.authCode
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