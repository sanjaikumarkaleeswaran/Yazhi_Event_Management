import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Link } from 'react-router-dom';

const Services = () => {
  const servicesList = [
    { id: 'weddings', title: 'Tamil Weddings', desc: 'Muhurtham, Reception, Engagement' },
    { id: 'birthdays', title: 'Birthdays', desc: 'First birthdays and milestones' },
    { id: 'other-events', title: 'Other Life Events', desc: 'Valaikappu, Gruhapravesam' },
  ];

  return (
    <Section>
      <Container>
        <h1 className="text-4xl font-heading text-primary mb-12 text-center">Our Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesList.map(service => (
            <Link key={service.id} to={`/services/${service.id}`} className="block group">
              <div className="bg-primary/5 p-8 rounded-lg h-full border border-primary/20 transition-all hover:bg-primary hover:text-white">
                <h2 className="text-2xl font-heading text-secondary group-hover:text-white mb-4">{service.title}</h2>
                <p className="text-ink/70 group-hover:text-white/90">{service.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Services;
