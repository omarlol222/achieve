import { Button } from "@/components/ui/button";

interface ProductPurchaseProps {
  price: number;
  currency: string;
  onPurchase: () => void;
}

export const ProductPurchase = ({ price, currency, onPurchase }: ProductPurchaseProps) => {
  return (
    <div className="mt-2 space-y-2">
      <p className="text-6xl font-bold text-[#1B2E35] text-right">
        {price} {currency}
      </p>
      
      <Button 
        className="w-full bg-[#1B2E35] hover:bg-[#1B2E35]/90 text-white text-xl py-6"
        onClick={onPurchase}
      >
        BUY
      </Button>
    </div>
  );
};