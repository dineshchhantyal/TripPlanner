import Locations from "@/components/Locations/Locations";
import SearchBar from "@/components/SearchBar/SearchBar";
import { redirect, usePathname } from "next/navigation";

export default function Home() {
  redirect("/test");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 relative">
      {/* search bar */}
      <SearchBar className="absolute left-6 top-8" />
      {/* directions */}
      <Locations />
    </main>
  );
}
