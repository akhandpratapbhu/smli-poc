// Loader.tsx
import './Loader.css';
import mainLogo from "../../assets/smlLogo.png";
const Loader = () => (
    <div className="loader-overlay">
        <div className="loader-container">
            <img src={mainLogo} alt="Loading..." className="loader-image" />
            <div className="spinner"></div>
        </div>
    </div>
);

export default Loader;
