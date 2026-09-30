"use client"
import React, { createContext, useState, useContext } from 'react';

const ProdukHoverContext = createContext();

export const ProdukHoverProvider = ({ children }) => {
  const [isProdukHovered, setIsProdukHovered] = useState(false);

  return (
    <ProdukHoverContext.Provider value={{ isProdukHovered, setIsProdukHovered }}>
      {children}
    </ProdukHoverContext.Provider>
  );
};

export const useProdukHover = () => useContext(ProdukHoverContext);