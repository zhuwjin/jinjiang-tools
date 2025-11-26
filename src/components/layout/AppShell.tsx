import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '280px',
                padding: '2rem',
                backgroundColor: 'var(--background)'
            }}>
                {children}
            </main>
        </div>
    );
}
