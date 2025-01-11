import React from 'react';
import { Button } from "@/components/ui/button";

type ProductPurchaseProps = {
  price: number;
  currency: string;
};

export const ProductPurchase = ({ price, currency }: ProductPurchaseProps) => (
  <div className="space-y-4">
    <h2 className="text-6xl font-bold text-[#1B2E35] text-center">
      {price} {currency}
    </h2>
    <Button 
      className="w-full bg-[#1B2E35] hover:bg-[#2d3f48] text-white text-2xl py-8 rounded-none"
    >
      BUY
    </Button>
  </div>
);