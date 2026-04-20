"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { signIn } from "next-auth/react";

export default function FaceIDLoginPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [msg, setMsg] = useState("Đang khởi động AI...");

  // 1. Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        setStatus("idle");
        setMsg("Nhấn nút để bắt đầu quét khuôn mặt");
      } catch {
        setStatus("error");
        setMsg("Lỗi tải dữ liệu AI. Vui lòng tải lại trang.");
      }
    };
    loadModels();
  }, []);

  // 2. Mở Camera
  const startCamera = async () => {
    setIsScanning(true);
    setStatus("idle");
    setMsg("Đang tìm khuôn mặt...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 720, height: 720, facingMode: "user" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert("Không mở được camera!");
      setIsScanning(false);
    }
  };

  // 3. Logic So sánh khuôn mặt qua API
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isScanning && status === "idle") {
      interval = setInterval(async () => {
        if (!videoRef.current) return;

        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.4 })
          )
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (detection) {
          setMsg("Đã phát hiện khuôn mặt, đang xác thực...");
          clearInterval(interval);

          // Gọi API face-login
          try {
            const res = await fetch("/api/auth/face-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ descriptor: Array.from(detection.descriptor) }),
            });

            const data = await res.json();

            if (data.success && data.faceToken) {
              // Đăng nhập qua NextAuth bằng face-id provider
              const result = await signIn("face-id", {
                faceToken: data.faceToken,
                redirect: false,
              });

              if (result?.ok) {
                handleLoginSuccess(data.roles);
              } else {
                setStatus("error");
                setMsg("Xác thực FaceID thất bại. Vui lòng thử lại.");
                stopCamera();
              }
            } else {
              setStatus("error");
              setMsg(data.message ?? "Khuôn mặt không khớp với bất kỳ tài khoản nào.");
              stopCamera();
            }
          } catch {
            setStatus("error");
            setMsg("Lỗi kết nối. Vui lòng thử lại.");
            stopCamera();
          }
        } else {
          setMsg("Không phát hiện khuôn mặt, hãy nhìn thẳng vào camera...");
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isScanning, status]);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
  };

  const handleLoginSuccess = (roles?: string[]) => {
    setStatus("success");
    setMsg("Xác thực thành công! Đang vào hệ thống...");
    stopCamera();
    
    setTimeout(() => {
      let redirectUrl = "/";
      if (roles?.includes("ADMIN")) redirectUrl = "/admin";
      else if (roles?.includes("STAFF")) redirectUrl = "/staff";
      router.push(redirectUrl);
    }, 1500);
  };

  const handleRetry = () => {
    setStatus("idle");
    setMsg("Nhấn nút để bắt đầu quét khuôn mặt");
    setIsScanning(false);
    stopCamera();
  };

  return (
    <div className="fixed inset-0 bg-[#0A1A17] flex flex-col items-center justify-center p-6 z-[999]">
      <button
        onClick={() => { stopCamera(); router.back(); }}
        className="absolute top-10 left-10 text-emerald-500 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div className="w-full max-w-md text-center">
        <header className="mb-10 text-white">
          <div className="inline-block p-4 bg-emerald-500/10 rounded-full mb-4">
            <ShieldCheck className="text-emerald-500" size={40} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            Đăng nhập FaceID
          </h1>
          <p className="text-emerald-100/40 text-[10px] font-bold uppercase tracking-widest mt-2 min-h-[20px]">
            {msg}
          </p>
        </header>

        <div className="relative w-72 h-72 mx-auto mb-12">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-[3.5rem] overflow-hidden bg-black/40">
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0D261B]/50">
                {status === "loading" ? (
                  <Loader2 className="text-emerald-500/50 animate-spin" size={50} />
                ) : (
                  <Camera className="text-emerald-500/20" size={60} />
                )}
              </div>
            )}

            {isScanning && status !== "success" && status !== "error" && (
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] z-20"
              />
            )}

            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-emerald-500 flex items-center justify-center text-[#0A1A17] z-30"
                >
                  <CheckCircle2 size={80} strokeWidth={2.5} />
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-red-500/90 flex items-center justify-center text-white z-30"
                >
                  <XCircle size={80} strokeWidth={2.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Corner decorations */}
          <div className="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl" />
        </div>

        {/* Buttons */}
        {!isScanning && status !== "success" && (
          <button
            onClick={startCamera}
            disabled={!isModelLoaded}
            className="w-full bg-emerald-500 text-[#0A1A17] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isModelLoaded ? (
              "Quét khuôn mặt để vào"
            ) : (
              <><RefreshCw className="animate-spin" size={18} /> Đang tải AI...</>
            )}
          </button>
        )}

        {isScanning && status === "idle" && (
          <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">
            <RefreshCw className="animate-spin" size={14} /> Hệ thống đang đối soát...
          </div>
        )}

        {status === "error" && (
          <button
            onClick={handleRetry}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Thử lại
          </button>
        )}

        {/* Link đăng ký face */}
        <p className="mt-6 text-emerald-100/30 text-[10px] font-medium">
          Chưa đăng ký FaceID?{" "}
          <button
            onClick={() => router.push("/staff/hr")}
            className="text-emerald-400 underline hover:text-white"
          >
            Đăng ký trong Hồ Sơ Nhân Sự
          </button>
        </p>
      </div>
    </div>
  );
}
