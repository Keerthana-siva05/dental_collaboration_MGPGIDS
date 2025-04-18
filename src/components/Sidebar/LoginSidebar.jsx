import { X } from "lucide-react"
import { Link } from "react-router-dom"
// import "./header.css";
const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={` fixed top-0 left-0 z-50 h-full w-64 text-white transform transition-transform duration-300 ease-in-out sidebar_1 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors duration-200"
      >
        <X size={24} />
      </button>
      <nav className="mt-16 space-y-4 px-4">
        <a href="/" className="block py-2 hover:bg-blue-700 rounded transition-colors duration-200">
          Home
        </a>
        <Link to="/Login" className="block py-2 hover:bg-blue-700 rounded transition-colors duration-200">
          Student Login 
        </Link>
        <Link to="/facultylogin" className="block py-2 hover:bg-blue-700 rounded transition-colors duration-200">
          Faculty Login 
        </Link>
      </nav>
    </div>
  )
}

export default Sidebar

