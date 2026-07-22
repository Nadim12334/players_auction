import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TeamList from "@/components/auction/TeamList";
import PlayerCard from "@/components/auction/PlayerCard";
import RecentlySold from "@/components/auction/RecentlySold";
import LiveFeed from "@/components/auction/LiveFeed";
import { AuctionProvider } from "@/components/auction/AuctionProvider";

export default function Home() {
  return (
    <AuctionProvider>
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col font-sans selection:bg-cyan-500/30">
        <Header />

        <main className="flex-1 max-w-[1700px] mx-auto w-full p-4 md:p-8 flex flex-col gap-8">

          {/* Top Row: Player Card (left) + Franchise Standings (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left: Live Player Card */}
            <div className="lg:col-span-5">
              <PlayerCard />
            </div>

            {/* Right: Franchise Standings — vertically scrollable */}
            <div className="lg:col-span-7">
              <TeamList />
            </div>

          </div>

          {/* Bottom Row: Recently Sold + Live Bid History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-900 pt-8">

            <div className="lg:col-span-6">
              <RecentlySold />
            </div>

            <div className="lg:col-span-6">
              <LiveFeed />
            </div>

          </div>

        </main>

        <Footer />
      </div>
    </AuctionProvider>
  );
}
