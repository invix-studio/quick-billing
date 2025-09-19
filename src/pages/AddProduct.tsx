import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductForm from '@/components/products/ProductForm';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProduct } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editingProduct, setEditingProduct] = useState<DatabaseProduct | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEditingProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product details.",
        variant: "destructive",
      });
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate('/products');
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-muted/50 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {editingProduct ? 'Update product details and availability status' : 'Add a new delicious item to your menu'}
            </p>
          </div>
          {editingProduct && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Editing Mode</span>
            </div>
          )}
        </div>

        {/* Product Form */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="bg-card rounded-lg">
              <ProductForm
                product={editingProduct}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
                isPage={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}