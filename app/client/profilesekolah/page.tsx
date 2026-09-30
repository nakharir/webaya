"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Footer from "@/components/Footer";
import { apiEndpoints, image_url } from "@/app/api/api";
import { motion } from "framer-motion";

export default function Profil() {
  interface ProfileItem {
    id: number;
    section: string;
    judul: string;
    konten: string;
    gambar: string;
  }

  interface KontakItem {
    id: number;
    section: string;
    judul: string;
    konten: string;
    gambar: string;
    email: string;
    alamat: string;
    no_telp: string;
  }

  const [sejarah, setSejarah] = useState<ProfileItem | null>(null);
  const [programs, setPrograms] = useState<ProfileItem[]>([]);
  const [akreditasi, setAkreditasi] = useState<ProfileItem | null>(null);
  const [kontak, setKontak] = useState<KontakItem | null>(null);

  const [loading, setLoading] = useState(true);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(apiEndpoints.GETProfileSekolah);
      const arrayData: any[] = Array.isArray(response.data) ? response.data : [];

      setSejarah(arrayData.find((item) => item.section?.toLowerCase() === "sejarah") || null);
   setPrograms(
  arrayData
    .filter((item) => item.section?.toLowerCase() === "program")
    .sort((a, b) => b.id - a.id) // urutkan dari ID terbesar
    .slice(0, 6)                // ambil 6 data terbaru
);

      setAkreditasi(arrayData.find((item) => item.section?.toLowerCase() === "akreditasi") || null);
      setKontak(arrayData.find((item) => item.section?.toLowerCase() === "kontak") || null);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <main className="pt-1">

        {/* ==================== SECTION TITLE ===================== */}
        <section className="relative bg-red-800 bg-center h-64 flex items-center justify-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {loading ? (
              <div className="w-64 h-10 bg-red-700 rounded-lg animate-pulse" />
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                PROFILE SDN 01 MANGUHARJO KOTA MADIUN
              </h1>
            )}
          </motion.div>
        </section>

        {/* ==================== SECTION SEJARAH ===================== */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <div>
            {loading ? (
              <>
                <div className="w-48 h-8 bg-gray-300 rounded-lg animate-pulse mb-4" />
                <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse" />
              </>
            ) : (
              <>
                <h2 className="text-2xl md:text-4xl font-bold text-red-800 mb-4">
                  {sejarah?.judul}
                </h2>
                <p className="text-gray-700 text-xl leading-relaxed">
                  {sejarah?.konten}
                </p>
              </>
            )}
          </div>

          <div className="flex justify-center">
            {loading ? (
              <div className="w-full md:w-4/5 h-64 bg-gray-300 rounded-lg animate-pulse" />
            ) : sejarah?.gambar ? (
              <Image
                src={`${image_url}/${sejarah.gambar}`}
                alt={sejarah?.judul ?? ""}
                width={600}
                height={400}
                className="rounded-lg shadow-lg w-full md:w-4/5 object-cover"
                unoptimized
              />
            ) : null}
          </div>
        </motion.section>

        {/* ==================== SECTION PROGRAM ===================== */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="container mx-auto px-4 py-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-red-800 mb-12">
            Program Unggulan Sekolah
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-2xl p-8 animate-pulse h-64" />
                ))
              : programs.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="bg-red-800 text-white rounded-2xl p-8 text-center shadow-lg hover:scale-105 transition-transform duration-300"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="bg-yellow-500/20 p-4 rounded-full">
                        {item.gambar ? (
                          <Image
                            src={`${image_url}/${item.gambar}`}
                            alt={item?.judul ?? ""}
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-semibold mb-2">
                      {item.judul}
                    </h3>
                    <p className="text-gray-200">{item.konten}</p>
                  </motion.div>
                ))}
          </div>
        </motion.section>

        {/* ==================== SECTION AKREDITASI ===================== */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-gray-50 py-16 px-6"
        >
          <div className="container mx-auto text-center">
            {loading ? (
              <>
                <div className="w-64 h-8 bg-gray-300 rounded-lg animate-pulse mx-auto mb-8" />
                <div className="w-full md:w-4/5 lg:w-3/4 h-72 bg-gray-300 rounded-2xl animate-pulse mx-auto" />
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-red-800 mb-8">
                  {akreditasi?.judul}
                </h2>
                <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                  {akreditasi?.konten}
                </p>
                <div className="flex justify-center mt-12">
                  {akreditasi?.gambar && (
                    <Image
                      src={`${image_url}/${akreditasi.gambar}`}
                      alt={akreditasi?.judul ?? ""}
                      width={800}
                      height={500}
                      className="rounded-2xl shadow-2xl w-full md:w-4/5 lg:w-3/4 object-cover"
                      unoptimized
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </motion.section>

        {/* ==================== SECTION KONTAK ===================== */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="container mx-auto py-16 px-4 flex flex-col md:flex-row gap-8"
        >
          <div className="w-full md:w-1/2">
            {loading ? (
              <>
                <div className="w-40 h-10 bg-gray-300 rounded-lg animate-pulse mb-4" />
                <div className="w-full h-20 bg-gray-200 rounded-lg animate-pulse" />
              </>
            ) : (
              <>
                <h2 className="text-4xl text-red-800 font-bold leading-tight">
                  {kontak?.judul}
                </h2>

                <p className="text-gray-600 text-xl mt-4">
                  {kontak?.konten}
                </p>
              </>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-6">
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse" />
                    <div className="w-1/2 h-6 bg-gray-300 rounded-lg animate-pulse" />
                  </div>
                ))
              : [
                  { title: "Alamat", value: kontak?.alamat ?? "" },
                  { title: "Email", value: kontak?.email ?? "" },
                  { title: "Telepon", value: kontak?.no_telp ?? "" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-800 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 12h14M12 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-gray-600">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
          </div>
        </motion.section>
      </main>

      <Footer />
    </>
  );
}
