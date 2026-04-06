"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { ScanFace, Camera, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
export default function FaceRegistration() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(
    null,
  );
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");

  // 1. Nạp "Não bộ" từ folder public/models Phú vừa bỏ vào
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL), // Phú dùng bản tiny nên gọi TinyNet
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        console.log("✅ Hệ thống AI đã sẵn sàng!");
      } catch (err) {
        setError(
          "Không load được model, Phú kiểm tra lại folder public/models nhé!",
        );
      }
    };
    loadModels();
  }, []);

  // 2. Hàm mở Camera
  const startVideo = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Không mở được Camera rồi Phú ơi!");
    }
  };

  // 3. Quét khuôn mặt để lấy dữ liệu (Descriptor)
  const handleCapture = async () => {
    if (videoRef.current) {
      // Dùng TinyFaceDetector cho nhẹ và nhanh
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions(),
        )
        .withFaceLandmarks(true) // true để dùng bản tiny
        .withFaceDescriptor();

      if (detection) {
        // Lưu 128 con số đặc trưng của khuôn mặt vào State
        setFaceDescriptor(detection.descriptor);
        setIsScanning(false);

        // Tắt camera sau khi lấy xong dữ liệu
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());

        console.log("Dữ liệu khuôn mặt của Phú:", detection.descriptor);
      } else {
        alert(
          "Chưa thấy mặt Phú đâu cả, xích lại gần hoặc bỏ khẩu trang ra nhé!",
        );
      }
    }
  };

  return (
    <div className="mt-8 p-6 bg-[#F1FAF4] rounded-[2rem] border-2 border-dashed border-[#007A33]/20 text-center">
      <h4 className="text-[10px] font-black text-[#007A33] uppercase tracking-[0.2em] mb-4 italic">
        Xác thực khuôn mặt (AI Face ID)
      </h4>

      {error && <p className="text-red-500 text-xs mb-4 font-bold">{error}</p>}

      <div className="flex justify-center">
        {isScanning ? (
          <div className="relative w-full max-w-[320px] aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute inset-0 border-[3px] border-[#22C55E] rounded-[1.8rem] animate-pulse pointer-events-none shadow-[inset_0_0_100px_rgba(34,197,94,0.2)]"></div>

            <button
              type="button"
              onClick={handleCapture}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#007A33] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
            >
              <Camera size={16} /> Chụp khuôn mặt
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startVideo}
            disabled={!isModelLoaded}
            className={`w-full max-w-[320px] aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all duration-500 ${
              faceDescriptor
                ? "bg-[#007A33] text-white shadow-xl shadow-emerald-900/20"
                : "bg-white text-slate-300 hover:text-[#007A33] hover:shadow-xl hover:shadow-emerald-900/5"
            }`}
          >
            {faceDescriptor ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle size={60} strokeWidth={2.5} />
              </motion.div>
            ) : !isModelLoaded ? (
              <Loader2 size={40} className="animate-spin text-[#007A33]" />
            ) : (
              <ScanFace size={60} strokeWidth={1.5} />
            )}

            <span className="text-[11px] font-black uppercase tracking-[0.1em]">
              {faceDescriptor
                ? "Đã xác thực khuôn mặt"
                : isModelLoaded
                  ? "Nhấn để quét khuôn mặt"
                  : "Đang nạp AI..."}
            </span>
          </button>
        )}
      </div>

      {/* Input ẩn để gửi dữ liệu khuôn mặt lên Server khi submit form */}
      {faceDescriptor && (
        <input
          type="hidden"
          name="face_data"
          value={JSON.stringify(Array.from(faceDescriptor))}
        />
      )}
    </div>
  );
}
