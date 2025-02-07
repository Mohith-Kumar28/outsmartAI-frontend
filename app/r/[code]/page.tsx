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

function getPlatformSpecificUrl(url: string, userAgent: string) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace('www.', '');
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isMobile = isIOS || isAndroid;
  const isInstagram = /instagram/i.test(userAgent);
  const isFacebook = /fbav|fban/i.test(userAgent);

  // Return original URL for desktop browsers
  if (!isMobile) {
    return url;
  }

  // YouTube handling
  if (domain === 'youtube.com' || domain === 'youtu.be') {
    const videoId = domain === 'youtu.be' ? urlObj.pathname.slice(1) : urlObj.searchParams.get('v');
    if (videoId) {
      if (isAndroid) {
        return `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end;`;
      } else {
        return `youtube://watch?v=${videoId}`;
      }
    }
  }

  // Instagram handling
  if (domain === 'instagram.com') {
    const path = urlObj.pathname.split('/').filter(Boolean);
    if (path.length > 0) {
      if (isAndroid) {
        let intentUrl = 'intent://instagram.com';
        if (path[0] === 'p' && path[1]) { // Post
          intentUrl = `intent://instagram.com/p/${path[1]}#Intent;package=com.instagram.android;scheme=https;end;`;
        } else if (path[0] === 'reel' && path[1]) { // Reel
          intentUrl = `intent://instagram.com/reel/${path[1]}#Intent;package=com.instagram.android;scheme=https;end;`;
        } else { // Profile or other
          intentUrl = `intent://instagram.com/${path[0]}#Intent;package=com.instagram.android;scheme=https;end;`;
        }
        return intentUrl;
      } else {
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
    }
  }

  // Amazon handling
  if (domain === 'amazon.com' || domain === 'amazon.in') {
    if (isAndroid) {
      return `intent://amazon.com${urlObj.pathname}${urlObj.search}#Intent;package=com.amazon.mShop.android.shopping;scheme=https;end;`;
    } else {
      return `amzn://${urlObj.pathname}${urlObj.search}`;
    }
  }

  // Other supported apps
  const platformSchemes = appSchemes[domain];
  if (!platformSchemes) {
    return url;
  }

  if (isAndroid) {
    // Default Android intent URL format for other apps
    return `intent://${domain}${urlObj.pathname}${urlObj.search}#Intent;scheme=https;package=${platformSchemes.android};end;`;
  } else {
    return platformSchemes.ios + urlObj.pathname + urlObj.search;
  }
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
              document.addEventListener('DOMContentLoaded', function() {
                const loadingElement = document.getElementById('loading');
                if (loadingElement) {
                  loadingElement.style.display = 'block';
                }

                const redirectToUrl = (url) => {
                  try {
                    window.location.href = url;
                  } catch (error) {
                    console.error('Redirect failed:', error);
                    window.location.href = '${originalUrl}';
                  }
                };

                const isAppUrl = '${appUrl}' !== '${originalUrl}';
                const isAndroid = /android/i.test(navigator.userAgent);
                const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
                
                if (isAppUrl) {
                  let hasRedirected = false;
                  let fallbackTimer;

                  // Create hidden iframe for iOS app detection
                  if (isIOS) {
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    iframe.src = '${appUrl}';
                  } else {
                    redirectToUrl('${appUrl}');
                  }

                  // Set up app store fallback
                  fallbackTimer = setTimeout(() => {
                    if (!hasRedirected) {
                      hasRedirected = true;
                      redirectToUrl('${originalUrl}');
                    }
                  }, 2500);

                  // Handle page visibility change
                  document.addEventListener('visibilitychange', function() {
                    if (document.hidden) {
                      hasRedirected = true;
                      clearTimeout(fallbackTimer);
                    }
                  });
                } else {
                  redirectToUrl('${originalUrl}');
                }
              });
            `,
          }}
        />
      </div>
    </div>
  );
}