"use client"
import React, { useEffect } from 'react'
import { useProdukHover } from '../context/ProdukHoverContext'
import ProductContent from '@/components/ProductContent';
import { apiEndpoints } from '../api/api'
import axios from "axios";
// import Landing from '@/components/Landing';
export default function Home() {
  const { isProdukHovered } = useProdukHover();
  return (
    <div className='w-full h-full'>
      {isProdukHovered ?
        <div className='w-full h-full overflow-hidden'>
          <ProductContent />
        </div>
        :
        <div className='w-full h-auto'>
          {/* <Landing/> */}
        </div>}
    </div>
  )
}