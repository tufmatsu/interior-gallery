import { NextResponse } from "next/server";
import { getRooms } from "@/lib/notion";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // デバッグ: 環境変数が読めているか確認
        const hasApiKey = !!process.env.NOTION_API_KEY;
        const hasDbId = !!process.env.NOTION_DATABASE_ID;

        if (!hasApiKey || !hasDbId) {
            return NextResponse.json({
                error: "Missing environment variables",
                hasApiKey,
                hasDbId,
                envKeys: Object.keys(process.env).filter(k => k.includes("NOTION")),
            }, { status: 500 });
        }

        const rooms = await getRooms();
        return NextResponse.json(rooms);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch rooms", message: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}
