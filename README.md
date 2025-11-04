# {lscr}

{lscr} (LibreScroll) is an open-source web proxy service that lets you browse the web without distractions like ads, popups, and banners. It's strongly inspired by 12ft.io, but created with the belief that an open source alternative is necessary. The service works by disabling JavaScript on webpages, which removes many modern web annoyances.

![{lscr} Screenshot](https://raw.githubusercontent.com/alvaroadlf/lscr/refs/heads/main/public/images/screenshot.png)

## Features

- **Clean Browsing**: Removes ads, popups, subscription walls, and other distractions from webpages
- **Easy to Use**: Simply prepend `lscr.xyz/` to any URL or use the web interface
- **Fast Loading**: Pages load faster without JavaScript overhead
- **Open Source**: Free to use, modify, and improve

## How It Works

{lscr} works by:

1. Taking a URL you want to view
2. Fetching the page content server-side
3. Removing all JavaScript
4. Serving you a clean, distraction-free version of the page

This approach effectively bypasses many paywalls and popup overlays that rely on JavaScript to enforce restrictions.

## Usage

### Web Interface

1. Visit [lscr.xyz](https://lscr.xyz)
2. Enter the URL you want to clean in the input field
3. Click "Clean Webpage"

### Direct URL Method

Simply prepend `lscr.xyz/` to any URL:

```
https://lscr.xyz/https://example.com/article
```

## Limitations

- Some websites rely heavily on JavaScript for core functionality and may not work correctly
- Dynamic content loaded after page load will not appear
- Some interactive elements may not function as expected

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/alvaroadlf/lscr.git

# Navigate to the project directory
cd lscr

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```bash
# Create an optimized production build
npm run build

# Start the production server
npm run start
```

## Open Source

{lscr} is 100% open-source software. The code is freely available for anyone to inspect, modify, and contribute to. This project was created with a belief in transparency and community collaboration.

Unlike similar proprietary tools, {lscr} puts the power in the hands of the community. This project exists because essential web utilities should be open for everyone to understand and improve.

**GitHub Repository:** [github.com/alvaroadlf/lscr](https://github.com/alvaroadlf/lscr)  
**License:** MIT License  
**Contributions:** Pull requests, bug reports, and feature suggestions are welcome!

## License

MIT License

## Disclaimer

{lscr} is not intended to violate the terms of service or copyright of other websites. This is merely an open-source service to view webpages without JavaScript enabled.

## Donations

If you find {lscr} useful and would like to support its development, consider buying me a coffee:

<figure>
<a href='https://ko-fi.com/alvaro' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi5.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
</figure>