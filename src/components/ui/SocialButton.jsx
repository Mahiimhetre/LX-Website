import React from 'react';

export const SocialButton = ({ onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-white/5 hover:bg-secondary/40 hover:border-white/10 hover:shadow-lg transition-all duration-300 group"
    >
        <span className="text-muted-foreground group-hover:text-foreground transition-colors group-hover:scale-110 duration-300">
            {icon}
        </span>
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {label}
        </span>
    </button>
);

export default SocialButton;
