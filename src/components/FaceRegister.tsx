"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera, CheckCircle2, Loader2, XCircle, RefreshCw } from "lucide-react";

interface Props {
  onSuccess: (descriptor: number[]) => void;
  onCancel: () => void;
}

const MODEL_URL = "/models";

export default function FaceRegister({ onSuccess, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "scanning" | "done" | "error">("loading");
  const [msg, setMsg] = useState("Đang tải mô hình AI...");
  const [capturedCount, setCapturedCount] = useState(0);
  const descriptorsRef = useRef<Float32Array[]>([]);

  // Load face-api models
  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setPhase("ready");
        setMsg("Nhấn nút để bật camera và đăng ký khuôn mặt");
      } catch {
        setPhase("error");
        setMsg("Lỗi tải mô hình AI. Vui lòng tải lại trang.");
      }
    };
    load();
  }, []);

  const startCapture = async () => {
    setPhase("scanning");
    setMsg("Hướng mặt vào camera, giữ thẳng...");
    descriptorsRef.current = [];
    setCapturedCount(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setPhase("error");
      setMsg("Không thể mở camera. Vui lòng cho phép truy cập.");
      return;
    }

    // Chụp 5 frame trong 5 giây
    let count = 0;
    const captured: Float32Array[] = [];

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (detection) {
        captured.push(detection.descriptor);
        count++;
        setCapturedCount(count);
        setMsg(`Đang chụp... ${count}/5 frame`);

        if (count >= 5) {
          clearInterval(interval);
          stopCamera();

          // Tính trung bình các descriptor
          const avg = averageDescriptors(captured);
          setPhase("done");
          setMsg("✅ Đã lấy dữ liệu khuôn mặt!");
          onSuccess(Array.from(avg));
        }
      } else {
        setMsg("Không phát hiện khuôn mặt, hãy nhìn thẳng vào camera...");
      }
    }, 1000);
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const averageDescriptors = (descriptors: Float32Array[]): Float32Array => {
    const len = descriptors[0].length;
    const result = new Float32Array(len);
    for (const d of descriptors) {
      for (let i = 0; i < len; i++) result[i] += d[i];
    }
    for (let i = 0; i < len; i++) result[i] /= descriptors.length;
    return result;
  };

  return (
    <div className="bg-[#0A1A17] rounded-2xl p-6 text-white">
      <div className="text-center mb-4">
        <p className="text-emerald-300 text-sm font-medium">{msg}</p>
        {phase === "scanning" && (
          <div className="flex justify-center gap-1 mt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < capturedCount ? "bg-emerald-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Camera viewport */}
      <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/30 mb-6">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          muted
          playsInline
        />
        {phase !== "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center">
            {phase === "loading" && <Loader2 className="animate-spin text-emerald-400" size={40} />}
            {phase === "ready" && <Camera className="text-emerald-500/30" size={50} />}
            {phase === "done" && <CheckCircle2 className="text-emerald-400" size={60} />}
            {phase === "error" && <XCircle className="text-red-400" size={60} />}
          </div>
        )}
        {phase === "scanning" && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner marks */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        {phase === "ready" && (
          <button
            onClick={startCapture}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <Camera size={16} />
            Bắt đầu quét khuôn mặt
          </button>
        )}
        {phase === "error" && (
          <button
            onClick={() => { setPhase("ready"); setMsg("Nhấn nút để bật camera và đăng ký khuôn mặt"); }}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        )}
        <button
          onClick={() => { stopCamera(); onCancel(); }}
          className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
