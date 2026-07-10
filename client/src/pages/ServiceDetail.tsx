import { useParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { SEO } from '../components/common/SEO';

const ServiceDetail = () => {
  const { type } = useParams<{ type: string }>();

  return (
    <Section>
      <SEO 
        title={`${type?.replace('-', ' ').toUpperCase()} Services`}
        description={`Detailed information about our ${type?.replace('-', ' ')} planning services.`}
        canonicalUrl={`/services/${type}`}
      />
      <Container>
        <h1 className="text-4xl font-heading text-primary mb-6 capitalize">{type?.replace('-', ' ')}</h1>
        <p className="text-lg">Detailed information and gallery for {type} events will go here.</p>
      </Container>
    </Section>
  );
};

export default ServiceDetail;
