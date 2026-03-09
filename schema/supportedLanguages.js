export const supportedLanguages = [
  { id: 'en', title: 'English', isDefault: true },
  { id: 'es', title: 'Español' },
];

export const baseLanguage = supportedLanguages.find(l => l.isDefault);
