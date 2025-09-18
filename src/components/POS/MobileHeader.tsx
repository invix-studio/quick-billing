import { useState } from 'react';
import { Button } from '../ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { CartItem } from '../../types';

interface MobileHeaderProps {
  cartItems: CartItem[];
  onToggleCart: () => void;
  isCartOpen: boolean;
}

export default function MobileHeader({ cartItems, onToggleCart, isCartOpen }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <header className="lg:hidden bg-background border-b border-border px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="touch-target p-2"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-bold text-foreground">Restaurant POS</h1>
        </div>

        {/* Cart Button */}
        <Button
          variant="outline"
          onClick={onToggleCart}
          className="touch-target-lg relative px-3"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <>
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {cartCount}
              </span>
              <span className="ml-2 hidden sm:inline font-medium">
                ${cartTotal.toFixed(2)}
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg animate-slide-up">
          <div className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start touch-target-lg">
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start touch-target-lg">
              Products
            </Button>
            <Button variant="ghost" className="w-full justify-start touch-target-lg">
              Orders
            </Button>
            <Button variant="ghost" className="w-full justify-start touch-target-lg">
              Reports
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}