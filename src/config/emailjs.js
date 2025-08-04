// EmailJS Configuration
// Use environment variables for security in production

export const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_6c1oek2',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_czcbg15',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'LIWlUI0y2YhwQo4p_'
}

// Instructions:
// 1. Create a .env.local file in your project root with:
//    VITE_EMAILJS_SERVICE_ID=your_service_id_here
//    VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
//    VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
// 2. Add .env.local to your .gitignore file (already done)
// 3. For production, set these environment variables in your hosting platform 