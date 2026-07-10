import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { useTestimonials } from '../hooks/useTestimonials';
import { SEO } from '../components/common/SEO';

const Testimonials = () => {
  const { data, isLoading } = useTestimonials();
  const testimonials = data?.data || [];

  return (
    <Section>
      <SEO 
        title="Client Testimonials"
        description="Read what our clients have to say about their experience with Yazhi Event Management."
        canonicalUrl="/testimonials"
      />
      <Container>
        <h1 className="text-4xl font-heading text-primary mb-12 text-center">Client Stories</h1>
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial: any) => (
              <div key={testimonial._id} className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <div className="flex text-primary mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-ink/80 italic mb-6">"{testimonial.message}"</p>
                <p className="font-heading text-lg font-bold text-secondary">{testimonial.clientName}</p>
                <p className="text-sm text-ink/60">{testimonial.eventType}</p>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
};

export default Testimonials;
