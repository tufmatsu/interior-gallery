// Edge Runtime 対応版 - @notionhq/client を使わず、直接 fetch で Notion API を呼ぶ

export const getRooms = async () => {
  // Edge Runtime では関数内で process.env を読む必要がある
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  if (!NOTION_DATABASE_ID) {
    console.error("NOTION_DATABASE_ID is not defined");
    return [];
  }
  if (!NOTION_API_KEY) {
    console.error("NOTION_API_KEY is not defined");
    return [];
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
        body: JSON.stringify({
          sorts: [
            {
              property: "Name",
              direction: "ascending",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Notion API error response:", response.status, errorBody);
      throw new Error(`Notion API returned ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((page: any) => {
      const name = page.properties.Name?.title?.[0]?.plain_text || "No Title";
      const description =
        page.properties.Description?.rich_text?.[0]?.plain_text || "";
      const slug = page.properties.Slug?.rich_text?.[0]?.plain_text || "";

      // 画像URLの取得
      let imageUrl = "";
      if (page.properties.Image?.files?.length > 0) {
        const file = page.properties.Image.files[0];
        imageUrl = file.file?.url || file.external?.url || "";
      }

      // Itemsの解析（テキスト形式: "アイテム名 URL" を1行ずつ）
      const itemsText =
        page.properties.Items?.rich_text?.[0]?.plain_text || "";
      const items = itemsText
        .split("\n")
        .filter((line: string) => line.trim() !== "")
        .map((line: string) => {
          const parts = line.trim().split(/\s+/);
          const url = parts.pop() || "";
          const name = parts.join(" ") || "Link";
          return { name, url };
        });

      return {
        id: page.id,
        name,
        description,
        slug,
        imageUrl,
        items,
      };
    });
  } catch (error) {
    console.error("Notion API Error:", error);
    return [];
  }
};
