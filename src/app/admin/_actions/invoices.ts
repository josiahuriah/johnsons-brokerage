"use server"

import db from "@/db/db"
import { z } from "zod"
import fs from "fs/promises"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Decimal } from "@prisma/client/runtime/library"

const fileSchema = z.instanceof(File, { message: "Required" })

const invoiceSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    totalAmount: z.coerce.number().positive("Amount must be greater than 0"),
    description: z.string().optional(),
    file: fileSchema.optional(),
})

function generateInvoiceNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `INV-${year}${month}-${random}`
}

export async function createInvoice(prevState: unknown, formData: FormData) {
    const result = invoiceSchema.safeParse(Object.fromEntries(formData.entries()))
    
    if (result.success === false) {
        return result.error.flatten().fieldErrors
    }

    const data = result.data

    try {
        // Handle file upload if present
        let filePath: string | null = null
        if (data.file && data.file.size > 0) {
            await fs.mkdir("invoices", { recursive: true })
            filePath = `invoices/${crypto.randomUUID()}-${data.file.name}`
            await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
        }

        // Generate unique invoice number
        let invoiceNumber: string
        let isUnique = false
        
        do {
            invoiceNumber = generateInvoiceNumber()
            const existing = await db.invoice.findUnique({
                where: { invoiceNumber }
            })
            if (!existing) isUnique = true
        } while (!isUnique)

        // Calculate due date (30 days from now)
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30)

        // Create invoice
        await db.invoice.create({
            data: {
                invoiceNumber,
                customerId: data.customerId,
                dueDate,
                status: "PENDING",
                subtotal: new Decimal(data.totalAmount),
                totalAmount: new Decimal(data.totalAmount),
                balanceDue: new Decimal(data.totalAmount),
                taxAmount: new Decimal(0),
                paidAmount: new Decimal(0),
                notes: data.description || null,
                // If you want to track file attachments, you might need to add a field to your schema
            },
        })

        revalidatePath("/admin")
        revalidatePath("/admin/invoices")
        redirect("/admin/invoices")
        
    } catch (error) {
        console.error("Failed to create invoice:", error)
        return { general: ["Failed to create invoice. Please try again."] }
    }
}

export async function updateInvoice(
    id: string,
    prevState: unknown,
    formData: FormData
) {
    const result = invoiceSchema.safeParse(Object.fromEntries(formData.entries()))
    
    if (result.success === false) {
        return result.error.flatten().fieldErrors
    }

    const data = result.data
    const invoice = await db.invoice.findUnique({ where: { id } })

    if (invoice == null) return notFound()

    try {
        // Handle file upload if present
        let filePath: string | null = null
        if (data.file && data.file.size > 0) {
            await fs.mkdir("invoices", { recursive: true })
            filePath = `invoices/${crypto.randomUUID()}-${data.file.name}`
            await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
        }

        // Update invoice
        await db.invoice.update({
            where: { id },
            data: {
                customerId: data.customerId,
                totalAmount: new Decimal(data.totalAmount),
                balanceDue: new Decimal(data.totalAmount).minus(invoice.paidAmount),
                subtotal: new Decimal(data.totalAmount),
                notes: data.description || null,
            },
        })

        revalidatePath("/admin")
        revalidatePath("/admin/invoices")
        redirect("/admin/invoices")
        
    } catch (error) {
        console.error("Failed to update invoice:", error)
        return { general: ["Failed to update invoice. Please try again."] }
    }
}

export async function toggleInvoicePaidStatus(
    id: string,
    isPaid: boolean
) {
    const invoice = await db.invoice.findUnique({ where: { id } })
    
    if (!invoice) return notFound()

    const newStatus = isPaid ? "PAID" : "PENDING"
    const paidAmount = isPaid ? invoice.totalAmount : new Decimal(0)
    const balanceDue = isPaid ? new Decimal(0) : invoice.totalAmount

    await db.invoice.update({
        where: { id },
        data: {
            status: newStatus,
            paidAmount,
            balanceDue
        }
    })

    // If marking as paid, create a payment record
    if (isPaid) {
        const paymentNumber = `PAY-${Date.now()}`
        await db.payment.create({
            data: {
                paymentNumber,
                invoiceId: id,
                customerId: invoice.customerId,
                amount: invoice.totalAmount,
                paymentMethod: "OTHER",
                paymentStatus: "COMPLETED",
                notes: "Manually marked as paid by admin"
            }
        })
    }

    revalidatePath("/admin")
    revalidatePath("/admin/invoices")
}

export async function deleteInvoice(id: string) {
    const invoice = await db.invoice.findUnique({ where: { id } })

    if (invoice == null) return notFound()

    // Only allow deletion of unpaid invoices
    if (invoice.status === "PAID") {
        throw new Error("Cannot delete paid invoices")
    }

    await db.invoice.delete({ where: { id } })

    revalidatePath("/admin")
    revalidatePath("/admin/invoices")
}