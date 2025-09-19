import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, ShoppingCart, Clock, User, MapPin, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseOrder, OrderWithItems, DatabaseProduct } from '../types/database';
import { useToast } from '../hooks/use-toast';
import OrderForm from '../components/orders/OrderForm';

export default function Orders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as OrderWithItems[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSuccess = () => {
    fetchOrders();
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: status as DatabaseOrder['status'] }
          : order
      ));

      toast({
        title: "Order updated",
        description: `Order status changed to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/70 p-6 sm:p-8 text-primary-foreground">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Orders</h1>
              <p className="text-primary-foreground/90 text-base sm:text-lg">
                Manage and track your restaurant orders
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/orders/new'}
              className="bg-white text-primary hover:bg-white/90 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
          <div className="absolute -right-4 -top-4 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/10"></div>
          <div className="absolute -left-4 -bottom-4 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/5"></div>
        </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No orders yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start taking orders to see them here. Create your first order to get started.
            </p>
            <Button 
              onClick={() => window.location.href = '/orders/new'}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Order
            </Button>
          </CardContent>
        </Card>
      ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg sm:text-xl truncate">
                          {order.customer_name || 'Walk-in Customer'}
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs sm:text-sm">{new Date(order.created_at).toLocaleString()}</span>
                          </div>
                          {order.table_number && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs sm:text-sm">Table {order.table_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0">
                      <Badge className={`${getStatusColor(order.status)} border-0 shadow-sm text-xs`}>
                        {order.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/orders/print/${order.id}`, '_blank')}
                        className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <Printer className="h-3 w-3" />
                        <span className="hidden sm:inline">Print</span>
                      </Button>
                      <span className="text-lg sm:text-xl font-bold text-primary">
                        {formatCurrency(Number(order.total_amount))}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Order Items */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2 sm:p-3">
                        <span className="font-medium text-xs sm:text-sm">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-semibold text-xs sm:text-sm">{formatCurrency(Number(item.subtotal))}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-r from-muted/50 to-transparent rounded-xl p-3 sm:p-4 space-y-2 text-sm mb-4 sm:mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(Number(order.subtotal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-medium">{formatCurrency(Number(order.tax_amount))}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-2">
                      <span>Total:</span>
                      <span className="text-primary">{formatCurrency(Number(order.total_amount))}</span>
                    </div>
                  </div>

                  {/* Status Actions */}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="text-xs sm:text-sm"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="text-xs sm:text-sm"
                        >
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="text-xs sm:text-sm"
                        >
                          Complete Order
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="text-xs sm:text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Mobile Print Button */}
                  <div className="sm:hidden mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/orders/print/${order.id}`, '_blank')}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Print Receipt
                    </Button>
                  </div>

                  {order.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Notes:</strong> {order.notes}</p>
                    </div>
                  )}
                </CardContent>
            </Card>
        ))}
        </div>
      )}
      
      </div>
    </div>
  );
}