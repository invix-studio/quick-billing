import { Product, SalesStats } from '../types';

// Import all food images
import margheritaPizza from '../assets/margherita-pizza.jpg';
import pepperoniPizza from '../assets/pepperoni-pizza.jpg';
import caesarSalad from '../assets/caesar-salad.jpg';
import grilledChicken from '../assets/grilled-chicken.jpg';
import fishChips from '../assets/fish-chips.jpg';
import cappuccino from '../assets/cappuccino.jpg';
import chocolateCake from '../assets/chocolate-cake.jpg';
import pastaCarbonara from '../assets/pasta-carbonara.jpg';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    price: 12.99,
    category: 'Pizza',
    description: 'Fresh tomato sauce, mozzarella, basil',
    image: margheritaPizza,
    available: true,
    preparationTime: 15,
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    price: 15.99,
    category: 'Pizza',
    description: 'Pepperoni, mozzarella, tomato sauce',
    image: pepperoniPizza,
    available: true,
    preparationTime: 15,
  },
  {
    id: '3',
    name: 'Caesar Salad',
    price: 8.99,
    category: 'Salads',
    description: 'Romaine lettuce, parmesan, croutons, caesar dressing',
    image: caesarSalad,
    available: true,
    preparationTime: 5,
  },
  {
    id: '4',
    name: 'Grilled Chicken',
    price: 18.99,
    category: 'Mains',
    description: 'Herb-marinated chicken breast with seasonal vegetables',
    image: grilledChicken,
    available: true,
    preparationTime: 20,
  },
  {
    id: '5',
    name: 'Fish & Chips',
    price: 16.99,
    category: 'Mains',
    description: 'Beer-battered cod with hand-cut fries',
    image: fishChips,
    available: true,
    preparationTime: 18,
  },
  {
    id: '6',
    name: 'Cappuccino',
    price: 4.50,
    category: 'Beverages',
    description: 'Espresso with steamed milk foam',
    image: cappuccino,
    available: true,
    preparationTime: 3,
  },
  {
    id: '7',
    name: 'Chocolate Cake',
    price: 6.99,
    category: 'Desserts',
    description: 'Rich chocolate cake with ganache',
    image: chocolateCake,
    available: true,
    preparationTime: 2,
  },
  {
    id: '8',
    name: 'Pasta Carbonara',
    price: 14.99,
    category: 'Pasta',
    description: 'Spaghetti with eggs, pancetta, parmesan',
    image: pastaCarbonara,
    available: true,
    preparationTime: 12,
  },
];

export const mockSalesStats: SalesStats = {
  todayTotal: 1247.50,
  todayOrders: 47,
  shiftTotal: 324.75,
  openTabs: 3,
};

export const categories = ['All', 'Pizza', 'Pasta', 'Mains', 'Salads', 'Beverages', 'Desserts'];