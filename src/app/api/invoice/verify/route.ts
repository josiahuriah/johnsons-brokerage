import { NextRequest, NextResponse } from "next/server"
import db from "@/db/db"

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const invoiceNumber = searchParams.get("invoiceNumber")
    
    if (!invoiceNumber) {
        return NextResponse.json(
            { error: "Invoice number is required" },
            { status: 400 }
        )
    }
    
    try {
        const invoice = await db.invoice.findUnique({
            where: { invoiceNumber },
            select: {
                id: true,
                invoiceNumber: true,
                totalAmount: true,
                paidAmount: true,
                balanceDue: true,
                status: true,
                customer: {
                    select: {
                        companyName: true,
                        contactName: true
                    }
                }
            }
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
        
        return NextResponse.json({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            totalAmount: Number(invoice.totalAmount),
            paidAmount: Number(invoice.paidAmount),
            balanceDue: Number(invoice.balanceDue),
            status: invoice.status,
            customer: invoice.customer
        })
        
    } catch (error) {
        console.error("Error verifying invoice:", error)
        return NextResponse.json(
            { error: "Failed to verify invoice" },
            { status: 500 }
        )
    }
}