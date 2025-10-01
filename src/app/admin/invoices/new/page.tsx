import { PageHeader } from "../../_components/PageHeader";
import { InvoiceForm } from "../_components/InvoiceForm";

export default function NewInvoicePage() {
    return (
        <>
            <PageHeader>Create Invoice</PageHeader>
            <InvoiceForm />
        </>
    )
}