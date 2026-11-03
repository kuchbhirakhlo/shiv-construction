import 'package:flutter/material.dart';
import '../../../../core/constants/app_color_constants.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/launcher_helper.dart';
import '../../domain/home_content.dart';
import 'home_common.dart';
import 'lead_form.dart';

/// "Contact Us": office/phone/email/vendor code/hours, map link and the full
/// lead form (writes to `enquiries`).
class ContactSection extends StatelessWidget {
  final String vendorCode;
  final String businessHours;

  const ContactSection({super.key, required this.vendorCode, required this.businessHours});

  @override
  Widget build(BuildContext context) {
    return HomeSection(
      background: AppColorConstants.sectionContact,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Eyebrow('Get in touch'),
          const SectionTitle('Contact Us'),
          const SectionLead(
            'Have any queries or ready to start your solar energy transition? Reach out and our '
            'expert advisors will contact you shortly.',
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: homeCardDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _InfoRow(
                  icon: Icons.location_on_rounded,
                  title: 'Office Address',
                  value: HomeContent.officeAddress,
                  onTap: () => LauncherHelper.openMap(HomeContent.mapsQuery),
                ),
                _InfoRow(
                  icon: Icons.call_rounded,
                  title: 'Phone / WhatsApp',
                  value: AppStrings.primaryContactDisplay,
                  onTap: () => LauncherHelper.call(AppStrings.primaryContactNumber),
                ),
                _InfoRow(
                  icon: Icons.mail_rounded,
                  title: 'Email Address',
                  value: AppStrings.contactEmail,
                  onTap: () => LauncherHelper.email(AppStrings.contactEmail),
                ),
                if (vendorCode.isNotEmpty)
                  _InfoRow(icon: Icons.badge_rounded, title: 'Vendor Code', value: vendorCode),
                _InfoRow(icon: Icons.schedule_rounded, title: 'Business Hours', value: businessHours),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    HomeButton(
                      label: 'Open in Maps',
                      secondary: true,
                      onPressed: () => LauncherHelper.openMap(HomeContent.mapsQuery),
                    ),
                    HomeButton(
                      label: 'WhatsApp',
                      secondary: true,
                      onPressed: () => LauncherHelper.whatsapp(
                        HomeContent.whatsappNumber,
                        HomeContent.whatsappDefaultMessage,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: homeCardDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Send Message',
                  style: AppTypography.headlineSmall.copyWith(color: AppColorConstants.forestGreen800),
                ),
                const SizedBox(height: 14),
                LeadForm(source: 'home_contact', submitLabel: AppStrings.contactSubmitLabel),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final VoidCallback? onTap;

  const _InfoRow({required this.icon, required this.title, required this.value, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: AppColors.primaryContainer,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 19, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title.toUpperCase(),
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColorConstants.mutedText,
                      letterSpacing: 1,
                      fontSize: 9.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: AppTypography.bodyMedium.copyWith(color: AppColorConstants.inkText, height: 1.5),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HomeFooter extends StatelessWidget {
  final String gstin;
  final String vendorCode;
  final String businessHours;
  final void Function(String section) onLink;

  const HomeFooter({
    super.key,
    required this.gstin,
    required this.vendorCode,
    required this.businessHours,
    required this.onLink,
  });

  @override
  Widget build(BuildContext context) {
    final body = AppTypography.bodySmall.copyWith(color: Colors.white70, height: 1.6);
    final head = AppTypography.labelSmall.copyWith(
      color: AppColorConstants.amberOnDark,
      letterSpacing: 1.4,
      fontSize: 10,
    );
    Widget link(String label, String section) => InkWell(
          onTap: () => onLink(section),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Text(label, style: body.copyWith(color: Colors.white)),
          ),
        );
    return Container(
      color: AppColorConstants.footerGreen,
      padding: const EdgeInsets.fromLTRB(kHomeHPad, 34, kHomeHPad, 90),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
            child: Image.asset('assets/images/shivlogo_tight.png', height: 60),
          ),
          const SizedBox(height: 12),
          Text(
            'Shiv Construction delivers carefully planned solar solutions for homes, businesses, '
            'and industrial spaces.',
            style: body,
          ),
          const SizedBox(height: 22),
          Text('QUICK LINKS', style: head),
          const SizedBox(height: 6),
          link('Home', 'home'),
          link('About', 'about'),
          link('Solar Solutions', 'solutions'),
          link('Smart Meter & Construction', 'services'),
          link('Pricing', 'pricing'),
          link('Contact', 'contact'),
          const SizedBox(height: 18),
          Text('CONTACT & BUSINESS INFO', style: head),
          const SizedBox(height: 6),
          Text('Office:\n${HomeContent.officeAddress}', style: body),
          const SizedBox(height: 6),
          Text('Phone / WhatsApp: ${AppStrings.primaryContactDisplay}', style: body),
          Text('Email: ${AppStrings.contactEmail}', style: body),
          Text('Business Hours: $businessHours', style: body),
          if (gstin.isNotEmpty) Text('GSTN: $gstin', style: body),
          if (vendorCode.isNotEmpty) Text('Vendor Code: $vendorCode', style: body),
          const Divider(color: Colors.white24, height: 30),
          Text('© ${DateTime.now().year} Shiv Construction. All Rights Reserved.', style: body),
        ],
      ),
    );
  }
}

/// Floating WhatsApp button.
class FloatingWhatsApp extends StatelessWidget {
  const FloatingWhatsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColorConstants.whatsappGreen,
      shape: const CircleBorder(side: BorderSide(color: Colors.white, width: 3)),
      elevation: 6,
      shadowColor: const Color(0x4D15341C),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: () => LauncherHelper.whatsapp(
          HomeContent.whatsappNumber,
          HomeContent.whatsappDefaultMessage,
        ),
        child: const SizedBox(
          width: 54,
          height: 54,
          child: Icon(Icons.chat_rounded, color: Colors.white, size: 26),
        ),
      ),
    );
  }
}
