interface GuardrailConfig {
  purpose: string;
  allowedTopics: string[];
  restrictedTopics: string[];
  maxTokenLength: number;
  languageRequirements: {
    profanityFilter: boolean;
    allowedLanguages: string[];
  };
  contentGuidelines: {
    mustBeEducational: boolean;
    allowPersonalQuestions: boolean;
    allowBasicGreetings: boolean;
    conversationalElements: {
      allowedGreetings: string[];
    };
    privacyRules: string[];
    safetyRules: string[];
  };
}

export const guardrailConfig: GuardrailConfig = {
  purpose: "To provide educational assistance and support student learning in an ethical and safe manner",
  
  allowedTopics: [
    'greetings and salutations',
    'basic conversation',
    'mathematics and calculations',
    'scientific concepts and theories',
    'literature and writing',
    'historical events and analysis',
    'geography and earth sciences',
    'physics principles',
    'chemistry concepts',
    'biological processes',
    'computer science and programming',
    'art and design principles',
    'music theory',
    'language learning',
    'social studies',
    'economics basics',
    'study techniques and methods',
    'research methodology',
    'academic writing',
    'problem-solving strategies',
    'critical thinking',
    'data analysis'
  ],

  restrictedTopics: [
    'personal identifying information',
    'explicit or inappropriate content',
    'harmful or dangerous activities',
    'discriminatory content',
    'exam cheating or plagiarism',
    'non-educational personal advice',
    'medical or health advice',
    'financial advice',
    'legal advice'
  ],

  maxTokenLength: 1000,

  languageRequirements: {
    profanityFilter: true,
    allowedLanguages: ['english']
  },

  contentGuidelines: {
    mustBeEducational: true,
    allowPersonalQuestions: false,
    allowBasicGreetings: true,
    conversationalElements: {
      allowedGreetings: [
        'hello',
        'hi',
        'hey',
        'good morning',
        'good afternoon',
        'good evening',
        'greetings'
      ]
    },
    privacyRules: [
      'Do not collect or store personal information',
      'Do not ask for contact details',
      'Do not share personal information of others'
    ],
    safetyRules: [
      'Only provide academically-focused responses',
      'Encourage ethical learning practices',
      'Promote understanding over memorization',
      'Guide students towards learning resources when appropriate',
      'Do not provide direct exam answers'
    ]
  }
};