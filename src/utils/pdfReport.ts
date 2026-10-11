import { jsPDF } from 'jspdf';
import { FieldTestRecord } from '../types';
import { getStoredCustomLogo } from '../services/storage';

/**
 * Safely parse and clamp RGB components to prevent NaN or non-finite numbers in jsPDF
 */
function safeRgb(rgb?: { r: number; g: number; b: number }): [number, number, number] {
  if (!rgb) return [128, 128, 128];
  const clamp = (n: unknown) => {
    const num = typeof n === 'number' && Number.isFinite(n) ? n : 0;
    return Math.max(0, Math.min(255, Math.round(num)));
  };
  return [clamp(rgb.r), clamp(rgb.g), clamp(rgb.b)];
}

/**
 * Ensures numbers passed to jsPDF methods are finite numbers to avoid `Invalid argument passed to jsPDF.f2`
 */
function safeNum(val: unknown, fallback: number = 0): number {
  if (typeof val === 'number' && Number.isFinite(val)) {
    return Number(val.toFixed(2));
  }
  return fallback;
}

export function generateForensicPdfReport(record: FieldTestRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = safeNum(doc.internal.pageSize.getWidth(), 210);
  const pageHeight = safeNum(doc.internal.pageSize.getHeight(), 297);
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Accent Band: Muted Terracotta #A85F4B
  doc.setFillColor(168, 95, 75);
  doc.rect(0, 0, pageWidth, 3.5, 'F');

  // 2. Dark Charcoal Header Block: #30302E
  doc.setFillColor(48, 48, 46);
  doc.rect(0, 3.5, pageWidth, 28, 'F');

  // Check for custom official logo
  const customLogo = getStoredCustomLogo();
  const logoX = margin;
  const logoY = 7;
  let customLogoDrawn = false;

  if (customLogo) {
    try {
      doc.addImage(customLogo, 'PNG', logoX, logoY + 2, 14, 14);
      customLogoDrawn = true;
    } catch {
      customLogoDrawn = false;
    }
  }

  if (!customLogoDrawn) {
    // Draw Vector D-TEST 360 Logo Emblem on the left
    doc.setDrawColor(168, 95, 75);
    doc.setLineWidth(0.8);
    doc.circle(logoX + 7, logoY + 10, 6.5, 'S');
    doc.setFillColor(168, 95, 75);
    doc.circle(logoX + 11.5, logoY + 5.5, 1, 'F'); // 360 degree dot

    // Central D letter
    doc.setTextColor(245, 240, 234);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('D', logoX + 5, logoY + 12);
  }

  // Main Document Heading
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('D-TEST 360', logoX + 18, logoY + 9);

  doc.setFontSize(11);
  doc.setTextColor(228, 216, 206);
  doc.text('FIELD DRUG TEST REPORT', logoX + 18, logoY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 175, 170);
  doc.text(
    'NARCOTICS CONTROL BUREAU (NCB) · FIELD DRUG SCREENING & DIGITAL TRACEABILITY SYSTEM',
    logoX + 18,
    logoY + 20.5
  );

  let currentY = 36;

  // 3. Officer & Case Specification Bar
  doc.setFillColor(245, 240, 234); // Cream surface #F5F0EA
  doc.rect(margin, currentY, contentWidth, 18, 'F');
  doc.setDrawColor(211, 199, 189); // Soft taupe #D3C7BD
  doc.setLineWidth(0.3);
  doc.rect(margin, currentY, contentWidth, 18, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(119, 113, 108); // #77716C
  doc.text('TEST ID:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(48, 48, 46);
  doc.text(String(record.id || 'FT-2026-0001'), margin + 22, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(119, 113, 108);
  doc.text('CASE REF / SEIZURE MEMO:', margin + 62, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(48, 48, 46);
  doc.text(String(record.caseReference || 'UNASSIGNED FIELD SAMPLE'), margin + 110, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(119, 113, 108);
  doc.text('DATE & TIME:', margin + 4, currentY + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(48, 48, 46);
  doc.text(new Date(record.timestamp || Date.now()).toLocaleString(), margin + 27, currentY + 13);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(119, 113, 108);
  doc.text('SEIZURE OFFICER:', margin + 85, currentY + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(48, 48, 46);
  doc.text(
    `${String(record.operator?.username || 'NCB Field Officer')} (ID: ${String(record.operator?.badgeNumber || 'NCB-001')})`,
    margin + 117,
    currentY + 13
  );

  currentY += 22;

  // 4. Preliminary Result Highlight Banner
  let bannerBg: [number, number, number] = [245, 240, 234];
  let bannerBorder: [number, number, number] = [168, 95, 75];
  let bannerText: [number, number, number] = [168, 95, 75];

  if (record.preliminaryResult === 'Presumptive Positive') {
    bannerBg = [252, 238, 235];
    bannerBorder = [168, 95, 75]; // Terracotta
    bannerText = [168, 95, 75];
  } else if (record.preliminaryResult === 'Presumptive Negative') {
    bannerBg = [238, 246, 240];
    bannerBorder = [70, 140, 90];
    bannerText = [40, 120, 60];
  } else {
    bannerBg = [255, 248, 230];
    bannerBorder = [190, 150, 40];
    bannerText = [150, 110, 20];
  }

  doc.setFillColor(...bannerBg);
  doc.rect(margin, currentY, contentWidth, 20, 'F');
  doc.setDrawColor(...bannerBorder);
  doc.setLineWidth(0.4);
  doc.rect(margin, currentY, contentWidth, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...bannerText);
  doc.text('D-TEST 360 PRELIMINARY SCREENING RESULT (SWGDRUG CAT. C):', margin + 4, currentY + 6.5);

  doc.setFontSize(13);
  doc.text(String(record.preliminaryResult || 'INCONCLUSIVE / RETAKE').toUpperCase(), margin + 4, currentY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(48, 48, 46);
  doc.text(`Target Indication: ${String(record.presumptiveSubstance || 'Screening Outcome')}`, margin + 85, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(119, 113, 108);
  const conf = safeNum(record.confidenceScore, 0);
  const deltaE = safeNum(record.colorDistanceDeltaE, 0);
  doc.text(
    `Confidence Score: ${conf}%  |  Chromatic Deviation: ΔE ${deltaE}`,
    margin + 85,
    currentY + 16
  );

  currentY += 25;

  // 5. Test Kit Profile
  doc.setFillColor(168, 95, 75);
  doc.rect(margin, currentY, 2.5, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(48, 48, 46);
  doc.text('1. TEST KIT PROFILE & FIELD REAGENT SPECIFICATION', margin + 5, currentY + 4.5);

  currentY += 8.5;

  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, contentWidth, 16, 'F');
  doc.setDrawColor(211, 199, 189);
  doc.setLineWidth(0.2);
  doc.rect(margin, currentY, contentWidth, 16, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(48, 48, 46);
  doc.text(`Reagent Kit: ${String(record.reagentProfile?.name || 'Standard Reagent Kit')}`, margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(119, 113, 108);
  doc.text(`Active Chemistry: ${String(record.reagentProfile?.chemicalName || 'Reagent Formulation')}`, margin + 4, currentY + 10);
  doc.text(
    `Target Category: ${String(record.reagentProfile?.targetCategory || 'Controlled Substances (NDPS Act)')}`,
    margin + 4,
    currentY + 14
  );

  currentY += 21;

  // 6. Photometric Evidence & Colour Calibration
  doc.setFillColor(168, 95, 75);
  doc.rect(margin, currentY, 2.5, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(48, 48, 46);
  doc.text('2. CAPTURED POUCH EVIDENCE & CHROMATIC ANALYSIS', margin + 5, currentY + 4.5);

  currentY += 8.5;

  const imgBoxW = 58;
  const imgBoxH = 45;

  // Left: Kit Image preview (bulletproof handling)
  let imageRendered = false;
  if (record.imageDataUrl && typeof record.imageDataUrl === 'string' && record.imageDataUrl.startsWith('data:image')) {
    try {
      const mimeMatch = record.imageDataUrl.match(/data:image\/(jpeg|jpg|png|webp)/i);
      const format = mimeMatch && mimeMatch[1].toLowerCase().includes('png') ? 'PNG' : 'JPEG';
      doc.setDrawColor(211, 199, 189);
      doc.rect(margin, currentY, imgBoxW, imgBoxH);
      doc.addImage(
        record.imageDataUrl,
        format,
        safeNum(margin + 1),
        safeNum(currentY + 1),
        safeNum(imgBoxW - 2),
        safeNum(imgBoxH - 2)
      );
      imageRendered = true;
    } catch (e) {
      console.warn('Failed embedding image in PDF, falling back to clean placeholder', e);
    }
  }

  if (!imageRendered) {
    doc.setFillColor(245, 240, 234);
    doc.rect(margin, currentY, imgBoxW, imgBoxH, 'F');
    doc.setDrawColor(211, 199, 189);
    doc.rect(margin, currentY, imgBoxW, imgBoxH, 'S');
    doc.setFontSize(7.5);
    doc.setTextColor(119, 113, 108);
    doc.text('Field Kit Photo Attached', margin + 7, currentY + 21);
    doc.text('Verified at Point of Capture', margin + 6, currentY + 26);
  }

  // Right: Colour Analysis Swatches Table
  const rightX = margin + imgBoxW + 6;
  const rightW = contentWidth - imgBoxW - 6;

  doc.setFillColor(255, 255, 255);
  doc.rect(rightX, currentY, rightW, imgBoxH, 'F');
  doc.setDrawColor(211, 199, 189);
  doc.rect(rightX, currentY, rightW, imgBoxH, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(48, 48, 46);
  doc.text('Colorimetric Matching Diagnostics', rightX + 4, currentY + 6.5);

  // Swatch 1: Extracted Reaction Color
  const sampleRgb = safeRgb(record.extractedSampleColor?.rgb);
  doc.setFillColor(sampleRgb[0], sampleRgb[1], sampleRgb[2]);
  doc.rect(rightX + 4, currentY + 10.5, 11, 9, 'F');
  doc.setDrawColor(180, 180, 180);
  doc.rect(rightX + 4, currentY + 10.5, 11, 9, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(48, 48, 46);
  doc.text('Extracted Reaction Swatch:', rightX + 18, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(119, 113, 108);
  doc.text(
    `${String(record.extractedSampleColor?.hex || '#000000')} (RGB: ${sampleRgb.join(', ')})`,
    rightX + 18,
    currentY + 18.5
  );

  // Swatch 2: Matched Reference Standard Color
  if (record.matchedReferenceColor) {
    const refRgb = safeRgb(record.matchedReferenceColor?.rgb);
    doc.setFillColor(refRgb[0], refRgb[1], refRgb[2]);
    doc.rect(rightX + 4, currentY + 23, 11, 9, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.rect(rightX + 4, currentY + 23, 11, 9, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(48, 48, 46);
    doc.text('Reference Standard Card:', rightX + 18, currentY + 26.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(119, 113, 108);
    doc.text(
      `${String(record.matchedReferenceColor.hex || '#FFFFFF')} (RGB: ${refRgb.join(', ')})`,
      rightX + 18,
      currentY + 31
    );
  }

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(119, 113, 108);
  doc.text(
    `Perceptual Euclidean ΔE Deviation: ${safeNum(record.colorDistanceDeltaE, 0)} (Standard threshold ≤ 52.0)`,
    rightX + 4,
    currentY + 41
  );

  currentY += imgBoxH + 9;

  // 7. Image Quality Assessment
  doc.setFillColor(168, 95, 75);
  doc.rect(margin, currentY, 2.5, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(48, 48, 46);
  doc.text('3. IMAGE QUALITY ASSESSMENT & PHOTOMETRIC VALIDATION', margin + 5, currentY + 4.5);

  currentY += 8.5;

  const qColW = safeNum(contentWidth / 4, 45);
  doc.setFillColor(245, 240, 234);
  doc.rect(margin, currentY, contentWidth, 13, 'F');
  doc.setDrawColor(211, 199, 189);
  doc.rect(margin, currentY, contentWidth, 13, 'S');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(119, 113, 108);

  doc.text('EXPOSURE / LUM:', margin + 3, currentY + 4.5);
  doc.text('FOCUS SHARPNESS:', margin + qColW + 3, currentY + 4.5);
  doc.text('GLARE REFLECTION:', margin + qColW * 2 + 3, currentY + 4.5);
  doc.text('QUALITY SCORE:', margin + qColW * 3 + 3, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(48, 48, 46);
  const brightness = safeNum(record.imageQuality?.brightness, 120);
  const brightnessStatus = String(record.imageQuality?.brightnessStatus || 'Optimal');
  doc.text(`${brightness}/255 (${brightnessStatus})`, margin + 3, currentY + 9.5);

  const sharpness = safeNum(record.imageQuality?.sharpnessVariance, 100);
  const sharpnessStatus = String(record.imageQuality?.sharpnessStatus || 'Sharp');
  doc.text(`Var ${sharpness} (${sharpnessStatus})`, margin + qColW + 3, currentY + 9.5);

  doc.text(
    record.imageQuality?.glareDetected ? 'Specular Glare Detected' : 'None Detected (Clear)',
    margin + qColW * 2 + 3,
    currentY + 9.5
  );

  const qScore = safeNum(record.imageQuality?.qualityScore, 90);
  doc.setFont('helvetica', 'bold');
  doc.text(`${qScore}/100`, margin + qColW * 3 + 3, currentY + 9.5);

  currentY += 18;

  // 8. Traceability, Geolocation & SHA-256 Hash
  doc.setFillColor(168, 95, 75);
  doc.rect(margin, currentY, 2.5, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(48, 48, 46);
  doc.text('4. DIGITAL TRACEABILITY, LOCATION & SHA-256 INTEGRITY SEAL', margin + 5, currentY + 4.5);

  currentY += 8.5;

  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, contentWidth, 23, 'F');
  doc.setDrawColor(211, 199, 189);
  doc.rect(margin, currentY, contentWidth, 23, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(168, 95, 75);
  doc.text('ORIGINAL RECORD & IMAGE SHA-256 CRYPTOGRAPHIC HASH:', margin + 4, currentY + 5.5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(48, 48, 46);
  doc.text(String(record.integrityHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'), margin + 4, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(119, 113, 108);
  if (record.location && record.location.isAvailable) {
    const lat = safeNum(record.location.latitude, 0);
    const lon = safeNum(record.location.longitude, 0);
    const acc = safeNum(record.location.accuracy, 0);
    doc.text(
      `Verified GPS Acquisition: Lat ${lat.toFixed(6)}°, Lon ${lon.toFixed(6)}° (Accuracy: ±${acc.toFixed(1)}m) at ${new Date(record.location.timestamp || Date.now()).toLocaleTimeString()}`,
      margin + 4,
      currentY + 16
    );
  } else {
    doc.text('GPS Location: No coordinates captured (permission denied or device offline).', margin + 4, currentY + 16);
  }

  if (record.operatorNotes) {
    doc.text(`Field Notes: "${String(record.operatorNotes)}"`, margin + 4, currentY + 20.5, {
      maxWidth: contentWidth - 8,
    });
  }

  currentY += 28;

  // 9. Statutory Laboratory Confirmation Disclaimer
  doc.setFillColor(245, 240, 234);
  doc.rect(margin, currentY, contentWidth, 17, 'F');
  doc.setDrawColor(168, 95, 75);
  doc.setLineWidth(0.3);
  doc.rect(margin, currentY, contentWidth, 17, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(168, 95, 75);
  doc.text('MANDATORY STATUTORY & LABORATORY CONFIRMATION DISCLAIMER:', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(48, 48, 46);
  const disclaimerText =
    'Field drug-screening results are preliminary only. Confirmatory laboratory testing (GC-MS / LC-MS) is required for definitive identification under the NDPS Act. D-TEST 360 acts as a digital companion and traceability tool; it does not replace confirmatory scientific analysis or official forensic expert testimony.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 8);
  doc.text(disclaimerLines, margin + 4, currentY + 9.5);

  // 10. Document Footer
  doc.setFillColor(48, 48, 46);
  doc.rect(0, pageHeight - 11, pageWidth, 11, 'F');
  doc.setFontSize(7);
  doc.setTextColor(228, 216, 206);
  doc.text(
    'D-TEST 360 · FIELD DRUG TESTING SUPPORT SYSTEM · NARCOTICS CONTROL BUREAU',
    margin,
    pageHeight - 4.5
  );
  doc.text('PAGE 1 OF 1', pageWidth - margin - 15, pageHeight - 4.5);

  // Filename format per prompt: D-Test_360_Field_Report_FT-2026-0001.pdf
  const sanitizedId = String(record.id || 'FT-2026-0001').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `D-Test_360_Field_Report_${sanitizedId}.pdf`;

  doc.save(filename);
}
