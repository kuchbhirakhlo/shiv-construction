import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:path/path.dart' as p;
import '../../../customer_service_requests/data/models/service_request_model.dart';

abstract class StaffServiceRequestsDataSource {
  Future<List<ServiceRequestModel>> getAssignedRequests(String engineerId);

  Future<void> updateStatusAndRemark({
    required String requestId,
    required String status,
    required String remark,
  });

  Future<void> uploadInstallationPhoto({
    required String requestId,
    required String filePath,
  });
}

class StaffServiceRequestsDataSourceImpl implements StaffServiceRequestsDataSource {
  final FirebaseFirestore firestore;
  final FirebaseStorage storage;

  StaffServiceRequestsDataSourceImpl(this.firestore, this.storage);

  @override
  Future<List<ServiceRequestModel>> getAssignedRequests(String engineerId) async {
    final snap = await firestore
        .collection('service_requests')
        .where('assignedEngineerId', isEqualTo: engineerId)
        .get();
    // Sorted here rather than with .orderBy('createdAt'): that combined with the
    // equality filter needs a composite index which isn't deployed, and an
    // un-indexed query fails outright (FAILED_PRECONDITION) — the screen then
    // shows "could not load". createdAt is an ISO-8601 string, so it sorts
    // correctly as text.
    final list = snap.docs.map((d) => ServiceRequestModel.fromMap(d.id, d.data())).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  @override
  Future<void> updateStatusAndRemark({
    required String requestId,
    required String status,
    required String remark,
  }) async {
    await firestore.collection('service_requests').doc(requestId).update({
      'status': status,
      'remark': remark,
      'updatedAt': DateTime.now().toUtc().toIso8601String(),
    });
  }

  @override
  Future<void> uploadInstallationPhoto({
    required String requestId,
    required String filePath,
  }) async {
    // Always attempted — see the matching comment in
    // StaffCustomersDataSourceImpl.uploadDocument for why: this throws
    // cleanly (caught by the repository) if Storage/Blaze isn't enabled
    // yet, and starts succeeding automatically once it is, no app update
    // needed.
    final file = File(filePath);
    final ext = p.extension(filePath);
    final ref = storage.ref(
      'service_requests/$requestId/installation-${DateTime.now().millisecondsSinceEpoch}$ext',
    );
    await ref.putFile(file);
    final url = await ref.getDownloadURL();
    await firestore.collection('service_requests').doc(requestId).set({
      'installationPhotos': FieldValue.arrayUnion([url]),
      'updatedAt': DateTime.now().toUtc().toIso8601String(),
    }, SetOptions(merge: true));
  }
}
