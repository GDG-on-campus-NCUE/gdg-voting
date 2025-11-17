
import React, { useState } from 'react';
import { Site, VotingConfig } from '../types';

interface SetupProps {
    onSetupComplete: (config: VotingConfig) => void;
}

const Setup: React.FC<SetupProps> = ({ onSetupComplete }) => {
    const [siteCount, setSiteCount] = useState<number>(2);
    const [sites, setSites] = useState<Partial<Site>[]>([{ id: 'site-1' }, { id: 'site-2' }]);
    const [endTime, setEndTime] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSiteCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(e.target.value, 10);
        if (count > 0 && count <= 20) {
            setSiteCount(count);
            const newSites = Array.from({ length: count }, (_, i) => ({
                ...(sites[i] || {}),
                id: `site-${i + 1}`,
            }));
            setSites(newSites);
        }
    };

    const handleSiteChange = (index: number, field: 'name' | 'url', value: string) => {
        const newSites = [...sites];
        newSites[index] = { ...newSites[index], [field]: value };
        setSites(newSites);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!endTime) {
            setError('Please set an end time for voting.');
            return;
        }
        
        const now = new Date();
        const endDate = new Date(endTime);
        if (endDate <= now) {
            setError('End time must be in the future.');
            return;
        }

        const finalSites: Site[] = [];
        for (const site of sites) {
            if (!site.name || !site.url) {
                setError('Please fill in all site names and URLs.');
                return;
            }
             try {
                new URL(site.url);
            } catch (_) {
                setError(`Invalid URL format for "${site.name}". Please include http:// or https://`);
                return;
            }
            finalSites.push(site as Site);
        }

        onSetupComplete({ sites: finalSites, endTime });
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Admin Setup</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="site-count" className="block text-sm font-medium text-gray-300">
                        Number of Sites to Vote On
                    </label>
                    <input
                        type="number"
                        id="site-count"
                        value={siteCount}
                        onChange={handleSiteCountChange}
                        min="1"
                        max="20"
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        required
                    />
                </div>

                <div className="space-y-4">
                    {sites.map((site, index) => (
                        <div key={site.id} className="p-4 border border-gray-700 rounded-md">
                            <h3 className="font-semibold text-lg mb-2">Site {index + 1}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor={`site-name-${index}`} className="block text-sm font-medium text-gray-300">Site Name</label>
                                    <input
                                        type="text"
                                        id={`site-name-${index}`}
                                        value={site.name || ''}
                                        onChange={(e) => handleSiteChange(index, 'name', e.target.value)}
                                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        placeholder={`e.g., Project Phoenix`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`site-url-${index}`} className="block text-sm font-medium text-gray-300">Site URL</label>
                                    <input
                                        type="url"
                                        id={`site-url-${index}`}
                                        value={site.url || ''}
                                        onChange={(e) => handleSiteChange(index, 'url', e.target.value)}
                                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="https://example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <label htmlFor="end-time" className="block text-sm font-medium text-gray-300">
                        Voting End Time
                    </label>
                    <input
                        type="datetime-local"
                        id="end-time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        required
                    />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800"
                >
                    Start Voting Session
                </button>
            </form>
        </div>
    );
};

export default Setup;
