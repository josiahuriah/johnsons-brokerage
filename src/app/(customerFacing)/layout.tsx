import { Nav, NavLink } from "@/components/Nav"

// forcing dynamic loading, avoiding caching to keep admin page up to date
export const dynamic = "force-dynamic" 

export default function Layout({
    children,

}: Readonly<{
    children: React.ReactNode
}>) {
    return <>
    <Nav>
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/orders">My Orders</NavLink>
    </Nav>
    <div className="container my-6"> {children} </div>
    </>
}