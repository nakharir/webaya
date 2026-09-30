"use client";

import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import Link from "next/link";
import { Button } from "./ui/button";

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Track mobile menu state

  return (
    <div className="bg-[#CADBBB] py-4 px-6 w-full">
      {/* Logo */}
      <div className="flex justify-between items-center">
        <div className="flex-shrink-0">
          <img src="/logolaku.svg" width={128} height={29} alt="godong.id Logo" />
        </div>

        {/* Desktop Navigation Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-[17px] font-normal bg-transparent text-black px-4 py-2 rounded-md focus:bg-transparent">
                  <Link href="/client/FiturMobilekasir" className="text-[17px] font-normal px-3 py-2 rounded-md">
                    Fitur
                  </Link>
                </NavigationMenuTrigger>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/client/HargaMobilekasir" className="text-[17px] font-normal px-3 py-2 rounded-md">
                    Harga
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/solusi" className="text-[17px] font-normal px-3 py-2 rounded-md">
                    Solusi
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Sign In Button - Desktop */}
        <div className="hidden md:block">
          <Button className="bg-[#366938] text-white px-4 py-2">
            Masuk
          </Button>
        </div>

        {/* Hamburger Icon - Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black focus:outline-none"
          >
            {isMenuOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="flex flex-col mt-4 bg-[#CADBBB] p-4 rounded-lg shadow-lg md:hidden">
          <Link href="/client/FiturMobilekasir" className="text-[17px] font-normal py-2 hover:bg-[#366938] hover:text-white rounded-md">
            Fitur
          </Link>
          <Link href="/client/HargaMobilekasir" className="text-[17px] font-normal py-2 hover:bg-[#366938] hover:text-white rounded-md">
            Harga
          </Link>
          <Link href="/solusi" className="text-[17px] font-normal py-2 hover:bg-[#366938] hover:text-white rounded-md">
            Solusi
          </Link>
          <Button className="bg-[#366938] text-white px-4 py-2 mt-4">Masuk</Button>
        </div>
      )}
    </div>
  );
}
