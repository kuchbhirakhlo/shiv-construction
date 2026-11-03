import 'package:flutter/material.dart';

/// All color values used in the app as a single source of truth.
/// Semantic aliases reference the raw hex values defined here.
///
/// Palette matches the Shiv Construction website,
/// https://shivconstruction-liart.vercel.app/ (scraped via computed styles):
/// deep green primary buttons/headings (#1d5a3c, #173c2b, #244c37), gold
/// accent text and highlights (#bd8b21, #ae7c1d), a warm cream page
/// background (#fffefb) and slate body text (#0f172a / #475569).
class AppColorConstants {
  AppColorConstants._();

  // ─── Raw Palette ─────────────────────────────────────────────────────────────

  // Brand green (primary CTA buttons, headings)
  static const Color green400 = Color(0xFF2F6B47);
  static const Color green600 = Color(0xFF1D5A3C);
  static const Color green700 = Color(0xFF173C2B);
  static const Color greenBrandContainer = Color(0xFFE4EEE7);

  // Gold (eyebrows, highlighted headline words, badges)
  static const Color gold400 = Color(0xFFD5A536);
  static const Color gold500 = Color(0xFFBD8B21);
  static const Color gold600 = Color(0xFFAE7C1D);
  static const Color goldContainer = Color(0xFFF7EED9);

  // Forest Green (dark sections, footer)
  static const Color forestGreen900 = Color(0xFF12301F);
  static const Color forestGreen800 = Color(0xFF173C2B);
  static const Color forestGreen700 = Color(0xFF244C37);
  static const Color forestGreen500 = Color(0xFF426E63);
  static const Color forestGreenContainer = Color(0xFFE4EEE7);

  // Cream (page background)
  static const Color cream50 = Color(0xFFFFFEFB);
  static const Color cream100 = Color(0xFFF8F4E7);

  // Homepage section palette: alternating section backgrounds, dark/footer
  // greens, and the accent tones used on dark surfaces.
  static const Color sectionLight = Color(0xFFF8F6EE);
  static const Color sectionSubsidy = Color(0xFFFFFEFB);
  static const Color sectionCalc = Color(0xFFEFF3EA);
  static const Color sectionContact = Color(0xFFF8F6EE);
  static const Color sectionAward = Color(0xFFF8F4E7);
  static const Color topBarBg = Color(0xFFFFFEFB);
  static const Color footerGreen = Color(0xFF173C2B);
  static const Color subsidyCardGreen = Color(0xFF1D5A3C);
  static const Color amberOnDark = Color(0xFFE8C866);
  static const Color peachOnDark = Color(0xFFD5A536);
  static const Color whatsappGreen = Color(0xFF25A35A);
  static const Color cardBorder = Color(0xFFE9E5D9);
  static const Color inkText = Color(0xFF0F172A);
  static const Color mutedText = Color(0xFF475569);

  // Neutrals / Backgrounds
  static const Color white = Color(0xFFFFFFFF);
  static const Color gray50 = Color(0xFFF5F7FA);
  static const Color gray100 = Color(0xFFEEF1F5);
  static const Color gray200 = Color(0xFFE2E5EA);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray900 = Color(0xFF111827);
  static const Color black = Color(0xFF000000);

  // Status
  static const Color red500 = Color(0xFFDC2626);
  static const Color redContainer = Color(0xFFFDECEC);
  static const Color green500 = Color(0xFF1B7A3D);
  static const Color greenContainer = Color(0xFFE6F4EA);
  static const Color amber500 = Color(0xFFF59E0B);
  static const Color amberContainer = Color(0xFFFEF3E0);

  // ─── Semantic Aliases ─────────────────────────────────────────────────────────

  // Backgrounds
  static const Color background = cream50;
  static const Color surface = white;
  static const Color card = white;
  static const Color cardElevated = cream100;

  // Brand
  static const Color primary = green600;
  static const Color primaryLight = green400;
  static const Color primaryDark = green700;
  static const Color primaryContainer = greenBrandContainer;

  static const Color brandYellow = gold500;
  static const Color brandYellowLight = gold400;
  static const Color brandYellowDark = gold600;

  // Accent (secondary brand color — gold, from the site's eyebrows/highlights)
  static const Color accent = gold500;
  static const Color accentContainer = goldContainer;
  static const Color secondaryNavy = forestGreen800;

  // Status / Feedback
  static const Color success = green500;
  static const Color successContainer = greenContainer;
  static const Color error = red500;
  static const Color errorContainer = redContainer;
  static const Color warning = amber500;
  static const Color warningContainer = amberContainer;
  static const Color info = green600;
  static const Color infoContainer = greenBrandContainer;

  // Text
  static const Color textPrimary = inkText;
  static const Color textHeading = forestGreen800;
  static const Color textSecondary = mutedText;
  static const Color textTertiary = Color(0xFF64748B);
  static const Color textOnBrand = white;
  static const Color textDisabled = gray300;

  // Borders / Dividers
  static const Color border = cardBorder;
  static const Color borderLight = gray100;
  static const Color divider = gray100;

  // ─── Gradients ────────────────────────────────────────────────────────────────

  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [green600, forestGreen800],
  );

  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [green600, green700],
  );

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [white, cream100],
  );
}
