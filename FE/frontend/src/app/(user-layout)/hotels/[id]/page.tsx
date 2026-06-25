"use client";

import HotelDetailPage from "../../hotel/[id]/page";

export default function HotelsDetailRedirectPage({ params }: any) {
  return <HotelDetailPage params={params} />;
}
