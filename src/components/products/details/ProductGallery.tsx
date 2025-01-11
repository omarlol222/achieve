import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Media = {
  media_url: string;
};

type ProductGalleryProps = {
  media: Media[];
};

export const ProductGallery = ({ media }: ProductGalleryProps) => (
  <div className="flex items-center justify-center">
    <Carousel className="w-full">
      <CarouselContent>
        {media?.map((item, index) => (
          <CarouselItem key={index}>
            <div className="h-[300px]">
              <img 
                src={item.media_url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-contain rounded-none"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <div className="flex justify-center gap-2 mt-4">
        {media?.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-gray-300"
          />
        ))}
      </div>
    </Carousel>
  </div>
);