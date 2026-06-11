import React, { useState, useRef } from 'react';
import { api } from '../api/client';

const CATEGORIES = ['Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory'];

const ItemModal = ({ item, onClose, onSaved }) => {
  const isEdit = Boolean(item);
  const [form, setForm] = useState({
    name: item?.name ?? '',
    category: item?.tag ?? item?.category ?? 'Top',
    image_url: item?.image_url ?? item?.image ?? '',
    color: item?.colorDots?.[0] ?? item?.color ?? '',
    formality: item?.formality ?? 'MODERATE',
    formality_value: item?.formalityValue ?? item?.formality_value ?? 50,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image_url ?? item?.image ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, image_url: '' }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, image_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');
    try {
      let result;
      if (!isEdit && imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        fd.append('name', form.name.trim());
        fd.append('category', form.category);
        if (form.color.trim()) fd.append('color', form.color.trim());
        fd.append('formality', form.formality);
        fd.append('formality_value', String(form.formality_value));
        result = await api.uploadClosetItem(fd);
      } else {
        const payload = {
          name: form.name.trim(),
          category: form.category,
          image_url: form.image_url || null,
          color: form.color || null,
          formality: form.formality,
          formality_value: Number(form.formality_value),
        };
        result = isEdit
          ? await api.updateClosetItem(item.id, payload)
          : await api.createClosetItem(payload);
      }
      onSaved(result);
      onClose();
    } catch (err) {
      setError(err.body?.detail || err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-[#1E1813] border border-[#33291F] rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-6">
          {isEdit ? 'Edit Item' : 'Add New Item'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-clay mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Navy Blazer"
              className="w-full bg-[#251D16] border border-[#33291F] rounded-xl py-2.5 px-3 text-white placeholder:text-clay/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-clay mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-[#251D16] border border-[#33291F] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-clay mb-1">Photo</label>
              <div
                className="relative border-2 border-dashed border-[#43372A] rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative h-40 bg-[#251D16] flex items-center justify-center">
                    <img src={imagePreview} alt="preview" className="h-full w-full object-contain p-2" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(''); setForm(f => ({ ...f, image_url: '' })); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center text-clay gap-2">
                    <span className="material-symbols-outlined text-[32px]">upload</span>
                    <span className="text-sm">Click or drag to upload photo</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              {!imageFile && (
                <div className="mt-2">
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={e => { setForm({ ...form, image_url: e.target.value }); if (e.target.value) setImagePreview(e.target.value); }}
                    placeholder="Or paste image URL…"
                    className="w-full bg-[#251D16] border border-[#33291F] rounded-xl py-2 px-3 text-white placeholder:text-clay/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}
            </div>
          )}

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-clay mb-1">Image URL</label>
              <input
                type="url"
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://…"
                className="w-full bg-[#251D16] border border-[#33291F] rounded-xl py-2.5 px-3 text-white placeholder:text-clay/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-clay mb-1">Color</label>
              <input
                type="text"
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                placeholder="e.g. navy, black"
                className="w-full bg-[#251D16] border border-[#33291F] rounded-xl py-2.5 px-3 text-white placeholder:text-clay/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-clay mb-1">Formality</label>
              <select
                value={form.formality}
                onChange={e => setForm({ ...form, formality: e.target.value })}
                className="w-full bg-[#251D16] border border-[#33291F] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {['CASUAL', 'MODERATE', 'FORMAL', 'UNIVERSAL'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-[#CF8675] text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#33291F] text-clay py-3 rounded-xl font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-background-dark py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
