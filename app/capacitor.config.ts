import type { CapacitorConfig } from "@capacitor/cli";

// KartPilot Android kabuğu — SSR uygulama olduğu için native kabuk canlı siteyi
// yükler (server.url). Web'deki her dağıtım, APK yeniden derlemeden anında yansır.
// Yerelde test için: server.url'i http://10.0.2.2:8080 (emülatör) yapıp
// `npm run dev`i çalıştırabilirsin; sonra geri al.
const config: CapacitorConfig = {
  appId: "com.kartpilot.app",
  appName: "KartPilot",
  webDir: "native-shell",
  server: {
    url: "https://cards-calendar.vercel.app",
    androidScheme: "https",
  },
  android: {
    // Donanım hızlandırma + modern WebView varsayılanları yeterli
    backgroundColor: "#f7f7f5",
  },
};

export default config;
