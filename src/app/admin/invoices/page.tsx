import { Button } from "@/components/ui/button"
import { PageHeader } from "../_components/PageHeader"
import Link from "next/link"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import db from "@/db/db"
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { TogglePaidStatusDropdownItem, DeleteDropdownItem } from "./_components/InvoiceActions"

export default function AdminInvoicesPage() {
    return <>
        <div className="flex justify-between items-center gap-4">
            <PageHeader>Invoices</PageHeader>
            <Button>
                <Link href="/admin/invoices/new">Create Invoice</Link>
            </Button>
        </div>
        <InvoicesTable />
    </>
}

async function InvoicesTable() {
    const invoices = await db.invoice.findMany({
        select: {
            id: true,
            invoiceNumber: true,
            customer: {
                select: {
                    companyName: true,
                    contactName: true
                }
            },
            totalAmount: true,
            status: true,
            createdAt: true,
            payments: {
                where: { paymentStatus: "COMPLETED" },
                select: {
                    paymentDate: true
                },
                orderBy: {
                    paymentDate: "desc"
                },
                take: 1
            }
        },
        orderBy: { createdAt: "desc" }
    })

    if (invoices.length === 0) return <p className="text-muted-foreground mt-4">No invoices found</p>

    return <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-0">
                    <span className="sr-only">Paid Status</span>
                </TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-0">
                    <span className="sr-only">Actions</span>
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {invoices.map(invoice => {
                const isPaid = invoice.status === "PAID"
                const paidDate = invoice.payments[0]?.paymentDate

                return (
                    <TableRow key={invoice.id}>
                        <TableCell>
                            {isPaid ? (
                                <>
                                    <CheckCircle2 className="text-green-600" />
                                    <span className="sr-only">Paid</span>
                                </>
                            ) : (
                                <>
                                    <span className="sr-only">Unpaid</span>
                                    <XCircle className="stroke-destructive" />
                                </>)
                            }
                        </TableCell>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                            <div>
                                <div className="font-medium">{invoice.customer.companyName}</div>
                                <div className="text-sm text-muted-foreground">{invoice.customer.contactName}</div>
                            </div>
                        </TableCell>
                        <TableCell>{invoice.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                            {paidDate ? paidDate.toLocaleDateString() : <span className="text-muted-foreground">Not Paid</span>}
                        </TableCell>
                        <TableCell>{formatCurrency(Number(invoice.totalAmount))}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <MoreVertical />
                                    <span className="sr-only">Actions</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/invoices/${invoice.id}`}>View Details</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/invoices/${invoice.id}/edit`}>Edit</Link>
                                    </DropdownMenuItem>
                                    <TogglePaidStatusDropdownItem
                                        id={invoice.id}
                                        isPaid={isPaid}
                                    />
                                    <DropdownMenuSeparator />
                                    <DeleteDropdownItem
                                        id={invoice.id}
                                        disabled={isPaid}
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
    </Table>
}