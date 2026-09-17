import type { PrismaClient } from "@prisma/client";

type CategoryName =
  | "Hair Salon"
  | "Beauty Salon"
  | "Wellness & Spa"
  | "Fitness"
  | "Medical Clinic"
  | "Photography"
  | "Education"
  | "Other";

type ServiceTemplate = {
  name: string;
  description: string;
  duration: number;
  price: number;
};

type BusinessTemplate = {
  name: string;
  category: CategoryName;
  description: string;
  city: string;
  address: string;
  imageFolder?: string;
  imageCount?: number;
  otherImages?: string[];
  serviceCount?: number;
  acceptsCards?: boolean;
};

const cities = [
  "Beograd",
  "Beograd",
  "Beograd",
  "Novi Sad",
  "Beograd",
  "Niš",
  "Kragujevac",
  "Novi Sad",
  "Beograd",
  "Subotica",
  "Pančevo",
  "Kraljevo",
];

const addresses = [
  "Knez Mihailova 24",
  "Bulevar kralja Aleksandra 118",
  "Takovska 31",
  "Dunavska 16",
  "Njegoševa 42",
  "Bulevar oslobođenja 87",
  "Kralja Petra I 35",
  "Zmaj Jovina 21",
  "Resavska 54",
  "Cara Dušana 39",
  "Maksima Gorkog 28",
  "Karađorđeva 44",
];

const hairServices: ServiceTemplate[] = [
  {
    name: "Women's Haircut",
    description: "Professional haircut tailored to your preferred style.",
    duration: 60,
    price: 2400,
  },
  {
    name: "Men's Haircut",
    description: "Classic or modern haircut with professional finishing.",
    duration: 40,
    price: 1800,
  },
  {
    name: "Blow Dry",
    description: "Hair wash and professional blow dry styling.",
    duration: 45,
    price: 1600,
  },
  {
    name: "Hair Coloring",
    description: "Professional full hair coloring service.",
    duration: 120,
    price: 5200,
  },
  {
    name: "Root Coloring",
    description: "Professional root color refresh.",
    duration: 90,
    price: 3800,
  },
  {
    name: "Highlights",
    description: "Professional highlighting treatment.",
    duration: 150,
    price: 6500,
  },
  {
    name: "Balayage",
    description: "Natural-looking balayage coloring technique.",
    duration: 180,
    price: 8500,
  },
  {
    name: "Hair Treatment",
    description: "Nourishing treatment for dry or damaged hair.",
    duration: 45,
    price: 2500,
  },
  {
    name: "Hair Styling",
    description: "Professional styling for everyday or special occasions.",
    duration: 60,
    price: 2200,
  },
  {
    name: "Formal Hairstyle",
    description: "Elegant hairstyle for weddings and special occasions.",
    duration: 75,
    price: 3500,
  },
  {
    name: "Hair Wash",
    description: "Professional hair washing and basic care.",
    duration: 20,
    price: 800,
  },
  {
    name: "Toner",
    description: "Hair toner treatment for refreshed color.",
    duration: 45,
    price: 2200,
  },
  {
    name: "Keratin Treatment",
    description: "Smoothing keratin hair treatment.",
    duration: 150,
    price: 7500,
  },
  {
    name: "Scalp Treatment",
    description: "Professional scalp care treatment.",
    duration: 45,
    price: 2600,
  },
  {
    name: "Hair Consultation",
    description: "Consultation for styling, color and hair care.",
    duration: 30,
    price: 1000,
  },
  {
    name: "Beard Trim",
    description: "Professional beard shaping and trimming.",
    duration: 30,
    price: 1200,
  },
];

const beautyServices: ServiceTemplate[] = [
  {
    name: "Facial Treatment",
    description: "Professional facial treatment adapted to your skin type.",
    duration: 60,
    price: 3500,
  },
  {
    name: "Deep Cleansing Facial",
    description: "Deep cleansing and skin care treatment.",
    duration: 75,
    price: 4200,
  },
  {
    name: "Hydrating Facial",
    description: "Hydrating treatment for refreshed and nourished skin.",
    duration: 60,
    price: 3800,
  },
  {
    name: "Classic Manicure",
    description: "Professional nail and hand care.",
    duration: 45,
    price: 1800,
  },
  {
    name: "Gel Manicure",
    description: "Long-lasting gel manicure.",
    duration: 75,
    price: 2600,
  },
  {
    name: "Pedicure",
    description: "Professional foot and nail care.",
    duration: 60,
    price: 2500,
  },
  {
    name: "Professional Makeup",
    description: "Professional makeup for special occasions.",
    duration: 60,
    price: 4000,
  },
  {
    name: "Day Makeup",
    description: "Natural makeup suitable for daytime occasions.",
    duration: 45,
    price: 3000,
  },
  {
    name: "Brow Styling",
    description: "Professional brow shaping and styling.",
    duration: 30,
    price: 1500,
  },
  {
    name: "Brow Tinting",
    description: "Professional eyebrow tinting treatment.",
    duration: 30,
    price: 1400,
  },
  {
    name: "Lash Lift",
    description: "Lash lifting and shaping treatment.",
    duration: 60,
    price: 3200,
  },
  {
    name: "Lash Tint",
    description: "Professional eyelash tinting.",
    duration: 30,
    price: 1500,
  },
  {
    name: "Skin Consultation",
    description: "Professional consultation and skin care recommendation.",
    duration: 30,
    price: 1200,
  },
  {
    name: "Face Massage",
    description: "Relaxing facial massage treatment.",
    duration: 30,
    price: 1800,
  },
  {
    name: "Express Facial",
    description: "Quick refreshing facial treatment.",
    duration: 30,
    price: 2200,
  },
];

const wellnessServices: ServiceTemplate[] = [
  {
    name: "Relaxing Massage",
    description: "Relaxing full-body massage.",
    duration: 60,
    price: 3800,
  },
  {
    name: "Deep Tissue Massage",
    description: "Massage focused on muscle tension and deeper tissue.",
    duration: 60,
    price: 4300,
  },
  {
    name: "Sports Massage",
    description: "Massage designed for active clients and muscle recovery.",
    duration: 60,
    price: 4200,
  },
  {
    name: "Back Massage",
    description: "Focused massage for the back and shoulders.",
    duration: 30,
    price: 2500,
  },
  {
    name: "Aromatherapy Massage",
    description: "Relaxing massage using aromatic oils.",
    duration: 75,
    price: 4800,
  },
  {
    name: "Hot Stone Massage",
    description: "Relaxing massage treatment with heated stones.",
    duration: 75,
    price: 5200,
  },
  {
    name: "Couples Massage",
    description: "Relaxing massage session for two.",
    duration: 60,
    price: 7500,
  },
  {
    name: "Head Massage",
    description: "Relaxing head, neck and scalp massage.",
    duration: 30,
    price: 2200,
  },
  {
    name: "Foot Massage",
    description: "Relaxing foot massage treatment.",
    duration: 30,
    price: 2200,
  },
  {
    name: "Body Scrub",
    description: "Professional exfoliating body treatment.",
    duration: 45,
    price: 3200,
  },
  {
    name: "Spa Ritual",
    description: "Complete relaxing wellness treatment.",
    duration: 120,
    price: 7200,
  },
  {
    name: "Wellness Consultation",
    description: "Personal wellness consultation.",
    duration: 30,
    price: 1500,
  },
  {
    name: "Sauna Session",
    description: "Private sauna relaxation session.",
    duration: 45,
    price: 2500,
  },
];

const fitnessServices: ServiceTemplate[] = [
  {
    name: "Personal Training",
    description: "One-on-one personal training session.",
    duration: 60,
    price: 2800,
  },
  {
    name: "Fitness Assessment",
    description: "Initial fitness assessment and consultation.",
    duration: 45,
    price: 1800,
  },
  {
    name: "Strength Training",
    description: "Individual strength-focused training session.",
    duration: 60,
    price: 2800,
  },
  {
    name: "Functional Training",
    description: "Functional full-body individual training.",
    duration: 60,
    price: 2600,
  },
  {
    name: "Pilates Session",
    description: "Individual Pilates training session.",
    duration: 60,
    price: 2600,
  },
  {
    name: "Yoga Session",
    description: "Private yoga session adapted to your level.",
    duration: 60,
    price: 2400,
  },
  {
    name: "Mobility Session",
    description: "Individual mobility and flexibility training.",
    duration: 45,
    price: 2200,
  },
  {
    name: "Core Training",
    description: "Training session focused on core strength.",
    duration: 45,
    price: 2200,
  },
  {
    name: "Cardio Training",
    description: "Individual cardiovascular fitness session.",
    duration: 45,
    price: 2300,
  },
  {
    name: "Posture Training",
    description: "Individual exercises focused on posture and mobility.",
    duration: 60,
    price: 2500,
  },
  {
    name: "Stretching Session",
    description: "Guided flexibility and stretching session.",
    duration: 45,
    price: 2000,
  },
  {
    name: "Beginner Training",
    description: "Introductory individual training session.",
    duration: 60,
    price: 2400,
  },
  {
    name: "Training Plan Consultation",
    description: "Consultation and personalized training plan.",
    duration: 45,
    price: 2000,
  },
  {
    name: "Body Composition Assessment",
    description: "Body composition assessment and consultation.",
    duration: 30,
    price: 1500,
  },
  {
    name: "Recovery Session",
    description: "Light recovery and mobility workout.",
    duration: 45,
    price: 2200,
  },
];

const medicalServices: ServiceTemplate[] = [
  {
    name: "Initial Consultation",
    description: "Initial medical consultation and assessment.",
    duration: 30,
    price: 3500,
  },
  {
    name: "Specialist Consultation",
    description: "Consultation with a medical specialist.",
    duration: 30,
    price: 4500,
  },
  {
    name: "Follow-up Consultation",
    description: "Follow-up consultation after an initial appointment.",
    duration: 20,
    price: 2800,
  },
  {
    name: "General Checkup",
    description: "General health examination.",
    duration: 45,
    price: 4500,
  },
  {
    name: "Preventive Examination",
    description: "Preventive medical examination and consultation.",
    duration: 45,
    price: 4800,
  },
  {
    name: "Diagnostic Consultation",
    description: "Consultation regarding diagnostic results.",
    duration: 30,
    price: 3500,
  },
  {
    name: "Physical Assessment",
    description: "Professional physical assessment.",
    duration: 45,
    price: 4000,
  },
  {
    name: "Therapy Consultation",
    description: "Consultation and therapy planning.",
    duration: 30,
    price: 3800,
  },
  {
    name: "Control Examination",
    description: "Medical control examination.",
    duration: 30,
    price: 3000,
  },
  {
    name: "Health Consultation",
    description: "Individual consultation about general health concerns.",
    duration: 30,
    price: 3200,
  },
  {
    name: "Extended Examination",
    description: "Extended medical examination and consultation.",
    duration: 60,
    price: 6000,
  },
  {
    name: "Medical Certificate Examination",
    description: "Medical examination for certificate purposes.",
    duration: 30,
    price: 3500,
  },
  {
    name: "Second Opinion Consultation",
    description: "Medical consultation for a professional second opinion.",
    duration: 45,
    price: 5200,
  },
];

const photographyServices: ServiceTemplate[] = [
  {
    name: "Portrait Session",
    description: "Professional individual portrait photography session.",
    duration: 60,
    price: 5500,
  },
  {
    name: "Couple Session",
    description: "Professional photography session for couples.",
    duration: 75,
    price: 7000,
  },
  {
    name: "Family Session",
    description: "Professional family photography session.",
    duration: 90,
    price: 8500,
  },
  {
    name: "Business Portrait",
    description: "Professional portrait suitable for business use.",
    duration: 45,
    price: 5000,
  },
  {
    name: "Product Photography",
    description: "Professional photography for products and brands.",
    duration: 120,
    price: 10000,
  },
  {
    name: "Event Photography",
    description: "Professional photography for events.",
    duration: 180,
    price: 15000,
  },
  {
    name: "Studio Session",
    description: "Professional photo session in a studio environment.",
    duration: 60,
    price: 6000,
  },
  {
    name: "Outdoor Session",
    description: "Professional outdoor photography session.",
    duration: 90,
    price: 7500,
  },
  {
    name: "Graduation Session",
    description: "Professional graduation photography session.",
    duration: 60,
    price: 6000,
  },
  {
    name: "Content Session",
    description: "Photography session for social media and digital content.",
    duration: 90,
    price: 8000,
  },
];

const educationServices: ServiceTemplate[] = [
  {
    name: "Individual Lesson",
    description: "One-on-one lesson adapted to the student's level.",
    duration: 60,
    price: 2000,
  },
  {
    name: "English Lesson",
    description: "Individual English language lesson.",
    duration: 60,
    price: 2200,
  },
  {
    name: "Conversation Lesson",
    description: "Language lesson focused on conversation skills.",
    duration: 60,
    price: 2100,
  },
  {
    name: "Exam Preparation",
    description: "Individual preparation for an upcoming exam.",
    duration: 90,
    price: 3000,
  },
  {
    name: "Beginner Course Session",
    description: "Individual introductory learning session.",
    duration: 60,
    price: 2000,
  },
  {
    name: "Advanced Lesson",
    description: "Individual lesson for advanced students.",
    duration: 60,
    price: 2400,
  },
  {
    name: "Tutoring Session",
    description: "Individual tutoring and learning support.",
    duration: 60,
    price: 2200,
  },
  {
    name: "Learning Consultation",
    description: "Consultation and personalized learning plan.",
    duration: 45,
    price: 1800,
  },
  {
    name: "Intensive Lesson",
    description: "Extended individual lesson.",
    duration: 90,
    price: 3000,
  },
  {
    name: "Practice Session",
    description: "Guided practice session with instructor feedback.",
    duration: 60,
    price: 2000,
  },
];

const carServices: ServiceTemplate[] = [
  {
    name: "Interior Detailing",
    description: "Detailed cleaning and care of the vehicle interior.",
    duration: 180,
    price: 8000,
  },
  {
    name: "Exterior Detailing",
    description: "Detailed exterior vehicle cleaning and protection.",
    duration: 180,
    price: 9000,
  },
  {
    name: "Full Detailing",
    description: "Complete interior and exterior detailing package.",
    duration: 300,
    price: 15000,
  },
  {
    name: "Polishing",
    description: "Professional vehicle paint polishing.",
    duration: 240,
    price: 12000,
  },
  {
    name: "Deep Interior Cleaning",
    description: "Deep cleaning of seats, carpets and interior surfaces.",
    duration: 240,
    price: 10000,
  },
  {
    name: "Protective Treatment",
    description: "Protective treatment for vehicle exterior surfaces.",
    duration: 120,
    price: 7000,
  },
];

const cleaningServices: ServiceTemplate[] = [
  {
    name: "Apartment Cleaning",
    description: "General apartment cleaning service.",
    duration: 180,
    price: 4500,
  },
  {
    name: "Deep Cleaning",
    description: "Detailed deep cleaning service.",
    duration: 300,
    price: 8000,
  },
  {
    name: "Office Cleaning",
    description: "Professional office cleaning.",
    duration: 180,
    price: 6000,
  },
  {
    name: "Move-out Cleaning",
    description: "Complete cleaning before or after moving.",
    duration: 300,
    price: 9500,
  },
  {
    name: "Window Cleaning",
    description: "Professional window cleaning.",
    duration: 120,
    price: 4000,
  },
];

const flowerServices: ServiceTemplate[] = [
  {
    name: "Custom Bouquet",
    description: "Personalized bouquet prepared for your occasion.",
    duration: 30,
    price: 3500,
  },
  {
    name: "Wedding Flower Consultation",
    description: "Consultation for wedding flowers and decorations.",
    duration: 60,
    price: 2500,
  },
  {
    name: "Event Decoration Consultation",
    description: "Consultation for floral event decoration.",
    duration: 60,
    price: 2500,
  },
  {
    name: "Flower Arrangement",
    description: "Custom floral arrangement.",
    duration: 45,
    price: 4500,
  },
  {
    name: "Gift Arrangement",
    description: "Custom flowers prepared as a gift arrangement.",
    duration: 30,
    price: 4000,
  },
];

const petServices: ServiceTemplate[] = [
  {
    name: "Dog Grooming",
    description: "Complete grooming appointment for dogs.",
    duration: 90,
    price: 3500,
  },
  {
    name: "Bath & Dry",
    description: "Bathing and professional drying.",
    duration: 60,
    price: 2500,
  },
  {
    name: "Nail Trimming",
    description: "Professional pet nail trimming.",
    duration: 20,
    price: 1000,
  },
  {
    name: "Coat Care",
    description: "Brushing and coat maintenance treatment.",
    duration: 45,
    price: 2200,
  },
  {
    name: "Full Grooming",
    description: "Complete grooming and coat care service.",
    duration: 120,
    price: 4500,
  },
];

const tattooServices: ServiceTemplate[] = [
  {
    name: "Tattoo Consultation",
    description: "Consultation about tattoo design, size and placement.",
    duration: 30,
    price: 1000,
  },
  {
    name: "Small Tattoo",
    description: "Tattoo appointment for a small design.",
    duration: 60,
    price: 5000,
  },
  {
    name: "Medium Tattoo",
    description: "Tattoo appointment for a medium-sized design.",
    duration: 120,
    price: 9000,
  },
  {
    name: "Large Tattoo Session",
    description: "Extended tattoo session for larger projects.",
    duration: 240,
    price: 16000,
  },
  {
    name: "Tattoo Touch-up",
    description: "Touch-up appointment for an existing tattoo.",
    duration: 60,
    price: 4000,
  },
];

const servicePools: Record<string, ServiceTemplate[]> = {
  "Hair Salon": hairServices,
  "Beauty Salon": beautyServices,
  "Wellness & Spa": wellnessServices,
  Fitness: fitnessServices,
  "Medical Clinic": medicalServices,
  Photography: photographyServices,
  Education: educationServices,
  car: carServices,
  cleaning: cleaningServices,
  flower: flowerServices,
  pet: petServices,
  tattoo: tattooServices,
};

function makeBusinesses(
  category: CategoryName,
  names: string[],
  description: string,
  imageFolder: string,
  imageCount: number,
  featuredServiceCount?: number,
): BusinessTemplate[] {
  return names.map((name, index) => ({
    name,
    category,
    description,
    city: cities[index % cities.length],
    address: addresses[index % addresses.length],
    imageFolder,
    imageCount,
    acceptsCards: index % 3 !== 2,
    serviceCount:
      index === 0 && featuredServiceCount
        ? featuredServiceCount
        : 5 + (index % 3),
  }));
}

const regularBusinesses: BusinessTemplate[] = [
  ...makeBusinesses(
    "Hair Salon",
    [
      "Luna Hair Studio",
      "Studio Elegance",
      "Velvet Hair",
      "Atelier Hair",
      "Nova Hair Studio",
      "Urban Hair",
      "Muse Hair",
      "Halo Hair Studio",
      "Bloom Hair",
      "The Hair Room",
    ],
    "Modern hair studio offering professional cuts, styling, coloring and hair care treatments.",
    "hair",
    18,
    16,
  ),
  ...makeBusinesses(
    "Beauty Salon",
    [
      "Bloom Beauty Studio",
      "Velvet Beauty",
      "Luna Beauty",
      "Aura Beauty Studio",
      "Maison Beauty",
      "Glow Studio",
      "Pure Beauty",
      "Blush Beauty",
      "Muse Beauty Studio",
      "Nude Beauty",
      "Olive Beauty Studio",
    ],
    "Beauty studio offering a variety of professional beauty, skin care, nail and makeup services.",
    "beauty",
    19,
    15,
  ),
  ...makeBusinesses(
    "Wellness & Spa",
    [
      "Still Wellness",
      "Quiet Space Spa",
      "Balance Wellness",
      "Serenity Spa",
      "Olive Wellness",
      "Aura Spa",
      "Calm Studio",
      "Pure Wellness",
      "Lotus Spa",
      "Harmony Wellness",
      "Soma Spa",
    ],
    "Relaxing wellness space offering massages, body treatments and personalized relaxation services.",
    "wellness",
    19,
    13,
  ),
  ...makeBusinesses(
    "Fitness",
    [
      "Motion Fitness",
      "Balance Pilates",
      "Core Studio",
      "Forma Fitness",
      "Move Studio",
      "Pulse Fitness",
      "Elevate Training",
      "Active Studio",
      "Momentum Fitness",
      "Flow Training Studio",
    ],
    "Modern fitness studio offering personal training, guided exercise and individual fitness programs.",
    "fitness",
    17,
    15,
  ),
  ...makeBusinesses(
    "Medical Clinic",
    [
      "Nova Medical Center",
      "Vita Clinic",
      "Medica Plus",
      "Prime Medical",
      "Care Clinic",
      "Atria Medical",
      "Viva Clinic",
      "Medispace",
      "Health Point",
      "Central Medical",
      "Nova Vita Clinic",
    ],
    "Private medical practice offering professional examinations, consultations and personalized patient care.",
    "medical",
    19,
    13,
  ),
  ...makeBusinesses(
    "Photography",
    [
      "Daylight Studio",
      "Golden Frame Studio",
      "Lumen Photography",
      "White Room Studio",
      "Northlight Studio",
      "Frame House",
      "Focus Studio",
      "Moment Photography",
    ],
    "Professional photography studio offering portraits, personal sessions, business photography and special occasion photography.",
    "photography",
    14,
    10,
  ),
  ...makeBusinesses(
    "Education",
    [
      "Bright Learning Studio",
      "Focus Academy",
      "Nova Learning",
      "Level Up Education",
      "Open Book Studio",
      "Smart Point",
      "Knowledge Hub",
      "Progress Studio",
    ],
    "Learning studio offering individual lessons, tutoring, consultations and personalized education programs.",
    "education",
    11,
    10,
  ),
];

const otherBusinesses: BusinessTemplate[] = [
  {
    name: "Prime Auto Detail",
    category: "Other",
    description:
      "Professional vehicle detailing studio offering interior and exterior care.",
    city: "Beograd",
    address: "Vojvode Stepe 214",
    otherImages: [
      "car-1.jpg",
      "car-2.jpg",
      "car-4.jpg",
      "car-6.jpg",
    ],
    serviceCount: 6,
    acceptsCards: true,
  },
  {
    name: "Gloss Auto Care",
    category: "Other",
    description:
      "Vehicle care studio specializing in detailing, polishing and deep cleaning.",
    city: "Novi Sad",
    address: "Futoški put 42",
    otherImages: [
      "car-3.jpg",
      "car-5.jpg",
      "car-7.jpg",
    ],
    serviceCount: 5,
    acceptsCards: true,
  },
  {
    name: "Fresh Home",
    category: "Other",
    description:
      "Professional cleaning service for apartments, homes and offices.",
    city: "Beograd",
    address: "Cvijićeva 78",
    otherImages: [
      "cleaning-1.jpg",
      "cleaning-2.jpg",
      "cleaning-4.jpg",
    ],
    serviceCount: 5,
    acceptsCards: false,
  },
  {
    name: "Pure Space Cleaning",
    category: "Other",
    description:
      "Professional cleaning appointments for homes, offices and commercial spaces.",
    city: "Novi Sad",
    address: "Bulevar Evrope 35",
    otherImages: [
      "cleaning-3.jpg",
      "cleaning-5.jpg",
      "cleaning-6.jpg",
    ],
    serviceCount: 5,
    acceptsCards: true,
  },
  {
    name: "Bloom Flower Studio",
    category: "Other",
    description:
      "Flower studio creating custom bouquets and floral arrangements for special occasions.",
    city: "Beograd",
    address: "Kralja Milana 28",
    otherImages: [
      "flower-1.jpg",
      "flower-2.jpg",
      "flower-3.jpg",
      "flower-4.jpg",
    ],
    serviceCount: 5,
    acceptsCards: true,
  },
  {
    name: "Paws Grooming",
    category: "Other",
    description:
      "Friendly pet grooming studio offering professional grooming and coat care.",
    city: "Beograd",
    address: "Požeška 61",
    otherImages: [
      "pet-1.jpg",
      "pet-2.jpg",
      "pet-3.jpg",
    ],
    serviceCount: 5,
    acceptsCards: true,
  },
  {
    name: "Happy Paws Studio",
    category: "Other",
    description:
      "Pet care studio offering grooming, bathing and regular coat maintenance.",
    city: "Novi Sad",
    address: "Cara Dušana 82",
    otherImages: [
      "pet-1.jpg",
      "pet-3.jpg",
      "pet-4.jpg",
    ],
    serviceCount: 5,
    acceptsCards: false,
  },
  {
    name: "Ink House",
    category: "Other",
    description:
      "Professional tattoo studio offering custom tattoo design and individual sessions.",
    city: "Beograd",
    address: "Gospodar Jevremova 39",
    otherImages: [
      "tattoo-1.jpg",
      "tattoo-2.jpg",
      "tattoo-4.jpg",
    ],
    serviceCount: 5,
    acceptsCards: true,
  },
  {
    name: "Black Line Studio",
    category: "Other",
    description:
      "Modern tattoo studio focused on custom designs and individual consultations.",
    city: "Novi Sad",
    address: "Laze Telečkog 16",
    otherImages: [
      "tattoo-2.jpg",
      "tattoo-3.jpg",
      "tattoo-5.jpg",
    ],
    serviceCount: 5,
    acceptsCards: true,
  },
  {
    name: "Fine Line Tattoo",
    category: "Other",
    description:
      "Creative tattoo studio offering consultations and personalized tattoo sessions.",
    city: "Kragujevac",
    address: "Kralja Aleksandra I Karađorđevića 52",
    otherImages: [
      "tattoo-1.jpg",
      "tattoo-3.jpg",
      "tattoo-4.jpg",
      "tattoo-5.jpg",
    ],
    serviceCount: 5,
    acceptsCards: false,
  },
];

const businesses = [...regularBusinesses, ...otherBusinesses];

function imagePaths(folder: string, count: number, index: number) {
  const amount = index % 4 === 0 ? 4 : 3;

  return Array.from({ length: amount }, (_, imageIndex) => {
    const number = ((index * 2 + imageIndex) % count) + 1;

    return `/seed/businesses/${folder}/${folder}-${number}.jpg`;
  });
}

function getOtherServiceKey(business: BusinessTemplate) {
  const firstImage = business.otherImages?.[0] ?? "";

  if (firstImage.startsWith("car-")) return "car";
  if (firstImage.startsWith("cleaning-")) return "cleaning";
  if (firstImage.startsWith("flower-")) return "flower";
  if (firstImage.startsWith("pet-")) return "pet";

  return "tattoo";
}

function getWorkingHours(index: number) {
  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const saturdayOpen = index % 3 !== 2;
    const sundayOpen = index % 7 === 0;

    if (dayOfWeek === 0) {
      return {
        dayOfWeek,
        isOpen: sundayOpen,
        startTime: sundayOpen ? "10:00" : null,
        endTime: sundayOpen ? "15:00" : null,
        breakStart: null,
        breakEnd: null,
      };
    }

    if (dayOfWeek === 6) {
      return {
        dayOfWeek,
        isOpen: saturdayOpen,
        startTime: saturdayOpen ? "10:00" : null,
        endTime: saturdayOpen ? "16:00" : null,
        breakStart: null,
        breakEnd: null,
      };
    }

    return {
      dayOfWeek,
      isOpen: true,
      startTime: index % 2 === 0 ? "09:00" : "10:00",
      endTime: index % 2 === 0 ? "18:00" : "19:00",
      breakStart: index % 4 === 0 ? "13:00" : null,
      breakEnd: index % 4 === 0 ? "14:00" : null,
    };
  });
}

export async function seedDemoBusinesses(prisma: PrismaClient) {
  const owners = [];

  for (let index = 0; index < 16; index++) {
    const owner = await prisma.user.upsert({
      where: {
        email: `demo-owner-${index + 1}@appointify.test`,
      },
      update: {
        role: "OWNER",
        name: `Demo Owner ${index + 1}`,
        phone: `+38164${String(2000000 + index).padStart(7, "0")}`,
        isActive: true,
      },
      create: {
        id: `seed-demo-owner-${index + 1}`,
        email: `demo-owner-${index + 1}@appointify.test`,
        name: `Demo Owner ${index + 1}`,
        phone: `+38164${String(2000000 + index).padStart(7, "0")}`,
        role: "OWNER",
        isActive: true,
        isEmailVerified: true,
      },
    });

    owners.push(owner);
  }

  for (const [index, item] of businesses.entries()) {
    const category = await prisma.category.findUniqueOrThrow({
      where: {
        name: item.category,
      },
    });

    const city = await prisma.city.findUniqueOrThrow({
      where: {
        name: item.city,
      },
    });

    const businessId = `seed-demo-business-${index + 1}`;
    const publicId = `dmo${String(index + 1).padStart(5, "0")}`;
    const owner = owners[index % owners.length];

    const business = await prisma.business.upsert({
      where: {
        id: businessId,
      },
      update: {
        name: item.name,
        description: item.description,
        address: item.address,
        cityId: city.id,
        categoryId: category.id,
        ownerId: owner.id,
        phone: `+3816${index % 3 + 3}${String(1000000 + index).padStart(7, "0")}`,
        email: `business${index + 1}@appointify.test`,
        acceptsCards: item.acceptsCards ?? true,
        isActive: true,
        isSuspended: false,
      },
      create: {
        id: businessId,
        publicId,
        name: item.name,
        description: item.description,
        address: item.address,
        cityId: city.id,
        categoryId: category.id,
        ownerId: owner.id,
        phone: `+3816${index % 3 + 3}${String(1000000 + index).padStart(7, "0")}`,
        email: `business${index + 1}@appointify.test`,
        acceptsCards: item.acceptsCards ?? true,
        isActive: true,
        isSuspended: false,
      },
    });

    const images = item.otherImages
      ? item.otherImages.map(
          (image) => `/seed/businesses/other/${image}`,
        )
      : imagePaths(
          item.imageFolder!,
          item.imageCount!,
          index,
        );

    await prisma.businessImage.deleteMany({
      where: {
        businessId: business.id,
      },
    });

    await prisma.businessImage.createMany({
      data: images.map((imageUrl) => ({
        businessId: business.id,
        imageUrl,
      })),
    });

    const serviceKey =
      item.category === "Other"
        ? getOtherServiceKey(item)
        : item.category;

    const pool = servicePools[serviceKey];
    const requestedCount = Math.min(
      item.serviceCount ?? 6,
      pool.length,
    );

    for (let serviceIndex = 0; serviceIndex < requestedCount; serviceIndex++) {
      const source =
        pool[(serviceIndex + index) % pool.length];

      await prisma.service.upsert({
        where: {
          id: `${business.id}-service-${serviceIndex + 1}`,
        },
        update: {
          businessId: business.id,
          name: source.name,
          description: source.description,
          duration: source.duration,
          price: source.price,
          isActive: true,
        },
        create: {
          id: `${business.id}-service-${serviceIndex + 1}`,
          businessId: business.id,
          name: source.name,
          description: source.description,
          duration: source.duration,
          price: source.price,
          isActive: true,
        },
      });
    }

    const hours = getWorkingHours(index);

    for (const hour of hours) {
      await prisma.workingHour.upsert({
        where: {
          businessId_dayOfWeek: {
            businessId: business.id,
            dayOfWeek: hour.dayOfWeek,
          },
        },
        update: {
          isOpen: hour.isOpen,
          startTime: hour.startTime,
          endTime: hour.endTime,
          breakStart: hour.breakStart,
          breakEnd: hour.breakEnd,
        },
        create: {
          businessId: business.id,
          dayOfWeek: hour.dayOfWeek,
          isOpen: hour.isOpen,
          startTime: hour.startTime,
          endTime: hour.endTime,
          breakStart: hour.breakStart,
          breakEnd: hour.breakEnd,
        },
      });
    }
  }

  return businesses.length;
}