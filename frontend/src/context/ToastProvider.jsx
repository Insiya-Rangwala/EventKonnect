import React, { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeContext } from './ThemeContext';

export const ToastProvider = ({ children }) => {
    const { theme } = useContext(ThemeContext);

    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: theme === 'dark' ? 'var(--card)' : '#fff',
                        color: theme === 'dark' ? '#F1F5F9' : '#1E293B',
                        border: theme === 'dark' ? '1px solid var(--border)' : '1px solid #E2E8F0',
                        boxShadow: 'var(--shadow-md)',
                        borderRadius: '12px',
                        padding: '16px',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--success)',
                            secondary: theme === 'dark' ? 'var(--card)' : '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: 'var(--error)',
                            secondary: theme === 'dark' ? 'var(--card)' : '#fff',
                        },
                    },
                }}
            />
            {children}
        </>
    );
};
