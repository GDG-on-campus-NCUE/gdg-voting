
import React, { useState, useEffect, useMemo } from 'react';
import { VotingConfig, VoteCounts } from '../types';

interface ResultsProps {
    config: VotingConfig;
    votes: VoteCounts;
    onReset: () => void;
}

const Results: React.FC<ResultsProps> = ({ config, votes, onReset }) => {
    const [revealedRank, setRevealedRank] = useState<number>(0); // 0: none, 1: 3rd, 2: 2nd, 3: 1st

    const sortedSites = useMemo(() => {
        return config.sites
            .map(site => ({ ...site, voteCount: votes[site.id] || 0 }))
            .sort((a, b) => b.voteCount - a.voteCount);
    }, [config.sites, votes]);

    const maxVotes = useMemo(() => {
        return Math.max(...sortedSites.map(s => s.voteCount), 1);
    }, [sortedSites]);


    useEffect(() => {
        if (revealedRank < 3) {
            const timer = setTimeout(() => {
                setRevealedRank(prev => prev + 1);
            }, 2000); // Reveal next rank every 2 seconds
            return () => clearTimeout(timer);
        }
    }, [revealedRank]);

    const PodiumCard = ({ rank }: { rank: number }) => {
        const site = sortedSites[rank - 1];
        if (!site) return null;

        const rankInfo = {
            1: {
                trophy: '🏆',
                text: '1st Place',
                bg: 'bg-yellow-400',
                text_color: 'text-yellow-900',
                height: 'h-64',
                order: 'order-1 md:order-2'
            },
            2: {
                trophy: '🥈',
                text: '2nd Place',
                bg: 'bg-gray-300',
                text_color: 'text-gray-800',
                height: 'h-56',
                order: 'order-2 md:order-1'
            },
            3: {
                trophy: '🥉',
                text: '3rd Place',
                bg: 'bg-yellow-600',
                text_color: 'text-white',
                height: 'h-48',
                order: 'order-3 md:order-3'
            }
        }[rank];

        const isRevealed = revealedRank >= (4 - rank);

        return (
            <div className={`
                flex flex-col items-center justify-end p-6 rounded-t-xl
                transition-all duration-700 ease-in-out transform ${rankInfo.bg} ${rankInfo.order} ${rankInfo.height}
                ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}>
                <span className="text-6xl mb-3">{rankInfo.trophy}</span>
                <h3 className={`text-3xl font-bold ${rankInfo.text_color}`}>{rankInfo.text}</h3>
                <p className={`text-xl font-semibold mt-2 ${rankInfo.text_color}`}>{site.name}</p>
                <p className={`text-lg font-medium ${rankInfo.text_color}`}>{site.voteCount} votes</p>
                <a href={site.url} target="_blank" rel="noopener noreferrer" className={`mt-3 text-sm underline opacity-80 hover:opacity-100 ${rankInfo.text_color}`}>
                    Visit Site ↗
                </a>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-400">
                Voting has ended!
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
                {revealedRank < 3 ? 'Revealing the winners...' : 'Here are the final results!'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <PodiumCard rank={2} />
                <PodiumCard rank={1} />
                <PodiumCard rank={3} />
            </div>

            {revealedRank >= 3 && (
                 <div className="mt-16 animate-fade-in">
                     <h3 className="text-3xl font-bold mb-6">Full Results</h3>
                     <div className="bg-gray-700 p-6 rounded-xl text-left max-w-2xl mx-auto space-y-4">
                         {sortedSites.map((site, index) => (
                             <div key={site.id} className="w-full">
                                <div className="flex justify-between items-center mb-1 text-white">
                                    <span className="font-semibold">{index + 1}. {site.name}</span>
                                    <span className="font-mono text-sm">{site.voteCount} votes</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-4">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(site.voteCount / maxVotes) * 100}%` }}
                                    ></div>
                                </div>
                             </div>
                         ))}
                     </div>
                 </div>
             )}
             
             {revealedRank >= 3 && (
                <div className="mt-12 animate-fade-in">
                    <button
                        onClick={onReset}
                        className="px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-transform transform hover:scale-105"
                    >
                        Start New Voting Session
                    </button>
                </div>
             )}
        </div>
    );
};

export default Results;
