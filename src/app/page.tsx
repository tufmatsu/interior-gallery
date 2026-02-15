"use client";

import { useEffect, useState, useRef } from "react";
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
  picks?: Item[]; // Pick Upアイテム
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 現在の画像のインデックス
  const sliderRef = useRef<HTMLDivElement>(null);

  // モーダルを開いたときや部屋が変わったときにスクロール位置をリセット
  useEffect(() => {
    if (currentRoom && sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: "instant" });
    }
  }, [currentRoom]);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const newIndex = Math.round(scrollLeft / clientWidth);
      setCurrentImageIndex(newIndex);
    }
  };

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
    setCurrentImageIndex(0);
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
        {/* PR表記 (位置変更: トップへ) */}
        <div style={{
          marginBottom: "20px",
          padding: "8px",
          backgroundColor: "#f5f5f5",
          color: "#666",
          fontSize: "12px",
          textAlign: "center",
          borderRadius: "4px"
        }}>
          本ページはプロモーションが含まれています
        </div>
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
            {/* スライダーコンテナ（相対配置でボタンを含む） */}
            <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
              <div
                ref={sliderRef}
                className="slider-container"
                onScroll={handleScroll}
                style={{
                  display: "flex",
                  justifyContent: "flex-start", // 左寄せを強制
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  gap: "0",
                  width: "100%",
                  height: "auto",
                  padding: "0", // パディングをリセット
                  aspectRatio: "unset", // アスペクト比固定を解除
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  scrollBehavior: "smooth"
                }}>
                {currentRoom?.images && currentRoom.images.length > 0 ? (
                  currentRoom.images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: "0 0 100%",
                        minWidth: "100%",
                        width: "100%",
                        scrollSnapAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "60vh", // 高さを固定
                        backgroundColor: "#f9f9f9",
                        position: "relative",
                        overflow: "hidden"
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${currentRoom.name} - ${idx + 1}`}
                        className="detail-hero"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover", // 枠いっぱいに表示（上下カット）
                          objectPosition: "center",
                          display: "block"
                        }}
                      />
                    </div>
                  ))
                ) : (
                  currentRoom?.imageUrl && (
                    <div style={{
                      width: "100%",
                      height: "60vh", // 高さ固定
                      display: "flex",
                      justifyContent: "center",
                      backgroundColor: "#f9f9f9",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentRoom.imageUrl}
                        alt={currentRoom.name}
                        className="detail-hero"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover", // 枠いっぱいに表示（上下カット）
                          objectPosition: "center",
                          display: "block"
                        }}
                      />
                    </div>
                  )
                )}
              </div>

              {/* ページネーションドット (画像が2枚以上ある場合のみ) */}
              {currentRoom?.images && currentRoom.images.length > 1 && (
                <div style={{
                  position: "absolute",
                  bottom: "15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "8px",
                  zIndex: 20,
                  padding: "6px 12px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(4px)"
                }}>
                  {currentRoom.images.map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: idx === currentImageIndex ? "#35c5f0" : "rgba(0, 0, 0, 0.3)",
                        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        transform: idx === currentImageIndex ? "scale(1.2)" : "scale(1)"
                      }}
                    />
                  ))}
                </div>
              )}

              {/* PC用ナビゲーションボタン (画像が2枚以上ある場合のみ) */}
              {currentRoom?.images && currentRoom.images.length > 1 && (
                <>
                  <button
                    className="slider-nav-btn prev"
                    onClick={() => scrollSlider("left")}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "10px",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      display: "none", // デフォルト非表示（CSSでPCのみ表示）
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      zIndex: 10
                    }}
                  >
                    &lt;
                  </button>
                  <button
                    className="slider-nav-btn next"
                    onClick={() => scrollSlider("right")}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      display: "none", // デフォルト非表示（CSSでPCのみ表示）
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      zIndex: 10
                    }}
                  >
                    &gt;
                  </button>
                </>
              )}
            </div>

            <div className="detail-info">
              <p className="detail-description">{currentRoom?.description}</p>

              {/* 免責事項 (新規追加) */}
              <p style={{ fontSize: "12px", color: "#888", marginTop: "20px", marginBottom: "10px", lineHeight: "1.5" }}>
                ※掲載している3Dモデルは実際の製品を参考に作成していますが、細部が異なる場合があります。ご購入の際は各販売サイトの商品詳細をご確認ください。
              </p>

              {/* 家具リストエリア (Pick Up + その他) */}
              {((currentRoom?.items && currentRoom.items.length > 0) || (currentRoom?.picks && currentRoom.picks.length > 0)) && (
                <div className="furniture-section" style={{ marginTop: "40px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
                    参考にしたアイテム
                  </h3>

                  {/* 1. Pick Up! セクション */}
                  {currentRoom?.picks && currentRoom.picks.length > 0 && (
                    <div className="pickup-section" style={{ marginBottom: "25px", padding: "20px", backgroundColor: "#f0f9ff", borderRadius: "12px", border: "1px solid #bae6fd" }}>
                      <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px", display: "flex", alignItems: "center" }}>
                        <span style={{ backgroundColor: "#0288d1", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "14px" }}>Pick Up!</span>
                      </h4>
                      <div className="furniture-list-simple" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {currentRoom.picks.map((item, index) => {
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
                                padding: "10px 20px",
                                backgroundColor: "#fff",
                                border: "1px solid #bae6fd",
                                borderRadius: "6px",
                                fontSize: "15px",
                                color: "#333",
                                textDecoration: "none",
                                transition: "all 0.2s",
                                boxShadow: "0 2px 5px rgba(2, 136, 209, 0.1)"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = styleInfo.hoverColor;
                                e.currentTarget.style.color = styleInfo.hoverColor;
                                e.currentTarget.style.backgroundColor = styleInfo.hoverBg;
                                e.currentTarget.style.transform = "translateY(-2px)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = "#bae6fd";
                                e.currentTarget.style.color = "#333";
                                e.currentTarget.style.backgroundColor = "#fff";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{item.name}</span>
                              <span style={{ marginLeft: "8px", fontSize: "11px", color: "#666" }}>
                                {styleInfo.text}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. その他アイテム (見出しなし) */}
                  {currentRoom?.items && currentRoom.items.length > 0 && (
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
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer style={{ marginTop: "60px", padding: "40px 20px", textAlign: "center", borderTop: "1px solid #eaeaea", color: "#666", fontSize: "12px" }}>
        <p>&copy; {new Date().getFullYear()} ひとへやLab</p>
      </footer>
    </>
  );
}
