import React from "react";
import Lottie from "lottie-react";
import successAnimation from "../animations/success.json";

export default function SuccessPopup({ onHome, onOrders }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32, minWidth: 320, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.15)"
      }}>
        <div style={{ width: 120, height: 120, margin: "0 auto" }}>
          <Lottie animationData={successAnimation} loop={true} />
        </div>
        <h2 style={{ color: "#16a34a", margin: "16px 0 8px" }}>Đặt hàng thành công!</h2>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
          <button onClick={onHome} style={{
            padding: "10px 24px", borderRadius: 8, border: "none", background: "#e5e7eb", color: "#111", fontWeight: 500, cursor: "pointer"
          }}>Trang chủ</button>
          <button onClick={onOrders} style={{
            padding: "10px 24px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontWeight: 500, cursor: "pointer"
          }}>Đơn hàng</button>
        </div>
      </div>
    </div>
  );
} 