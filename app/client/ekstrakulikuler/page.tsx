"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Footer from "@/components/Footer";
import { apiEndpoints, image_url } from "@/app/api/api";
import { motion } from "framer-motion";

interface EkskulItem {
  id: number;
  judul: string;
  deskripsi: string;
  Gambar: string;
}

// Skeleton Loading (SAMA seperti halaman fasilitas)
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-300"></div>

      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export default function Ekskul() {
  const [ekskul, setEkskul] = useState<EkskulItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEkskul = async () => {
    try {
      const response = await axios.get(apiEndpoints.GETEkskul);
      const data = Array.isArray(response.data) ? response.data : [];
      setEkskul(data);
    } catch (error) {
      console.error("Gagal mengambil data ekstrakulikuler:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEkskul();
  }, []);

  const cardVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.15 },
    }),
  };

  return (
    <main className="pt-1">
      {/* === Section Judul === */}
      <section className="relative bg-red-800 bg-center h-64 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg text-center">
          EKSTRAKULIKULER SDN 01 MANGUHARJO KOTA MADIUN
        </h1>
      </section>

      {/* === SECTION EKSKUL === */}
      <section className="container mx-auto px-4 py-12">
        
        {/* GRID RESPONSIVE SAMA DENGAN FASILITAS */}
        <div
          className="
            grid 
            grid-cols-1         /* Mobile */
            sm:grid-cols-2      /* iPad Mini */
            lg:grid-cols-3      /* Laptop */
            gap-8
          "
        >
          {/* === SKELETON LOADING === */}
          {loading &&
            [1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}

          {/* === DATA EKSKUL === */}
          {!loading &&
            ekskul.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={cardVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {/* Gambar */}
               <div className="w-full h-48 bg-gray-50 overflow-hidden">
  {item.Gambar ? (
    <Image
      src={`${image_url}/${item.Gambar}`}
      alt={item.judul}
      width={400}
      height={300}
      className="w-full h-full object-cover"
      unoptimized
    />
  ) : (
    <div className="w-full h-48 bg-gray-300" />
  )}
</div>

                {/* Isi card */}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-red-800 mb-2 text-center">
                    {item.judul}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-center">
                    {item.deskripsi}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
