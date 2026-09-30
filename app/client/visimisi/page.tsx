"use client";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import axios from "axios";
import { useEffect, useState } from "react";
import { apiEndpoints } from "@/app/api/api";

// Ikon VISI
const VisionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

// Ikon MISI
const MissionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m-9-9h2m14 0h2" />
  </svg>
);

export default function VisiMisiPage() {
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchVisiMisi = async () => {
    try {
      const response = await axios.get(apiEndpoints.GETVisiMisi);

      if (Array.isArray(response.data) && response.data.length > 0) {
        setVisi(response.data[0].visi || "");
        setMisi(response.data[0].misi || "");
      } else {
        console.error("Data visi misi tidak valid:", response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data visi misi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisiMisi();
  }, []);

  // Animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Visi & Misi Kami
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Membentuk masa depan melalui pendidikan berkualitas.
          </p>
        </motion.div>

        {/* Grid VISI & MISI */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full"
        >
          {/* VISI */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-red-800 shadow-xl rounded-2xl p-8 border border-red-900 text-white text-center"
          >
            <div className="bg-white text-red-800 rounded-full p-4 mb-6 shadow-lg mx-auto w-fit">
              <VisionIcon />
            </div>

            <h2 className="text-3xl font-bold mb-4">VISI</h2>

            {loading ? (
              <p className="italic text-gray-200">Memuat visi...</p>
            ) : (
              <p className="italic text-gray-100 mb-6">{visi}</p>
            )}
          </motion.div>

          {/* MISI */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-red-800 shadow-xl rounded-2xl p-8 border border-red-900 text-white"
          >
            <div className="bg-white text-red-800 rounded-full p-4 mb-6 shadow-lg mx-auto w-fit">
              <MissionIcon />
            </div>

            <h2 className="text-3xl font-bold mb-4 text-center">MISI</h2>

            {loading ? (
              <p className="italic text-gray-200">Memuat misi...</p>
            ) : (
              <ul className="list-disc list-inside text-left text-gray-100 space-y-3 leading-relaxed">
                {misi
                  .replace(/"/g, "") // hilangkan tanda kutip
                  .split(",") // pecah berdasarkan koma
                  .map((point, i) => (
                    <li key={i}>{point.trim()}</li>
                  ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
