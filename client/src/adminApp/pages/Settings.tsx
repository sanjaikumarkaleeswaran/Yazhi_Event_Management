import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { AlertTriangle, Save, RotateCcw, ShieldCheck, Sparkles, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useBackupSettings, useRestoreSettings, useSettings, useTestEmailSettings, useUpdateSettings } from '../hooks/useSettings';
import type { SettingsFormValues, SettingsTab } from '../types/settings';

const tabs: SettingsTab[] = ['General', 'Business', 'Booking', 'Payment', 'Email', 'WhatsApp', 'Cloudinary', 'Theme', 'Security', 'Backup', 'Audit Logs'];

const defaultValues: SettingsFormValues = {
  companyName: 'Yazhi Event Management',
  logo: '',
  favicon: '',
  businessEmail: 'hello@yazhievents.com',
  businessPhone: '+91 9876543210',
  website: 'https://yazhievents.com',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  enableMaintenanceMode: false,
  businessAddress: 'Tiruppur, Tamil Nadu',
  googleMapsUrl: 'https://maps.google.com/',
  gstNumber: '',
  panNumber: '',
  instagram: '',
  facebook: '',
  youtube: '',
  linkedIn: '',
  whatsappNumber: '',
  emergencyContact: '',
  businessDescription: 'Premium event management for unforgettable experiences.',
  bookingPrefix: 'YAZHI',
  defaultBookingDuration: 240,
  workingHours: '09:00-18:00',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  maximumBookingsPerDay: 10,
  bufferTime: 30,
  bookingConfirmationPolicy: 'Booking confirmed upon payment receipt.',
  cancellationPolicy: 'Cancellations are subject to policy terms.',
  refundPolicy: 'Refunds are evaluated on a case-by-case basis.',
  defaultEventStatus: 'Pending',
  defaultPaymentStatus: 'Pending',
  razorpayKeyId: '',
  razorpayKeySecret: '',
  razorpayWebhookSecret: '',
  depositPercentage: 30,
  invoicePrefix: 'INV',
  invoiceFooter: 'Thank you for choosing Yazhi Events.',
  invoiceNotes: '',
  taxPercentage: 5,
  lateFee: 0,
  enableOnlinePayment: true,
  enableCashPayment: true,
  enableBankTransfer: true,
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  fromEmail: 'hello@yazhievents.com',
  fromName: 'Yazhi Events',
  enableEmailNotifications: true,
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioPhoneNumber: '',
  enableSMS: false,
  whatsappBusinessNumber: '',
  whatsappApiToken: '',
  webhookUrl: '',
  verifyToken: '',
  enableWhatsApp: false,
  dryRunMode: true,
  cloudName: '',
  cloudinaryApiKey: '',
  cloudinaryApiSecret: '',
  uploadFolder: 'yazhi-events',
  maxUploadSize: 10000,
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp'],
  enableImageCompression: true,
  primaryColor: '#C89B3C',
  secondaryColor: '#5A1E1E',
  accentColor: '#F6E8C7',
  sidebarStyle: 'glass',
  darkMode: true,
  lightMode: true,
  fontSelection: 'Inter',
  borderRadius: 16,
  animationsEnabled: true,
  jwtExpiry: 86400,
  refreshTokenExpiry: 2592000,
  sessionTimeout: 1800,
  passwordLength: 8,
  passwordComplexity: 'medium',
  maxLoginAttempts: 5,
  accountLockDuration: 900,
  enableTwoFactorAuthentication: false,
  enableAuditLogs: true,
  enableIpLogging: true,
};

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2.6 text-sm text-slate-800 shadow-sm outline-none transition focus:border-amber-400 focus:bg-white';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500';

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const testEmailMutation = useTestEmailSettings();
  const backupMutation = useBackupSettings();
  const restoreMutation = useRestoreSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  const [savedMessage, setSavedMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<SettingsFormValues>({ defaultValues });

  useEffect(() => {
    if (data) {
      reset({ ...defaultValues, ...data });
    }
  }, [data, reset]);

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  const handleSave = async (formValues: SettingsFormValues) => {
    try {
      await updateMutation.mutateAsync(formValues as unknown as Record<string, unknown>);
      setSavedMessage('Settings saved successfully.');
      setTimeout(() => setSavedMessage(''), 2500);
      reset(formValues);
      setHasUnsavedChanges(false);
    } catch (error: any) {
      setSavedMessage(error?.message || 'Unable to save settings.');
    }
  };

  const handleReset = () => {
    if (data) {
      reset({ ...defaultValues, ...data });
      setHasUnsavedChanges(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      await testEmailMutation.mutateAsync(undefined);
      setSavedMessage('Email test endpoint responded successfully.');
    } catch (error: any) {
      setSavedMessage(error?.message || 'Email test failed.');
    }
  };

  const handleBackup = async () => {
    try {
      await backupMutation.mutateAsync(undefined);
      setSavedMessage('Backup created successfully.');
    } catch (error: any) {
      setSavedMessage(error?.message || 'Backup failed.');
    }
  };

  const handleRestore = async () => {
    try {
      await restoreMutation.mutateAsync(undefined);
      setSavedMessage('Restore request completed.');
    } catch (error: any) {
      setSavedMessage(error?.message || 'Restore failed.');
    }
  };

  const tabContent = useMemo(() => ({
    General: (
      <motion.div key="General" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="General Configuration" description="Core company identity and operating preferences.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company Name"><input {...register('companyName')} className={inputClass} /></Field>
            <Field label="Business Email"><input {...register('businessEmail')} className={inputClass} /></Field>
            <Field label="Business Phone"><input {...register('businessPhone')} className={inputClass} /></Field>
            <Field label="Website"><input {...register('website')} className={inputClass} /></Field>
            <Field label="Timezone"><input {...register('timezone')} className={inputClass} /></Field>
            <Field label="Currency"><input {...register('currency')} className={inputClass} /></Field>
            <Field label="Language"><input {...register('language')} className={inputClass} /></Field>
            <Field label="Date Format"><input {...register('dateFormat')} className={inputClass} /></Field>
            <Field label="Time Format"><input {...register('timeFormat')} className={inputClass} /></Field>
            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600"><ShieldCheck size={16} /> Enable Maintenance Mode</label>
              <input type="checkbox" {...register('enableMaintenanceMode')} className="h-4 w-4 rounded border-slate-300" />
            </div>
          </div>
        </Card>
      </motion.div>
    ),
    Business: (
      <motion.div key="Business" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="Business Details" description="Address, social channels, and company profile.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business Address"><input {...register('businessAddress')} className={inputClass} /></Field>
            <Field label="Google Maps URL"><input {...register('googleMapsUrl')} className={inputClass} /></Field>
            <Field label="GST Number"><input {...register('gstNumber')} className={inputClass} /></Field>
            <Field label="PAN Number"><input {...register('panNumber')} className={inputClass} /></Field>
            <Field label="Instagram"><input {...register('instagram')} className={inputClass} /></Field>
            <Field label="Facebook"><input {...register('facebook')} className={inputClass} /></Field>
            <Field label="YouTube"><input {...register('youtube')} className={inputClass} /></Field>
            <Field label="LinkedIn"><input {...register('linkedIn')} className={inputClass} /></Field>
            <Field label="WhatsApp Number"><input {...register('whatsappNumber')} className={inputClass} /></Field>
            <Field label="Emergency Contact"><input {...register('emergencyContact')} className={inputClass} /></Field>
            <div className="md:col-span-2"><Field label="Business Description"><textarea {...register('businessDescription')} rows={4} className={`${inputClass} resize-none`} /></Field></div>
          </div>
        </Card>
      </motion.div>
    ),
    Booking: (
      <motion.div key="Booking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="Booking Defaults" description="Standard booking workflow and service windows.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Booking Prefix"><input {...register('bookingPrefix')} className={inputClass} /></Field>
            <Field label="Default Booking Duration (minutes)"><input type="number" {...register('defaultBookingDuration', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Working Hours"><input {...register('workingHours')} className={inputClass} /></Field>
            <Field label="Maximum Bookings Per Day"><input type="number" {...register('maximumBookingsPerDay', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Buffer Time (minutes)"><input type="number" {...register('bufferTime', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Default Event Status"><input {...register('defaultEventStatus')} className={inputClass} /></Field>
            <Field label="Default Payment Status"><input {...register('defaultPaymentStatus')} className={inputClass} /></Field>
            <div className="md:col-span-2"><Field label="Booking Confirmation Policy"><textarea {...register('bookingConfirmationPolicy')} rows={4} className={`${inputClass} resize-none`} /></Field></div>
            <div className="md:col-span-2"><Field label="Cancellation Policy"><textarea {...register('cancellationPolicy')} rows={4} className={`${inputClass} resize-none`} /></Field></div>
            <div className="md:col-span-2"><Field label="Refund Policy"><textarea {...register('refundPolicy')} rows={4} className={`${inputClass} resize-none`} /></Field></div>
          </div>
        </Card>
      </motion.div>
    ),
    Payment: (
      <motion.div key="Payment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="Payments" description="Razorpay, invoices and payment toggles.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Razorpay Key ID"><input {...register('razorpayKeyId')} className={inputClass} /></Field>
            <Field label="Razorpay Key Secret"><input {...register('razorpayKeySecret')} className={inputClass} /></Field>
            <Field label="Webhook Secret"><input {...register('razorpayWebhookSecret')} className={inputClass} /></Field>
            <Field label="Deposit Percentage"><input type="number" {...register('depositPercentage', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Invoice Prefix"><input {...register('invoicePrefix')} className={inputClass} /></Field>
            <Field label="Late Fee"><input type="number" {...register('lateFee', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Tax Percentage"><input type="number" {...register('taxPercentage', { valueAsNumber: true })} className={inputClass} /></Field>
            <div className="md:col-span-2"><Field label="Invoice Footer"><textarea {...register('invoiceFooter')} rows={3} className={`${inputClass} resize-none`} /></Field></div>
            <div className="md:col-span-2"><Field label="Invoice Notes"><textarea {...register('invoiceNotes')} rows={3} className={`${inputClass} resize-none`} /></Field></div>
            <div className="md:col-span-2 flex flex-wrap gap-4">
              <ToggleRow label="Enable Online Payment" register={register('enableOnlinePayment')} />
              <ToggleRow label="Enable Cash Payment" register={register('enableCashPayment')} />
              <ToggleRow label="Enable Bank Transfer" register={register('enableBankTransfer')} />
            </div>
          </div>
        </Card>
      </motion.div>
    ),
    Email: (
      <motion.div key="Email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="Email Delivery" description="SMTP and provider preferences.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="SMTP Host"><input {...register('smtpHost')} className={inputClass} /></Field>
            <Field label="SMTP Port"><input type="number" {...register('smtpPort', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="SMTP Username"><input {...register('smtpUsername')} className={inputClass} /></Field>
            <Field label="SMTP Password"><input type="password" {...register('smtpPassword')} className={inputClass} /></Field>
            <Field label="From Email"><input {...register('fromEmail')} className={inputClass} /></Field>
            <Field label="From Name"><input {...register('fromName')} className={inputClass} /></Field>
            <div className="md:col-span-2"><ToggleRow label="Enable Email Notifications" register={register('enableEmailNotifications')} /></div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={handleTestEmail} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Test Email</button>
          </div>
        </Card>
      </motion.div>
    ),
    WhatsApp: (
      <motion.div key="WhatsApp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="WhatsApp Integration" description="Business messaging controls.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business Number"><input {...register('whatsappBusinessNumber')} className={inputClass} /></Field>
            <Field label="API Token"><input {...register('whatsappApiToken')} className={inputClass} /></Field>
            <Field label="Webhook URL"><input {...register('webhookUrl')} className={inputClass} /></Field>
            <Field label="Verify Token"><input {...register('verifyToken')} className={inputClass} /></Field>
            <div className="md:col-span-2 flex flex-wrap gap-4">
              <ToggleRow label="Enable WhatsApp" register={register('enableWhatsApp')} />
              <ToggleRow label="Dry Run Mode" register={register('dryRunMode')} />
            </div>
          </div>
        </Card>
      </motion.div>
    ),
    Cloudinary: (
      <motion.div key="Cloudinary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="Cloudinary" description="Media storage and upload policy.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Cloud Name"><input {...register('cloudName')} className={inputClass} /></Field>
            <Field label="API Key"><input {...register('cloudinaryApiKey')} className={inputClass} /></Field>
            <Field label="API Secret"><input {...register('cloudinaryApiSecret')} className={inputClass} /></Field>
            <Field label="Upload Folder"><input {...register('uploadFolder')} className={inputClass} /></Field>
            <Field label="Maximum Upload Size"><input type="number" {...register('maxUploadSize', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Allowed File Types"><input {...register('allowedFileTypes.0')} className={inputClass} /></Field>
            <div className="md:col-span-2"><ToggleRow label="Enable Image Compression" register={register('enableImageCompression')} /></div>
          </div>
        </Card>
      </motion.div>
    ),
    Theme: (
      <motion.div key="Theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="Theme" description="Visual branding and interface preferences.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary Color"><input {...register('primaryColor')} className={inputClass} /></Field>
            <Field label="Secondary Color"><input {...register('secondaryColor')} className={inputClass} /></Field>
            <Field label="Accent Color"><input {...register('accentColor')} className={inputClass} /></Field>
            <Field label="Sidebar Style"><input {...register('sidebarStyle')} className={inputClass} /></Field>
            <Field label="Font Selection"><input {...register('fontSelection')} className={inputClass} /></Field>
            <Field label="Border Radius"><input type="number" {...register('borderRadius', { valueAsNumber: true })} className={inputClass} /></Field>
            <div className="md:col-span-2 flex flex-wrap gap-4">
              <ToggleRow label="Dark Mode" register={register('darkMode')} />
              <ToggleRow label="Light Mode" register={register('lightMode')} />
              <ToggleRow label="Animations Enabled" register={register('animationsEnabled')} />
            </div>
          </div>
        </Card>
      </motion.div>
    ),
    Security: (
      <motion.div key="Security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="Security" description="Authentication and access controls.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="JWT Expiry (seconds)"><input type="number" {...register('jwtExpiry', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Refresh Token Expiry (seconds)"><input type="number" {...register('refreshTokenExpiry', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Session Timeout (seconds)"><input type="number" {...register('sessionTimeout', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Password Length"><input type="number" {...register('passwordLength', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Password Complexity"><input {...register('passwordComplexity')} className={inputClass} /></Field>
            <Field label="Maximum Login Attempts"><input type="number" {...register('maxLoginAttempts', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="Account Lock Duration (seconds)"><input type="number" {...register('accountLockDuration', { valueAsNumber: true })} className={inputClass} /></Field>
            <div className="md:col-span-2 flex flex-wrap gap-4">
              <ToggleRow label="Enable Two Factor Authentication" register={register('enableTwoFactorAuthentication')} />
              <ToggleRow label="Enable Audit Logs" register={register('enableAuditLogs')} />
              <ToggleRow label="Enable IP Logging" register={register('enableIpLogging')} />
            </div>
          </div>
        </Card>
      </motion.div>
    ),
    Backup: (
      <motion.div key="Backup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="Backup & Restore" description="Export and restore configuration safely.">
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={handleBackup} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Create Manual Backup</button>
            <button type="button" onClick={handleRestore} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Restore Backup</button>
          </div>
        </Card>
      </motion.div>
    ),
    'Audit Logs': (
      <motion.div key="Audit Logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card title="Audit Trail" description="Changes are logged server-side for compliance and tracking.">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Every change to settings generates an audit record with the user, timestamp, action, old value, new value, IP address, browser, and operating system.</div>
        </Card>
      </motion.div>
    ),
  }), [register]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[28px] border border-white/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_20px_80px_rgba(15,23,42,0.25)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Enterprise Settings</p>
            <h1 className="text-3xl font-semibold">Business configuration and controls</h1>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur">
            <div className="flex items-center gap-2"><Sparkles size={16} /> Production-ready config hub</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        {isLoading ? (
          <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading configuration…</div>
        ) : (
          <AnimatePresence mode="wait">{tabContent[activeTab]}</AnimatePresence>
        )}

        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {hasUnsavedChanges ? <AlertTriangle size={16} className="text-amber-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />} {hasUnsavedChanges ? 'Unsaved changes detected.' : 'All changes saved.'}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleReset} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"> <RotateCcw size={15} /> Reset</button>
            <button type="button" onClick={() => setActiveTab('General')} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"> <ChevronRight size={15} /> Cancel</button>
            <button type="submit" className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"> {updateMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save</button>
          </div>
        </div>

        {savedMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{savedMessage}</div> : null}
      </form>
    </div>
  );
}

function Card({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-2 text-amber-600"><Sparkles size={16} /></div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm text-slate-600"><span className={labelClass}>{label}</span>{children}</label>;
}

function ToggleRow({ label, register }: { label: string; register: any }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <input type="checkbox" {...register} className="h-4 w-4 rounded border-slate-300" />
      <span>{label}</span>
    </label>
  );
}
