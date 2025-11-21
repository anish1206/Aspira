import React from 'react';

const ChatLayout = ({ children, sidebar }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative z-50 h-full w-80 flex-col border-r border-border bg-muted/30 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                top-0 left-0 bg-background md:bg-muted/30
            `}>
                <div className="md:hidden p-4 flex justify-end">
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
                {sidebar}
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative w-full">
                {/* Mobile Sidebar Toggle */}
                <button
                    className="md:hidden absolute top-4 left-4 z-30 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /></svg>
                </button>
                {children}
            </main>
        </div>
    );
};

export default ChatLayout;
