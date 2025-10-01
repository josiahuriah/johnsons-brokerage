import { NextResponse } from 'next/server'
import db from '@/db/db'

export async function GET() {
    try {
        const customers = await db.customer.findMany({
            orderBy: { companyName: 'asc' }
        })
        return NextResponse.json(customers)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }
}