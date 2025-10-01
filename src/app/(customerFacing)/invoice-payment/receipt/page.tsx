import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import db from "@/db/db"
import { formatCurrency } from "@/lib/formatters"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ReceiptPage({
    searchParams,
}: {
    searchParams: Promise<{ payment: string }>
}) {
    const params = await searchParams
    
    if (!params.payment) {
        return notFound()
    }
    
    const payment = await db.payment.findUnique({
        where: { id: params.payment },
        include: {
            invoice: {
                include: {
                    customer: true
                }
            }
        }
    })
    
    if (!payment) {
        return notFound()
    }
    
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                <h1 className="text-3xl font-bold">Payment Successful!</h1>
                <p className="text-muted-foreground">
                    Your payment has been processed successfully
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Payment Receipt</CardTitle>
                    <CardDescription>
                        Payment ID: {payment.paymentNumber}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Invoice Number</p>
                            <p className="font-medium">{payment.invoice.invoiceNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Payment Date</p>
                            <p className="font-medium">{payment.paymentDate.toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{payment.invoice.customer.companyName}</p>
                        <p className="text-sm">{payment.invoice.customer.contactName}</p>
                    </div>
                    
                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">Payment Details</p>
                        <div className="flex justify-between items-center">
                            <p className="font-medium">Amount Paid</p>
                            <p className="text-xl font-bold">{formatCurrency(Number(payment.amount))}</p>
                        </div>
                        {payment.last4Digits && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Card ending in {payment.last4Digits}
                            </p>
                        )}
                    </div>
                    
                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">Invoice Balance</p>
                        <div className="flex justify-between items-center">
                            <p className="font-medium">Remaining Balance</p>
                            <p className="text-lg">{formatCurrency(Number(payment.invoice.balanceDue))}</p>
                        </div>
                    </div>
                    
                    {payment.notes && (
                        <div className="border-t pt-4">
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="text-sm">{payment.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => window.print()}>
                    Print Receipt
                </Button>
                <Button asChild>
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        </div>
    )
}