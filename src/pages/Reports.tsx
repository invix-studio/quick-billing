import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseOrder, DatabaseProduct } from '../types/database';

interface ReportStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  topProducts: Array<{
    product: DatabaseProduct;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function Reports() {
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrder: 0,
    topProducts: [],
    dailyStats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }

      // Fetch orders with items
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .eq('status', 'completed');

      if (error) throw error;

      const ordersData = orders || [];
      const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const totalOrders = ordersData.length;
      const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate top products
      const productStats: { [key: string]: { product: DatabaseProduct; quantity: number; revenue: number; } } = {};
      
      ordersData.forEach(order => {
        order.order_items.forEach(item => {
          const productId = item.product.id;
          if (!productStats[productId]) {
            productStats[productId] = {
              product: item.product,
              quantity: 0,
              revenue: 0
            };
          }
          productStats[productId].quantity += item.quantity;
          productStats[productId].revenue += Number(item.subtotal);
        });
      });

      const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(stat => ({
          product: stat.product,
          totalQuantity: stat.quantity,
          totalRevenue: stat.revenue
        }));

      // Calculate daily stats
      const dailyStatsMap: { [key: string]: { revenue: number; orders: number; } } = {};
      
      ordersData.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!dailyStatsMap[date]) {
          dailyStatsMap[date] = { revenue: 0, orders: 0 };
        }
        dailyStatsMap[date].revenue += Number(order.total_amount);
        dailyStatsMap[date].orders += 1;
      });

      const dailyStats = Object.entries(dailyStatsMap)
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats({
        totalRevenue,
        totalOrders,
        averageOrder,
        topProducts,
        dailyStats
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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
          <div className="relative z-10 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Reports & Analytics</h1>
              <p className="text-primary-foreground/90 text-base sm:text-lg">
                Track your restaurant's performance and insights
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['week', 'month', 'year'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={period === p ? 'bg-white text-primary hover:bg-white/90' : 'border-white/20 text-white hover:bg-white/10'}
                >
                  <span className="text-xs sm:text-sm">
                    {p === 'week' ? 'Last 7 Days' : p === 'month' ? 'Last 30 Days' : 'Last Year'}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/10"></div>
          <div className="absolute -left-4 -bottom-4 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/5"></div>
        </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Last {period === 'week' ? '7 days' : period === 'month' ? '30 days' : 'year'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Completed orders
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium">Average Order</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">{formatCurrency(stats.averageOrder)}</div>
            <p className="text-xs text-muted-foreground">
              Per order value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
            <CardDescription>Best performing items by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topProducts.map((item, index) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/30 to-transparent rounded-xl">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-primary/10 border-primary/20">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.totalQuantity} sold
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-primary">
                      {formatCurrency(item.totalRevenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Stats */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Performance
            </CardTitle>
            <CardDescription>Revenue and orders by day</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.dailyStats.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No data available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-auto">
                {stats.dailyStats.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/30 to-transparent rounded-xl border hover:shadow-md transition-all duration-200">
                    <div>
                      <p className="font-medium">{formatDate(day.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.orders} orders
                      </p>
                    </div>
                    <span className="font-bold text-primary">
                      {formatCurrency(day.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Export Options */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              Export Data
            </CardTitle>
            <CardDescription className="text-sm">Download reports for your records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button variant="outline" disabled className="hover:bg-muted/50 text-sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV (Coming Soon)
              </Button>
              <Button variant="outline" disabled className="hover:bg-muted/50 text-sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}