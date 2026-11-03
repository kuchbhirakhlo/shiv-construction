import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shivconstruction/core/constants/app_strings.dart';
import 'package:shivconstruction/core/routing/app_router.dart';
import 'package:shivconstruction/core/session/customer_session.dart';
import 'package:shivconstruction/core/session/staff_session.dart';
import 'package:shivconstruction/core/theme/app_theme.dart';
import 'package:shivconstruction/firebase_options.dart';
import 'package:shivconstruction/injection.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await setupDependencies();
  runApp(ShivConstructApp(router: buildAppRouter(sl<StaffSession>(), sl<CustomerSession>())));
}

class ShivConstructApp extends StatelessWidget {
  final GoRouter router;

  const ShivConstructApp({super.key, required this.router});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppStrings.appName,
      theme: AppTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
