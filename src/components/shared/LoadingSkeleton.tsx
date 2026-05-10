"use client";

import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, className }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite",
      }}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Skeleton width={72} height={72} borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="40%" height={20} />
          <Skeleton width="60%" height={14} borderRadius={6} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <Skeleton width="30%" height={12} borderRadius={4} />
            <Skeleton height={40} borderRadius={8} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddressSkeleton() {
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <Skeleton width={200} height={24} />
        <Skeleton width={120} height={36} borderRadius={8} />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ padding: 16, marginBottom: 12, border: "1px solid #f3f4f6", borderRadius: 12 }}>
          <Skeleton width="50%" height={16} />
          <Skeleton width="80%" height={14} borderRadius={6} />
          <Skeleton width="30%" height={12} borderRadius={4} />
        </div>
      ))}
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div style={{ padding: "2rem" }}>
      <Skeleton width={200} height={24} />
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: "flex", gap: 12, padding: 16, border: "1px solid #f3f4f6", borderRadius: 12 }}>
            <Skeleton width={36} height={36} borderRadius={9} />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="90%" height={12} borderRadius={4} />
              <Skeleton width="20%" height={10} borderRadius={4} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
