import { Link } from 'react-router-dom';
import { Scan, Brain, BookOpen, Bluetooth as Tooth, Sparkles, MapPin } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import TeamMember from '../components/TeamMember';

const teamMembers = [
  {
    name: 'Ezraliano Sachio Krisnadiva',
    role: 'Lead Developer',
    imageUrl: '/Foto Ezraliano.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/ezraliano-sachio-krisnadiva-358028241/',
    bio: 'Full-stack developer specializing in AI Engineer and Web Development.'
  },
  {
    name: 'Farhan Rasyad',
    role: 'AI Engineer',
    imageUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600',
    linkedinUrl: 'https://www.linkedin.com/in/farhanrasyad/',
    bio: 'Expert in machine learning and computer vision for medical applications.'
  },
  {
    name: 'Margareta Lola Lali Lulita',
    role: 'Data Scientist',
    imageUrl: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=600',
    linkedinUrl: 'https://linkedin.com/in/margareta-lola',
    bio: 'Specialized in data analysis and visualization for healthcare.'
  },
  {
    name: 'Muhammad Rafi Ilham',
    role: 'AI Engineer',
    imageUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
    linkedinUrl: 'https://www.linkedin.com/in/muhammad-rafi-ilham/',
    bio: 'Specialized in AI algorithms and deep learning for image processing.'
  }
];

const HomePage = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary-500 to-purple-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI-Powered Dental Education Platform
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Learn about dental health, analyze dental images with AI, and discover the best dental clinics in Jakarta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="btn bg-white text-primary-600 hover:bg-gray-100"
              >
                Upload Image
              </Link>
              <Link
                to="/clinics"
                className="btn bg-transparent text-white border border-white hover:bg-white/10"
              >
                Find Clinics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Dencation Helps You</h2>
            <p className="text-gray-600">
              Our comprehensive platform combines AI technology with educational resources and clinic discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              title="AI Analysis"
              description="Upload dental images and get instant AI analysis of potential issues."
              icon={Scan}
            />
            <FeatureCard
              title="Smart Detection"
              description="Our advanced AI algorithms detect various dental conditions with high accuracy."
              icon={Brain}
              color="bg-blue-100 text-blue-600"
            />
            <FeatureCard
              title="Educational Content"
              description="Learn about dental conditions, their causes, and recommended treatments."
              icon={BookOpen}
              color="bg-green-100 text-green-600"
            />
            <FeatureCard
              title="Clinic Finder"
              description="Discover and locate the best dental clinics in Jakarta with detailed information."
              icon={MapPin}
              color="bg-purple-100 text-purple-600"
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-600">
              The talented developers behind Dencation's innovation and success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <TeamMember key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-primary-50 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to explore dental health?
                </h2>
                <p className="text-gray-600 mb-6">
                  Start your journey with AI-powered dental analysis or find the perfect clinic near you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/upload"
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <Tooth size={18} />
                    Start Analysis
                  </Link>
                  <Link
                    to="/clinics"
                    className="btn btn-secondary inline-flex items-center gap-2"
                  >
                    <MapPin size={18} />
                    Find Clinics
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 bg-primary-100 p-8 md:p-12 flex items-center justify-center">
                <img
                  src="https://images.pexels.com/photos/3779709/pexels-photo-3779709.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Dental check"
                  className="rounded-lg max-h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;