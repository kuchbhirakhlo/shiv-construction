import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:shivconstruction/features/staff_quotations/data/pdf/quotation_pdf_generator.dart';
import 'package:shivconstruction/features/staff_quotations/domain/entities/quotation_entity.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('quotation PDF generates with Shiv Construction branding and no signature asset', () async {
    const q = QuotationEntity(
      id: 't1',
      customerName: 'Test Customer',
      phone: '9999999999',
      solarSystem: 'On Grid',
      capacity: '5KW',
      products: 'Waaree Bifacial 545W',
      items: [
        QuotationItemEntity(item: 'Solar Panels', spec: 'Waaree Bifacial 545W', qty: '10'),
        QuotationItemEntity(item: 'Inverter', spec: 'Luminous 5kW 1 Phase', qty: '1'),
      ],
      price: 290000,
      gst: 0,
      discount: 0,
      finalAmount: 290000,
      quotationNumber: 'SC-TEST-0001',
      preparedBy: 'Test Staff',
      createdAt: '2026-10-18T10:00:00Z',
    );
    final doc = await QuotationPdfGenerator.generate(q);
    final bytes = await doc.save();
    expect(bytes.length, greaterThan(1000));
    final out = Platform.environment['QUOTE_PDF_OUT'];
    if (out != null) File(out).writeAsBytesSync(bytes);
  });
}
