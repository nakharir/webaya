"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import Footer from "@/components/Footer";
import { apiEndpoints, image_url } from "@/app/api/api";
import Image from "next/image";

interface FasilitasItem {
  id: number;
  judul: string;
  deskripsi: string;
  Gambar: string;
}

// Skeleton Component
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

export default function Fasilitas() {
  const [fasilitas, setFasilitas] = useState<FasilitasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef<Toast>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiEndpoints.GETFASILITAS);
      setFasilitas(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.current?.show({
        severity: "error",
        summary: "Gagal Memuat",
        detail: "Tidak dapat mengambil data fasilitas.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="pt-1">
      <Toast ref={toast} />

      {/* Header */}
      <section className="relative bg-red-800 bg-center h-64 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg text-center">
          FASILITAS SDN 01 MANGUHARJO KOTA MADIUN
        </h1>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12">
        {/* === SKELETON LOADING === */}
        {loading ? (
          <div
            className="
              grid 
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-8
            "
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : fasilitas.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada data fasilitas.</p>
        ) : (
          <div
            className="
              grid 
              grid-cols-1        /* Mobile */
              sm:grid-cols-2     /* iPad Mini */
              lg:grid-cols-3     /* Laptop */
              gap-8
            "
          >
            {fasilitas.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {/* Gambar */}
                <div className="w-full h-48 bg-gray-50 overflow-hidden">

                  {item.Gambar && (
                    <Image
  src={`${image_url}/${item.Gambar}`}
  alt={item.judul}
  width={400}
  height={400}
  className="w-full h-full object-cover"
  unoptimized
/>

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
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
