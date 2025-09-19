import SubscriptionPlans from '../components/subscriptions/SubscriptionPlans';

export default function Subscription() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/70 p-6 sm:p-8 text-primary-foreground">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Subscription Management</h1>
            <p className="text-primary-foreground/90 text-base sm:text-lg">
              Manage your subscription plan and billing
            </p>
          </div>
          <div className="absolute -right-4 -top-4 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/10"></div>
          <div className="absolute -left-4 -bottom-4 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/5"></div>
        </div>

        <SubscriptionPlans />
      </div>
    </div>
  );
}