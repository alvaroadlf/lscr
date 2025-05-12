'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [url, setUrl] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = `https://${processedUrl}`;
    }

    router.push(`/proxy?url=${encodeURIComponent(processedUrl)}`);
  };

  return (
    <main className="flex min-h-screen flex-col">
      <header className="max-w-screen-lg mx-auto pt-6 px-4 md:px-6 grid grid-cols-3 items-center">
        <div></div>
        <Link className="text-xl font-medium text-center" href="/">
          <Image src="/images/lscr-logo-without-tag.svg" alt="&#123;lscr&#125; Logo" width={400} height={60} />
        </Link>
        <div className="hidden md:flex items-center justify-end group font-medium text-gray-600">
          <span className="mr-1">📱</span>
          <Link href="/ios" className="group-hover:underline">
            Shortcut for iOS
          </Link>
        </div>
      </header>

      <div className="max-w-[1150px] mx-auto px-4 md:px-6">
        <div className="py-16 md:py-12 flex flex-col relative items-center justify-center text-gray-700 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight z-10">
            Browsing Freedom
          </h1>
          <h3 className="text-xl md:text-3xl font-medium tracking-tight z-10 mt-4">
            Remove popups, banners, and intrusive ads with ease.
          </h3>
        </div>
      </div>

      <div className="px-4 md:px-6">
        <div className="mt-6 max-w-screen-lg mx-auto flex flex-col items-center">
          <form className="flex text-xl" onSubmit={handleSubmit}>
            <input
              className="px-4 w-[300px] border border-gray-400 border-r-0"
              placeholder="https://example.com/page..."
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input type="submit" className="hidden" />
            <button
              type="submit"
              className="px-4 py-2 min-w-12 text-sm leading-none font-medium border border-emerald-500 bg-emerald-300 text-emerald-700 hover:bg-emerald-500 hover:text-white"
            >
              Clean <br /> Website
            </button>
          </form>
          <p className="mt-12 font-light text-xl">Clean any webpage,</p>
          <div className="mt-1 inline-flex items-center font-medium text-xl">
            <span>https://lscr.xyz/</span>
            <span className="bg-emerald-300" style={{ lineHeight: 0.5 }}>
              &#123;URL&#125;
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-center font-semibold text-gray-500">
            Probably works with almost all of your favorite websites
            </h3>
          </div>
        </div>
      </div>

      <div className="my-4 max-w-screen-sm mx-auto pt-6 md:pt-12 px-4 md:px-6 prose">
        <h2 className="text-center">FAQ</h2>
        <h3>What is &#123;lscr&#125;?</h3>
        <p>
          &#123;lscr&#125; is an open-source tool designed to help you browse the web without distractions. 
          It&apos;s strongly inspired by 12ft.io, but created with the belief that an open source alternative is necessary.
        </p>
        <p>
          By adding <strong>lscr.xyz/</strong> before any URL, you can remove popups, ads, and other visual clutter.
        </p>

        <h3>Why choose &#123;lscr&#125;?</h3>
        <p>
          The internet is full of interruptions like ads and popups. &#123;lscr&#125; offers a clean, distraction-free 
          browsing experience, built with transparency and user freedom in mind.
        </p>
        <p>
          The mission is to make the web more accessible and enjoyable for everyone, without unnecessary barriers.
        </p>
        <p>
          Many websites load visual distractions through JavaScript after the page renders. &#123;lscr&#125; disables 
          Most visual distractions on webpages are loaded after the page renders via JavaScript.
        </p>
        <p>
          All &#123;lscr&#125; does is disable the JavaScript of the site.
        </p>
        <p>
          This doesn&apos;t work for all websites, but it works for a surprisingly large proportion of them.
          This is generally the case because most sites want to be indexed by Google and other search engines which have historically not run the JavaScript.
        </p>
        <p>
          Try it now by adding <code>lscr.xyz/</code> before any URL. &#123;lscr&#125; is your open-source solution 
          for a cleaner web experience.
        </p>

        <h3>Open Source</h3>
        <p>
          &#123;lscr&#125; is 100% open-source software. The code is freely available for anyone to inspect, modify, and contribute to. 
          This project was created with a belief in transparency and community collaboration.
        </p>
        <p>
          Unlike similar proprietary tools, &#123;lscr&#125; puts the power in the hands of the community. 
          This project exists because essential web utilities should be open for everyone to understand and improve.
        </p>
        <h3>Disclaimer</h3>
        <p>
          &#123;lscr&#125; is not intended to violate the terms of service or copyright of other websites.
          This is merely an open-source service to view webpages without JavaScript enabled.
        </p>
      </div>

      <footer className="max-w-screen-sm flex flex-col items-center space-y-4 mx-auto py-16 px-4 md:px-6">
        <div className="flex items-center justify-center gap-2 text-zinc-700">
        <a
              href="https://github.com/alvaroadlf/lscr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              View on GitHub
            </a>
        </div>
        <div className="flex items-center justify-center gap-2 text-zinc-700">
        <a
              href="mailto:hola@lscr.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Say Hello 👋
            </a>
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
        <div className="flex items-center justify-center gap-2 text-zinc-700">
          <span>
            &lt;/&gt; with ❤️ in{' '}
            <a
              href="https://www.google.com/maps?q=Pamplona,+Navarra,+Spain"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline"
            >
              Pamplona
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}
