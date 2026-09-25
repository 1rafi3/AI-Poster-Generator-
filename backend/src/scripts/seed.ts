import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Template } from '../models/Template';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export async function seedDatabase(shouldExit = false): Promise<void> {
  console.log('[Seed] Starting database seeding...');
  await connectDB();

  // Clear existing templates to reseed cleanly
  await Template.deleteMany({});
  console.log('[Seed] Cleared existing templates.');

  const templates = [
    {
      title: 'মহান বিজয় দিবস — লাল-সবুজের প্রত্যয়',
      occasionType: 'victory_day',
      occasionLabelBangla: 'বিজয় দিবস',
      thumbnailUrl: '/templates/thumb-victory.svg',
      isActive: true,
      layoutConfig: {
        photoSlots: [
          { id: 'leader1', label: 'শীর্ষ নেতা ১', role: 'leader1', shape: 'arch', xPercent: 30, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'leader2', label: 'শীর্ষ নেতা ২', role: 'leader2', shape: 'arch', xPercent: 70, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'candidate', label: 'প্রার্থী / শুভেচ্ছা প্রদানকারী', role: 'candidate', shape: 'circle', xPercent: 50, yPercent: 45, widthPercent: 40, heightPercent: 32 },
        ],
        textSlots: [
          { id: 'topMotto', label: 'শিরোনাম বার্তা', defaultText: 'বিসমিল্লাহির রাহমানির রাহিম', fontSize: 20, color: '#FDE047', align: 'center', xPercent: 50, yPercent: 6 },
          { id: 'headline', label: 'মূল শিরোনাম', defaultText: '১৬ই ডিসেম্বর মহান বিজয় দিবস', fontSize: 48, fontWeight: '900', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 24 },
          { id: 'subheadline', label: 'উপ-শিরোনাম', defaultText: 'সকল শহীদ ও বীর মুক্তিযোদ্ধাদের প্রতি বিনম্র শ্রদ্ধা', fontSize: 26, color: '#FDE047', align: 'center', xPercent: 50, yPercent: 30 },
          { id: 'name', label: 'আপনার নাম', defaultText: 'সম্মানিত জননেতা', fontSize: 44, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 62 },
          { id: 'designation', label: 'পদবি ও দল', defaultText: 'যুগ্ম সাধারণ সম্পাদক, বাংলাদেশ আওয়ামী লীগ / বিএনপি', fontSize: 24, color: '#FCD34D', align: 'center', xPercent: 50, yPercent: 66 },
          { id: 'slogan', label: 'দেশাত্মবোধক স্লোগান', defaultText: 'বীর বাঙালি অস্ত্র ধরো, বাংলাদেশ স্বাধীন করো — লাল সবুজের পতাকায় লাখো শহীদের রক্ত', fontSize: 22, color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 72 },
          { id: 'promotedBy', label: 'প্রচারে', defaultText: 'সকল দেশপ্রেমিক এলাকাবাসী ও নেতাকর্মীবৃন্দ', fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 88 },
        ],
        colorScheme: {
          primary: '#006A4E',
          secondary: '#F42A41',
          accent: '#F59E0B',
          backgroundGradient: ['#004D38', '#00241A'],
          textColor: '#FFFFFF',
          headerBannerBg: '#F42A41',
        },
        decorations: {
          hasFlagMotif: true,
          hasFloralBorder: true,
          hasPaddyOrDoves: true,
          bannerStyle: 'ribbon',
        },
      },
    },
    {
      title: 'গভীর শোক ও স্মরণ — শ্রদ্ধাঞ্জলি',
      occasionType: 'condolence',
      occasionLabelBangla: 'শোক ও স্মরণ',
      thumbnailUrl: '/templates/thumb-condolence.svg',
      isActive: true,
      layoutConfig: {
        photoSlots: [
          { id: 'leader1', label: 'স্মরণীয় অভিভাবক ১', role: 'leader1', shape: 'circle', xPercent: 30, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'leader2', label: 'স্মরণীয় অভিভাবক ২', role: 'leader2', shape: 'circle', xPercent: 70, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'candidate', label: 'শোকাহত প্রতিনিধি', role: 'candidate', shape: 'circle', xPercent: 50, yPercent: 45, widthPercent: 38, heightPercent: 30 },
        ],
        textSlots: [
          { id: 'topMotto', label: 'দোয়া বার্তা', defaultText: 'ইন্নালিল্লাহি ওয়া ইন্না ইলাইহি রাজিউন', fontSize: 22, color: '#E2E8F0', align: 'center', xPercent: 50, yPercent: 6 },
          { id: 'headline', label: 'মূল শিরোনাম', defaultText: 'গভীর শোক ও বিনম্র শ্রদ্ধাঞ্জলি', fontSize: 46, fontWeight: '900', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 24 },
          { id: 'subheadline', label: 'উপ-শিরোনাম', defaultText: 'আপনার আদর্শ ও স্মৃতি আমাদের হৃদয়ে চির অম্লান থাকবে', fontSize: 24, color: '#94A3B8', align: 'center', xPercent: 50, yPercent: 30 },
          { id: 'name', label: 'শোক জ্ঞাপনকারীর নাম', defaultText: 'অ্যাডভোকেট মোঃ রফিকুল ইসলাম', fontSize: 42, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 62 },
          { id: 'designation', label: 'পদবি ও এলাকা', defaultText: 'সদস্য, কেন্দ্রীয় কার্যকরী পরিষদ', fontSize: 24, color: '#CBD5E1', align: 'center', xPercent: 50, yPercent: 66 },
          { id: 'slogan', label: 'স্মরণীয় বাণী', defaultText: 'মৃত্যু তোমাকে কেড়ে নিয়েছে ঠিকই, কিন্তু তোমার নীতি চির জাগ্রত থাকবে', fontSize: 20, color: '#E2E8F0', align: 'center', xPercent: 50, yPercent: 72 },
          { id: 'promotedBy', label: 'প্রচারে', defaultText: 'শোকসন্তপ্ত পরিবারবর্গ ও সর্বস্তরের শুভাকাঙ্ক্ষী', fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 88 },
        ],
        colorScheme: {
          primary: '#1E293B',
          secondary: '#0F172A',
          accent: '#94A3B8',
          backgroundGradient: ['#1E293B', '#020617'],
          textColor: '#F8FAFC',
          headerBannerBg: '#0F172A',
        },
        decorations: {
          hasFlagMotif: false,
          hasFloralBorder: true,
          hasPaddyOrDoves: false,
          bannerStyle: 'classic',
        },
      },
    },
    {
      title: 'আসন্ন নির্বাচনী প্রচার — জনতার প্রার্থী',
      occasionType: 'election',
      occasionLabelBangla: 'নির্বাচনী প্রচার',
      thumbnailUrl: '/templates/thumb-election.svg',
      isActive: true,
      layoutConfig: {
        photoSlots: [
          { id: 'leader1', label: 'শীর্ষ নেতা ১', role: 'leader1', shape: 'arch', xPercent: 25, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'leader2', label: 'শীর্ষ নেতা ২', role: 'leader2', shape: 'arch', xPercent: 75, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'candidate', label: 'নির্বাচনী প্রার্থী', role: 'candidate', shape: 'circle', xPercent: 50, yPercent: 44, widthPercent: 42, heightPercent: 34 },
        ],
        textSlots: [
          { id: 'topMotto', label: 'বিসমিল্লাহ', defaultText: 'বিসমিল্লাহির রাহমানির রাহিম | জয় বাংলা / বাংলাদেশ জিন্দাবাদ', fontSize: 20, color: '#FEF08A', align: 'center', xPercent: 50, yPercent: 6 },
          { id: 'headline', label: 'মূল শিরোনাম', defaultText: 'আসন্ন নির্বাচনে আপনার দোয়া ও সমর্থন প্রার্থী', fontSize: 44, fontWeight: '900', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 24 },
          { id: 'subheadline', label: 'স্লোগান বার্তা', defaultText: 'এলাকার সার্বিক উন্নয়ন ও দুর্নীতিমুক্ত সমাজ গড়ার অঙ্গীকার', fontSize: 26, color: '#FDE047', align: 'center', xPercent: 50, yPercent: 30 },
          { id: 'name', label: 'প্রার্থীর নাম', defaultText: 'হাজী মোঃ নুরুল হক', fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 62 },
          { id: 'designation', label: 'প্রার্থিতা পদবি', defaultText: 'চেয়ারম্যান পদপ্রার্থী, ১নং মডেল ইউনিয়ন পরিষদ', fontSize: 26, color: '#FCD34D', align: 'center', xPercent: 50, yPercent: 66 },
          { id: 'slogan', label: 'নির্বাচনী স্লোগান', defaultText: 'তারুণ্যের অহংকার, ন্যায়ের প্রতীক — যোগ্য প্রার্থীকে ভোট দিন', fontSize: 22, color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 72 },
          { id: 'promotedBy', label: 'প্রচারে', defaultText: 'ইউনিয়ন সর্বস্তরের ভোটার ও সচেতন নাগরিক ফোরাম', fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 88 },
        ],
        colorScheme: {
          primary: '#047857',
          secondary: '#DC2626',
          accent: '#F59E0B',
          backgroundGradient: ['#064E3B', '#022C22'],
          textColor: '#FFFFFF',
          headerBannerBg: '#DC2626',
        },
        decorations: {
          hasFlagMotif: true,
          hasFloralBorder: true,
          hasPaddyOrDoves: true,
          bannerStyle: 'curved',
        },
      },
    },
    {
      title: 'আন্তরিক শুভেচ্ছা ও প্রাণঢালা অভিনন্দন',
      occasionType: 'greetings',
      occasionLabelBangla: 'শুভেচ্ছা',
      thumbnailUrl: '/templates/thumb-greetings.svg',
      isActive: true,
      layoutConfig: {
        photoSlots: [
          { id: 'leader1', label: 'দলীয় শীর্ষ নেতা ১', role: 'leader1', shape: 'circle', xPercent: 30, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'leader2', label: 'দলীয় শীর্ষ নেতা ২', role: 'leader2', shape: 'circle', xPercent: 70, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'candidate', label: 'শুভেচ্ছাদাতা', role: 'candidate', shape: 'circle', xPercent: 50, yPercent: 44, widthPercent: 38, heightPercent: 30 },
        ],
        textSlots: [
          { id: 'topMotto', label: 'শুভ বার্তা', defaultText: 'জয় বাংলা / শুভ নববর্ষ / স্বাগতম', fontSize: 20, color: '#FEF08A', align: 'center', xPercent: 50, yPercent: 6 },
          { id: 'headline', label: 'মূল শিরোনাম', defaultText: 'আন্তরিক শুভেচ্ছা ও প্রাণঢালা অভিনন্দন', fontSize: 44, fontWeight: '900', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 24 },
          { id: 'subheadline', label: 'উপ-শিরোনাম', defaultText: 'দেশ ও মানুষের কল্যাণে ঐক্যবদ্ধ থাকুন', fontSize: 24, color: '#FDE047', align: 'center', xPercent: 50, yPercent: 30 },
          { id: 'name', label: 'নাম', defaultText: 'মোঃ তানভীর হাসান শান্ত', fontSize: 44, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 62 },
          { id: 'designation', label: 'পদবি ও সংগঠন', defaultText: 'সভাপতি, থানা যুব ফোরাম', fontSize: 24, color: '#FDE047', align: 'center', xPercent: 50, yPercent: 66 },
          { id: 'slogan', label: 'স্লোগান', defaultText: 'ঐক্যই শক্তি, প্রগতিই আমাদের অঙ্গীকার', fontSize: 22, color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 72 },
          { id: 'promotedBy', label: 'প্রচারে', defaultText: 'সকল সচেতন তরুণ প্রজন্ম ও সমর্থকবৃন্দ', fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 88 },
        ],
        colorScheme: {
          primary: '#0284C7',
          secondary: '#D97706',
          accent: '#F59E0B',
          backgroundGradient: ['#0369A1', '#082F49'],
          textColor: '#FFFFFF',
          headerBannerBg: '#EA580C',
        },
        decorations: {
          hasFlagMotif: true,
          hasFloralBorder: true,
          hasPaddyOrDoves: false,
          bannerStyle: 'ribbon',
        },
      },
    },
    {
      title: 'পবিত্র ঈদুল ফিতর — ঈদ মোবারক',
      occasionType: 'eid_festival',
      occasionLabelBangla: 'ঈদ ও উৎসব',
      thumbnailUrl: '/templates/thumb-eid.svg',
      isActive: true,
      layoutConfig: {
        photoSlots: [
          { id: 'leader1', label: 'সম্মানিত মুরুব্বি / নেতা ১', role: 'leader1', shape: 'circle', xPercent: 30, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'leader2', label: 'সম্মানিত মুরুব্বি / নেতা ২', role: 'leader2', shape: 'circle', xPercent: 70, yPercent: 12, widthPercent: 18, heightPercent: 15 },
          { id: 'candidate', label: 'শুভেচ্ছাদাতা', role: 'candidate', shape: 'circle', xPercent: 50, yPercent: 44, widthPercent: 40, heightPercent: 32 },
        ],
        textSlots: [
          { id: 'topMotto', label: 'ধর্মীয় সম্ভাষণ', defaultText: 'তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম', fontSize: 20, color: '#FDE047', align: 'center', xPercent: 50, yPercent: 6 },
          { id: 'headline', label: 'মূল শিরোনাম', defaultText: 'পবিত্র ঈদুল ফিতর মোবারক', fontSize: 48, fontWeight: '900', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 24 },
          { id: 'subheadline', label: 'উপ-শিরোনাম', defaultText: 'ঈদের আনন্দ ছড়িয়ে পড়ুক বাংলার প্রতিটি ঘরে ঘরে', fontSize: 24, color: '#FEF08A', align: 'center', xPercent: 50, yPercent: 30 },
          { id: 'name', label: 'আপনার নাম', defaultText: 'ইঞ্জিনিয়ার মোস্তফা কামাল', fontSize: 44, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 62 },
          { id: 'designation', label: 'পদবি ও এলাকা', defaultText: 'সমাজসেবক ও বিশিষ্ট ব্যবসায়ী', fontSize: 24, color: '#FDE047', align: 'center', xPercent: 50, yPercent: 66 },
          { id: 'slogan', label: 'ঈদ বাণী', defaultText: 'শান্তি, সৌহার্দ্য ও ভ্রাতৃত্ববোধের জয় হোক', fontSize: 22, color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 72 },
          { id: 'promotedBy', label: 'প্রচারে', defaultText: 'এলাকাবাসী ও বন্ধুমহল', fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', align: 'center', xPercent: 50, yPercent: 88 },
        ],
        colorScheme: {
          primary: '#0D9488',
          secondary: '#0F766E',
          accent: '#F59E0B',
          backgroundGradient: ['#0F766E', '#134E4A'],
          textColor: '#FFFFFF',
          headerBannerBg: '#047857',
        },
        decorations: {
          hasFlagMotif: false,
          hasFloralBorder: true,
          hasPaddyOrDoves: true,
          bannerStyle: 'curved',
        },
      },
    },
  ];

  await Template.insertMany(templates);
  console.log(`[Seed] Successfully seeded ${templates.length} curated templates!`);

  // Seed default admin and test user if not exist
  const adminEmail = 'admin@poster.bd';
  let admin = await User.findOne({ emailOrPhone: adminEmail });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    admin = await User.create({
      name: 'সিস্টেম অ্যাডমিন',
      emailOrPhone: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log(`[Seed] Created default admin account: ${adminEmail} (password: admin123)`);
  }

  const userEmail = 'user@poster.bd';
  let user = await User.findOne({ emailOrPhone: userEmail });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('user123', salt);
    user = await User.create({
      name: 'মোঃ রফিকুল ইসলাম (কর্মী)',
      emailOrPhone: userEmail,
      passwordHash,
      role: 'user',
    });
    console.log(`[Seed] Created test user account: ${userEmail} (password: user123)`);
  }

  console.log('[Seed] Database seeding completed successfully!');
  if (shouldExit) {
    process.exit(0);
  }
}

// If executed directly from CLI:
if (require.main === module) {
  seedDatabase(true).catch((err) => {
    console.error('[Seed] Seeding error:', err);
    process.exit(1);
  });
}
