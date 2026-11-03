import 'package:flutter/material.dart';
import '../../../../core/constants/app_color_constants.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/launcher_helper.dart';
import '../../../content/domain/entities/package_entity.dart';
import '../../domain/home_content.dart';
import 'home_common.dart';

/// "Residential Solar Packages" — reads Firestore `pricing` (via ContentBloc)
/// and falls back to the website's four published packages when that
/// collection is empty or unreadable.
class PricingSection extends StatelessWidget {
  final List<PackageEntity> packages;
  final void Function(String capacity) onEnquire;

  const PricingSection({super.key, required this.packages, required this.onEnquire});

  static final _kw = RegExp(r'(\d+(?:\.\d+)?)\s*k\s*w', caseSensitive: false);

  /// PM Surya Ghar (central + UP state) tops out at ₹1,08,000 from 3 kW up,
  /// which is the figure the website shows on every residential package.
  static HomePackage fromEntity(PackageEntity p) {
    final kw = double.tryParse(_kw.firstMatch('${p.capacity} ${p.title}')?.group(1) ?? '');
    final residential = !p.title.toLowerCase().contains('commercial') &&
        !p.title.toLowerCase().contains('industrial');
    return HomePackage(
      capacity: p.capacity,
      title: p.title,
      price: p.price,
      subsidy: residential && kw != null && kw >= 3 && kw <= 10 ? HomeContent.pmSuryaGharSubsidy : null,
      panels: p.panelType,
      inverter: p.inverter,
      features: p.features,
      warranty: p.warranty,
    );
  }

  @override
  Widget build(BuildContext context) {
    final items = packages.isEmpty
        ? HomeContent.fallbackPackages
        : packages.map(fromEntity).toList();
    return HomeSection(
      background: AppColorConstants.sectionLight,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Eyebrow('Pricing & packages'),
          const SectionTitle('Residential Solar Packages'),
          const SectionLead(
            'Invest once and enjoy clean, free solar electricity for decades. Check out our fully '
            'configured turn-key packages below.',
          ),
          const SizedBox(height: 18),
          const _SubsidyBanner(),
          const SizedBox(height: 20),
          for (final p in items)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: _PackageCard(item: p, onEnquire: () => onEnquire(p.capacity)),
            ),
        ],
      ),
    );
  }
}

class _SubsidyBanner extends StatelessWidget {
  const _SubsidyBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColorConstants.subsidyCardGreen,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.account_balance_rounded, color: AppColorConstants.amberOnDark, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'PM-Surya Ghar Subsidy Advantage',
                  style: AppTypography.titleMedium.copyWith(color: Colors.white),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Residential setups up to 10kW enjoy government subsidies up to ₹1,08,000! The prices '
            'below represent gross installation costs before subtracting Govt. subsidies.',
            style: AppTypography.bodySmall.copyWith(color: Colors.white70, height: 1.6),
          ),
          const SizedBox(height: 12),
          HomeButton(
            label: 'Check Subsidy Eligibility',
            glass: true,
            onPressed: () => LauncherHelper.openUrl(HomeContent.pmSuryaGharUrl),
          ),
        ],
      ),
    );
  }
}

class _PackageCard extends StatelessWidget {
  final HomePackage item;
  final VoidCallback onEnquire;

  const _PackageCard({required this.item, required this.onEnquire});

  @override
  Widget build(BuildContext context) {
    final subsidy = item.subsidy;
    final label = AppTypography.labelSmall.copyWith(
      color: AppColorConstants.mutedText,
      letterSpacing: 1,
      fontSize: 9.5,
    );
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: item.popular ? AppColors.accent : AppColorConstants.cardBorder,
          width: item.popular ? 2 : 1,
        ),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('${item.capacity.toUpperCase()} CAPACITY', style: label.copyWith(color: AppColors.accent)),
              const Spacer(),
              if (item.popular)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text('MOST POPULAR', style: label.copyWith(color: Colors.white)),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(item.title, style: AppTypography.headlineSmall.copyWith(color: AppColorConstants.forestGreen800)),
          if (item.subtitle.isNotEmpty)
            Text(item.subtitle, style: AppTypography.bodySmall.copyWith(color: AppColorConstants.mutedText)),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColorConstants.cream100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                _PriceRow('Total Price', '₹${inr(item.price)}'),
                if (subsidy != null) ...[
                  _PriceRow('Govt. Subsidy', '- ₹${inr(subsidy)}', color: AppColors.success),
                  const Divider(height: 18),
                  _PriceRow('Balance Amount', '₹${inr(item.price - subsidy)}', strong: true),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: _Spec(label: 'PANELS', value: item.panels, style: label)),
              const SizedBox(width: 12),
              Expanded(child: _Spec(label: 'INVERTER', value: item.inverter, style: label)),
            ],
          ),
          if (item.features.isNotEmpty) ...[
            const SizedBox(height: 14),
            Text("WHAT'S INCLUDED:", style: label),
            const SizedBox(height: 8),
            for (final f in item.features)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_rounded, size: 16, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Expanded(child: Text(f, style: AppTypography.bodySmall.copyWith(color: AppColorConstants.inkText))),
                  ],
                ),
              ),
          ],
          const SizedBox(height: 12),
          HomeButton(label: 'Enquire Now', onPressed: onEnquire, fullWidth: true),
          if (item.warranty.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              'WARRANTY: ${item.warranty}',
              style: AppTypography.bodySmall.copyWith(fontSize: 11, color: AppColorConstants.mutedText),
            ),
          ],
        ],
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;
  final bool strong;

  const _PriceRow(this.label, this.value, {this.color, this.strong = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Text(label, style: AppTypography.bodySmall.copyWith(color: AppColorConstants.mutedText)),
          const Spacer(),
          Text(
            value,
            style: (strong ? AppTypography.titleLarge : AppTypography.titleSmall).copyWith(
              color: color ?? AppColorConstants.forestGreen800,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _Spec extends StatelessWidget {
  final String label;
  final String value;
  final TextStyle style;

  const _Spec({required this.label, required this.value, required this.style});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: style),
        const SizedBox(height: 2),
        Text(
          value.isEmpty ? '—' : value,
          style: AppTypography.labelLarge.copyWith(color: AppColorConstants.inkText),
        ),
      ],
    );
  }
}
