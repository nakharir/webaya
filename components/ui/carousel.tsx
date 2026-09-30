"use client"; 
import React, { useState } from 'react';

export const Carousel = ({ children, className }: any) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === React.Children.count(children) - 1 ? 0 : prevIndex + 1
        );
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? React.Children.count(children) - 1 : prevIndex - 1
        );
    };

    return (
        <div className={`relative ${className}`}>
            <CarouselContent currentIndex={currentIndex}>
                {children}
            </CarouselContent>
            <CarouselPrevious onClick={goToPrevious} />
            <CarouselNext onClick={goToNext} />
        </div>
    );
};

export const CarouselContent = ({ children, currentIndex }: any) => {
    return (
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {React.Children.map(children, (child, index) => (
                <div className="flex-shrink-0 w-full">{child}</div>
            ))}
        </div>
    );
};

export const CarouselItem = ({ children }: any) => {
    return (
        <div className="carousel-item">
            {children}
        </div>
    );
};

export const CarouselNext = ({ onClick }: any) => {
    return (
        <button
            onClick={onClick}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
        >
            &gt;
        </button>
    );
};

export const CarouselPrevious = ({ onClick }: any) => {
    return (
        <button
            onClick={onClick}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
        >
            &lt;
        </button>
    );
};
