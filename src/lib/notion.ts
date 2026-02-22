import { NextResponse } from "next/server";

// ヘルパー関数: Notionのプロパティをアイテムリストとしてパースする
function parseItems(property: any): { name: string; url: string }[] {
  if (!property) return [];

  // URL型の場合
  if (property.type === "url" && property.url) {
    return [{ name: "Link", url: property.url }];
  }

  // Rich Text型の場合
  if (property.type === "rich_text" && property.rich_text?.length > 0) {
    const textContent = property.rich_text.map((t: any) => t.plain_text).join("");
    const lines = textContent.split("\n").filter((line: string) => line.trim() !== "");
    const result = [];

    // 2行ずつペアにする（1行目=商品名、2行目=URL）
    for (let i = 0; i < lines.length; i += 2) {
      const name = lines[i]?.trim() || "Link";
      const url = lines[i + 1]?.trim() || "";
      if (url && (url.startsWith("http") || url.startsWith("www"))) {
        result.push({ name, url });
      }
    }
    return result;
  }
  return [];
}

export type Room = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  images: string[];
  items: { name: string; url: string }[];
  picks: { name: string; url: string }[];
};

export const getRooms = async (): Promise<Room[]> => {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) return [];

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
        body: JSON.stringify({
          sorts: [
            {
              timestamp: "created_time",
              direction: "descending",
            },
          ],
        }),
        next: { revalidate: 60 } // 1分キャッシュ
      }
    );

    if (!response.ok) return [];
    const data = await response.json();

    return data.results.map((page: any) => {
      const props = page.properties;
      const name = props.name?.title?.[0]?.plain_text || "No Title";
      const description = props.description?.rich_text?.[0]?.plain_text || "";
      const slug = props.slug?.rich_text?.[0]?.plain_text || page.id;

      let images: string[] = [];
      if (props.image?.files?.length > 0) {
        images = props.image.files.map((file: any) =>
          file.file?.url || file.external?.url || ""
        ).filter((url: string) => url !== "");
      }
      const imageUrl = images.length > 0 ? images[0] : "";

      const items = parseItems(props.items);
      const picks = parseItems(props.picks);

      return { id: page.id, name, description, slug, imageUrl, images, items, picks };
    });
  } catch (error) {
    console.error("Notion API Error:", error);
    return [];
  }
};

export const getRoomBySlug = async (slug: string): Promise<Room | null> => {
  const rooms = await getRooms();
  return rooms.find((r) => r.slug === slug) || null;
};
