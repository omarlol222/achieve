import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Media {
  media_url: string;
  media_type: 'image' | 'video';
}

interface ProductMediaProps {
  media?: Media[];
  imageUrl?: string | null;
}

export const ProductMedia = ({ media, imageUrl }: ProductMediaProps) => {
  const hasMedia = (media?.length ?? 0) > 0;
  const showCarouselControls = hasMedia || imageUrl;
  const multipleItems = (media?.length ?? 0) > 1;

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {hasMedia ? (
          media?.map((item, index) => (
            <CarouselItem key={index}>
              <div className="aspect-[16/9] w-full bg-[#1B2E35] rounded-lg overflow-hidden">
                {item.media_type === 'video' ? (
                  <video
                    className="w-full h-full object-cover"
                    controls
                    src={item.media_url}
                  />
                ) : (
                  <img
                    src={item.media_url}
                    alt={`Product media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </CarouselItem>
          ))
        ) : imageUrl ? (
          <CarouselItem>
            <div className="aspect-[16/9] w-full bg-[#1B2E35] rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        ) : null}
      </CarouselContent>
      {showCarouselControls && multipleItems && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
};