// Hand-written from android/app/google-services.json for the
// shivconstruction-ad026 Firebase project (Android app only).
// iOS and web apps are not registered on ad026 yet — register them in the
// Firebase console (or scripts/register_apps.js with an ad026 service-account
// key) and add their options here before building for those platforms.
// ignore_for_file: type=lint
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError(
        'No web app is registered on shivconstruction-ad026 yet. '
        'Register one in the Firebase console and add its options here.',
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        throw UnsupportedError(
          'No iOS app is registered on shivconstruction-ad026 yet. '
          'Register one, add ios/Runner/GoogleService-Info.plist and its '
          'options here.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAT6E6pX-kmjrnjVuY5YLwwuXc-22XiOis',
    appId: '1:1080264611967:android:b11e56675b066d0b4c074a',
    messagingSenderId: '1080264611967',
    projectId: 'shivconstruction-ad026',
    storageBucket: 'shivconstruction-ad026.firebasestorage.app',
  );
}
