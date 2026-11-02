import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';

const emptyForm = { name: '', description: '', sort_order: 0, is_active: true };

export default function Categories() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .get('/admin/categories', { params: { page, search } })
      .then((res) => {
        setItems(res.data.data.items);
        setMeta(res.data.data.meta);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('description', form.description || '');
    payload.append('sort_order', form.sort_order || 0);
    payload.append('is_active', form.is_active ? '1' : '0');
    if (image) payload.append('image', image);
    try {
      if (editing === 'new') {
        await api.post('/admin/categories', payload);
        toast.success('Category created.');
      } else {
        await api.post(`/admin/categories/${editing.id}`, payload);
        toast.success('Category updated.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save category.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/admin/categories/${toDelete.id}`);
      toast.success('Category deleted.');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Categories</h1>
        <button type="button" onClick={() => { setEditing('new'); setForm(emptyForm); setImage(null); }} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
          Add category
        </button>
      </div>
      <form className="mt-4 flex gap-3" onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="rounded-xl border px-3 py-2" />
        <button type="submit" className="rounded-xl border px-4 py-2 text-sm">Search</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Dishes</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((category) => (
              <tr key={category.id} className="border-t">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3">{category.foods_count}</td>
                <td className="px-4 py-3">{category.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="mr-3 text-brand" onClick={() => { setEditing(category); setForm({ name: category.name, description: category.description || '', sort_order: category.sort_order, is_active: category.is_active }); setImage(null); }}>Edit</button>
                  <button type="button" className="text-red-600" onClick={() => setToDelete(category)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={meta.current_page} lastPage={meta.last_page} onChange={setPage} />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-6">
            <h2 className="font-display text-2xl">{editing === 'new' ? 'New category' : 'Edit category'}</h2>
            <label className="mt-4 block text-sm">Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="mt-3 block text-sm">Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="mt-3 block text-sm">Sort order
              <input type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="mt-3 block text-sm">Image
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="mt-1 w-full text-sm" />
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-4 py-2">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-full bg-brand px-4 py-2 font-semibold text-white">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
      <ConfirmDialog open={Boolean(toDelete)} title="Delete category?" message="Food items in this category will also be deleted." confirmLabel="Delete" onCancel={() => setToDelete(null)} onConfirm={remove} />
    </div>
  );
}
