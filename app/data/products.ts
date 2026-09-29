export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  audience: string;
}

export const products: Product[] = [
  { id: 1, name: "Birthday Chocolate Hamper", category: "Birthday Gifts", description: "A little box of happy", price: 899, image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=700&q=80", audience: "Men" },
  { id: 2, name: "The Love Notes Box", category: "Romantic Gifts", description: "For all the things left unsaid", price: 749, image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 3, name: "Personalised Memory Frame", category: "Personalized Gifts", description: "Their favourite moments, framed", price: 999, image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 4, name: "Self-Care Sunday Hamper", category: "Self-Care Gifts", description: "A slow Sunday in a box", price: 1299, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 5, name: "Classic Couple Keepsake", category: "Couple Gifts", description: "Keep your story close", price: 1149, image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=700&q=80", audience: "Men" },
  { id: 6, name: "Name & Initials Mug", category: "Personalized Gifts", description: "Made for their morning ritual", price: 549, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 7, name: "Employee Appreciation Box", category: "Corporate Gifting", description: "A thank you that lands well", price: 1099, image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=700&q=80", audience: "Men" },
  { id: 8, name: "Sweet Thank You Tray", category: "Thank You & Appreciation Gifts", description: "Gratitude, beautifully packed", price: 799, image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 9, name: "Birthday Memory Box", category: "Birthday Gifts", description: "A keepsake for their best days", price: 1499, image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 10, name: "Date Night In Box", category: "Romantic Gifts", description: "Tonight is yours", price: 1299, image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=700&q=80", audience: "Men" },
  { id: 11, name: "Custom Photo Cushion", category: "Personalized Gifts", description: "A hug, even from far away", price: 699, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 12, name: "Festival Lights Hamper", category: "Festival Gifts", description: "Celebrate the season together", price: 1599, image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=700&q=80", audience: "Men" },
  { id: 13, name: "Milestone Anniversary Box", category: "Anniversary Gifts", description: "A beautiful reminder of your journey", price: 1699, image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 14, name: "Best Friend Cheer Box", category: "Friendship Gifts", description: "A joyful surprise for your favourite person", price: 899, image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 15, name: "Elegant Wedding Keepsake", category: "Wedding Gifts", description: "A timeless gift for their new beginning", price: 1899, image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 16, name: "Parents Comfort Hamper", category: "Gifts for Parents", description: "A warm thank-you for everything they do", price: 1299, image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 17, name: "Kids Wonder Box", category: "Gifts for Kids", description: "Bright little surprises for curious minds", price: 799, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 18, name: "Signature Luxury Hamper", category: "Luxury Gifts", description: "An elevated gift for extraordinary moments", price: 2499, image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 19, name: "Chocolate & Sweet Hamper", category: "Chocolate & Sweet Hampers", description: "A delicious box of smiles", price: 999, image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=700&q=80", audience: "Women" },
  { id: 20, name: "Fresh Flower Bouquet", category: "Flowers & Bouquets", description: "A colourful gesture that says it all", price: 1199, image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=700&q=80", audience: "Women" }
];

export const categories = [
  { name: "Birthday Gifts", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=700&q=80", subtitle: "Make them smile" },
  { name: "Anniversary Gifts", image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=700&q=80", subtitle: "Celebrate your story" },
  { name: "Romantic Gifts", image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80", subtitle: "For your person" },
  { name: "Personalized Gifts", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=700&q=80", subtitle: "Made just for them" },
  { name: "Corporate Gifting", image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=700&q=80", subtitle: "Thoughtful at every scale" },
  { name: "Festival Gifts", image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=700&q=80", subtitle: "Celebrate the season" }
];
