import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderForm from '@/components/orders/OrderForm';

export default function NewOrder() {
  const navigate = useNavigate();

  const handleSuccess = (orderId?: string) => {
    if (orderId) {
      // Show print option after successful order creation
      const shouldPrint = window.confirm('Order created successfully! Would you like to print the receipt?');
      if (shouldPrint) {
        printOrder(orderId);
      }
    }
    navigate('/orders');
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  const printOrder = (orderId: string) => {
    // Open print dialog for the order
    const printWindow = window.open(`/orders/print/${orderId}`, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/orders')}
              className="p-2 hover:bg-muted/50 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                New Order
              </h1>
              <p className="text-muted-foreground text-lg">
                Create a new order for your customer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live ordering system
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border shadow-lg">
          <OrderForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isPage={true}
          />
        </div>
      </div>
    </div>
  );
}