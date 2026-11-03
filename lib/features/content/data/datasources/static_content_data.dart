import '../../domain/entities/company_info_entity.dart';
import '../../domain/entities/solution_entity.dart';

/// Company/about copy and the on-grid/off-grid/hybrid solution descriptions
/// have no backing Firestore collection — the admin's Firestore only holds
/// CRM + marketing-listing data (brands, pricing, projects, faq, enquiries).
/// This static copy mirrors the Shiv Construction website,
/// https://shivconstruction-liart.vercel.app/ (company name, Kanpur office,
/// phone, email, GSTN, vendor code, hours, "13+ years" / "500+ installations"
/// / "MNRE & UPNEDA registered" figures) and can move to Firestore later
/// without changing any UI code.
///
/// `teamMembers`/`teamSatisfactionPercent`/`ceoQuote`/`ceoBio` are generic —
/// the site publishes no team size or founder name.
class StaticContentData {
  StaticContentData._();

  static const CompanyInfoEntity companyInfo = CompanyInfoEntity(
    heroBadge: 'Built on trust. Powered by purpose.',
    heroHeadline: 'Solar panel installation anywhere in Uttar Pradesh, built around you.',
    aboutShort:
        'Shiv Construction provides solar solutions across Uttar Pradesh, helping homes, '
        'businesses, and industries make the transition to clean, reliable, and affordable '
        'power.',
    missionText:
        'From site assessment and system design to installation, net metering, and ongoing '
        'support, our team takes care of each step with a focus on dependable workmanship and '
        'lasting value.',
    visionText:
        'A trusted partner for a brighter, more energy-smart future — dependable rooftop solar, '
        'smart metering and construction services for every home and business in Uttar '
        'Pradesh.',
    regOfficeAddress:
        '25 near SBI Bank, Vasant Vihar, Naubasta, Near South City Public School, Kanpur 208021',
    contactNumbers: ['7017725641'],
    email: 'shivconstruction311@gmail.com',
    website: 'https://shivconstruction-liart.vercel.app',
    gstn: '09ALEPY2620D1Z6',
    vendorCode: 'FZD2609113257',
    businessHours: 'Mon–Sat: 9:00 AM – 6:00 PM',
    experienceYears: 13,
    statesServed: 1,
    capacityInstalledMw: 5.0,
    // No founder name is published on the site; not rendered in the UI.
    ceoName: 'Shiv Construction',
    ceoQuote: 'Built on trust. Powered by purpose.',
    ceoBio:
        'A Kanpur-based, MNRE & UPNEDA registered solar EPC company with 13+ years of '
        'experience and 500+ successful rooftop installations across Uttar Pradesh.',
    teamExperienceYears: 13,
    teamProjectsCompleted: 500,
    teamMembers: 15,
    teamSatisfactionPercent: 100,
    branchOffices: [
      BranchOfficeEntity(
        name: 'Office — Naubasta, Kanpur',
        address:
            '25 near SBI Bank, Vasant Vihar, Naubasta, Near South City Public School, Kanpur 208021',
      ),
    ],
  );

  static const List<SolutionEntity> solutions = [
    SolutionEntity(
      id: 'on_grid',
      type: 'on_grid',
      title: 'On Grid Solar System',
      description:
          'Connect your rooftop system to the utility grid and use net metering to export '
          'surplus power.',
      benefits: [
        'Eliminate up to 90% of electricity bills',
        'Direct export of excess power (Net Metering)',
        'Eligible for maximum government subsidy support',
        'Extremely low maintenance & longest lifespan',
      ],
      order: 1,
    ),
    SolutionEntity(
      id: 'hybrid',
      type: 'hybrid',
      title: 'Hybrid Solar System',
      description:
          'Pair solar generation with battery backup and grid access for added flexibility '
          'through outages.',
      benefits: [
        'Utility saving + emergency backup simultaneously',
        'Smart load-shedding battery bank allocation',
        'Automatically switch between Solar, Battery, & Grid',
        'App-controlled remote configuration',
      ],
      order: 2,
    ),
    SolutionEntity(
      id: 'off_grid',
      type: 'off_grid',
      title: 'Off Grid Solar System',
      description:
          'Generate and store your own electricity for properties where a reliable grid '
          'connection is limited.',
      benefits: [
        'Complete energy independence (No utility dependency)',
        'Continuous battery backup for full blackouts',
        'Excellent for remote areas, farms, and off-grid resorts',
        'Protects expensive sensitive equipment from spikes',
      ],
      order: 3,
    ),
  ];
}
