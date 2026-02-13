import { NextResponse } from "next/server";
import { getRooms } from "@/lib/notion";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rooms = await getRooms();
        return NextResponse.json(rooms);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch rooms" },
            { status: 500 }
        );
    }
}
