import { Button } from "@/components/ui/button"
import db from "@/db/db"
import { formatCurrency } from "@/lib/formatters"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent: string }>
}) {
  // Await searchParams for Next.js 15
  const params = await searchParams
  
  // For the mock system, we'll extract the timestamp from the payment intent
  // and find the most recent order
  // In a real system, you'd store the payment intent ID with the order
  
  if (!params.payment_intent || !params.payment_intent.startsWith("mock_pi_")) {
    return notFound()
  }
  
  // Extract timestamp from mock payment intent ID
  const parts = params.payment_intent.split("_")
  const timestamp = parseInt(parts[2])
  
  // Find the most recent order created around that time (within 1 minute)
  const oneMinuteAgo = new Date(timestamp - 60000)
  const oneMinuteAfter = new Date(timestamp + 60000)
  
  const order = await db.order.findFirst({
    where: {
      createdAt: {
        gte: oneMinuteAgo,
        lte: oneMinuteAfter
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      product: true
    }
  })
  
  if (!order || !order.product) {
    return notFound()
  }
  
  const product = order.product
  const isSuccess = true // In mock mode, all completed payments are successful

  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <h1 className="text-4xl font-bold">
        {isSuccess ? "Success!" : "Error!"}
      </h1>
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
          <Button className="mt-4" size="lg" asChild>
            {isSuccess ? (
              <a
                href={`/products/download/${await createDownloadVerification(
                  product.id
                )}`}
              >
                Download
              </a>
            ) : (
              <Link href={`/products/${product.id}/purchase`}>Try Again</Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

async function createDownloadVerification(productId: string) {
  return (
    await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })
  ).id
}