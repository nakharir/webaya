"use client";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import { apiEndpoints, image_url } from "@/app/api/api";

interface BeritaItem {
  id: number;
  judul: string;
  deskripsi: string;
  gambar: string;
  created_at: string;
  updated_at: string;
}

export default function BeritaPage() {
  const [berita, setBerita] = useState<BeritaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const res = await axios.get(apiEndpoints.GETBERITA);
        const data = res.data.data || res.data;

        const beritaTerbaru = data
          .sort((a: BeritaItem, b: BeritaItem) => b.id - a.id)
          .slice(0, 2);

        setBerita(beritaTerbaru);
      } catch (error) {
        console.error("Gagal memuat data berita:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ==== Section 1: Header ==== */}
      <section className="relative w-full h-[20vh] flex items-center justify-center bg-red-800">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Berita Sekolah
          </h1>
          <p className="text-lg md:text-xl">
            Informasi dan kegiatan terbaru dari SDN 01 Manguharjo Kota Madiun
          </p>
        </div>
      </section>

      {/* ==== Section 2: Konten Utama ==== */}
      <section className="py-16 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* === Kolom Kiri: Daftar Berita === */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold uppercase mb-10 text-gray-800">
              Postingan terbaru
            </h2>

            {/* ========== SKELETON BERITA UTAMA ========== */}
            {loading ? (
              <div className="flex flex-col gap-14">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col border-b border-gray-200 pb-10 animate-pulse"
                  >
                    <div className="w-full h-[300px] md:h-[400px] bg-gray-300 rounded-lg"></div>

                    <div className="mt-4 space-y-3">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : berita.length === 0 ? (
              <p className="text-center text-gray-500">
                Belum ada berita yang tersedia.
              </p>
            ) : (
              <div className="flex flex-col gap-14">
                {berita.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col border-b border-gray-200 pb-10"
                  >
                    {/* Gambar */}
                    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg shadow-md">
                      <Image
                        src={`${image_url}/${item.gambar}`}
                        alt={item.judul}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    </div>

                    {/* Konten teks */}
                    <div className="mt-4 flex flex-col">
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
  {item.judul}
</h3>

                      <p className="mt-2 text-gray-600 leading-relaxed">
                        {item.deskripsi}
                      </p>

                      <div className="flex justify-between flex-wrap mt-3 text-sm text-gray-600">
                        <span>
                          Posted on{" "}
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="text-gray-500">
                          Updated:{" "}
                          {new Date(item.updated_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === Kolom Kanan: Sidebar === */}
          <aside className="space-y-8">
            <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-md">
              <h3 className="text-lg font-bold text-red-700 mb-2">
                Jangan Ketinggalan!
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Dapatkan informasi terkini seputar kegiatan, prestasi, dan
                pengumuman penting dari SDN 01 Manguharjo.
              </p>
            </div>

            {/* ======== Recent Posts ======== */}
            <div>
              <h3 className="text-red-800 font-bold text-lg mb-4">
                Postingan terbaru
              </h3>

              {loading ? (
                // ==== SKELETON RECENT POSTS ====
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-red-50 rounded-md p-2"
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {berita.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-red-50 rounded-md p-2 cursor-default"
                    >
                      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={`${image_url}/${item.gambar}`}
                          alt={item.judul}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-800 leading-snug">
                        {item.judul}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
