import { NextRequest, NextResponse } from "next/server"
import db from "@/db/db"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, email, phone, subject, message } = body
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }
        
        // Check if this email belongs to an existing customer
        const customer = await db.customer.findUnique({
            where: { email }
        })
        
        // Create contact message
        await db.contactMessage.create({
            data: {
                name,
                email,
                phone: phone || null,
                subject,
                message,
                status: "UNREAD",
                customerId: customer?.id || null
            }
        })
        
        return NextResponse.json({
            success: true,
            message: "Contact form submitted successfully"
        })
        
    } catch (error) {
        console.error("Contact form error:", error)
        return NextResponse.json(
            { error: "Failed to submit contact form" },
            { status: 500 }
        )
    }
}