import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TeamList from "@/components/auction/TeamList";
import PlayerCard from "@/components/auction/PlayerCard";
import LiveFeed from "@/components/auction/LiveFeed";
import RecentlySold from "@/components/auction/RecentlySold";
import { AuctionProvider } from "@/components/auction/AuctionProvider";

export default function Home() {
  return (
    <AuctionProvider>
      <Header />
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <TeamList />
        <PlayerCard />
        <LiveFeed />
        <RecentlySold />
      </main>
      <Footer />
    </AuctionProvider>
  );
}
