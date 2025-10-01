import db from "@/db/db"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"

export async function GET(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    
    const product = await db.product.findUnique({
        where: { id }, 
        select: { filePath: true, name: true }
    })

    if (product == null) return notFound()

    const { size } = await fs.stat(product.filePath)
    const file = await fs.readFile(product.filePath)
    const extension = product.filePath.split(".").pop()

    // TypeScript workaround for Next.js 15 Buffer type issue
    return new NextResponse(file as unknown as BodyInit, {
        headers: {
            "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
            "Content-Length": size.toString()
        }
    })
}