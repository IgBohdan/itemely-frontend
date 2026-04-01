"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { ReactNode } from "react";

interface ProtectedPageWrapperProps {
  children: ReactNode;
}

export default function ProtectedPageWrapper({
  children,
}: ProtectedPageWrapperProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
