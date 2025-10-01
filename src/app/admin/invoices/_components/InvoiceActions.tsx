"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTransition } from "react"
import { toggleInvoicePaidStatus, deleteInvoice } from "../../_actions/invoices"
import { useRouter } from "next/navigation"

export function TogglePaidStatusDropdownItem({ id, isPaid }: { id: string, isPaid: boolean }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    
    return (
        <DropdownMenuItem 
            disabled={isPending} 
            onClick={() => {
                startTransition(async () => {
                    await toggleInvoicePaidStatus(id, !isPaid)
                    router.refresh()
                })
            }}
        >
            Mark as {isPaid ? "Unpaid" : "Paid"}
        </DropdownMenuItem>
    )
}

export function DeleteDropdownItem({ id, disabled }: { id: string, disabled: boolean }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    return (
        <DropdownMenuItem 
            variant="destructive" 
            disabled={disabled || isPending} 
            onClick={() => {
                startTransition(async () => {
                    await deleteInvoice(id)
                    router.refresh()
                })
            }}
        >
            Delete
        </DropdownMenuItem>
    )
}