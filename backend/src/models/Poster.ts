import mongoose, { Document, Schema } from 'mongoose';

export interface IPosterFormData {
  name: string;
  designation: string; // পদবি
  party: string; // দল / সংগঠন
  district: string; // ইউনিয়ন/থানা/জেলা
  occasionType: string;
  headline: string; // Bangla headline text e.g. "মহান বিজয় দিবস"
  subheadline?: string;
  promotedBy: string; // প্রচারে credit line e.g. "এলাকাবাসীর পক্ষে", "বাংলাদেশ ছাত্রলীগ", etc.
  slogan?: string;
  candidatePhotoUrl?: string;
  leader1PhotoUrl?: string;
  leader2PhotoUrl?: string;
  customBanglaFont?: string;
  customColorAccent?: string;
}

export interface IPoster extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  formData: IPosterFormData;
  uploadedPhotoUrls: string[];
  generatedImageUrl: string;
  pdfUrl?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  retryCount: number;
  aiSuggestions?: {
    sloganSuggestion?: string;
    colorAccentSuggestion?: string;
    tone?: string;
  };
  moderationStatus: 'approved' | 'pending' | 'flagged';
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PosterSchema = new Schema<IPoster>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    formData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    uploadedPhotoUrls: {
      type: [String],
      default: [],
    },
    generatedImageUrl: {
      type: String,
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'generating', 'completed', 'failed'],
      default: 'draft',
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    aiSuggestions: {
      type: Schema.Types.Mixed,
      default: {},
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'flagged'],
      default: 'approved',
      index: true,
    },
    moderationNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Poster = mongoose.model<IPoster>('Poster', PosterSchema);
