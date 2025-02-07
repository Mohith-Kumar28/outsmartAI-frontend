import prisma from '@/db';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

interface PageProps {
  params: Promise<{ code: string }>;
}

async function getOriginalUrl(code: string) {
  try {
    const shortUrl = await prisma.shortUrl.findUnique({
      where: { code },
    });
    if (!shortUrl) {
      console.log(`No URL found for code: ${code}`);
      return null;
    }
    return shortUrl.originalUrl;
  } catch (error) {
    console.error('Error retrieving URL:', error);
    return null;
  }
}

function getPlatformSpecificUrl(url: string, userAgent: string) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace('www.', '');
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isMobile = isIOS || isAndroid;
  const isInstagram = /instagram/i.test(userAgent);
  const isFacebook = /fbav|fban/i.test(userAgent);

  // Add delay for Instagram in-app browser
  if (isInstagram) {
    // Add a small delay to ensure the page is fully loaded
    setTimeout(() => {
      window.location.href = url;
    }, 1000);
    return url;
  }

  // Special handling for Instagram URLs
  if (domain === 'instagram.com' && isMobile) {
    const path = urlObj.pathname.split('/').filter(Boolean);
    if (path.length > 0) {
      // Handle different Instagram URL types
      if (path[0] === 'p' && path[1]) { // Post
        return `instagram://media?id=${path[1]}`;
      } else if (path[0] === 'reel' && path[1]) { // Reel
        return `instagram://reels/video/${path[1]}`;
      } else if (path[0] === 'stories' && path[1]) { // Story
        return `instagram://story?username=${path[1]}`;
      } else { // Profile or other
        return `instagram://user?username=${path[0]}`;
      }
    }
    return url;
  }

  const appSchemes: Record<string, Record<string, string>> = {
    'youtube.com': {
      ios: 'youtube://',
      android: 'vnd.youtube:',
    },
    'twitter.com': {
      ios: 'twitter://',
      android: 'twitter://',
    },
    'instagram.com': {
      ios: 'instagram://',
      android: 'instagram://',
    },
    'linkedin.com': {
      ios: 'linkedin://',
      android: 'linkedin://',
    },
    'amazon.com': {
      ios: 'amzn://',
      android: 'amzn://',
    },
    'amazon.in': {
      ios: 'amzn://',
      android: 'amzn://',
    },
    'flipkart.com': {
      ios: 'flipkart://',
      android: 'flipkart://',
    },
    'swiggy.com': {
      ios: 'swiggy://',
      android: 'swiggy://',
    },
    'zomato.com': {
      ios: 'zomato://',
      android: 'zomato://',
    },
  };

  if (!isMobile) {
    return url;
  }

  const platformSchemes = appSchemes[domain];
  if (!platformSchemes) {
    return url;
  }

  const scheme = isAndroid ? platformSchemes.android : platformSchemes.ios;
  return scheme + urlObj.pathname + urlObj.search;
}

export default async function RedirectPage({ params }: PageProps) {
  const code = (await params).code;
  const originalUrl = await getOriginalUrl(code);

  if (!originalUrl) {
    notFound();
  }

  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const appUrl = getPlatformSpecificUrl(originalUrl, userAgent);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <p className="text-lg mb-4">We are almost there...</p>
        <div id="loading" className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Show loading indicator
              document.getElementById('loading').style.display = 'block';
              
              // Try to open app URL first on mobile devices
              if ('${appUrl}' !== '${originalUrl}') {
                window.location.href = '${appUrl}';
                // If app doesn't open within 2 seconds, redirect to web URL
                setTimeout(() => {
                  window.location.href = '${originalUrl}';
                }, 2000);
              } else {
                // Direct web URL redirect for desktop
                window.location.href = '${originalUrl}';
              }
            `,
          }}
        />
      </div>
    </div>
  );
}