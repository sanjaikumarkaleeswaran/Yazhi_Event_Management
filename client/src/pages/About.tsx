import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { useTeam } from '../hooks/useTeam';

const About = () => {
  const { data: teamResponse, isLoading } = useTeam();
  const team = teamResponse?.data || [];

  return (
    <div>
      <Section className="bg-primary/5">
        <Container>
          <h1 className="text-4xl font-heading text-primary mb-6">About Yazhi</h1>
          <p className="text-lg max-w-3xl">
            We specialize in Tamil cultural events, weaving tradition with modern elegance to bring your visions to life.
          </p>
        </Container>
      </Section>
      <Section>
        <Container>
          <h2 className="text-3xl font-heading text-secondary mb-8 text-center">Meet the Team</h2>
          {isLoading ? (
            <p className="text-center">Loading team...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member: any) => (
                <div key={member._id} className="bg-white rounded-lg p-6 shadow-sm border border-primary/10">
                  <div className="aspect-square bg-gray-100 rounded-full w-32 h-32 mx-auto mb-4 overflow-hidden">
                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-heading text-center text-ink">{member.name}</h3>
                  <p className="text-primary text-center font-medium mb-4">{member.role}</p>
                  <p className="text-ink/80 text-center text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default About;
