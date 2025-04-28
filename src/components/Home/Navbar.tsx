import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import mainLogo from "../../assets/smlLogo.png";
const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#ea3434", height: "60px" }}>
  
      <div className="container-fluid">
        <img src={mainLogo} className="img-logo" />
      
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
            <li className="nav-item" >
              <Link className="nav-link" style={{color: "white"}} to="/">Masters Management</Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/about">Privacy</Link>
            </li> */}
            <li className="nav-item" >
              <Link className="nav-link" style={{color: "white"}} to="/AddFormDataList">Add Master Data</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
