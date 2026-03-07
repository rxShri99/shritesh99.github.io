# Next.js + React + Three.js Portfolio

[![Netlify Status](https://api.netlify.com/api/v1/badges/27794f55-e474-4ca2-9b97-6940af12aab2/deploy-status)](https://app.netlify.com/projects/shri99-dev/deploys)

A production-ready 3D web portfolio built with:

- **Next.js 16+** - React framework with App Router
- **React 19+** - Latest React with new features
- **Three.js** - 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **ESLint** - Code linting

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   └── Scene.tsx          # Three.js scene component
├── public/                # Static assets
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── next.config.ts         # Next.js configuration
└── eslint.config.mjs      # ESLint configuration
```

## Features

✅ Full TypeScript support  
✅ 3D rendering with Three.js  
✅ Tailwind CSS styling  
✅ Production optimizations  
✅ ESLint configuration  
✅ GitHub Actions CI/CD  
✅ Dark mode ready  

## Environment Variables

Create `.env.local` for development:
```
NEXT_PUBLIC_APP_ENV=development
```

## Deployment

The project is optimized for deployment on Vercel. Push to your repository and connect it to Vercel for automatic deployments.

## License

MIT

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
