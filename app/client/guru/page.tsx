"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "@/components/Footer";
import { apiEndpoints, image_url } from "@/app/api/api";

export default function DaftarGuru() {
  const [kepalaSekolah, setKepalaSekolah] = useState<any[]>([]);
  const [guruMapel, setGuruMapel] = useState<any[]>([]);
  const [guruKelas, setGuruKelas] = useState<any[]>([]);
  const [karyawan, setKaryawan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const res = await axios.get(apiEndpoints.GETGuru);
        const data = res.data;

        setKepalaSekolah(data.filter((x: any) => x.kategori === "Kepala Sekolah"));
        setGuruMapel(data.filter((x: any) => x.kategori === "Guru Mapel"));
        setGuruKelas(data.filter((x: any) => x.kategori === "Guru Kelas"));
        setKaryawan(data.filter((x: any) => x.kategori === "Karyawan"));
      } catch (err) {
        console.log("Error fetch guru:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuru();
  }, []);

  // === Skeleton Components ===
  const SkeletonCard = () => (
    <div className="bg-gray-200 animate-pulse rounded-xl w-full max-w-[260px] mx-auto overflow-hidden">
      <div className="w-full h-[260px] bg-gray-300"></div>
      <div className="p-4 text-center">
        <div className="h-5 bg-gray-300 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mt-3"></div>
      </div>
    </div>
  );

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
                    gap-8 max-w-6xl mx-auto px-4 py-10">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );

  // === Grid Guru Reusable ===
  const GridGuru = ({ data }: { data: any[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
                    gap-8 max-w-6xl mx-auto px-4 py-10">
      {data.map((guru, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md overflow-hidden border w-full max-w-[260px] mx-auto"
        >
          <img
            src={`${image_url}/${guru.gambar}`}
            alt={guru.nama}
            className="w-full h-[260px] object-cover"
          />

          <div className="p-4 text-center">
            <h2 className="font-bold text-lg">{guru.nama}</h2>
            <p className="mt-1 text-gray-700 text-sm">• {guru.jabatan}</p>
          </div>
        </div>
      ))}
    </div>
  );

  // === Loading State: tampilkan skeleton ===
  if (loading)
    return (
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="bg-gray-300 h-64 animate-pulse"></div>

        <h2 className="text-center text-4xl font-bold mt-10 animate-pulse text-gray-400">
          Loading data guru...
        </h2>

        <SkeletonGrid />
        <SkeletonGrid />
      </div>
    );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-red-800 h-64 flex items-center justify-center">
        <h1 className="text-white text-[40px] font-bold">
          Daftar Guru dan Staf SDN 01 Manguharjo
        </h1>
      </div>

      {/* KEPALA SEKOLAH */}
      <h2 className="text-center text-3xl md:text-5xl font-bold mt-16">
        Kepala Sekolah
      </h2>

      <div className="flex justify-center py-10">
        {kepalaSekolah.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border w-[300px]">
            <img
              src={`${image_url}/${kepalaSekolah[0].gambar}`}
              alt={kepalaSekolah[0].nama}
              className="w-full h-[350px] object-cover"
            />

            <div className="p-4 text-center">
              <h2 className="font-bold text-xl">{kepalaSekolah[0].nama}</h2>
              <p className="mt-1 text-gray-700">• {kepalaSekolah[0].jabatan}</p>
            </div>
          </div>
        ) : (
          <p>Tidak ada data kepala sekolah.</p>
        )}
      </div>

      {/* GURU MAPEL */}
      <h2 className="text-center text-3xl md:text-5xl font-bold mt-16">
        Guru Mapel
      </h2>
      <GridGuru data={guruMapel} />

      {/* GURU KELAS */}
      <h2 className="text-center text-3xl md:text-5xl font-bold mt-16">
        Guru Kelas
      </h2>
      <GridGuru data={guruKelas} />

      {/* KARYAWAN */}
      <h2 className="text-center text-3xl md:text-5xl font-bold mt-16">
        Staff
      </h2>
      <GridGuru data={karyawan} />

      <Footer />
    </div>
  );
}
