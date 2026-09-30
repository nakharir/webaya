"use client";
import { useState } from "react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Dewi Utami",
    role: "Pemilik Toko Elektronik",
    review:
      "Godong benar-benar mengubah cara kami mengelola keuangan toko. Fitur-fiturnya memudahkan kami menyusun laporan keuangan dan memonitor transaksi dengan lebih efisien. Sangat direkomendasikan untuk bisnis kecil hingga menengah!",
    image: "/org3.jpg",
    rating: 5,
  },
  {
    name: "Rudi Hartono",
    role: "Pengusaha UMKM",
    review:
      "Aplikasi ini sangat membantu dalam pengelolaan bisnis saya. Antarmukanya sederhana dan fitur-fiturnya lengkap!",
    image: "/org2.jpg",
    rating: 4,
  },
  {
    name: "Siti Aisyah",
    role: "Pemilik Warung Makan",
    review:
      "Sangat direkomendasikan bagi pemilik usaha kecil! Laporan keuangannya sangat membantu dalam pengambilan keputusan bisnis saya!",
    image: "/org1.webp",
    rating: 5,
  },
];

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="flex flex-col md:flex-row items-center justify-center max-w-5xl w-full">
        {/* Deskripsi di kiri dengan lebih banyak jarak */}
        <div className="w-full md:w-1/3 text-left md:pr-16 mb-6 md:mb-0">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Lebih dari 100+ Orang menggunakan Layanan kami
          </h2>
          <p className="text-gray-500 mt-3">
            Menaruh kepercayaan kepada kami dan merasakan manfaatnya.
          </p>
        </div>

        {/* Card Testimonial di tengah */}
        <div className="relative flex items-center w-full md:w-2/3 justify-center">
          <button
            onClick={prevSlide}
            className="absolute left-[-2.5rem] md:left-[-3.5rem] p-3 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg flex flex-col items-center text-center">
            <img
              src={testimonials[currentIndex].image}
              alt={testimonials[currentIndex].name}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <FaQuoteLeft className="text-green-600 text-4xl" />
            <div className="flex mt-2">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <FaStar key={i} className="text-yellow-500 text-xl" />
              ))}
            </div>
            <p className="text-gray-700 mt-4">{testimonials[currentIndex].review}</p>
            <div className="mt-4">
              <h3 className="font-bold text-lg">{testimonials[currentIndex].name}</h3>
              <p className="text-gray-500 text-sm">{testimonials[currentIndex].role}</p>
            </div>
          </div>

          <button
            onClick={nextSlide}
            className="absolute right-[-2.5rem] md:right-[-3.5rem] p-3 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
