import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import { publishScheduledPosts } from './controllers/blog.controller';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Check and publish scheduled posts every 60 seconds
    setInterval(async () => {
      const publishedCount = await publishScheduledPosts();
      if (publishedCount > 0) {
        console.log(`[Scheduler] Published ${publishedCount} scheduled blog posts.`);
      }
    }, 60000);
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

