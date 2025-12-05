
import mongoose from 'mongoose';
import Project from './lib/models/Project';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

async function checkProject() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    const id = '69327901171a434bdb60895b'; // ID from previous logs
    // If that ID is wrong, we can list all projects
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects`);
    
    // Try to update the project
    if (projects.length > 0) {
        const p = projects[0];
        console.log('Attempting to update project:', p._id);
        
        p.deepseekApiEndpoint = 'https://api.deepseek.com';
        p.deepseekApiSecret = 'test-secret';
        p.systemPrompt = 'test-prompt';
        
        await p.save();
        console.log('Update saved.');
        
        // Fetch again to verify
        const updated = await Project.findById(p._id);
        console.log('Updated DeepSeek Endpoint:', updated?.deepseekApiEndpoint);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkProject();
