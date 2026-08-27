"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide the back button on the landing page
  if (pathname === "/") return null;

  return (
    <div className="w-full bg-white border-b border-[#E5E7EB] py-3.5 px-6 sm:px-10">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[2px] text-gray-600 hover:text-[#FF3E6C] transition-all duration-200 cursor-pointer"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-200 font-semibold">
            ←
          </span>
          <span>Back</span>
        </button>
        <Link
          href="/"
          className="text-[10px] tracking-[4px] text-gray-400 hover:text-[#FF3E6C] uppercase font-medium transition-colors"
        >
          ZAYRO
        </Link>
      </div>
    </div>
  );
}
