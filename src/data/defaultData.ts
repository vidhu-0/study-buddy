import { Flashcard, StudentProfile, WeakSpot } from "../types";

export const initialProfile: StudentProfile = {
  subject: "Biology & Cellular Respiration",
  level: "College / Undergrad",
  deadline: "Exam in 3 days",
  mode: "mastery",
  notesContext: `Cellular Respiration Overview:
1. Glycolysis: Occurs in cytoplasm. Converts 1 glucose into 2 pyruvate, generating net 2 ATP and 2 NADH. Anaerobic (no oxygen required).
2. Pyruvate Oxidation: Occurs in mitochondrial matrix. Converts pyruvate to Acetyl-CoA, releasing CO2 and producing NADH.
3. Krebs Cycle (Citric Acid Cycle): Mitochondrial matrix. Combines Acetyl-CoA with oxaloacetate to form citrate. Produces 2 ATP (or GTP), 6 NADH, 2 FADH2 per glucose molecule. Releases CO2.
4. Oxidative Phosphorylation (Electron Transport Chain + Chemiosmosis): Inner mitochondrial membrane. Electrons passed along complexes I-IV, pumping protons (H+) into intermembrane space creating electrochemical gradient. ATP synthase produces ~26-28 ATP via proton motive force. Oxygen is the final electron acceptor, forming H2O.
Common misconception: Glycolysis does not need mitochondria or oxygen.`,
  notesFileName: "Bio_Chapter7_Cellular_Respiration.txt",
  weakSpots: [
    {
      id: "ws-1",
      topic: "Proton Motive Force & ATP Synthase Mechanism",
      identifiedReason: "Struggled with how H+ concentration gradient in the intermembrane space drives the rotor of ATP synthase.",
      repetitionCount: 2,
      lastTestedDate: "Yesterday",
      mastered: false,
    },
    {
      id: "ws-2",
      topic: "Net ATP yield from Glycolysis vs Krebs Cycle",
      identifiedReason: "Confused gross ATP (4) with net ATP (2) in glycolysis.",
      repetitionCount: 1,
      lastTestedDate: "2 days ago",
      mastered: true,
    },
  ],
  completedTasksCount: 4,
  streakDays: 3,
};

export const defaultFlashcards: Flashcard[] = [
  {
    id: "fc-1",
    front: "Where does Glycolysis occur and does it require oxygen?",
    back: "In the cytoplasm (cytosol). It is anaerobic — it does NOT require oxygen!",
    category: "Glycolysis",
    difficulty: "easy",
    box: 3,
    reviewCount: 4,
  },
  {
    id: "fc-2",
    front: "What is the final electron acceptor in aerobic respiration?",
    back: "Molecular Oxygen (O₂). It binds electrons and protons to form water (H₂O).",
    category: "Oxidative Phosphorylation",
    difficulty: "easy",
    box: 2,
    reviewCount: 2,
  },
  {
    id: "fc-3",
    front: "What drives ATP Synthase to generate ATP from ADP and Pi?",
    back: "The electrochemical proton gradient (Proton Motive Force) across the inner mitochondrial membrane — protons flow back into the matrix through the enzyme.",
    category: "Chemiosmosis",
    difficulty: "medium",
    box: 1,
    reviewCount: 1,
  },
  {
    id: "fc-4",
    front: "Per 1 glucose molecule, how many turns of the Krebs cycle occur and what is the net yield?",
    back: "2 turns (one for each pyruvate/Acetyl-CoA). Yields: 2 ATP/GTP, 6 NADH, 2 FADH₂, and 4 CO₂.",
    category: "Krebs Cycle",
    difficulty: "medium",
    box: 2,
    reviewCount: 3,
  },
  {
    id: "fc-5",
    front: "Explain the difference between Substrate-Level Phosphorylation and Oxidative Phosphorylation.",
    back: "Substrate-level: Direct enzyme transfer of a phosphate group to ADP (Glycolysis & Krebs). Oxidative: Driven by electron transfer and chemiosmosis gradient (ETC).",
    category: "Energetics",
    difficulty: "hard",
    box: 1,
    reviewCount: 1,
  },
];
