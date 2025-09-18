import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { X, Loader2, Plus, Minus, Trash2, Search, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProduct } from '../../types/database';
import { useToast } from '../../hooks/use-toast';

interface CartItem {
  product: DatabaseProduct;
  quantity: number;
  subtotal: number;
}

interface OrderFormProps {
  onSuccess: (orderId?: string) => void;
  onCancel: () => void;
  isPage?: boolean;
}

export default function OrderForm({ onSuccess, onCancel, isPage = false }: OrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(10);
  const [packageCharge, setPackageCharge] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products.",
        variant: "destructive",
      });
    }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return product.is_available && matchesSearch && matchesCategory;
  });

  const addToCart = (product: DatabaseProduct) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        subtotal: Number(product.price),
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity, subtotal: Number(item.product.price) * quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount + packageCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to the order.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.data.user.id,
          customer_name: customerName || null,
          table_number: tableNumber || null,
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          tax_rate: taxRate,
          package_charge: packageCharge,
          status: 'pending',
          notes: notes || null,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: Number(item.product.price),
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order created",
        description: `Order for ${total.toFixed(2)} has been created successfully.`,
      });

      onSuccess(order.id);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  if (isPage) {
    return (
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Products Section - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search delicious items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50"
                />
              </div>
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-muted-foreground/20 rounded-md bg-background/50 focus:border-primary/50 min-w-[160px]"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-muted-foreground text-lg">No products found</div>
                  <p className="text-sm text-muted-foreground/70">Try adjusting your search or filter</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="group cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-1 border-muted-foreground/10">
                    <CardContent className="p-4">
                      {product.image_url ? (
                        <div className="relative overflow-hidden rounded-lg mb-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-3 flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{product.name}</h3>
                          {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(Number(product.price))}
                          </p>
                          <Badge variant={product.is_available ? "default" : "secondary"} className="text-xs">
                            {product.is_available ? 'Available' : 'Out of Stock'}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={!product.is_available}
                          className="w-full group-hover:bg-primary/90 transition-colors"
                        >
                          {product.is_available ? (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Add to Cart
                            </>
                          ) : (
                            'Unavailable'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Cart Section - 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <Card className="h-full sticky top-4 shadow-lg border-primary/10">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ShoppingCart className="h-4 w-4" />
                    <span>{cart.length} items</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full flex flex-col">
                <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                  {/* Customer Details */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="customer">Customer Name</Label>
                      <Input
                        id="customer"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="table">Table Number</Label>
                      <Input
                        id="table"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="Table number"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="package_charge">Package Charge (₹)</Label>
                      <Input
                        id="package_charge"
                        type="number"
                        step="0.01"
                        min="0"
                        value={packageCharge}
                        onChange={(e) => setPackageCharge(Number(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 text-sm">Cart Items ({cart.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(Number(item.product.price))} each
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm" 
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.product.id)}
                              className="h-6 w-6 p-0 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({taxRate}%):</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    {packageCharge > 0 && (
                      <div className="flex justify-between">
                        <span>Package:</span>
                        <span>{formatCurrency(packageCharge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t pt-1">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <Label htmlFor="notes" className="text-sm">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={cart.length === 0 || isLoading}
                      className="flex-1 text-sm"
                    >
                      {isLoading ? 'Creating...' : 'Create Order'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      className="flex-1 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Create New Order</CardTitle>
              <CardDescription>Add items and customer details</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table">Table Number</Label>
                <Input
                  id="table"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Select Products</h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border rounded-md bg-background text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2 max-h-80 overflow-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(Number(product.price))}
                          </p>
                          {product.category && (
                            <Badge variant="secondary" className="mt-1">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addToCart(product)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p>No items in cart</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-border rounded-lg gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(Number(item.product.price))} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Order Summary */}
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax ({taxRate}%):</span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                      {packageCharge > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Package Charge:</span>
                          <span>{formatCurrency(packageCharge)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="package-charge">Package Charge (₹)</Label>
                <Input
                  id="package-charge"
                  type="number"
                  step="0.01"
                  min="0"
                  value={packageCharge}
                  onChange={(e) => setPackageCharge(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || cart.length === 0} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span className="hidden sm:inline">Create Order </span>
                ({formatCurrency(total)})
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}