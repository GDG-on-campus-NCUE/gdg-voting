
import React, { useState, useEffect } from 'react';
import { AppPhase, VotingConfig, VoteCounts, Voter, GroupVotes } from './types';
import Voting from './components/Voting';
import Results from './components/Results';
import { initClient, getSheetData } from './googleSheetsService';

const App: React.FC = () => {
    const [phase, setPhase] = useState<AppPhase>('loading');
    const [config, setConfig] = useState<VotingConfig | null>(null);
    const [votes, setVotes] = useState<VoteCounts>({});
    const [voters, setVoters] = useState<Voter[]>([]);
    const [groupVotes, setGroupVotes] = useState<GroupVotes>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    const setPlaceholderData = () => {
        const placeholderConfig: VotingConfig = {
            countdown: 300,
            sites: [
                { id: 'ph-google', name: 'Google', url: 'https://www.google.com' },
                { id: 'ph-gdg', name: 'GDG NCUESA', url: 'https://gdg.ncuesa.org.tw' }
            ]
        };
        setConfig(placeholderConfig);
        setVoters([]);
        const initialVotes: VoteCounts = {};
        placeholderConfig.sites.forEach(site => { initialVotes[site.id] = 0; });
        setVotes(initialVotes);
        setGroupVotes({});
        setPhase('voting');
    };

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // await initClient();
                const configData = await getSheetData('Config!A:C');
                if (configData && configData.length > 1) { // Need countdown and at least one site
                    const countdown = parseInt(configData[0][0], 10);
                    const sites = configData.slice(1).map(row => ({ id: row[0], name: row[1], url: row[2] }));
                    const newConfig = { countdown, sites };
                    setConfig(newConfig);

                    const votesData = await getSheetData('Votes!A:C');
                    const voters = votesData ? votesData.map(row => ({ email: row[0], group: row[1], votedFor: row[2] })) : [];
                    setVoters(voters);

                    const initialVotes: VoteCounts = {};
                    sites.forEach(site => {
                        initialVotes[site.id] = voters.filter(v => v.votedFor === site.id).length;
                    });
                    setVotes(initialVotes);

                    const initialGroupVotes: GroupVotes = {};
                    voters.forEach(voter => {
                        const group = parseInt(voter.group, 10);
                        initialGroupVotes[group] = (initialGroupVotes[group] || 0) + 1;
                    });
                    setGroupVotes(initialGroupVotes);

                    setPhase('voting');

                } else {
                    setPlaceholderData();
                }
            } catch (error) {
                console.error("Error initializing app:", error);
                setPlaceholderData();
            }
        };

        initializeApp();
    }, []);

    useEffect(() => {
        if (phase === 'voting' && config?.countdown) {
            setTimeRemaining(config.countdown * 1000);
            const interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev === null || prev <= 1000) {
                        setPhase('results');
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [phase, config]);

    const handleReset = async () => {
        try {
            await clearSheetData('Config!A:C');
            await clearSheetData('Votes!A:C');
            window.location.reload();
        } catch (error) {
            console.error("Failed to reset application state in Google Sheets.", error);
            alert("Error resetting application. Please try again.");
        }
    };

    const renderPhase = () => {
        switch (phase) {
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
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Live Website Voting
                    </h1>
                    <p className="text-gray-400 mt-3 text-lg">Vote for your favorite project!</p>
                </header>
                <main className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-10">
                    {renderPhase()}
                </main>
                <footer className="text-center mt-12">
                    <button onClick={handleReset} className="text-gray-600 hover:text-red-400 transition-colors duration-300 text-sm font-medium">
                        Reset Application
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default App;
