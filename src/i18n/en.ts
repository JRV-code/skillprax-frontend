export const en = {
  // Common & Navigation
  buildMilestoneCurriculum: '⚡ Build My Milestone Curriculum',
  generatingCurriculum: 'Harvesting technical documentation and video demonstrations...',
  buildingSpine: 'Planning non-overlapping curriculum spine across milestones...',
  verified: 'Verified',
  unchecked: 'External Source',
  linkBrokenReplace: 'Link broken? Replace',
  findLinkForChapter: 'Find a link for this chapter',
  noVerifiedLink: 'No verified link yet',
  openOnYouTube: 'Open on YouTube',
  openOriginal: 'Original',
  readGamePlanFirst: 'Read the game plan first',
  generateGamePlan: 'Generate game plan',
  level: 'Level',
  of: 'of',
  newInThisStep: 'New in this step',
  buildsOn: 'Builds on',
  gotItShowChapters: 'Got it — show me the chapters',
  minutes: 'min',
  video: 'Video Demonstration',
  document: 'Technical Document',

  // Game plan (StepApproachBrief)
  milestoneGamePlan: 'Milestone Game Plan',
  whyNow: 'Why this milestone now',
  orderOfStudy: 'Recommended Study Order',
  howToStudy: 'How to Study This',
  commonMistakes: 'Common Pitfalls to Avoid',
  selfCheckQuestions: 'Self-Check Scenarios (Ungraded)',
  showHint: 'Show Hint',
  hideHint: 'Hide Hint',
  scoreToUnlock: 'Score {percent}% or more to unlock the next milestone',

  // Chapter Approach Guide
  focusForResource: 'Focus for this resource',
  guideBefore: 'Before opening',
  guideLookFor: 'Look for',
  guideDoWhile: 'While you consume',
  guideAfterCheck: 'Afterwards check',
  guideIgnore: 'Skip / skim',
  timebox: 'Timebox',

  // Quiz & Grading
  readyForQuiz: '⚡ Ready for Quiz — Start Socratic Evaluation',
  generateQuiz: '⚡ Generate Socratic Evaluation',
  evaluatingQuiz: 'Diagnosing mental models and calculating score...',
  submittingAnswers: 'Submitting answers...',
  passedLabel: 'PASSED',
  notYetLabel: 'NOT YET',
  neededCorrect: 'You needed {required} of {total} correct to pass ({threshold}%)',
  scorePercent: 'Score',
  milestoneCleared: 'Milestone Cleared',
  remediationRequired: 'Remediation Required',
  weakestChapter: 'Weakest Chapter',
  strengths: 'Demonstrated Strengths',
  gaps: 'Targeted Knowledge Gaps',
  nextActions: 'Recommended Next Actions',
  regenerateAnalysis: 'Regenerate Analysis in My Language',
  reviewAnswers: 'Review Answers & Source Grounding',
  basedOnChapter: 'Based on: Chapter {chapter} — {resource}',
  basedOnObjectives: 'Based on chapter objectives',
  quizCoverage: 'Quiz coverage: Chapters {chapters}',

  // YouTube modal / drawer
  closePlayer: 'Close Player',
  loadingVideo: 'Loading video player...',
  videoUnavailable: 'This video cannot be embedded. Click below to watch directly on YouTube.',

  // Sub-genres
  selectFocusArea: 'Select specific focus area:',
  customSubgenrePlaceholder: 'Or enter custom sub-genre / discipline...',
  suggestingSubgenres: 'Suggesting taxonomy focus areas...',
} as const;

export type UiStringKey = keyof typeof en;
