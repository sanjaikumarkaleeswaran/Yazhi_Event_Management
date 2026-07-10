import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Save, Upload, Globe, Mail, Phone, MapPin, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';

type SettingsForm = {
  businessName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  website: string;
  instagram: string;
  facebook: string;
  youtube: string;
  googleMapsUrl: string;
  smtpHost: string;
  smtpPort: string;
  smtpEmail: string;
  cloudinaryName: string;
  cloudinaryApiKey: string;
  metaTitle: string;
  metaDescription: string;
};

const tabs = ['Business', 'Social Media', 'Email & SMTP', 'Integrations', 'SEO'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Business');
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { isDirty } } = useForm<SettingsForm>({
    defaultValues: {
      businessName: 'Yazhi Event Management',
      tagline: 'Turning Every Celebration Into A Timeless Memory',
      email: 'hello@yazhievents.com',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      address: '45, Bharathiyar Street',
      city: 'Tiruppur, Tamil Nadu',
      website: 'https://yazhievents.com',
    }
  });

  const onSubmit = (data: SettingsForm) => {
    console.log('Settings saved:', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/30 focus:border-[#C89B3C] bg-white transition-all placeholder-gray-400";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <div className="space-y-6 max-w-4xl" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your business information and integrations.</p>
      </div>

      {/* Tab Nav */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t ? 'bg-[#18181B] text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Business Tab */}
        {activeTab === 'Business' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5">Business Logo</h2>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#C89B3C] to-[#5A1E1E] flex items-center justify-center text-white text-2xl font-bold">Y</div>
                <div>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-[#C89B3C] hover:bg-[#b08630] text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors">
                    <Upload size={15} /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Recommended: 200×200px PNG or SVG</p>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Business Name</label>
                  <input {...register('businessName')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tagline</label>
                  <input {...register('tagline')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('email')} className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('phone')} className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>WhatsApp Number</label>
                  <div className="relative">
                    <MessageCircle size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('whatsapp')} className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('website')} className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('address')} className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input {...register('city')} className={inputClass} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'Social Media' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Social Media Links</h2>
            <div className="space-y-4">
              {[
                { icon: Instagram, label: 'Instagram', name: 'instagram' as const, placeholder: 'https://instagram.com/yazhievents', color: 'text-pink-500' },
                { icon: Facebook, label: 'Facebook', name: 'facebook' as const, placeholder: 'https://facebook.com/yazhievents', color: 'text-blue-500' },
                { icon: Youtube, label: 'YouTube', name: 'youtube' as const, placeholder: 'https://youtube.com/@yazhievents', color: 'text-red-500' },
              ].map(s => (
                <div key={s.name}>
                  <label className={labelClass}>{s.label}</label>
                  <div className="relative">
                    <s.icon size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${s.color}`} />
                    <input {...register(s.name)} placeholder={s.placeholder} className={`${inputClass} pl-9`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SMTP Tab */}
        {activeTab === 'Email & SMTP' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Email & SMTP Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className={labelClass}>SMTP Host</label><input {...register('smtpHost')} placeholder="smtp.gmail.com" className={inputClass} /></div>
              <div><label className={labelClass}>SMTP Port</label><input {...register('smtpPort')} placeholder="587" className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>SMTP Email Address</label><input {...register('smtpEmail')} placeholder="mail@yazhievents.com" className={inputClass} /></div>
            </div>
          </motion.div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'Integrations' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Third-party Integrations</h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">☁️ Cloudinary (Image Storage)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Cloud Name</label><input {...register('cloudinaryName')} placeholder="your-cloud-name" className={inputClass} /></div>
                  <div><label className={labelClass}>API Key</label><input {...register('cloudinaryApiKey')} placeholder="123456789012345" className={inputClass} /></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-bold text-gray-700 mb-3">📍 Google Maps</h3>
                <label className={labelClass}>Maps Embed URL</label>
                <input {...register('googleMapsUrl')} placeholder="https://maps.google.com/..." className={inputClass} />
              </div>
            </div>
          </motion.div>
        )}

        {/* SEO Tab */}
        {activeTab === 'SEO' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">SEO Settings</h2>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Meta Title</label>
                <input {...register('metaTitle')} placeholder="Yazhi Event Management | Tamil Premium Events" className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">Recommended: 50–60 characters</p>
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea {...register('metaDescription')} rows={3} placeholder="Premium Tamil Event Management for weddings, birthdays & corporate events in Tiruppur." className={`${inputClass} resize-none`} />
                <p className="text-xs text-gray-400 mt-1">Recommended: 120–160 characters</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#18181B] hover:bg-[#2d2d2d] text-white rounded-xl text-sm font-semibold transition-colors">
            <Save size={15} /> Save Changes
          </button>
          {saved && (
            <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
              className="text-sm text-emerald-600 font-medium">✓ Settings saved successfully!</motion.span>
          )}
        </div>
      </form>
    </div>
  );
}
