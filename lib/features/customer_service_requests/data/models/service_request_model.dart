import '../../domain/entities/service_request_entity.dart';

class ServiceRequestModel extends ServiceRequestEntity {
  const ServiceRequestModel({
    required super.id,
    required super.customerId,
    required super.customerName,
    required super.customerMobile,
    required super.serviceType,
    required super.description,
    required super.remark,
    required super.status,
    required super.assignedEngineerId,
    required super.assignedEngineerName,
    required super.estimatedCost,
    required super.createdAt,
    required super.updatedAt,
    super.installationPhotos,
  });

  factory ServiceRequestModel.fromMap(String id, Map<String, dynamic> map) {
    return ServiceRequestModel(
      id: id,
      customerId: map['customerId'] as String? ?? '',
      customerName: map['customerName'] as String? ?? '',
      customerMobile: map['customerMobile'] as String? ?? '',
      serviceType: map['serviceType'] as String? ?? '',
      description: map['description'] as String? ?? '',
      remark: map['remark'] as String? ?? '',
      status: map['status'] as String? ?? 'Open',
      assignedEngineerId: map['assignedEngineerId'] as String? ?? '',
      assignedEngineerName: map['assignedEngineerName'] as String? ?? '',
      estimatedCost: map['estimatedCost'] as num? ?? 0,
      createdAt: map['createdAt'] as String? ?? '',
      updatedAt: map['updatedAt'] as String? ?? '',
      installationPhotos: List<String>.from(map['installationPhotos'] as List? ?? const []),
    );
  }
}
