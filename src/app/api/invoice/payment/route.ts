import { NextRequest, NextResponse } from "next/server"
import db from "@/db/db"
import { Decimal } from "@prisma/client/runtime/library"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { invoiceNumber, email, phone, paymentAmount, paymentMethod } = body
        
        // Validate required fields
        if (!invoiceNumber || !email || !phone || !paymentAmount) {
            return NextResponse.json(
                { error: "Missing required fields" },
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
        
        // Generate payment number
        const paymentNumber = `PAY-${Date.now()}`
        
        // Create payment record
        const payment = await db.payment.create({
            data: {
                paymentNumber,
                invoiceId: invoice.id,
                customerId: invoice.customerId,
                amount: new Decimal(paymentAmount),
                paymentMethod: "CREDIT_CARD",
                paymentStatus: "COMPLETED",
                last4Digits: paymentMethod.cardNumber,
                cardBrand: "Visa", // You would determine this from the card number
                transactionId: `TXN-${Date.now()}`,
                receiptSent: false,
                notes: `Online payment via website. Contact: ${email}, Phone: ${phone}`
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
                status: isPaid ? "PAID" : invoice.status === "OVERDUE" ? "OVERDUE" : "PARTIALLY_PAID"
            }
        })
        
        // Return success with payment ID
        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            paymentNumber: payment.paymentNumber
        })
        
    } catch (error) {
        console.error("Payment processing error:", error)
        return NextResponse.json(
            { error: "Payment processing failed" },
            { status: 500 }
        )
    }
}