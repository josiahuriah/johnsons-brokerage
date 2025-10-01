import { InvoicePaymentForm } from "./InvoicePaymentForm"
import { PageHeader } from "@/app/admin/_components/PageHeader"

export default function InvoicePaymentPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <PageHeader>Pay Your Invoice</PageHeader>
            <p className="text-muted-foreground">
                Enter your invoice number and payment information below to pay your outstanding invoice.
            </p>
            <InvoicePaymentForm />
        </div>
    )
}