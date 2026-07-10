import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { useSubmitInquiry } from '../../shared/hooks/useSubmitInquiry';
import { useState } from 'react';
import { SEO } from '../../shared/components/SEO';

const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  eventType: z.string().min(1, 'Event type is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  city: z.string().min(1, 'City is required'),
  message: z.string().min(1, 'Message is required'),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

const Contact = () => {
  const [success, setSuccess] = useState(false);
  const { mutate, isPending, error } = useSubmitInquiry();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = (data: InquiryFormValues) => {
    mutate(data, {
      onSuccess: () => {
        setSuccess(true);
        reset();
      },
    });
  };

  return (
    <Section>
      <SEO 
        title="Contact Us"
        description="Book a consultation with our event experts today."
        canonicalUrl="/contact"
      />
      <Container className="max-w-3xl">
        <h1 className="text-4xl font-heading text-primary mb-8 text-center">Book a Consultation</h1>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-heading mb-2">Thank You!</h2>
            <p>Your inquiry has been received. Our team will contact you shortly.</p>
            <button onClick={() => setSuccess(false)} className="mt-4 text-primary underline">Submit another inquiry</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-primary/10">
            {error && <div className="text-red-500 text-sm mb-4">Error submitting inquiry. Please try again.</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Name</label>
                <input {...register('name')} className="w-full border border-gray-300 rounded p-2 focus:ring-primary focus:border-primary" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Phone</label>
                <input {...register('phone')} className="w-full border border-gray-300 rounded p-2 focus:ring-primary focus:border-primary" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input type="email" {...register('email')} className="w-full border border-gray-300 rounded p-2 focus:ring-primary focus:border-primary" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">City</label>
                <input {...register('city')} className="w-full border border-gray-300 rounded p-2 focus:ring-primary focus:border-primary" />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Event Type</label>
                <select {...register('eventType')} className="w-full border border-gray-300 rounded p-2 focus:ring-primary focus:border-primary">
                  <option value="">Select an event</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Valaikappu">Valaikappu (Baby Shower)</option>
                  <option value="Corporate">Corporate Event</option>
                  <option value="Other">Other</option>
                </select>
                {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Event Date</label>
                <input type="date" {...register('eventDate')} className="w-full border border-gray-300 rounded p-2 focus:ring-primary focus:border-primary" />
                {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Message Details</label>
              <textarea {...register('message')} rows={4} className="w-full border border-gray-300 rounded p-2 focus:ring-primary focus:border-primary"></textarea>
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>

            <button type="submit" disabled={isPending} className="w-full bg-primary text-white py-3 rounded hover:bg-opacity-90 transition-colors disabled:opacity-50">
              {isPending ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        )}
      </Container>
    </Section>
  );
};

export default Contact;
