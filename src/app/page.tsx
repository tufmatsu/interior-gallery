"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Room = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
};

// 部屋名の末尾が数字の場合は「㎡」を付与するヘルパー関数
const formatRoomName = (name: string) => {
  if (name.includes("畳") && /[\d.]+$/.test(name)) {
    return name + "㎡";
  }
  return name;
};

const ITEMS_PER_PAGE = 6;

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [displayedRooms, setDisplayedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/rooms");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRooms(data);
        setDisplayedRooms(data.slice(0, ITEMS_PER_PAGE));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    const nextWait = nextPage * ITEMS_PER_PAGE;
    setDisplayedRooms(rooms.slice(0, nextWait));
    setPage(nextPage);
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          ひとへや<span>Lab</span>
        </div>
      </header>

      <div className="container">
        <section className="hero" style={{
          textAlign: "center",
          marginTop: "0px",
          marginBottom: "30px",
          padding: "15px 15px 20px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}>
          <div style={{ marginBottom: "15px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hitoheya_lab_icon_final.svg"
              alt="ひとへやLab"
              width="90"
              height="90"
              style={{ display: "block", margin: "0 auto" }}
            />
          </div>
          <p style={{ fontSize: "14px", color: "#0288d1", fontWeight: "bold", marginBottom: "15px", letterSpacing: "1px", marginTop: "10px" }}>「空想ひとりぐらし」のアーカイブ。</p>

          <div style={{ maxWidth: "600px", margin: "0 auto", lineHeight: "1.6", color: "#555", fontSize: "13px" }}>
            <p style={{ marginBottom: "10px" }}>
              最近インテリアにハマった<strong style={{ color: "#333", background: "linear-gradient(transparent 60%, #bae6fd 60%)" }}>ひとへやLab研究員</strong>が、<br className="pc-only" />
              住んでみたい部屋をお届けします。お部屋づくりの辞書としてお使いください！
            </p>
          </div>

          <details style={{
            marginTop: "15px",
            maxWidth: "580px",
            marginLeft: "auto",
            marginRight: "auto",
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
                当サイトにはアフィリエイトリンクが含まります。<br />
                リンク先で商品を購入いただくと研究員に収益が発生することがあります。<br />
                もし望まれない方は、商品名を検索して別のサイト等でご購入くださいませ～🌿
              </p>
            </div>
          </details>
        </section>

        {isLoading ? (
          <div className="loading-container" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
            <div className="spinner-ring"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hitoheya_lab_icon_loading.svg"
              alt="Loading..."
              width="60"
              height="60"
              className="loading-logo"
            />
          </div>
        ) : (
          <>
            <main className="gallery-grid">
              {displayedRooms.length === 0 ? (
                <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                  部屋データが見つかりません。Notionに追加してください。
                </p>
              ) : (
                displayedRooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/rooms/${room.slug}`}
                    className="room-card"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="room-image-wrapper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={room.imageUrl || "https://placehold.co/600x400?text=No+Image"}
                        alt={room.name}
                        className="room-image"
                        loading="lazy"
                      />
                    </div>
                    <div className="room-info">
                      <h2 className="room-title" style={{ color: "#333" }}>{formatRoomName(room.name)}</h2>
                      <div className="room-meta">
                        <span style={{ color: "#35c5f0" }}>詳細を見る &rarr;</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </main>

            {displayedRooms.length < rooms.length && (
              <div style={{ textAlign: "center", marginTop: "40px", marginBottom: "40px" }}>
                <button
                  onClick={loadMore}
                  style={{
                    padding: "12px 32px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#333",
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "30px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                >
                  もっと見る
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <footer style={{ marginTop: "60px", padding: "40px 20px", textAlign: "center", borderTop: "1px solid #eaeaea", color: "#666", fontSize: "12px" }}>
        <p>&copy; {new Date().getFullYear()} ひとへやLab</p>
      </footer>
    </>
  );
}
