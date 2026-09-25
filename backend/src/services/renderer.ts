import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { IPoster } from '../models/Poster';
import { ITemplate } from '../models/Template';

export async function renderPosterImage(poster: IPoster, template: ITemplate): Promise<string> {
  const width = 1200;
  const height = 1600;

  const postersDir = path.join(process.cwd(), 'uploads', 'posters');
  if (!fs.existsSync(postersDir)) {
    fs.mkdirSync(postersDir, { recursive: true });
  }

  const outputFileName = `poster-${poster._id}-${Date.now()}.png`;
  const outputPath = path.join(postersDir, outputFileName);

  const colors = template.layoutConfig.colorScheme || {
    primary: '#006A4E',
    secondary: '#F42A41',
    accent: '#F59E0B',
    backgroundGradient: ['#003829', '#001A13'],
    textColor: '#FFFFFF',
    headerBannerBg: '#F42A41',
  };

  const formData = poster.formData;
  const bg1 = colors.backgroundGradient[0] || '#004225';
  const bg2 = colors.backgroundGradient[1] || '#00180F';
  const primaryColor = poster.formData.customColorAccent || colors.primary || '#006A4E';
  const redColor = colors.secondary || '#F42A41';
  const goldColor = colors.accent || '#F59E0B';

  // Sanitize text for SVG
  const escapeXml = (unsafe: string) => {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const headline = escapeXml(formData.headline || template.title);
  const subheadline = escapeXml(formData.subheadline || 'মহান দেশপ্রেম ও সেবার প্রত্যয়ে');
  const name = escapeXml(formData.name || 'সম্মানিত প্রার্থী');
  const designation = escapeXml(formData.designation || 'রাজনৈতিক কর্মী');
  const party = escapeXml(formData.party || 'বাংলাদেশ');
  const district = escapeXml(formData.district || 'ঢাকা, বাংলাদেশ');
  const promotedBy = escapeXml(formData.promotedBy || 'সকল সচেতন দেশবাসীর পক্ষে');
  const slogan = escapeXml(formData.slogan || poster.aiSuggestions?.sloganSuggestion || 'দেশ ও মানুষের কল্যাণে নিবেদিত প্রাণ');

  // Read or encode candidate image if provided locally or use a decorative placeholder avatar
  let candidateImgBase64 = '';
  if (formData.candidatePhotoUrl) {
    try {
      const localCandidatePath = path.isAbsolute(formData.candidatePhotoUrl)
        ? formData.candidatePhotoUrl
        : path.join(process.cwd(), formData.candidatePhotoUrl.replace(/^\//, ''));
      if (fs.existsSync(localCandidatePath)) {
        const buffer = fs.readFileSync(localCandidatePath);
        candidateImgBase64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      }
    } catch (e) {
      console.warn('Could not read candidate photo locally:', e);
    }
  }

  // Generate SVG string representing Bangladeshi political poster architecture
  const svgContent = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bg1}" />
      <stop offset="60%" stop-color="${bg2}" />
      <stop offset="100%" stop-color="#050C09" />
    </linearGradient>

    <!-- Golden Frame Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE259" />
      <stop offset="50%" stop-color="#FFA751" />
      <stop offset="100%" stop-color="#FFD700" />
    </linearGradient>

    <!-- Patriotic Ribbon Gradient -->
    <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${redColor}" />
      <stop offset="50%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="${redColor}" />
    </linearGradient>

    <!-- Radial Glow for Leaders -->
    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFEB3B" stop-opacity="0.8" />
      <stop offset="70%" stop-color="#F57C00" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#E65100" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadows -->
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
    <filter id="textGlow">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.9"/>
    </filter>
  </defs>

  <!-- Main Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- National Flag Circle Motif in Background -->
  <circle cx="600" cy="500" r="380" fill="${redColor}" opacity="0.18" />
  <circle cx="600" cy="500" r="280" fill="#FFC107" opacity="0.08" />

  <!-- Ornate Border Frames -->
  <rect x="25" y="25" width="${width - 50}" height="${height - 50}" fill="none" stroke="url(#goldGrad)" stroke-width="6" rx="16" />
  <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" rx="12" />

  <!-- Corner Floral Ornaments -->
  <g fill="${goldColor}" opacity="0.85">
    <path d="M 45 45 L 90 45 A 45 45 0 0 1 45 90 Z" />
    <path d="M 1155 45 L 1110 45 A 45 45 0 0 0 1155 90 Z" />
    <path d="M 45 1555 L 90 1555 A 45 45 0 0 0 45 1510 Z" />
    <path d="M 1155 1555 L 1110 1555 A 45 45 0 0 1 1155 1510 Z" />
  </g>

  <!-- Top Holy/Motto Banner -->
  <rect x="350" y="55" width="500" height="42" rx="21" fill="#000000" opacity="0.4" />
  <text x="600" y="83" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="20" font-weight="bold" fill="#FDE047" text-anchor="middle">
    বিসমিল্লাহির রাহমানির রাহিম
  </text>

  <!-- Top Leader Photo Cutout Slots (Authentic Duo/Trio Layout) -->
  <g transform="translate(0, 115)">
    <!-- Leader 1 (Left Oval) -->
    <circle cx="360" cy="110" r="95" fill="url(#sunGlow)" />
    <circle cx="360" cy="110" r="88" fill="#1E293B" stroke="url(#goldGrad)" stroke-width="7" filter="url(#dropShadow)" />
    <circle cx="360" cy="110" r="82" fill="#0F172A" />
    <text x="360" y="118" font-family="'Hind Siliguri', sans-serif" font-size="18" fill="#E2E8F0" text-anchor="middle">শীর্ষ নেতা ১</text>

    <!-- Central Party Flag / Emblem -->
    <circle cx="600" cy="100" r="60" fill="${primaryColor}" stroke="url(#goldGrad)" stroke-width="5" filter="url(#dropShadow)" />
    <circle cx="600" cy="100" r="32" fill="${redColor}" />
    <text x="600" y="107" font-family="'Hind Siliguri', sans-serif" font-size="15" font-weight="bold" fill="#FFFFFF" text-anchor="middle">বাংলাদেশ</text>

    <!-- Leader 2 (Right Oval) -->
    <circle cx="840" cy="110" r="95" fill="url(#sunGlow)" />
    <circle cx="840" cy="110" r="88" fill="#1E293B" stroke="url(#goldGrad)" stroke-width="7" filter="url(#dropShadow)" />
    <circle cx="840" cy="110" r="82" fill="#0F172A" />
    <text x="840" y="118" font-family="'Hind Siliguri', sans-serif" font-size="18" fill="#E2E8F0" text-anchor="middle">শীর্ষ নেতা ২</text>
  </g>

  <!-- Occasion Headline Curved Ribbon Banner -->
  <g transform="translate(0, 340)">
    <!-- Banner Shadow & Shape -->
    <path d="M 120 40 L 200 0 L 1000 0 L 1080 40 L 1000 80 L 200 80 Z" fill="url(#ribbonGrad)" filter="url(#dropShadow)" />
    <path d="M 120 40 L 150 15 L 200 0 L 170 30 Z" fill="#991B1B" />
    <path d="M 1080 40 L 1050 15 L 1000 0 L 1030 30 Z" fill="#991B1B" />

    <!-- Headline Bangla Text -->
    <text x="600" y="52" font-family="'Tiro Bangla', 'Hind Siliguri', serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle" filter="url(#textGlow)">
      ${headline}
    </text>
  </g>

  <!-- Subheadline / Occasion Greetings -->
  <text x="600" y="460" font-family="'Hind Siliguri', sans-serif" font-size="28" font-weight="600" fill="#FDE047" text-anchor="middle" filter="url(#textGlow)">
    ${subheadline}
  </text>

  <!-- Central Candidate / User Frame Area -->
  <g transform="translate(0, 500)">
    <!-- Aura Ring -->
    <circle cx="600" cy="220" r="215" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-dasharray="10 8" opacity="0.6" />
    <!-- Outer Shield / Circle -->
    <circle cx="600" cy="220" r="200" fill="#13231B" stroke="url(#goldGrad)" stroke-width="10" filter="url(#dropShadow)" />

    ${
      candidateImgBase64
        ? `<clipPath id="candidateClip"><circle cx="600" cy="220" r="195" /></clipPath>
           <image href="${candidateImgBase64}" x="405" y="25" width="390" height="390" preserveAspectRatio="xMidYMid slice" clip-path="url(#candidateClip)" />`
        : `<!-- Placeholder Avatar Silhouette -->
           <circle cx="600" cy="180" r="80" fill="#2E473B" />
           <path d="M 430 370 C 430 280, 520 260, 600 260 C 680 260, 770 280, 770 370 Z" fill="#2E473B" />
           <text x="600" y="240" font-family="'Hind Siliguri', sans-serif" font-size="26" fill="#A7F3D0" text-anchor="middle">ছবি সংযুক্ত করুন</text>`
    }
  </g>

  <!-- Candidate Name & Designation Plaque -->
  <g transform="translate(0, 960)">
    <rect x="220" y="0" width="760" height="135" rx="16" fill="#022C22" stroke="url(#goldGrad)" stroke-width="4" filter="url(#dropShadow)" />
    <!-- Candidate Name -->
    <text x="600" y="55" font-family="'Hind Siliguri', 'Noto Sans Bengali', sans-serif" font-size="46" font-weight="bold" fill="#FFFFFF" text-anchor="middle" filter="url(#textGlow)">
      ${name}
    </text>
    <!-- Designation & Party -->
    <text x="600" y="102" font-family="'Hind Siliguri', sans-serif" font-size="26" font-weight="600" fill="#FBBF24" text-anchor="middle">
      ${designation}, ${party}
    </text>
  </g>

  <!-- Area / District & Slogan Section -->
  <g transform="translate(0, 1120)">
    <!-- Location Badge -->
    <rect x="360" y="0" width="480" height="42" rx="21" fill="#1E293B" stroke="#64748B" stroke-width="1.5" />
    <text x="600" y="28" font-family="'Hind Siliguri', sans-serif" font-size="20" fill="#93C5FD" text-anchor="middle">
      📍 ${district}
    </text>

    <!-- Inspiring Slogan (AI generated or user provided) -->
    <rect x="150" y="65" width="900" height="70" rx="12" fill="#000000" opacity="0.45" />
    <text x="600" y="110" font-family="'Hind Siliguri', sans-serif" font-size="25" font-style="italic" fill="#F8FAFC" text-anchor="middle">
      "${slogan}"
    </text>
  </g>

  <!-- Authentic Footer "প্রচারে" (Promoted By) Section -->
  <g transform="translate(0, 1310)">
    <!-- Upper divider line -->
    <line x1="80" y1="0" x2="1120" y2="0" stroke="url(#goldGrad)" stroke-width="3" />

    <!-- Red Banner with Promoted By Info -->
    <rect x="70" y="20" width="1060" height="160" rx="14" fill="url(#ribbonGrad)" stroke="url(#goldGrad)" stroke-width="3" filter="url(#dropShadow)" />

    <!-- Promoted By Header Pill -->
    <rect x="500" y="38" width="200" height="38" rx="19" fill="#FFFFFF" />
    <text x="600" y="64" font-family="'Hind Siliguri', sans-serif" font-size="22" font-weight="900" fill="${redColor}" text-anchor="middle">
      - প্রচারে -
    </text>

    <!-- Promoted By Text -->
    <text x="600" y="118" font-family="'Hind Siliguri', sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle" filter="url(#textGlow)">
      ${promotedBy}
    </text>
    <text x="600" y="152" font-family="'Hind Siliguri', sans-serif" font-size="18" fill="#FEF08A" text-anchor="middle">
      ${district} | সর্বস্তরের জনগণ ও সমর্থকবৃন্দ
    </text>
  </g>

  <!-- Watermark / Footer credits -->
  <text x="600" y="1565" font-family="Arial, sans-serif" font-size="14" fill="#94A3B8" opacity="0.6" text-anchor="middle">
    AI Political Poster Maker Bangladesh • Print-Ready 1200x1600 Standard
  </text>
</svg>
`;

  // Render high-res PNG using Sharp
  const svgBuffer = Buffer.from(svgContent);
  await sharp(svgBuffer)
    .resize(width, height)
    .png({ quality: 95 })
    .toFile(outputPath);

  return `/uploads/posters/${outputFileName}`;
}
