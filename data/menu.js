export const categories = [
  { id: "kopi", label: "Kopi", title: "Menu Kopi" },
  { id: "nonkopi", label: "Non Kopi", title: "Menu Non Kopi" },
  { id: "makanan", label: "Makanan", title: "Menu Makanan" },
];

const A = "from-amber-400 to-amber-600";

export const menuItems = [
  // Kopi
  { id: "espresso", category: "kopi", name: "Espresso", desc: "Shot kopi murni dengan rasa kuat dan aroma yang kaya", price: 18000, img: "/Assets/espresso.jpeg", grad: A },
  { id: "americano", category: "kopi", name: "Americano", desc: "Espresso dengan air panas, rasa kopi yang lembut", price: 22000, img: "/Assets/americano.jpeg", grad: A },
  { id: "cappuccino", category: "kopi", name: "Cappuccino", desc: "Espresso, susu steamed, dan foam yang sempurna", price: 28000, img: "/Assets/cappuccino.jpg", grad: A },
  { id: "cafe-latte", category: "kopi", name: "Cafe Latte", desc: "Espresso dengan susu yang creamy dan lembut", price: 30000, img: "/Assets/cafelatte.jpeg", grad: A },
  { id: "mocha", category: "kopi", name: "Mocha", desc: "Perpaduan espresso, cokelat, dan susu yang manis", price: 32000, img: "/Assets/mocha.jpg", grad: A },
  { id: "caramel-macchiato", category: "kopi", name: "Caramel Macchiato", desc: "Espresso dengan vanilla, susu, dan caramel sauce", price: 35000, img: "/Assets/maciatio.jpg", grad: A },
  // Non kopi
  { id: "matcha-latte", category: "nonkopi", name: "Matcha Latte", desc: "Teh hijau Jepang premium dengan susu creamy", price: 30000, img: "/Assets/matcha.jpg", grad: "from-green-400 to-green-600" },
  { id: "strawberry-smoothie", category: "nonkopi", name: "Strawberry Smoothie", desc: "Smoothie segar dari strawberry pilihan", price: 28000, img: "/Assets/strawberry.jpg", grad: "from-pink-400 to-pink-600" },
  { id: "orange-juice", category: "nonkopi", name: "Fresh Orange Juice", desc: "Jus jeruk segar murni tanpa gula tambahan", price: 25000, img: "/Assets/jusjeruk.png", grad: "from-yellow-400 to-orange-600" },
  { id: "taro-latte", category: "nonkopi", name: "Taro Latte", desc: "Minuman talas dengan susu yang creamy dan manis", price: 32000, img: "/Assets/taromana.jpg", grad: "from-purple-400 to-purple-600" },
  { id: "hot-chocolate", category: "nonkopi", name: "Hot Chocolate", desc: "Cokelat panas dengan whipped cream di atasnya", price: 27000, img: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1374&q=80", grad: "from-red-400 to-red-600" },
  { id: "lemon-tea", category: "nonkopi", name: "Lemon Tea", desc: "Teh dengan perasan lemon segar yang menyegarkan", price: 20000, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1374&q=80", grad: "from-blue-400 to-blue-600" },
  // Makanan
  { id: "croissant", category: "makanan", name: "Croissant", desc: "Pastry Prancis yang renyah dan lembut", price: 22000, img: "/Assets/croissant.png", grad: "from-yellow-400 to-yellow-600" },
  { id: "club-sandwich", category: "makanan", name: "Club Sandwich", desc: "Sandwich lapis tiga dengan isian ayam dan sayuran", price: 38000, img: "/Assets/sandwich.jpg", grad: "from-orange-400 to-orange-600" },
  { id: "aglio-olio", category: "makanan", name: "Aglio Olio Pasta", desc: "Pasta dengan saus bawang putih dan olive oil", price: 42000, img: "/Assets/pasta.jpeg", grad: "from-red-400 to-red-600" },
  { id: "caesar-salad", category: "makanan", name: "Caesar Salad", desc: "Salad segar dengan dressing caesar dan crouton", price: 35000, img: "/Assets/salad.jpg", grad: "from-green-400 to-green-600" },
  { id: "chocolate-cake", category: "makanan", name: "Chocolate Cake", desc: "Kue cokelat lembut dengan frosting yang manis", price: 30000, img: "/Assets/cake.jpeg", grad: "from-purple-400 to-purple-600" },
  { id: "pancake-stack", category: "makanan", name: "Pancake Stack", desc: "Pancake berlapis dengan sirup maple dan butter", price: 32000, img: "/Assets/pancake.jpeg", grad: "from-pink-400 to-pink-600" },
];
