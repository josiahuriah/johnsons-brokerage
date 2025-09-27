import db from "@/db/db"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"

export async function Get(req: NextRequest, {params:{id}}: {params: {id : string}}) {

    const data = await db.product.findUnique({where: {id}, 
        select: {filePath: true, 
            name: true}})

    if (product == null) return notFound()

    const {size} = await fs.stat(product.filePath)
    const file = await fs.readFile(product.filePath)
    const extension = ProductForm.filePath.split(".").pop()

    return new NextResponse(file, {headers: {
        "cContent-Dispotion": `attachment; filename="${product.name}.${extension}"`,
        "content-Length": size.toString()
    }})
}