import { useState } from 'react';
import { Clock, Mail, MapPin, MessageSquare, Phone, User } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { settings } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', mobile: '', message: '' });

  const phone = String(settings.whatsapp_number || '').replace(/\D/g, '');

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.mobile.trim() || !form.message.trim()) {
      toast.error('Please fill in name, mobile, and message.');
      return;
    }
    const text = `Hi ${settings.restaurant_name}, I am ${form.name} (${form.mobile}). ${form.message}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success('Opening WhatsApp so you can send your message.');
  };

  return (
    <div className="container-page grid gap-10 py-12 md:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-brand">Kitchen line</p>
        <h1 className="font-display mt-2 text-4xl">Contact us</h1>
        <p className="mt-4 text-muted">Call, visit, or send a WhatsApp note. We reply during kitchen hours.</p>
        <div className="mt-8 grid gap-4">
          <InfoCard icon={Phone} label="Phone" value={settings.phone} href={`tel:${settings.phone}`} />
          <InfoCard icon={Mail} label="Email" value={settings.email} href={`mailto:${settings.email}`} />
          <InfoCard icon={MapPin} label="Address" value={settings.address} />
          <InfoCard icon={Clock} label="Hours" value={settings.opening_hours} />
        </div>
      </div>
      <form onSubmit={submit} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_50px_rgba(28,25,23,0.08)] ring-1 ring-stone-100">
        <div className="bg-cream px-6 py-5">
          <h2 className="font-display text-2xl">Send a WhatsApp note</h2>
          <p className="mt-1 text-sm text-muted">We open WhatsApp with your message ready to send.</p>
        </div>
        <div className="space-y-4 p-6">
          <label className="block text-sm font-medium">
            Name
            <span className="field-shell mt-1.5">
              <User size={18} className="text-brand" />
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </span>
          </label>
          <label className="block text-sm font-medium">
            Mobile
            <span className="field-shell mt-1.5">
              <Phone size={18} className="text-brand" />
              <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="99667 38715" />
            </span>
          </label>
          <label className="block text-sm font-medium">
            Message
            <span className="field-shell mt-1.5 items-start">
              <MessageSquare size={18} className="mt-0.5 text-brand" />
              <textarea className="min-h-28" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Table booking, catering, or a quick question" />
            </span>
          </label>
          <button type="submit" className="w-full rounded-full bg-brand py-3 font-semibold text-white hover:bg-brand-dark">
            Send on WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, href }) {
  const content = href ? <a href={href} className="font-medium">{value}</a> : <p className="font-medium">{value}</p>;
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-brand">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
        {content}
      </div>
    </div>
  );
}
