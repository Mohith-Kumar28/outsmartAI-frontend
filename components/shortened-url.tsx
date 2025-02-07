"use client"

import { useState } from "react"
import { Check, Copy, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ShortenedUrlProps {
    url: string
}

export function ShortenedUrl({ url }: ShortenedUrlProps) {
    const [isCopied, setIsCopied] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy text: ", err)
        }
    }

    const openLink = () => {
        window.open(url, "_blank", "noopener,noreferrer")
    }

    return (
        <div className="flex items-center gap-2 w-full max-w-full">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={copyToClipboard} 
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border-white/20 w-full py-4 md:py-6 text-base md:text-lg overflow-hidden"
                        >
                            {isCopied ? <Check className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 text-[#f0d8b9]" /> : <Copy className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 text-[#f0d8b9]" />}
                            <span className="truncate text-[#f0d8b9] font-medium md:font-bold">{url}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-sm md:text-base">
                        <p>{isCopied ? "Copied!" : "Click to copy"}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={openLink} 
                            className="flex-shrink-0 bg-white/10 hover:bg-white/20 border-white/20 px-4 py-4 md:py-6"
                        >
                            <Link className="h-5 w-5 md:h-6 md:w-6 text-[#f0d8b9]" />
                            <span className="sr-only">Open link</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-sm md:text-base">
                        <p>Open link in new tab</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}