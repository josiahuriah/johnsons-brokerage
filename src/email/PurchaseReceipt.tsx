// src/email/PurchaseReceipt.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
  Link,
  Section,
} from "@react-email/components"
import { formatCurrency } from "@/lib/formatters"

type PurchaseReceiptEmailProps = {
  product: {
    name: string
    imagePath: string
    description: string
    priceInCents: number
  }
  order: {
    id: string
    pricePaidInCents: number
    createdAt: Date
  }
  downloadVerificationId: string
}

export default function PurchaseReceiptEmail({
  product,
  order,
  downloadVerificationId,
}: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Download {product.name} and view receipt</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="max-w-xl">
            <Heading as="h1">Purchase Receipt</Heading>
            <Section>
              <Text className="text-lg">Thank you for your order!</Text>
              <Text>
                Order ID: <strong>{order.id}</strong>
              </Text>
              <Text>
                Order Date: <strong>{order.createdAt.toLocaleDateString()}</strong>
              </Text>
            </Section>
            
            <Section className="border-t border-gray-300 pt-4 mt-4">
              <Heading as="h2" className="text-xl">
                Your Purchase
              </Heading>
              <Text className="text-lg font-semibold">{product.name}</Text>
              <Text className="text-gray-600">{product.description}</Text>
              <Text className="text-lg">
                Price: <strong>{formatCurrency(order.pricePaidInCents / 100)}</strong>
              </Text>
            </Section>
            
            <Section className="border-t border-gray-300 pt-4 mt-4">
              <Heading as="h2" className="text-xl">
                Download Your Product
              </Heading>
              <Text>
                Click the link below to download your product. This link will expire in 24 hours.
              </Text>
              <Link
                href={`${process.env.NEXT_PUBLIC_SERVER_URL}/products/download/${downloadVerificationId}`}
                className="bg-blue-500 text-white px-4 py-2 rounded inline-block mt-2"
              >
                Download {product.name}
              </Link>
            </Section>
            
            <Section className="text-gray-500 text-sm mt-8">
              <Text>
                If you have any questions, please don't hesitate to contact our support team.
              </Text>
              <Text>
                This is an automated email. Please do not reply directly to this message.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

PurchaseReceiptEmail.PreviewProps = {
  product: {
    name: "Example Product",
    description: "This is an example product description",
    priceInCents: 4999,
    imagePath: "/products/example.jpg",
  },
  order: {
    id: "order_123456",
    pricePaidInCents: 4999,
    createdAt: new Date(),
  },
  downloadVerificationId: "verification_123456",
} as PurchaseReceiptEmailProps