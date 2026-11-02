import { useSettings } from '../context/SettingsContext';

export default function About() {
  const { settings } = useSettings();

  return (
    <div className="container-page grid gap-10 py-12 md:grid-cols-2">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-brand">Our story</p>
        <h1 className="mt-2 font-display text-5xl">{settings.restaurant_name}</h1>
        <p className="mt-6 text-lg leading-8 text-muted">{settings.about}</p>
        <p className="mt-6 text-muted">
          Every gravy is made in small batches. Breads go into the tandoor to order. When you place an order on this
          site, we save it first and then ask you to send it on WhatsApp so the kitchen can confirm it with you.
        </p>
      </div>
      <img
        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
        alt="Restaurant table"
        className="h-full min-h-80 rounded-3xl object-cover"
      />
    </div>
  );
}
