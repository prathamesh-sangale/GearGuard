import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('gear_guard_user');
        return saved ? JSON.parse(saved) : {
            id: 1,
            name: 'Nikunj (Super Admin)',
            role: 'SUPER_ADMIN',
            team_id: null
        };
    });

    useEffect(() => {
        localStorage.setItem('gear_guard_user', JSON.stringify(user));
    }, [user]);

    const logout = () => {
        localStorage.removeItem('gear_guard_user');
        // Reset to default super admin for demo
        setUser({
            id: 1,
            name: 'Nikunj (Super Admin)',
            role: 'SUPER_ADMIN',
            team_id: null
        });
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};
