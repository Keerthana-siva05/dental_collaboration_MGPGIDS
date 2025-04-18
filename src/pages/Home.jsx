
import Hero from "../components/Home/Hero"
import About from "../components/Home/About"
import Services from "../components/Home/Services"
import Contact from "../components/Home/Contact"
import Header from "../components/Home/Header"
import HomeSidebar from "../components/Sidebar/HomeSidebar"
import Footer from "../components/Home/Footer"
import { useState } from "react"



const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      <div className="relative min-h-screen bg-gray-100">
            <Header toggleSidebar={toggleSidebar} />
            <HomeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="pt-16 transition-all duration-300 ease-in-out">
             <Hero />
             <About />
             <Services />
             <Contact />
            </main>
            <Footer />
        </div>
    </>
  );
};

export default Home;