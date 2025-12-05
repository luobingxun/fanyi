import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITranslationTask extends Document {
  projectId: mongoose.Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalCount: number;
  successCount: number;
  failCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TranslationTaskSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  totalCount: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failCount: { type: Number, default: 0 },
}, { timestamps: true });

// Force model recompilation in development to pick up schema changes
if (process.env.NODE_ENV === 'development') {
  if (mongoose.models.TranslationTask) {
    delete mongoose.models.TranslationTask;
  }
}

const TranslationTask: Model<ITranslationTask> = mongoose.models.TranslationTask || mongoose.model<ITranslationTask>('TranslationTask', TranslationTaskSchema);
export default TranslationTask;
