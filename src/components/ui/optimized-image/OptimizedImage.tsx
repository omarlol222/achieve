import { useImageLoader } from "@/hooks/useImageLoader";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export function OptimizedImage({ src, alt, className, ...props }: OptimizedImageProps) {
  const { imageSrc, isLoading, error } = useImageLoader(src);

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      {error ? (
        <div className="flex items-center justify-center bg-gray-100 p-4">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={cn("w-full h-full object-cover", className)}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}