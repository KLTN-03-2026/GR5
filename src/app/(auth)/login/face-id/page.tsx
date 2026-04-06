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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FaceIDLoginPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("loading");
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
        setMsg("Sẵn sàng quét mặt");
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
      if (videoRef.current) videoRef.current.srcObject = stream;
      setMsg("Đang tìm khuôn mặt của Phú...");
    } catch (err) {
      alert("Không mở được camera!");
    }
  };

  // 3. Logic So sánh khuôn mặt
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
                scoreThreshold: 0.4,
              }),
            )
            .withFaceLandmarks(true)
            .withFaceDescriptor();

          if (detection) {
            // Lấy dữ liệu mặt đã đăng ký từ sessionStorage (Tạm thời)
            const savedFaceData = sessionStorage.getItem("temp_face_data");

            if (!savedFaceData) {
              setMsg("Chưa có dữ liệu FaceID. Vui lòng đăng ký trước!");
              setStatus("error");
              clearInterval(interval);
              return;
            }

            const savedDescriptor = new Float32Array(JSON.parse(savedFaceData));

            // SO SÁNH: Tính khoảng cách Euclidean
            const distance = faceapi.euclideanDistance(
              detection.descriptor,
              savedDescriptor,
            );
            console.log("Độ sai lệch FaceID:", distance);

            // Ngưỡng an toàn < 0.5 (Càng nhỏ càng giống)
            if (distance < 0.5) {
              clearInterval(interval);
              handleLoginSuccess();
            } else {
              setMsg("Khuôn mặt không khớp, hãy thử lại!");
            }
          }
        }
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isScanning, status]);

  const handleLoginSuccess = () => {
    setStatus("success");
    setMsg("Xác thực thành công! Đang vào hệ thống...");

    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());

    // Nhảy thẳng vào trang chính (Dashboard)
    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <div className="fixed inset-0 bg-[#0A1A17] flex flex-col items-center justify-center p-6 z-[999]">
      <button
        onClick={() => router.back()}
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
          <p className="text-emerald-100/40 text-[10px] font-bold uppercase tracking-widest mt-2">
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
                <Camera className="text-emerald-500/20" size={60} />
              </div>
            )}

            {isScanning && status !== "success" && (
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
                  className="absolute inset-0 bg-red-500 flex items-center justify-center text-white z-30"
                >
                  <XCircle size={80} strokeWidth={2.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl" />
        </div>

        {!isScanning ? (
          <button
            onClick={startCamera}
            disabled={!isModelLoaded}
            className="w-full bg-emerald-500 text-[#0A1A17] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-emerald-500/20"
          >
            {isModelLoaded ? (
              "Quét khuôn mặt để vào"
            ) : (
              <RefreshCw className="animate-spin" size={18} />
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">
            <RefreshCw className="animate-spin" size={14} /> Hệ thống đang đối
            soát...
          </div>
        )}
      </div>
    </div>
  );
}
