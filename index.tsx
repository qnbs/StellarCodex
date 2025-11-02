import React, { useState, useEffect, useCallback, StrictMode, memo, useRef, createContext, useContext, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import * as idb from 'idb';
import * as lucide from 'lucide-react';

// =================================================================================
// VIRTUAL FILE: src/types/index.ts
// DESCRIPTION: Centralized type definitions for the entire application.
// =================================================================================
type ThemeName = keyof typeof THEMES;
type Language = keyof typeof LANGUAGES;
type View = typeof VIEWS[keyof typeof VIEWS];

interface Concept {
    id: number;
    concept: string;
    scientificBasis: string;
    plausibility: string;
    details: string;
}

type ConceptCreate = Omit<Concept, 'id'>;

interface FeedbackState {
    id: number;
    message: string;
    type: 'success' | 'delete' | 'error';
}

type Theme = {
    accentText: string;
    accentBorder: string;
    accentBg: string;
    accentHoverBg: string;
    accentGlow: string;
    name: string;
};

type Themes = Record<ThemeName, Theme>;
type TranslationSet = typeof translations.en;


// =================================================================================
// VIRTUAL FILE: src/lib/constants.ts
// DESCRIPTION: Application-wide constants to avoid magic strings and numbers.
// =================================================================================
const DB_NAME = 'StellarCodexDB';
const STORE_NAME = 'concepts';
const DB_VERSION = 1;

const THEMES = { cyan: 'cyan', amber: 'amber' } as const;
const LANGUAGES = { en: 'en', de: 'de' } as const;
const VIEWS = {
    ORBITAL: 'orbital',
    DATABASE: 'database',
    TRACKER: 'tracker',
    SETTINGS: 'settings',
    HELP: 'help'
} as const;

const themes: Themes = {
    cyan: { name: "Cyan", accentText: 'text-cyan-400', accentBorder: 'border-cyan-500', accentBg: 'bg-cyan-600', accentHoverBg: 'hover:bg-cyan-500', accentGlow: 'focus-visible:ring-cyan-500' },
    amber: { name: "Amber", accentText: 'text-amber-400', accentBorder: 'border-amber-500', accentBg: 'bg-amber-600', accentHoverBg: 'hover:bg-amber-500', accentGlow: 'focus-visible:ring-amber-500' },
};


// =================================================================================
// VIRTUAL FILE: src/services/database.ts
// DESCRIPTION: Encapsulates all IndexedDB logic, separating it from the UI.
// =================================================================================
const databaseService = {
    dbPromise: idb.openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    }),

    async getAllConcepts(): Promise<Concept[]> {
        // AUDIT FIX: Fetch concepts in reverse order directly from IDB for better performance.
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const results: Concept[] = [];
        let cursor = await store.openCursor(null, 'prev');
        while (cursor) {
            results.push(cursor.value);
            cursor = await cursor.continue();
        }
        return results;
    },
    async addConcept(concept: ConceptCreate): Promise<number> {
        return (await this.dbPromise).add(STORE_NAME, concept);
    },
    async getConcept(id: number): Promise<Concept | undefined> {
        return (await this.dbPromise).get(STORE_NAME, id);
    },
    async updateConcept(concept: Concept): Promise<void> {
        await (await this.dbPromise).put(STORE_NAME, concept);
    },
    async deleteConcept(id: number): Promise<void> {
        await (await this.dbPromise).delete(STORE_NAME, id);
    },
    async clearDatabase(): Promise<void> {
        await (await this.dbPromise).clear(STORE_NAME);
    }
};


// =================================================================================
// VIRTUAL FILE: src/context/ThemeContext.tsx
// =================================================================================
const ThemeContext = createContext<{ theme: Theme; setTheme: (name: ThemeName) => void; themeName: ThemeName } | null>(null);
const useTheme = () => useContext(ThemeContext)!;

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeName, setThemeName] = useState<ThemeName>(() => (localStorage.getItem('hsc-theme') as ThemeName) || THEMES.cyan);

    useEffect(() => {
        const bodyClass = document.body.classList;
        bodyClass.remove('theme-cyan', 'theme-amber');
        bodyClass.add(`theme-${themeName}`);
    }, [themeName]);

    const setTheme = useCallback((name: ThemeName) => {
        localStorage.setItem('hsc-theme', name);
        setThemeName(name);
    }, []);

    const value = { theme: themes[themeName], setTheme, themeName };
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};


// =================================================================================
// VIRTUAL FILE: src/context/LocaleContext.tsx
// =================================================================================
const LocaleContext = createContext<{ language: Language; setLanguage: (lang: Language) => void; texts: TranslationSet } | null>(null);
const useLocale = () => useContext(LocaleContext)!;

const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('hsc-lang') as Language) || LANGUAGES.en);

    const handleSetLanguage = useCallback((lang: Language) => {
        localStorage.setItem('hsc-lang', lang);
        setLanguage(lang);
        document.documentElement.lang = lang;
    }, []);

    useEffect(() => { document.documentElement.lang = language; }, [language]);

    const value = { language, setLanguage: handleSetLanguage, texts: translations[language] };
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};


// =================================================================================
// VIRTUAL FILE: src/context/DatabaseContext.tsx
// =================================================================================
interface DatabaseContextType {
    concepts: Concept[];
    loading: boolean;
    addConcept: (concept: ConceptCreate) => Promise<void>;
    updateConcept: (concept: Concept) => Promise<void>;
    deleteConcept: (id: number) => Promise<void>;
    clearDatabase: () => Promise<void>;
}
const DatabaseContext = createContext<DatabaseContextType | null>(null);
const useDatabase = () => useContext(DatabaseContext)!;

const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConcepts = async () => {
            try {
                // AUDIT FIX: Removed client-side .reverse() as the DB now provides data in the correct order.
                const allConcepts = await databaseService.getAllConcepts();
                setConcepts(allConcepts);
            } catch (error) { console.error("DB Fetch Failed:", error); }
            finally { setLoading(false); }
        };
        fetchConcepts();
    }, []);

    const addConcept = async (concept: ConceptCreate) => {
        // AUDIT FIX (Robustness): Update DB first, then update state on success.
        const id = await databaseService.addConcept(concept);
        const newConcept = await databaseService.getConcept(id); // Fetch the full object to ensure consistency
        if(newConcept) {
            setConcepts(prev => [newConcept, ...prev]);
        }
    };
    const updateConcept = async (concept: Concept) => {
        // AUDIT FIX (Robustness): Update DB first, then update state on success.
        await databaseService.updateConcept(concept);
        setConcepts(prev => prev.map(c => c.id === concept.id ? concept : c));
    };
    const deleteConcept = async (id: number) => {
        // AUDIT FIX (Robustness): Update DB first, then update state on success.
        await databaseService.deleteConcept(id);
        setConcepts(prev => prev.filter(c => c.id !== id));
    };
    const clearDatabase = async () => {
         // AUDIT FIX (Robustness): Update DB first, then update state on success.
        await databaseService.clearDatabase();
        setConcepts([]);
    };
    
    const value = { concepts, loading, addConcept, updateConcept, deleteConcept, clearDatabase };
    return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};


// =================================================================================
// VIRTUAL FILE: src/context/ToastContext.tsx
// =================================================================================
const ToastContext = createContext<{ addToast: (message: string, type?: FeedbackState['type']) => void } | null>(null);
const useToast = () => useContext(ToastContext)!;

const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<FeedbackState[]>([]);
    const addToast = useCallback((message: string, type: FeedbackState['type'] = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 3500);
    }, []);
    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-50 space-y-2">
                {toasts.map(toast => <FeedbackToast key={toast.id} {...toast} />)}
            </div>
        </ToastContext.Provider>
    );
};


// =================================================================================
// VIRTUAL FILE: src/context/ViewContext.tsx
// =================================================================================
const ViewContext = createContext<{ currentView: View; setView: (view: View) => void; } | null>(null);
const useView = () => useContext(ViewContext)!;

const ViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setView] = useState<View>(VIEWS.ORBITAL);
    const value = { currentView, setView: useCallback(setView, []) };
    return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};


// =================================================================================
// VIRTUAL FILE: src/context/AppProviders.tsx
// DESCRIPTION: Combines all context providers into a single component.
// =================================================================================
const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ThemeProvider>
        <LocaleProvider>
            <DatabaseProvider>
                <ViewProvider>
                    <ToastProvider>{children}</ToastProvider>
                </ViewProvider>
            </DatabaseProvider>
        </LocaleProvider>
    </ThemeProvider>
);


// =================================================================================
// VIRTUAL FILE: src/components/ui/Icon.tsx
// =================================================================================
const Icon: React.FC<{ name: keyof typeof lucide; className?: string }> = ({ name, className }) => {
    const LucideIcon = lucide[name];
    return LucideIcon ? <LucideIcon className={className} aria-hidden="true" /> : null;
};


// =================================================================================
// VIRTUAL FILE: src/components/ui/Spinner.tsx
// =================================================================================
const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <Icon name="LoaderCircle" className={`w-8 h-8 animate-spin ${className}`} />
);


// =================================================================================
// VIRTUAL FILE: src/components/ui/Button.tsx
// =================================================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    children: React.ReactNode;
    leftIcon?: keyof typeof lucide;
    size?: 'normal' | 'small';
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'normal', children, leftIcon, className = '', ...props }, ref) => {
    const { theme } = useTheme();
    const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
    const sizeStyles = { normal: "px-4 py-2 text-sm rounded-md", small: "p-2 rounded" };
    const variantStyles = {
        primary: `${theme.accentBg} ${theme.accentHoverBg} text-white ${theme.accentGlow}`,
        secondary: `bg-gray-700 hover:bg-gray-600 text-gray-200 ${theme.accentGlow}`,
        danger: `bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-500`,
        ghost: `text-gray-400 hover:${theme.accentText} ${theme.accentGlow}`
    };
    return (
        <button ref={ref} className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
            {leftIcon && <Icon name={leftIcon} className="w-4 h-4" />}
            {children}
        </button>
    );
});


// =================================================================================
// VIRTUAL FILE: src/components/ui/FeedbackToast.tsx
// =================================================================================
const FeedbackToast: React.FC<FeedbackState> = memo(({ message, type }) => {
    const [isExiting, setIsExiting] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsExiting(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    const toastStyles = {
        success: 'bg-green-600/30 border-green-500 text-green-300',
        delete: 'bg-red-600/30 border-red-500 text-red-300',
        error: 'bg-orange-600/30 border-orange-500 text-orange-300',
    };
    const iconName = { success: 'CheckCircle2', delete: 'Trash2', error: 'AlertTriangle' };

    return (
        <div className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl border backdrop-blur-sm ${toastStyles[type]} ${isExiting ? 'toast-exit' : 'toast-enter'}`} role="status" aria-live="polite">
            <Icon name={iconName[type] as keyof typeof lucide} className="w-5 h-5" />
            <span className="font-bold">{message}</span>
        </div>
    );
});


// =================================================================================
// VIRTUAL FILE: src/components/layout/Header.tsx
// =================================================================================
const Header: React.FC = memo(() => {
    const { theme } = useTheme();
    const { currentView, setView } = useView();
    const { texts } = useLocale();

    const navItems = [
        { id: VIEWS.ORBITAL, label: texts.header.nav.orbital, icon: 'Orbit' },
        { id: VIEWS.DATABASE, label: texts.header.nav.database, icon: 'DatabaseZap' },
        { id: VIEWS.TRACKER, label: texts.header.nav.tracker, icon: 'Satellite' },
        { id: VIEWS.SETTINGS, label: texts.header.nav.settings, icon: 'Settings' },
        { id: VIEWS.HELP, label: texts.header.nav.help, icon: 'HelpCircle' },
    ] as const;

    return (
        <header className={`bg-gray-950/70 backdrop-blur-sm border-b ${theme.accentBorder}/20 p-4 sticky top-0 z-20`}>
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Icon name="Rocket" className={`w-8 h-8 ${theme.accentText}`} />
                    <h1 className="text-xl md:text-2xl font-orbitron text-white hidden sm:block">{texts.header.title}</h1>
                </div>
                <nav className="flex items-center gap-1 md:gap-2">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setView(item.id)} aria-current={currentView === item.id ? 'page' : undefined} className={`flex items-center gap-2 px-2 md:px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 transform active:scale-95 ${currentView === item.id ? `bg-cyan-500/20 ${theme.accentText} shadow-lg` : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <Icon name={item.icon} className="w-4 h-4" />
                            <span className="hidden md:inline">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
});


// =================================================================================
// VIRTUAL FILE: src/views/OrbitalExplorer/index.tsx
// =================================================================================
const OrbitalExplorer: React.FC = memo(() => {
    const { theme } = useTheme();
    const { texts } = useLocale();
    const t = texts.orbitalExplorer;
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const InfoCard: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
         <div className="space-y-1">
            <h4 className={`font-bold ${theme.accentText}`}>{title}</h4>
            <div className="pl-4 border-l-2 border-white/10 space-y-1 text-sm">{children}</div>
        </div>
    );
    
    return (
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg`}>
                <h2 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{t.title}</h2>
                <div className="aspect-video w-full bg-black rounded-md flex items-center justify-center border border-cyan-900 overflow-hidden">
                     <svg width="100%" height="100%" viewBox="0 0 400 200">
                        <defs><radialGradient id="starGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor='#ffddaa'/><stop offset="100%" stopColor='#ff8c00' stopOpacity="0" /></radialGradient><path id="orbitPath" d="M 50 100 A 150 75 0 1 0 350 100 A 150 75 0 1 0 50 100" fill="none" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="2,2" /></defs>
                        <g><circle cx="200" cy="100" r="10" fill="url(#starGradient)"><animate attributeName="opacity" values="1;0.9;1" dur="3s" repeatCount="indefinite" /></circle></g>
                        <use href="#orbitPath" />
                        <g><circle cx="0" cy="0" r="4" fill="#67e8f9" /><animateMotion dur="12s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.65 0 0.35 1"><mpath href="#orbitPath" /></animateMotion></g>
                    </svg>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">{t.mock_note}</p>
            </div>
            <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg flex flex-col`}>
                <h3 className={`text-xl font-orbitron ${theme.accentText} mb-4`}>{t.data_title}</h3>
                <div className="space-y-4 flex-grow text-sm">
                   <InfoCard title={t.star.name}><p><strong>{t.star_type}:</strong> {t.star.type}</p></InfoCard>
                   <InfoCard title={t.planet.name}>
                        <p><strong>{t.gravity}:</strong> {t.planet.gravity}</p><p><strong>{t.pressure}:</strong> {t.planet.pressure}</p><p><strong>{t.temp}:</strong> {t.planet.temperature}</p><p><strong>{t.orbital_period_label}:</strong> {t.planet.orbital_period}</p><p><strong>{t.semi_major_axis_label}:</strong> {t.planet.semi_major_axis}</p><p><strong>{t.tidal_lock_label}:</strong> {t.planet.tidal_lock}</p>
                   </InfoCard>
                </div>
                <Button onClick={() => setAnalysisResult(t.analysis_result)} className="mt-4 w-full">{t.button}</Button>
                {analysisResult && <p className="mt-4 text-xs bg-gray-900 p-2 rounded border border-gray-700">{analysisResult}</p>}
            </div>
        </div>
    );
});


// =================================================================================
// VIRTUAL FILE: src/views/ConceptDatabase/components/ConceptEmptyState.tsx
// =================================================================================
const ConceptEmptyState: React.FC<{ onAdd: () => void }> = memo(({ onAdd }) => {
    const { theme } = useTheme();
    const { texts } = useLocale();
    const t = texts.conceptDatabase.empty;
    return (
        <div className={`relative text-center py-24 px-4 border-2 border-dashed ${theme.accentBorder}/20 rounded-lg flex flex-col items-center justify-center gap-4 overflow-hidden bg-gray-900/20 animated-grid`}>
            <div className={`absolute inset-0 bg-radial-gradient from-gray-950/0 via-gray-950 to-gray-950`}></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className={`relative p-4 bg-gray-900/50 rounded-full border ${theme.accentBorder}/20`}><Icon name="BrainCircuit" className={`w-16 h-16 mx-auto ${theme.accentText}`} /><div className={`absolute -top-1 -right-1 w-5 h-5 ${theme.accentBg} rounded-full flex items-center justify-center`}><Icon name="Sparkles" className="w-3 h-3 text-white" /></div></div>
                <h3 className="text-xl font-orbitron text-white mt-4">{t.title}</h3>
                <p className="max-w-md text-gray-400">{t.subtitle}</p>
                <Button onClick={onAdd} leftIcon="Plus" className="mt-2">{t.button}</Button>
            </div>
        </div>
    );
});


// =================================================================================
// VIRTUAL FILE: src/views/ConceptDatabase/components/ConceptListItem.tsx
// =================================================================================
const ConceptListItem: React.FC<{ concept: Concept; onEdit: () => void; onDelete: () => void; }> = memo(({ concept, onEdit, onDelete }) => {
    const { theme } = useTheme();
    const { texts } = useLocale();
    const t = texts.conceptDatabase;
    const isHigh = concept.plausibility === 'High' || concept.plausibility === 'Hoch';
    const isMedium = concept.plausibility === 'Medium' || concept.plausibility === 'Mittel';
    const plausibilityColor = isHigh ? 'bg-green-500/20 text-green-300' : isMedium ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300';
    return (
        <div className={`bg-gray-900/50 border ${theme.accentBorder}/10 p-4 rounded-lg flex justify-between items-start`}>
            <div>
                <h4 className={`text-lg font-bold ${theme.accentText}`}>{concept.concept}</h4>
                <p className="text-sm text-gray-400"><strong>{t.entry.basis}:</strong> {concept.scientificBasis}</p>
                <p className="text-sm text-gray-400 mt-2"><strong>{t.entry.details}:</strong> {concept.details || 'N/A'}</p>
                <div className="flex items-center gap-3 mt-2"><span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${plausibilityColor}`}>{concept.plausibility}</span></div>
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-4">
                <Button onClick={onEdit} aria-label={t.form.edit_label} variant="ghost" size="small"><Icon name="Pencil" className="w-4 h-4" /></Button>
                <Button onClick={onDelete} aria-label={t.form.delete_label} variant="ghost" size="small" className="hover:text-red-500"><Icon name="Trash2" className="w-4 h-4" /></Button>
            </div>
        </div>
    );
});


// =================================================================================
// VIRTUAL FILE: src/views/ConceptDatabase/components/ConceptForm.tsx
// =================================================================================
const ConceptForm: React.FC<{ initialData?: Concept; onSave: (data: ConceptCreate | Concept) => Promise<void>; onCancel: () => void }> = memo(({ initialData, onSave, onCancel }) => {
    const { theme } = useTheme();
    const { texts } = useLocale();
    const t = texts.conceptDatabase.form;
    const isEditing = !!initialData;
    const [formState, setFormState] = useState<ConceptCreate>(() => initialData || { concept: '', scientificBasis: '', plausibility: 'Medium', details: '' });
    const [isSaving, setIsSaving] = useState(false);
    const conceptInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { conceptInputRef.current?.focus(); }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formState.concept || !formState.scientificBasis) { alert(t.required_alert); return; }
        setIsSaving(true);
        await onSave(isEditing ? { ...formState, id: initialData.id } : formState);
        setIsSaving(false);
    };

    return (
        <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg mb-8 form-enter`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className={`text-xl font-orbitron ${theme.accentText}`}>{isEditing ? t.edit_title : t.add_title}</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="concept-input">{t.concept_label}</label>
                    <input ref={conceptInputRef} id="concept-input" type="text" name="concept" value={formState.concept} onChange={handleInputChange} className={`w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder}`} required disabled={isSaving} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="basis-input">{t.basis_label}</label>
                    <input id="basis-input" type="text" name="scientificBasis" value={formState.scientificBasis} onChange={handleInputChange} className={`w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder}`} required disabled={isSaving} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plausibility-select">{t.plausibility_label}</label>
                    <select id="plausibility-select" name="plausibility" value={formState.plausibility} onChange={handleInputChange} className={`w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder}`} disabled={isSaving}>
                        {t.plausibility_options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="details-textarea">{t.details_label}</label>
                    <textarea id="details-textarea" name="details" value={formState.details} onChange={handleInputChange} rows={4} className={`w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder}`} disabled={isSaving}></textarea>
                </div>
                <div className="flex gap-4">
                    <Button type="submit" disabled={isSaving} className="flex-1">
                        {isSaving && <Spinner className="w-4 h-4" />}
                        {isEditing ? (isSaving ? t.updating_button : t.update_button) : (isSaving ? t.saving_button : t.save_button)}
                    </Button>
                    <Button type="button" onClick={onCancel} disabled={isSaving} variant="secondary" className="flex-1">{t.cancel_button}</Button>
                </div>
            </form>
        </div>
    );
});


// =================================================================================
// VIRTUAL FILE: src/views/ConceptDatabase/index.tsx
// =================================================================================
const ConceptDatabase: React.FC = memo(() => {
    const { concepts, loading, addConcept, updateConcept, deleteConcept } = useDatabase();
    const { theme } = useTheme();
    const { addToast } = useToast();
    const { texts } = useLocale();
    const t = texts.conceptDatabase;
    const [editingConcept, setEditingConcept] = useState<Concept | undefined>(undefined);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleSave = useCallback(async (data: ConceptCreate | Concept) => {
        try {
            if ('id' in data) { await updateConcept(data); addToast(t.feedback.updated); } 
            else { await addConcept(data); addToast(t.feedback.saved); }
            setIsFormVisible(false);
            setEditingConcept(undefined);
        } catch (error) { addToast(t.feedback.error, 'error'); }
    }, [updateConcept, addConcept, addToast, t]);

    const handleDelete = useCallback(async (id: number) => {
        if (window.confirm(t.delete_confirm)) {
            try { await deleteConcept(id); addToast(t.feedback.deleted, 'delete'); } 
            catch (error) { addToast(t.feedback.error, 'error'); }
        }
    }, [deleteConcept, addToast, t]);

    const handleStartAdding = () => { setEditingConcept(undefined); setIsFormVisible(true); };
    const handleStartEditing = (concept: Concept) => { setEditingConcept(concept); setIsFormVisible(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleCancel = () => { setIsFormVisible(false); setEditingConcept(undefined); };

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-orbitron ${theme.accentText}`}>{t.title}</h2>
                {!isFormVisible && <Button onClick={handleStartAdding} leftIcon="Plus">{t.add_button}</Button>}
            </div>
            {isFormVisible && <ConceptForm key={editingConcept?.id ?? 'new'} initialData={editingConcept} onSave={handleSave} onCancel={handleCancel} />}
            {loading && <div className="flex justify-center py-12"><Spinner /></div>}
            {!loading && (
                <div className="space-y-4">
                    {concepts.length > 0 ? (
                        concepts.map(c => <ConceptListItem key={c.id} concept={c} onEdit={() => handleStartEditing(c)} onDelete={() => handleDelete(c.id)} />)
                    ) : (
                        !isFormVisible && <ConceptEmptyState onAdd={handleStartAdding} />
                    )}
                </div>
            )}
        </div>
    );
});


// =================================================================================
// VIRTUAL FILE: src/views/ScienceTracker/index.tsx
// =================================================================================
const ScienceTracker: React.FC = memo(() => {
    const { theme } = useTheme();
    const { texts } = useLocale();
    const t = texts.scienceTracker;

    const InfoCard: React.FC<{item: {title: string; summary?: string; implications?: string; analysis?: string}}> = ({item}) => (
        <div className={`bg-gray-900/50 border ${theme.accentBorder}/10 p-4 rounded-lg`}>
            <h4 className={`font-bold ${theme.accentText} mb-1`}>{item.title}</h4>
            {item.summary && <p className="text-sm text-gray-400 mb-2">{item.summary}</p>}
            {item.analysis && <p className="text-sm text-gray-400">{item.analysis}</p>}
            {item.implications && <p className="text-xs text-cyan-200/70 border-l-2 border-cyan-500/50 pl-2"><span className="font-bold">Implications: </span>{item.implications}</p>}
        </div>
    );
    
    return (
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6"><h2 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{t.feed_title}</h2>{t.scienceFeed.map((item, index) => <InfoCard key={index} item={item} />)}</div>
            <div className="space-y-6"><h2 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{t.analysis_title}</h2>{t.literaryAnalysis.map((item, index) => <InfoCard key={index} item={item} />)}</div>
        </div>
    );
});


// =================================================================================
// VIRTUAL FILE: src/views/Settings/index.tsx
// =================================================================================
const Settings: React.FC = memo(() => {
    const { theme, setTheme, themeName } = useTheme();
    const { language, setLanguage, texts } = useLocale();
    const t = texts.settings;
    const { clearDatabase } = useDatabase();
    const { addToast } = useToast();

    const handleClearDB = async () => {
        if (window.confirm(t.data.confirm)) { 
            try {
                await clearDatabase(); 
                addToast(t.feedback.db_cleared, 'success'); 
            } catch(e) {
                 addToast(texts.conceptDatabase.feedback.error, 'error');
            }
        }
    };
    const handleThemeChange = (key: ThemeName) => { setTheme(key); addToast(t.feedback.theme_updated(themes[key].name)); }
    const handleLanguageChange = (lang: Language) => { setLanguage(lang); addToast(t.feedback.language_updated(lang === 'en' ? 'English' : 'Deutsch')); }
    
    const SettingsCard: React.FC<{title:string; description:string; children: ReactNode; variant?:'normal'|'danger'}> = ({title, description, children, variant='normal'}) => (
        <div className={`${variant === 'danger' ? 'bg-red-900/20 border-red-500/30' : `bg-gray-900/50 border-${theme.accentBorder}/20`} border p-6 rounded-lg`}>
            <h3 className={`text-xl font-bold mb-2 ${variant === 'danger' && 'text-red-300'}`}>{title}</h3>
            <p className={`${variant === 'danger' ? 'text-red-400' : 'text-gray-400'} mb-4`}>{description}</p>
            {children}
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h2 className={`text-3xl font-orbitron ${theme.accentText} mb-8`}>{t.title}</h2>
            <div className="space-y-8">
                <SettingsCard title={t.theme.title} description={t.theme.description}>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(Object.keys(themes) as ThemeName[]).map(key => (
                            <button key={key} onClick={() => handleThemeChange(key)} className={`p-4 rounded-lg border-2 transition-all transform active:scale-95 ${themeName === key ? `${themes[key].accentBorder}` : 'border-gray-700 hover:border-gray-500'}`}>
                                <div className="flex items-center gap-4"><div className={`w-8 h-8 rounded-full ${themes[key].accentBg}`}></div><span className="text-lg font-bold">{themes[key].name}</span></div>
                            </button>
                        ))}
                    </div>
                </SettingsCard>
                <SettingsCard title={t.language.title} description={t.language.description}>
                     <div className="flex bg-gray-900 p-1 rounded-md">
                        <button onClick={() => handleLanguageChange(LANGUAGES.en)} className={`w-full py-2 rounded-md transition-colors transform active:scale-95 ${language === 'en' ? `${theme.accentBg} text-white font-bold` : 'hover:bg-gray-800 text-gray-300'}`}>English</button>
                        <button onClick={() => handleLanguageChange(LANGUAGES.de)} className={`w-full py-2 rounded-md transition-colors transform active:scale-95 ${language === 'de' ? `${theme.accentBg} text-white font-bold` : 'hover:bg-gray-800 text-gray-300'}`}>Deutsch</button>
                    </div>
                </SettingsCard>
                <SettingsCard title={t.data.title} description={t.data.description} variant="danger">
                    <Button onClick={handleClearDB} variant="danger" leftIcon="Trash2">{t.data.button}</Button>
                </SettingsCard>
            </div>
        </div>
    );
});


// =================================================================================
// VIRTUAL FILE: src/views/Help/index.tsx
// =================================================================================
const Help: React.FC = memo(() => {
    const { theme } = useTheme();
    const { texts } = useLocale();
    const t = texts.help;
    const [openSection, setOpenSection] = useState<string | null>(null);

    const AccordionItem: React.FC<{id: string; title: string; children: ReactNode;}> = ({ id, title, children }) => {
        const isOpen = openSection === id;
        return (
            <div className={`border-b ${theme.accentBorder}/20 last:border-b-0`}>
                <button onClick={() => setOpenSection(isOpen ? null : id)} className="w-full text-left flex justify-between items-center p-4 hover:bg-gray-800/50 transition-colors">
                    <h4 className="text-lg font-bold">{title}</h4>
                    <Icon name="ChevronDown" className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                <div className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out ${isOpen && 'grid-rows-[1fr]'}`}><div className="overflow-hidden"><div className="p-4 pt-0 text-gray-400">{children}</div></div></div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h2 className={`text-3xl font-orbitron ${theme.accentText} mb-4`}>{t.title}</h2>
            <p className="mb-8 text-gray-400">{t.intro}</p>
            <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 rounded-lg mb-8`}>
                {(Object.entries(t.sections)).map(([key, section]) => {
                    const typedSection = section as { title: string; content: string };
                    return (<AccordionItem key={key} id={key} title={typedSection.title}>{typedSection.content}</AccordionItem>);
                })}
            </div>
            <h3 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{t.faq.title}</h3>
            <div className="space-y-4 mb-8">
                <div><h4 className="font-bold">{t.faq.q1}</h4><p className="text-gray-400">{t.faq.a1}</p></div>
                <div><h4 className="font-bold">{t.faq.q2}</h4><p className="text-gray-400">{t.faq.a2}</p></div>
            </div>
        </div>
    );
});


// =================================================================================
// VIRTUAL FILE: src/views/MainContent.tsx
// DESCRIPTION: Handles animated transitions between different views.
// =================================================================================
const MainContent: React.FC = () => {
    const { currentView } = useView();
    const [renderView, setRenderView] = useState(currentView);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (currentView !== renderView) {
            setIsExiting(true);
            const timer = setTimeout(() => { setRenderView(currentView); setIsExiting(false); }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentView, renderView]);

    const componentMap: Record<View, React.ReactElement> = {
        [VIEWS.ORBITAL]: <OrbitalExplorer />,
        [VIEWS.DATABASE]: <ConceptDatabase />,
        [VIEWS.TRACKER]: <ScienceTracker />,
        [VIEWS.SETTINGS]: <Settings />,
        [VIEWS.HELP]: <Help />,
    };
    
    return <div key={renderView} className={isExiting ? 'view-exit' : 'view-enter'}>{componentMap[renderView]}</div>;
};


// =================================================================================
// VIRTUAL FILE: src/App.tsx
// DESCRIPTION: The main application UI shell.
// =================================================================================
const AppUI: React.FC = () => (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans">
        <Header />
        <main className="container mx-auto">
            <MainContent />
        </main>
    </div>
);


// =================================================================================
// VIRTUAL FILE: src/index.tsx
// DESCRIPTION: The application's entry point.
// =================================================================================
const Root: React.FC = () => (
    <StrictMode>
        <AppProviders>
            <AppUI />
        </AppProviders>
    </StrictMode>
);

const root = createRoot(document.getElementById('root')!);
root.render(<Root />);


// =================================================================================
// VIRTUAL FILE: src/lib/i18n.ts
// DESCRIPTION: All internationalization (i18n) content.
// =================================================================================
const translations = {
    en: {
        loading: { title: "INITIALIZING DATABASE...", subtitle: "Establishing local persistence layer." },
        header: { title: "Stellar Codex", nav: { orbital: "Orbital Dynamics", database: "Concept Database", tracker: "Science Tracker", settings: "Settings", help: "Help" } },
        orbitalExplorer: { title: "Orbital Viewer: Proxima Centauri System", mock_note: "Conceptual simulation of a tidally locked exoplanet. Orbital path is illustrative, not to scale.", data_title: "System Data", star: { name: "Proxima Centauri", type: "M5.5Ve Red Dwarf", }, planet: { name: "Proxima Centauri b", gravity: "1.1g (est.)", pressure: "~1.2 bar (Hypothetical: N₂, CO₂)", temperature: "Equilibrium: 234 K (-39 °C)", orbital_period: "11.2 Earth Days", semi_major_axis: "0.05 AU", tidal_lock: "1:1 Spin-Orbit Resonance (Tidally Locked)" }, star_type: "Star Type", orbital_period_label: "Orbital Period", semi_major_axis_label: "Semi-Major Axis", tidal_lock_label: "Tidal Lock", body: "Body", gravity: "Gravity", pressure: "Atm. Pressure", temp: "Avg. Temp", button: "Run Delta-V Analysis", analysis_result: "A Hohmann transfer is an orbital maneuver using two engine impulses to move between coplanar circular orbits. Our simplified calculation for an Earth-Proxima b transfer yields a Delta-V of ~9.4 km/s for Earth orbit departure. CRITICAL NOTE: This is a vast oversimplification. It ignores interstellar travel complexities such as multi-year travel times, relativistic effects, lack of gravitational assists, and the enormous deceleration burn required at the destination. The actual energy requirement is orders of magnitude higher." },
        conceptDatabase: { title: "Concept Database", add_button: "Add Concept", form: { add_title: "Add New Concept", edit_title: "Edit Concept", concept_label: "Concept / Theme", basis_label: "Scientific Basis", plausibility_label: "Plausibility Level", details_label: "Technical Details", plausibility_options: ["Low", "Medium", "High"], save_button: "Save Concept", saving_button: "Saving...", update_button: "Update Concept", updating_button: "Updating...", cancel_button: "Cancel", required_alert: "Concept/Theme and Scientific Basis are required.", edit_label: "Edit Concept", delete_label: "Delete Concept", }, validation: { required: "This field is required.", concept_minLength: "Concept must be at least 3 characters.", concept_maxLength: "Concept cannot exceed 100 characters.", basis_minLength: "Scientific Basis must be at least 10 characters.", basis_maxLength: "Scientific Basis cannot exceed 250 characters.", details_maxLength: "Details cannot exceed 2000 characters." }, entry: { basis: "Basis", details: "Details", plausibility: "Plausibility" }, empty: { title: "Your Codex is Empty", subtitle: "Begin by documenting your first hard sci-fi idea. What technology, species, or cosmic phenomenon will you explore?", button: "Add Your First Concept" }, delete_confirm: "Are you sure you want to delete this concept?", feedback: { saved: "Concept saved successfully!", updated: "Concept updated successfully!", deleted: "Concept deleted.", error: "An error occurred. Please try again." } },
        scienceTracker: { feed_title: "Science & Technology Feed", analysis_title: "Literary Analysis", scienceFeed: [{ title: "First Light Achieved for Quantum Entanglement Telescope Array (QETA)", summary: "The QETA array, spanning Earth's orbit, successfully linked telescopes via quantum entanglement, achieving an angular resolution equivalent to a lens the size of the solar system. It has already resolved atmospheric composition of exoplanets with unprecedented detail.", implications: "This technology bypasses the physical limitations of conventional interferometry, enabling direct observation of exoplanet surface features and biosignatures. The era of interstellar cartography has begun." }, { title: "Metallic Hydrogen Stabilized at Near-Ambient Pressures", summary: "A breakthrough in quantum lattice stabilization has allowed researchers to maintain metallic hydrogen in a metastable state at just 10 GPa. The material exhibits room-temperature superconductivity and an energy density an order of magnitude greater than chemical propellants.", implications: "Revolutionizes energy storage and propulsion. Enables highly efficient fusion reactor ignition and single-stage-to-orbit vehicles. The 'torchship' concept is now a near-term engineering challenge, not a theoretical dream." }, { title: "Subglacial Ocean on Enceladus Shows Confirmed Biosignatures", summary: "Data from the 'Enceladus Cryo-Drill' probe confirms the presence of complex chiral amino acids and lipid structures within water plumes, pointing strongly to an active, non-terrestrial biochemistry in its subsurface ocean.", implications: "The first definitive proof of extraterrestrial life. The focus of astrobiology now shifts from discovery to characterization, with profound philosophical and ethical consequences for future exploration and planetary protection protocols." }, { title: "Relativistic Kinetic Impactor Test Successfully Deflects Asteroid Simulant", summary: "The 'Stiletto' project test-fired a grape-sized projectile accelerated to 0.1c, striking a simulated Near-Earth Object. The resulting energy release and momentum transfer exceeded predictions, successfully altering the target's trajectory. The system uses a vast solar-powered laser array for propulsion.", implications: "Provides a viable, scalable planetary defense system against asteroid threats. Also demonstrates a new class of sub-light speed propulsion, potentially enabling rapid interstellar probe missions." }], literaryAnalysis: [{ title: "Project Hail Mary by Andy Weir", analysis: "A masterclass in problem-solving science. The biology of the 'Astrophage' is a brilliantly conceived example of hypothetical xenobiology, complete with a plausible energy cycle and evolutionary pressures. The novel excels at making complex physics (like relativistic travel and material science) accessible and central to the plot." }, { title: "Children of Time by Adrian Tchaikovsky", analysis: "An ambitious exploration of non-humanoid intelligence and accelerated evolution. The novel's strength lies in its detailed depiction of the Portiid spiders' societal and technological evolution, grounded in real-world biology. It challenges anthropocentric views of what constitutes 'civilization'." }, { title: "The Three-Body Problem by Cixin Liu", analysis: "This novel introduces incredibly high-concept physics, from the chaotic orbital mechanics of a three-star system to the 'Sophon' concept—a proton unfolded into two dimensions to become a supercomputer. It serves as a stark reminder of how a sufficiently advanced civilization's technology would appear indistinguishable from magic, yet it remains grounded in theoretical physics." }, { title: "Blindsight by Peter Watts", analysis: "Explores consciousness and first contact through a lens of hard neuroscience and evolutionary biology. The novel posits that consciousness might be an evolutionary dead-end, a resource-intensive process not essential for high-level intelligence. It's a deeply unsettling but rigorously argued piece of speculative science." }] },
        settings: { title: "Settings", theme: { title: "Appearance Theme", description: "Select the application's color scheme.", cyan: "Cyan", amber: "Amber" }, language: { title: "Language", description: "Choose the display language for the interface." }, data: { title: "Data Management", description: "Permanently delete all concepts from your local database. This action cannot be undone.", button: "Clear Database", confirm: "Are you sure you want to permanently delete all concepts?" }, feedback: { db_cleared: "Database cleared successfully!", theme_updated: (themeName: string) => `Theme updated to ${themeName}.`, language_updated: (langName: string) => `Language set to ${langName}.`, } },
        help: { title: "Help & Information", intro: "Stellar Codex is a tool for exploring and documenting hard science fiction concepts. All data is stored locally in your browser, ensuring privacy and offline availability.", sections: { orbital: { title: "Orbital Dynamics", content: "This is a visual demonstration of a plausible exoplanet system. The data is based on real-world estimations for Proxima Centauri b. The Delta-V analysis is a simplified mock calculation." }, database: { title: "Concept Database", content: "This is the core feature. You can create, edit, and delete your own hard sci-fi concepts. Your entries are saved persistently in your browser's IndexedDB, meaning they will be here when you return. No data is ever sent to a server." }, tracker: { title: "Science Tracker", content: "This section provides curated, in-depth articles on plausible scientific breakthroughs and literary analyses to provide context and inspiration for your own concepts." }, settings: { title: "Settings", content: "Here you can customize your experience by changing the color theme, switching languages, and managing your locally stored data." }, aboutStellarCodex: { title: "About Stellar Codex", content: "Stellar Codex is a conceptual application designed for hard science fiction enthusiasts to explore, document, and manage scientifically plausible concepts. It operates entirely on your local device, using your browser's IndexedDB for persistent storage, ensuring complete data privacy. The interface is built with React and styled with Tailwind CSS, with icons provided by Lucide. This application was generated with the assistance of a large language model, showcasing AI's capability in creating functional and aesthetically pleasing web applications." } }, faq: { title: "Frequently Asked Questions", q1: "Is my data private?", a1: "Yes. All data you enter in the database is stored exclusively on your computer in your browser's local storage. It is never uploaded or shared.", q2: "Can I access my data on another device?", a2: "No. Because the data is stored locally, it is not synchronized across different devices or browsers." } }
    },
    de: {
        loading: { title: "INITIALISIERE DATENBANK...", subtitle: "Lokale Persistenzschicht wird eingerichtet." },
        header: { title: "Stellar-Kodex", nav: { orbital: "Orbitale Dynamik", database: "Konzept-Datenbank", tracker: "Wissenschafts-Tracker", settings: "Einstellungen", help: "Hilfe" } },
        orbitalExplorer: { title: "Orbitalansicht: Proxima Centauri System", mock_note: "Konzept-Simulation eines Exoplaneten in gebundener Rotation. Umlaufbahn ist illustrativ, nicht maßstabsgetreu.", data_title: "Systemdaten", star: { name: "Proxima Centauri", type: "M5.5Ve Roter Zwerg", }, planet: { name: "Proxima Centauri b", gravity: "1.1g (geschätzt)", pressure: "~1,2 bar (Hypothetisch: N₂, CO₂)", temperature: "Gleichgewicht: 234 K (-39 °C)", orbital_period: "11,2 Erdentage", semi_major_axis: "0,05 AE", tidal_lock: "1:1 Spin-Orbit-Resonanz (Gebundene Rotation)" }, star_type: "Sterntyp", orbital_period_label: "Umlaufzeit", semi_major_axis_label: "Große Halbachse", tidal_lock_label: "Gebundene Rotation", body: "Himmelskörper", gravity: "Gravitation", pressure: "Atm. Druck", temp: "Ø Temperatur", button: "Delta-V-Analyse durchführen", analysis_result: "Ein Hohmann-Transfer ist ein Orbitalmanöver, das zwei Triebwerksimpulse nutzt, um sich zwischen koplanaren Kreisbahnen zu bewegen. Unsere vereinfachte Berechnung für einen Transfer von der Erde zu Proxima b ergibt einen Delta-V von ~9,4 km/s für das Verlassen des Erdorbits. WICHTIGER HINWEIS: Dies ist eine extreme Vereinfachung. Sie ignoriert die Komplexität interstellarer Reisen wie mehrjährige Reisezeiten, relativistische Effekte, fehlende Gravitations-Assists und den enormen Bremsimpuls, der am Zielort erforderlich ist. Der tatsächliche Energiebedarf ist um Größenordnungen höher." },
        conceptDatabase: { title: "Konzept-Datenbank", add_button: "Konzept hinzufügen", form: { add_title: "Neues Konzept hinzufügen", edit_title: "Konzept bearbeiten", concept_label: "Konzept / Thema", basis_label: "Wissenschaftliche Grundlage", plausibility_label: "Plausibilitätsstufe", details_label: "Technische Details", plausibility_options: ["Niedrig", "Mittel", "Hoch"], save_button: "Konzept speichern", saving_button: "Speichern...", update_button: "Konzept aktualisieren", updating_button: "Aktualisieren...", cancel_button: "Abbrechen", required_alert: "Konzept/Thema und wissenschaftliche Grundlage sind erforderlich.", edit_label: "Konzept bearbeiten", delete_label: "Konzept löschen", }, validation: { required: "Dieses Feld ist erforderlich.", concept_minLength: "Das Konzept muss mindestens 3 Zeichen lang sein.", concept_maxLength: "Das Konzept darf 100 Zeichen nicht überschreiten.", basis_minLength: "Die wissenschaftliche Grundlage muss mindestens 10 Zeichen lang sein.", basis_maxLength: "Die wissenschaftliche Grundlage darf 250 Zeichen nicht überschreiten.", details_maxLength: "Die Details dürfen 2000 Zeichen nicht überschreiten." }, entry: { basis: "Grundlage", details: "Details", plausibility: "Plausibilität" }, empty: { title: "Ihr Kodex ist leer", subtitle: "Beginnen Sie, indem Sie Ihre erste Hard-Science-Fiction-Idee dokumentieren. Welche Technologie, Spezies oder kosmisches Phänomen werden Sie erforschen?", button: "Erstes Konzept hinzufügen" }, delete_confirm: "Sind Sie sicher, dass Sie dieses Konzept löschen möchten?", feedback: { saved: "Konzept erfolgreich gespeichert!", updated: "Konzept erfolgreich aktualisiert!", deleted: "Konzept gelöscht.", error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." } },
        scienceTracker: { feed_title: "Wissenschafts- & Technologie-Feed", analysis_title: "Literarische Analyse", scienceFeed: [{ title: "„First Light“ für Quantenverschränkungs-Teleskop-Array (QETA) erreicht", summary: "Das QETA-Array, das sich über die Erdumlaufbahn erstreckt, hat erfolgreich Teleskope mittels Quantenverschränkung gekoppelt und eine Winkelauflösung erreicht, die einer Linse von der Größe des Sonnensystems entspricht. Es hat bereits die atmosphärische Zusammensetzung von Exoplaneten mit beispielloser Detailgenauigkeit aufgelöst.", implications: "Diese Technologie umgeht die physikalischen Grenzen der konventionellen Interferometrie und ermöglicht die direkte Beobachtung von Oberflächenmerkmalen und Biosignaturen von Exoplaneten. Die Ära der interstellaren Kartographie hat begonnen." }, { title: "Metallischer Wasserstoff bei annäherndem Umgebungsdruck stabilisiert", summary: "Ein Durchbruch in der Quantengitter-Stabilisierung hat es Forschern ermöglicht, metallischen Wasserstoff in einem metastabilen Zustand bei nur 10 GPa zu halten. Das Material zeigt Supraleitfähigkeit bei Raumtemperatur und eine Energiedichte, die eine Größenordnung über der von chemischen Treibstoffen liegt.", implications: "Revolutioniert Energiespeicherung und Antrieb. Ermöglicht hocheffiziente Zündung von Fusionsreaktoren und „Single-Stage-to-Orbit“-Raumfahrzeuge. Das Konzept des „Torchship“ ist nun eine kurzfristige technische Herausforderung, kein theoretischer Traum mehr." }, { title: "Subglazialer Ozean auf Enceladus zeigt bestätigte Biosignaturen", summary: "Daten der Sonde „Enceladus Cryo-Drill“ bestätigen das Vorhandensein komplexer chiraler Aminosäuren und Lipidstrukturen in Wasserfontänen, was stark auf eine aktive, nicht-terrestrische Biochemie in seinem unterirdischen Ozean hindeutet.", implications: "Der erste definitive Beweis für außerirdisches Leben. Der Fokus der Astrobiologie verlagert sich von der Entdeckung zur Charakterisierung, mit tiefgreifenden philosophischen und ethischen Konsequenzen für zukünftige Explorationen und Planetenschutzprotokolle." }, { title: "Test eines relativistischen kinetischen Impaktors lenkt Asteroiden-Simulanten erfolgreich ab", summary: "Das „Stiletto“-Projekt feuerte ein traubengroßes Projektil, das auf 0,1c beschleunigt wurde, auf ein simuliertes erdnahes Objekt. Die resultierende Energiefreisetzung und Impulsübertragung übertrafen die Vorhersagen und änderten die Flugbahn des Ziels erfolgreich. Das System nutzt ein gewaltiges solarbetriebenes Laser-Array für den Antrieb.", implications: "Bietet ein realisierbares, skalierbares planetarisches Verteidigungssystem gegen Asteroidenbedrohungen. Demonstriert auch eine neue Klasse von Antrieben unterhalb der Lichtgeschwindigkeit, die potenziell schnelle interstellare Sondenmissionen ermöglichen." }], literaryAnalysis: [{ title: "Der Astronaut (Project Hail Mary) von Andy Weir", analysis: "Eine Meisterklasse in wissenschaftlicher Problemlösung. Die Biologie der 'Astrophagen' ist ein brillant konzipiertes Beispiel für hypothetische Xenobiologie, komplett mit einem plausiblen Energiekreislauf und evolutionärem Druck. Der Roman zeichnet sich dadurch aus, komplexe Physik (wie relativistische Reisen und Materialwissenschaft) zugänglich und zentral für die Handlung zu machen." }, { title: "Die Kinder der Zeit (Children of Time) von Adrian Tchaikovsky", analysis: "Eine ambitionierte Untersuchung nicht-humanoider Intelligenz und beschleunigter Evolution. Die Stärke des Romans liegt in seiner detaillierten Darstellung der gesellschaftlichen und technischen Evolution der Portiiden-Spinnen, die auf realer Biologie basiert. Er fordert anthropozentrische Ansichten darüber heraus, was 'Zivilisation' ausmacht." }, { title: "Die drei Sonnen (The Three-Body Problem) von Cixin Liu", analysis: "Dieser Roman führt unglaublich anspruchsvolle physikalische Konzepte ein, von der chaotischen Orbitalmechanik eines Drei-Sterne-Systems bis zum 'Sophon'-Konzept – ein Proton, das in zwei Dimensionen entfaltet wird, um ein Supercomputer zu werden. Er dient als eindringliche Erinnerung daran, wie die Technologie einer ausreichend fortgeschrittenen Zivilisation von Magie nicht zu unterscheiden wäre, bleibt aber dennoch in der theoretischen Physik verankert." }, { title: "Blindsight von Peter Watts", analysis: "Erforscht Bewusstsein und Erstkontakt durch die Linse der harten Neurowissenschaft und Evolutionsbiologie. Der Roman postuliert, dass Bewusstsein eine evolutionäre Sackgasse sein könnte, ein ressourcenintensiver Prozess, der für hochrangige Intelligenz nicht wesentlich ist. Es ist ein zutiefst beunruhigendes, aber rigoros argumentiertes Stück spekulativer Wissenschaft." }] },
        settings: { title: "Einstellungen", theme: { title: "Erscheinungsbild-Thema", description: "Wählen Sie das Farbschema der Anwendung.", cyan: "Cyan", amber: "Amber" }, language: { title: "Sprache", description: "Wählen Sie die Anzeigesprache für die Benutzeroberfläche." }, data: { title: "Datenverwaltung", description: "Löschen Sie alle Konzepte dauerhaft aus Ihrer lokalen Datenbank. Diese Aktion kann nicht rückgängig gemacht werden.", button: "Datenbank leeren", confirm: "Sind Sie sicher, dass Sie alle Konzepte dauerhaft löschen möchten?" }, feedback: { db_cleared: "Datenbank erfolgreich geleert!", theme_updated: (themeName: string) => `Thema auf ${themeName} aktualisiert.`, language_updated: (langName: string) => `Sprache auf ${langName} gesetzt.`, } },
        help: { title: "Hilfe & Informationen", intro: "Stellar Codex ist ein Werkzeug zur Erforschung und Dokumentation von Hard-Science-Fiction-Konzepten. Alle Daten werden lokal in Ihrem Browser gespeichert, was Datenschutz und Offline-Verfügbarkeit gewährleistet.", sections: { orbital: { title: "Orbitale Dynamik", content: "Dies ist eine visuelle Demonstration eines plausiblen Exoplanetensystems. Die Daten basieren auf realen Schätzungen für Proxima Centauri b. Die Delta-V-Analyse ist eine vereinfachte, simulierte Berechnung." }, database: { title: "Konzept-Datenbank", content: "Dies ist die Kernfunktion. Sie können Ihre eigenen Hard-Sci-Fi-Konzepte erstellen, bearbeiten und löschen. Ihre Einträge werden dauerhaft in der IndexedDB Ihres Browsers gespeichert, was bedeutet, dass sie bei Ihrer Rückkehr hier sein werden. Es werden keine Daten an einen Server gesendet." }, tracker: { title: "Wissenschafts-Tracker", content: "Dieser Abschnitt bietet kuratierte, tiefgehende Artikel über plausible wissenschaftliche Durchbrüche und literarische Analysen, um Kontext und Inspiration für Ihre eigenen Konzepte zu liefern." }, settings: { title: "Einstellungen", content: "Hier können Sie Ihr Erlebnis anpassen, indem Sie das Farbthema ändern, die Sprache wechseln und Ihre lokal gespeicherten Daten verwalten." }, aboutStellarCodex: { title: "Über Stellar Codex", content: "Stellar Codex ist eine konzeptionelle Anwendung, die für Hard-Science-Fiction-Enthusiasten entwickelt wurde, um wissenschaftlich plausible Konzepte zu erforschen, zu dokumentieren und zu verwalten. Sie läuft vollständig auf Ihrem lokalen Gerät und verwendet die IndexedDB Ihres Browsers zur dauerhaften Speicherung, was vollständigen Datenschutz gewährleistet. Die Benutzeroberfläche wurde mit React erstellt und mit Tailwind CSS gestaltet, die Symbole stammen von Lucide. Diese Anwendung wurde mit Unterstützung eines großen Sprachmodells generiert und demonstriert die Fähigkeit von KI, funktionale und ästhetisch ansprechende Webanwendungen zu erstellen." } }, faq: { title: "Häufig gestellte Fragen", q1: "Sind meine Daten privat?", a1: "Ja. Alle Daten, die Sie in die Datenbank eingeben, werden ausschließlich auf Ihrem Computer im lokalen Speicher Ihres Browsers gespeichert. Sie werden niemals hochgeladen oder geteilt.", q2: "Kann ich auf meine Daten auf einem anderen Gerät zugreifen?", a2: "Nein. Da die Daten lokal gespeichert werden, werden sie nicht zwischen verschiedenen Geräten oder Browsern synchronisiert." } }
    }
};