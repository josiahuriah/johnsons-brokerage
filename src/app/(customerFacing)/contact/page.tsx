"use client"

import { useState, FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/app/admin/_components/PageHeader"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitMessage(null)
        
        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message')
        }
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            
            if (response.ok) {
                setSubmitMessage({ type: 'success', text: 'Thank you for your message. We\'ll get back to you soon!' })
                e.currentTarget.reset()
            } else {
                throw new Error('Failed to send message')
            }
        } catch (error) {
            setSubmitMessage({ type: 'error', text: 'Failed to send message. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }
    
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <PageHeader>Contact Us</PageHeader>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Send us a message</CardTitle>
                        <CardDescription>
                            We'll respond to your inquiry within 24 business hours
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input id="name" name="name" required />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" name="email" type="email" required />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" type="tel" />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input id="subject" name="subject" required />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="message">Message *</Label>
                                <Textarea id="message" name="message" rows={5} required />
                            </div>
                            
                            {submitMessage && (
                                <div className={`text-sm ${submitMessage.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                                    {submitMessage.text}
                                </div>
                            )}
                            
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                
                {/* Contact Information */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Get in Touch</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* <div className="flex gap-3">
                                <MapPin className="text-primary mt-1" size={20} />
                                <div>
                                    <p className="font-medium">Office Address</p>
                                    <p className="text-sm text-muted-foreground">
                                        123 Trade Center Drive<br />
                                        Suite 456<br />
                                        Miami, FL 33166
                                    </p>
                                </div>
                            </div> */}
                            
                            <div className="flex gap-3">
                                <Phone className="text-primary mt-1" size={20} />
                                <div>
                                    <p className="font-medium">Phone</p>
                                    <p className="text-sm text-muted-foreground">
                                        Main: (242) 447-3193
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Mail className="text-primary mt-1" size={20} />
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">
                                        General: info@johnsonsbrokerage.com<br />
                                        Support: support@johnsonsbrokerage.com
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Clock className="text-primary mt-1" size={20} />
                                <div>
                                    <p className="font-medium">Business Hours</p>
                                    <p className="text-sm text-muted-foreground">
                                        Monday - Friday: 8:00 AM - 6:00 PM EST<br />
                                        Saturday: 9:00 AM - 2:00 PM EST<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Emergency Support</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                                For urgent customs clearance issues outside business hours:
                            </p>
                            <p className="font-medium">24/7 Hotline: (305) 555-0911</p>
                        </CardContent>
                    </Card> */}
                </div>
            </div>
        </div>
    )
}

