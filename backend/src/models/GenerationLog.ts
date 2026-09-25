import mongoose, { Document, Schema } from 'mongoose';

export interface IGenerationLog extends Document {
  posterId: mongoose.Types.ObjectId;
  geminiPromptUsed: string;
  tokensUsed: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const GenerationLogSchema = new Schema<IGenerationLog>(
  {
    posterId: {
      type: Schema.Types.ObjectId,
      ref: 'Poster',
      required: true,
      index: true,
    },
    geminiPromptUsed: {
      type: String,
      default: '',
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const GenerationLog = mongoose.model<IGenerationLog>('GenerationLog', GenerationLogSchema);
