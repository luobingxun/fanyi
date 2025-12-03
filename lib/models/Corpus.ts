import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICorpus extends Document {
  projectId: mongoose.Types.ObjectId;
  key: string; // or source text
  data: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const CorpusSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  key: { type: String, required: true },
  data: { type: Map, of: String, default: {} },
}, { timestamps: true });

CorpusSchema.index({ projectId: 1, key: 1 }, { unique: true });

const Corpus: Model<ICorpus> = mongoose.models.Corpus || mongoose.model<ICorpus>('Corpus', CorpusSchema);
export default Corpus;
