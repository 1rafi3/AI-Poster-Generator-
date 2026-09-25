import mongoose, { Document, Schema } from 'mongoose';

export interface ILayoutConfig {
  photoSlots: {
    id: string;
    label: string; // e.g. "শীর্ষ নেতা ১", "শীর্ষ নেতা ২", "প্রার্থী/ব্যবহারকারী"
    role: 'leader1' | 'leader2' | 'candidate';
    shape: 'circle' | 'arch' | 'cutout';
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  }[];
  textSlots: {
    id: string;
    label: string;
    defaultText: string;
    fontSize: number;
    fontWeight?: string;
    color: string;
    align: 'center' | 'left' | 'right';
    xPercent: number;
    yPercent: number;
  }[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    backgroundGradient: [string, string];
    textColor: string;
    headerBannerBg?: string;
  };
  decorations: {
    hasFlagMotif: boolean;
    hasFloralBorder: boolean;
    hasPaddyOrDoves: boolean;
    bannerStyle: 'curved' | 'ribbon' | 'classic';
  };
}

export interface ITemplate extends Document {
  title: string;
  occasionType: 'victory_day' | 'condolence' | 'election' | 'greetings' | 'eid_festival';
  occasionLabelBangla: string;
  thumbnailUrl: string;
  layoutConfig: ILayoutConfig;
  isActive: boolean;
  createdAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    occasionType: {
      type: String,
      enum: ['victory_day', 'condolence', 'election', 'greetings', 'eid_festival'],
      required: true,
      index: true,
    },
    occasionLabelBangla: {
      type: String,
      required: true,
      default: 'সাধারণ',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    layoutConfig: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
