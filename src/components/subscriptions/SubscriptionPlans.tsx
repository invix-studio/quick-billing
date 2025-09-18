import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at?: string;
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPlansAndSubscription();
    }
  }, [user]);

  const fetchPlansAndSubscription = async () => {
    try {
      // Fetch subscription plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (plansError) throw plansError;
      const formattedPlans = (plansData || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? plan.features.map(f => String(f))
          : []
      }));
      setPlans(formattedPlans);

      // Fetch user's current subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') throw subError;
      setUserSubscription(subData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        });

      if (error) throw error;

      toast({
        title: "Subscription Updated",
        description: "Your subscription has been successfully updated.",
      });

      fetchPlansAndSubscription();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription.",
        variant: "destructive",
      });
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return <Zap className="h-5 w-5" />;
      case 'basic': return <Star className="h-5 w-5" />;
      case 'premium': return <Crown className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return userSubscription?.plan_id === planId && userSubscription?.status === 'active';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-96 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the perfect plan for your restaurant business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.id);
          const isPremium = plan.name.toLowerCase() === 'premium';

          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                isPremium ? 'border-primary shadow-primary/20' : ''
              } ${isCurrent ? 'ring-2 ring-primary' : ''}`}
            >
              {isPremium && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                  Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getPlanIcon(plan.name)}
                  <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                <div className="flex items-center justify-center gap-1 mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent}
                  variant={isCurrent ? "secondary" : isPremium ? "default" : "outline"}
                  className="w-full"
                >
                  {isCurrent ? (
                    <>
                      <Badge variant="secondary" className="mr-2">Current Plan</Badge>
                    </>
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {userSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-medium">Status: {userSubscription.status}</p>
                <p className="text-sm text-muted-foreground">
                  Started: {new Date(userSubscription.started_at).toLocaleDateString()}
                </p>
                {userSubscription.expires_at && (
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(userSubscription.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}