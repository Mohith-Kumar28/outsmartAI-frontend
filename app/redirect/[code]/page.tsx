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
  
  const appSchemes: Record<string, Record<string, string>> = {
    'youtube.com': {
      ios: 'youtube://',
      android: 'vnd.youtube:',
    },
    'twitter.com': {
      ios: 'twitter://',
      android: 'twitter://',
    },
  };

  const domain = urlObj.hostname.replace('www.', '');
  const platformSchemes = appSchemes[domain];
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isMobile = isIOS || isAndroid;

  if (!platformSchemes || !isMobile) {
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
        <p className="text-lg mb-4">Redirecting...</p>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Try to open app URL first on mobile devices
              if ('${appUrl}' !== '${originalUrl}') {
                window.location.replace('${appUrl}');
                // If app doesn't open within 1 second, redirect to web URL
                setTimeout(() => {
                  window.location.href = '${originalUrl}';
                }, 1000);
              } else {
                // Direct web URL redirect for desktop
                window.location.replace('${originalUrl}');
              }
            `,
          }}
        />
      </div>
    </div>
  );
}