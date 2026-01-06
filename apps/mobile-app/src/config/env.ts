export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  ENV: process.env.EXPO_PUBLIC_ENV || 'development',
} as const;
