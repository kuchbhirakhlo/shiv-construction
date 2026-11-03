import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_top_bar.dart';
import '../../../../core/widgets/loader.dart';
import '../../../../injection.dart';
import '../../../content/presentation/bloc/content_bloc.dart';
import '../../../content/presentation/bloc/content_event.dart';
import '../../../content/presentation/bloc/content_state.dart';
import '../../../enquiry/presentation/widgets/enquiry_form_sheet.dart';
import '../widgets/location_contact_sections.dart';
import '../widgets/pricing_section.dart';
import '../widgets/projects_section.dart';
import '../widgets/website_sections.dart';

/// Mobile version of the Shiv Construction website homepage
/// (https://shivconstruction-liart.vercel.app/): same section order and copy.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _keys = {
    for (final s in ['home', 'solutions', 'services', 'about', 'pricing', 'contact']) s: GlobalKey(),
  };

  void _scrollTo(String section) {
    final ctx = _keys[section]?.currentContext;
    if (ctx == null) return;
    Scrollable.ensureVisible(
      ctx,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
    );
  }

  void _quote(String source, {String? systemType, String? capacity}) => showEnquiryFormSheet(
        context,
        source: source,
        initialSystemType: systemType,
        initialCapacity: capacity,
      );

  /// Package capacities read like "5kW"; the enquiry dropdown uses "5KW".
  String _capacityOption(String capacity) => capacity.replaceAll(' ', '').toUpperCase();

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: sl<ContentBloc>()
        ..add(const LoadCompanyInfoEvent())
        ..add(const LoadPackagesEvent())
        ..add(const LoadProjectsEvent()),
      child: Scaffold(
        appBar: const AppTopBar(),
        backgroundColor: AppColors.background,
        floatingActionButton: const FloatingWhatsApp(),
        body: BlocBuilder<ContentBloc, ContentState>(
          builder: (context, state) {
            if (state.companyStatus == LoadStatus.loading ||
                state.companyStatus == LoadStatus.initial) {
              return const Loader();
            }
            if (state.companyStatus == LoadStatus.failure || state.companyInfo == null) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.xxxl),
                  child: Text(
                    state.companyError ?? 'Unable to load content. Please check your connection.',
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            }
            final info = state.companyInfo!;
            return SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  KeyedSubtree(
                    key: _keys['home'],
                    child: ContactTopBar(onConsult: () => _quote('home_top_bar')),
                  ),
                  HeroSection(
                    onPlan: () => _quote('home_hero'),
                    onExplore: () => _scrollTo('solutions'),
                  ),
                  PartnersMarquee(onQuote: () => _quote('home_partners')),
                  KeyedSubtree(
                    key: _keys['solutions'],
                    child: SolutionsSection(
                      onPlan: (type) => _quote('home_solution: $type', systemType: type),
                    ),
                  ),
                  KeyedSubtree(
                    key: _keys['services'],
                    child: ServiceSpotlightsSection(
                      onEnquire: (type) => _quote('home_service: $type', systemType: type),
                    ),
                  ),
                  KeyedSubtree(
                    key: _keys['about'],
                    child: AboutSection(
                      experienceYears: info.experienceYears,
                      onAssessment: () => _quote('home_site_assessment'),
                    ),
                  ),
                  const TrustSection(),
                  KeyedSubtree(
                    key: _keys['pricing'],
                    child: PricingSection(
                      // Failed/empty Firestore reads fall back to the website's packages.
                      packages: state.packagesStatus == LoadStatus.success ? state.packages : const [],
                      onEnquire: (capacity) => _quote(
                        'home_pricing: $capacity',
                        systemType: 'On Grid',
                        capacity: _capacityOption(capacity),
                      ),
                    ),
                  ),
                  HomeProjectsSection(
                    projects: state.projects,
                    onDiscuss: () => _scrollTo('contact'),
                  ),
                  KeyedSubtree(
                    key: _keys['contact'],
                    child: ContactSection(
                      vendorCode: info.vendorCode,
                      businessHours: info.businessHours,
                    ),
                  ),
                  HomeFooter(
                    gstin: info.gstn,
                    vendorCode: info.vendorCode,
                    businessHours: info.businessHours,
                    onLink: _scrollTo,
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
