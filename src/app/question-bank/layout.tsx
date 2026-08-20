import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function QuestionBankLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
