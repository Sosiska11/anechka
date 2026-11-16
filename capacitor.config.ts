import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biology.teacher.app',
  appName: 'анечка приложение пользоваться бесплатно без интернета',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      iconColor: '#059669',
    },
  },
};

export default config;

