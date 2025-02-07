'use client'
import {
    animate,
    useMotionTemplate,
    useMotionValue,
    motion,
} from "framer-motion";
import { useToast } from "@/hooks/use-toast"

import React, { useEffect, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { shortenUrl } from "@/app/actions/url";

interface UrlInputProps {
    shortenedUrl: string;
    setShortenedUrl: React.Dispatch<React.SetStateAction<string>>;
}

const UrlInput: React.FC<UrlInputProps> = ({ shortenedUrl, setShortenedUrl }) => {
    return (
        <div className="">
            <BeamInput shortenedUrl={shortenedUrl} setShortenedUrl={setShortenedUrl} />
        </div>
    );
};

const BeamInput: React.FC<UrlInputProps> = ({ shortenedUrl, setShortenedUrl }) => {
    const { toast } = useToast()
    const inputRef = useRef<HTMLInputElement>(null);
    const turn = useMotionValue(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        animate(turn, 1, {
            ease: "linear",
            duration: 5,
            repeat: Infinity,
        });
    }, [turn]);

    const backgroundImage = useMotionTemplate`conic-gradient(from ${turn}turn, #a78bfa00 75%, #a78bfa 100%)`;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            const url = formData.get('url') as string;
            const result = await shortenUrl(url);
            
            if (result.success) {
                const shortUrl = `${window.location.origin}/redirect/${result.code}`;
                setShortenedUrl(shortUrl);
                toast({
                    description: "URL shortened successfully!",
                });
            } else {
                setShortenedUrl('Failed to shorten URL');
                toast({
                    variant: "destructive",
                    description: "Failed to shorten URL",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                description: "An error occurred while shortening the URL",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            onClick={() => {
                inputRef.current?.focus();
            }}
            className="relative flex w-full items-center gap-2 rounded-full border border-white/20 bg-gradient-to-br from-white/20 to-white/5 py-1.5 pl-6 pr-1.5"
        >
            <input
                required
                ref={inputRef}
                name="url"
                type="url"
                placeholder="Enter your URL..."
                className="w-full bg-transparent text-sm placeholder-white/80 focus:outline-0"
            />
            <button
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                type="submit"
                disabled={isLoading}
                className="group flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-[#b6acac] to-gray-400 px-4 py-3 text-sm font-medium text-gray-900 transition-transform active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="text-black font-s">
                    {isLoading ? "Shortening..." : "Shorten URL"}
                </span>
                <FiArrowRight className="-mr-4 opacity-0 transition-all group-hover:-mr-0 group-hover:opacity-100 group-active:-rotate-45" />
            </button>

            <div className="pointer-events-none absolute inset-0 rounded-full">
                <motion.div
                    style={{
                        backgroundImage,
                    }}
                    className="mask-with-browser-support absolute -inset-[1px] rounded-full border border-transparent bg-origin-border"
                />
            </div>
        </form>
    );
};

export { UrlInput };