import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { useTestimonials } from '../hooks/useTestimonials';
import { useGallery } from '../hooks/useGallery';
import { TextReveal } from '../components/animated/TextReveal';
import { ScrollReveal } from '../components/animated/ScrollReveal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SEO } from '../components/common/SEO';

const Home = () => {
  const { data: testimonialsResponse, isLoading: isLoadingTestimonials } = useTestimonials();
  const { data: galleryResponse, isLoading: isLoadingGallery } = useGallery();

  const featuredTestimonials = testimonialsResponse?.data?.slice(0, 3) || [];
  const featuredGallery = galleryResponse?.data?.slice(0, 3) || [];

  const services = [
    { title: 'Tamil Weddings', desc: 'Authentic traditions woven into modern elegance.', icon: '✨' },
    { title: 'Milestones', desc: 'Birthdays, Anniversaries & Valaikappu.', icon: '🎉' },
    { title: 'Corporate', desc: 'Professional event execution for your brand.', icon: '🏢' },
  ];

  return (
    <div className="overflow-hidden">
      <SEO 
        title="Premium Tamil Wedding Planner"
        description="Yazhi Event Management offers premium Tamil cultural event planning, specializing in weddings, birthdays, and corporate events."
        canonicalUrl="/"
        schema={{
          "@context": "https://schema.org",
          "@type": "EventService",
          "name": "Yazhi Event Management",
          "url": "https://yazhievents.com",
          "description": "Premium Tamil cultural event management."
        }}
      />
      {/* Hero Section */}
      <Section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-background via-white to-primary/5">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-bl-[100px] -z-10 blur-3xl opacity-50"></div>
        
        <Container>
          <div className="max-w-3xl">
            <TextReveal 
              text="Turning every celebration into a lifetime memory."
              className="text-5xl md:text-7xl font-heading text-ink font-bold mb-6 leading-tight"
              as="h1"
            />
            <ScrollReveal delay={0.3}>
              <p className="text-lg md:text-2xl text-ink/70 mb-10 font-sans max-w-2xl leading-relaxed">
                Premium Tamil cultural event management tailored perfectly for your unique story. We handle the details, you enjoy the moment.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button to="/contact" variant="primary">Book a Consultation</Button>
                <Button to="/gallery" variant="outline">View Our Work</Button>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </Section>

      {/* Featured Services */}
      <Section className="bg-white relative">
        <Container>
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Our Expertise</span>
              <h2 className="text-4xl md:text-5xl font-heading text-secondary">Crafting Perfect Moments</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1}>
                <Card className="p-8 h-full flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-heading text-ink mb-3">{service.title}</h3>
                  <p className="text-ink/70">{service.desc}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Featured Gallery */}
      <Section className="bg-background">
        <Container>
          <ScrollReveal direction="left">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Portfolio</span>
                <h2 className="text-4xl md:text-5xl font-heading text-secondary">Featured Gallery</h2>
              </div>
              <div className="hidden md:block">
                <Button to="/gallery" variant="outline">View All</Button>
              </div>
            </div>
          </ScrollReveal>

          {isLoadingGallery ? (
            <div className="flex justify-center py-12"><div className="animate-pulse w-12 h-12 bg-primary/20 rounded-full"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredGallery.map((item: any, idx: number) => (
                <ScrollReveal key={item._id} delay={idx * 0.1} direction="up">
                  <Card hoverEffect={false} className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-none border-none">
                    <img 
                      src={item.imageUrl} 
                      alt={item.altText} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      loading="lazy" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <p className="text-primary text-sm font-bold tracking-wider uppercase mb-1">{item.eventType}</p>
                      <p className="text-white font-heading text-xl">{item.title}</p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
             <Button to="/gallery" variant="outline">View All</Button>
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section className="bg-white">
        <Container>
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Testimonials</span>
              <h2 className="text-4xl md:text-5xl font-heading text-secondary">What Our Clients Say</h2>
            </div>
          </ScrollReveal>

          {isLoadingTestimonials ? (
            <div className="flex justify-center py-12"><div className="animate-pulse w-12 h-12 bg-primary/20 rounded-full"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTestimonials.map((testimonial: any, idx: number) => (
                <ScrollReveal key={testimonial._id} delay={idx * 0.1}>
                  <Card className="p-8 h-full bg-background/50">
                    <div className="flex text-primary mb-6 text-xl">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p className="italic text-ink/80 mb-8 leading-relaxed font-sans text-lg">"{testimonial.message}"</p>
                    <div>
                      <p className="font-bold text-secondary font-heading text-xl">{testimonial.clientName}</p>
                      <p className="text-sm text-primary uppercase tracking-wider mt-1">{testimonial.eventType}</p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default Home;
