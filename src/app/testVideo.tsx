'use client';

// import { Button } from "@/components/ui/button";
import genVideo from "./api/ai/video/videoGenerator";

export default function TestVideo() {
    return (
        <div className="bg-red-600">
            <button className="bg-black text-white hover:bg-gray-800" onClick={() => genVideo("Peter", "Peter")}>
                Click me
            </button>
        </div>
    );
}