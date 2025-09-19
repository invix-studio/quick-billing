import { useState } from 'react';
import { CartItem, Product } from '../../types';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, X } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Cart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isOpen = true,
  onClose,
  isMobile = false
}: CartProps) {
  const [orderNotes, setOrderNotes] = useState('');
  const { toast } = useToast();

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items before checkout",
        variant: "destructive",
      });
      return;
    }

    onCheckout();
    if (isMobile && onClose) {
      onClose();
    }
    toast({
      title: "Order placed successfully!",
      description: `Order total: $${total.toFixed(2)}`,
      className: "animate-pulse-success",
    });
  };

  const cartContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 p-4 sm:p-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold">Cart</h2>
        </div>
        <div className="flex items-center gap-2">
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCart}
              className="h-8 px-3 text-xs touch-target"
            >
              Clear All
            </Button>
          )}
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="touch-target p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto mb-4 sm:mb-6 px-4 sm:px-0">
        {cartItems.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add items from the menu</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-background rounded-lg p-3 sm:p-4 border border-border animate-slide-up"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-foreground line-clamp-1 text-sm sm:text-base">
                    {item.product.name}
                  </h4>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-muted-foreground hover:text-error transition-base touch-target p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  ${item.product.price.toFixed(2)} each
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0 touch-target"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0 touch-target"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-semibold text-primary text-sm sm:text-base">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Notes */}
      {cartItems.length > 0 && (
        <div className="mb-4 sm:mb-6 px-4 sm:px-0">
          <label className="block text-sm font-medium text-foreground mb-2">
            Order Notes
          </label>
          <Textarea
            placeholder="Special instructions for kitchen..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            className="resize-none h-16 sm:h-20 text-sm"
          />
        </div>
      )}

      {/* Order Summary */}
      {cartItems.length > 0 && (
        <div className="space-y-4 px-4 sm:px-0 pb-4 sm:pb-0">
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base sm:text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            className="w-full h-11 sm:h-12 text-base font-semibold touch-target-lg"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Checkout ${total.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div className="mobile-cart-overlay" onClick={onClose} />
        )}
        
        {/* Mobile Cart */}
        <div className={`mobile-cart ${isOpen ? 'open' : 'closed'}`}>
          {cartContent}
        </div>
      </>
    );
  }

  // Desktop Cart
  return (
    <div className="cart-area w-80 lg:w-96 flex flex-col h-full shadow-cart">
      {cartContent}
    </div>
  );
}