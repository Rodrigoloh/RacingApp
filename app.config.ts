// Note: dotenv is optional. Remove hard import to avoid EAS config parse errors before deps are installed.

export default ({ config }: any) => ({
  ...config,
  name: "RacingApp",
  slug: "racingapp",
  scheme: "racingapp",
  version: "1.0.0",
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
    ]
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
