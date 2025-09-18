import { SalesStats } from '../../types';
import { Card, CardContent } from '../ui/card';
import { TrendingUp, ShoppingBag, DollarSign, Clock } from 'lucide-react';

interface SalesOverviewProps {
  stats: SalesStats;
}

export default function SalesOverview({ stats }: SalesOverviewProps) {
  const statsCards = [
    {
      title: "Today's Sales",
      value: `$${stats.todayTotal.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Orders Today",
      value: stats.todayOrders.toString(),
      icon: ShoppingBag,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Shift Total",
      value: `$${stats.shiftTotal.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Open Tabs",
      value: stats.openTabs.toString(),
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 px-4 sm:px-6">
      {statsCards.map((stat, index) => (
        <Card key={index} className="border-border hover:shadow-pos transition-smooth">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2`}>
                <stat.icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}