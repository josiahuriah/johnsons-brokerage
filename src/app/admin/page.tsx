import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";

async function getSalesData() {
    const data = await db.payment.aggregate({
        where: { paymentStatus: "COMPLETED" },
        _sum: { amount: true },
        _count: true
    })

    const amount = data._sum.amount ? Number(data._sum.amount) : 0;

    return {
        amount: amount,
        numberOfSales: data._count
    }
}

async function getCustomerData() {
    const [customerCount, paymentData] = await Promise.all([
        db.customer.count(),
        db.payment.aggregate({
            where: { paymentStatus: "COMPLETED" },
            _sum: { amount: true }
        })
    ])

    const totalRevenue = paymentData._sum.amount ? Number(paymentData._sum.amount) : 0;

    return {
        customerCount,
        averageValuePerCustomer: customerCount === 0
            ? 0
            : totalRevenue / customerCount,
    }
}

async function getUnpaidInvoicesData() {
    const [unpaidCount, unpaidAmount] = await Promise.all([
        db.invoice.count({ where: { status: { in: ["PENDING", "OVERDUE"] } } }),
        db.invoice.aggregate({
            where: { status: { in: ["PENDING", "OVERDUE"] } },
            _sum: { balanceDue: true }
        })
    ])

    const totalUnpaid = unpaidAmount._sum.balanceDue ? Number(unpaidAmount._sum.balanceDue) : 0;

    return { unpaidCount, totalUnpaid }
}

export default async function AdminDashboard() {
    const [salesData, customerData, unpaidInvoicesData] = await Promise.all([
        getSalesData(),
        getCustomerData(),
        getUnpaidInvoicesData()
    ])

    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Total Revenue"
            subtitle={`${formatNumber(salesData.numberOfSales)} Payments`}
            body={formatCurrency(salesData.amount)}>
        </DashboardCard>
        <DashboardCard title="Customers"
            subtitle={`${formatCurrency(customerData.averageValuePerCustomer)} Average Value`}
            body={formatNumber(customerData.customerCount)}>
        </DashboardCard>
        <DashboardCard title="Unpaid Invoices"
            subtitle={`${formatCurrency(unpaidInvoicesData.totalUnpaid)} Outstanding`}
            body={formatNumber(unpaidInvoicesData.unpaidCount)}>
        </DashboardCard>
    </div>
}

type DashboardCardProps = {
    title: string
    subtitle: string
    body: string
}

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent><p>{body}</p></CardContent>
        </Card>
    )
}