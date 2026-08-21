import FeatureStrip from "@/components/public/FeatureStrip";
import Footer from "@/components/public/Footer";
import Hero from "@/components/public/Hero";
import HowItWorks from "@/components/public/HowItWorks";
import MentorsPreview from "@/components/public/MentorsPreview";
import Navbar from "@/components/public/Navbar";
import SubjectsPreview from "@/components/public/SubjectsPreview";
import SubscriptionCTA from "@/components/public/SubscriptionCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <FeatureStrip />
        <HowItWorks />
        <SubjectsPreview />
        <MentorsPreview />
        <SubscriptionCTA />
      </main>

      <Footer />
    </>
  );
}

{/* comment 
  
  */}