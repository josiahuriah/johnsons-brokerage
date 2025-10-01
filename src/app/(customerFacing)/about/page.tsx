import { PageHeader } from "@/app/admin/_components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Users, Globe, TrendingUp } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <PageHeader>About Us</PageHeader>
            
            <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground">
                    With over 10 years of experience in customs brokerage, we are your trusted partner
                    for seamless international trade operations.
                </p>
            </div>
            
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Our Story</h2>
                <p className="text-muted-foreground">
                    Johnson's Customs Brokerage has grown from a small family-owned 
                    business to one of the most trusted names in customs clearance. Our commitment to 
                    accuracy, compliance, and customer service has made us the preferred choice for 
                    businesses of all sizes.
                </p>
                <p className="text-muted-foreground">
                    We specialize in providing comprehensive customs brokerage services, including import 
                    and export clearance, permit processing, and compliance consulting. Our team of 
                    licensed customs brokers and transport specialists ensures your shipments clear customs 
                    quickly and efficiently.
                </p>
            </section>
            
            <section className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <Users className="w-8 h-8 text-primary mb-2" />
                        <CardTitle>Expert Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Our licensed customs brokers have decades of combined experience
                            in international trade regulations and compliance.
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <Globe className="w-8 h-8 text-primary mb-2" />
                        <CardTitle>Global Reach</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            We handle customs clearance at all major ports in The Bahamas and work with
                            partners worldwide for seamless international shipping.
                        </p>
                    </CardContent>
                </Card>
                
                {/* <Card>
                    <CardHeader>
                        <TrendingUp className="w-8 h-8 text-primary mb-2" />
                        <CardTitle>Technology Driven</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Our advanced customs software ensures accurate, fast processing
                            and real-time tracking of your shipments.
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
                        <CardTitle>100% Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            We maintain perfect compliance records with CBP and all relevant
                            regulatory agencies.
                        </p>
                    </CardContent>
                </Card> */}
            </section>
            
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Our Mission</h2>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-lg italic">
                            "To simplify international trade by providing fast, accurate, and compliant
                            customs clearance services while delivering exceptional value to our clients."
                        </p>
                    </CardContent>
                </Card>
            </section>
            
            {/* <section className="space-y-4">
                <h2 className="text-2xl font-bold">Certifications & Memberships</h2>
                <ul className="space-y-2">
                    <li className="flex gap-2">
                        <CheckCircle2 className="text-primary mt-1" size={20} />
                        <span>Licensed Customs Broker - US Customs and Border Protection</span>
                    </li>
                    <li className="flex gap-2">
                        <CheckCircle2 className="text-primary mt-1" size={20} />
                        <span>Member - National Customs Brokers Association (NCBFAA)</span>
                    </li>
                    <li className="flex gap-2">
                        <CheckCircle2 className="text-primary mt-1" size={20} />
                        <span>C-TPAT Certified</span>
                    </li>
                    <li className="flex gap-2">
                        <CheckCircle2 className="text-primary mt-1" size={20} />
                        <span>ISO 9001:2015 Certified</span>
                    </li>
                </ul>
            </section> */}
        </div>
    )
}

