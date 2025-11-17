
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

    useEffect(() => {
        if (revealedRank < 3) {
            const timer = setTimeout(() => {
                setRevealedRank(prev => prev + 1);
            }, 3000); // Reveal next rank every 3 seconds
            return () => clearTimeout(timer);
        }
    }, [revealedRank]);

    const renderPodium = (rank: number) => {
        const site = sortedSites[rank - 1];
        const rankInfo = {
            1: { color: 'gold', text: '1st Place', trophy: '🏆' },
            2: { color: 'silver', text: '2nd Place', trophy: '🥈' },
            3: { color: '#cd7f32', text: '3rd Place', trophy: '🥉' }
        }[rank];
        
        if (!site) return null;

        return (
            <div className={`
                flex flex-col items-center justify-center p-6 rounded-lg shadow-lg
                transition-all duration-700 ease-in-out transform
                ${revealedRank >= (4 - rank) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
                ${rank === 1 ? 'md:col-span-3 order-1' : 'md:col-span-1'}
                ${rank === 2 ? 'order-2' : ''}
                ${rank === 3 ? 'order-3' : ''}
            `} style={{ backgroundColor: rankInfo?.color, color: rank === 3 ? 'white': 'black' }}>
                <span className="text-5xl mb-2">{rankInfo?.trophy}</span>
                <h3 className="text-2xl font-bold">{rankInfo?.text}</h3>
                <p className="text-xl font-semibold mt-4">{site.name}</p>
                <p className="text-lg">with {site.voteCount} votes</p>
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm underline opacity-80 hover:opacity-100">
                    Visit Site
                </a>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Voting has ended!</h2>
            <p className="text-gray-400 mb-8">Revealing the winners...</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Placeholders to ensure order */}
                <div className="order-3 md:order-none">{renderPodium(3)}</div>
                <div className="order-1 md:order-none">{renderPodium(1)}</div>
                <div className="order-2 md:order-none">{renderPodium(2)}</div>
            </div>

            {revealedRank >= 3 && (
                 <div className="mt-12">
                     <h3 className="text-xl font-semibold mb-4">Full Results</h3>
                     <ul className="bg-gray-800 p-6 rounded-lg text-left max-w-md mx-auto">
                         {sortedSites.map((site, index) => (
                             <li key={site.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                                 <span>{index + 1}. {site.name}</span>
                                 <span className="font-bold">{site.voteCount} votes</span>
                             </li>
                         ))}
                     </ul>
                 </div>
             )}
             
             {revealedRank >= 3 && (
                <div className="mt-12">
                    <button
                        onClick={onReset}
                        className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                        Start New Voting Session
                    </button>
                </div>
             )}
        </div>
    );
};

export default Results;
