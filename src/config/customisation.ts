/* ── Outfit Categories ────────────────────────────────────────────── */
export const outfitCategories = [
  'Bridal Lehenga',
  'Reception',
  'Engagement',
  'Nikah',
  'Walima',
  'Mehendi',
  'Haldi',
  'Sangeet',
  'Saree',
  'Suit',
  'Sharara',
  'Gharara',
  'Anarkali',
  'Indo Western',
  'Custom Design',
] as const;

/* ── Occasions ────────────────────────────────────────────────────── */
export const occasionOptions = [
  'Wedding',
  'Reception',
  'Engagement',
  'Nikah',
  'Walima',
  'Mehendi',
  'Haldi',
  'Sangeet',
  'Cocktail',
  'Party',
  'Festival',
  'Photoshoot',
  'Other',
] as const;

/* ── Budget Ranges ────────────────────────────────────────────────── */
export const budgetRanges = [
  'Below ₹25K',
  '₹25K–50K',
  '₹50K–1L',
  '₹1L–2L',
  'Above ₹2L',
  'Custom',
] as const;

/* ── Design Styles ────────────────────────────────────────────────── */
export const designStyles = [
  'Royal',
  'Traditional',
  'Mughal',
  'Classic',
  'Contemporary',
  'Minimal',
  'Heavy Bridal',
  'Lightweight',
  'Vintage',
  'Pastel',
  'Statement',
  'Custom',
] as const;

/* ── Fabrics ──────────────────────────────────────────────────────── */
export const fabricOptions = [
  'Raw Silk',
  'Organza',
  'Tissue',
  'Velvet',
  'Net',
  'Georgette',
  'Satin',
  'Silk',
  'Crepe',
  'Shimmer',
  'Jimmy Choo Fabric',
  'Others',
] as const;

/* ── Colour Swatches ──────────────────────────────────────────────── */
export type ColorSwatch = {
  name: string;
  hex: string;
};

export const colorSwatches: ColorSwatch[] = [
  { name: 'Ivory', hex: '#f8f4e8' },
  { name: 'Gold', hex: '#c8933a' },
  { name: 'Deep Red', hex: '#8b1a1a' },
  { name: 'Maroon', hex: '#5c1a1a' },
  { name: 'Emerald', hex: '#0b6e4f' },
  { name: 'Navy', hex: '#0e1729' },
  { name: 'Blush', hex: '#e8c4c4' },
  { name: 'Champagne', hex: '#e6d4a8' },
  { name: 'Rose', hex: '#d4365a' },
  { name: 'Royal Blue', hex: '#1a3a8a' },
  { name: 'Purple', hex: '#5c2a8a' },
  { name: 'Teal', hex: '#0e7a7a' },
  { name: 'Coral', hex: '#e8835a' },
  { name: 'Mint', hex: '#a8e0c4' },
  { name: 'Lavender', hex: '#c4b8e0' },
  { name: 'Black', hex: '#1c1c19' },
];

/* ── Embroidery Options ───────────────────────────────────────────── */
export const embroideryOptions = [
  'Zardozi',
  'Dabka',
  'Cutdana',
  'Pearl',
  'Thread Work',
  'Resham',
  'Mirror',
  'Aari',
  'French Knot',
  'Pitta',
  'Gota Patti',
  'Sequins',
  'No Preference',
] as const;

/* ── Customisation Options ────────────────────────────────────────── */
export const customisationOptions = [
  'Colour Change',
  'Fabric Change',
  'Blouse',
  'Sleeves',
  'Neckline',
  'Double Dupatta',
  'Veil',
  'Trail',
  'Potli',
  'Heavy Embroidery',
  'Light Embroidery',
  'Other Requests',
] as const;

/* ── Consultation Types ────────────────────────────────────────────── */
export type ConsultationTypeOption = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

export const consultationTypes: ConsultationTypeOption[] = [
  {
    value: 'showroom_visit',
    label: 'Showroom Visit',
    description: 'Visit our Chandni Chowk atelier for an in-person consultation with our couture specialists.',
    icon: 'Store',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp Consultation',
    description: 'A convenient consultation via WhatsApp — share references and discuss your vision instantly.',
    icon: 'MessageCircle',
  },
  {
    value: 'video',
    label: 'Video Consultation',
    description: 'A face-to-face video call with our designer to walk through fabrics, colours, and embroidery.',
    icon: 'Video',
  },
  {
    value: 'phone',
    label: 'Phone Consultation',
    description: 'A dedicated phone call with our couture team to discuss your requirements in detail.',
    icon: 'Phone',
  },
  {
    value: 'premium_bridal',
    label: 'Premium Bridal Consultation',
    description: 'An exclusive 2-hour private session with our master designer, including fabric sampling and sketch review.',
    icon: 'Crown',
  },
];

/* ── Measurement Options ──────────────────────────────────────────── */
export type MeasurementOption = {
  value: string;
  label: string;
  description: string;
  details: string;
  icon: string;
};

export const measurementOptions: MeasurementOption[] = [
  {
    value: 'showroom',
    label: 'Showroom Measurement',
    description: 'Visit our atelier where our master tailors will take precise measurements in a private setting.',
    details: 'Our experienced in-house tailors will guide you through every measurement with care. We recommend booking a dedicated appointment so we can provide our undivided attention. The session typically takes 20–30 minutes.',
    icon: 'Store',
  },
  {
    value: 'video_call',
    label: 'Video Call Measurement',
    description: 'A guided video consultation where our specialist walks you through each measurement step by step.',
    details: 'Using WhatsApp or Zoom, our specialist will guide you or a helper through taking each measurement accurately. You will need a flexible measuring tape and someone to assist. The session takes approximately 30–40 minutes.',
    icon: 'Video',
  },
  {
    value: 'tailor',
    label: 'Tailor Measurement',
    description: 'Visit your local trusted tailor with our measurement guide, and share the details with us.',
    details: 'We will provide a detailed measurement form for your local tailor to fill out. Once complete, simply share the form with us via WhatsApp or email. This is ideal for clients who have an established relationship with a local tailor.',
    icon: 'Scissors',
  },
  {
    value: 'upload_existing',
    label: 'Upload Existing Measurements',
    description: 'Share measurements from a previous fitting or a recent tailor visit.',
    details: 'If you have had measurements taken recently (within the last 6 months), you can share them directly with us. We will review and confirm whether any updates are needed before beginning your couture piece.',
    icon: 'Upload',
  },
  {
    value: 'measure_at_home',
    label: 'Measure at Home',
    description: 'Follow our detailed self-measurement guide with illustrated instructions.',
    details: 'We provide a comprehensive illustrated guide with step-by-step instructions for self-measurement. While we recommend professional measurement for bridal couture, this option works well for simpler silhouettes. A friend or family member should assist for accuracy.',
    icon: 'Home',
  },
];

/* ── Time Slots ────────────────────────────────────────────────────── */
export const timeSlots = [
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
];

/* ── Business Hours ────────────────────────────────────────────────── */
export const businessHours = {
  open: '11:00',
  close: '20:00',
  days: 'Monday — Sunday',
  display: '11:00 AM — 8:00 PM',
};

/* ── Metro & Parking Info ──────────────────────────────────────────── */
export const atelierAccessInfo = [
  {
    icon: 'Train',
    title: 'Nearest Metro',
    text: 'Chandni Chowk Metro Station (Yellow Line) — 5 minute walk to the atelier.',
  },
  {
    icon: 'Car',
    title: 'Parking',
    text: 'Paid parking available at Parade Ground parking lot, approximately 300m from the atelier.',
  },
  {
    icon: 'Navigation',
    title: 'Landmark',
    text: 'Located in Katra Nawab, Chandni Chowk — opposite the Town Hall, near Gurdwara Sis Ganj Sahib.',
  },
];

/* ── Consultation Journey Steps ────────────────────────────────────── */
export const consultationJourneySteps = [
  { step: 1, title: 'Share Your Idea', description: 'Tell us about the outfit you envision — the occasion, the style, the feeling you want to create.' },
  { step: 2, title: 'Upload Inspiration', description: 'Share reference images, Pinterest boards, Instagram posts, or sketches that capture your vision.' },
  { step: 3, title: 'Choose Preferences', description: 'Select your preferred fabrics, colours, embroidery styles, and customisation options.' },
  { step: 4, title: 'Share Measurements', description: 'Choose your preferred measurement method — at our atelier, via video call, or self-guided.' },
  { step: 5, title: 'Submit Request', description: 'Review your complete design brief and submit it to our couture team for review.' },
  { step: 6, title: 'WhatsApp Consultation', description: 'Our specialists will reach out on WhatsApp to begin your personalised couture journey.' },
];
