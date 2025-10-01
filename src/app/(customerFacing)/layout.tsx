import { Nav, NavLink } from "@/components/Nav"

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return <>
        <Nav>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/invoice-payment">Pay Invoice</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
        </Nav>
        <div className="container my-6">{children}</div>
        <footer className="border-t mt-12">
            <div className="container py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2025 Johnsons Customs Brokerage. All rights reserved.
                    </p>
                    <nav className="flex gap-4">
                        <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                            Privacy Policy
                        </a>
                        <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                            Contact
                        </a>
                    </nav>
                </div>
            </div>
        </footer>
    </>
}

