"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-[#CADBBB] w-full py-4 px-6">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image src="/logolaku.svg" width={128} height={29} alt="godong.id Logo" />
        </div>

        {/* Navigation Menu - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/client/FiturBKK" className="text-[17px] font-normal px-3 py-2">
            Fitur
          </Link>
          <Link href="/client/HargaBKK" className="text-[17px] font-normal px-3 py-2">
            Harga
          </Link>
          <Link href="/solusi" className="text-[17px] font-normal px-3 py-2">
            Solusi
          </Link>
        </div>

        {/* Button "Masuk" - Desktop */}
        <div className="hidden md:block">
          <Button className="bg-[#366938] text-white px-4 py-2">Masuk</Button>
        </div>

        {/* Hamburger Menu - Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black focus:outline-none"
          >
            {isMenuOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Dropdown Menu - Mobile */}
      {isMenuOpen && (
        <div className="flex flex-col mt-4 bg-[#CADBBB] p-4 rounded-lg shadow-lg md:hidden">
          <Link
            href="/client/FiturBKK"
            className="text-[17px] font-normal py-2 hover:bg-[#366938] hover:text-white rounded-md"
          >
            Fitur
          </Link>
          <Link
            href="/client/HargaBKK"
            className="text-[17px] font-normal py-2 hover:bg-[#366938] hover:text-white rounded-md"
          >
            Harga
          </Link>
          <Link
            href="/solusi"
            className="text-[17px] font-normal py-2 hover:bg-[#366938] hover:text-white rounded-md"
          >
            Solusi
          </Link>
          <Button className="bg-[#366938] text-white px-4 py-2 mt-4">Masuk</Button>
        </div>
      )}
    </div>
  );
}
