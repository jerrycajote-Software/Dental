import React from 'react';
import { Shield, Sparkles, Baby, PhoneCall, CheckCircle, Clock, Heart, DollarSign } from 'lucide-react';

const whyChooseUs = [
  {
    title: 'Experienced Team',
    description: 'Our dentists have over 10 years of experience.',
    icon: CheckCircle,
  },
  {
    title: 'Modern Technology',
    description: 'Digital X-rays, intraoral cameras, and laser dentistry.',
    icon: CheckCircle,
  },
  {
    title: 'Comfortable Environment',
    description: 'Relaxing atmosphere to ease your dental anxiety.',
    icon: CheckCircle,
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden fees. We work with most insurance plans.',
    icon: CheckCircle,
  },
];

const services = [
  {
    title: 'General Dentistry',
    description: 'Routine checkups, cleanings, and fillings to maintain oral health.',
    icon: Shield,
  },
  {
    title: 'Cosmetic Dentistry',
    description: 'Teeth whitening, veneers, and bonding for a perfect smile.',
    icon: Sparkles,
  },
  {
    title: 'Orthodontics',
    description: 'Braces and aligners to straighten teeth and correct bites.',
    icon: CheckCircle,
  },
  {
    title: 'Pediatric Dentistry',
    description: 'Specialized care for children in a friendly environment.',
    icon: Baby,
  },
  {
    title: 'Emergency Care',
    description: 'Immediate treatment for toothaches and dental injuries.',
    icon: PhoneCall,
  },
  {
    title: 'Dental Implants',
    description: 'Permanent solution for missing teeth with a natural look.',
    icon: CheckCircle,
  },
];

const Home = () => {
  return (
    <div className="bg-[#f8fbff] text-slate-900 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 bg-gradient-to-b from-[#1a237e] to-[#42a5f5]">
        {/* Abstract Background  */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container relative z-10 flex flex-col items-center gap-16 px-4 mx-auto lg:flex-row">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-bold text-white border rounded-full bg-white/20 border-white/30">
              <span className="flex h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span>Accepting New Patients</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6 text-white">
              Experience the Best <br />
              <span className="text-blue-100">Dental Care</span>
            </h1>

            <p className="max-w-xl mx-auto mb-10 text-lg font-medium leading-relaxed md:text-xl text-blue-50 lg:mx-0">
              Transform your smile with advanced technology and compassionate care. 
              Our expert team is dedicated to your oral health and comfort.
            </p>

            <div className="flex flex-wrap justify-center gap-5 lg:justify-start">
              <button className="group relative rounded-full bg-white px-8 py-4 text-base font-black text-[#1a237e] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                Book Appointment
              </button>
              <button className="px-8 py-4 text-base font-black text-white transition-all duration-300 bg-transparent border-2 border-white rounded-full hover:bg-white/10 hover:-translate-y-1">
                View Services
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-lg">
            <div className="relative rounded-[3rem] bg-white/20 p-2 shadow-2xl backdrop-blur-sm group">
              <div className="h-80 md:h-[450px] rounded-[2.8rem] bg-white overflow-hidden relative border-4 border-white/50">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a237e]/40 via-transparent to-transparent" />
              </div>

              <div className="absolute flex items-center max-w-xs gap-5 p-6 bg-white border border-blue-100 shadow-2xl -bottom-10 -left-6 md:-left-10 rounded-3xl animate-bounce-subtle">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a1c4fd]/20 text-[#1a237e] shadow-inner">
                  <Shield size={28} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">Certified Experts</div>
                  <div className="text-sm font-bold text-slate-500">10+ Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-32 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-[#1a237e] font-black tracking-widest text-sm mb-4 uppercase">
              OUR SPECIALIZED SERVICES
            </h2>
            <h3 className="mb-6 text-4xl font-black tracking-tight md:text-5xl text-slate-900">
              Comprehensive Dental Care
            </h3>
            <p className="max-w-2xl mx-auto text-lg font-bold leading-relaxed text-slate-600">
              We provide a full spectrum of dental treatments tailored to your unique needs, 
              ensuring a healthy, beautiful smile for a lifetime.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group relative rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:border-[#a1c4fd]/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#a1c4fd]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#a1c4fd]/10 transition-colors" />
                
                <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a1c4fd]/10 text-[#1a237e] group-hover:scale-110 group-hover:bg-[#1a237e] group-hover:text-white transition-all duration-500 shadow-lg">
                  <Icon size={28} />
                </div>
                
                <h4 className="mb-4 text-2xl font-black text-slate-900 tracking-tight group-hover:text-[#1a237e] transition-colors">
                  {title}
                </h4>
                <p className="mb-8 font-bold leading-relaxed text-slate-600">
                  {description}
                </p>
                
                <button className="flex items-center gap-2 text-sm font-black text-[#1a237e] group-hover:gap-3 transition-all">
                  <span>Learn more</span>
                  <span className="text-lg">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-32 relative overflow-hidden bg-[#f0f7ff]">
        <div className="container relative z-10 px-4 mx-auto">
          <div className="flex flex-col items-center gap-20 lg:flex-row">
            {/* Image Column */}
            <div className="relative w-full lg:w-1/2">
              <div className="aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative border border-white group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a237e]/40 via-transparent to-transparent" />
                
                <div className="absolute z-10 p-8 border border-white shadow-2xl bottom-12 left-12 right-12 rounded-3xl bg-white/80 backdrop-blur-xl text-slate-900">
                  <h4 className="mb-2 text-2xl font-black tracking-tight">State-of-the-art Facilities</h4>
                  <p className="font-bold text-slate-600">Experience dental care in a luxury, modern environment designed for your comfort.</p>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-[#1a237e] font-black tracking-widest text-sm mb-4 uppercase">
                THE DENTCARE PLUS ADVANTAGE
              </h2>
              <h3 className="mb-8 text-4xl font-black tracking-tight md:text-5xl text-slate-900">
                Why Choose Our Clinic?
              </h3>
              <p className="mb-12 text-lg font-bold leading-relaxed text-slate-600">
                We blend clinical excellence with a five-star patient experience. 
                Discover why thousands of patients trust us with their smiles.
              </p>

              <div className="grid gap-8 sm:grid-cols-2">
                {whyChooseUs.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="flex flex-col gap-4 p-6 rounded-3xl bg-white border border-blue-50 hover:border-[#a1c4fd]/30 transition-colors shadow-sm hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a1c4fd]/10 text-[#1a237e] shadow-lg">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-xl font-black tracking-tight text-slate-900">{title}</h4>
                      <p className="text-sm font-bold leading-relaxed text-slate-500">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
