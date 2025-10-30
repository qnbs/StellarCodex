import React, { useState, useEffect, useCallback, StrictMode, memo, useRef, createContext, useContext, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import * as idb from 'idb';
import * as lucide from 'lucide-react';

const DB_NAME = 'StellarCodexDB';
const STORE_NAME = 'concepts';
const DB_VERSION = 1;

// --- TYPE DEFINITIONS ---

// --- Core Data Structures ---
interface Concept {
    id?: number;
    concept: string;
    scientificBasis: string;
    plausibility: string;
    details: string;
}

interface TranslationSection {
    title: string;
    content: string;
}

interface FeedbackState {
    message: string;
    type: 'success' | 'delete' | 'error' | '';
}

// --- Theme Types ---
type Theme = {
    accentText: string;
    accentBorder: string;
    accentBg: string;
    accentHoverBg: string;
    accentGlow: string;
    name: string;
};
type Themes = {
    cyan: Theme;
    amber: Theme;
};
type ThemeName = keyof Themes;

// --- Context Types ---
type ThemeContextType = {
    theme: Theme;
    setTheme: (name: ThemeName) => void;
    themeName: ThemeName;
};

interface DatabaseContextType {
    db: idb.IDBPDatabase | null;
    concepts: Concept[];
    addConcept: (concept: Omit<Concept, 'id'>) => Promise<void>;
    updateConcept: (concept: Concept) => Promise<void>;
    deleteConcept: (id: number) => Promise<void>;
    clearDatabase: () => Promise<void>;
}

type AppContextType = ReturnType<typeof useAppController>;

// --- Component Prop Types ---
interface IconProps {
    name: keyof typeof lucide;
    className?: string;
}

interface LoadingScreenProps {
    texts: { title: string; subtitle: string; };
}

interface HeaderProps {
    currentView: string;
    setView: (view: string) => void;
    texts: typeof translations.en.header;
}

interface OrbitalExplorerProps {
    texts: typeof translations.en.orbitalExplorer;
}

interface SvgTooltipProps {
    x: number;
    y: number;
    text: string;
}

interface ConceptDatabaseProps {
    texts: typeof translations.en.conceptDatabase;
    setAppFeedback: (feedback: FeedbackState) => void;
}

interface ScienceTrackerProps {
    texts: typeof translations.en.scienceTracker;
}

interface SettingsProps {
    texts: typeof translations.en.settings;
    language: string;
    setLanguage: (lang: 'en' | 'de') => void;
    setAppFeedback: (feedback: FeedbackState) => void;
}

interface HelpProps {
    texts: typeof translations.en.help;
}

interface AccordionItemProps {
    id: string;
    title: string;
    children: ReactNode;
}


// --- I18N Translations ---
// FIX: Moved type definitions after the object to prevent circular reference errors.
const translations = {
    en: {
        loading: {
            title: "INITIALIZING DATABASE...",
            subtitle: "Establishing local persistence layer."
        },
        header: {
            title: "Stellar Codex",
            nav: {
                orbital: "Orbital Dynamics",
                database: "Concept Database",
                tracker: "Science Tracker",
                settings: "Settings",
                help: "Help"
            }
        },
        orbitalExplorer: {
            title: "Orbital Viewer: Proxima Centauri System",
            mock_note: "Conceptual simulation of a tidally locked exoplanet. Orbital path is illustrative, not to scale.",
            data_title: "System Data",
            star: {
                name: "Proxima Centauri",
                type: "M5.5Ve Red Dwarf",
            },
            planet: {
                name: "Proxima Centauri b",
                gravity: "1.1g (est.)",
                pressure: "~1.2 bar (Hypothetical: N₂, CO₂)",
                temperature: "Equilibrium: 234 K (-39 °C)",
                orbital_period: "11.2 Earth Days",
                semi_major_axis: "0.05 AU",
                tidal_lock: "1:1 Spin-Orbit Resonance (Tidally Locked)"
            },
            star_type: "Star Type",
            orbital_period_label: "Orbital Period",
            semi_major_axis_label: "Semi-Major Axis",
            tidal_lock_label: "Tidal Lock",
            body: "Body",
            gravity: "Gravity",
            pressure: "Atm. Pressure",
            temp: "Avg. Temp",
            button: "Run Delta-V Analysis",
            analysis_result: "A Hohmann transfer is an orbital maneuver using two engine impulses to move between coplanar circular orbits. Our simplified calculation for an Earth-Proxima b transfer yields a Delta-V of ~9.4 km/s for Earth orbit departure. CRITICAL NOTE: This is a vast oversimplification. It ignores interstellar travel complexities such as multi-year travel times, relativistic effects, lack of gravitational assists, and the enormous deceleration burn required at the destination. The actual energy requirement is orders of magnitude higher."
        },
        conceptDatabase: {
            title: "Concept Database",
            add_button: "Add Concept",
            form: {
                add_title: "Add New Concept",
                edit_title: "Edit Concept",
                concept_label: "Concept / Theme",
                basis_label: "Scientific Basis",
                plausibility_label: "Plausibility Level",
                details_label: "Technical Details",
                plausibility_options: ["Low", "Medium", "High"],
                save_button: "Save Concept",
                saving_button: "Saving...",
                update_button: "Update Concept",
                updating_button: "Updating...",
                cancel_button: "Cancel",
                required_alert: "Concept/Theme and Scientific Basis are required.",
                edit_label: "Edit Concept",
                delete_label: "Delete Concept",
            },
            validation: {
                required: "This field is required.",
                concept_minLength: "Concept must be at least 3 characters.",
                concept_maxLength: "Concept cannot exceed 100 characters.",
                basis_minLength: "Scientific Basis must be at least 10 characters.",
                basis_maxLength: "Scientific Basis cannot exceed 250 characters.",
                details_maxLength: "Details cannot exceed 2000 characters."
            },
            entry: {
                basis: "Basis",
                details: "Details",
                plausibility: "Plausibility"
            },
            empty: {
                title: "Your Codex is Empty",
                subtitle: "Begin by documenting your first hard sci-fi idea. What technology, species, or cosmic phenomenon will you explore?",
                button: "Add Your First Concept"
            },
            delete_confirm: "Are you sure you want to delete this concept?",
            feedback: {
                saved: "Concept saved successfully!",
                updated: "Concept updated successfully!",
                deleted: "Concept deleted.",
                error: "An error occurred. Please try again."
            }
        },
        scienceTracker: {
            feed_title: "Science & Technology Feed",
            analysis_title: "Literary Analysis",
            scienceFeed: [
                { title: "First Light Achieved for Quantum Entanglement Telescope Array (QETA)", summary: "The QETA array, spanning Earth's orbit, successfully linked telescopes via quantum entanglement, achieving an angular resolution equivalent to a lens the size of the solar system. It has already resolved atmospheric composition of exoplanets with unprecedented detail.", implications: "This technology bypasses the physical limitations of conventional interferometry, enabling direct observation of exoplanet surface features and biosignatures. The era of interstellar cartography has begun." },
                { title: "Metallic Hydrogen Stabilized at Near-Ambient Pressures", summary: "A breakthrough in quantum lattice stabilization has allowed researchers to maintain metallic hydrogen in a metastable state at just 10 GPa. The material exhibits room-temperature superconductivity and an energy density an order of magnitude greater than chemical propellants.", implications: "Revolutionizes energy storage and propulsion. Enables highly efficient fusion reactor ignition and single-stage-to-orbit vehicles. The 'torchship' concept is now a near-term engineering challenge, not a theoretical dream." },
                { title: "Subglacial Ocean on Enceladus Shows Confirmed Biosignatures", summary: "Data from the 'Enceladus Cryo-Drill' probe confirms the presence of complex chiral amino acids and lipid structures within water plumes, pointing strongly to an active, non-terrestrial biochemistry in its subsurface ocean.", implications: "The first definitive proof of extraterrestrial life. The focus of astrobiology now shifts from discovery to characterization, with profound philosophical and ethical consequences for future exploration and planetary protection protocols." },
                { title: "Relativistic Kinetic Impactor Test Successfully Deflects Asteroid Simulant", summary: "The 'Stiletto' project test-fired a grape-sized projectile accelerated to 0.1c, striking a simulated Near-Earth Object. The resulting energy release and momentum transfer exceeded predictions, successfully altering the target's trajectory. The system uses a vast solar-powered laser array for propulsion.", implications: "Provides a viable, scalable planetary defense system against asteroid threats. Also demonstrates a new class of sub-light speed propulsion, potentially enabling rapid interstellar probe missions." }
            ],
            literaryAnalysis: [
                { title: "Project Hail Mary by Andy Weir", analysis: "A masterclass in problem-solving science. The biology of the 'Astrophage' is a brilliantly conceived example of hypothetical xenobiology, complete with a plausible energy cycle and evolutionary pressures. The novel excels at making complex physics (like relativistic travel and material science) accessible and central to the plot." },
                { title: "Children of Time by Adrian Tchaikovsky", analysis: "An ambitious exploration of non-humanoid intelligence and accelerated evolution. The novel's strength lies in its detailed depiction of the Portiid spiders' societal and technological evolution, grounded in real-world biology. It challenges anthropocentric views of what constitutes 'civilization'." },
                { title: "The Three-Body Problem by Cixin Liu", analysis: "This novel introduces incredibly high-concept physics, from the chaotic orbital mechanics of a three-star system to the 'Sophon' concept—a proton unfolded into two dimensions to become a supercomputer. It serves as a stark reminder of how a sufficiently advanced civilization's technology would appear indistinguishable from magic, yet it remains grounded in theoretical physics." },
                { title: "Blindsight by Peter Watts", analysis: "Explores consciousness and first contact through a lens of hard neuroscience and evolutionary biology. The novel posits that consciousness might be an evolutionary dead-end, a resource-intensive process not essential for high-level intelligence. It's a deeply unsettling but rigorously argued piece of speculative science." }
            ]
        },
        settings: {
            title: "Settings",
            theme: {
                title: "Appearance Theme",
                description: "Select the application's color scheme.",
                cyan: "Cyan",
                amber: "Amber"
            },
            language: {
                title: "Language",
                description: "Choose the display language for the interface."
            },
            data: {
                title: "Data Management",
                description: "Permanently delete all concepts from your local database. This action cannot be undone.",
                button: "Clear Database",
                confirm: "Are you sure you want to permanently delete all concepts?"
            },
            feedback: {
                db_cleared: "Database cleared successfully!",
                theme_updated: (themeName: string) => `Theme updated to ${themeName}.`,
                language_updated: (langName: string) => `Language set to ${langName}.`,
            }
        },
        help: {
            title: "Help & Information",
            intro: "Stellar Codex is a tool for exploring and documenting hard science fiction concepts. All data is stored locally in your browser, ensuring privacy and offline availability.",
            sections: {
                orbital: {
                    title: "Orbital Dynamics",
                    content: "This is a visual demonstration of a plausible exoplanet system. The data is based on real-world estimations for Proxima Centauri b. The Delta-V analysis is a simplified mock calculation."
                },
                database: {
                    title: "Concept Database",
                    content: "This is the core feature. You can create, edit, and delete your own hard sci-fi concepts. Your entries are saved persistently in your browser's IndexedDB, meaning they will be here when you return. No data is ever sent to a server."
                },
                tracker: {
                    title: "Science Tracker",
                    content: "This section provides curated, in-depth articles on plausible scientific breakthroughs and literary analyses to provide context and inspiration for your own concepts."
                },
                settings: {
                    title: "Settings",
                    content: "Here you can customize your experience by changing the color theme, switching languages, and managing your locally stored data."
                },
                aboutStellarCodex: {
                    title: "About Stellar Codex",
                    content: "Stellar Codex is a conceptual application designed for hard science fiction enthusiasts to explore, document, and manage scientifically plausible concepts. It operates entirely on your local device, using your browser's IndexedDB for persistent storage, ensuring complete data privacy. The interface is built with React and styled with Tailwind CSS, with icons provided by Lucide. This application was generated with the assistance of a large language model, showcasing AI's capability in creating functional and aesthetically pleasing web applications."
                }
            },
            faq: {
                title: "Frequently Asked Questions",
                q1: "Is my data private?",
                a1: "Yes. All data you enter in the database is stored exclusively on your computer in your browser's local storage. It is never uploaded or shared.",
                q2: "Can I access my data on another device?",
                a2: "No. Because the data is stored locally, it is not synchronized across different devices or browsers."
            }
        }
    },
    de: {
        loading: {
            title: "INITIALISIERE DATENBANK...",
            subtitle: "Lokale Persistenzschicht wird eingerichtet."
        },
        header: {
            title: "Stellar-Kodex",
            nav: {
                orbital: "Orbitale Dynamik",
                database: "Konzept-Datenbank",
                tracker: "Wissenschafts-Tracker",
                settings: "Einstellungen",
                help: "Hilfe"
            }
        },
        orbitalExplorer: {
            title: "Orbitalansicht: Proxima Centauri System",
            mock_note: "Konzept-Simulation eines Exoplaneten in gebundener Rotation. Umlaufbahn ist illustrativ, nicht maßstabsgetreu.",
            data_title: "Systemdaten",
            star: {
                name: "Proxima Centauri",
                type: "M5.5Ve Roter Zwerg",
            },
            planet: {
                name: "Proxima Centauri b",
                gravity: "1.1g (geschätzt)",
                pressure: "~1,2 bar (Hypothetisch: N₂, CO₂)",
                temperature: "Gleichgewicht: 234 K (-39 °C)",
                orbital_period: "11,2 Erdentage",
                semi_major_axis: "0,05 AE",
                tidal_lock: "1:1 Spin-Orbit-Resonanz (Gebundene Rotation)"
            },
            star_type: "Sterntyp",
            orbital_period_label: "Umlaufzeit",
            semi_major_axis_label: "Große Halbachse",
            tidal_lock_label: "Gebundene Rotation",
            body: "Himmelskörper",
            gravity: "Gravitation",
            pressure: "Atm. Druck",
            temp: "Ø Temperatur",
            button: "Delta-V-Analyse durchführen",
            analysis_result: "Ein Hohmann-Transfer ist ein Orbitalmanöver, das zwei Triebwerksimpulse nutzt, um sich zwischen koplanaren Kreisbahnen zu bewegen. Unsere vereinfachte Berechnung für einen Transfer von der Erde zu Proxima b ergibt einen Delta-V von ~9,4 km/s für das Verlassen des Erdorbits. WICHTIGER HINWEIS: Dies ist eine extreme Vereinfachung. Sie ignoriert die Komplexität interstellarer Reisen wie mehrjährige Reisezeiten, relativistische Effekte, fehlende Gravitations-Assists und den enormen Bremsimpuls, der am Zielort erforderlich ist. Der tatsächliche Energiebedarf ist um Größenordnungen höher."
        },
        conceptDatabase: {
            title: "Konzept-Datenbank",
            add_button: "Konzept hinzufügen",
            form: {
                add_title: "Neues Konzept hinzufügen",
                edit_title: "Konzept bearbeiten",
                concept_label: "Konzept / Thema",
                basis_label: "Wissenschaftliche Grundlage",
                plausibility_label: "Plausibilitätsstufe",
                details_label: "Technische Details",
                plausibility_options: ["Niedrig", "Mittel", "Hoch"],
                save_button: "Konzept speichern",
                saving_button: "Speichern...",
                update_button: "Konzept aktualisieren",
                updating_button: "Aktualisieren...",
                cancel_button: "Abbrechen",
                required_alert: "Konzept/Thema und wissenschaftliche Grundlage sind erforderlich.",
                edit_label: "Konzept bearbeiten",
                delete_label: "Konzept löschen",
            },
            validation: {
                required: "Dieses Feld ist erforderlich.",
                concept_minLength: "Das Konzept muss mindestens 3 Zeichen lang sein.",
                concept_maxLength: "Das Konzept darf 100 Zeichen nicht überschreiten.",
                basis_minLength: "Die wissenschaftliche Grundlage muss mindestens 10 Zeichen lang sein.",
                basis_maxLength: "Die wissenschaftliche Grundlage darf 250 Zeichen nicht überschreiten.",
                details_maxLength: "Die Details dürfen 2000 Zeichen nicht überschreiten."
            },
            entry: {
                basis: "Grundlage",
                details: "Details",
                plausibility: "Plausibilität"
            },
            empty: {
                title: "Ihr Kodex ist leer",
                subtitle: "Beginnen Sie, indem Sie Ihre erste Hard-Science-Fiction-Idee dokumentieren. Welche Technologie, Spezies oder kosmisches Phänomen werden Sie erforschen?",
                button: "Erstes Konzept hinzufügen"
            },
            delete_confirm: "Sind Sie sicher, dass Sie dieses Konzept löschen möchten?",
            feedback: {
                saved: "Konzept erfolgreich gespeichert!",
                updated: "Konzept erfolgreich aktualisiert!",
                deleted: "Konzept gelöscht.",
                error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
            }
        },
        scienceTracker: {
            feed_title: "Wissenschafts- & Technologie-Feed",
            analysis_title: "Literarische Analyse",
            scienceFeed: [
                { title: "„First Light“ für Quantenverschränkungs-Teleskop-Array (QETA) erreicht", summary: "Das QETA-Array, das sich über die Erdumlaufbahn erstreckt, hat erfolgreich Teleskope mittels Quantenverschränkung gekoppelt und eine Winkelauflösung erreicht, die einer Linse von der Größe des Sonnensystems entspricht. Es hat bereits die atmosphärische Zusammensetzung von Exoplaneten mit beispielloser Detailgenauigkeit aufgelöst.", implications: "Diese Technologie umgeht die physikalischen Grenzen der konventionellen Interferometrie und ermöglicht die direkte Beobachtung von Oberflächenmerkmalen und Biosignaturen von Exoplaneten. Die Ära der interstellaren Kartographie hat begonnen." },
                { title: "Metallischer Wasserstoff bei annäherndem Umgebungsdruck stabilisiert", summary: "Ein Durchbruch in der Quantengitter-Stabilisierung hat es Forschern ermöglicht, metallischen Wasserstoff in einem metastabilen Zustand bei nur 10 GPa zu halten. Das Material zeigt Supraleitfähigkeit bei Raumtemperatur und eine Energiedichte, die eine Größenordnung über der von chemischen Treibstoffen liegt.", implications: "Revolutioniert Energiespeicherung und Antrieb. Ermöglicht hocheffiziente Zündung von Fusionsreaktoren und „Single-Stage-to-Orbit“-Raumfahrzeuge. Das Konzept des „Torchship“ ist nun eine kurzfristige technische Herausforderung, kein theoretischer Traum mehr." },
                { title: "Subglazialer Ozean auf Enceladus zeigt bestätigte Biosignaturen", summary: "Daten der Sonde „Enceladus Cryo-Drill“ bestätigen das Vorhandensein komplexer chiraler Aminosäuren und Lipidstrukturen in Wasserfontänen, was stark auf eine aktive, nicht-terrestrische Biochemie in seinem unterirdischen Ozean hindeutet.", implications: "Der erste definitive Beweis für außerirdisches Leben. Der Fokus der Astrobiologie verlagert sich von der Entdeckung zur Charakterisierung, mit tiefgreifenden philosophischen und ethischen Konsequenzen für zukünftige Explorationen und Planetenschutzprotokolle." },
                { title: "Test eines relativistischen kinetischen Impaktors lenkt Asteroiden-Simulanten erfolgreich ab", summary: "Das „Stiletto“-Projekt feuerte ein traubengroßes Projektil, das auf 0,1c beschleunigt wurde, auf ein simuliertes erdnahes Objekt. Die resultierende Energiefreisetzung und Impulsübertragung übertrafen die Vorhersagen und änderten die Flugbahn des Ziels erfolgreich. Das System nutzt ein gewaltiges solarbetriebenes Laser-Array für den Antrieb.", implications: "Bietet ein realisierbares, skalierbares planetarisches Verteidigungssystem gegen Asteroidenbedrohungen. Demonstriert auch eine neue Klasse von Antrieben unterhalb der Lichtgeschwindigkeit, die potenziell schnelle interstellare Sondenmissionen ermöglichen." }
            ],
            literaryAnalysis: [
                { title: "Der Astronaut (Project Hail Mary) von Andy Weir", analysis: "Eine Meisterklasse in wissenschaftlicher Problemlösung. Die Biologie der 'Astrophagen' ist ein brillant konzipiertes Beispiel für hypothetische Xenobiologie, komplett mit einem plausiblen Energiekreislauf und evolutionärem Druck. Der Roman zeichnet sich dadurch aus, komplexe Physik (wie relativistische Reisen und Materialwissenschaft) zugänglich und zentral für die Handlung zu machen." },
                { title: "Die Kinder der Zeit (Children of Time) von Adrian Tchaikovsky", analysis: "Eine ambitionierte Untersuchung nicht-humanoider Intelligenz und beschleunigter Evolution. Die Stärke des Romans liegt in seiner detaillierten Darstellung der gesellschaftlichen und technischen Evolution der Portiiden-Spinnen, die auf realer Biologie basiert. Er fordert anthropozentrische Ansichten darüber heraus, was 'Zivilisation' ausmacht." },
                { title: "Die drei Sonnen (The Three-Body Problem) von Cixin Liu", analysis: "Dieser Roman führt unglaublich anspruchsvolle physikalische Konzepte ein, von der chaotischen Orbitalmechanik eines Drei-Sterne-Systems bis zum 'Sophon'-Konzept – ein Proton, das in zwei Dimensionen entfaltet wird, um ein Supercomputer zu werden. Er dient als eindringliche Erinnerung daran, wie die Technologie einer ausreichend fortgeschrittenen Zivilisation von Magie nicht zu unterscheiden wäre, bleibt aber dennoch in der theoretischen Physik verankert." },
                { title: "Blindsight von Peter Watts", analysis: "Erforscht Bewusstsein und Erstkontakt durch die Linse der harten Neurowissenschaft und Evolutionsbiologie. Der Roman postuliert, dass Bewusstsein eine evolutionäre Sackgasse sein könnte, ein ressourcenintensiver Prozess, der für hochrangige Intelligenz nicht wesentlich ist. Es ist ein zutiefst beunruhigendes, aber rigoros argumentiertes Stück spekulativer Wissenschaft." }
            ]
        },
        settings: {
            title: "Einstellungen",
            theme: {
                title: "Erscheinungsbild-Thema",
                description: "Wählen Sie das Farbschema der Anwendung.",
                cyan: "Cyan",
                amber: "Amber"
            },
            language: {
                title: "Sprache",
                description: "Wählen Sie die Anzeigesprache für die Benutzeroberfläche."
            },
            data: {
                title: "Datenverwaltung",
                description: "Löschen Sie alle Konzepte dauerhaft aus Ihrer lokalen Datenbank. Diese Aktion kann nicht rückgängig gemacht werden.",
                button: "Datenbank leeren",
                confirm: "Sind Sie sicher, dass Sie alle Konzepte dauerhaft löschen möchten?"
            },
            feedback: {
                db_cleared: "Datenbank erfolgreich geleert!",
                theme_updated: (themeName: string) => `Thema auf ${themeName} aktualisiert.`,
                language_updated: (langName: string) => `Sprache auf ${langName} gesetzt.`,
            }
        },
        help: {
            title: "Hilfe & Informationen",
            intro: "Stellar Codex ist ein Werkzeug zur Erforschung und Dokumentation von Hard-Science-Fiction-Konzepten. Alle Daten werden lokal in Ihrem Browser gespeichert, was Datenschutz und Offline-Verfügbarkeit gewährleistet.",
            sections: {
                orbital: {
                    title: "Orbitale Dynamik",
                    content: "Dies ist eine visuelle Demonstration eines plausiblen Exoplanetensystems. Die Daten basieren auf realen Schätzungen für Proxima Centauri b. Die Delta-V-Analyse ist eine vereinfachte, simulierte Berechnung."
                },
                database: {
                    title: "Konzept-Datenbank",
                    content: "Dies ist die Kernfunktion. Sie können Ihre eigenen Hard-Sci-Fi-Konzepte erstellen, bearbeiten und löschen. Ihre Einträge werden dauerhaft in der IndexedDB Ihres Browsers gespeichert, was bedeutet, dass sie bei Ihrer Rückkehr hier sein werden. Es werden keine Daten an einen Server gesendet."
                },
                tracker: {
                    title: "Wissenschafts-Tracker",
                    content: "Dieser Abschnitt bietet kuratierte, tiefgehende Artikel über plausible wissenschaftliche Durchbrüche und literarische Analysen, um Kontext und Inspiration für Ihre eigenen Konzepte zu liefern."
                },
                settings: {
                    title: "Einstellungen",
                    content: "Hier können Sie Ihr Erlebnis anpassen, indem Sie das Farbthema ändern, die Sprache wechseln und Ihre lokal gespeicherten Daten verwalten."
                },
                aboutStellarCodex: {
                    title: "Über Stellar Codex",
                    content: "Stellar Codex ist eine konzeptionelle Anwendung, die für Hard-Science-Fiction-Enthusiasten entwickelt wurde, um wissenschaftlich plausible Konzepte zu erforschen, zu dokumentieren und zu verwalten. Sie läuft vollständig auf Ihrem lokalen Gerät und verwendet die IndexedDB Ihres Browsers zur dauerhaften Speicherung, was vollständigen Datenschutz gewährleistet. Die Benutzeroberfläche wurde mit React erstellt und mit Tailwind CSS gestaltet, die Symbole stammen von Lucide. Diese Anwendung wurde mit Unterstützung eines großen Sprachmodells generiert und demonstriert die Fähigkeit von KI, funktionale und ästhetisch ansprechende Webanwendungen zu erstellen."
                }
            },
            faq: {
                title: "Häufig gestellte Fragen",
                q1: "Sind meine Daten privat?",
                a1: "Ja. Alle Daten, die Sie in die Datenbank eingeben, werden ausschließlich auf Ihrem Computer im lokalen Speicher Ihres Browsers gespeichert. Sie werden niemals hochgeladen oder geteilt.",
                q2: "Kann ich auf meine Daten auf einem anderen Gerät zugreifen?",
                a2: "Nein. Da die Daten lokal gespeichert werden, werden sie nicht zwischen verschiedenen Geräten oder Browsern synchronisiert."
            }
        }
    }
};

type TranslationSet = typeof translations.en;
type AppTranslations = {
    en: TranslationSet;
    de: TranslationSet;
};

// --- Theme Management ---
const themes: Themes = {
    cyan: {
        accentText: 'text-cyan-400',
        accentBorder: 'border-cyan-500',
        accentBg: 'bg-cyan-600',
        accentHoverBg: 'hover:bg-cyan-500',
        accentGlow: 'focus:ring-cyan-500',
        name: "Cyan",
    },
    amber: {
        accentText: 'text-amber-400',
        accentBorder: 'border-amber-500',
        accentBg: 'bg-amber-600',
        accentHoverBg: 'hover:bg-amber-500',
        accentGlow: 'focus:ring-amber-500',
        name: "Amber",
    },
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeName, setThemeName] = useState<ThemeName>(() => (localStorage.getItem('hsc-theme') as ThemeName) || 'cyan');

    const setTheme = (name: ThemeName) => {
        localStorage.setItem('hsc-theme', name);
        setThemeName(name);
    };

    const theme = themes[themeName];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themeName }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// --- Database Context & Provider ---
const DatabaseContext = createContext<DatabaseContextType | null>(null);

const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};

const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<idb.IDBPDatabase | null>(null);
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConcepts = useCallback(async (database: idb.IDBPDatabase) => {
        if (!database) return;
        try {
            const allConcepts = await database.getAll(STORE_NAME);
            setConcepts(allConcepts.reverse());
        } catch (error) {
            console.error("Failed to fetch concepts:", error);
        }
    }, []);

    useEffect(() => {
        const initDB = async () => {
            try {
                const database = await idb.openDB(DB_NAME, DB_VERSION, {
                    upgrade(db) {
                        if (!db.objectStoreNames.contains(STORE_NAME)) {
                            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                        }
                    },
                });
                setDb(database);
                await fetchConcepts(database);
            } catch (error) {
                console.error("Failed to initialize database:", error);
            } finally {
                setLoading(false);
            }
        };
        initDB();
    }, [fetchConcepts]);

    const addConcept = async (concept: Omit<Concept, 'id'>) => {
        if (!db) throw new Error("Database not initialized");
        await db.add(STORE_NAME, concept);
        await fetchConcepts(db);
    };

    const updateConcept = async (concept: Concept) => {
        if (!db) throw new Error("Database not initialized");
        await db.put(STORE_NAME, concept);
        await fetchConcepts(db);
    };

    const deleteConcept = async (id: number) => {
        if (!db) throw new Error("Database not initialized");
        await db.delete(STORE_NAME, id);
        await fetchConcepts(db);
    };

    const clearDatabase = async () => {
        if (!db) throw new Error("Database not initialized");
        await db.clear(STORE_NAME);
        await fetchConcepts(db);
    };

    const value = { db, concepts, addConcept, updateConcept, deleteConcept, clearDatabase };

    const lang = (localStorage.getItem('hsc-lang') as keyof AppTranslations) || 'en';
    const texts = translations[lang];

    if (loading) {
        return <LoadingScreen texts={texts.loading} />;
    }

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
};

// --- App Controller Hook & Context ---
const useAppController = () => {
    const [currentView, setView] = useState('orbital');
    const [language, setLanguageState] = useState<'en' | 'de'>(() => (localStorage.getItem('hsc-lang') as 'en' | 'de') || 'en');
    const [feedback, setFeedback] = useState<FeedbackState>({ message: '', type: '' });

    useEffect(() => {
        if (feedback.message) {
            const timer = setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const setLanguage = useCallback((lang: 'en' | 'de') => {
        localStorage.setItem('hsc-lang', lang);
        setLanguageState(lang);
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const texts = translations[language];

    return {
        currentView,
        setView: useCallback(setView, []),
        language,
        setLanguage,
        feedback,
        setFeedback: useCallback(setFeedback, []),
        texts,
    };
};

const AppContext = createContext<AppContextType | null>(null);

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const value = useAppController();
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// --- UI Components ---
const Icon: React.FC<IconProps> = ({ name, className }) => {
    const LucideIcon = lucide[name];
    return LucideIcon ? <LucideIcon className={className} aria-hidden="true" /> : null;
};

// --- Reusable Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    children: React.ReactNode;
    leftIcon?: keyof typeof lucide;
    size?: 'normal' | 'small';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'normal', children, leftIcon, className = '', ...props }, ref) => {
    const { theme } = useTheme();
    
    const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
    
    const sizeStyles = {
        normal: "px-4 py-2 rounded-md",
        small: "p-2 rounded-md"
    };

    const variantStyles = {
        primary: `${theme.accentBg} ${theme.accentHoverBg} text-white ${theme.accentGlow}`,
        secondary: `bg-gray-700 hover:bg-gray-600 text-gray-200 ${theme.accentGlow}`,
        danger: `bg-red-600 hover:bg-red-500 text-white focus:ring-red-500`,
        ghost: `text-gray-400 hover:${theme.accentText} ${theme.accentGlow}`
    };

    return (
        <button ref={ref} className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
            {leftIcon && <Icon name={leftIcon} className="w-4 h-4" />}
            {children}
        </button>
    );
});


const LoadingScreen: React.FC<LoadingScreenProps> = memo(({ texts }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-cyan-400">
        <Icon name="LoaderCircle" className="w-16 h-16 animate-spin mb-4" />
        <h1 className="text-2xl font-orbitron">{texts.title}</h1>
        <p className="text-gray-400">{texts.subtitle}</p>
    </div>
));

const Header: React.FC<HeaderProps> = memo(({ currentView, setView, texts }) => {
    const { theme } = useTheme();
    const navItems: { id: string; label: string; icon: keyof typeof lucide }[] = [
        { id: 'orbital', label: texts.nav.orbital, icon: 'Orbit' },
        { id: 'database', label: texts.nav.database, icon: 'DatabaseZap' },
        { id: 'tracker', label: texts.nav.tracker, icon: 'Satellite' },
        { id: 'settings', label: texts.nav.settings, icon: 'Settings' },
        { id: 'help', label: texts.nav.help, icon: 'HelpCircle' },
    ];

    return (
        <header className={`bg-gray-950/50 backdrop-blur-sm border-b ${theme.accentBorder}/20 p-4 sticky top-0 z-10`}>
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Icon name="Rocket" className={`w-8 h-8 ${theme.accentText}`} />
                    <h1 className="text-xl md:text-2xl font-orbitron text-white hidden sm:block">{texts.title}</h1>
                </div>
                <nav className="flex items-center gap-1 md:gap-2">
                    {navItems.map(item => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`flex items-center gap-2 px-2 md:px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 transform active:scale-95 ${isActive ? `bg-cyan-500/20 ${theme.accentText} shadow-lg` : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            >
                                <Icon name={item.icon} className="w-4 h-4" />
                                <span className="hidden md:inline">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
});

// --- Section 1: Orbital Dynamics Explorer ---
const OrbitalExplorer: React.FC<OrbitalExplorerProps> = memo(({ texts }) => {
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [hoveredBody, setHoveredBody] = useState<string | null>(null);
    const { theme } = useTheme();
    const planetName = texts.planet.name;

    const handleAnalysis = useCallback(() => {
        setAnalysisResult(texts.analysis_result);
    }, [texts.analysis_result]);

    const SvgTooltip: React.FC<SvgTooltipProps> = ({ x, y, text }) => (
        <g transform={`translate(${x}, ${y})`} style={{ pointerEvents: 'none' }}>
            <rect x="0" y="-15" width={text.length * 6 + 10} height="20" rx="3" fill="rgba(0,0,0,0.7)" stroke="#67e8f9" strokeWidth="0.5" />
            <text x="5" y="-5" fill="#e0f2fe" fontSize="10px" fontFamily="Roboto" dominantBaseline="middle">{text}</text>
        </g>
    );

    return (
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg`}>
                <h2 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{texts.title}</h2>
                <div className="aspect-video w-full bg-black rounded-md flex items-center justify-center border border-cyan-900 overflow-hidden">
                    <svg width="100%" height="100%" viewBox="0 0 400 200">
                        <defs>
                            <radialGradient id="starGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" style={{ stopColor: '#ffddaa', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#ff8c00', stopOpacity: 0 }} />
                                <animate attributeName="r" values="50%;55%;50%" dur="4s" repeatCount="indefinite" />
                            </radialGradient>
                            <path id="orbitPath" d="M 50 100 A 150 75 0 1 0 350 100 A 150 75 0 1 0 50 100" fill="none" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="2,2" />
                        </defs>
                        <g onMouseEnter={() => setHoveredBody('star')} onMouseLeave={() => setHoveredBody(null)} style={{ cursor: 'pointer' }}>
                            <circle cx="200" cy="100" r="10" fill="url(#starGradient)">
                                <animate attributeName="opacity" values="1;0.9;1.0;0.95;1.0" dur="3s" repeatCount="indefinite" />
                            </circle>
                            {hoveredBody === 'star' && <SvgTooltip x={155} y={75} text={texts.star.name} />}
                        </g>

                        <use href="#orbitPath" />

                        <g onMouseEnter={() => setHoveredBody('planet')} onMouseLeave={() => setHoveredBody(null)} style={{ cursor: 'pointer' }}>
                            <circle cx="0" cy="0" r="4" fill="#67e8f9" />
                            {hoveredBody === 'planet' && <SvgTooltip x={10} y={0} text={planetName} />}
                            <animateMotion dur="12s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.65 0 0.35 1">
                                <mpath href="#orbitPath" />
                            </animateMotion>
                        </g>
                    </svg>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">{texts.mock_note}</p>
            </div>
            <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg flex flex-col`}>
                <h3 className={`text-xl font-orbitron ${theme.accentText} mb-4`}>{texts.data_title}</h3>
                <div className="space-y-3 flex-grow text-sm">
                    <p><strong>{texts.body}:</strong> {texts.star.name}</p>
                    <p className="pl-4"><strong>{texts.star_type}:</strong> {texts.star.type}</p>
                    <hr className="border-cyan-500/10 my-3" />
                    <p><strong>{texts.body}:</strong> {texts.planet.name}</p>
                    <p className="pl-4"><strong>{texts.gravity}:</strong> {texts.planet.gravity}</p>
                    <p className="pl-4"><strong>{texts.pressure}:</strong> {texts.planet.pressure}</p>
                    <p className="pl-4"><strong>{texts.temp}:</strong> {texts.planet.temperature}</p>
                    <p className="pl-4"><strong>{texts.orbital_period_label}:</strong> {texts.planet.orbital_period}</p>
                    <p className="pl-4"><strong>{texts.semi_major_axis_label}:</strong> {texts.planet.semi_major_axis}</p>
                    <p className="pl-4"><strong>{texts.tidal_lock_label}:</strong> {texts.planet.tidal_lock}</p>
                </div>
                <Button onClick={handleAnalysis} className="mt-4 w-full">
                    {texts.button}
                </Button>
                {analysisResult && <p className="mt-4 text-xs bg-gray-900 p-2 rounded border border-gray-700">{analysisResult}</p>}
            </div>
        </div>
    );
});


// --- Section 2: Plausible Xenobiology & Advanced Engineering Database ---
const ConceptDatabase: React.FC<ConceptDatabaseProps> = memo(({ texts, setAppFeedback }) => {
    const { concepts, addConcept, updateConcept, deleteConcept } = useDatabase();
    const [formState, setFormState] = useState<Omit<Concept, 'id'>>({ concept: '', scientificBasis: '', plausibility: 'Medium', details: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});
    const conceptInputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (isFormVisible) {
            conceptInputRef.current?.focus();
        }
    }, [isFormVisible]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    }, []);

    const validateField = useCallback((name: string, value: string): string | null => {
        const validationTexts = texts.validation;
        switch (name) {
            case 'concept':
                if (!value.trim()) return validationTexts.required;
                if (value.length < 3) return validationTexts.concept_minLength;
                if (value.length > 100) return validationTexts.concept_maxLength;
                break;
            case 'scientificBasis':
                if (!value.trim()) return validationTexts.required;
                if (value.length < 10) return validationTexts.basis_minLength;
                if (value.length > 250) return validationTexts.basis_maxLength;
                break;
            case 'details':
                if (value.length > 2000) return validationTexts.details_maxLength;
                break;
            default:
                break;
        }
        return null;
    }, [texts.validation]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    }, [validateField]);

    const resetForm = useCallback(() => {
        setFormState({ concept: '', scientificBasis: '', plausibility: 'Medium', details: '' });
        setEditingId(null);
        setIsFormVisible(false);
        setFormErrors({});
    }, []);

    const validateForm = useCallback(() => {
        const errors: { [key: string]: string | null } = {};
        let isValid = true;

        const conceptError = validateField('concept', formState.concept);
        if (conceptError) {
            errors.concept = conceptError;
            isValid = false;
        }

        const basisError = validateField('scientificBasis', formState.scientificBasis);
        if (basisError) {
            errors.scientificBasis = basisError;
            isValid = false;
        }

        const detailsError = validateField('details', formState.details);
        if (detailsError) {
            errors.details = detailsError;
            isValid = false;
        }

        return { errors, isValid };
    }, [formState, validateField]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        const { errors, isValid } = validateForm();
        setFormErrors(errors);

        if (!isValid) {
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                await updateConcept({ ...formState, id: editingId });
                setAppFeedback({ message: texts.feedback.updated, type: 'success' });
            } else {
                await addConcept(formState);
                setAppFeedback({ message: texts.feedback.saved, type: 'success' });
            }
            resetForm();
        } catch (error) {
            console.error("Database operation failed:", error);
            setAppFeedback({ message: texts.feedback.error, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    }, [editingId, formState, texts, setAppFeedback, addConcept, updateConcept, resetForm, validateForm]);

    const handleEdit = useCallback((concept: Concept) => {
        setEditingId(concept.id!);
        setFormState(concept);
        setIsFormVisible(true);
        setFormErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleDelete = useCallback(async (id: number) => {
        if (window.confirm(texts.delete_confirm)) {
            try {
                await deleteConcept(id);
                setAppFeedback({ message: texts.feedback.deleted, type: 'delete' });
            } catch (error) {
                console.error("Delete operation failed:", error);
                setAppFeedback({ message: texts.feedback.error, type: 'error' });
            }
        }
    }, [texts, setAppFeedback, deleteConcept]);

    const ConceptForm = () => (
        <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg mb-8`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className={`text-xl font-orbitron ${theme.accentText}`}>{editingId ? texts.form.edit_title : texts.form.add_title}</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="concept-input">{texts.form.concept_label}</label>
                    <input ref={conceptInputRef} id="concept-input" type="text" name="concept" value={formState.concept} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-gray-900 border rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder} disabled:opacity-50 ${formErrors.concept ? 'border-red-500' : 'border-gray-700'}`} required disabled={isSaving} />
                    {formErrors.concept && <p className="text-red-400 text-xs mt-1">{formErrors.concept}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="basis-input">{texts.form.basis_label}</label>
                    <input id="basis-input" type="text" name="scientificBasis" value={formState.scientificBasis} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-gray-900 border rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder} disabled:opacity-50 ${formErrors.scientificBasis ? 'border-red-500' : 'border-gray-700'}`} required disabled={isSaving} />
                    {formErrors.scientificBasis && <p className="text-red-400 text-xs mt-1">{formErrors.scientificBasis}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plausibility-select">{texts.form.plausibility_label}</label>
                    <select id="plausibility-select" name="plausibility" value={formState.plausibility} onChange={handleInputChange} className={`w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder} disabled:opacity-50`} disabled={isSaving}>
                        {texts.form.plausibility_options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="details-textarea">{texts.form.details_label}</label>
                    <textarea id="details-textarea" name="details" value={formState.details} onChange={handleInputChange} onBlur={handleBlur} rows={4} className={`w-full bg-gray-900 border rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder} disabled:opacity-50 ${formErrors.details ? 'border-red-500' : 'border-gray-700'}`} disabled={isSaving}></textarea>
                    {formErrors.details && <p className="text-red-400 text-xs mt-1">{formErrors.details}</p>}
                </div>
                <div className="flex gap-4">
                    <Button type="submit" disabled={isSaving} className="flex-1">
                        {isSaving && <Icon name="LoaderCircle" className="w-4 h-4 animate-spin" />}
                        {editingId ? (isSaving ? texts.form.updating_button : texts.form.update_button) : (isSaving ? texts.form.saving_button : texts.form.save_button)}
                    </Button>
                    <Button type="button" onClick={resetForm} disabled={isSaving} variant="secondary" className="flex-1">{texts.form.cancel_button}</Button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-orbitron ${theme.accentText}`}>{texts.title}</h2>
                {!isFormVisible && (
                     <Button onClick={() => setIsFormVisible(true)} leftIcon="Plus">
                        {texts.add_button}
                    </Button>
                )}
            </div>

            {isFormVisible && <ConceptForm />}

            <div className="space-y-4">
                {concepts.length > 0 ? concepts.map(concept => {
                    const isHigh = concept.plausibility === 'High' || concept.plausibility === 'Hoch';
                    const isMedium = concept.plausibility === 'Medium' || concept.plausibility === 'Mittel';
                    return (
                        <div key={concept.id} className={`bg-gray-900/50 border ${theme.accentBorder}/10 p-4 rounded-lg flex justify-between items-start`}>
                            <div>
                                <h4 className={`text-lg font-bold ${theme.accentText}`}>{concept.concept}</h4>
                                <p className="text-sm text-gray-400"><strong>{texts.entry.basis}:</strong> {concept.scientificBasis}</p>
                                <p className="text-sm text-gray-400 mt-2"><strong>{texts.entry.details}:</strong> {concept.details || 'N/A'}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-end gap-1 h-4" title={`${texts.entry.plausibility}: ${concept.plausibility}`}>
                                        <div className="w-2 h-2 rounded-sm bg-red-500"></div>
                                        <div className={`w-2 h-3 rounded-sm transition-colors ${isMedium || isHigh ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                                        <div className={`w-2 h-4 rounded-sm transition-colors ${isHigh ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                    </div>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${isHigh ? 'bg-green-500/20 text-green-300' : isMedium ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {concept.plausibility}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 ml-4">
                                <Button onClick={() => handleEdit(concept)} aria-label={texts.form.edit_label} variant="ghost" size="small"><Icon name="Pencil" className="w-4 h-4" /></Button>
                                <Button onClick={() => handleDelete(concept.id!)} aria-label={texts.form.delete_label} variant="ghost" size="small" className="hover:text-red-500"><Icon name="Trash2" className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className={`relative text-center py-24 px-4 border-2 border-dashed ${theme.accentBorder}/20 rounded-lg flex flex-col items-center justify-center gap-4 overflow-hidden bg-gray-900/20`}>
                        <Icon name="Binary" className="w-64 h-64 text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className={`relative p-4 bg-gray-900/50 rounded-full border ${theme.accentBorder}/20`}>
                                <Icon name="BrainCircuit" className={`w-16 h-16 mx-auto ${theme.accentText}`} />
                                <div className={`absolute -top-1 -right-1 w-5 h-5 ${theme.accentBg} rounded-full flex items-center justify-center`}>
                                    <Icon name="Sparkles" className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <h3 className={`text-xl font-orbitron text-white mt-4`}>{texts.empty.title}</h3>
                            <p className="max-w-md text-gray-400">{texts.empty.subtitle}</p>
                            <Button onClick={() => setIsFormVisible(true)} leftIcon="Plus" className="mt-2">
                                {texts.empty.button}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

// --- Section 3: Real-World Science & Literary Analysis Tracker ---
const ScienceTracker: React.FC<ScienceTrackerProps> = memo(({ texts }) => {
    const { scienceFeed, literaryAnalysis } = texts;
    const { theme } = useTheme();

    return (
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h2 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{texts.feed_title}</h2>
                {scienceFeed.map((item, index) => (
                    <div key={index} className={`bg-gray-900/50 border ${theme.accentBorder}/10 p-4 rounded-lg`}>
                        <h4 className={`font-bold ${theme.accentText} mb-1`}>{item.title}</h4>
                        <p className="text-sm text-gray-400 mb-2">{item.summary}</p>
                        <p className="text-xs text-cyan-200/70 border-l-2 border-cyan-500/50 pl-2">
                            <span className="font-bold">Implications: </span>{item.implications}
                        </p>
                    </div>
                ))}
            </div>
            <div className="space-y-6">
                <h2 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{texts.analysis_title}</h2>
                {literaryAnalysis.map((item, index) => (
                    <div key={index} className={`bg-gray-900/50 border ${theme.accentBorder}/10 p-4 rounded-lg`}>
                        <h4 className={`font-bold ${theme.accentText}`}>{item.title}</h4>
                        <p className="text-sm text-gray-400">{item.analysis}</p>
                    </div>
                ))}
            </div>
        </div>
    );
});

// --- Section 4: Settings ---
const Settings: React.FC<SettingsProps> = memo(({ texts, language, setLanguage, setAppFeedback }) => {
    const { theme, setTheme, themeName } = useTheme();
    const { clearDatabase } = useDatabase();

    const handleClearDB = async () => {
        if (window.confirm(texts.data.confirm)) {
            try {
                await clearDatabase();
                setAppFeedback({ message: texts.feedback.db_cleared, type: 'success' });
            } catch (error) {
                console.error("Failed to clear database:", error);
                setAppFeedback({ message: (error as Error).message, type: 'error' });
            }
        }
    };

    const handleThemeChange = (key: ThemeName) => {
        setTheme(key);
        setAppFeedback({ message: texts.feedback.theme_updated(themes[key].name), type: 'success' });
    }

    const handleLanguageChange = (lang: 'en' | 'de') => {
        setLanguage(lang);
        setAppFeedback({ message: texts.feedback.language_updated(lang === 'en' ? 'English' : 'Deutsch'), type: 'success' });
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h2 className={`text-3xl font-orbitron ${theme.accentText} mb-8`}>{texts.title}</h2>
            <div className="space-y-8">
                {/* Theme Settings */}
                <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg`}>
                    <h3 className="text-xl font-bold mb-2">{texts.theme.title}</h3>
                    <p className="text-gray-400 mb-4">{texts.theme.description}</p>
                    <div className="flex gap-4">
                        {(Object.keys(themes) as ThemeName[]).map(key => (
                            <button key={key} onClick={() => handleThemeChange(key)} className={`flex-1 p-4 rounded-lg border-2 transition-all transform active:scale-95 ${themeName === key ? `${themes[key].accentBorder}` : 'border-gray-700 hover:border-gray-500'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full ${themes[key].accentBg}`}></div>
                                    <span className="text-lg font-bold">{themes[key].name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                {/* Language Settings */}
                <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg`}>
                    <h3 className="text-xl font-bold mb-2">{texts.language.title}</h3>
                    <p className="text-gray-400 mb-4">{texts.language.description}</p>
                    <div className="flex bg-gray-900 p-1 rounded-md">
                        <button onClick={() => handleLanguageChange('en')} className={`w-full py-2 rounded-md transition-colors transform active:scale-95 ${language === 'en' ? `${theme.accentBg} text-white` : 'hover:bg-gray-800 text-gray-300'}`}>English</button>
                        <button onClick={() => handleLanguageChange('de')} className={`w-full py-2 rounded-md transition-colors transform active:scale-95 ${language === 'de' ? `${theme.accentBg} text-white` : 'hover:bg-gray-800 text-gray-300'}`}>Deutsch</button>
                    </div>
                </div>
                {/* Data Management */}
                <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-red-300 mb-2">{texts.data.title}</h3>
                    <p className="text-red-400 mb-4">{texts.data.description}</p>
                    <Button onClick={handleClearDB} variant="danger" className="w-full sm:w-auto">
                        {texts.data.button}
                    </Button>
                </div>
            </div>
        </div>
    );
});


// --- Section 5: Help ---
const Help: React.FC<HelpProps> = memo(({ texts }) => {
    const [openSection, setOpenSection] = useState<string | null>(null);
    const { theme } = useTheme();

    const AccordionItem: React.FC<AccordionItemProps> = ({ id, title, children }) => {
        const isOpen = openSection === id;
        return (
            <div className={`border-b ${theme.accentBorder}/20`}>
                <button onClick={() => setOpenSection(isOpen ? null : id)} className="w-full text-left flex justify-between items-center p-4 hover:bg-gray-800/50 transition-colors">
                    <h4 className="text-lg font-bold">{title}</h4>
                    <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} className="w-5 h-5 flex-shrink-0 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="p-4 pt-0 text-gray-400">{children}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h2 className={`text-3xl font-orbitron ${theme.accentText} mb-4`}>{texts.title}</h2>
            <p className="mb-8 text-gray-400">{texts.intro}</p>
            <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 rounded-lg mb-8`}>
                {/* FIX: Cast the result of Object.entries to provide a specific type for 'section', resolving errors on accessing 'title' and 'content'. */}
                {(Object.entries(texts.sections) as [string, TranslationSection][]).map(([key, section]) => (
                    <AccordionItem key={key} id={key} title={section.title}>{section.content}</AccordionItem>
                ))}
            </div>

            <h3 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{texts.faq.title}</h3>
            <div className="space-y-4 mb-8">
                <div>
                    <h4 className="font-bold">{texts.faq.q1}</h4>
                    <p className="text-gray-400">{texts.faq.a1}</p>
                </div>
                <div>
                    <h4 className="font-bold">{texts.faq.q2}</h4>
                    <p className="text-gray-400">{texts.faq.a2}</p>
                </div>
            </div>
        </div>
    );
});

// --- New App UI Components ---
const MainContent = memo(() => {
    const { currentView, texts, language, setLanguage, setFeedback } = useAppContext();

    switch (currentView) {
        case 'orbital':
            return <OrbitalExplorer texts={texts.orbitalExplorer} />;
        case 'database':
            return <ConceptDatabase texts={texts.conceptDatabase} setAppFeedback={setFeedback} />;
        case 'tracker':
            return <ScienceTracker texts={texts.scienceTracker} />;
        case 'settings':
            return <Settings texts={texts.settings} language={language} setLanguage={setLanguage} setAppFeedback={setFeedback} />;
        case 'help':
            return <Help texts={texts.help} />;
        default:
            return <OrbitalExplorer texts={texts.orbitalExplorer} />;
    }
});

const FeedbackToast = memo(() => {
    const { feedback } = useAppContext();

    if (!feedback.message) return null;

    const toastStyles: { [key: string]: string } = {
        success: 'bg-green-600/30 backdrop-blur-sm border border-green-500 text-green-300',
        delete: 'bg-red-600/30 backdrop-blur-sm border border-red-500 text-red-300',
        error: 'bg-orange-600/30 backdrop-blur-sm border border-orange-500 text-orange-300',
    };

    const iconName: { [key: string]: keyof typeof lucide } = {
        success: 'CheckCircle2',
        delete: 'Trash2',
        error: 'AlertTriangle',
    };

    return (
        <div
            className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl transition-all duration-500 transform animate-fade-in-up z-20 ${toastStyles[feedback.type] || ''}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <Icon name={iconName[feedback.type] || 'AlertTriangle'} className="w-5 h-5" />
            <span className="font-bold">{feedback.message}</span>
        </div>
    );
});

const AppUI = () => {
    const { currentView, setView, texts } = useAppContext();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200">
            <Header currentView={currentView} setView={setView} texts={texts.header} />
            <main className="container mx-auto">
                <MainContent />
            </main>
            <FeedbackToast />
        </div>
    );
};


// --- Main App Component ---
const App = () => (
    <AppProvider>
        <AppUI />
    </AppProvider>
);

const Root: React.FC = () => (
    <StrictMode>
        <ThemeProvider>
            <DatabaseProvider>
                <App />
            </DatabaseProvider>
        </ThemeProvider>
    </StrictMode>
);

const root = createRoot(document.getElementById('root')!);
root.render(<Root />);