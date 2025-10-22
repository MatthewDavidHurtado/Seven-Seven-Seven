import { useState, useCallback } from 'react';
import { AuthUser } from '../types';

const AUTH_KEY = 'gnmAuthUser';
const USERS_KEY = 'gnmUsers';

const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const item = window.localStorage.getItem(AUTH_KEY);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            return null;
        }
    });

    const login = useCallback((username: string) => {
        const userData: AuthUser = { username };
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        window.localStorage.removeItem(AUTH_KEY);
        setUser(null);
    }, []);

    const deleteUserAccount = useCallback(() => {
        if (!user) return;
        
        const userKey = user.username;
        
        // Remove all personal data associated with the user
        window.localStorage.removeItem(`gnmTimelineData_${userKey}`);
        window.localStorage.removeItem(`gnmAiAnalysis_${userKey}`);
        window.localStorage.removeItem(`gnmReportData_${userKey}`);
        window.localStorage.removeItem(`gnmConversation_${userKey}`);
        window.localStorage.removeItem(`gnmMentorConversation_${userKey}`);
        window.localStorage.removeItem(`gnmMentorConfig_${userKey}`);
        window.localStorage.removeItem(`gnmNotebookData_${userKey}`);
        window.localStorage.removeItem(`gnmSelfAwarenessProtocol_${userKey}`);

        // Instead of deleting the user record, mark it to preserve the trial start date
        const usersJSON = window.localStorage.getItem(USERS_KEY);
        if (usersJSON) {
            const users = JSON.parse(usersJSON);
            if (users[userKey]) {
                // Preserve the trial start date to prevent reset, but remove credentials
                // and mark the account as deleted.
                users[userKey] = {
                    trialStartDate: users[userKey].trialStartDate, 
                    status: 'deleted' 
                };
                window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
            }
        }

        // Finally, log out
        logout();

    }, [user, logout]);


    return {
        isAuthenticated: !!user,
        user,
        login,
        logout,
        deleteUserAccount
    };
};

export default useAuth;