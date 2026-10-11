import { ReagentProfile } from '../types';

export const REAGENT_PROFILES: ReagentProfile[] = [
  {
    id: 'scott-reagent',
    name: 'Scott Reagent (Modified Cobalt Thiocyanate)',
    chemicalName: '2% Cobalt Thiocyanate in Water & Glycerin / Conc. HCl / Chloroform',
    targetCategory: 'Cocaine / Cocaine Hydrochloride / Cocaine Base (Crack)',
    testSteps: [
      'Ampoule 1: Add suspect powder to 2% Cobalt Thiocyanate solution. Look for blue precipitate.',
      'Ampoule 2: Break conc. HCl ampoule. Solution turns pink/dissolves.',
      'Ampoule 3: Break chloroform ampoule and agitate. Look for blue color extraction into the lower organic chloroform layer.',
    ],
    referenceColors: [
      {
        expectedHex: '#0D3B66',
        expectedRgb: { r: 13, g: 59, b: 102 },
        indication: 'Positive',
        substanceName: 'Presumptive Cocaine Base / Hydrochloride',
        description: 'Distinctive deep cobalt blue layer extracted into lower chloroform phase.',
      },
      {
        expectedHex: '#1B4965',
        expectedRgb: { r: 27, g: 73, b: 101 },
        indication: 'Positive',
        substanceName: 'Presumptive Cocaine Salt Form',
        description: 'Intense marine blue precipitate in initial test chamber.',
      },
    ],
    negativeExpectedColor: {
      hex: '#EAD9C9',
      description: 'Clear, pale pink or colorless lower layer with no cobalt blue extraction.',
    },
    forensicStandard: 'SWGDRUG Category C (Colorimetric Test)',
  },
  {
    id: 'marquis-reagent',
    name: 'Marquis Reagent',
    chemicalName: 'Formaldehyde (1 part) + Concentrated Sulfuric Acid (9 parts)',
    targetCategory: 'Opiates, Amphetamines, MDMA, Synthetic Phenethylamines',
    testSteps: [
      'Deposit suspect residue into disposable reaction chamber.',
      'Crush single reagent ampoule to release formaldehyde-acid solution.',
      'Observe immediate chromatic transition within 1–15 seconds.',
    ],
    referenceColors: [
      {
        expectedHex: '#6A1B9A',
        expectedRgb: { r: 106, g: 27, b: 154 },
        indication: 'Positive',
        substanceName: 'Presumptive Opiate (Morphine / Heroin / Codeine)',
        description: 'Immediate deep violet-purple chromatic shift.',
      },
      {
        expectedHex: '#D35400',
        expectedRgb: { r: 211, g: 84, b: 0 },
        indication: 'Positive',
        substanceName: 'Presumptive Amphetamine / Methamphetamine',
        description: 'Rapid orange transitioning to dark reddish-brown within 10 seconds.',
      },
      {
        expectedHex: '#1B1226',
        expectedRgb: { r: 27, g: 18, b: 38 },
        indication: 'Positive',
        substanceName: 'Presumptive MDMA / Ecstasy / MDA',
        description: 'Immediate dark purple flashing rapidly into jet-black precipitate.',
      },
    ],
    negativeExpectedColor: {
      hex: '#F9E79F',
      description: 'Pale straw yellow or unreacted colorless clear fluid.',
    },
    forensicStandard: 'SWGDRUG Category C (Colorimetric Test)',
  },
  {
    id: 'duquenois-levine',
    name: 'Duquenois-Levine Reagent',
    chemicalName: 'Acetaldehyde + Vanillin in 95% Ethanol / Conc. HCl / Chloroform',
    targetCategory: 'Cannabinoids (THC, Hashish, Cannabis Resin, Delta-8/9 Extracts)',
    testSteps: [
      'Place plant material or resin in upper reaction zone.',
      'Break Ampoule A (Duquenois solution) and Ampoule B (HCl). Observe deep purple color.',
      'Break Ampoule C (Chloroform). Shake gently. Confirm violet pigment transfers completely into the lower organic layer.',
    ],
    referenceColors: [
      {
        expectedHex: '#581845',
        expectedRgb: { r: 88, g: 24, b: 69 },
        indication: 'Positive',
        substanceName: 'Presumptive Tetrahydrocannabinol (THC / Cannabis)',
        description: 'Deep violet/indigo pigment fully partitioned into the lower chloroform layer.',
      },
    ],
    negativeExpectedColor: {
      hex: '#D7CCC8',
      description: 'Non-violet upper layer; clear or pale brown lower layer with no pigment transfer.',
    },
    forensicStandard: 'SWGDRUG Category C (Colorimetric Test)',
  },
  {
    id: 'simons-reagent',
    name: "Simon's Reagent",
    chemicalName: 'Sodium Nitroprusside + Acetaldehyde / 2% Sodium Carbonate',
    targetCategory: 'Secondary Amines (Methamphetamine, MDMA differentiation from Amphetamine)',
    testSteps: [
      'Place suspected residue on spot plate or reaction pouch.',
      'Apply Simon Reagent solution A followed by aqueous sodium carbonate solution B.',
      'Observe rapid formation of intense blue complex (indicating secondary amine).',
    ],
    referenceColors: [
      {
        expectedHex: '#0F4C81',
        expectedRgb: { r: 15, g: 76, b: 129 },
        indication: 'Positive',
        substanceName: 'Presumptive Methamphetamine / MDMA (Secondary Amine)',
        description: 'Rapid, vibrant cobalt blue color formation within 5 seconds.',
      },
    ],
    negativeExpectedColor: {
      hex: '#F5EEF8',
      description: 'No blue color; clear, pale pink, or faint yellow (indicates primary amine or non-reactive).',
    },
    forensicStandard: 'SWGDRUG Category C (Colorimetric Test)',
  },
  {
    id: 'mecke-reagent',
    name: 'Mecke Reagent',
    chemicalName: 'Selenious Acid (0.25 g) in Concentrated Sulfuric Acid (25 mL)',
    targetCategory: 'Heroin, Morphine, Psilocybin',
    testSteps: [
      'Deposit fine powder specimen.',
      'Crush glass ampoule to dispense Mecke reagent.',
      'Observe immediate blue-green color formation.',
    ],
    referenceColors: [
      {
        expectedHex: '#1E4D2B',
        expectedRgb: { r: 30, g: 77, b: 43 },
        indication: 'Positive',
        substanceName: 'Presumptive Heroin / Diacetylmorphine',
        description: 'Rapid transition into deep forest green to dark teal.',
      },
      {
        expectedHex: '#1B4965',
        expectedRgb: { r: 27, g: 73, b: 101 },
        indication: 'Positive',
        substanceName: 'Presumptive Psilocybin / Psilocin',
        description: 'Greenish-blue chromatic shift.',
      },
    ],
    negativeExpectedColor: {
      hex: '#FDFEFE',
      description: 'Colorless or faint amber with no green or teal shift.',
    },
    forensicStandard: 'SWGDRUG Category C (Colorimetric Test)',
  },
  {
    id: 'ehrlich-reagent',
    name: "Ehrlich's Reagent",
    chemicalName: 'p-Dimethylaminobenzaldehyde (p-DMAB) in Hydrochloric Acid / Ethanol',
    targetCategory: 'Indoles (LSD, DMT, Psilocin, Harmala Alkaloids)',
    testSteps: [
      'Apply reagent droplet to blotter paper fragment or powder.',
      'Allow 1–3 minutes for chromatic development (mild warmth accelerates).',
      'Observe purple-magenta color emergence.',
    ],
    referenceColors: [
      {
        expectedHex: '#7B1FA2',
        expectedRgb: { r: 123, g: 31, b: 162 },
        indication: 'Positive',
        substanceName: 'Presumptive Indole / LSD / Psilocin',
        description: 'Emergence of characteristic purple to deep magenta chromatic complex.',
      },
    ],
    negativeExpectedColor: {
      hex: '#FFFFFF',
      description: 'No color change or pale yellow staining.',
    },
    forensicStandard: 'SWGDRUG Category C (Colorimetric Test)',
  },
];
