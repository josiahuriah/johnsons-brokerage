"use client"

import { userOrderExists } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/formatters"
import Image from "next/image"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

type CheckoutFormProps = {
  product: {
    id: string
    imagePath: string
    name: string
    priceInCents: number
    description: string
  }
}

export function CheckoutForm({ product }: CheckoutFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  
  // Form state
  const [email, setEmail] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardholderName, setCardholderName] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    
    // Basic validation
    if (!email || !cardNumber || !expiryDate || !cvv || !cardholderName) {
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
      // Check if user already purchased this product
      const orderExists = await userOrderExists(email, product.id)
      
      if (orderExists) {
        setErrorMessage(
          "You have already purchased this product. Try downloading it from the My Orders page"
        )
        setIsLoading(false)
        return
      }
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create mock payment session
      const response = await fetch("/api/mock-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          productId: product.id,
          priceInCents: product.priceInCents,
          // Mock payment details (not used in processing, just for demonstration)
          paymentMethod: {
            cardNumber: cardNumber.slice(-4), // Only send last 4 digits
            cardholderName,
          }
        }),
      })
      
      if (!response.ok) {
        throw new Error("Payment processing failed")
      }
      
      const { paymentIntentId } = await response.json()
      
      // Redirect to success page with mock payment intent ID
      router.push(`/payment/success?payment_intent=${paymentIntentId}`)
      
    } catch {
      setErrorMessage("Payment failed. Please try again.")
      setIsLoading(false)
    }
  }
  
  // Format card number as user types
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, "")
    const matches = cleaned.match(/\d{1,4}/g) || []
    return matches.join(" ").substr(0, 19)
  }
  
  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D+/g, "")
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4)
    }
    return cleaned
  }

  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={`/${product.imagePath}`}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>
        <div>
          <div className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            {product.description}
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription className="text-orange-600">
              Demo Mode: Use any test card number (e.g., 4242 4242 4242 4242)
            </CardDescription>
            {errorMessage && (
              <CardDescription className="text-destructive">
                {errorMessage}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
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
                : `Pay ${formatCurrency(product.priceInCents / 100)}`}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}