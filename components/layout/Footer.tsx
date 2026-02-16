import React from "react";

const Footer = () => {
    return (
        <footer className="mt-8 border-t border-slate-800/50 py-6">
            <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center text-xs text-slate-600">
                <p>© 2025 Titan League Auction Systems.</p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-slate-400">
                        Privacy
                    </a>
                    <a href="#" className="hover:text-slate-400">
                        Rules
                    </a>
                    <a href="#" className="hover:text-slate-400">
                        Support
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
