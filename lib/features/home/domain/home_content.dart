import 'package:flutter/material.dart';

/// Static homepage copy, taken from the Shiv Construction website
/// (https://shivconstruction-liart.vercel.app/). Kept in one place so the app
/// and site can be diffed easily.
class HomeContent {
  HomeContent._();

  static const String whatsappNumber = '917017725641';
  static const String whatsappDefaultMessage =
      'Hello Shiv Construction, I am interested in installing a solar system. '
      'Please share details regarding system cost, subsidy and site survey.';

  static const List<String> phones = ['7017725641'];

  static const String officeAddress =
      '25 near SBI Bank, Vasant Vihar, Naubasta,\nNear South City Public School, Kanpur 208021';
  static const String mapsQuery = 'Shiv Construction, 25, Vasant Vihar, Naubasta, Kanpur 208021';

  // ─── Partner marquee ─────────────────────────────────────────────────────────
  static const List<PartnerItem> partners = [
    PartnerItem('Tata Power Solar', 'assets/images/brands/brand-tata.jpeg'),
    PartnerItem('Waaree', 'assets/images/brands/brand-waree.png'),
    PartnerItem('Vikram Solar', 'assets/images/brands/brand-vikram.png'),
    PartnerItem('Luminous', 'assets/images/brands/brand-luminous.webp'),
    PartnerItem('Adani Solar', 'assets/images/brands/brand-adani.png'),
    PartnerItem('Amaron', 'assets/images/brands/brand-amaron.jpg'),
    PartnerItem('Exide', 'assets/images/brands/brand-exide.png'),
    PartnerItem('Loom Solar', 'assets/images/brands/brand-loom.png'),
    PartnerItem('UTL Solar', 'assets/images/brands/brand-utl.png'),
  ];

  // ─── Solar plans & systems ───────────────────────────────────────────────────
  // `systemType` matches EnquiryOptions.systemTypes so the lead form opens preset.
  static const List<SolutionItem> solutions = [
    SolutionItem(
      number: '01',
      tag: 'Grid connected',
      title: 'On Grid Solar System',
      text: 'Connect your rooftop system to the utility grid and use net metering to export '
          'surplus power.',
      bullets: ['Net metering support', 'Lower upfront system cost', 'Subsidy application assistance'],
      svg: 'assets/svg/solar-on-grid.svg',
      systemType: 'On Grid',
    ),
    SolutionItem(
      number: '02',
      tag: 'Solar + battery + grid',
      title: 'Hybrid Solar System',
      text: 'Pair solar generation with battery backup and grid access for added flexibility '
          'through outages.',
      bullets: ['Solar with battery backup', 'Automatic source switching', 'Usage matched to your needs'],
      svg: 'assets/svg/solar-hybrid.svg',
      systemType: 'Hybrid',
    ),
    SolutionItem(
      number: '03',
      tag: 'Independent power',
      title: 'Off Grid Solar System',
      text: 'Generate and store your own electricity for properties where a reliable grid '
          'connection is limited.',
      bullets: ['Battery storage included', 'Designed for remote sites', 'Energy independence'],
      svg: 'assets/svg/solar-off-grid.svg',
      systemType: 'Off Grid',
    ),
  ];

  // ─── More services (smart meter + construction) ──────────────────────────────
  static const List<ServiceSpotlight> spotlights = [
    ServiceSpotlight(
      eyebrow: 'Metering & energy management',
      title: 'Smart Meter',
      text: 'Looking for smart meter installation or an upgrade? Tell us about your property and '
          'current setup. Our team can review your requirements and help you understand the '
          'next steps.',
      bullets: [
        'Installation and upgrade consultation',
        'Understand your metering requirements',
        'Discuss site access and next steps',
      ],
      cta: 'Discuss Smart Meter',
      svg: 'assets/svg/smart-meter-work.svg',
      systemType: 'Smart Meter',
    ),
    ServiceSpotlight(
      eyebrow: 'Plan • Build • Complete',
      title: 'Construction',
      text: 'Have a construction project in mind? Share your site location and project scope '
          'with Shiv Construction. We\'ll arrange a consultation to understand your '
          'requirements and discuss what comes next.',
      bullets: [
        'Discuss your project scope',
        'Review site and planning needs',
        'Plan a consultation with our team',
      ],
      cta: 'Book a construction consultation',
      svg: 'assets/svg/construction-work.svg',
      systemType: 'Construction',
    ),
  ];

  // ─── About ───────────────────────────────────────────────────────────────────
  static const List<String> aboutServices = [
    'Residential Rooftop Solar Systems (1kW – 10kW+)',
    'Commercial & Industrial Solar Installations',
    'Complete EPC Services & Project Execution',
    'Net Metering & Government Subsidy Assistance',
    'On-Grid, Off-Grid & Hybrid Solar Solutions',
    'Annual Maintenance & After-Sales Support',
  ];

  static const List<TrustItem> trustReasons = [
    TrustItem(Icons.verified_rounded, 'Quality Solar Products',
        'We source only Tier-1 solar modules and smart grid-tied/hybrid inverters with '
            'international industry certifications.'),
    TrustItem(Icons.engineering_rounded, 'Expert Installation',
        'Our engineering squad has executed over 500+ successful commercial, industrial, and '
            'home rooftop layouts.'),
    TrustItem(Icons.shield_rounded, 'Long Warranty Support',
        'Get stress-free warranties of up to 25 years on panels, backed by reliable '
            'post-installation customer care and AMC.'),
    TrustItem(Icons.savings_rounded, 'Cost Saving Energy Solutions',
        'Instant return on investment with average electricity cost reductions ranging between '
            '75% to 90% each month.'),
  ];

  // ─── Pricing fallback ────────────────────────────────────────────────────────
  /// Shown only when the Firestore `pricing` collection is empty or unreadable —
  /// mirrors the four packages published on the website.
  static const int pmSuryaGharSubsidy = 108000;

  static const List<HomePackage> fallbackPackages = [
    HomePackage(
      capacity: '3kW',
      title: 'Residential 3kW',
      subtitle: 'Perfect for small families',
      price: 190000,
      panels: 'Premium Mono PERC',
      inverter: 'Grid-Tied Inverter',
      features: [
        'High-Efficiency Mono PERC Panels',
        'Single Phase Grid-Tied Inverter',
        'Complete Structure & Mounting',
        'Net Metering Support',
        'Subsidy Application Assistance',
      ],
      warranty: '5 Years on Inverter, 25 Years on Panels',
    ),
    HomePackage(
      capacity: '4kW',
      title: 'Residential 4kW',
      subtitle: 'Ideal for medium homes',
      price: 240000,
      panels: 'Premium Bifacial Mono',
      inverter: 'High-Capacity Grid-Tied Inverter',
      features: [
        'Premium Bifacial Solar Panels',
        'High-Capacity Grid-Tied Inverter',
        'Complete Structure & Wiring',
        'Net Metering Support',
        'Subsidy Application Filing Included',
      ],
      warranty: '5 Years on Inverter, 25 Years on Panels',
    ),
    HomePackage(
      capacity: '5kW',
      title: 'Residential 5kW',
      subtitle: 'Most popular choice',
      price: 290000,
      panels: 'Premium Bifacial Mono',
      inverter: 'Smart Grid-Tied Inverter',
      features: [
        'Premium Bifacial Panels (Higher Yield)',
        'Smart Grid-Tied Inverter',
        'Complete Structure & Earthing',
        'Lightning Arrestor Protection',
        'Subsidy Application & Net Metering Support',
      ],
      warranty: '7 Years on Inverter, 25 Years on Panels',
      popular: true,
    ),
    HomePackage(
      capacity: '10kW',
      title: 'Residential 10kW',
      subtitle: 'Large families & commercial',
      price: 540000,
      panels: 'High-Efficiency Bifacial',
      inverter: 'Three-Phase Grid-Tied Inverter',
      features: [
        'High-Efficiency Bifacial Panels',
        'Three-Phase Grid-Tied Inverter',
        'Complete Structure & Earthing',
        'Lightning Arrestor & Surge Protection',
        'Subsidy & Net Metering Support Included',
      ],
      warranty: '7 Years on Inverter, 25 Years on Panels',
    ),
  ];

  static const List<String> projectCategories = ['All', 'Residential', 'Commercial', 'Industrial'];

  static const List<String> states = ['Uttar Pradesh', 'Other'];

  /// Matches the website's "Project type" dropdown.
  static const List<String> propertyTypes = [
    'Residential Solar',
    'On Grid Solar',
    'Off Grid Solar',
    'Hybrid Solar',
    'Smart Meter',
    'Construction',
  ];

  static const String pmSuryaGharUrl = 'https://pmsuryaghar.gov.in/';
}

class PartnerItem {
  final String name;
  final String asset;
  const PartnerItem(this.name, this.asset);
}

class SolutionItem {
  final String number;
  final String tag;
  final String title;
  final String text;
  final List<String> bullets;
  final String svg;
  final String systemType;
  const SolutionItem({
    required this.number,
    required this.tag,
    required this.title,
    required this.text,
    required this.bullets,
    required this.svg,
    required this.systemType,
  });
}

class ServiceSpotlight {
  final String eyebrow;
  final String title;
  final String text;
  final List<String> bullets;
  final String cta;
  final String svg;
  final String systemType;
  const ServiceSpotlight({
    required this.eyebrow,
    required this.title,
    required this.text,
    required this.bullets,
    required this.cta,
    required this.svg,
    required this.systemType,
  });
}

class TrustItem {
  final IconData icon;
  final String title;
  final String text;
  const TrustItem(this.icon, this.title, this.text);
}

/// A pricing card's data — either one of [HomeContent.fallbackPackages] or
/// mapped from a Firestore `pricing` document.
class HomePackage {
  final String capacity;
  final String title;
  final String subtitle;
  final num price;

  /// Null when the package's subsidy isn't known (e.g. a commercial package).
  final num? subsidy;
  final String panels;
  final String inverter;
  final List<String> features;
  final String warranty;
  final bool popular;

  const HomePackage({
    required this.capacity,
    required this.title,
    this.subtitle = '',
    required this.price,
    this.subsidy = HomeContent.pmSuryaGharSubsidy,
    required this.panels,
    required this.inverter,
    required this.features,
    required this.warranty,
    this.popular = false,
  });
}
