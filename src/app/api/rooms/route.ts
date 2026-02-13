import { NextResponse } from "next/server";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

    // デバッグ: 環境変数の確認
    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
        return NextResponse.json({
            error: "Missing env vars",
            hasApiKey: !!NOTION_API_KEY,
            hasDbId: !!NOTION_DATABASE_ID,
        }, { status: 500 });
    }

    try {
        // Notion APIを直接呼んで、生のレスポンスを確認
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

        // APIエラーの場合、そのまま返す
        if (!response.ok) {
            return NextResponse.json({
                error: "Notion API error",
                status: response.status,
                notionResponse: data,
            }, { status: 500 });
        }

        // 成功：データを整形して返す
        const rooms = data.results.map((page: any) => {
            const name = page.properties.Name?.title?.[0]?.plain_text || "No Title";
            const description = page.properties.Description?.rich_text?.[0]?.plain_text || "";
            const slug = page.properties.Slug?.rich_text?.[0]?.plain_text || "";

            let imageUrl = "";
            if (page.properties.Image?.files?.length > 0) {
                const file = page.properties.Image.files[0];
                imageUrl = file.file?.url || file.external?.url || "";
            }

            const itemsText = page.properties.Items?.rich_text?.[0]?.plain_text || "";
            const items = itemsText
                .split("\n")
                .filter((line: string) => line.trim() !== "")
                .map((line: string) => {
                    const parts = line.trim().split(/\s+/);
                    const url = parts.pop() || "";
                    const itemName = parts.join(" ") || "Link";
                    return { name: itemName, url };
                });

            return { id: page.id, name, description, slug, imageUrl, items };
        });

        return NextResponse.json(rooms);
    } catch (error: any) {
        return NextResponse.json({
            error: "Exception",
            message: error?.message || "Unknown",
            stack: error?.stack || "",
        }, { status: 500 });
    }
}
