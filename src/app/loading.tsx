/**
 * Streaming loading UI — displayed instantly while a page
 * or layout segment is loading. Because this is a Server
 * Component, it ships zero JS to the client.
 */
export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          border: "2.5px solid var(--border)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }}
      />
      <span style={{ fontSize: 14, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
        Loading…
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
