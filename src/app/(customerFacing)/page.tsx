import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
    return (
         <main className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-4 py-12">
                <div className="flex justify-center mb-6">
                    <Image 
                        src="/logo.png" 
                        alt="Val's Brokerage Service Logo" 
                        width={500} 
                        height={200}
                        priority
                    />
                </div>
                <h1 className="text-4xl font-bold">Val's Brokerage</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Fast and reliable customs clearance for your imports and exports
                </p>
                <div className="flex gap-4 justify-center pt-4">
                    <Button size="lg" asChild>
                        <Link href="/invoice-payment">Pay Invoice</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                </div>
            </section>

            {/* Rates Section */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-center">Our Competitive Rates</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Entry - LCL</CardTitle>
                            <CardDescription>Quick and efficient import processing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-3xl font-bold">$100</p>
                                <p className="text-sm text-muted-foreground">per entry</p>
                                <div className="pt-2 border-t">
                                    <p className="text-sm">+$5 per line item</p>
                                    <p className="text-xs text-muted-foreground">(for invoices with more than 4 lines)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Entry - Containerized Cargo</CardTitle>
                            <CardDescription>Clearance for Full containers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-3xl font-bold">$300</p>
                                <p className="text-sm text-muted-foreground">per entry</p>
                                <div className="pt-2 border-t">
                                    <p className="text-sm">+$5 per line item</p>
                                    <p className="text-xs text-muted-foreground">(for invoices with more than 4 lines)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Export Entry</CardTitle>
                            <CardDescription>Seamless export documentation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-3xl font-bold">$100</p>
                                <p className="text-sm text-muted-foreground">per entry</p>
                                <div className="pt-2 border-t">
                                    <p className="text-sm">+$5 per line item</p>
                                    <p className="text-xs text-muted-foreground">(for invoices with more than 4 lines)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>OGA Permits</CardTitle>
                            <CardDescription>Fast permit processing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-3xl font-bold">$50</p>
                                <p className="text-sm text-muted-foreground">per permit</p>
                                <div className="pt-2 border-t">
                                    <p className="text-sm">Quick turnaround</p>
                                    <p className="text-xs text-muted-foreground">Most permits same week</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>OGA Submission</CardTitle>
                            <CardDescription>For all other OGA processing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-3xl font-bold">$40</p>
                                <p className="text-sm text-muted-foreground">per entry</p>
                                <div className="pt-2 border-t">
                                    <p className="text-sm">All OGA requirements</p>
                                    <p className="text-xs text-muted-foreground">From health to agriculture permits</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Consultancy</CardTitle>
                            <CardDescription>Expert Advice for related inquiries</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-l font-bold">Custom Pricing</p>
                                <p className="text-sm text-muted-foreground">Contact us for a detailed quote</p>
                                <div className="pt-2 border-t">
                                    <p className="text-sm">Flexible rates</p>
                                    <p className="text-xs text-muted-foreground">Depends on consultation requirements</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Services Section */}
            <section className="space-y-6 bg-muted/50 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-center">Why Choose Us</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex gap-3">
                        <CheckCircle2 className="text-primary mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold">Expert Compliance</h3>
                            <p className="text-muted-foreground">Stay compliant with all customs regulations and avoid costly delays</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <CheckCircle2 className="text-primary mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold">Fast Processing</h3>
                            <p className="text-muted-foreground">Quick turnaround times to keep your supply chain moving</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <CheckCircle2 className="text-primary mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold">Transparent Pricing</h3>
                            <p className="text-muted-foreground">No hidden fees - know exactly what you'll pay upfront</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <CheckCircle2 className="text-primary mt-1 shrink-0" />
                        <div>
                            <h3 className="font-semibold">24/7 Support</h3>
                            <p className="text-muted-foreground">Always available when you need assistance with your shipments</p>
                        </div>
                    </div>
                </div>
            </section>
      {/* Contact CTA Section */}
            <section className="text-center space-y-4 py-12 bg-primary/5 rounded-lg">
                <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Contact us today for a consultation or to discuss your customs brokerage needs
                </p>
                <div className="flex gap-4 justify-center pt-4">
                    <Button size="lg" asChild>
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/invoice-payment">Pay Invoice</Link>
                    </Button>
                </div>
            </section>
        </main>
    )
}