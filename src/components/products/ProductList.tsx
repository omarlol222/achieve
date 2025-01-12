import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function ProductList({ 
  products, 
  onEdit 
}: { 
  products: any[];
  onEdit: (product: any) => void;
}) {
  const [deleteProduct, setDeleteProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      // Delete product permissions
      const { error: permissionsError } = await supabase
        .from("product_permissions")
        .delete()
        .eq("product_id", deleteProduct.id);

      if (permissionsError) throw permissionsError;

      // Delete product media
      const { error: mediaError } = await supabase
        .from("product_media")
        .delete()
        .eq("product_id", deleteProduct.id);

      if (mediaError) throw mediaError;

      // Delete the product
      const { error: productError } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteProduct.id);

      if (productError) throw productError;

      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting product",
        description: error.message,
      });
    } finally {
      setDeleteProduct(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Features</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                {product.price} {product.currency}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status}
                </span>
              </TableCell>
              <TableCell>
                {product.custom_features?.map((feature: string, index: number) => (
                  <div key={index} className="text-sm">{feature}</div>
                ))}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Link to={`/shop/${product.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteProduct(product)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
      />
    </>
  );
}