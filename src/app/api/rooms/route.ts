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

        const rooms = data.results.map((page: any) => {
            const name = page.properties.name?.title?.[0]?.plain_text || "No Title";
            const description = page.properties.description?.rich_text?.[0]?.plain_text || "";
            const slug = page.properties.slug?.rich_text?.[0]?.plain_text || "";

            let imageUrl = "";
            if (page.properties.image?.files?.length > 0) {
                const file = page.properties.image.files[0];
                imageUrl = file.file?.url || file.external?.url || "";
            }

            // items: 複数のプロパティ型に対応
            const itemsProp = page.properties.items;
            let items: { name: string; url: string }[] = [];

            if (itemsProp) {
                const propType = itemsProp.type;

                if (propType === "url" && itemsProp.url) {
                    // URL型: 単一のURLが入っている
                    items = [{ name: "Link", url: itemsProp.url }];
                } else if (propType === "rich_text" && itemsProp.rich_text?.length > 0) {
                    // リッチテキスト型: 2行で1セット（商品名 + URL）
                    const itemsText = itemsProp.rich_text.map((t: any) => t.plain_text).join("");
                    const lines = itemsText
                        .split("\n")
                        .filter((line: string) => line.trim() !== "");

                    // 2行ずつペアにする（1行目=商品名、2行目=URL）
                    for (let i = 0; i < lines.length; i += 2) {
                        const itemName = lines[i]?.trim() || "Link";
                        const url = lines[i + 1]?.trim() || "";
                        if (url) {
                            items.push({ name: itemName, url });
                        }
                    }
                }

            }

            return { id: page.id, name, description, slug, imageUrl, items };
        });

        return NextResponse.json(rooms);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message }, { status: 500 });
    }
}
