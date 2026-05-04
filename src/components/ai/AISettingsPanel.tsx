import React, { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    setPrimaryProvider,
    setRoutingMode,
    setOllamaBaseUrl,
} from '../../store/slices/aiPreferencesSlice';
import { incrementRequests } from '../../store/slices/aiUsageSlice';
import { showToast } from '../../store/slices/uiSlice';
import * as vault from '../../services/security/aiKeyVault';
import type { ProviderId, RoutingMode } from '../../services/ai/core/types';
import { LocalModelsPanel } from './LocalModelsPanel';
import { SciFiPromptLibrary } from './SciFiPromptLibrary';
import { runConsistencyCheck } from '../../services/ai/consistency/consistencyValidator';
import { themes } from '../../lib/constants';
import type { TranslationSet } from '../../types';

const PROVIDERS: ProviderId[] = ['mock', 'ollama', 'gemini', 'openai'];
const ROUTES: RoutingMode[] = ['local_first', 'cloud_first', 'local_only', 'cloud_only'];

type Props = {
    aiLabels: TranslationSet['settings']['ai'];
};

export const AISettingsPanel: React.FC<Props> = ({ aiLabels }) => {
    const dispatch = useAppDispatch();
    const { themeName } = useAppSelector((s) => s.ui);
    const prefs = useAppSelector((s) => s.aiPreferences);
    const concepts = useAppSelector((s) => s.concepts.items);
    const theme = themes[themeName];

    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [openaiKey, setOpenaiKey] = useState('');
    const [vaultReady, setVaultReady] = useState(false);

    React.useEffect(() => {
        void vault.isVaultInitialized().then(setVaultReady);
    }, []);

    const unlocked = vault.isUnlocked();

    const onInitVault = useCallback(async () => {
        if (pass1.length < 8 || pass1 !== pass2) {
            dispatch(showToast({ message: 'Passphrase mismatch or too short (min 8).', type: 'error' }));
            return;
        }
        try {
            await vault.initVault(pass1);
            setPass1('');
            setPass2('');
            setVaultReady(true);
            dispatch(showToast({ message: 'Vault created.', type: 'success' }));
        } catch {
            dispatch(showToast({ message: 'Vault init failed.', type: 'error' }));
        }
    }, [dispatch, pass1, pass2]);

    const onUnlock = useCallback(async () => {
        const ok = await vault.unlock(pass1);
        setPass1('');
        if (ok) dispatch(showToast({ message: 'Vault unlocked.', type: 'success' }));
        else dispatch(showToast({ message: 'Wrong passphrase.', type: 'error' }));
    }, [dispatch, pass1]);

    const onLock = useCallback(() => {
        vault.lockVault();
        dispatch(showToast({ message: 'Vault locked.', type: 'success' }));
    }, [dispatch]);

    const saveGemini = useCallback(async () => {
        try {
            await vault.saveProviderSecret('gemini', geminiKey.trim());
            setGeminiKey('');
            dispatch(showToast({ message: 'Gemini key saved (encrypted).', type: 'success' }));
        } catch {
            dispatch(showToast({ message: 'Save failed — unlock vault first.', type: 'error' }));
        }
    }, [dispatch, geminiKey]);

    const saveOpenai = useCallback(async () => {
        try {
            await vault.saveProviderSecret('openai', openaiKey.trim());
            setOpenaiKey('');
            dispatch(showToast({ message: 'OpenAI key saved (encrypted).', type: 'success' }));
        } catch {
            dispatch(showToast({ message: 'Save failed — unlock vault first.', type: 'error' }));
        }
    }, [dispatch, openaiKey]);

    const onConsistency = useCallback(async () => {
        try {
            const summary = concepts.map((c) => ({
                id: c.id,
                summary: `${c.concept}: ${c.scientificBasis}`,
            }));
            const r = await runConsistencyCheck(
                { kind: 'hard_consistency_check', worldConcepts: summary },
                prefs.primaryProvider,
                prefs.routingMode
            );
            dispatch(incrementRequests(prefs.primaryProvider));
            dispatch(
                showToast({
                    message: r.passed ? 'Check finished (heuristic pass).' : 'Check finished — review warnings.',
                    type: r.passed ? 'success' : 'error',
                })
            );
        } catch (e) {
            dispatch(
                showToast({
                    message: e instanceof Error ? e.message : 'Consistency check failed',
                    type: 'error',
                })
            );
        }
    }, [concepts, dispatch, prefs.primaryProvider, prefs.routingMode]);

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm text-gray-400 mb-1">{aiLabels.primary_label}</label>
                <select
                    aria-label={aiLabels.primary_label}
                    value={prefs.primaryProvider}
                    onChange={(e) => dispatch(setPrimaryProvider(e.target.value as ProviderId))}
                    className="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-full max-w-md"
                >
                    {PROVIDERS.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">{aiLabels.routing_label}</label>
                <select
                    aria-label={aiLabels.routing_label}
                    value={prefs.routingMode}
                    onChange={(e) => dispatch(setRoutingMode(e.target.value as RoutingMode))}
                    className="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-full max-w-md"
                >
                    {ROUTES.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">{aiLabels.ollama_url}</label>
                <input
                    aria-label={aiLabels.ollama_url}
                    placeholder={aiLabels.ollama_url}
                    value={prefs.ollamaBaseUrl}
                    onChange={(e) => dispatch(setOllamaBaseUrl(e.target.value))}
                    className="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-full max-w-md font-mono text-sm"
                />
                <div className="mt-2">
                    <LocalModelsPanel
                        ollamaUrl={prefs.ollamaBaseUrl}
                        labels={{ discover: aiLabels.discover }}
                        themeKey={themeName}
                    />
                </div>
            </div>

            {!vaultReady && (
                <div className="border border-amber-700/40 rounded p-4 space-y-2">
                    <p className="text-sm text-amber-200">{aiLabels.init_btn}</p>
                    <input
                        type="password"
                        autoComplete="new-password"
                        placeholder={aiLabels.pass_label}
                        value={pass1}
                        onChange={(e) => setPass1(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-full max-w-md"
                    />
                    <input
                        type="password"
                        placeholder="Repeat"
                        value={pass2}
                        onChange={(e) => setPass2(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-full max-w-md"
                    />
                    <button
                        type="button"
                        onClick={() => void onInitVault()}
                        className={`px-4 py-2 rounded-md ${theme.accentBg} text-white`}
                    >
                        {aiLabels.init_btn}
                    </button>
                </div>
            )}

            {vaultReady && (
                <div className="border border-gray-700 rounded p-4 space-y-2">
                    <p className="text-sm text-gray-400">
                        {unlocked ? 'Vault unlocked for this session.' : 'Vault locked.'}
                    </p>
                    {!unlocked && (
                        <>
                            <input
                                type="password"
                                autoComplete="current-password"
                                placeholder={aiLabels.pass_label}
                                value={pass1}
                                onChange={(e) => setPass1(e.target.value)}
                                className="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-full max-w-md"
                            />
                            <button
                                type="button"
                                onClick={() => void onUnlock()}
                                className={`px-4 py-2 rounded-md ${theme.accentBg} text-white mr-2`}
                            >
                                {aiLabels.unlock_btn}
                            </button>
                        </>
                    )}
                    {unlocked && (
                        <button
                            type="button"
                            onClick={onLock}
                            className="px-4 py-2 rounded-md bg-gray-800 text-white"
                        >
                            {aiLabels.lock_btn}
                        </button>
                    )}
                </div>
            )}

            {unlocked && (
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">{aiLabels.gemini}</label>
                        <input
                            type="password"
                            autoComplete="off"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-full font-mono text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => void saveGemini()}
                            className={`mt-2 px-3 py-1 rounded text-sm ${theme.accentBg} text-white`}
                        >
                            {aiLabels.save_cloud}
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">{aiLabels.openai}</label>
                        <input
                            type="password"
                            autoComplete="off"
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-full font-mono text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => void saveOpenai()}
                            className={`mt-2 px-3 py-1 rounded text-sm ${theme.accentBg} text-white`}
                        >
                            {aiLabels.save_cloud}
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => void onConsistency()}
                className={`px-4 py-2 rounded-md border ${theme.accentBorder} ${theme.accentText}`}
            >
                {aiLabels.consistency}
            </button>

            <SciFiPromptLibrary heading={aiLabels.prompts} themeKey={themeName} />
        </div>
    );
};
