import React from 'react';

type ProductHeaderProps = {
  name: string;
};

export const ProductHeader = ({ name }: ProductHeaderProps) => (
  <h1 className="text-6xl font-bold text-[#1B2E35] mb-12">{name}</h1>
);