"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import {
  Camera,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FaceIDRegisterPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("loading");
  const [msg, setMsg] = useState("Vui lòng đợi AI khởi động...");

  // 1. Load Models AI
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
        setMsg("Hệ thống đã sẵn sàng");
      } catch (err) {
        setStatus("error");
        setMsg("Lỗi tải dữ liệu AI");
      }
    };
    loadModels();
  }, []);

  // 2. Mở Camera
  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 720, height: 720, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMsg("Hãy giữ mặt thẳng trong khung hình");
    } catch (err) {
      alert("Không mở được camera, Phú kiểm tra quyền truy cập nhé!");
    }
  };

  // 3. Vòng lặp quét mặt tự động (Auto Capture)
  useEffect(() => {
    let interval: any;
    if (isScanning && status === "idle") {
      interval = setInterval(async () => {
        if (videoRef.current) {
          const detection = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 512,
                scoreThreshold: 0.35,
              }), // Tăng độ nhạy lên 0.35
            )
            .withFaceLandmarks(true)
            .withFaceDescriptor();

          if (detection) {
            clearInterval(interval);
            handleSuccess(detection.descriptor);
          }
        }
      }, 500); // Quét mỗi 0.5 giây
    }
    return () => clearInterval(interval);
  }, [isScanning, status]);

  const handleSuccess = (descriptor: Float32Array) => {
    setStatus("success");
    setMsg("Đã nhận diện thành công!");

    // Lưu mã khuôn mặt vào sessionStorage để trang đăng ký lấy ra dùng
    const faceArray = Array.from(descriptor);
    sessionStorage.setItem("temp_face_data", JSON.stringify(faceArray));

    // Tắt camera
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());

    // Chờ 1.5s rồi quay lại
    setTimeout(() => router.push("/register"), 1500);
  };

  return (
    <div className="fixed inset-0 bg-[#0A1A17] flex flex-col items-center justify-center p-6 z-[999]">
      <button
        onClick={() => router.back()}
        className="absolute top-10 left-10 text-emerald-500 flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Quay lại trang đăng ký
      </button>

      <div className="w-full max-w-md text-center">
        <header className="mb-10">
          <div className="inline-block p-3 bg-emerald-500/10 rounded-2xl mb-4">
            <ShieldCheck className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            AI Face ID
          </h1>
          <p className="text-emerald-100/40 text-[10px] font-bold uppercase tracking-widest mt-2 px-10 leading-relaxed">
            {msg}
          </p>
        </header>

        <div className="relative w-72 h-72 mx-auto mb-10">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-[3rem] overflow-hidden bg-black/40 shadow-2xl">
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#0D261B]/50">
                <Camera className="text-emerald-500/20" size={60} />
              </div>
            )}

            {/* Hiệu ứng Scanner Line */}
            {isScanning && status !== "success" && (
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] z-20"
              />
            )}

            {/* Success Overlay */}
            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-[#0A1A17] z-30"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <CheckCircle2 size={70} strokeWidth={2.5} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute -top-3 -left-3 w-10 h-10 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl opacity-50" />
          <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl opacity-50" />
        </div>

        <div className="h-16 flex items-center justify-center">
          {!isScanning ? (
            <button
              onClick={startCamera}
              disabled={!isModelLoaded}
              className="w-full bg-emerald-500 text-[#0A1A17] py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white active:scale-[0.98] transition-all flex justify-center items-center gap-3 shadow-lg shadow-emerald-500/20"
            >
              {!isModelLoaded ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                "Bắt đầu quét khuôn mặt"
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-500/60 font-bold text-[10px] uppercase tracking-widest animate-pulse">
              <RefreshCw className="animate-spin" size={14} />
              AI đang tìm khuôn mặt...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
