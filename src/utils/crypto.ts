/**
 * Cryptographic SHA-256 Evidence Hashing & Verification
 * Generates an immutable digest of the canonical evidence record payload.
 */

export async function computeSha256(payload: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function createCanonicalEvidenceString(record: {
  id: string;
  caseReference?: string;
  operator: { username: string; badgeNumber: string };
  timestamp: string;
  reagentProfileId: string;
  preliminaryResult: string;
  presumptiveSubstance: string;
  sampleHex: string;
  qualityScore: number;
}): string {
  // Deterministic normalized JSON representation for verifiable reproducibility
  return JSON.stringify({
    id: record.id,
    caseRef: record.caseReference || 'UNASSIGNED',
    operator: `${record.operator.username}#${record.operator.badgeNumber}`,
    timestamp: record.timestamp,
    reagent: record.reagentProfileId,
    result: record.preliminaryResult,
    substance: record.presumptiveSubstance,
    sampleColor: record.sampleHex.toUpperCase(),
    qualityScore: record.qualityScore,
  });
}

export async function generateRecordHash(record: {
  id: string;
  caseReference?: string;
  operator: { username: string; badgeNumber: string };
  timestamp: string;
  reagentProfileId: string;
  preliminaryResult: string;
  presumptiveSubstance: string;
  sampleHex: string;
  qualityScore: number;
}): Promise<string> {
  const canonical = createCanonicalEvidenceString(record);
  return computeSha256(canonical);
}

export async function verifyRecordIntegrity(
  record: {
    id: string;
    caseReference?: string;
    operator: { username: string; badgeNumber: string };
    timestamp: string;
    reagentProfileId: string;
    preliminaryResult: string;
    presumptiveSubstance: string;
    sampleHex: string;
    qualityScore: number;
  },
  storedHash: string
): Promise<{ isValid: boolean; calculatedHash: string; storedHash: string }> {
  const calculatedHash = await generateRecordHash(record);
  return {
    isValid: calculatedHash === storedHash,
    calculatedHash,
    storedHash,
  };
}
