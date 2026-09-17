import { Metadata } from 'next';
import { DiscoverSolarExperience } from '@/components/public/discover-solar/discover-solar-experience';

export const metadata: Metadata = {
  title: 'Discover Your Solar - Real Geographic Roof Engine | Nitish Solar',
  description:
    'Measure your actual roof geometry using real satellite spatial data, calculate panel capacity, simulate solar generation, and estimate your DISCOM net metering savings.',
};

export default function DiscoverSolarPage() {
  return (
    <main className="min-h-screen bg-[#070A0F]">
      <DiscoverSolarExperience isOpen={true} isStandalonePage={true} />
    </main>
  );
}
