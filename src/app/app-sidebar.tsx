"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 p-2 bg-white border rounded"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <aside
        className={`bg-white border-r h-full transition-all duration-300 ${
          isOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-4">
          <h2 className="font-bold mb-4">History</h2>
          <nav className="space-y-2">
            <Link href="/" className="block p-2 hover:bg-gray-100 rounded">
              Home
            </Link>
            <Link href="/quiz" className="block p-2 hover:bg-gray-100 rounded">
              Quiz
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
}

export default AppSidebar;
