import { useState, useEffect } from 'react';
import { AuthUser } from '../types';

const TRIAL_DURATION_DAYS = 90;

export interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export const useTrial = (user: AuthUser | null) => {
    const [isTrialActive, setIsTrialActive] = useState(true);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

    useEffect(() => {
        if (!user) {
            return;
        }

        let intervalId: number;

        try {
            const usersJSON = window.localStorage.getItem('gnmUsers');
            if (!usersJSON) {
                setIsTrialActive(false); 
                return;
            }

            const users = JSON.parse(usersJSON);
            const userData = users[user.username];

            if (!userData || !userData.trialStartDate) {
                setIsTrialActive(false);
                return;
            }

            const startDate = new Date(userData.trialStartDate);
            if (isNaN(startDate.getTime())) {
                console.error("Invalid trial start date found for user:", user.username);
                setIsTrialActive(false);
                return;
            }

            const trialEndDate = new Date(startDate);
            trialEndDate.setDate(startDate.getDate() + TRIAL_DURATION_DAYS);
            setEndDate(trialEndDate);

            intervalId = window.setInterval(() => {
                const now = new Date();
                const difference = trialEndDate.getTime() - now.getTime();

                if (difference <= 0) {
                    setIsTrialActive(false);
                    setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                    clearInterval(intervalId);
                } else {
                    setIsTrialActive(true);
                    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                    setTimeRemaining({ days, hours, minutes, seconds });
                }
            }, 1000);

        } catch (error) {
            console.error("Error processing trial data:", error);
            setIsTrialActive(false);
        }

        // Cleanup function
        return () => clearInterval(intervalId);

    }, [user]);

    return { isTrialActive, timeRemaining, endDate };
};