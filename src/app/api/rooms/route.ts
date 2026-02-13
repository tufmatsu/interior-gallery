import { NextResponse } from "next/server";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
        return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${NOTION_API_KEY}`,
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28",
                },
                body: JSON.stringify({}),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: "Notion API error", notionResponse: data }, { status: 500 });
        }

        // デバッグ: 最初のページのプロパティ名を返す
        const firstPage = data.results[0];
        if (firstPage) {
            return NextResponse.json({
                debug: true,
                propertyNames: Object.keys(firstPage.properties),
                properties: firstPage.properties,
            });
        }

        return NextResponse.json([]);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message }, { status: 500 });
    }
}
