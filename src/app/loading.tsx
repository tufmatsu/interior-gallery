export default function Loading() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      zIndex: 9999,
    }}>
      <div style={{
        position: "relative",
        width: "100px",
        height: "100px",
      }}>
        {/* 回転するリング */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: "3px solid #e0e0e0",
          borderTopColor: "#35c5f0",
          animation: "spin 1s linear infinite",
        }} />
        {/* 中央のアイコン */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hitoheya_lab_icon_final.svg"
          alt="読み込み中..."
          width="60"
          height="60"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
}
