export default function Loading() {
    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "3px",
            backgroundColor: "#35c5f0",
            zIndex: 9999,
            animation: "loading-bar 2s ease-in-out infinite"
        }}>
            <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}
