
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const getRooms = async () => {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID is not defined in .env.local");
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: "name",
          direction: "ascending",
        },
      ],
    });

    return response.results.map((page: any) => {
      const props = page.properties;

      const name = props.name?.title?.[0]?.plain_text || props.Name?.title?.[0]?.plain_text || "No Title";
      const description =
        props.description?.rich_text?.[0]?.plain_text || props.Description?.rich_text?.[0]?.plain_text || "";
      const slug = props.slug?.rich_text?.[0]?.plain_text || props.Slug?.rich_text?.[0]?.plain_text || "";

      // 画像URLの取得
      let imageUrl = "";
      const imageProp = props.Image || props.image;
      if (imageProp?.files?.length > 0) {
        const fileObj = imageProp.files[0];
        if (fileObj.type === "file") {
          imageUrl = fileObj.file.url;
        } else if (fileObj.type === "external") {
          imageUrl = fileObj.external.url;
        }
      }

      // 家具データの解析 (Items列)
      const itemsRaw = props.items?.rich_text?.[0]?.plain_text || props.Items?.rich_text?.[0]?.plain_text || "";
      const items: { name: string; url: string }[] = [];

      if (itemsRaw) {
        // 行ごとに分割して処理
        const lines = itemsRaw.split(/\r\n|\n/).filter((line: string) => line.trim() !== "");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          // URLっぽい文字列が含まれているかチェック
          const urlMatch = line.match(/(https?:\/\/[^\s]+)/);

          if (urlMatch) {
            // URLが含まれる行なら、その前までの部分を名前とする
            let itemName = line.replace(urlMatch[0], "").trim();
            const itemUrl = urlMatch[0];

            if (!itemName && i > 0) {
              // 名前が空っぽ＝前の行が名前だった可能性が高い
              const prevItem = items[items.length - 1];
              if (prevItem && prevItem.url === "#") {
                itemName = prevItem.name;
                items.pop();
              }
            }
            if (!itemName) itemName = "Item Link";
            items.push({ name: itemName, url: itemUrl });
          } else {
            // URLが含まれない行は「一旦名前だけ」として登録
            items.push({ name: line, url: "#" });
          }
        }
      }

      return {
        id: page.id,
        name,
        description,
        slug,
        imageUrl,
        items, // 解析済みデータを返す
      };
    });
  } catch (error) {
    console.error("Notion API Error:", error);
    return [];
  }
};
