import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { usePackages } from '../../shared/hooks/usePackages';
import { SEO } from '../../shared/components/SEO';

const Packages = () => {
  const { data, isLoading } = usePackages();
  const packages = data?.data || [];

  return (
    <Section>
      <SEO 
        title="Event Packages"
        description="View our transparent and premium event management packages."
        canonicalUrl="/packages"
      />
      <Container>
        <h1 className="text-4xl font-heading text-primary mb-12 text-center">Our Packages</h1>
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg: any) => (
              <div key={pkg._id} className={`bg-white border rounded-lg p-8 shadow-sm flex flex-col ${pkg.isPopular ? 'border-primary shadow-primary/20' : 'border-gray-200'}`}>
                {pkg.isPopular && <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">Most Popular</span>}
                <h2 className="text-2xl font-heading text-secondary mb-2">{pkg.title}</h2>
                <p className="text-sm text-ink/60 mb-6">{pkg.eventType}</p>
                <div className="text-3xl font-bold text-ink mb-6">₹{pkg.startingPrice.toLocaleString()}<span className="text-sm font-normal text-ink/60"> / starts at</span></div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {pkg.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className="text-primary mr-2">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <a href="/contact" className="block text-center w-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-medium py-3 rounded transition-colors">
                  Enquire Now
                </a>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
};

export default Packages;
