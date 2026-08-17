import type { Metadata } from 'next';
import NotFoundContent from '@/components/NotFoundContent';

export const metadata: Metadata = {
  title: '404 — Page not found',
};

export default function NotFound() {
  return <NotFoundContent />;
}
