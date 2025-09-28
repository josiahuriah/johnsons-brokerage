import db from "@/db/db"
import { notFound } from "next/navigation"
import { CheckoutForm } from "./components/CheckoutForm"

export default async function PurchasePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const product = await db.product.findUnique({
        where: { id }
    })
    
    if (product == null) return notFound()
    
    return <CheckoutForm product={product} />
}