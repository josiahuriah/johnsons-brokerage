import { PageHeader } from "@/app/admin/_components/PageHeader"

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader>Privacy Policy</PageHeader>
            
            <div className="prose prose-gray max-w-none">
                <p className="text-sm text-muted-foreground">Last updated: January 1, 2025</p>
                
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, including:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Company and contact information</li>
                        <li>Shipping and customs documentation</li>
                        <li>Payment and billing information</li>
                        <li>Communications with our team</li>
                    </ul>
                </section>
                
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Process customs clearance for your shipments</li>
                        <li>Communicate with you about your account and services</li>
                        <li>Process payments and send invoices</li>
                        <li>Comply with legal and regulatory requirements</li>
                        <li>Improve our services and customer experience</li>
                    </ul>
                </section>
                
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">3. Information Sharing</h2>
                    <p>We may share your information with:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>US Customs and Border Protection and other government agencies as required</li>
                        <li>Shipping carriers and logistics partners</li>
                        <li>Service providers who assist in our operations</li>
                        <li>Legal authorities when required by law</li>
                    </ul>
                </section>
                
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">4. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your
                        personal information against unauthorized access, alteration, disclosure, or destruction.
                        This includes encryption, secure servers, and restricted access to sensitive data.
                    </p>
                </section>
                
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">5. Data Retention</h2>
                    <p>
                        We retain your information for as long as necessary to provide services and comply
                        with legal obligations. Customs records are retained according to CBP requirements,
                        typically for 5 years after the date of entry.
                    </p>
                </section>
                
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Access your personal information</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your information (subject to legal requirements)</li>
                        <li>Opt-out of marketing communications</li>
                    </ul>
                </section>
                
                {/* <section className="space-y-4">
                    <h2 className="text-xl font-semibold">7. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or our data practices, please contact us at:
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                        <p>Professional Customs Brokerage</p>
                        <p>Privacy Department</p>
                        <p>123 Trade Center Drive, Suite 456</p>
                        <p>Miami, FL 33166</p>
                        <p>Email: privacy@customsbroker.com</p>
                        <p>Phone: (305) 555-0100</p>
                    </div>
                </section> */}
            </div>
        </div>
    )
}

