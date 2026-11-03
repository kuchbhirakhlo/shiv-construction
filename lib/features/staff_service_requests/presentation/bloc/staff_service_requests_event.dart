import 'package:equatable/equatable.dart';

abstract class StaffServiceRequestsEvent extends Equatable {
  const StaffServiceRequestsEvent();
  @override
  List<Object?> get props => [];
}

class LoadAssignedServiceRequestsEvent extends StaffServiceRequestsEvent {
  final String engineerId;
  const LoadAssignedServiceRequestsEvent(this.engineerId);
  @override
  List<Object?> get props => [engineerId];
}

class UpdateAssignedServiceRequestEvent extends StaffServiceRequestsEvent {
  final String requestId;
  final String status;
  final String remark;
  final String engineerId;
  const UpdateAssignedServiceRequestEvent({
    required this.requestId,
    required this.status,
    required this.remark,
    required this.engineerId,
  });
  @override
  List<Object?> get props => [requestId, status, remark, engineerId];
}

class UploadInstallationPhotoEvent extends StaffServiceRequestsEvent {
  final String requestId;
  final String filePath;
  final String engineerId;
  const UploadInstallationPhotoEvent({
    required this.requestId,
    required this.filePath,
    required this.engineerId,
  });
  @override
  List<Object?> get props => [requestId, filePath, engineerId];
}

/// Clears actionStatus back to idle — this bloc is a singleton, same reason
/// `customer_service_requests` needs its own reset event.
class ResetServiceRequestActionStatusEvent extends StaffServiceRequestsEvent {
  const ResetServiceRequestActionStatusEvent();
}
