"use client";

import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiEndpoints } from "@/app/api/api";

// --- Ikon SVG ---
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M16.5 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zM7 16.5v-6h2v6a2.5 2.5 0 0 0 5 0v-6a7.5 7.5 0 1 1-7-7.4" />
  </svg>
);

// --- Halaman Hubungi Kami ---
export default function HubungiKamiPage() {
  const [hubungi, setHubungi] = useState<any>(null);

const fetchData = async () => {
  try {
    const res = await axios.get(apiEndpoints.GETHubungiKami);

    if (Array.isArray(res.data) && res.data.length > 0) {
      setHubungi(res.data[0]); // ambil objek pertama
    } else {
      console.error("Data hubungi kosong:", res.data);
    }

  } catch (error) {
    console.error("Error fetching hubungi kami:", error);
  }
};

useEffect(() => {
  fetchData();
}, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
            Hubungi Kami
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Silakan hubungi kami jika ada pertanyaan atau informasi yang diperlukan.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl w-full"
        >
          {/* Informasi Kontak */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-red-800 text-white backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-200/50"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              {hubungi?.judul || "Memuat..."}
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 text-white rounded-full p-3">
                  <PhoneIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Whatsapp</h3>
                  <p>{hubungi?.no_telp || "-"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 text-white rounded-full p-3">
                  <MailIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p>{hubungi?.email || "-"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 text-white rounded-full p-3">
                  <LocationIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Alamat</h3>
                  <p>{hubungi?.alamat || "-"}</p>
                </div>
              </div>
            </div>

            <motion.a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                hubungi?.alamat || ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="mt-10 block w-full bg-white text-red-800 text-center font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300"
            >
              Buka di Maps
            </motion.a>
          </motion.div>

          {/* Sosial Media */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-red-800 text-white backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-200/50"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Follow Sosial Media Kami</h2>

            <div className="space-y-4">
              <motion.a
                href="https://www.instagram.com/sdnmanguharjo/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, x: 5 }}
                className="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                <InstagramIcon />
                <span className="ml-4 font-semibold text-lg">Instagram</span>
              </motion.a>

              <motion.a
                href="https://youtube.com/@sdn01manguharjomadiun13"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, x: 5 }}
                className="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                <YoutubeIcon />
                <span className="ml-4 font-semibold text-lg">YouTube</span>
              </motion.a>

              <motion.a
                href="https://www.tiktok.com/@sdnmanguharjoesma"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, x: 5 }}
                className="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                <TiktokIcon />
                <span className="ml-4 font-semibold text-lg">TikTok</span>
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <div className="-mx-4 sm:-mx-6 md:-mx-10">
        <Footer />
      </div>
    </div>
  );
}
