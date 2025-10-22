import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import useLocalStorage from '../hooks/useLocalStorage';
import { AuthUser, SymptomEntry } from '../types';
import { ChartBarIcon, LightbulbIcon } from '../constants';
import * as geminiService from '../services/geminiService';
import Loader from './Loader';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DashboardProps {
    user: AuthUser;
}

// Helper to safely format a date string into 'YYYY-MM-DD' format.
const formatDate = (dateString: string): string | null => {
    try {
        const date = new Date(dateString);
        // An invalid date string will result in a Date object whose time is NaN.
        if (isNaN(date.getTime())) {
            return null;
        }
        return date.toISOString().split('T')[0];
    } catch (e) {
        // This catch is for unexpected errors, though new Date() rarely throws.
        console.error('Error parsing date string:', dateString, e);
        return null;
    }
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const userKey = user.username;
    const [symptoms] = useLocalStorage<SymptomEntry[]>(`gnmNotebookData_${userKey}`, []);
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);

    // This data processing logic is rewritten to be exceptionally robust and crash-proof.
    // It aggressively validates and sanitizes all data before passing it to the chart.
    const chartData = React.useMemo(() => {
        try {
            // Step 1: Initial validation of the raw data from local storage.
            if (!Array.isArray(symptoms)) {
                console.error("Dashboard Error: 'symptoms' is not an array.", symptoms);
                return null;
            }

            // Step 2: Create a new, clean array of entries, validating every property of every item.
            const sanitizedEntries: { name: string; date: string; rating: number }[] = [];
            for (const symptom of symptoms) {
                const isSymptomValid = symptom &&
                    typeof symptom.name === 'string' &&
                    symptom.name.trim().length > 0 &&
                    typeof symptom.updatedAt === 'string' &&
                    typeof symptom.currentRating === 'number' &&
                    isFinite(symptom.currentRating);

                if (!isSymptomValid) {
                    console.warn("Skipping invalid symptom object:", symptom);
                    continue;
                }

                const formattedDate = formatDate(symptom.updatedAt);
                if (formattedDate) {
                    sanitizedEntries.push({
                        name: symptom.name.trim(),
                        date: formattedDate,
                        rating: symptom.currentRating,
                    });
                } else {
                    console.warn("Skipping symptom with invalid date:", symptom);
                }
            }
            
            // Step 3: If no valid data remains after sanitization, exit.
            if (sanitizedEntries.length === 0) {
                return null;
            }
            
            // Step 4: Create the master list of labels (dates).
            const labels = [...new Set(sanitizedEntries.map(entry => entry.date))].sort();

            // Step 5: Group data by symptom name.
            const dataByName = new Map<string, Map<string, number>>();
            for (const entry of sanitizedEntries) {
                if (!dataByName.has(entry.name)) {
                    dataByName.set(entry.name, new Map());
                }
                dataByName.get(entry.name)!.set(entry.date, entry.rating);
            }

            // Step 6: Build the final datasets for Chart.js.
            const datasets = Array.from(dataByName.entries()).map(([name, dateMap], index) => {
                const dataPoints = labels.map(label => dateMap.get(label) ?? null);
                const hue = (index * 137.508) % 360; // Use golden angle for distinct colors.
                return {
                    label: name,
                    data: dataPoints,
                    spanGaps: true,
                    borderColor: `hsl(${hue}, 70%, 50%)`,
                    backgroundColor: `hsla(${hue}, 70%, 50%, 0.5)`,
                    tension: 0.1,
                };
            });

            return {
                labels: labels,
                datasets: datasets,
            };

        } catch (error) {
            // This is the ultimate fallback. If anything inside this block throws,
            // we log it and prevent the component from crashing.
            console.error("A critical, unexpected error occurred in the Dashboard chart data processing. The chart will not be displayed.", error);
            return null;
        }
    }, [symptoms]);
    
    useEffect(() => {
        const generateInsight = async () => {
            if (Array.isArray(symptoms) && symptoms.length > 2) {
                setIsLoadingInsight(true);
                try {
                    const analysis = await geminiService.analyzeDashboardData(symptoms);
                    setInsight(analysis);
                } catch (error) {
                    console.error("Failed to generate dashboard insight:", error);
                } finally {
                    setIsLoadingInsight(false);
                }
            } else {
                setInsight(null);
            }
        };
        generateInsight();
    }, [symptoms]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#cbd5e1', // slate-300
                },
            },
            title: {
                display: true,
                text: 'Symptom Severity Over Time',
                color: '#c9a445',
                font: { size: 18 },
            },
        },
        scales: {
            x: {
                ticks: { color: '#94a3b8' }, // slate-400
                grid: { color: '#334155' }, // slate-700
            },
            y: {
                ticks: { color: '#94a3b8' },
                grid: { color: '#334155' },
                beginAtZero: true,
                max: 10,
            },
        },
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                <ChartBarIcon />
                <h1 className="text-3xl font-brand text-[#c9a445]">Progress Dashboard</h1>
            </header>
            
            {!chartData ? (
                <div className="text-center py-20 bg-slate-800/50 rounded-lg">
                    <h2 className="text-2xl font-semibold text-slate-300">No Data to Display</h2>
                    <p className="mt-2 text-slate-400">Add entries to your Notebook to see your progress here. If you are seeing this unexpectedly, there may be an error in your saved data.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <section className="bg-slate-800/80 rounded-lg p-4 md:p-6 border border-slate-700 shadow-lg">
                        <div className="relative h-96">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    </section>

                    <section className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 shadow-lg">
                        <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2 font-brand tracking-wider">
                            <LightbulbIcon />
                            AI-Powered Insight
                        </h3>
                        {isLoadingInsight && <Loader text="Analyzing your progress..." />}
                        {insight && !isLoadingInsight && (
                             <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap font-sans" dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br />') }}/>
                        )}
                        {!insight && !isLoadingInsight && Array.isArray(symptoms) && symptoms.length > 2 && (
                            <p className="text-slate-400">Generating insight...</p>
                        )}
                        {!insight && !isLoadingInsight && (!Array.isArray(symptoms) || symptoms.length <= 2) && (
                            <p className="text-slate-400">Add more symptom entries to generate an AI analysis of your progress.</p>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default Dashboard;