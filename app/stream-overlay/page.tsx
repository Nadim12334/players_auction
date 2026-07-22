import React from "react";
import { AuctionProvider } from "@/components/auction/AuctionProvider";
import StreamOverlay from "@/components/auction/StreamOverlay";

export const metadata = {
  title: "Live Stream Overlay | Titan League Auction",
  description: "Dedicated OBS Studio broadcast overlay for YouTube Live auction streaming",
};

export default function StreamOverlayPage() {
  return (
    <AuctionProvider>
      <StreamOverlay />
    </AuctionProvider>
  );
}
