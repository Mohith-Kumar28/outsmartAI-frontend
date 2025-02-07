"use client"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import { AuroraBackground } from "./ui/aurora-background";
import { shortenUrl } from "@/app/actions/url";
import { useEffect, useState } from "react";
import { UrlInput } from "./url-input";
import { ShortenedUrl } from "./shortened-url";

interface RecentUrl {
    originalUrl: string;
    shortUrl: string;
    timestamp: number;
}

export default function Home() {
    const [shortenedUrl, setShortenedUrl] = useState<string>("");
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [recentUrls, setRecentUrls] = useState<RecentUrl[]>([]);

    // Add useEffect to handle client-side mounting and load recent URLs
    useEffect(() => {
        setIsMounted(true);
        const storedUrls = localStorage.getItem('recentUrls');
        if (storedUrls) {
            setRecentUrls(JSON.parse(storedUrls));
        }
    }, []);

    // Return null or a loading state until client-side code is ready
    if (!isMounted) {
        return null;
    }

    return (
        <>
            <div className="w-full mx-auto h-screen overflow-y-auto bg-black text-[#f0d8b9]">
                <AuroraBackground>
                    <motion.div
                        initial={{ opacity: 0.0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.3,
                            duration: 0.8,
                            ease: "easeInOut",
                        }}
                        className="relative flex flex-col gap-4 items-center justify-center px-4 py-8 md:py-12"
                    >
                        <h2 className="text-[#f0d8b9] text-3xl md:text-6xl font-playfair text-center pt-6 max-w-4xl">
                            <span className="relative">
                                OutsmartAI
                                <svg
                                    viewBox="0 0 286 73"
                                    fill="none"
                                    className="absolute -left-2 -right-2 -top-2 bottom-0 translate-y-1"
                                >
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        transition={{
                                            duration: 1.25,
                                            ease: "easeInOut",
                                        }}
                                        d="M142.293 1C106.854 16.8908 6.08202 7.17705 1.23654 43.3756C-2.10604 68.3466 29.5633 73.2652 122.688 71.7518C215.814 70.2384 316.298 70.689 275.761 38.0785C230.14 1.37835 97.0503 24.4575 52.9384 1"
                                        stroke="#FACC15"
                                        strokeWidth="3"
                                    />
                                </svg>
                            </span>{" "}
                        </h2>

                        <div className="w-full mx-auto p-2">
                            <div className="bg-[#353535]/60 backdrop-blur-md px-4 md:px-6 py-6 text-[#f0d8b9] rounded-xl">
                                <div className=" space-y-10 w-[80vw] md:w-auto md:max-w-2xl">
                                    <UrlInput 
                                        shortenedUrl={shortenedUrl} 
                                        setShortenedUrl={setShortenedUrl} 
                                    />
                                    {shortenedUrl ? (
                                        <div className="space-y-6">
                                            <ShortenedUrl url={shortenedUrl} originalUrl={recentUrls[0]?.originalUrl} />
                                        </div>
                                    ) : (
                                        <div className="space-y-4 mt-6">
                                            <p className="text-[#f0dcc3] text-sm md:text-xl max-w-xl text-left font-sourceSan">
                                                Transform your links into app-specific shortcuts.
                                                Share content that opens directly in native apps.
                                                Experience seamless navigation across platforms.
                                            </p>
                                            <TextGenerateEffect className="font-playfair" words="The future of smart linking is here" />
                                        </div>
                                    )}
                                    {recentUrls.length > 0 && (
                                        <div className="mt-8 border-t border-white/10 pt-6">
                                            <h3 className="text-lg font-semibold mb-4">Recent URLs</h3>
                                            <div className="space-y-3">
                                                {recentUrls.map((item, index) => (
                                                    <a
                                                        key={index}
                                                        href={item.shortUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                                    >
                                                        <p className="text-sm font-medium truncate">{item.shortUrl}</p>
                                                        <p className="text-xs text-white/60 truncate">{item.originalUrl}</p>
                                                    </a>
                                                ))}                                                
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AuroraBackground>
            </div>
        </>
    );
}
