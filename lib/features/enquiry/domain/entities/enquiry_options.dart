/// Values matched to the admin's existing `enquiries` collection format
/// (see solarType/capacity fields on existing leads), so new leads sit
/// consistently alongside what the admin panel already shows.
class EnquiryOptions {
  EnquiryOptions._();

  static const List<String> systemTypes = [
    'On Grid',
    'Off Grid',
    'Hybrid',
    'Smart Meter',
    'Construction',
  ];

  static const List<String> capacities = [
    '1KW',
    '2KW',
    '3KW',
    '4KW',
    '5KW',
    '6KW',
    '7KW',
    '8KW',
    '9KW',
    '10KW',
    'Above 10KW',
  ];

  static const String defaultSystemType = 'On Grid';
  static const String defaultCapacity = '1KW';
}
