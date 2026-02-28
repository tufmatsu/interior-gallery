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
                    {/* 実質的なタイトルとしての説明文 */}
                    <h1 style={{ fontSize: "26px", fontWeight: "bold", color: "#333", marginBottom: "12px", lineHeight: "1.4", letterSpacing: "-0.01em" }}>
                        {room.description}
                    </h1>

                    {/* 補足情報（部屋サイズなど） */}
                    <div style={{ color: "#828c94", fontSize: "14px", fontWeight: "500", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{formattedName}</span>
                        <span style={{ color: "#eee" }}>|</span>
                        <span>ひとへやLab</span>
                    </div>

                    {/* プロモーション表記 */}
                    <details style={{
                        marginBottom: "30px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "6px",
                        fontSize: "11px",
                        color: "#777",
                        textAlign: "left",
                        border: "1px solid #eee",
                        overflow: "hidden"
                    }}>
                        <summary style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            color: "#888",
                            listStyle: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            fontSize: "11px"
                        }}>
                            <span style={{ borderBottom: "1px dotted #999" }}>本ページはプロモーションを含みます</span>
                            <span style={{ fontSize: "10px", transform: "rotate(90deg)" }}>›</span>
                        </summary>
                        <div style={{ padding: "10px 15px 15px", borderTop: "1px solid #eee", lineHeight: "1.5" }}>
                            <p>
                                当サイトにはアフィリエイトリンクが含まれます。<br />
                                リンク先で商品を購入いただくと研究員に収益が発生することがあります。<br />
                                もし望まれない方は、商品名を検索して別のサイト等でご購入くださいませ～🌿
                            </p>
                        </div>
                    </details>

                    {/* 記事本文セクション (Notionの本文がある場合はこちらを優先) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "25px", marginBottom: "40px" }}>
                        {room.content && room.content.length > 0 ? (
                            (() => {
                                const totalImages = room.content.filter(b => b.type === "image").length;
                                let imageCount = 0;

                                // 挿入位置を決定：最初の画像を見つけ、次のブロックがテキストならその下
                                const firstImageIdx = room.content.findIndex(b => b.type === "image");
                                let insertionIdx = firstImageIdx;
                                if (firstImageIdx !== -1 && room.content[firstImageIdx + 1] && room.content[firstImageIdx + 1].type !== "image") {
                                    insertionIdx = firstImageIdx + 1;
                                }

                                return room.content.map((block, idx) => {
                                    let isNoCrop = false;

                                    if (block.type === "image") {
                                        imageCount++;
                                        // 1枚目、2枚目、または最後の画像の場合
                                        if (imageCount === 1 || imageCount === 2 || imageCount === totalImages) {
                                            isNoCrop = true;
                                        }
                                    }

                                    return (
                                        <div key={idx}>
                                            {block.type === "image" ? (
                                                <a href={block.content} target="_blank" rel="noopener noreferrer" className="image-link" style={{ display: "block", marginBottom: "10px" }}>
                                                    <div className={`room-image-block ${isNoCrop ? "no-crop" : ""}`} style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={block.content}
                                                            alt={`${room.name} 写真 ${idx + 1}`}
                                                            style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                                                        />
                                                    </div>
                                                </a>
                                            ) : block.type === "heading_1" ? (
                                                <h2 style={{
                                                    fontSize: "22px",
                                                    fontWeight: "bold",
                                                    color: "#333",
                                                    marginTop: "35px",
                                                    marginBottom: "15px",
                                                    paddingBottom: "10px",
                                                    borderBottom: "2px solid #35c5f0",
                                                    lineHeight: "1.4"
                                                }}>
                                                    {block.content}
                                                </h2>
                                            ) : block.type === "heading_2" ? (
                                                <h3 style={{
                                                    fontSize: "18px",
                                                    fontWeight: "bold",
                                                    color: "#444",
                                                    marginTop: "25px",
                                                    marginBottom: "10px",
                                                    paddingLeft: "12px",
                                                    borderLeft: "3px solid #35c5f0",
                                                    lineHeight: "1.4"
                                                }}>
                                                    {block.content}
                                                </h3>
                                            ) : block.type === "product_link" && block.url ? (
                                                (() => {
                                                    const linkStyle = getLinkStyle(block.url);
                                                    return (
                                                        <a href={block.url} target="_blank" rel="noopener noreferrer" style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            padding: "14px 18px",
                                                            backgroundColor: linkStyle.bg,
                                                            border: `1px solid ${linkStyle.color}33`,
                                                            borderRadius: "8px",
                                                            textDecoration: "none",
                                                            color: "#333",
                                                            marginTop: "8px",
                                                            marginBottom: "8px",
                                                            transition: "transform 0.2s, box-shadow 0.2s"
                                                        }}>
                                                            <span style={{ fontWeight: "bold", fontSize: "14px" }}>{block.content}</span>
                                                            <span style={{ fontSize: "11px", color: linkStyle.color, fontWeight: "bold", whiteSpace: "nowrap", marginLeft: "10px" }}>{linkStyle.text}</span>
                                                        </a>
                                                    );
                                                })()
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

                                            {/* 決定した挿入位置（画像またはその説明文の下）にPick Up!を挿入 */}
                                            {idx === insertionIdx && room.picks.length > 0 && (
                                                <div style={{ marginTop: "10px", marginBottom: "20px" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: "bold", color: "#666", marginBottom: "8px", borderLeft: "3px solid #35c5f0", paddingLeft: "8px" }}>
                                                        参考にしたアイテム
                                                    </div>
                                                    <div style={{ display: "inline-block", backgroundColor: "#0288d1", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", marginBottom: "10px" }}>
                                                        Pick Up!
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                        {room.picks.map((item, i) => {
                                                            const style = getLinkStyle(item.url);
                                                            return (
                                                                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    padding: "12px 15px",
                                                                    backgroundColor: style.bg,
                                                                    border: `1px solid ${style.color}33`,
                                                                    borderRadius: "8px",
                                                                    textDecoration: "none",
                                                                    color: "#333",
                                                                }}>
                                                                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>{item.name}</span>
                                                                    <span style={{ fontSize: "11px", color: style.color, fontWeight: "bold" }}>{style.text}</span>
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()
                        ) : (
                            // 本文が空の場合のフォールバック (プロパティの画像を一覧表示)
                            room.images.map((img, idx) => {
                                const isNoCrop = idx === 0 || idx === 1 || idx === room.images.length - 1;
                                return (
                                    <div key={idx}>
                                        <a href={img} target="_blank" rel="noopener noreferrer" className="image-link" style={{ display: "block", marginBottom: "20px" }}>
                                            <div className={`room-image-block ${isNoCrop ? "no-crop" : ""}`} style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={img}
                                                    alt={`${room.name} アングル ${idx + 1}`}
                                                    style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                                                />
                                            </div>
                                        </a>
                                        {/* 1枚目の直後にPick Up!を挿入 */}
                                        {idx === 0 && room.picks.length > 0 && (
                                            <div style={{ marginTop: "20px", marginBottom: "10px" }}>
                                                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#666", marginBottom: "8px", borderLeft: "3px solid #35c5f0", paddingLeft: "8px" }}>
                                                    参考にしたアイテム
                                                </div>
                                                <div style={{ display: "inline-block", backgroundColor: "#0288d1", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", marginBottom: "10px" }}>
                                                    Pick Up!
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                    {room.picks.map((item, i) => {
                                                        const style = getLinkStyle(item.url);
                                                        return (
                                                            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                padding: "12px 15px",
                                                                backgroundColor: style.bg,
                                                                border: `1px solid ${style.color}33`,
                                                                borderRadius: "8px",
                                                                textDecoration: "none",
                                                                color: "#333",
                                                            }}>
                                                                <span style={{ fontWeight: "bold", fontSize: "14px" }}>{item.name}</span>
                                                                <span style={{ fontSize: "11px", color: style.color, fontWeight: "bold" }}>{style.text}</span>
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* 参考にしたアイテムセクション */}
                    {(room.picks.length > 0 || room.items.length > 0) && (
                        <section id="items" style={{ backgroundColor: "#fff", padding: "25px", borderRadius: "16px", border: "1px solid #eee" }}>
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
