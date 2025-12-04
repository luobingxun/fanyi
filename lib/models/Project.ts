import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  languages: string[];
  apiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  languages: { type: [String], default: ['en', 'zh'] },
  apiKey: { type: String },
}, { timestamps: true });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
