const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const dotenv = require('dotenv');

dotenv.config();

const medicines = [
  {
    name: 'Paracetamol 500mg',
    brand: 'Crocin',
    category: 'Tablets',
    type: 'Over-the-counter',
    price: 25,
    discount: 10,
    description: 'Used for fever and pain relief. Provides effective relief from headache, body ache, and fever.',
    composition: ['Paracetamol'],
    uses: ['Fever', 'Headache', 'Body Pain', 'Toothache'],
    sideEffects: ['Rare allergic reactions', 'Nausea in sensitive individuals'],
    dosage: '1 tablet every 4-6 hours, maximum 4 tablets in 24 hours',
    manufacturer: 'GSK Pharmaceuticals',
    stock: 100,
    prescriptionRequired: false,
    rating: 4.5,
    totalRatings: 150
  },
  {
    name: 'Dolo 650mg',
    brand: 'Dolo',
    category: 'Tablets',
    type: 'Over-the-counter',
    price: 30,
    discount: 5,
    description: 'Effective pain reliever and fever reducer. Trusted by millions for quick relief.',
    composition: ['Paracetamol'],
    uses: ['Fever', 'Pain Relief', 'Headache', 'Arthritis Pain'],
    sideEffects: ['Rare side effects', 'Liver damage in overdose'],
    dosage: '1 tablet every 4-6 hours as needed',
    manufacturer: 'Micro Labs',
    stock: 85,
    prescriptionRequired: false,
    rating: 4.6,
    totalRatings: 200
  },
  {
    name: 'Amoxicillin 250mg',
    brand: 'Mox',
    category: 'Capsules',
    type: 'Prescription',
    price: 120,
    discount: 8,
    description: 'Broad-spectrum antibiotic for bacterial infections. Effective against various bacterial strains.',
    composition: ['Amoxicillin'],
    uses: ['Bacterial Infections', 'Respiratory Infections', 'Ear Infections', 'Urinary Tract Infections'],
    sideEffects: ['Nausea', 'Diarrhea', 'Allergic reactions in some patients'],
    dosage: '1 capsule 3 times daily for 5-7 days',
    manufacturer: 'Cipla',
    stock: 50,
    prescriptionRequired: true,
    rating: 4.2,
    totalRatings: 89
  },
  {
    name: 'Vitamin C 1000mg',
    brand: 'Limcee',
    category: 'Tablets',
    type: 'Over-the-counter',
    price: 180,
    discount: 15,
    description: 'Powerful antioxidant for immunity boost and overall health. Chewable orange flavor tablets.',
    composition: ['Ascorbic Acid'],
    uses: ['Immunity Boost', 'Vitamin C Deficiency', 'Antioxidant Support', 'Collagen Production'],
    sideEffects: ['Mild stomach upset in high doses'],
    dosage: '1 tablet daily or as directed by physician',
    manufacturer: 'Abbott',
    stock: 75,
    prescriptionRequired: false,
    rating: 4.7,
    totalRatings: 200
  },
  {
    name: 'Cetirizine 10mg',
    brand: 'Zyrtec',
    category: 'Tablets',
    type: 'Over-the-counter',
    price: 45,
    discount: 0,
    description: 'Fast-acting antihistamine for allergy relief. Non-drowsy formula for daytime use.',
    composition: ['Cetirizine'],
    uses: ['Allergies', 'Hay Fever', 'Skin Rashes', 'Itching', 'Allergic Rhinitis'],
    sideEffects: ['Mild drowsiness', 'Dry mouth', 'Headache in rare cases'],
    dosage: '1 tablet daily, preferably in evening',
    manufacturer: 'Johnson & Johnson',
    stock: 80,
    prescriptionRequired: false,
    rating: 4.3,
    totalRatings: 120
  },
  {
    name: 'Omeprazole 20mg',
    brand: 'Omez',
    category: 'Capsules',
    type: 'Prescription',
    price: 95,
    discount: 12,
    description: 'Proton pump inhibitor for acid-related disorders. Provides long-lasting relief from acidity.',
    composition: ['Omeprazole'],
    uses: ['Acidity', 'GERD', 'Gastric Ulcers', 'Heartburn', 'Acid Reflux'],
    sideEffects: ['Headache', 'Nausea', 'Abdominal pain in some cases'],
    dosage: '1 capsule before breakfast, empty stomach',
    manufacturer: 'Dr. Reddy\'s',
    stock: 60,
    prescriptionRequired: true,
    rating: 4.4,
    totalRatings: 95
  },
  {
    name: 'Salbutamol Inhaler',
    brand: 'Asthalin',
    category: 'Inhalers',
    type: 'Prescription',
    price: 220,
    discount: 10,
    description: 'Bronchodilator for immediate relief from asthma symptoms. Fast-acting rescue inhaler.',
    composition: ['Salbutamol'],
    uses: ['Asthma', 'Bronchospasm', 'COPD', 'Breathing Difficulty'],
    sideEffects: ['Tremors', 'Palpitations', 'Headache', 'Muscle cramps'],
    dosage: '1-2 puffs as needed, maximum 8 puffs in 24 hours',
    manufacturer: 'Cipla',
    stock: 30,
    prescriptionRequired: true,
    rating: 4.6,
    totalRatings: 78
  },
  {
    name: 'Ibuprofen 400mg',
    brand: 'Brufen',
    category: 'Tablets',
    type: 'Over-the-counter',
    price: 35,
    discount: 5,
    description: 'NSAID for pain, inflammation, and fever. Effective for musculoskeletal pain.',
    composition: ['Ibuprofen'],
    uses: ['Pain', 'Inflammation', 'Arthritis', 'Menstrual Cramps', 'Back Pain'],
    sideEffects: ['Stomach upset', 'Heartburn', 'Dizziness in some cases'],
    dosage: '1 tablet every 6-8 hours with food',
    manufacturer: 'Abbott',
    stock: 90,
    prescriptionRequired: false,
    rating: 4.2,
    totalRatings: 110
  },
  {
    name: 'Atorvastatin 10mg',
    brand: 'Atorva',
    category: 'Tablets',
    type: 'Prescription',
    price: 150,
    discount: 8,
    description: 'Statin medication for cholesterol management. Helps maintain healthy cholesterol levels.',
    composition: ['Atorvastatin'],
    uses: ['High Cholesterol', 'Heart Disease Prevention', 'Triglyceride Reduction'],
    sideEffects: ['Muscle pain', 'Liver enzyme changes', 'Digestive issues'],
    dosage: '1 tablet daily in evening',
    manufacturer: 'Sun Pharma',
    stock: 45,
    prescriptionRequired: true,
    rating: 4.3,
    totalRatings: 67
  },
  {
    name: 'Metformin 500mg',
    brand: 'Glycomet',
    category: 'Tablets',
    type: 'Prescription',
    price: 80,
    discount: 5,
    description: 'First-line medication for type 2 diabetes. Helps control blood sugar levels effectively.',
    composition: ['Metformin'],
    uses: ['Type 2 Diabetes', 'PCOS', 'Weight Management', 'Insulin Resistance'],
    sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste', 'Vitamin B12 deficiency'],
    dosage: '1 tablet twice daily with meals',
    manufacturer: 'USV',
    stock: 70,
    prescriptionRequired: true,
    rating: 4.4,
    totalRatings: 145
  },
  {
    name: 'Multivitamin Capsules',
    brand: 'Becadexamin',
    category: 'Capsules',
    type: 'Over-the-counter',
    price: 150,
    discount: 20,
    description: 'Complete multivitamin and mineral supplement for overall health and wellness.',
    composition: ['Vitamin A', 'Vitamin B Complex', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Minerals'],
    uses: ['Vitamin Deficiency', 'General Health', 'Immunity Support', 'Energy Boost'],
    sideEffects: ['None when taken as directed'],
    dosage: '1 capsule daily after food',
    manufacturer: 'GlaxoSmithKline',
    stock: 65,
    prescriptionRequired: false,
    rating: 4.5,
    totalRatings: 180
  },
  {
    name: 'Azithromycin 250mg',
    brand: 'Azee',
    category: 'Tablets',
    type: 'Prescription',
    price: 130,
    discount: 10,
    description: 'Macrolide antibiotic for bacterial infections. Convenient once-daily dosage.',
    composition: ['Azithromycin'],
    uses: ['Bacterial Infections', 'Respiratory Infections', 'Skin Infections', 'STDs'],
    sideEffects: ['Nausea', 'Diarrhea', 'Abdominal pain', 'Headache'],
    dosage: 'As prescribed, usually 1 tablet daily for 3-5 days',
    manufacturer: 'Cipla',
    stock: 40,
    prescriptionRequired: true,
    rating: 4.1,
    totalRatings: 88
  }
];

const seedMedicines = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect');
    console.log('✅ Connected to MongoDB');

    await Medicine.deleteMany();
    console.log('🗑️  Cleared existing medicines');

    await Medicine.insertMany(medicines);
    console.log('🌱 Medicines seeded successfully');

    const seededMedicines = await Medicine.find().select('name brand price category stock');
    console.log('\n📋 Seeded Medicines:');
    console.log('====================');
    seededMedicines.forEach(medicine => {
      console.log(`💊 ${medicine.name}`);
      console.log(`   🏷️  ${medicine.brand}`);
      console.log(`   💰 ₹${medicine.price}`);
      console.log(`   📦 ${medicine.category}`);
      console.log(`   🏪 Stock: ${medicine.stock}`);
      console.log('   ---');
    });

    console.log(`\n✅ Successfully seeded ${seededMedicines.length} medicines`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding medicines:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedMedicines();
}

module.exports = seedMedicines;