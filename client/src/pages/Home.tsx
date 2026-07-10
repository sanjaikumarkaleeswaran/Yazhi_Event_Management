import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { useTestimonials } from '../hooks/useTestimonials';
import { useGallery } from '../hooks/useGallery';

const Home = () => {
  const { data: testimonialsResponse, isLoading: isLoadingTestimonials } = useTestimonials();
  const { data: galleryResponse, isLoading: isLoadingGallery } = useGallery();

  const featuredTestimonials = testimonialsResponse?.data?.slice(0, 3) || [];
  const featuredGallery = galleryResponse?.data?.slice(0, 3) || [];

  return (
    <div>
      <Section className="bg-primary/5 min-h-[60vh] flex items-center">
        <Container>
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-heading text-primary font-bold mb-6">
              Turning every celebration into a lifetime memory.
            </h1>
            <p className="text-lg md:text-xl text-ink/80 mb-8 font-sans">
              Premium Tamil cultural event management tailored perfectly for you.
            </p>
            <a href="/contact" className="inline-block bg-primary text-background px-8 py-3 rounded-md font-medium hover:bg-opacity-90">
              Start Planning
            </a>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-3xl font-heading text-secondary text-center mb-12">Featured Gallery</h2>
          {isLoadingGallery ? (
            <p className="text-center">Loading gallery...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredGallery.map((item: any) => (
                <div key={item._id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                  <img src={item.imageUrl} alt={item.altText} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-ink/80 to-transparent p-4">
                    <p className="text-white font-medium">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section className="bg-primary/5">
        <Container>
          <h2 className="text-3xl font-heading text-secondary text-center mb-12">What Our Clients Say</h2>
          {isLoadingTestimonials ? (
            <p className="text-center">Loading testimonials...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTestimonials.map((testimonial: any) => (
                <div key={testimonial._id} className="bg-white p-6 rounded-lg border border-primary/10 shadow-sm">
                  <p className="italic text-ink/80 mb-4">"{testimonial.message}"</p>
                  <p className="font-bold text-primary">{testimonial.clientName}</p>
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default Home;
