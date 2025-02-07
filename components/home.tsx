"use client"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import { AuroraBackground } from "./ui/aurora-background";
import { shortenUrl } from "@/app/actions/url";
import { useState } from "react";
import { UrlInput } from "./url-input";

export default function Home() {
    const [shortenedUrl, setShortenedUrl] = useState<string>("");

    return (
        <>
            <div className="w-full mx-auto h-screen overflow-scroll bg-black text-[#f0d8b9]">
                <AuroraBackground>
                    <motion.div
                        initial={{ opacity: 0.0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.3,
                            duration: 0.8,
                            ease: "easeInOut",
                        }}
                        className="relative flex flex-col gap-4 items-center justify-center px-4"
                    >
                        <h2 className="text-[#f0d8b9] text-3xl md:text-6xl font-playfair text-center pt-6">
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

                        <div className="p-2">
                            <div className="bg-[#353535]/60 backdrop-blur-md px-6 py-6 text-[#f0d8b9] rounded-xl">
                                <div className="w-full max-w-xl space-y-2">
                                    <UrlInput 
                                        shortenedUrl={shortenedUrl} 
                                        setShortenedUrl={setShortenedUrl} 
                                    />
                                    {shortenedUrl ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="mt-6 p-4 border border-white/20 rounded-lg bg-gradient-to-br from-white/10 to-transparent"
                                        >
                                            <p className="text-sm text-[#f0d8b9] mb-2">Your shortened URL:</p>
                                            <TextGenerateEffect words={shortenedUrl} className="text-[#f0d8b9] break-all" />
                                        </motion.div>
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
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AuroraBackground>
            </div>
        </>
    );
}
