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
    const [billingAddress, setBillingAddress] = useState("")
    const [billingCity, setBillingCity] = useState("")
    const [billingState, setBillingState] = useState("")
    const [billingZip, setBillingZip] = useState("")

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
            setErrorMessage("Please fill in all required fields")
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setErrorMessage("Please enter a valid email address")
            return
        }

        // Card number validation (must be 13-19 digits)
        const cleanCardNumber = cardNumber.replace(/\s+/g, "")
        if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            setErrorMessage("Please enter a valid card number")
            return
        }

        // Expiry validation
        if (expiryDate.length !== 5) {
            setErrorMessage("Please enter expiry date in MM/YY format")
            return
        }

        // CVV validation
        if (cvv.length < 3 || cvv.length > 4) {
            setErrorMessage("Please enter a valid CVV")
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
                    cardNumber: cleanCardNumber,
                    cardName: cardholderName,
                    cardExp: expiryDate,
                    cardCvv: cvv,
                    billingAddress,
                    billingCity,
                    billingState,
                    billingZip,
                    billingCountry: "US"
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Payment processing failed")
            }

            // Redirect to receipt page
            router.push(`/invoice-payment/receipt?payment=${data.paymentId}`)

        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Payment failed. Please try again.")
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

                    {/* Billing Address */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium">Billing Address</h3>

                        <div className="space-y-2">
                            <Label htmlFor="billingAddress">Street Address</Label>
                            <Input
                                id="billingAddress"
                                type="text"
                                placeholder="123 Main St"
                                value={billingAddress}
                                onChange={(e) => setBillingAddress(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="billingCity">City</Label>
                                <Input
                                    id="billingCity"
                                    type="text"
                                    placeholder="New York"
                                    value={billingCity}
                                    onChange={(e) => setBillingCity(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="billingState">State</Label>
                                <Input
                                    id="billingState"
                                    type="text"
                                    placeholder="NY"
                                    value={billingState}
                                    onChange={(e) => setBillingState(e.target.value)}
                                    maxLength={2}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="billingZip">ZIP Code</Label>
                            <Input
                                id="billingZip"
                                type="text"
                                placeholder="10001"
                                value={billingZip}
                                onChange={(e) => setBillingZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                                maxLength={5}
                            />
                        </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium">Payment Information</h3>

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