import { getRoomBySlug, Room } from "@/lib/notion";
export const runtime = 'edge';
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

type Props = {
    params: Promise<{ slug: string }>;
};

// SEO用のメタデータを動的に生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const room = await getRoomBySlug(slug);
    if (!room) return { title: "Room Not Found" };

    return {
        title: `${room.name} | ひとへやLab`,
        description: room.description.substring(0, 160),
        openGraph: {
            images: [room.imageUrl],
        },
    };
}

// 部屋名の末尾が数字の場合は「㎡」を付与するヘルパー関数
const formatRoomName = (name: string) => {
    if (name.includes("畳") && /[\d.]+$/.test(name)) {
        return name + "㎡";
    }
    return name;
};

// リンク先のドメインに応じてテキストと色を変えるヘルパー関数
const getLinkStyle = (url: string) => {
    if (url.includes("r10.to") || url.includes("rakuten")) {
        return { text: "(楽天で見る ↗)", color: "#bf0000", bg: "#fff5f5" };
    } else if (url.includes("amazon") || url.includes("amzn")) {
        return { text: "(Amazonで見る ↗)", color: "#ff9900", bg: "#fffaf0" };
    }
    return { text: "(サイトを見る ↗)", color: "#35c5f0", bg: "#f0f9ff" };
};

export default async function RoomPage({ params }: Props) {
    const { slug } = await params;
    const room = await getRoomBySlug(slug);

    if (!room) {
        notFound();
    }

    const formattedName = formatRoomName(room.name);

    return (
        <div style={{ backgroundColor: "#fcfcfc", minHeight: "100vh" }}>
            <header className="header">
                <Link href="/" className="logo" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                    <span style={{ fontSize: "18px", color: "#828c94", fontWeight: "normal" }}>←</span>
                    <div>ひとへや<span>Lab</span></div>
                </Link>
            </header>

            <main style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
                {/* タイトルセクション */}
                <article>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#333", marginBottom: "15px", lineHeight: "1.4" }}>
                        {formattedName}
                    </h1>

                    <div style={{ color: "#666", lineHeight: "1.8", whiteSpace: "pre-wrap", marginBottom: "30px", fontSize: "15px" }}>
                        {room.description}
                    </div>

                    {/* 記事本文セクション (Notionの本文がある場合はこちらを優先) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "25px", marginBottom: "40px" }}>
                        {room.content && room.content.length > 0 ? (
                            room.content.map((block, idx) => (
                                <div key={idx}>
                                    {block.type === "image" ? (
                                        <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "10px" }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={block.content}
                                                alt={`${room.name} 写真 ${idx + 1}`}
                                                style={{ width: "100%", height: "auto", display: "block" }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{
                                            fontSize: "16px",
                                            lineHeight: "1.8",
                                            color: "#444",
                                            padding: "0 5px",
                                            marginBottom: "15px"
                                        }}>
                                            {block.content}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            // 本文が空の場合のフォールバック (プロパティの画像を一覧表示)
                            room.images.map((img, idx) => (
                                <div key={idx} style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img}
                                        alt={`${room.name} アングル ${idx + 1}`}
                                        style={{ width: "100%", height: "auto", display: "block" }}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {/* アイテムセクション */}
                    {(room.picks.length > 0 || room.items.length > 0) && (
                        <section style={{ backgroundColor: "#fff", padding: "25px", borderRadius: "16px", border: "1px solid #eee" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", borderLeft: "4px solid #35c5f0", paddingLeft: "15px" }}>
                                参考にしたアイテム
                            </h2>

                            {/* Pick Up! */}
                            {room.picks.length > 0 && (
                                <div style={{ marginBottom: "30px" }}>
                                    <div style={{ display: "inline-block", backgroundColor: "#0288d1", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                                        Pick Up!
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {room.picks.map((item, i) => {
                                            const style = getLinkStyle(item.url);
                                            return (
                                                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: "15px 20px",
                                                    backgroundColor: style.bg,
                                                    border: `1px solid ${style.color}33`,
                                                    borderRadius: "8px",
                                                    textDecoration: "none",
                                                    color: "#333",
                                                    transition: "transform 0.2s"
                                                }}>
                                                    <span style={{ fontWeight: "bold" }}>{item.name}</span>
                                                    <span style={{ fontSize: "12px", color: style.color, fontWeight: "bold" }}>{style.text}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* その他のアイテム */}
                            {room.items.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {room.items.map((item, i) => {
                                        const style = getLinkStyle(item.url);
                                        return (
                                            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
                                                padding: "8px 16px",
                                                backgroundColor: "#f9f9f9",
                                                border: "1px solid #ddd",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                                color: "#555",
                                                textDecoration: "none"
                                            }}>
                                                {item.name} <span style={{ fontSize: "10px", marginLeft: "4px", color: "#888" }}>↗</span>
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* 免責 */}
                    <p style={{ fontSize: "11px", color: "#aaa", marginTop: "40px", lineHeight: "1.6" }}>
                        ※掲載している3Dモデルは実際の製品を参考に作成していますが、細部が異なる場合があります。ご購入の際は各販売サイトの商品詳細をご確認ください。
                    </p>
                </article>
            </main>

            <footer style={{ marginTop: "60px", padding: "40px 20px", textAlign: "center", borderTop: "1px solid #eee", color: "#999", fontSize: "12px" }}>
                <p>&copy; {new Date().getFullYear()} ひとへやLab</p>
            </footer>
        </div>
    );
}
