import React from 'react';

const ChatLayout = ({ children, sidebar }) => {
    return (
        <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
            {/* Sidebar - Hidden on mobile by default, can be toggled */}
            <aside className="hidden md:flex w-80 flex-col border-r border-border bg-muted/30">
                {sidebar}
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {children}
            </main>
        </div>
    );
};

export default ChatLayout;
