"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/formatters"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createInvoice, updateInvoice } from "../../_actions/invoices"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Invoice, Customer } from "@/generated/prisma"

export type FormState = {
    customerId?: string[]
    totalAmount?: string[]
    description?: string[]
    file?: string[]
    general?: string[]
}

type InvoiceFormProps = {
    invoice?: Invoice | null
    customers?: Customer[]
}

export function InvoiceForm({ invoice, customers }: InvoiceFormProps) {
    const [error, action] = useActionState(
        invoice == null ? createInvoice : updateInvoice.bind(null, invoice.id), 
        {} as FormState
    )
    const [totalAmount, setTotalAmount] = useState<number | undefined>(
        invoice?.totalAmount ? Number(invoice.totalAmount) : undefined
    )
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
        invoice?.customerId || ""
    )
    const [allCustomers, setAllCustomers] = useState<Customer[]>(customers || [])

    // Fetch customers on mount
    useEffect(() => {
        if (!customers) {
            fetch('/api/admin/customers')
                .then(res => res.json())
                .then(data => setAllCustomers(data))
                .catch(err => console.error('Failed to fetch customers:', err))
        }
    }, [customers])

    return (
        <form action={action} className="space-y-8 max-w-3xl">
            <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <Select 
                    name="customerId" 
                    value={selectedCustomerId} 
                    onValueChange={setSelectedCustomerId}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {allCustomers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                                {customer.companyName} - {customer.contactName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {error.customerId && <div className="text-destructive">{error.customerId}</div>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="totalAmount">Amount *</Label>
                <Input 
                    type="number" 
                    id="totalAmount" 
                    name="totalAmount" 
                    required 
                    value={totalAmount || ""} 
                    onChange={e => setTotalAmount(Number(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                />
                <div className="text-muted-foreground">
                    {formatCurrency(totalAmount || 0)}
                </div>
                {error.totalAmount && <div className="text-destructive">{error.totalAmount}</div>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                    id="description" 
                    name="description" 
                    defaultValue={invoice?.notes || ""} 
                    placeholder="Enter invoice description or notes..."
                    rows={4}
                />
                {error.description && <div className="text-destructive">{error.description}</div>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="file">Attachment (Optional)</Label>
                <Input 
                    type="file" 
                    id="file" 
                    name="file" 
                />
                {invoice && invoice.notes && (
                    <div className="text-muted-foreground text-sm">
                        Current file attached
                    </div>
                )}
                {error.file && <div className="text-destructive">{error.file}</div>}
            </div>

            {error.general && (
                <div className="text-destructive">{error.general}</div>
            )}

            <SubmitButton />
        </form>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create Invoice"}
    </Button>
}

// src/app/admin/invoices/[id]/edit/page.tsx
import db from "@/db/db";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { InvoiceForm } from "../../_components/InvoiceForm";

export default async function EditInvoicePage({
    params: { id },
}: {
    params: { id: string }
}) {
    const [invoice, customers] = await Promise.all([
        db.invoice.findUnique({ where: { id } }),
        db.customer.findMany({ orderBy: { companyName: "asc" } })
    ])
    
    return (
        <>
            <PageHeader>Edit Invoice</PageHeader>
            <InvoiceForm invoice={invoice} customers={customers} />
        </>
    )
}