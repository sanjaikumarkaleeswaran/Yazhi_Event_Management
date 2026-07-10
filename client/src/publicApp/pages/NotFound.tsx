import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Section className="min-h-[70vh] flex items-center justify-center text-center">
      <Container>
        <h1 className="text-6xl font-heading text-primary font-bold mb-4">404</h1>
        <p className="text-xl text-ink/80 mb-8">The page you are looking for does not exist.</p>
        <Link to="/" className="bg-primary text-white px-8 py-3 rounded-md">
          Return Home
        </Link>
      </Container>
    </Section>
  );
};

export default NotFound;
