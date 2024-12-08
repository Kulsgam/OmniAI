'use client';

import { Button } from "@/components/ui/button";
import gen from "./api/ai/video/videoGenerator";

export default function Home() {
  return (
    <div className="bg-red-600">
      <Button className="bg-black text-white hover:bg-gray-800" onClick={() => gen("Peter", "Peter")}>
        Click me
      </Button>
    </div>
  );
}
