"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import {
  Camera,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

const HOLD_REQUIRED = 5;

export default function FaceIDLoginPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const holdFramesRef = useRef(0);
  const completedRef = useRef(false);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "scanning" | "verifying" | "success" | "error">("loading");
  const [msg, setMsg] = useState("Đang khởi động AI...");
  const [faceDetected, setFaceDetected] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setIsModelLoaded(true);
        setStatus("idle");
        setMsg("Nhấn để bắt đầu xác thực khuôn mặt");
      } catch {
        setStatus("error");
        setMsg("Lỗi tải AI model. Tải lại trang.");
      }
    };
    loadModels();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = async () => {
    setIsScanning(true);
    setStatus("scanning");
    setMsg("Nhìn thẳng vào camera...");
    setFaceDetected(false);
    setProgress(0);
    holdFramesRef.current = 0;
    completedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 480 }, height: { ideal: 360 }, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => startLoop();
      }
    } catch {
      toast.error("Không mở được camera!");
      setIsScanning(false);
      setStatus("idle");
    }
  };

  const startLoop = () => {
    let last = 0;

    const loop = async (ts: number) => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      if (ts - last < 200) { animFrameRef.current = requestAnimationFrame(loop); return; }
      last = ts;

      if (isProcessingRef.current || completedRef.current) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      isProcessingRef.current = true;

      try {
        const det = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (!det) {
          setFaceDetected(false);
          holdFramesRef.current = 0;
          setProgress(0);
          isProcessingRef.current = false;
          animFrameRef.current = requestAnimationFrame(loop);
          return;
        }

        setFaceDetected(true);
        holdFramesRef.current++;
        setProgress(Math.min(holdFramesRef.current / HOLD_REQUIRED, 1));

        if (holdFramesRef.current >= HOLD_REQUIRED) {
          completedRef.current = true;
          setStatus("verifying");
          setMsg("Đang nhận diện...");
          isProcessingRef.current = false;
          await verifyFace(det.descriptor);
          return;
        }
      } catch {
        // skip
      }

      isProcessingRef.current = false;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const verifyFace = async (descriptor: Float32Array) => {
    try {
      const res = await fetch("/api/auth/face-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: Array.from(descriptor) }),
      });
      const data = await res.json();

      if (data.success && data.faceToken) {
        const result = await signIn("face-id", { faceToken: data.faceToken, redirect: false });
        if (result?.ok) {
          setStatus("success");
          setMsg("Đăng nhập thành công!");
          stopCamera();
          setTimeout(() => {
            if (data.roles?.includes("ADMIN")) router.push("/admin/overview");
            else if (data.roles?.includes("STAFF")) router.push("/staff");
            else router.push("/");
          }, 1000);
        } else {
          setStatus("error");
          setMsg("Phiên xác thực hết hạn.");
          stopCamera();
        }
      } else {
        setStatus("error");
        setMsg(data.message ?? "Khuôn mặt không khớp tài khoản nào.");
        stopCamera();
      }
    } catch {
      setStatus("error");
      setMsg("Lỗi kết nối. Thử lại.");
      stopCamera();
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setMsg("Nhấn để bắt đầu xác thực khuôn mặt");
    setIsScanning(false);
    setFaceDetected(false);
    setProgress(0);
    holdFramesRef.current = 0;
    completedRef.current = false;
    stopCamera();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "linear-gradient(180deg, #0a1a14 0%, #0d2218 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Back */}
      <button
        onClick={() => { stopCamera(); router.back(); }}
        style={{
          position: "absolute", top: 28, left: 28,
          display: "flex", alignItems: "center", gap: 6,
          color: "rgba(110,231,183,0.7)", fontSize: 14, fontWeight: 500,
          background: "none", border: "none", cursor: "pointer",
        }}
      >
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: 16,
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
            marginBottom: 14,
          }}>
            <ShieldCheck size={28} color="#34d399" />
          </div>
          <h1 style={{ margin: 0, color: "#fff", fontSize: 22, fontWeight: 700 }}>Đăng nhập FaceID</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(167,243,208,0.4)", fontSize: 13 }}>Xác thực bằng khuôn mặt</p>
        </div>

        {/* Camera */}
        <div style={{ position: "relative", width: 260, height: 260, margin: "0 auto 20px" }}>
          {/* Progress ring */}
          <svg
            width={272} height={272}
            style={{ position: "absolute", top: -6, left: -6, transform: "rotate(-90deg)" }}
          >
            <circle cx={136} cy={136} r={133} fill="none" stroke="rgba(55,65,81,0.3)" strokeWidth={4} />
            <circle
              cx={136} cy={136} r={133} fill="none"
              stroke={status === "success" ? "#10b981" : status === "error" ? "#ef4444" : faceDetected ? "#10b981" : "rgba(55,65,81,0.3)"}
              strokeWidth={4}
              strokeDasharray={836}
              strokeDashoffset={836 - 836 * progress}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.3s, stroke 0.3s" }}
            />
          </svg>

          <div style={{
            width: "100%", height: "100%", borderRadius: 9999,
            overflow: "hidden", background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(16,185,129,0.1)",
          }}>
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {status === "loading" ? (
                  <Loader2 size={40} color="rgba(16,185,129,0.3)" style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Camera size={48} color="rgba(16,185,129,0.12)" />
                )}
              </div>
            )}

            {/* Success / Error */}
            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: "absolute", inset: 0, borderRadius: 9999,
                    background: "rgba(16,185,129,0.9)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 size={64} color="#fff" />
                  </motion.div>
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: "absolute", inset: 0, borderRadius: 9999,
                    background: "rgba(239,68,68,0.85)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <XCircle size={64} color="#fff" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{ margin: "0 0 20px", color: "rgba(209,250,229,0.6)", fontSize: 14, fontWeight: 500, minHeight: 20 }}
          >
            {msg}
          </motion.p>
        </AnimatePresence>

        {/* Not scanning: start button */}
        {!isScanning && status !== "success" && (
          <button
            onClick={startCamera}
            disabled={!isModelLoaded}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 12,
              background: isModelLoaded ? "#10b981" : "rgba(16,185,129,0.3)",
              color: "#052e16", fontSize: 14, fontWeight: 700,
              border: "none", cursor: isModelLoaded ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: isModelLoaded ? "0 8px 24px rgba(16,185,129,0.2)" : "none",
              transition: "all 0.2s",
            }}
          >
            {isModelLoaded ? (
              <><Camera size={18} /> Bắt đầu xác thực</>
            ) : (
              <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Đang tải AI...</>
            )}
          </button>
        )}

        {/* Error: retry */}
        {status === "error" && (
          <button
            onClick={handleRetry}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 12,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 12,
            }}
          >
            <RefreshCw size={16} /> Thử lại
          </button>
        )}

        {/* Scanning hint */}
        {isScanning && status === "scanning" && !faceDetected && (
          <p style={{ color: "rgba(251,191,36,0.6)", fontSize: 12, marginTop: 8 }}>
            Đưa mặt vào giữa khung hình tròn
          </p>
        )}

        <p style={{ marginTop: 32, color: "rgba(167,243,208,0.2)", fontSize: 12 }}>
          Chưa đăng ký?{" "}
          <button
            onClick={() => { stopCamera(); router.push("/staff/hr"); }}
            style={{ color: "rgba(52,211,153,0.5)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: 12 }}
          >
            Đăng ký FaceID
          </button>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
