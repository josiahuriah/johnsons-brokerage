"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/formatters"

export function InvoicePaymentForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>()
    const [invoiceDetails, setInvoiceDetails] = useState<any>(null)
    
    // Form state
    const [invoiceNumber, setInvoiceNumber] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [paymentAmount, setPaymentAmount] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [expiryDate, setExpiryDate] = useState("")
    const [cvv, setCvv] = useState("")
    const [cardholderName, setCardholderName] = useState("")

    // Fetch invoice details when invoice number is entered
    const fetchInvoiceDetails = async () => {
        if (!invoiceNumber) return
        
        try {
            const response = await fetch(`/api/invoice/verify?invoiceNumber=${invoiceNumber}`)
            if (response.ok) {
                const data = await response.json()
                setInvoiceDetails(data)
                setPaymentAmount(data.balanceDue.toString())
            } else {
                setInvoiceDetails(null)
                setErrorMessage("Invoice not found or already paid")
            }
        } catch (error) {
            setErrorMessage("Failed to verify invoice")
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        
        // Basic validation
        if (!invoiceNumber || !email || !phone || !paymentAmount || !cardNumber || !expiryDate || !cvv || !cardholderName) {
            setErrorMessage("Please fill in all fields")
            return
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setErrorMessage("Please enter a valid email address")
            return
        }
        
        setIsLoading(true)
        setErrorMessage(undefined)

        try {
            // Process payment
            const response = await fetch("/api/invoice/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    invoiceNumber,
                    email,
                    phone,
                    paymentAmount: parseFloat(paymentAmount),
                    paymentMethod: {
                        cardNumber: cardNumber.slice(-4),
                        cardholderName,
                    }
                }),
            })
            
            if (!response.ok) {
                throw new Error("Payment processing failed")
            }
            
            const { paymentId } = await response.json()
            
            // Redirect to receipt page
            router.push(`/invoice-payment/receipt?payment=${paymentId}`)
            
        } catch (error) {
            setErrorMessage("Payment failed. Please try again.")
            setIsLoading(false)
        }
    }
    
    // Format card number
    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s+/g, "")
        const matches = cleaned.match(/\d{1,4}/g) || []
        return matches.join(" ").substr(0, 19)
    }
    
    // Format expiry
    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D+/g, "")
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4)
        }
        return cleaned
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Payment</CardTitle>
                    <CardDescription>
                        Enter your invoice details and payment information
                    </CardDescription>
                    {errorMessage && (
                        <CardDescription className="text-destructive">
                            {errorMessage}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Invoice Number */}
                    <div className="space-y-2">
                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                        <div className="flex gap-2">
                            <Input
                                id="invoiceNumber"
                                type="text"
                                placeholder="INV-202501-0001"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                required
                            />
                            <Button type="button" variant="outline" onClick={fetchInvoiceDetails}>
                                Verify
                            </Button>
                        </div>
                        {invoiceDetails && (
                            <div className="text-sm text-muted-foreground">
                                Balance Due: {formatCurrency(invoiceDetails.balanceDue)}
                            </div>
                        )}
                    </div>
                    
                    {/* Contact Information */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* Payment Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="paymentAmount">Payment Amount</Label>
                        <Input
                            id="paymentAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            required
                        />
                        <div className="text-muted-foreground text-sm">
                            {paymentAmount && formatCurrency(parseFloat(paymentAmount))}
                        </div>
                    </div>
                    
                    {/* Card Details */}
                    <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                            id="cardNumber"
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            maxLength={19}
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                                id="expiry"
                                type="text"
                                placeholder="MM/YY"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                                maxLength={5}
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                                id="cvv"
                                type="text"
                                placeholder="123"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                maxLength={4}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                            id="cardholderName"
                            type="text"
                            placeholder="John Doe"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={isLoading}
                        type="submit"
                    >
                        {isLoading
                            ? "Processing..."
                            : `Pay ${paymentAmount ? formatCurrency(parseFloat(paymentAmount)) : "Invoice"}`}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}