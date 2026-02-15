"use client";

import { useEffect, useState } from "react";
// import Image from "next/image"; // 今回は使わない

type Item = {
  name: string;
  url: string;
};

type Room = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  images?: string[]; // 複数画像
  items: Item[]; // 解析済み配列として受け取る
};

// リンク先のドメインに応じてテキストと色を変えるヘルパー関数
const getLinkStyle = (url: string) => {
  if (url.includes("r10.to") || url.includes("rakuten")) {
    return {
      text: "(楽天で見る ↗)",
      hoverColor: "#bf0000",
      hoverBg: "#fff5f5"
    };
  } else if (url.includes("amazon") || url.includes("amzn")) {
    return {
      text: "(Amazonで見る ↗)",
      hoverColor: "#ff9900",
      hoverBg: "#fffaf0"
    };
  } else {
    return {
      text: "(サイトを見る ↗)",
      hoverColor: "#35c5f0",
      hoverBg: "#f0f9ff"
    };
  }
};

const ITEMS_PER_PAGE = 6; // 1回に表示する件数

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [displayedRooms, setDisplayedRooms] = useState<Room[]>([]); // 表示中のデータ
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1); // 現在のページ数

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/rooms");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRooms(data);
        // 最初は ITEMS_PER_PAGE 件だけ表示
        setDisplayedRooms(data.slice(0, ITEMS_PER_PAGE));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // 「もっと見る」ボタンを押したときの処理
  const loadMore = () => {
    const nextPage = page + 1;
    const nextWait = nextPage * ITEMS_PER_PAGE;
    setDisplayedRooms(rooms.slice(0, nextWait));
    setPage(nextPage);
  };

  const openModal = (room: Room) => {
    setCurrentRoom(room);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setCurrentRoom(null);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="header">
        <div className="logo">
          ひとへや<span>Lab</span>
        </div>
      </header>

      <div className="container">
        <section className="hero">
          <h1>ひとへやLabの空想コレクション</h1>
          <p>「空想ひとりぐらし」のアーカイブ。</p>
        </section>

        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <main className="gallery-grid">
              {displayedRooms.length === 0 ? (
                <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                  部屋データが見つかりません。Notionに追加してください。
                </p>
              ) : (
                displayedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="room-card"
                    onClick={() => openModal(room)}
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
                      <h2 className="room-title">{room.name}</h2>
                      <div className="room-meta">
                        <span>詳細を見る &rarr;</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </main>

            {/* もっと見るボタン */}
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
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#333";
                    e.currentTarget.style.backgroundColor = "#f9f9f9";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#ddd";
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  もっと見る
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div
        className={`modal ${currentRoom ? "active" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal-content">
          <header className="modal-header">
            <div className="modal-title">{currentRoom?.name}</div>
            <button className="close-btn" onClick={closeModal}>
              &times;
            </button>
          </header>

          <div className="modal-body">
            <div className="slider-container" style={{
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              gap: "0", // 隙間なくす
              width: "100%", // 親要素の幅いっぱいに
              paddingBottom: "10px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}>
              {currentRoom?.images && currentRoom.images.length > 0 ? (
                currentRoom.images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: "0 0 100%", // 必ず親の幅いっぱい
                      minWidth: "100%", // 縮小防止
                      width: "100%",
                      scrollSnapAlign: "start", // 左端合わせ
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "auto",
                      maxHeight: "60vh", // 高さは制限
                      position: "relative"
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${currentRoom.name} - ${idx + 1}`}
                      className="detail-hero"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        borderRadius: "8px",
                        display: "block"
                      }}
                    />
                  </div>
                ))
              ) : (
                currentRoom?.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentRoom.imageUrl}
                    alt={currentRoom.name}
                    className="detail-hero"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "60vh",
                      objectFit: "contain",
                      borderRadius: "8px"
                    }}
                  />
                )
              )}
            </div>

            <div className="detail-info">
              <p className="detail-description">{currentRoom?.description}</p>

              {/* 家具リスト表示エリア */}
              {currentRoom?.items && currentRoom.items.length > 0 && (
                <div className="furniture-section" style={{ marginTop: "30px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>
                    参考にしたアイテム
                  </h3>
                  <div className="furniture-list-simple" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {currentRoom.items.map((item, index) => {
                      const styleInfo = getLinkStyle(item.url);
                      return (
                        <a
                          key={index}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="furniture-link-btn"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "8px 16px",
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            color: "#333",
                            textDecoration: "none",
                            transition: "all 0.2s",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = styleInfo.hoverColor;
                            e.currentTarget.style.color = styleInfo.hoverColor;
                            e.currentTarget.style.backgroundColor = styleInfo.hoverBg;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = "#ddd";
                            e.currentTarget.style.color = "#333";
                            e.currentTarget.style.backgroundColor = "#fff";
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{item.name}</span>
                          <span style={{ marginLeft: "8px", fontSize: "11px", color: "#666" }}>
                            {styleInfo.text}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer style={{ marginTop: "60px", padding: "40px 20px", textAlign: "center", borderTop: "1px solid #eaeaea", color: "#666", fontSize: "12px" }}>
        <p>&copy; {new Date().getFullYear()} ひとへやLab</p>
        <p style={{ marginTop: "10px", opacity: 0.8 }}>※当サイトはアフィリエイト広告（楽天アフィリエイト等）を利用しています。</p>
      </footer>
    </>
  );
}
