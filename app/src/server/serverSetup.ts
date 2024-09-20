import cors from 'cors';
import { config } from 'wasp/server';

// Function to configure global middleware
export const serverMiddlewareFn = (middlewareConfig: any) => {
  // Modify CORS settings or other middleware here
  middlewareConfig.set('cors', cors({ origin: [config.frontendUrl, 'https://fuzzy-space-tribble-5p9pp9547v637p95-3001.app.github.dev/' ] }));
  return middlewareConfig;
};

// Any other setup logic
export default function setup(context: any) {
  // Your setup code here
  console.log('Server setup complete');
}