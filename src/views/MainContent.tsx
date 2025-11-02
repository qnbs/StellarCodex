import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { VIEWS } from '../lib/constants';
import { OrbitalExplorer } from './OrbitalExplorer/OrbitalExplorer';
import { ConceptDatabase } from './ConceptDatabase/ConceptDatabase';
import { ScienceTracker } from './ScienceTracker/ScienceTracker';
import { Settings } from './Settings/Settings';
import { Help } from './Help/Help';
import { useAppSelector } from '../store/hooks';

export const MainContent: React.FC = () => {
    const currentView = useAppSelector(state => state.ui.currentView);
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
