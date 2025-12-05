import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  languages: string[];
  sourceLanguage: string;
  deepseekApiEndpoint?: string;
  deepseekApiSecret?: string;
  systemPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  languages: { type: [String], default: ['en', 'zh'] },
  sourceLanguage: { type: String, default: 'zh' },
  apiKey: { type: String, unique: true },
  deepseekApiEndpoint: { type: String },
  deepseekApiSecret: { type: String },
  systemPrompt: { type: String },
}, { timestamps: true });

// Force model recompilation in development to pick up schema changes
if (process.env.NODE_ENV === 'development') {
  if (mongoose.models.Project) {
    delete mongoose.models.Project;
  }
}

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
