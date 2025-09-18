import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/auth/AuthPage";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddProduct from "./pages/AddProduct";
import NewOrder from "./pages/NewOrder";
import PrintOrder from "./pages/PrintOrder";
import Subscription from "./pages/Subscription";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { profile } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          <AuthRoute>
            <AuthPage onSuccess={() => window.location.href = '/dashboard'} />
          </AuthRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppLayout businessName={profile?.business_name}>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <AppLayout businessName={profile?.business_name}>
              <Products />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <AppLayout businessName={profile?.business_name}>
              <Orders />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <AppLayout businessName={profile?.business_name}>
              <Reports />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subscription" 
        element={
          <ProtectedRoute>
            <AppLayout businessName={profile?.business_name}>
              <Subscription />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products/new" 
        element={
          <ProtectedRoute>
            <AppLayout businessName={profile?.business_name}>
              <AddProduct />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products/:id/edit" 
        element={
          <ProtectedRoute>
            <AppLayout businessName={profile?.business_name}>
              <AddProduct />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders/new" 
        element={
          <ProtectedRoute>
            <AppLayout businessName={profile?.business_name}>
              <NewOrder />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders/print/:id" 
        element={
          <ProtectedRoute>
            <PrintOrder />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
