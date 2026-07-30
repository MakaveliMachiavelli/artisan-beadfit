import React, { useEffect, useState } from 'react';
import { SpinViewer } from '../components/SpinViewer';
import { Button } from '../components/ui';

interface ShopItem {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price: number;
  status: string;
  stockQty: number;
  composition: string | null;
  sizeMm: number | null;
  wristMm: number | null;
  ease: number | null;
  heroImage: string | null;
  spinBasePath: string | null;
  spinFrameCount: number;
}

export default function CollectionPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shop/items?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error("API returned non-array data:", data);
          setItems([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load shop items", err);
        setLoading(false);
      });
  }, []);

  const currencyFmt = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-obsidian-50)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <h1 className="truncate font-serif text-heading font-semibold leading-none tracking-tight text-[var(--color-obsidian-900)]">
              Artisan Beadfit
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="md" onClick={() => window.location.href = '/studio'}>
              Custom Studio
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-5xl font-semibold tracking-tight text-[var(--color-obsidian-900)] mb-4">
          The Collection
        </h1>
        <p className="text-lg text-[var(--color-obsidian-600)] max-w-2xl mx-auto">
          Explore our ready-made, on-hand bespoke gemstone pieces. 
          Use your mouse or finger to spin the items 360 degrees.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-[var(--color-obsidian-200)] h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-[var(--color-obsidian-200)] rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-[var(--color-obsidian-200)] rounded"></div>
                <div className="h-4 bg-[var(--color-obsidian-200)] rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map(item => (
            <div key={item.id} className="group flex flex-col bg-white rounded-2xl border border-[var(--color-line)] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              
              {/* Product Image / Spin Viewer */}
              <div className="aspect-square bg-[var(--color-obsidian-50)] relative overflow-hidden">
                <SpinViewer 
                  spinBasePath={item.spinBasePath} 
                  spinFrameCount={item.spinFrameCount} 
                  composition={item.composition}
                  sizeMm={item.sizeMm}
                  wristMm={item.wristMm}
                  className="w-full h-full"
                />
                
                {/* Out of stock badge */}
                {item.stockQty <= 0 && (
                  <div className="absolute top-4 right-4 bg-[var(--color-obsidian-900)] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    SOLD OUT
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-2">
                  <h3 className="font-serif text-xl font-medium text-[var(--color-obsidian-900)]">
                    {item.name}
                  </h3>
                  {item.tagline && (
                    <p className="text-sm text-[var(--color-obsidian-500)] mt-1">
                      {item.tagline}
                    </p>
                  )}
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="numeral font-semibold text-[var(--color-obsidian-900)] text-lg">
                    {currencyFmt.format(item.price)}
                  </span>
                  
                  <Button 
                    variant={item.stockQty > 0 ? "primary" : "secondary"}
                    size="sm"
                    disabled={item.stockQty <= 0}
                    onClick={() => {
                      // Future checkout logic here
                      alert(`Added ${item.name} to cart! (Demo)`);
                    }}
                  >
                    {item.stockQty > 0 ? 'Add to Cart' : 'Sold Out'}
                  </Button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
