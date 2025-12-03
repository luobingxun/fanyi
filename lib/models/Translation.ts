import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITranslation extends Document {
  projectId: mongoose.Types.ObjectId;
  key: string;
  data: Record<string, string>; // e.g. { en: 'Hello', zh: '你好' }
  createdAt: Date;
  updatedAt: Date;
}

const TranslationSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  key: { type: String, required: true },
  data: { type: Map, of: String, default: {} },
}, { timestamps: true });

// Compound index for uniqueness of key within a project
TranslationSchema.index({ projectId: 1, key: 1 }, { unique: true });

const Translation: Model<ITranslation> = mongoose.models.Translation || mongoose.model<ITranslation>('Translation', TranslationSchema);
export default Translation;
