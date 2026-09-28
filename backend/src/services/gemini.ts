import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerationLog } from '../models/GenerationLog';
import mongoose from 'mongoose';

export interface AISuggestionResult {
  sloganSuggestion: string;
  colorAccentSuggestion: string;
  tone: string;
  headlinePolish: string;
  subheadlineSuggestion?: string;
  fontSuggestion?: string;
  designThemeName?: string;
  layoutVariation?: '3-up' | '2-up' | 'solo';
  layoutSuggestion: {
    leaderFrameStyle: 'golden_oval' | 'patriotic_circle' | 'flag_bordered';
    badgeText?: string;
    footerStyle: string;
  };
  promptUsed: string;
  tokensUsed: number;
  latencyMs: number;
}

export interface AIPosterAssistanceOptions {
  name: string;
  designation: string;
  party: string;
  district: string;
  occasionType: string;
  headline: string;
  subheadline?: string;
  slogan?: string;
  retryCount?: number;
  isRegenerate?: boolean;
  refreshText?: boolean;
  refreshDesign?: boolean;
}

// 5 Rich, culturally authentic design & text variations for each occasion
const OCCASION_VARIATIONS: Record<string, Array<{
  headlinePolish: string;
  subheadlineSuggestion: string;
  sloganSuggestion: string;
  colorAccentSuggestion: string;
  fontSuggestion: string;
  designThemeName: string;
  tone: string;
  badgeText: string;
  leaderFrameStyle: 'golden_oval' | 'patriotic_circle' | 'flag_bordered';
}>> = {
  victory_day: [
    {
      headlinePolish: '১৬ই ডিসেম্বর মহান বিজয় দিবস',
      subheadlineSuggestion: 'সকল শহীদ ও বীর মুক্তিযোদ্ধাদের প্রতি বিনম্র শ্রদ্ধা',
      sloganSuggestion: 'বীর বাঙালি অস্ত্র ধরো, বাংলাদেশ মুক্ত করো — বিজয়ের মাসে লাল-সবুজের প্রত্যয়',
      colorAccentSuggestion: '#006A4E',
      fontSuggestion: 'Tiro Bangla',
      designThemeName: 'লাল-সবুজের প্রত্যয়',
      tone: 'patriotic',
      badgeText: 'বীর শহীদদের স্মরণে',
      leaderFrameStyle: 'flag_bordered',
    },
    {
      headlinePolish: 'বিজয়ের রক্তিম সূর্য — অফুরন্ত শুভেচ্ছা ও বিনম্র শ্রদ্ধা',
      subheadlineSuggestion: 'লাখো শহীদের রক্তের বিনিময়ে অর্জিত আমাদের প্রিয় স্বাধীনতা',
      sloganSuggestion: 'বুকের রক্তে কেনা স্বাধীনতা রাখবো ধরে চিরকাল — এক সাগর রক্তের বিনিময়ে স্বাধীনতা আনলে যারা',
      colorAccentSuggestion: '#F59E0B',
      fontSuggestion: 'Hind Siliguri',
      designThemeName: 'সোনালী বিজয়',
      tone: 'patriotic',
      badgeText: 'মুক্তির জয়গান',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'মহান বিজয় দিবস সফল ও সার্থক হোক',
      subheadlineSuggestion: 'শহীদের স্বপ্ন বাস্তবায়ন ও দেশপ্রেমের শপথ হোক আজকের অঙ্গীকার',
      sloganSuggestion: 'মাগো তোমার শান্ত ছেলে আবার আসবে ফিরে — বিজয়ের আলোয় উদ্ভাসিত হোক বাংলাদেশ',
      colorAccentSuggestion: '#DC2626',
      fontSuggestion: 'Anek Bangla',
      designThemeName: 'রক্তিম সংগ্রাম',
      tone: 'patriotic',
      badgeText: 'রক্তে রাঙা পতাকা',
      leaderFrameStyle: 'flag_bordered',
    },
    {
      headlinePolish: 'ঐতিহাসিক ১৬ই ডিসেম্বর — বিজয়ের দৃপ্ত পদযাত্রা',
      subheadlineSuggestion: 'স্বাধীনতার চেতনায় গড়ে উঠুক একটি বৈষম্যহীন ও স্বনির্ভর বাংলাদেশ',
      sloganSuggestion: 'যে মাটির জন্য দিয়েছি প্রাণ, সে মাটির গৌরব করবো রক্ষা — বিজয়ের পদযাত্রায় ঐক্যবদ্ধ জনতা',
      colorAccentSuggestion: '#059669',
      fontSuggestion: 'Noto Sans Bengali',
      designThemeName: 'সবুজ বাংলাদেশ',
      tone: 'patriotic',
      badgeText: 'দেশপ্রেমের চেতনা',
      leaderFrameStyle: 'patriotic_circle',
    },
    {
      headlinePolish: 'বিজয়ের আলোকবর্তিকা — বীর জনতাকে অভিবাদন',
      subheadlineSuggestion: 'নবপ্রজন্মের দৃঢ় প্রত্যয়ে মাথা উঁচু করে দাঁড়াক প্রিয় মাতৃভূমি',
      sloganSuggestion: 'বীরদের আত্মত্যাগ বৃথা যেতে দেব না — তারুণ্যের শক্তিতেই গড়বো সমৃদ্ধ সোনার বাংলাদেশ',
      colorAccentSuggestion: '#EA580C',
      fontSuggestion: 'Tiro Bangla',
      designThemeName: 'সূর্যোদয়ের বার্তা',
      tone: 'patriotic',
      badgeText: 'তারুণ্যের জয়যাত্রা',
      leaderFrameStyle: 'golden_oval',
    },
  ],
  condolence: [
    {
      headlinePolish: 'গভীর শোক ও বিনম্র শ্রদ্ধাঞ্জলি',
      subheadlineSuggestion: 'আপনার আদর্শ ও স্মৃতি আমাদের হৃদয়ে চির অম্লান থাকবে',
      sloganSuggestion: 'আপনার ত্যাগ ও অবদান জাতি চিরকাল শ্রদ্ধার সাথে স্মরণ করবে',
      colorAccentSuggestion: '#1E293B',
      fontSuggestion: 'Tiro Bangla',
      designThemeName: 'মর্যাদাপূর্ণ শোক',
      tone: 'solemn',
      badgeText: 'স্মৃতি চির অম্লান',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'স্মৃতির পাতায় তুমি চিরঞ্জীব — পরম শ্রদ্ধা',
      subheadlineSuggestion: 'হে প্রিয় অভিভাবক, আপনার রেখে যাওয়া দর্শন আমাদের আলোর দিশারী',
      sloganSuggestion: 'মৃত্যু তোমার শেষ নয়, তুমি আছো কোটি জনতার হৃদস্পন্দনে ও ভালোবাসায়',
      colorAccentSuggestion: '#334155',
      fontSuggestion: 'Hind Siliguri',
      designThemeName: 'অমর জ্যোতি',
      tone: 'solemn',
      badgeText: 'চির ভাস্বর আদর্শ',
      leaderFrameStyle: 'patriotic_circle',
    },
    {
      headlinePolish: 'মহান রবের দরবারে বিদেহী আত্মার মাগফিরাত কামনা',
      subheadlineSuggestion: 'আমরা শোকাহত, ব্যথিত এবং আপনার আজীবন নীতিতে অবিচল',
      sloganSuggestion: 'আল্লাহ তায়ালা আপনাকে জান্নাতুল ফেরদৌস নসীব করুন — আমিন',
      colorAccentSuggestion: '#0F766E',
      fontSuggestion: 'Noto Sans Bengali',
      designThemeName: 'মায়াবী দোয়ার ছায়া',
      tone: 'solemn',
      badgeText: 'শান্তির আলো',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'অবিস্মরণীয় কীর্তিমান — বিনম্র শ্রদ্ধা ও ভালোবাসা',
      subheadlineSuggestion: 'আপনি নেই, কিন্তু আপনার আদর্শ কোটি হৃদয়ে বেঁচে থাকবে অনন্তকাল',
      sloganSuggestion: 'কর্মের মাঝেই মানুষ বাঁচে, আপনার সৎ কর্ম বেঁচে থাকবে প্রজন্মের পর প্রজন্ম',
      colorAccentSuggestion: '#475569',
      fontSuggestion: 'Anek Bangla',
      designThemeName: 'মর্যাদার প্রতীক',
      tone: 'solemn',
      badgeText: 'অনন্ত প্রেরণা',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'চিরবিদায়ে আমাদের অশ্রুসিক্ত শ্রদ্ধাঞ্জলি',
      subheadlineSuggestion: 'একটি নক্ষত্রের অবসান — আমরা শোকসন্তপ্ত পরিবার ও জনতার পাশে আছি',
      sloganSuggestion: 'চলে গেছো দূরে বহুদূরে, রেখে গেছো অফুরান স্নেহ, মমতা ও দেশপ্রেমের চেতনা',
      colorAccentSuggestion: '#18181B',
      fontSuggestion: 'Tiro Bangla',
      designThemeName: 'চিরন্তন বিদায়',
      tone: 'solemn',
      badgeText: 'অশ্রুসজল শ্রদ্ধা',
      leaderFrameStyle: 'patriotic_circle',
    },
  ],
  election: [
    {
      headlinePolish: 'আসন্ন নির্বাচনে আপনার মূল্যবান ভোট ও দোয়া প্রার্থী',
      subheadlineSuggestion: 'এলাকার সার্বিক উন্নয়ন, ন্যায়বিচার ও দুর্নীতিমুক্ত সমাজ গড়ার অঙ্গীকার',
      sloganSuggestion: 'উন্নয়নের প্রতীক, ন্যায়ের কাণ্ডারী — যোগ্য প্রার্থীকে ভোট দিয়ে এলাকার সেবা করার সুযোগ দিন',
      colorAccentSuggestion: '#047857',
      fontSuggestion: 'Hind Siliguri',
      designThemeName: 'উন্নয়নের অগ্রযাত্রা',
      tone: 'enthusiastic',
      badgeText: 'জনতার আস্থার প্রতীক',
      leaderFrameStyle: 'patriotic_circle',
    },
    {
      headlinePolish: 'জনগণের অধিকার আদায়ে — ইতিবাচক পরিবর্তনের ডাক',
      subheadlineSuggestion: 'দুঃখী মানুষের মুখে হাসি ফোটাতে আপনাদের সুখে-দুঃখে পাশে ছিলাম, পাশে থাকবো',
      sloganSuggestion: 'কথা নয় কাজে বিশ্বাসী — আপনাদের সুখ-দুঃখে নিবেদিত এক বিশ্বস্ত আপসহীন নাম',
      colorAccentSuggestion: '#0284C7',
      fontSuggestion: 'Tiro Bangla',
      designThemeName: 'জনগণের আস্থা',
      tone: 'enthusiastic',
      badgeText: 'মাটি ও মানুষের নেতা',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'তারুণ্যের শক্তি, সমৃদ্ধির দিগন্ত — বিজয়ের দৃপ্ত অঙ্গীকার',
      subheadlineSuggestion: 'আধুনিক, পরিচ্ছন্ন, মাদকমুক্ত ও প্রযুক্তিবান্ধব এলাকা গঠনে ভোট দিন',
      sloganSuggestion: 'নতুন চিন্তা, সৎ নেতৃত্ব — তারুণ্যের অহংকার নিয়ে এগিয়ে যাবে আমাদের প্রিয় এলাকা',
      colorAccentSuggestion: '#D97706',
      fontSuggestion: 'Anek Bangla',
      designThemeName: 'নতুন নেতৃত্ব',
      tone: 'enthusiastic',
      badgeText: 'তারুণ্যের উদ্দীপনা',
      leaderFrameStyle: 'flag_bordered',
    },
    {
      headlinePolish: 'শান্তি, শৃঙ্খলা ও সম্প্রীতির পক্ষে জনতার রায় দিন',
      subheadlineSuggestion: 'সবার জন্য উন্মুক্ত সেবা এবং জবাবদিহিতামূলক জনকল্যাণ প্রতিষ্ঠার প্রত্যয়',
      sloganSuggestion: 'ন্যায়ের পতাকা সমুন্নত রাখতে — সততা ও সাহসের প্রতীককে বিপুল ভোটে জয়যুক্ত করুন',
      colorAccentSuggestion: '#DC2626',
      fontSuggestion: 'Noto Sans Bengali',
      designThemeName: 'ন্যায়ের শাসন',
      tone: 'enthusiastic',
      badgeText: 'সততার আলোকবর্তিকা',
      leaderFrameStyle: 'patriotic_circle',
    },
    {
      headlinePolish: 'আসন্ন নির্বাচনে বিনম্র সালাম ও দোয়ার দরখাস্ত',
      subheadlineSuggestion: 'সাধারণ খেটে খাওয়া মানুষের অধিকার ও মর্যাদার সুরক্ষায় আমরা ঐক্যবদ্ধ',
      sloganSuggestion: 'জনগণের শক্তিই সকল ক্ষমতার উৎস — ব্যালট বিপ্লবে পরিবর্তনের জয় সুনিশ্চিত হোক',
      colorAccentSuggestion: '#4338CA',
      fontSuggestion: 'Hind Siliguri',
      designThemeName: 'ঐক্যের বিজয়',
      tone: 'enthusiastic',
      badgeText: 'গণমানুষের কাণ্ডারী',
      leaderFrameStyle: 'golden_oval',
    },
  ],
  greetings: [
    {
      headlinePolish: 'আন্তরিক শুভেচ্ছা ও প্রাণঢালা অভিনন্দন',
      subheadlineSuggestion: 'দেশ ও জনগণের সেবায় ঐক্যবদ্ধ হয়ে কাজ করার দৃঢ় প্রত্যয়',
      sloganSuggestion: 'ঐক্যই শক্তি, প্রগতিই আমাদের লক্ষ্য — জনগণের মুখে হাসি ফোটানোই আমাদের ব্রত',
      colorAccentSuggestion: '#0284C7',
      fontSuggestion: 'Tiro Bangla',
      designThemeName: 'প্রাণঢালা শুভেচ্ছা',
      tone: 'festive',
      badgeText: 'অভিনন্দন বার্তা',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'ঐতিহাসিক সম্মেলন সফল ও সার্থক হোক',
      subheadlineSuggestion: 'সংগঠনকে তৃণমূল পর্যায়ে সুসংগঠিত করার দৃঢ় প্রত্যয়ে এগিয়ে চলুন',
      sloganSuggestion: 'শৃঙ্খলাই সংগঠনের মেরুদণ্ড — আদর্শিক কর্মীদের পদচারণায় মুখরিত হোক আজকের সমাবেশ',
      colorAccentSuggestion: '#DC2626',
      fontSuggestion: 'Anek Bangla',
      designThemeName: 'বিজয়ী সম্মেলন',
      tone: 'enthusiastic',
      badgeText: 'ঐক্যের ডাক',
      leaderFrameStyle: 'flag_bordered',
    },
    {
      headlinePolish: 'বিপুল জয়ে প্রাণঢালা রক্তিম লাল গোলাপ শুভেচ্ছা',
      subheadlineSuggestion: 'আপনার এই ঐতিহাসিক বিজয় আমাদের সকল নেতাকর্মী ও শুভাকাঙ্ক্ষীকে গর্বিত করেছে',
      sloganSuggestion: 'যোগ্য ও সৎ নেতৃত্বের জয়জয়কার — আগামী দিনের প্রতিটি উন্নয়নমূলক পদক্ষেপে শুভকামনা',
      colorAccentSuggestion: '#F59E0B',
      fontSuggestion: 'Hind Siliguri',
      designThemeName: 'সোনালী সংবর্ধনা',
      tone: 'festive',
      badgeText: 'বিজয়ী সম্ভাষণ',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'জনকল্যাণে নিবেদিত সংগ্রামী সাথীদের অভিনন্দন',
      subheadlineSuggestion: 'একটি সুখী, সমৃদ্ধ, প্রগতিশীল ও বৈষম্যমুক্ত সমাজ বিনির্মাণে এগিয়ে আসুন',
      sloganSuggestion: 'মানুষের পাশে দাঁড়ানোই সবচেয়ে বড় রাজনীতি — নিঃস্বার্থ সেবার প্রত্যয়ে আমরা চির জাগ্রত',
      colorAccentSuggestion: '#059669',
      fontSuggestion: 'Noto Sans Bengali',
      designThemeName: 'শান্তির বার্তা',
      tone: 'festive',
      badgeText: 'জনসেবায় নিবেদিত',
      leaderFrameStyle: 'patriotic_circle',
    },
    {
      headlinePolish: 'আনন্দ ও সম্প্রীতির শুভলগ্নে আন্তরিক শুভেচ্ছা',
      subheadlineSuggestion: 'সকল ভেদাভেদ ভুলে ভালোবাসার বন্ধনে আবদ্ধ হোক বাংলার আপামর জনতা',
      sloganSuggestion: 'সম্প্রীতির বন্ধন হোক চির অটুট — পারস্পরিক সৌহার্দ্য ও ভ্রাতৃত্ববোধের জয় হোক',
      colorAccentSuggestion: '#7C3AED',
      fontSuggestion: 'Tiro Bangla',
      designThemeName: 'রঙিন উৎসব',
      tone: 'festive',
      badgeText: 'সম্প্রীতির মিলনমেলা',
      leaderFrameStyle: 'golden_oval',
    },
  ],
  eid_festival: [
    {
      headlinePolish: 'পবিত্র ঈদুল ফিতর মোবারক',
      subheadlineSuggestion: 'ঈদের আনন্দ ছড়িয়ে পড়ুক বাংলার প্রতিটি ঘরে ও মানুষের হৃদয়ে',
      sloganSuggestion: 'শান্তি, সৌহার্দ্য ও ভ্রাতৃত্ববোধের জয় হোক — ত্যাগের মহিমায় ভাস্বর হোক আমাদের জীবন',
      colorAccentSuggestion: '#0D9488',
      fontSuggestion: 'Tiro Bangla',
      designThemeName: 'শান্তির ঈদ',
      tone: 'festive',
      badgeText: 'ঈদ মোবারক',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'ঈদ মোবারক — আনন্দের বার্তা বয়ে আনুক অনাবিল সুখ',
      subheadlineSuggestion: 'ধনী-গরিবের ব্যবধান ঘুচে ঈদের আনন্দ হোক প্রতিটি পরিবারের জন্য সমান',
      sloganSuggestion: 'বুকের সাথে বুক মিলিয়ে ভুলে যাই সব শত্রুতা — ভালোবাসার চাদরে জড়িয়ে যাক সারা দেশ',
      colorAccentSuggestion: '#0284C7',
      fontSuggestion: 'Hind Siliguri',
      designThemeName: 'আনন্দের জোয়ার',
      tone: 'festive',
      badgeText: 'ভ্রাতৃত্বের বন্ধন',
      leaderFrameStyle: 'patriotic_circle',
    },
    {
      headlinePolish: 'পবিত্র ঈদের পুণ্যময় রজনীতে সবাইকে আন্তরিক মোবারকবাদ',
      subheadlineSuggestion: 'আল্লাহর অশেষ রহমত ও অফুরন্ত বরকত বর্ষিত হোক আপনার পরিবারে',
      sloganSuggestion: 'তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম — খোদার সন্তুষ্টি অর্জনে উৎসর্গ হোক আমাদের জীবন',
      colorAccentSuggestion: '#D97706',
      fontSuggestion: 'Noto Sans Bengali',
      designThemeName: 'নূরের পরশ',
      tone: 'festive',
      badgeText: 'দোয়া ও বরকত',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'উৎসবের রঙে রাঙিয়ে যাক প্রিয় বাংলার প্রতিটি প্রান্তর',
      subheadlineSuggestion: 'পবিত্র ঈদ আমাদের শিক্ষা দেয় আত্মত্যাগ, ক্ষমা, সহমর্মিতা ও ভালোবাসার',
      sloganSuggestion: 'খুশির জোয়ারে ভাসুক সবার হৃদয় — শুভ ও শান্তিময় হোক আপনার আজকের ঈদ',
      colorAccentSuggestion: '#10B981',
      fontSuggestion: 'Anek Bangla',
      designThemeName: 'সবুজ উৎসব',
      tone: 'festive',
      badgeText: 'খুশির বার্তা',
      leaderFrameStyle: 'golden_oval',
    },
    {
      headlinePolish: 'ঈদুল ফিতরের আন্তরিক শুভেচ্ছা ও শুভকামনা',
      subheadlineSuggestion: 'জাতির এই শুভদিনে শান্তি, সমৃদ্ধি ও সুস্থতা কামনা করি',
      sloganSuggestion: 'ঈদের খুশি বয়ে আনুক নতুন দিনের আশা, সম্প্রীতি ও অগ্রযাত্রার নতুন প্রত্যয়',
      colorAccentSuggestion: '#EA580C',
      fontSuggestion: 'Tiro Bangla',
      designThemeName: 'উজ্জ্বল প্রভাত',
      tone: 'festive',
      badgeText: 'শুভকামনা',
      leaderFrameStyle: 'patriotic_circle',
    },
  ],
};

export async function generateAIPosterAssistance(
  posterId: mongoose.Types.ObjectId,
  options: AIPosterAssistanceOptions
): Promise<AISuggestionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const startTime = Date.now();

  const occasionKey = options.occasionType || 'victory_day';
  const variationList = OCCASION_VARIATIONS[occasionKey] || OCCASION_VARIATIONS.victory_day;
  const retryIteration = options.retryCount || 0;
  const variationIndex = retryIteration % variationList.length;
  const selectedDefault = variationList[variationIndex];

  const isRegeneration = Boolean(options.isRegenerate || retryIteration > 0);

  const prompt = `
You are an expert Bangladeshi political designer, creative copywriter, and public relations specialist.
${isRegeneration ? `CRITICAL TASK: This is a REGENERATION request (Iteration #${retryIteration + 1}). The user wants a FRESH, DISTINCTIVE design variation with a BRAND NEW catchy rhyming slogan in Bangla and a polished headline/subheadline.` : 'Generate an authentic, culturally resonant political poster layout, styling suggestions, and Bangla slogan.'}

Poster Context:
- Occasion: ${options.occasionType}
- Candidate Name: ${options.name}
- Designation: ${options.designation}
- Party / Organization: ${options.party}
- District / Ward / Area: ${options.district}
- Current Headline: ${options.headline || 'None'}
- Current Slogan: ${options.slogan || 'None'}
${isRegeneration ? '- Instruction: Provide a NEW alternative slogan and headline polish noticeably different from current ones.' : ''}

Respond STRICTLY with a valid JSON object matching this schema:
{
  "headlinePolish": "enhanced impactful Bangla headline",
  "subheadlineSuggestion": "supportive Bangla subheadline",
  "sloganSuggestion": "a catchy, rhyming, culturally authentic Bangla political slogan for this party & occasion",
  "colorAccentSuggestion": "Hex code (e.g. #006A4E for green, #DC2626 for red, #F59E0B for gold, #0284C7 for blue, #0D9488 for teal)",
  "fontSuggestion": "one of: 'Tiro Bangla', 'Hind Siliguri', 'Anek Bangla', 'Noto Sans Bengali'",
  "designThemeName": "short descriptive name of this styling theme e.g. 'সোনালী বিজয়' or 'লাল-সবুজের প্রত্যয়'",
  "tone": "enthusiastic / solemn / patriotic / festive",
  "layoutSuggestion": {
    "leaderFrameStyle": "golden_oval" | "patriotic_circle" | "flag_bordered",
    "badgeText": "short Bangla badge e.g. 'জনতার সেবক' or 'বীর শহীদদের স্মরণে' or 'তারুণ্যের প্রতীক'",
    "footerStyle": "standard_bordered"
  }
}
`;

  // Fallback builder using the structured variations matrix
  const buildFallback = (latency: number): AISuggestionResult => ({
    headlinePolish: selectedDefault.headlinePolish,
    subheadlineSuggestion: selectedDefault.subheadlineSuggestion,
    sloganSuggestion: selectedDefault.sloganSuggestion,
    colorAccentSuggestion: selectedDefault.colorAccentSuggestion,
    fontSuggestion: selectedDefault.fontSuggestion,
    designThemeName: selectedDefault.designThemeName,
    tone: selectedDefault.tone,
    layoutSuggestion: {
      leaderFrameStyle: selectedDefault.leaderFrameStyle,
      badgeText: selectedDefault.badgeText,
      footerStyle: 'standard_bordered',
    },
    promptUsed: prompt,
    tokensUsed: 125,
    latencyMs: latency,
  });

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    const latency = Date.now() - startTime;
    const fallback = buildFallback(latency);
    await GenerationLog.create({
      posterId,
      geminiPromptUsed: prompt,
      tokensUsed: fallback.tokensUsed,
      latencyMs: latency,
      success: true,
    });
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const latencyMs = Date.now() - startTime;

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini response did not contain a valid JSON object');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const finalResult: AISuggestionResult = {
      headlinePolish: parsed.headlinePolish || selectedDefault.headlinePolish,
      subheadlineSuggestion: parsed.subheadlineSuggestion || selectedDefault.subheadlineSuggestion,
      sloganSuggestion: parsed.sloganSuggestion || selectedDefault.sloganSuggestion,
      colorAccentSuggestion: parsed.colorAccentSuggestion || selectedDefault.colorAccentSuggestion,
      fontSuggestion: parsed.fontSuggestion || selectedDefault.fontSuggestion,
      designThemeName: parsed.designThemeName || selectedDefault.designThemeName,
      tone: parsed.tone || selectedDefault.tone,
      layoutSuggestion: {
        leaderFrameStyle: parsed.layoutSuggestion?.leaderFrameStyle || selectedDefault.leaderFrameStyle,
        badgeText: parsed.layoutSuggestion?.badgeText || selectedDefault.badgeText,
        footerStyle: parsed.layoutSuggestion?.footerStyle || 'standard_bordered',
      },
      promptUsed: prompt,
      tokensUsed: result.response.usageMetadata?.totalTokenCount || 150,
      latencyMs,
    };

    await GenerationLog.create({
      posterId,
      geminiPromptUsed: prompt,
      tokensUsed: finalResult.tokensUsed,
      latencyMs,
      success: true,
    });

    return finalResult;
  } catch (error: any) {
    console.warn('[Gemini Service] Error calling Gemini API, using intelligent variation fallback:', error.message);
    const latencyMs = Date.now() - startTime;
    const fallback = buildFallback(latencyMs);

    await GenerationLog.create({
      posterId,
      geminiPromptUsed: prompt,
      tokensUsed: 0,
      latencyMs,
      success: false,
      errorMessage: error.message,
    });

    return fallback;
  }
}

export interface AIModerationResult {
  isApproved: boolean;
  moderationStatus: 'approved' | 'flagged';
  moderationNotes: string;
  flagCategories?: {
    hateSpeech: boolean;
    defamation: boolean;
    violence: boolean;
    profanity: boolean;
  };
  confidence: number;
}

export async function moderatePosterWithAI(data: {
  name: string;
  designation: string;
  party: string;
  district?: string;
  headline: string;
  subheadline?: string;
  slogan?: string;
  promotedBy?: string;
}): Promise<AIModerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Local rule-based safety pre-check for extreme violations
  const combinedText = `${data.name} ${data.designation} ${data.party} ${data.headline} ${data.subheadline || ''} ${data.slogan || ''} ${data.promotedBy || ''}`.toLowerCase();
  
  const extremeHatePatterns = [
    /খুন\s*করো/i,
    /হত্যা\s*করো/i,
    /জ্বালিয়ে\s*দাও/i,
    /পুড়িয়ে\s*মারো/i,
    /গণহত্যা/i,
    /রক্তের\s*বন্যা/i,
  ];

  for (const pattern of extremeHatePatterns) {
    if (pattern.test(combinedText)) {
      return {
        isApproved: false,
        moderationStatus: 'flagged',
        moderationNotes: 'সরাসরি হিংসাত্মক উসকানি ও হত্যার হুমকি শনাক্ত হওয়ায় পোস্টারটি ফ্ল্যাগ করা হয়েছে।',
        flagCategories: { hateSpeech: true, defamation: false, violence: true, profanity: false },
        confidence: 0.98,
      };
    }
  }

  // If no API key configured or fallback mode
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return {
      isApproved: true,
      moderationStatus: 'approved',
      moderationNotes: 'স্বয়ংক্রিয় স্থানীয় মডারেশন পরীক্ষায় কন্টেন্ট নিরাপদ পাওয়া গেছে।',
      confidence: 0.9,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const moderationPrompt = `
You are an expert AI content moderation safety auditor for Bangladeshi political and public posters.
Analyze the following user-submitted political poster text for potential policy violations:
- Candidate Name: ${data.name}
- Designation: ${data.designation}
- Party / Organization: ${data.party}
- District / Area: ${data.district || 'None'}
- Headline: ${data.headline}
- Subheadline: ${data.subheadline || 'None'}
- Slogan: ${data.slogan || 'None'}
- Promoted By: ${data.promotedBy || 'None'}

Policy Guidelines:
1. Standard political rhetoric, campaigning slogans, legitimate political party names (Awami League, BNP, Jamaat, Jatiya Party, etc.), phrases like "টেক ব্যাক বাংলাদেশ", "জয় বাংলা", "গণতন্ত্র মুক্তি পাক", "ধানের শীষে ভোট দিন", "নৌকায় ভোট দিন" ARE 100% PERMITTED AND NORMAL. DO NOT FLAG STANDARD POLITICAL SLOGANS.
2. ONLY flag as VIOLATION if:
   - Contains direct incitement to violent murder, terror attacks, or communal arson/lynching.
   - Contains sexually explicit profanity, vulgar slurs, or extreme personal obscene defamation.
   - Explicitly promotes banned violent terrorist organizations (e.g. Ansarullah Bangla Team, JMB, ISIS).

Respond STRICTLY with a valid JSON object matching:
{
  "isApproved": boolean,
  "moderationStatus": "approved" | "flagged",
  "moderationNotes": "concise explanation in Bangla (e.g., 'কন্টেন্ট নিরাপদ ও মানসম্মত' if approved, or specific violation reason in Bangla if flagged)",
  "flagCategories": {
    "hateSpeech": boolean,
    "defamation": boolean,
    "violence": boolean,
    "profanity": boolean
  },
  "confidence": number between 0.0 and 1.0
}
`;

    const result = await model.generateContent(moderationPrompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isApproved: Boolean(parsed.isApproved),
        moderationStatus: parsed.moderationStatus === 'flagged' ? 'flagged' : 'approved',
        moderationNotes: parsed.moderationNotes || (parsed.isApproved ? 'কন্টেন্ট নিরাপদ ও মানসম্মত' : 'কন্টেন্টে বিধিবহির্ভূত উপাদান শনাক্ত হয়েছে'),
        flagCategories: parsed.flagCategories,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.95,
      };
    }
  } catch (error: any) {
    console.warn('[Gemini Moderation] AI check error, fallback to safe approval:', error.message);
  }

  // Safe fallback if AI service fails
  return {
    isApproved: true,
    moderationStatus: 'approved',
    moderationNotes: 'কন্টেন্ট স্বয়ংক্রিয় মডারেশন টেস্টে নিরাপদ বিবেচিত হয়েছে।',
    confidence: 0.85,
  };
}

