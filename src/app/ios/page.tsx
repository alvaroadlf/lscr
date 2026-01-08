'use client';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import packageJson from '../../../package.json';

export default function Home() {
  return (
    <main className="bg-white overflow-hidden px-4 md:px-6">
      <div className="pt-16 max-w-screen-md mx-auto flex flex-col md:flex-row md:space-x-12">
        <div className="w-1/2 hidden md:block">
          <a href="https://lscr.xyz">
            <Image
              className="px-12 -mb-24 md:-mb-48"
              src="/images/lscr-logo-without-tag.svg"
              alt="lscr logo"
              width={500}
              height={500}
            />
          </a>
        </div>
        <div className="pb-8 text-center md:text-left">
          <h1 className="mt-12 text-4xl font-bold">Browsing Freedom</h1>
          <h2 className="mt-1 text-4xl font-bold">on Mac & iOS</h2>

          <Link href="https://www.icloud.com/shortcuts/758c0ae0729448e1a8db6c1cb7cca8e6" target="_blank">
            <div
              className="mt-12 inline-flex items-center py-2 px-4 rounded-lg space-x-2 text-white hover:shadow-lg"
              style={{ background: '#1D1F57' }}
            >
              <Image
                className="w-9 h-9"
                src="/images/logo-shortcuts.png"
                alt="Shortcut Logo"
                width={36}
                height={36}
              />
              <div className="px-2">
                <p className="font-light leading-none">Download the</p>
                <h3 className="text-3xl font-semibold leading-none">Shortcut</h3>
              </div>
            </div>
          </Link>
        </div>
        <div className="md:hidden px-12">
          <Image
            className="-mb-36"
            src="/images/ios-remove-paywall-tight.png"
            alt="iOS Remove Paywall"
            width={500}
            height={500}
          />
        </div>
      </div>

      <div className="max-w-screen-md mx-auto px-4 md:px-6">
        <div className="prose-lg">
          <strong>
            <h2>Installation Guide</h2>
          </strong>
          <div className="md:flex items-start md:space-x-6">
            <div>
              <h3>Step 1: Allow Untrusted Shortcuts</h3>
              <p>
                Make sure your iPhone is able to use untrusted shortcuts by enabling the setting{' '}
                <strong>Settings → Shortcuts → Allow Untrusted Shortcuts.</strong>
              </p>
            </div>
            <Image
              className="w-full md:w-64"
              src="/images/ios-untrusted-shortcuts.png"
              alt="Untrusted Shortcuts"
              width={256}
              height={256}
            />
          </div>
          <br />
          <div className="md:flex items-start md:space-x-6">
            <Image
              className="hidden md:block w-64"
              src="/images/ios-shortcuts.png"
              alt="Shortcuts"
              width={256}
              height={256}
            />
            <div>
              <h3>Step 2: Download the Shortcut</h3>
              <p>
                <Link href="/ios-shortcut">Click here</Link> to download the shortcut to your iPhone's shortcut app.
              </p>
            </div>
            <Image
              className="md:hidden w-full"
              src="/images/ios-shortcuts.png"
              alt="Shortcuts"
              width={256}
              height={256}
            />
          </div>
          <br />
          <div className="md:flex items-start md:space-x-6">
            <div>
              <h3>Step 3: Clean Webpage</h3>
              <p>
                In Safari or any other browser on your iPhone, select the <strong>Clean website</strong> shortcut from
                the{' '}
              </p>
              <div className="inline-flex items-baseline">
                <svg className="h-5 w-5 inline-block self-center mr-1" viewBox="0 0 50 50">
                  <path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z"></path>
                  <path d="M24 7h2v21h-2z"></path>
                  <path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z"></path>
                </svg>
                <span>share menu</span>
              </div>
            </div>
            <Image
              className="w-full md:w-64"
              src="/images/ios-share-sheet.png"
              alt="Share Sheet"
              width={256}
              height={256}
            />
          </div>
        </div>
      </div>

      <footer className="max-w-screen-sm flex flex-col items-center space-y-4 mx-auto py-16 px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-center gap-2 text-zinc-700 text-sm">
          <span className="opacity-50">v{packageJson.version}</span>
          <span className="text-zinc-300">•</span>
          <a
            href={`https://github.com/alvaroadlf/lscr/commit/${process.env.NEXT_PUBLIC_COMMIT_SHA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline opacity-50 hover:opacity-100 transition-opacity"
          >
            View changelog
          </a>
          <span className="text-zinc-300">•</span>
          <a
            href="https://github.com/alvaroadlf/lscr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline opacity-50 hover:opacity-100 transition-opacity"
          >
            View project on GitHub
          </a>
          <span className="text-zinc-300">•</span>
          <a
            href="mailto:hola@lscr.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline opacity-50 hover:opacity-100 transition-opacity"
          >
            Say Hello 👋
          </a>
        </div>
        <div className="flex items-center justify-center gap-2 text-zinc-700 text-sm opacity-50">
          <span>
            &copy; {new Date().getFullYear()} &#123;lscr&#125;. &lt;/&gt; with ❤️ in{' '}
            <a
              href="https://www.google.com/maps?q=Pamplona,+Navarra,+Spain"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:opacity-100 transition-opacity"
            >
              Pamplona
            </a>
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 text-zinc-700">
          <a href='https://ko-fi.com/alvaro' target='_blank'>
            <Image
              height="36"
              width="143"
              style={{ border: 0, height: '36px' }}
              src='https://storage.ko-fi.com/cdn/kofi5.png?v=6'
              alt='Buy Me a Coffee at ko-fi.com'
            />
          </a>
        </div>
      </footer>
    </main>
  );
}