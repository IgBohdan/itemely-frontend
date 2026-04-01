import { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-6">{children}</main>
    </div>
  );
}
