import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OrderWithItems } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Printer, X, Store } from 'lucide-react';

export default function PrintOrder() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [businessName, setBusinessName] = useState('QuickBilling');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
      fetchBusinessName();
    }
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data as OrderWithItems);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusinessName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.business_name) {
        setBusinessName(user.user_metadata.business_name);
      }
    } catch (error) {
      console.error('Error fetching business name:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close();
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-10">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" onClick={handleClose} className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>

      {/* Receipt Content */}
      <div className="max-w-md mx-auto p-8 print:p-4">
        <div className="text-center border-b pb-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Store className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{businessName}</h1>
          </div>
          <p className="text-sm text-gray-600">Receipt</p>
        </div>

        {/* Order Details */}
        <div className="mb-4 text-sm">
          <div className="flex justify-between mb-1">
            <span>Order #:</span>
            <span className="font-mono">{order.id.slice(-8)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Date:</span>
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Customer:</span>
            <span>{order.customer_name || 'Walk-in'}</span>
          </div>
          {order.table_number && (
            <div className="flex justify-between mb-1">
              <span>Table:</span>
              <span>{order.table_number}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="capitalize">{order.status}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-b py-4 mb-4">
          <h3 className="font-semibold mb-3">Items</h3>
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between items-start mb-2 text-sm">
              <div className="flex-1">
                <div className="font-medium">{item.product.name}</div>
                <div className="text-gray-600">{item.quantity} × {formatCurrency(Number(item.unit_price))}</div>
              </div>
              <div className="font-medium">
                {formatCurrency(Number(item.subtotal))}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({order.tax_rate}%):</span>
            <span>{formatCurrency(Number(order.tax_amount))}</span>
          </div>
          {order.package_charge && Number(order.package_charge) > 0 && (
            <div className="flex justify-between">
              <span>Package Charge:</span>
              <span>{formatCurrency(Number(order.package_charge))}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(Number(order.total_amount))}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <div className="font-medium mb-1">Notes:</div>
            <div className="text-gray-700">{order.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t text-xs text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-1">Powered by {businessName}</p>
        </div>
      </div>
    </div>
  );
}