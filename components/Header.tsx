"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import Link from "next/link";
import { ChevronDown, Ellipsis, Megaphone, Search } from "lucide-react";
import { useProdukHover } from "@/app/context/ProdukHoverContext";
import { Button } from "./ui/button";
import axios from "axios";
import { apiEndpoints } from "@/app/api/api";
import { cn } from "@/lib/utils";

interface contentNavbarGeneral {
  id: number;
  kode: string;
  kode_main_navbar: string;
  nama: string;
  link_to: string;
}

interface NavbarItem {
  id: number;
  kode_navbar: number;
  nama: string;
  status: string;
  link_to: string;
  content_navbar_general: contentNavbarGeneral[];
}

export default function NavigationBar() {
  const [open, setOpen] = useState(false);
  const [ellipsisMenuOpen, setEllipsisMenuOpen] = useState(false); // Tambahkan state untuk menu titik tiga
  const { setIsProdukHovered } = useProdukHover();
  const [navbar, setNavbar] = useState<NavbarItem[]>([]);

  useEffect(() => {
    axios
      .get(apiEndpoints.allNavbar)
      .then((response) => {
        setNavbar(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleStateOpen = () => {
    setIsProdukHovered(!open);
    setOpen(!open);
  };

  return (
    <div className="grid grid-cols-6 shadow-md w-full h-full py-4 px-6 items-center">
      {/* Logo */}
      <div className="col-span-1 flex justify-center">
        <Image src="/logoGodong.svg" width={128} height={29} alt="godong.id Logo" />
      </div>

      {/* Navigation Menu */}
      <div className="col-span-4 flex items-center justify-start ml-[-50px]">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            {/* Produk */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/client/products" className="text-[17px] font-normal flex items-center gap-1">
                  Produk
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Pelanggan */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/client/customer" className="text-[17px] font-normal px-3 py-2 rounded-md hover:bg-gray-100">
                  Pelanggan
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Perusahaan + Titik Tiga */}
            <NavigationMenuItem className="flex items-center gap-2 relative">
              <NavigationMenuTrigger className="text-[17px] font-normal flex items-center gap-1">
                Perusahaan
              </NavigationMenuTrigger>
              <NavigationMenuContent className="z-[1000]">
                <ul className="grid gap-3 p-3 w-[250px]">
                  <ListItem title="Tentang Kami" href="/client/aboutUs" />
                  <ListItem title="Tim Kami" href="/client/company" />
                  <ListItem title="Press" href="/client/press" />
                  <ListItem title="Karir" href="/client/career" />
                  <ListItem title="Godong Story" href="/client/GodongStory" />
                </ul>
              </NavigationMenuContent>

              {/* Titik tiga yang bisa ditekan */}
              <div className="relative">
                <Ellipsis
                  className="cursor-pointer"
                  height={25}
                  width={25}
                  onClick={() => setEllipsisMenuOpen(!ellipsisMenuOpen)} // Toggle menu saat ditekan
                />
                {ellipsisMenuOpen && (
                  <div className="absolute top-full right-0 bg-white shadow-lg rounded-lg p-3 w-[250px] z-[1000]">
                    <ul className="grid gap-3">
                      <ListItem title="Privasi Policy" href="/client/privasiPolicy" />
                      <ListItem title="FAQ" href="/client/faq" />
                      <ListItem title="Hubungi Kami" href="/client/contactUs" />
                      <ListItem title="Berita" href="/client/news" />
                      <ListItem title="Dukungan" href="/client/support" />
                    </ul>
                  </div>
                )}
              </div>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Search, Megaphone, and Sign In Button */}
      <div className="col-span-1 flex gap-4 w-full justify-end items-center">
        <Search className="cursor-pointer" width={25} height={25} />
        <Megaphone className="cursor-pointer" height={25} width={25} />
        <Button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Sign In
        </Button>
      </div>
    </div>
  );
}

// Komponen ListItem untuk menu
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-[13px] font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";
