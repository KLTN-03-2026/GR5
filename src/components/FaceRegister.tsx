"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { CheckCircle2, Loader2, XCircle, RefreshCw, X } from "lucide-react";

interface Props {
  onSuccess: (descriptor: number[], snapshot?: string) => void;
  onCancel: () => void;
}

function captureSnapshot(video: HTMLVideoElement): string | undefined {
  try {
    const w = video.videoWidth || 320;
    const h = video.videoHeight || 240;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return undefined;
  }
}

const HOLD_REQUIRED = 5;

export default function FaceRegister({ onSuccess, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const holdFramesRef = useRef(0);
  const completedRef = useRef(false);

  const [phase, setPhase] = useState<"loading" | "scanning" | "done" | "error">("loading");
  const [msg, setMsg] = useState("Đang tải AI...");
  const [faceDetected, setFaceDetected] = useState(false);
  const [progress, setProgress] = useState(0);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        if (cancelled) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 480 }, height: { ideal: 360 }, facingMode: "user" },
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            if (cancelled) return;
            setPhase("scanning");
            setMsg("Nhìn thẳng vào camera...");
            startLoop();
          };
        }
      } catch {
        if (!cancelled) { setPhase("error"); setMsg("Không thể mở camera hoặc tải AI."); }
      }
    };

    init();
    return () => { cancelled = true; stopCamera(); };
  }, [stopCamera]);

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
          const snapshot = videoRef.current ? captureSnapshot(videoRef.current) : undefined;
          stopCamera();
          setPhase("done");
          setMsg("Hoàn tất!");
          onSuccess(Array.from(det.descriptor), snapshot);
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

  const handleRetry = async () => {
    setFaceDetected(false);
    setProgress(0);
    holdFramesRef.current = 0;
    completedRef.current = false;
    setPhase("scanning");
    setMsg("Nhìn thẳng vào camera...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 480 }, height: { ideal: 360 }, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      startLoop();
    } catch {
      setPhase("error");
      setMsg("Không thể mở camera.");
    }
  };

  return (
    <div style={{
      background: "#111827", borderRadius: 16, padding: 20,
      marginTop: 16, position: "relative",
    }}>
      {/* Close */}
      <button
        onClick={() => { stopCamera(); onCancel(); }}
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
          width: 30, height: 30, borderRadius: 8,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#9ca3af", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={14} />
      </button>

      {/* Camera */}
      <div style={{
        position: "relative", width: 180, height: 180,
        margin: "0 auto 14px",
      }}>
        {/* Progress ring */}
        <svg
          width={192} height={192}
          style={{ position: "absolute", top: -6, left: -6, transform: "rotate(-90deg)" }}
        >
          <circle cx={96} cy={96} r={93} fill="none" stroke="rgba(55,65,81,0.3)" strokeWidth={3} />
          <circle
            cx={96} cy={96} r={93} fill="none"
            stroke={phase === "done" ? "#10b981" : faceDetected ? "#10b981" : "rgba(55,65,81,0.3)"}
            strokeWidth={3}
            strokeDasharray={584}
            strokeDashoffset={584 - 584 * progress}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.3s, stroke 0.3s" }}
          />
        </svg>

        <div style={{
          width: 180, height: 180, borderRadius: 9999, overflow: "hidden",
          border: "1px solid rgba(16,185,129,0.1)", background: "#000",
        }}>
          <video
            ref={videoRef}
            muted playsInline autoPlay
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
          />

          {/* Overlays */}
          {phase === "loading" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", borderRadius: 9999 }}>
              <Loader2 size={28} color="#34d399" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          )}
          {phase === "done" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,0.85)", borderRadius: 9999 }}>
              <CheckCircle2 size={40} color="#fff" />
            </div>
          )}
          {phase === "error" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.8)", borderRadius: 9999 }}>
              <XCircle size={40} color="#fff" />
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      <p style={{ textAlign: "center", color: "#a7f3d0", fontSize: 13, fontWeight: 500, margin: "0 0 8px" }}>
        {msg}
      </p>

      {/* Scanning hint */}
      {phase === "scanning" && !faceDetected && (
        <p style={{ textAlign: "center", color: "rgba(251,191,36,0.6)", fontSize: 11, margin: "4px 0 0" }}>
          Đưa mặt vào giữa khung hình
        </p>
      )}

      {/* Error retry */}
      {phase === "error" && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
          <button
            onClick={handleRetry}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#f59e0b", color: "#000",
              padding: "8px 14px", borderRadius: 10, border: "none",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            <RefreshCw size={13} /> Thử lại
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
