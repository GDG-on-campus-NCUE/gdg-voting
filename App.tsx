
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppPhase, VotingConfig, VoteCounts, Voter, GroupVotes } from './types';
import Setup from './components/Setup';
import Voting from './components/Voting';
import Results from './components/Results';

const App: React.FC = () => {
    const [phase, setPhase] = useLocalStorage<AppPhase>('voting-app-phase', 'setup');
    const [config, setConfig] = useLocalStorage<VotingConfig | null>('voting-app-config', null);
    const [votes, setVotes] = useLocalStorage<VoteCounts>('voting-app-votes', {});
    const [voters, setVoters] = useLocalStorage<Voter[]>('voting-app-voters', []);
    const [groupVotes, setGroupVotes] = useLocalStorage<GroupVotes>('voting-app-group-votes', {});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (phase === 'voting' && config?.endTime) {
            const interval = setInterval(() => {
                const endTime = new Date(config.endTime).getTime();
                const now = new Date().getTime();
                const remaining = endTime - now;
                setTimeRemaining(remaining);
                if (remaining <= 0) {
                    setPhase('results');
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [phase, config, setPhase]);

    const handleSetupComplete = (newConfig: VotingConfig) => {
        setConfig(newConfig);
        // Initialize votes count
        const initialVotes: VoteCounts = {};
        newConfig.sites.forEach(site => {
            initialVotes[site.id] = 0;
        });
        setVotes(initialVotes);
        setVoters([]);
        setGroupVotes({});
        setPhase('voting');
    };
    
    const handleReset = () => {
        // Clear all persisted data
        localStorage.removeItem('voting-app-phase');
        localStorage.removeItem('voting-app-config');
        localStorage.removeItem('voting-app-votes');
        localStorage.removeItem('voting-app-voters');
        localStorage.removeItem('voting-app-group-votes');
        // Reload to reset state
        window.location.reload();
    };

    const renderPhase = () => {
        switch (phase) {
            case 'setup':
                return <Setup onSetupComplete={handleSetupComplete} />;
            case 'voting':
                if (!config) return <p>Configuration is missing. Please reset.</p>;
                return <Voting config={config} votes={votes} setVotes={setVotes} voters={voters} setVoters={setVoters} groupVotes={groupVotes} setGroupVotes={setGroupVotes} timeRemaining={timeRemaining} />;
            case 'results':
                 if (!config || !votes) return <p>Configuration or vote data is missing. Please reset.</p>;
                return <Results config={config} votes={votes} onReset={handleReset} />;
            default:
                return <p>Invalid application state.</p>;
        }
    };
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Live Website Voting
                </h1>
                <p className="text-gray-400 mt-2">Vote for your favorite project!</p>
            </header>
            <main>
                {renderPhase()}
            </main>
            {phase !== 'setup' && (
                 <footer className="text-center mt-8">
                    <button onClick={handleReset} className="text-gray-500 hover:text-red-500 transition-colors text-sm">Reset Application (Admin)</button>
                </footer>
            )}
        </div>
    );
};

export default App;
