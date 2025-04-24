import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#f6f6f6" }}>
  
      <div className="container">
      <Link style={{ textDecoration: "none" ,color:"red"}} to="/welcomepage">SMLI- DEMO</Link>
      <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Master</Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/about">Privacy</Link>
            </li> */}
            <li className="nav-item">
              <Link className="nav-link" to="/AddFormDataList">Add Master Data</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
