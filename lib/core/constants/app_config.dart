/// Feature flags that don't fit the CRM's real Firestore schema and aren't
/// user-facing strings — kept separate from [AppStrings].
class AppConfig {
  AppConfig._();

  /// Cloud Storage is enabled on shivconstruction-ad026 (Blaze, 2026-10-19)
  /// and storage.rules allows staff/admin uploads under customers/,
  /// enquiries/ and service_requests/.
  ///
  /// Uploads are always attempted regardless of this flag; it only controls
  /// UI behaviour — customer KYC documents are required and a failed upload
  /// shows an error. (The enquiry site photo stays optional either way.)
  static const bool storageUploadsEnabled = true;
}
