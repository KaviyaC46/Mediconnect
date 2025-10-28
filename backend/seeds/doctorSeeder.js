const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

const doctors = [
  {
    name: 'Dr. Rajesh Kumar',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    experience: 15,
    qualification: 'MD, DM Cardiology',
    fee: 1500,
    address: 'Apollo Hospital, Delhi',
    rating: 4.8,
    totalRatings: 125,
    about: 'Senior Cardiologist with 15+ years of experience in interventional cardiology. Expert in angioplasty, bypass surgery, and cardiac interventions. Specialized in treating heart diseases, hypertension, and performing complex cardiac procedures.',
    languages: ['English', 'Hindi'],
    isActive: true,
    contact: {
      email: 'rajesh.kumar@hospital.com',
      phone: '+91-9876543210'
    },
    availability: [
      { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Friday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
    ]
  },
  {
    name: 'Dr. Priya Sharma',
    specialization: 'Dermatologist',
    department: 'Dermatology',
    experience: 10,
    qualification: 'MD Dermatology',
    fee: 1200,
    address: 'Max Hospital, Mumbai',
    rating: 4.6,
    totalRatings: 89,
    about: 'Expert Dermatologist specializing in cosmetic dermatology, skin treatments, and laser therapy. Specialized in acne treatment, skin rejuvenation, pigmentation disorders, and dermatological surgeries.',
    languages: ['English', 'Hindi', 'Marathi'],
    isActive: true,
    contact: {
      email: 'priya.sharma@hospital.com',
      phone: '+91-9876543211'
    },
    availability: [
      { day: 'Tuesday', slots: ['10:00', '11:00', '12:00', '15:00', '16:00'] },
      { day: 'Thursday', slots: ['10:00', '11:00', '12:00', '15:00', '16:00'] },
      { day: 'Saturday', slots: ['09:00', '10:00', '11:00'] }
    ]
  },
  {
    name: 'Dr. Arjun Patel',
    specialization: 'Orthopedic Surgeon',
    department: 'Orthopedics',
    experience: 12,
    qualification: 'MS Orthopedics',
    fee: 2000,
    address: 'Fortis Hospital, Bangalore',
    rating: 4.7,
    totalRatings: 67,
    about: 'Senior Orthopedic Surgeon specialized in joint replacement, arthroscopy, and sports injuries. Expert in knee and hip surgeries, trauma management, and orthopedic rehabilitation.',
    languages: ['English', 'Hindi', 'Kannada'],
    isActive: true,
    contact: {
      email: 'arjun.patel@hospital.com',
      phone: '+91-9876543212'
    },
    availability: [
      { day: 'Monday', slots: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
      { day: 'Wednesday', slots: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
      { day: 'Friday', slots: ['08:00', '09:00', '10:00', '14:00', '15:00'] }
    ]
  },
  {
    name: 'Dr. Anjali Mehta',
    specialization: 'Pediatrician',
    department: 'Pediatrics',
    experience: 8,
    qualification: 'MD Pediatrics',
    fee: 1000,
    address: 'Columbia Asia Hospital, Pune',
    rating: 4.9,
    totalRatings: 156,
    about: 'Child Specialist and Pediatrician with expertise in newborn care, vaccination, and childhood diseases. Specialized in pediatric emergencies, growth monitoring, and adolescent healthcare.',
    languages: ['English', 'Hindi', 'Marathi'],
    isActive: true,
    contact: {
      email: 'anjali.mehta@hospital.com',
      phone: '+91-9876543213'
    },
    availability: [
      { day: 'Monday', slots: ['09:00', '10:00', '11:00', '16:00', '17:00'] },
      { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '16:00', '17:00'] },
      { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '16:00', '17:00'] },
      { day: 'Saturday', slots: ['09:00', '10:00', '11:00'] }
    ]
  },
  {
    name: 'Dr. Sanjay Gupta',
    specialization: 'Neurologist',
    department: 'Neurology',
    experience: 18,
    qualification: 'DM Neurology',
    fee: 1800,
    address: 'AIIMS, Delhi',
    rating: 4.8,
    totalRatings: 94,
    about: 'Senior Neurologist specializing in stroke treatment, epilepsy, and movement disorders. Expert in neuroimaging, EEG, EMG, and management of complex neurological conditions.',
    languages: ['English', 'Hindi'],
    isActive: true,
    contact: {
      email: 'sanjay.gupta@hospital.com',
      phone: '+91-9876543214'
    },
    availability: [
      { day: 'Tuesday', slots: ['10:00', '11:00', '12:00', '14:00', '15:00'] },
      { day: 'Thursday', slots: ['10:00', '11:00', '12:00', '14:00', '15:00'] },
      { day: 'Friday', slots: ['10:00', '11:00', '12:00', '14:00', '15:00'] }
    ]
  },
  {
    name: 'Dr. Neha Reddy',
    specialization: 'Gynecologist',
    department: 'Gynecology',
    experience: 11,
    qualification: 'MD Gynecology',
    fee: 1300,
    address: 'KIMS Hospital, Hyderabad',
    rating: 4.7,
    totalRatings: 112,
    about: 'Expert Gynecologist specializing in women\'s health, pregnancy care, and laparoscopic surgeries. Specialized in high-risk pregnancies, infertility treatment, and minimally invasive gynecological procedures.',
    languages: ['English', 'Hindi', 'Telugu'],
    isActive: true,
    contact: {
      email: 'neha.reddy@hospital.com',
      phone: '+91-9876543215'
    },
    availability: [
      { day: 'Monday', slots: ['09:00', '10:00', '11:00', '15:00', '16:00'] },
      { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '15:00', '16:00'] },
      { day: 'Friday', slots: ['09:00', '10:00', '11:00', '15:00', '16:00'] }
    ]
  },
  {
    name: 'Dr. Vikram Singh',
    specialization: 'ENT Specialist',
    department: 'ENT',
    experience: 9,
    qualification: 'MS ENT',
    fee: 1100,
    address: 'Artemis Hospital, Gurgaon',
    rating: 4.5,
    totalRatings: 78,
    about: 'ENT Specialist expert in ear, nose, and throat disorders. Specialized in endoscopic sinus surgery, hearing disorders, tonsillectomy, and voice disorders treatment.',
    languages: ['English', 'Hindi'],
    isActive: true,
    contact: {
      email: 'vikram.singh@hospital.com',
      phone: '+91-9876543216'
    },
    availability: [
      { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Saturday', slots: ['09:00', '10:00', '11:00'] }
    ]
  },
  {
    name: 'Dr. Sunil Verma',
    specialization: 'Psychiatrist',
    department: 'Psychiatry',
    experience: 14,
    qualification: 'MD Psychiatry',
    fee: 1600,
    address: 'Manipal Hospital, Bangalore',
    rating: 4.6,
    totalRatings: 65,
    about: 'Senior Psychiatrist specializing in mental health disorders, depression, anxiety, and addiction treatment. Expert in psychotherapy, cognitive behavioral therapy, and psychiatric medication management.',
    languages: ['English', 'Hindi', 'Kannada'],
    isActive: true,
    contact: {
      email: 'sunil.verma@hospital.com',
      phone: '+91-9876543217'
    },
    availability: [
      { day: 'Monday', slots: ['10:00', '11:00', '12:00', '16:00', '17:00'] },
      { day: 'Wednesday', slots: ['10:00', '11:00', '12:00', '16:00', '17:00'] },
      { day: 'Friday', slots: ['10:00', '11:00', '12:00', '16:00', '17:00'] }
    ]
  },
  {
    name: 'Dr. Meera Nair',
    specialization: 'Ophthalmologist',
    department: 'Ophthalmology',
    experience: 13,
    qualification: 'MS Ophthalmology',
    fee: 1400,
    address: 'Sankara Eye Hospital, Chennai',
    rating: 4.8,
    totalRatings: 102,
    about: 'Expert Ophthalmologist specializing in cataract surgery, retinal disorders, and refractive surgery. Specialized in LASIK, glaucoma treatment, and diabetic retinopathy management.',
    languages: ['English', 'Hindi', 'Tamil'],
    isActive: true,
    contact: {
      email: 'meera.nair@hospital.com',
      phone: '+91-9876543218'
    },
    availability: [
      { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Saturday', slots: ['09:00', '10:00', '11:00'] }
    ]
  },
  {
    name: 'Dr. Rohan Desai',
    specialization: 'Urologist',
    department: 'Urology',
    experience: 16,
    qualification: 'MCh Urology',
    fee: 1900,
    address: 'Global Hospital, Mumbai',
    rating: 4.7,
    totalRatings: 88,
    about: 'Senior Urologist expert in kidney stones, prostate diseases, and urological cancers. Specialized in minimally invasive urological surgeries, laser procedures, and renal transplantation.',
    languages: ['English', 'Hindi', 'Marathi'],
    isActive: true,
    contact: {
      email: 'rohan.desai@hospital.com',
      phone: '+91-9876543219'
    },
    availability: [
      { day: 'Monday', slots: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
      { day: 'Wednesday', slots: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
      { day: 'Friday', slots: ['08:00', '09:00', '10:00', '14:00', '15:00'] }
    ]
  },
  {
    name: 'Dr. Ananya Joshi',
    specialization: 'Endocrinologist',
    department: 'Endocrinology',
    experience: 11,
    qualification: 'DM Endocrinology',
    fee: 1700,
    address: 'Ruby Hall Clinic, Pune',
    rating: 4.6,
    totalRatings: 74,
    about: 'Endocrinologist specializing in diabetes, thyroid disorders, and hormonal imbalances. Expert in insulin pump therapy, thyroid ultrasound, and management of metabolic disorders.',
    languages: ['English', 'Hindi', 'Marathi'],
    isActive: true,
    contact: {
      email: 'ananya.joshi@hospital.com',
      phone: '+91-9876543220'
    },
    availability: [
      { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '15:00', '16:00'] },
      { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '15:00', '16:00'] },
      { day: 'Saturday', slots: ['09:00', '10:00', '11:00'] }
    ]
  }
];

const seedDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect');
    console.log('✅ Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany();
    console.log('🗑️  Cleared existing doctors');

    // Insert new doctors
    await Doctor.insertMany(doctors);
    console.log('🌱 Doctors seeded successfully');

    // Display seeded doctors
    const seededDoctors = await Doctor.find().select('name specialization fee address experience');
    console.log('\n📋 Seeded Doctors with Specializations:');
    console.log('=========================================');
    seededDoctors.forEach(doctor => {
      console.log(`👨‍⚕️  ${doctor.name}`);
      console.log(`   🩺 ${doctor.specialization}`);
      console.log(`   💰 Fee: ₹${doctor.fee}`);
      console.log(`   📍 ${doctor.address}`);
      console.log(`   ⏳ ${doctor.experience} years experience`);
      console.log(`   🆔 ID: ${doctor._id}`);
      console.log('   ---');
    });

    console.log(`\n✅ Successfully seeded ${seededDoctors.length} specialized doctors`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDoctors();
}

module.exports = seedDoctors;