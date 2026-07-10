import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { useGallery } from '../hooks/useGallery';

const Gallery = () => {
  const { data, isLoading } = useGallery();
  const items = data?.data || [];

  return (
    <Section>
      <Container>
        <h1 className="text-4xl font-heading text-primary mb-12 text-center">Event Gallery</h1>
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <div key={item._id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                <img src={item.imageUrl} alt={item.altText} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
};

export default Gallery;
