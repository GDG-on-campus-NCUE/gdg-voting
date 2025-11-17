
import React, { useState, useEffect } from 'react';
import { VotingConfig, VoteCounts, Voter, GroupVotes, Site } from '../types';
import GoogleIcon from './icons/GoogleIcon';
import { signIn, appendSheetData, getSheetData } from '../googleSheetsService';

interface VotingProps {
    config: VotingConfig;
    votes: VoteCounts;
    setVotes: React.Dispatch<React.SetStateAction<VoteCounts>>;
    voters: Voter[];
    setVoters: React.Dispatch<React.SetStateAction<Voter[]>>;
    groupVotes: GroupVotes;
    setGroupVotes: React.Dispatch<React.SetStateAction<GroupVotes>>;
    timeRemaining: number | null;
}

const Voting: React.FC<VotingProps> = ({ config, votes, setVotes, voters, setVoters, groupVotes, setGroupVotes, timeRemaining }) => {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userGroup, setUserGroup] = useState<string>('');
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [viewMode, setViewMode] = useState<'iframe' | 'link'>('iframe');
    const [error, setError] = useState<string>('');

    const hasVoted = userEmail ? voters.some(v => v.email === userEmail) : false;

    const handleLogin = async () => {
        try {
            await signIn();
            const authInstance = gapi.auth2.getAuthInstance();
            const user = authInstance.currentUser.get();
            const profile = user.getBasicProfile();
            if (profile) {
                setUserEmail(profile.getEmail());
            }
        } catch (error) {
            console.error("Error signing in: ", error);
            setError("Failed to sign in with Google. Please try again.");
        }
    };
    
    const handleVote = async () => {
        setError('');
        if (!userEmail || !userGroup || !selectedSite) {
            setError("Please log in, enter your group, and select a site to vote.");
            return;
        }

        const groupNumber = parseInt(userGroup, 10);
        if (isNaN(groupNumber) || groupNumber <= 0) {
            setError("Please enter a valid group number.");
            return;
        }

        try {
            const votesData = await getSheetData('Votes!A:C');
            const voters = votesData ? votesData.map(row => ({ email: row[0], group: row[1], votedFor: row[2] })) : [];

            const hasVoted = voters.some(v => v.email === userEmail);
            if (hasVoted) {
                setError("You have already voted.");
                return;
            }

            const groupVotes = voters.filter(v => v.group === userGroup).length;
            if (groupVotes >= 3) {
                setError(`Sorry, group ${userGroup} has already reached the maximum of 3 votes.`);
                return;
            }

            // All checks passed, record the vote
            const newVote = [[userEmail, userGroup, selectedSite.id]];
            await appendSheetData('Votes!A:C', newVote);

            // Update local state to reflect the new vote
            setVotes(prev => ({ ...prev, [selectedSite.id]: (prev[selectedSite.id] || 0) + 1 }));
            setVoters(prev => [...prev, { email: userEmail, votedFor: selectedSite.id }]);
            setGroupVotes(prev => ({ ...prev, [groupNumber]: (prev[groupNumber] || 0) + 1 }));

            alert(`Thank you for your vote, ${userEmail}!`);
        } catch (error) {
            setError('Failed to cast your vote. Please try again.');
            console.error(error);
        }
    };

    const formatTime = (ms: number | null) => {
        if (ms === null || ms < 0) return "00:00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    if (!userEmail) {
        return (
            <div className="text-center py-10">
                <h2 className="text-3xl font-bold mb-4">Welcome, Voter!</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">To ensure a fair voting process, please sign in with your Google account to participate.</p>
                <button
                    onClick={handleLogin}
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-transform transform hover:scale-105"
                >
                    <GoogleIcon />
                    <span className="ml-3">Sign in with Google</span>
                </button>
            </div>
        );
    }
    
    if (hasVoted) {
        return (
            <div className="text-center p-12 bg-gray-700 rounded-xl">
                <h2 className="text-3xl font-bold text-green-400 mb-4">Thank You for Voting!</h2>
                <p className="text-gray-300 text-lg">Your vote has been successfully recorded. Results will be revealed after the voting period ends.</p>
                <div className="mt-8 text-xl">
                    Time Remaining:
                    <span className="font-mono bg-gray-800 px-4 py-2 rounded-lg ml-3 tracking-widest">{formatTime(timeRemaining)}</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-10 p-6 bg-gray-700 rounded-xl shadow-lg">
                <p className="text-lg text-gray-300">Welcome, <span className="font-bold text-indigo-400">{userEmail}</span>!</p>
                <div className="mt-4 text-2xl">
                    Time Remaining:
                    <span className="font-mono bg-gray-800 px-4 py-2 rounded-lg ml-3 tracking-widest">{formatTime(timeRemaining)}</span>
                </div>
            </div>
        
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left side: Voting controls and site list */}
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-semibold mb-5 border-b border-gray-600 pb-3">Your Vote</h3>
                        <div>
                            <label htmlFor="group-number" className="block text-sm font-medium text-gray-300 mb-2">What is your group number?</label>
                            <input
                                type="number"
                                id="group-number"
                                value={userGroup}
                                onChange={e => setUserGroup(e.target.value)}
                                className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., 5"
                                required
                            />
                        </div>
                        <div className="mt-6">
                            <p className="text-sm text-gray-400">Selected site:</p>
                            <p className="text-xl font-bold text-indigo-300 truncate">{selectedSite?.name || 'None'}</p>
                        </div>
                        
                         {error && <p className="text-red-400 text-sm mt-4 p-3 bg-red-900/50 rounded-lg">{error}</p>}

                        <button
                            onClick={handleVote}
                            disabled={!userGroup || !selectedSite || (timeRemaining !== null && timeRemaining <= 0)}
                            className="mt-8 w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 transition-all transform hover:scale-105"
                        >
                            {timeRemaining !== null && timeRemaining <= 0 ? 'Voting Closed' : 'Cast Your Vote'}
                        </button>
                    </div>

                    <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-semibold mb-5 border-b border-gray-600 pb-3">Projects</h3>
                        <ul className="space-y-3 max-h-96 overflow-y-auto">
                           {config.sites.map(site => (
                               <li key={site.id}>
                                   <button 
                                       onClick={() => setSelectedSite(site)}
                                       className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${selectedSite?.id === site.id ? 'bg-indigo-600 text-white shadow-lg transform -translate-x-2' : 'bg-gray-800 hover:bg-gray-600'}`}
                                   >
                                       {site.name}
                                   </button>
                               </li>
                           ))}
                        </ul>
                    </div>
                </div>

                {/* Right side: Site viewer */}
                <div className="md:col-span-2">
                    <div className="bg-gray-700 p-6 rounded-xl shadow-lg h-full">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-2xl font-semibold truncate">{selectedSite?.name || 'Select a site to view'}</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-400">View as:</span>
                                <button onClick={() => setViewMode('iframe')} className={`px-4 py-2 text-sm rounded-lg font-semibold ${viewMode === 'iframe' ? 'bg-indigo-600 text-white' : 'bg-gray-600'}`}>Iframe</button>
                                <button onClick={() => setViewMode('link')} className={`px-4 py-2 text-sm rounded-lg font-semibold ${viewMode === 'link' ? 'bg-indigo-600 text-white' : 'bg-gray-600'}`}>Link</button>
                            </div>
                        </div>

                        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                            {!selectedSite ? (
                                <div className="text-center text-gray-500">
                                    <p className="text-2xl">🖥️</p>
                                    <p className="mt-2">No site selected</p>
                                </div>
                            ) : viewMode === 'iframe' ? (
                                <iframe
                                    src={selectedSite.url}
                                    title={selectedSite.name}
                                    className="w-full h-full border-0 rounded-lg"
                                    sandbox="allow-scripts allow-same-origin"
                                ></iframe>
                            ) : (
                                 <div className="text-center p-8">
                                    <a 
                                        href={selectedSite.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:text-indigo-300 text-xl underline transition-colors"
                                    >
                                        Open {selectedSite.name} in a new tab ↗
                                    </a>
                                 </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Voting;
