import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  apiKey?: string;
  apiSecret?: string;
  prompt?: string;
}

const SettingsSchema: Schema = new Schema({
  apiKey: { type: String },
  apiSecret: { type: String },
  prompt: { type: String },
}, { timestamps: true });

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings;
