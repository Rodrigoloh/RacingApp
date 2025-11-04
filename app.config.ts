// Note: dotenv is optional. Remove hard import to avoid EAS config parse errors before deps are installed.

export default ({ config }: any) => ({
  ...config,
  name: "RacingApp",
  slug: "racingapp",
  scheme: "racingapp",
  version: "1.0.0",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000"
  },
  extra: {
    eas: { projectId: "3d674891-82ce-4355-b1f1-d4b1cd6c7c5a" }
  },
  ios: {
    bundleIdentifier: "com.tuempresa.racingapp",
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription: "Necesitamos tu ubicación para cronometrar en pista.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "Necesitamos tu ubicación para cronometrar en pista.",
      UIBackgroundModes: ["location"]
    }
  },
  android: {
    package: "com.tuempresa.racingapp",
    versionCode: 1,
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "FOREGROUND_SERVICE"
    ],
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      monochromeImage: "./assets/adaptive-icon-mono.png",
      backgroundColor: "#000000"
    }
  },
  plugins: [
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "La app necesita tu ubicación para cronometrar laps en pista.",
        "isAndroidForegroundServiceEnabled": true
      }
    ],
    "expo-sqlite"
  ]
});
