import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../core/constants/app_color_constants.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/launcher_helper.dart';
import '../../domain/home_content.dart';
import 'home_common.dart';

/// Slim strip under the app bar — the website header's phone chip and
/// "Get a consultation" button.
class ContactTopBar extends StatelessWidget {
  final VoidCallback onConsult;

  const ContactTopBar({super.key, required this.onConsult});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColorConstants.topBarBg,
      padding: const EdgeInsets.fromLTRB(kHomeHPad, 4, kHomeHPad, 10),
      child: Row(
        children: [
          InkWell(
            onTap: () => LauncherHelper.call(AppStrings.primaryContactNumber),
            borderRadius: BorderRadius.circular(30),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: AppColorConstants.cardBorder),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.call_rounded, size: 15, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Text(
                    AppStrings.primaryContactDisplay,
                    style: AppTypography.labelMedium.copyWith(color: AppColorConstants.inkText),
                  ),
                ],
              ),
            ),
          ),
          const Spacer(),
          Material(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(30),
            child: InkWell(
              onTap: onConsult,
              borderRadius: BorderRadius.circular(30),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                child: Text(
                  'Get a consultation',
                  style: AppTypography.labelMedium.copyWith(color: Colors.white),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Website hero: gold eyebrow pill, headline with a gold closing phrase,
/// two CTAs, two check chips and the rounded image card.
class HeroSection extends StatelessWidget {
  final VoidCallback onPlan;
  final VoidCallback onExplore;

  const HeroSection({super.key, required this.onPlan, required this.onExplore});

  @override
  Widget build(BuildContext context) {
    final headline = AppTypography.displayMedium.copyWith(
      color: AppColorConstants.forestGreen800,
      fontSize: 36,
      height: 1.12,
      letterSpacing: -1.2,
      fontWeight: FontWeight.w700,
    );
    return HomeSection(
      background: AppColorConstants.cream50,
      padding: const EdgeInsets.fromLTRB(kHomeHPad, 26, kHomeHPad, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: AppColorConstants.cardBorder),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.auto_awesome_rounded, size: 13, color: AppColors.accent),
                const SizedBox(width: 6),
                Text(
                  'BUILT ON TRUST. POWERED BY PURPOSE.',
                  style: AppTypography.labelSmall.copyWith(
                    color: AppColorConstants.forestGreen800,
                    letterSpacing: 1.4,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Text.rich(
            TextSpan(
              style: headline,
              children: const [
                TextSpan(text: 'Solar panel installation anywhere in Uttar Pradesh, '),
                TextSpan(text: 'built around you.', style: TextStyle(color: AppColors.accent)),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'Shiv Construction plans and installs dependable rooftop solar systems for homes and '
            'businesses across Uttar Pradesh, from the first site visit through installation and '
            'support.',
            style: AppTypography.bodyMedium.copyWith(color: AppColorConstants.mutedText, height: 1.7),
          ),
          const SizedBox(height: 22),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              HomeButton(label: 'Plan your solar project', onPressed: onPlan),
              HomeButton(label: 'Explore solutions', onPressed: onExplore, secondary: true, showArrow: false),
            ],
          ),
          const SizedBox(height: 18),
          const Wrap(
            spacing: 16,
            runSpacing: 8,
            children: [
              _CheckChip('End-to-end project care'),
              _CheckChip('Residential & commercial'),
            ],
          ),
          const SizedBox(height: 28),
          const _HeroImageCard(),
        ],
      ),
    );
  }
}

class _CheckChip extends StatelessWidget {
  final String text;
  const _CheckChip(this.text);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.check_circle_rounded, size: 16, color: AppColors.primary),
        const SizedBox(width: 6),
        Text(text, style: AppTypography.labelMedium.copyWith(color: AppColorConstants.inkText)),
      ],
    );
  }
}

class _HeroImageCard extends StatelessWidget {
  const _HeroImageCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColorConstants.goldContainer,
        borderRadius: BorderRadius.circular(26),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: AspectRatio(
          aspectRatio: 4 / 4.4,
          child: Stack(
            fit: StackFit.expand,
            children: [
              Image.asset('assets/images/shiv_hero.png', fit: BoxFit.cover),
              const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Color(0x00000000), Color(0x00000000), Color(0xCC173C2B)],
                    stops: [0, 0.45, 1],
                  ),
                ),
              ),
              Positioned(
                top: 14,
                right: 14,
                child: Container(
                  width: 72,
                  height: 72,
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Image.asset('assets/images/shivlogo_tight.png', fit: BoxFit.contain),
                ),
              ),
              Positioned(
                left: 18,
                right: 18,
                bottom: 18,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'THOUGHTFUL ENERGY. SOLID FOUNDATIONS.',
                      style: AppTypography.labelSmall.copyWith(
                        color: AppColorConstants.amberOnDark,
                        letterSpacing: 1.6,
                        fontSize: 9.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Smarter power for the places you call home.',
                      style: AppTypography.headlineMedium.copyWith(
                        color: Colors.white,
                        fontSize: 22,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// "Our solar partners" — an endlessly auto-scrolling row of brand logos.
class PartnersMarquee extends StatefulWidget {
  final VoidCallback onQuote;

  const PartnersMarquee({super.key, required this.onQuote});

  @override
  State<PartnersMarquee> createState() => _PartnersMarqueeState();
}

class _PartnersMarqueeState extends State<PartnersMarquee> {
  final _controller = ScrollController();
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 30), (_) {
      if (!_controller.hasClients) return;
      _controller.jumpTo(_controller.offset + 1);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const partners = HomeContent.partners;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 26),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border.symmetric(horizontal: BorderSide(color: AppColorConstants.cardBorder)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: kHomeHPad),
            child: Row(
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Eyebrow('Quality you can trust'),
                      SectionTitle('Our solar partners'),
                    ],
                  ),
                ),
                HomeButton(label: 'Get a quote', onPressed: widget.onQuote, secondary: true),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 70,
            child: ListView.builder(
              controller: _controller,
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: kHomeHPad),
              itemBuilder: (context, i) {
                final p = partners[i % partners.length];
                return Container(
                  width: 120,
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.all(8),
                  decoration: homeCardDecoration(),
                  child: Image.asset(
                    p.asset,
                    fit: BoxFit.contain,
                    semanticLabel: p.name,
                    errorBuilder: (_, __, ___) => Center(
                      child: Text(p.name, style: AppTypography.labelMedium, textAlign: TextAlign.center),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// "Choose the right way to power your property." — the three system cards.
class SolutionsSection extends StatelessWidget {
  final void Function(String systemType) onPlan;

  const SolutionsSection({super.key, required this.onPlan});

  @override
  Widget build(BuildContext context) {
    return HomeSection(
      background: AppColorConstants.sectionLight,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Eyebrow('Solar plans & systems'),
          const SectionTitle('Choose the right way to power your property.'),
          const SectionLead(
            'Every property uses energy differently. Explore three system types, then talk with '
            'our team about what suits your site.',
          ),
          const SizedBox(height: 22),
          for (final s in HomeContent.solutions)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: _SolutionCard(item: s, onPlan: () => onPlan(s.systemType)),
            ),
        ],
      ),
    );
  }
}

class _SolutionCard extends StatelessWidget {
  final SolutionItem item;
  final VoidCallback onPlan;

  const _SolutionCard({required this.item, required this.onPlan});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: homeCardDecoration().copyWith(borderRadius: BorderRadius.circular(18)),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 900 / 520,
            child: Container(
              color: AppColorConstants.cream100,
              child: SvgPicture.asset(item.svg, fit: BoxFit.cover),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        item.tag.toUpperCase(),
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.accent,
                          letterSpacing: 1.6,
                          fontSize: 10,
                        ),
                      ),
                    ),
                    Text(
                      item.number,
                      style: AppTypography.headlineMedium.copyWith(
                        color: AppColorConstants.cardBorder,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  item.title,
                  style: AppTypography.headlineSmall.copyWith(color: AppColorConstants.forestGreen800),
                ),
                const SizedBox(height: 8),
                Text(
                  item.text,
                  style: AppTypography.bodyMedium.copyWith(color: AppColorConstants.mutedText, height: 1.6),
                ),
                const SizedBox(height: 12),
                for (final b in item.bullets) _Bullet(b),
                const SizedBox(height: 12),
                HomeButton(label: 'Plan this system', onPressed: onPlan, fullWidth: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Bullet extends StatelessWidget {
  final String text;
  const _Bullet(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(Icons.check_circle_rounded, size: 16, color: AppColors.primary),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: AppTypography.bodyMedium.copyWith(color: AppColorConstants.inkText),
            ),
          ),
        ],
      ),
    );
  }
}

/// Smart Meter and Construction — the website's "More services" blocks.
class ServiceSpotlightsSection extends StatelessWidget {
  final void Function(String systemType) onEnquire;

  const ServiceSpotlightsSection({super.key, required this.onEnquire});

  @override
  Widget build(BuildContext context) {
    return HomeSection(
      child: Column(
        children: [
          for (final s in HomeContent.spotlights)
            Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: _SpotlightCard(item: s, onTap: () => onEnquire(s.systemType)),
            ),
        ],
      ),
    );
  }
}

class _SpotlightCard extends StatelessWidget {
  final ServiceSpotlight item;
  final VoidCallback onTap;

  const _SpotlightCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColorConstants.cream100,
        borderRadius: BorderRadius.circular(22),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 900 / 600,
            child: SvgPicture.asset(item.svg, fit: BoxFit.cover),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Eyebrow(item.eyebrow),
                SectionTitle(item.title, color: AppColorConstants.forestGreen800),
                SectionLead(item.text),
                const SizedBox(height: 14),
                for (final b in item.bullets) _Bullet(b),
                const SizedBox(height: 10),
                HomeButton(label: item.cta, onPressed: onTap, fullWidth: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// "About Shiv Construction" with stat tiles, services list and office card.
class AboutSection extends StatelessWidget {
  final int experienceYears;
  final VoidCallback onAssessment;

  const AboutSection({super.key, required this.experienceYears, required this.onAssessment});

  @override
  Widget build(BuildContext context) {
    return HomeSection(
      background: AppColorConstants.sectionLight,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Eyebrow('About Shiv Construction'),
          const SectionTitle('A trusted partner for a brighter, more energy-smart future'),
          const SectionLead(
            'Shiv Construction provides solar solutions across Uttar Pradesh, helping homes, '
            'businesses, and industries make the transition to clean, reliable, and affordable '
            'power.',
          ),
          const SectionLead(
            'From site assessment and system design to installation, net metering, and ongoing '
            'support, our team takes care of each step with a focus on dependable workmanship and '
            'lasting value.',
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(child: _StatTile(value: '$experienceYears+ Years', label: 'Experience')),
              const SizedBox(width: 10),
              const Expanded(child: _StatTile(value: 'MNRE & UPNEDA', label: 'Govt. approved channel partner')),
              const SizedBox(width: 10),
              const Expanded(child: _StatTile(value: '5.0 / 5.0', label: 'Google rating')),
            ],
          ),
          const SizedBox(height: 22),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: homeCardDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Our Services Across Uttar Pradesh',
                  style: AppTypography.titleMedium.copyWith(color: AppColorConstants.forestGreen800),
                ),
                const SizedBox(height: 12),
                for (final s in HomeContent.aboutServices) _Bullet(s),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColorConstants.forestGreen800,
              borderRadius: BorderRadius.circular(kCardRadius),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Our Office', style: AppTypography.titleMedium.copyWith(color: Colors.white)),
                const SizedBox(height: 8),
                Text(
                  HomeContent.officeAddress,
                  style: AppTypography.bodyMedium.copyWith(color: Colors.white70, height: 1.6),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () => LauncherHelper.call(AppStrings.primaryContactNumber),
                  child: Text(
                    AppStrings.primaryContactDisplay,
                    style: AppTypography.labelLarge.copyWith(color: AppColorConstants.amberOnDark),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Ready to make the switch to clean, green energy today?',
                  style: AppTypography.bodyMedium.copyWith(color: Colors.white),
                ),
                const SizedBox(height: 12),
                HomeButton(label: 'Get Free Site Assessment', onPressed: onAssessment, glass: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  final String value;
  final String label;
  const _StatTile({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 104,
      padding: const EdgeInsets.all(10),
      decoration: homeCardDecoration(),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            textAlign: TextAlign.center,
            style: AppTypography.titleMedium.copyWith(color: AppColors.accent, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            label.toUpperCase(),
            textAlign: TextAlign.center,
            style: AppTypography.labelSmall.copyWith(
              fontSize: 8.5,
              letterSpacing: 0.8,
              color: AppColorConstants.mutedText,
            ),
          ),
        ],
      ),
    );
  }
}

/// "Why Hundreds of Customers Trust us" — four reason cards.
class TrustSection extends StatelessWidget {
  const TrustSection({super.key});

  @override
  Widget build(BuildContext context) {
    return HomeSection(
      background: AppColorConstants.forestGreen800,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Eyebrow('Why choose us', color: AppColorConstants.amberOnDark),
          const SectionTitle('Why Hundreds of Customers Trust us', color: Colors.white),
          const SizedBox(height: 20),
          for (final t in HomeContent.trustReasons)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(kCardRadius),
                border: Border.all(color: Colors.white.withOpacity(0.12)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(t.icon, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(t.title, style: AppTypography.titleMedium.copyWith(color: Colors.white)),
                        const SizedBox(height: 4),
                        Text(
                          t.text,
                          style: AppTypography.bodySmall.copyWith(color: Colors.white70, height: 1.6),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
