import { useLanguage, type Language } from '../contexts/LanguageContext';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'it', label: 'IT', flag: '🇮🇹' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
  ];

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-2 rounded-lg font-medium transition-all ${
            language === lang.code
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
          title={lang.label}
        >
          <span className="text-lg">{lang.flag}</span>
        </button>
      ))}
    </div>
  );
};
