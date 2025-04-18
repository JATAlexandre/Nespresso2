import type { Machine, CoffeeVariety, Accompaniment, Accessory } from "./types"

// Modifier les caractéristiques des machines pour enlever les références aux tailles de bureau
// et mettre à jour les valeurs de consommation

export const machines: Machine[] = [
  {
    id: "JURA W4",
    name: "JURA W4",
    description: "Jusqu'à 50 tasses/jour",
    image:
      "https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67f786a8836b54c81b290565_erasebg-transformed-2.png",
    price: 1988 + 50, // Prix + forfait maintenance
    monthlyPrice24: 140,
    monthlyPrice36: 109,
    monthlyPrice48: 90,
    features: [
      { type: "cafe", label: "20 à 50 tasses/jour" },
      { type: "compact", label: "Compact" },
    ],
  },
  {
    id: "JURA W8",
    name: "JURA W8",
    description: "Jusqu'à 50 tasses/jour",
    image:
      "https://fr.jura.com/-/media/global/images/professional-products/w-line/w8/w8-ea-sa-dark-inox/w8_ea_darkinox_overview.webp?mw=350&hash=78F81A8D7ACD22AB77E430AF8EA60407",
    price: 1988 + 50, // Prix + forfait maintenance
    monthlyPrice24: 140,
    monthlyPrice36: 109,
    monthlyPrice48: 90,
    features: [
      { type: "cafe", label: "20 à 50 tasses/jour" },
      { type: "compact", label: "Compact" },
      { type: "lait", label: "Boissons lactées" },
    ],
  },
  {
    id: "JURA X4",
    name: "JURA X4",
    description: "Jusqu'à 100 tasses/jour",
    image:
      "https://fr.jura.com/-/media/global/images/professional-products/x-line/X4-EA-SA/x4_ea_sa_darkinox_overview.webp?mw=350&hash=59CA1F248A27399DEBA0A4D39E17545E",
    price: 2100 + 50, // Prix + forfait maintenance
    monthlyPrice24: 165, // prix + forfait maintenance
    monthlyPrice36: 125,
    monthlyPrice48: 105,
    features: [
      { type: "cafe", label: "50 à 150 tasses/jour" },
      { type: "compact", label: "Compact" },
    ],
  },
  {
    id: "JURA X10",
    name: "JURA X10",
    description: "Jusqu'à 100 tasses/jour",
    image:
      "https://fr.jura.com/-/media/global/images/professional-products/x-line/X10-EA-SA/x10_ea_sa_darkinox_overview.webp?mw=350&hash=0ADE76B076CBC48D41F57F7F20295E07",
    price: 2640 + 50, // Prix + forfait maintenance
    monthlyPrice24: 185, // prix + forfait maintenance
    monthlyPrice36: 140,
    monthlyPrice48: 115,
    features: [
      { type: "cafe", label: "50 à 150 tasses/jour" },
      { type: "compact", label: "Compact" },
      { type: "lait", label: "Boissons lactées" },
    ],
  },
  {
    id: "JURA GIGA X3",
    name: "JURA GIGA X3",
    description: "Jusqu'à 150 tasses/jour",
    image:
      "https://fr.jura.com/-/media/global/images/professional-products/giga-professional-line/giga-x3-gen2/overview_GIGAX3_g2.webp?mw=350&hash=C1731394B5E8B253D17F97663DDBA07B",
    price: 4553 + 50, // Prix + forfait maintenance
    monthlyPrice24: 275, // prix + forfait maintenance
    monthlyPrice36: 200,
    monthlyPrice48: 165,
    features: [
      { type: "cafe", label: "150 à 300 tasses/jour" },
      { type: "paiement", label: "Module de paiement" },
      { type: "lait", label: "Système lait" },
    ],
  },
  {
    id: "JURA GIGA X8",
    name: "JURA GIGA X8",
    description: "Jusqu'à 200 tasses/jour",
    image:
      "https://fr.jura.com/-/media/global/images/professional-products/giga-professional-line/giga-x8-gen2/AluBlack/overview_gigax8_g2_aluminium_black.webp?mw=350&hash=B31DBAEB230190D39A4150C0156594A5",
    price: 6345 + 50, // Prix + forfait maintenance
    monthlyPrice24: 345, // prix + forfait maintenance
    monthlyPrice36: 245,
    monthlyPrice48: 199,
    features: [
      { type: "cafe", label: "200 à 300 tasses/jour" },
      { type: "paiement", label: "Module de paiement" },
      { type: "lait", label: "Système lait" },
    ],
  },
  {
    id: "NECTA KREA",
    name: "NECTA KREA TOUCH",
    description: "Jusqu'à 100 tasses/jour",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/16303.jpg",
    price: 4000 + 50, // Prix + forfait maintenance
    monthlyPrice24: 250,
    monthlyPrice36: 189,
    monthlyPrice48: 150,
    features: [
      { type: "cafe", label: "80 à 120 tasses/jour" },
      { type: "paiement", label: "Module de paiement" },
      { type: "lait", label: "Boissons lactées" },
    ],
  },
]

// Modifier les variétés de café pour enlever un café et renommer les autres
export const coffeeVarieties: CoffeeVariety[] = [
  {
    id: "coffee-1",
    reference: "1502",
    brand: "MIKO",
    name: "Café économie - 1kg",
    intensity: 8,
    description: "Un café intense et corsé",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/1502.jpg",
    price: 20.8,
    pricePerCup: 20.8 / 120,
  },
  {
    id: "coffee-2",
    reference: "17484",
    brand: " LES PROD'ACTEURS",
    name: "Café de spécialité - 1kg",
    intensity: 7,
    description: "Un café doux et équilibré",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/17484.jpg",
    price: 21.6,
    pricePerCup: 0.18,
  },
  {
    id: "coffee-3",
    reference: "1523",
    brand: "PURO",
    name: "Café bio - 1kg",
    intensity: 6,
    description: "Un café à l'équilibre parfait entre douceur et intensité",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/xlarge/1523.jpg",
    price: 22.16,
    pricePerCup: 22.16 / 120,
  },
  {
    id: "coffee-5",
    reference: "17624",
    brand: "CHANGEPLEASE",
    name: "Café social - 1kg",
    intensity: 5,
    description: "Un café aromatique et engagé",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/xlarge/17624.jpg",
    price: 30.0,
    pricePerCup: 30.0 / 120,
  },
  {
    id: "coffee-6",
    reference: "16330",
    brand: "CAFÉ JOYEUX",
    name: "Café éthique - 1kg",
    intensity: 6,
    description: "Un café équilibré et éthique",
    image:
      "https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/676921b633d8a05ea45dc27e_Cafe%CC%81%20joyeux.png",
    price: 32.89,
    pricePerCup: 32.89 / 120,
  },
]

export const accompaniments: Accompaniment[] = [
  {
    id: "accompaniment-1",
    name: "Mignonettes Côte d'Or lait",
    description: "Mignonettes Côte d'Or lait - 120 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/12374.jpg",
    price: 28.89,
    category: "chocolate",
  },
  {
    id: "accompaniment-2",
    name: "Carrés chocolat Monbana",
    description: "Carrés de chocolat Monbana 4g - 200 unités", // Correction: ajout de la guillemet fermante
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/1840.jpg",
    price: 39.9,
    category: "chocolate",
  },
  {
    id: "accompaniment-2.1",
    name: "Mini chocolat noir 70% Lindt",
    description: "Mini chocolat noir 70% LINDT - 200 unités", // Correction: ajout de la guillemet fermante
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/14609.jpg",
    price: 61.9,
    category: "chocolate",
  },
  {
    id: "accompaniment-2.4",
    name: "Amandes cacaotées Monbana",
    description: "Amandes cacaotées Monbana - 200 unités", // Correction: ajout de la guillemet fermante
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/1839.jpg",
    price: 32.9,
    category: "chocolate",
  },
  {
    id: "accompaniment-2.9",
    name: "Mini chocolat noir 75% Alain Ducasse",
    description: "Mini chocolat noir 75% Alain Ducasse - 200 unités",
    image: "https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67f8ea5769a25cc64461505b_17345.png",
    price: 149.5,
    category: "chocolate",
  },
  {
    id: "accompaniment-2.10",
    name: "Mini crêpes dentelles chocolat Angelina",
    description: "Mini crêpes dentelles enrobées de chocolat Angelina - Lot de 250 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/17136.jpg",
    price: 87.49,
    category: "chocolate",
  },
  {
    id: "accompaniment-3",
    name: "Petites galettes Bonne Maman",
    description: "Petites galettes nature Bonne maman - 200 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/xlarge/10240.jpg",
    price: 37.5,
    category: "biscuit",
  },
  {
    id: "accompaniment-4",
    name: "Spéculoos Puro",
    description: "Mini spéculoos PURO - 200 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/1355.jpg",
    price: 22.69,
    category: "biscuit",
  },
  {
    id: "accompaniment-4.2",
    name: "Madelainettes St Michel",
    description: "Mini madelaines St Michel - 350 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/11664.jpg",
    price: 59.9,
    category: "biscuit",
  },
  {
    id: "accompaniment-4.3",
    name: "Petites galettes pépites de chocolat St Michel",
    description: "Mini galettes pépites de chocolat - 200 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/10236.jpg",
    price: 29.09,
    category: "biscuit",
  },
  {
    id: "accompaniment-4.8",
    name: "Mini Speculoos LOTUS",
    description: "Mini Speculoos LOTUS - 400 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/xlarge/17212_1.jpg",
    price: 37.69,
    category: "biscuit",
  },
  {
    id: "accompaniment-4.9",
    name: "Mini financier Bonne Maman",
    description: "Mini financier Bonne Maman - 200 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/17706.jpg",
    price: 44.5,
    category: "biscuit",
  },
  {
    id: "accompaniment-6",
    name: "Bûchettes de sucre roux Terre de café",
    description: "Bûchettes de sucre roux Terre de café - 1000 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/17167.jpg",
    price: 52.69,
    category: "sucre",
  },
  {
    id: "accompaniment-6.14",
    name: "Morceaux de sucre de canne Perruche",
    description: "Morceaux de sucre de canne Perruche - 5000 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/2225.jpg",
    price: 67.89,
    category: "sucre",
  },
  {
    id: "accompaniment-6.8",
    name: "Bûchettes de sucre brun Puro",
    description: "Bûchettes de sucre brun Fairtrade Puro - 1000 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/13440.jpg",
    price: 38.99,
    category: "sucre",
  },
  {
    id: "accompaniment-6.2",
    name: "Édulcorant stévia Pure viva",
    description: "Édulcorant Stévia Pure viva- 40 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/17608.jpg",
    price: 5.19,
    category: "sucre",
  },
  {
    id: "accompaniment-6.9",
    name: "Coupelles de lait concentré Puro",
    description: "Coupelles de lait concentré Puro 7ml - 200 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/1966.jpg",
    price: 28.35,
    category: "sucre",
  },
  {
    id: "accompaniment-6.10",
    name: "Coupelles de lait concentré MIKO",
    description: "Coupelles de lait concentré 7ml MIKO - 240 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/1967.jpg",
    price: 31.19,
    category: "sucre",
  },
]

// Modifier les descriptions des accessoires pour standardiser le format et corriger la taille du gobelet

export const accessories: Accessory[] = [
  {
    id: "accessory-3",
    name: "Agitateur en bois",
    description: "Lot de 100 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/16296.jpg",
    price: 21.39,
  },
  {
    id: "accessory-4",
    name: "Gobelet bio-compostable",
    description: "Lot de 50 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/16293.jpg",
    price: 5.49,
  },
  {
    id: "accessory-4.4",
    name: "Gobelet en carton blanc 20-25cl",
    description: "Lot de 50 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/17173.jpg",
    price: 6.09,
  },
  {
    id: "accessory-5",
    name: "Agitateurs en bois",
    description: "Lot de 1000 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/large/10892.jpg",
    price: 13.59,
  },
  {
    id: "accessory-5.1",
    name: "Gobelet en carton Juste à temps 18-20cl",
    description: "Lot de 100 unités",
    image: "https://www.justeatemps.com/statique/images/front//img/Products/xlarge/12144.jpg",
    price: 9.19,
  },
]
