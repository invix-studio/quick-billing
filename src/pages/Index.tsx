import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Store, ArrowRight, Users, BarChart3, Package, ShoppingCart } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Store className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-4">
            QuickBilling
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Complete restaurant billing solution with custom product uploads, order management, and secure user accounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg sm:text-xl">User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Secure authentication with Supabase Auth. Each user has their own private account.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg sm:text-xl">Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Upload and manage custom products with prices, descriptions, and categories.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg sm:text-xl">Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Create bills, track orders, and manage customer information with ease.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg sm:text-xl">Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                View sales summaries, track performance, and export data for accounting.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="space-y-8 sm:space-y-12 px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete restaurant billing system designed for modern businesses
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold">Secure & Private</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                  Row-Level Security (RLS) policies prevent data overlap between users
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                  Real-time updates for products, orders, and reports
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                  Automatic calculation of subtotal, taxes, and total amount
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold">Powerful Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                  Daily, weekly, and monthly sales reports
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                  Product performance tracking (best sellers, revenue stats)
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                  Export options for accounting or record-keeping
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 sm:mt-16 px-4">
          <Card className="max-w-md mx-auto hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Ready to get started?</CardTitle>
              <CardDescription className="text-sm">
                Join restaurants already using QuickBilling to streamline their operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth" className="w-full">
                <Button size="lg" className="w-full">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
