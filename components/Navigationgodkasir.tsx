"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-[#CADBBB] py-4 px-6 w-full h-full">
      {/* Header Container */}
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image src="/logoGodong.svg" width={128} height={29} alt="godong.id Logo" />
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/client/FiturGodkasir" className="text-[17px] font-normal px-3 py-2">
            Fitur
          </Link>
          <Link href="/client/HargaGodkasir" className="text-[17px] font-normal px-3 py-2">
            Harga
          </Link>
          <Link href="/solusi" className="text-[17px] font-normal px-3 py-2">
            Solusi
          </Link>
        </nav>

        {/* Button "Masuk" */}
        <div className="hidden md:block">
          <Button className="bg-[#366938] text-white px-4 py-2">Masuk</Button>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black focus:outline-none"
          >
            {isMenuOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <nav
          className="absolute top-[70px] left-0 w-[90%] bg-[#CADBBB] z-50 p-6 rounded-lg shadow-md flex flex-col items-start gap-4 mx-4"
        >
          <Link href="/client/FiturGodkasir" className="text-[17px] font-normal px-2 py-1">
            Fitur
          </Link>
          <Link href="/client/HargaGodkasir" className="text-[17px] font-normal px-2 py-1">
            Harga
          </Link>
          <Link href="/solusi" className="text-[17px] font-normal px-2 py-1">
            Solusi
          </Link>
          <Button className="bg-[#366938] text-white px-4 py-2 w-full">Masuk</Button>
        </nav>
      )}
    </div>
  );
}
