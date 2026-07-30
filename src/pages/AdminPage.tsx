import React, { useState, useEffect } from 'react';
import { PhotoScannerHero } from '../components/PhotoScannerHero';
import { Button } from '../components/ui';

interface ShopItem {
  id: string;
  name: string;
  price: number;
}

export default function AdminPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [deletedItem, setDeletedItem] = useState<{id: string, name: string} | null>(null);

  const fetchItems = () => {
    fetch('/api/shop/items?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    // We don't ask for confirmation anymore since we have an undo!
    try {
      const res = await fetch(`/api/shop/items/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchItems();
        setDeletedItem({ id, name });
        // Hide the undo toast after 8 seconds
        setTimeout(() => {
          setDeletedItem(current => current?.id === id ? null : current);
        }, 8000);
      } else {
        alert('Failed to delete item.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUndo = async () => {
    if (!deletedItem) return;
    try {
      const res = await fetch(`/api/shop/items/${deletedItem.id}/restore`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchItems();
        setDeletedItem(null); // Hide toast
      } else {
        alert('Failed to restore item.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Toast Notification */}
      {deletedItem && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--color-obsidian-900)] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-[rise_0.3s_ease-out]">
          <span>Removed "{deletedItem.name}"</span>
          <button onClick={handleUndo} className="text-[#00ff88] font-bold uppercase tracking-wider text-sm hover:underline">
            Undo
          </button>
        </div>
      )}

      <header className="bg-[var(--color-obsidian-900)] text-white p-4">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <h1 className="font-serif text-2xl font-bold">Admin Inventory Dashboard</h1>
          <Button variant="secondary" onClick={() => window.location.href = '/collection'}>
            View Live Shop
          </Button>
        </div>
      </header>

      <main className="flex-grow p-8 max-w-[1200px] mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">1. Digitize New Bracelet</h2>
          <p className="text-gray-600 mb-6">Upload a photo to extract the bead colors and create a 3D model. Then fill out the form to save it to your shop.</p>
          <PhotoScannerHero onSaveSuccess={fetchItems} />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">2. Manage Inventory</h2>
          
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">No items found.</td>
                  </tr>
                )}
                {items.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4">₱{item.price}</td>
                    <td className="p-4 text-right">
                      <Button variant="secondary" size="sm" onClick={() => handleDelete(item.id, item.name)} className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
