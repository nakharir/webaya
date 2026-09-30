"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { apiEndpoints, image_url } from "@/app/api/api";
import { motion } from "framer-motion"; // 🪄 Tambahan animasi scroll
import { useRef } from "react";


export default function LandingPage() {
  const [section1, setSection1] = useState<any>(null);
  const [section2, setSection2] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [section3, setSection3] = useState<any>(null);
  const [section4, setSection4] = useState<any[]>([]);
  const [berita, setBerita] = useState<any[]>([]);
  const [loadingBerita, setLoadingBerita] = useState(true);
  const [fasilitas, setFasilitas] = useState<FasilitasItem[]>([]);
  const [loadingFasilitas, setLoadingFasilitas] = useState<boolean>(true);
  // === LOGIC CAROUSEL SECTION 4 ===
const [currentIndex, setCurrentIndex] = useState(0);
const scrollRef = useRef<HTMLDivElement | null>(null);
const [currentFasIndex, setCurrentFasIndex] = useState(0);


const cardWidth = typeof window !== "undefined"
  ? window.innerWidth < 640
    ? window.innerWidth - 40 // mobile
    : window.innerWidth < 1024
    ? 300                     // tablet
    : 350                     // laptop
  : 350;
// ukuran card (330px + gap)

const scrollLeft = () => {
  if (currentIndex > 0) {
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    scrollRef.current?.scrollTo({
      left: newIndex * cardWidth,
      behavior: "smooth",
    });
  }
};




const scrollRight = () => {
  if (currentIndex < section4.length - 1) {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    scrollRef.current?.scrollTo({
      left: newIndex * cardWidth,
      behavior: "smooth",
    });
  }
};


  interface FasilitasItem {
    id: number;
    judul: string;
    deskripsi: string;
    Gambar: string;
  }
  
// AUTO SLIDE FASILITAS MOBILE
useEffect(() => {
  if (fasilitas.length === 0) return;

  const interval = setInterval(() => {
    setCurrentFasIndex((prev) => (prev + 1) % fasilitas.length);
  }, 3500);

  return () => clearInterval(interval);
}, [fasilitas]);


 useEffect(() => {
  const fetchFasilitas = async () => {
    try {
      const res = await axios.get(apiEndpoints.GETFASILITAS);
      const data = res.data.data || res.data;

      // 🔥 Ambil 3 terbaru
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setFasilitas(sorted.slice(0, 3));
    } catch (error) {
      console.error("Gagal memuat data fasilitas:", error);
    } finally {
      setLoadingFasilitas(false);
    }
  };
  fetchFasilitas();
}, []);


  useEffect(() => {
    axios.post(apiEndpoints.ADDVisitor).catch((err) => {
      console.error("Gagal mencatat visitor:", err);
    });
  }, []);

  // AUTO SLIDE SECTION 4 MOBILE
useEffect(() => {
  if (section4.length === 0) return;

  const interval = setInterval(() => {
    setCurrentIndex(prev => (prev + 1) % section4.length);
  }, 3500); // 3.5 detik

  return () => clearInterval(interval);
}, [section4]);


useEffect(() => {
  const fetchBerita = async () => {
    try {
      const res = await axios.get(apiEndpoints.GETBERITA);
      const data = res.data.data || res.data;

      // 🔥 Urutkan berdasarkan id terbaru
      const beritaTerbaru = [...data].sort(
        (a: { id: number }, b: { id: number }) => b.id - a.id
      );

      setBerita(beritaTerbaru);
    } catch (error) {
      console.error("Gagal memuat berita:", error);
    } finally {
      setLoadingBerita(false);
    }
  };

  fetchBerita();
}, []);


 useEffect(() => {
  const fetchLanding = async () => {
    try {
      const res = await axios.get(apiEndpoints.GETLANDING);

      const sortDesc = (arr: any[]) => {
  return [...arr].sort((a, b) => b.id - a.id);
};


      const sec1 = sortDesc(res.data.filter((item: any) => item.section === "1"));
      const sec2 = sortDesc(res.data.filter((item: any) => item.section === "2"));
      const sec3 = sortDesc(res.data.filter((item: any) => item.section === "3"));
      const sec4 = res.data.filter((item: any) => item.section === "4"); // section 4 tetap semua

      setSection1(sec1[0]); // 🔥 ini sudah data terbaru
      setSection2(sec2[0]); // 🔥 terbaru
      setSection3(sec3[0]); // 🔥 terbaru
      setSection4(sec4);
    } catch (error) {
      console.error("Gagal memuat data landing:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchLanding();
}, []);

{/* === Ambil 3 data terbaru berdasarkan ID terbesar === */}
const latestSection4 = [...section4]
  .sort((a, b) => b.id - a.id)
  .slice(0, 3);
  if (loading) {
    return (
      <div className="flex flex-col gap-6 justify-center items-center h-[80vh] animate-pulse">
        <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (!section1) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-gray-600 text-lg">Data tidak ditemukan.</p>
      </div>
    );
  }

  // 🔥 Animasi Fade-Up Scroll
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <>
      {/* === SECTION 1 === */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="relative h-[90vh] w-full bg-cover bg-center flex flex-col justify-center items-center text-center text-white"
        style={{
          backgroundImage: "url('/halaman.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center px-4">
          <Image
            src={`${image_url}/${section1.Gambar}`}
            alt={section1.judul || "Landing Image"}
            width={180}
            height={180}
            className="mb-6 drop-shadow-lg rounded-lg object-cover"
            unoptimized
          />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {section1.judul}
          </h1>
          <p className="text-lg md:text-xl font-medium mb-8 max-w-2xl">
            {section1.deskripsi}
          </p>
          <Link
            href="/client/profilesekolah"
            className="border-2 border-white text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-all"
          >
            TENTANG KAMI →
          </Link>
        </div>
      </motion.section>

      {/* === SECTION 2 === */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className="text-3xl font-bold mb-12 text-center text-black">
          {section2?.judul || "SAMBUTAN KEPALA SEKOLAH"}
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2 flex justify-center">
            <Image
              src={`${image_url}/${section2.Gambar}`}
              alt={section2.judul || "Landing Image"}
              width={180}
              height={180}
              className="mb-6 drop-shadow-lg rounded-lg object-cover"
              unoptimized
            />
          </div>
          <div className="w-full md:w-1/2 text-gray-800">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
              {section2?.nama || "Drs. SUDJIANTO, M.M"}
            </h2>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Kepala Sekolah SDN 01 Manguharjo
            </h3>
            <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
              {section2?.deskripsi ||
                "Selamat datang di website SDN 01 Manguharjo Kota Madiun..."}
            </p>
          </div>
        </div>
      </motion.section>

      {/* === SECTION 3 === */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-gradient-to-br from-red-700 via-red-800 to-red-900 py-20 text-white"
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-10 tracking-wide">
            {section3?.judul || "Data Peserta Didik SDN 01 Manguharjo"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform duration-300">
              <h3 className="text-5xl font-bold text-yellow-300 drop-shadow-sm">
                {section3?.total_siswa ?? 0}
              </h3>
              <p className="mt-2 text-lg opacity-90">Total Siswa</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform duration-300">
              <h3 className="text-5xl font-bold text-blue-300 drop-shadow-sm">
                {section3?.jml_siswa_laki ?? 0}
              </h3>
              <p className="mt-2 text-lg opacity-90">Laki-laki</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform duration-300">
              <h3 className="text-5xl font-bold text-pink-300 drop-shadow-sm">
                {section3?.jml_siswa_perempuan ?? 0}
              </h3>
              <p className="mt-2 text-lg opacity-90">Perempuan</p>
            </div>
          </div>

          <p className="mt-12 text-base md:text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed">
            {section3?.deskripsi ||
              "Data peserta didik SDN 01 Manguharjo mencerminkan semangat belajar dan keberagaman..."}
          </p>
        </div>
      </motion.section>
{/* === SECTION 4 === */}
<motion.section
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  className="bg-white py-16"
>
  <h1 className="text-3xl font-bold mb-8 text-center text-black">
    KEUNGGULAN SDN 01 MANGUHARJO <br /> KOTA MADIUN
  </h1>

  {/* === MOBILE SLIDER === */}
  <div className="block sm:hidden">
    {section4.length > 0 && (
      <div className="max-w-xs mx-auto">
        <div className="bg-red-800 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-white rounded-lg shadow-md p-6 w-full flex flex-col items-center">
            <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded mb-4 text-center">
              {section4[currentIndex]?.judul}
            </span>

            <img
              src={`${image_url}/${section4[currentIndex]?.Gambar}`}
              alt={section4[currentIndex]?.judul}
              className="w-32 h-32 mb-4 object-contain"
            />

            <p className="text-[#333] text-lg text-center px-2">
              {section4[currentIndex]?.deskripsi}
            </p>
          </div>
        </div>
      </div>
    )}
  </div>

 {/* === TABLET (iPad Mini) — 1 Baris, 3 Kolom === */}
<div className="hidden sm:grid lg:hidden grid-cols-3 gap-6">
  {section4.map((item, index) => (
    <div
      key={index}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
    >
      {/* Gambar seperti fasilitas */}
      <div className="relative w-full h-40 bg-gray-100">
        <img
          src={`${image_url}/${item.Gambar}`}
          alt={item.judul}
          className="object-contain w-full h-full p-4"
        />
      </div>

      <div className="p-4 text-center">
        <h3 className="text-base font-bold text-gray-900 mb-2">
          {item.judul}
        </h3>
        <p className="text-gray-600 text-sm">
          {item.deskripsi}
        </p>
      </div>
    </div>
  ))}
</div>



{/* === DESKTOP GRID === */}
<div className="hidden lg:grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
  {latestSection4.map((item, index) => (
    <div key={index} className="bg-red-800 rounded-lg p-4 h-full flex">
      <div className="bg-white rounded-lg shadow-md p-6 w-full flex flex-col justify-between items-center min-h-[360px]">
        <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded mb-4 text-center">
          {item.judul}
        </span>

        <img
          src={`${image_url}/${item.Gambar}`}
          alt={item.judul}
          className="w-32 h-32 mb-4 object-contain"
        />

        <p className="text-[#333] text-lg text-center px-2">
          {item.deskripsi}
        </p>
      </div>
    </div>
  ))}
</div>

</motion.section>







   {/* === SECTION 5: FASILITAS SEKOLAH === */}
<motion.section
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  className="bg-gray-50 py-20"
>
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
      FASILITAS SEKOLAH
    </h2>

    {loadingFasilitas ? (
      <p className="text-center text-gray-500">Memuat data fasilitas...</p>
    ) : fasilitas.length === 0 ? (
      <p className="text-center text-gray-500">Belum ada data fasilitas.</p>
    ) : (
      <>
        {/* === MOBILE SLIDER (1 PER 1) === */}
        <div className="block sm:hidden">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative w-full h-56">
              <Image
                src={`${image_url}/${fasilitas[currentFasIndex].Gambar}`}
                alt={fasilitas[currentFasIndex].judul}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {fasilitas[currentFasIndex].judul}
              </h3>
              <p className="text-gray-600 text-sm">
                {fasilitas[currentFasIndex].deskripsi}
              </p>
            </div>
          </div>
        </div>
{/* === TABLET (iPad Mini) — 1 Baris, 2 Card Terbaru === */}
<div className="hidden sm:block lg:hidden">
  <div className="grid grid-cols-2 gap-6">
    {fasilitas.slice(-2).map((item) => (
      <div
        key={item.id}
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
      >
        <div className="relative w-full h-48">
          <Image
            src={`${image_url}/${item.Gambar}`}
            alt={item.judul}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {item.judul}
          </h3>
          <p className="text-gray-600 text-sm">
            {item.deskripsi}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>


        {/* === DESKTOP GRID === */}
       <div className="hidden lg:grid lg:grid-cols-3 gap-10">

          {fasilitas.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
            >
              <div className="relative w-full h-56">
                <Image
                  src={`${image_url}/${item.Gambar}`}
                  alt={item.judul}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.judul}
                </h3>
                <p className="text-gray-600 text-sm">{item.deskripsi}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    <div className="text-center mt-12">
      <Link
        href="/client/Fasilitas"
        className="inline-block bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition"
      >
        Lihat Semua Fasilitas
      </Link>
    </div>
  </div>
</motion.section>



      {/* === SECTION 6 === */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        id="section-6"
        className="py-16 bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6">
            Lokasi SDN 01 Manguharjo Kota Madiun
          </h2>
          <p className="text-gray-600 mb-8">
            Berikut adalah lokasi sekolah kami di Google Maps. Silakan kunjungi
            untuk mendapatkan arah terbaik.
          </p>
          <div className="w-full h-[450px] rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.5028535597626!2d111.50683767532378!3d-7.628943692386682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79be449530b50f%3A0x74dd84532cdf3ff8!2sSDN%2001%20Manguharjo%20Kota%20Madiun!5e0!3m2!1sen!2sid!4v1758957695332!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </motion.section>

{/* === SECTION 7 === */}
<motion.section
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  className="bg-gray-50 py-20"
>
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
      BERITA TERBARU SDN 01 MANGUHARJO
    </h2>

    {loadingBerita ? (
      <p className="text-center text-gray-500">Memuat berita...</p>
    ) : berita.length === 0 ? (
      <p className="text-center text-gray-500">Belum ada berita yang tersedia.</p>
    ) : (
      <>
      {/* === MOBILE — 3 berita tampil menurun === */}
<div className="block sm:hidden space-y-6">
  {berita.slice(0, 3).map((item, index) => (
    <div
      key={index}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="relative w-full h-56">
        <Image
          src={`${image_url}/${item.gambar}`}
          alt={item.judul}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {item.judul}
        </h3>

        <p className="text-gray-600 text-sm mt-2 line-clamp-3">
          {item.deskripsi}
        </p>
      </div>
    </div>
  ))}
</div>


        {/* === iPad Mini — 2 berita terbaru === */}
        <div className="hidden sm:block lg:hidden">
          <div className="grid grid-cols-2 gap-6">
            {berita.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={`${image_url}/${item.gambar}`}
                    alt={item.judul}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {item.judul}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {item.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === DESKTOP — 3 kolom === */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-10">
          {berita.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
            >
              <div className="relative w-full h-56">
                <Image
                  src={`${image_url}/${item.gambar}`}
                  alt={item.judul}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                  {item.judul}
                </h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                  {item.deskripsi}
                </p>
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    <div className="text-center mt-12">
      <Link
        href="/client/berita"
        className="inline-block bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition"
      >
        Lihat Semua Berita
      </Link>
    </div>
  </div>
</motion.section>


      <Footer />
    </>
  );
}
