import { useState } from 'react';
import { Product } from '../../types';
import { categories } from '../../data/mockData';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Clock } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && product.available;
  });

  return (
    <div className="flex-1 p-4 sm:p-6 bg-pos-grid overflow-auto">
      {/* Header - Hidden on mobile when header component is shown */}
      <div className="mb-4 sm:mb-6 hidden lg:block">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Point of Sale</h1>
        <p className="text-muted-foreground">Select items to add to cart</p>
      </div>

      {/* Search */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 sm:h-12 text-base bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 touch-target-lg"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="h-9 sm:h-10 px-3 sm:px-4 text-sm font-medium transition-base touch-target whitespace-nowrap flex-shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="pos-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="pos-item group"
            onClick={() => onAddToCart(product)}
          >
            <div className="flex flex-col h-full">
              {/* Product Image */}
              <div className="w-full h-20 sm:h-24 md:h-28 bg-surface rounded-md sm:rounded-lg mb-2 sm:mb-3 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-surface flex items-center justify-center">
                    <div className="text-muted-foreground text-xs sm:text-sm">No Image</div>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm sm:text-base leading-tight">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2 leading-tight">
                  {product.description}
                </p>
              </div>

              {/* Bottom Info */}
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-base sm:text-lg font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.preparationTime && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{product.preparationTime}m</span>
                    <span className="sm:hidden">{product.preparationTime}'</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="text-muted-foreground mb-2">No products found</div>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or category filter
          </p>
        </div>
      )}
    </div>
  );
}