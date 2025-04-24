

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MaterialTableFormData from "../src/components/Home/Index";
import Navbar from "../src/components/Home/Navbar";
import EIndex from "../src/components/Employee/Index";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min'; 
import SparePartSaleInvoiceTable from './components/Home/griddata'
import Sidebar from './components/Home/sidebar/sidebar'
import VerticalLinearStepper from './components/Home/getform'
import MaterialCardFormData from "./components/Home/AllFormsList";
import ViewDetails from "./components/Home/viewDetails";
import WelcomePage from "./components/Home/welcomePage";
function App() {
  return (
    <Router>
      <div className="container-fluid">
        <div className="row">
          {/* Full-width Navbar */}
          <div className="col-12"style={{ backgroundColor: "#ea3434" }}>
            <Navbar />
          </div>
        </div>

        <div className="row" style={{ height: "calc(100vh - 60px)" }}>
          {/* Sidebar on left */}
          <div className="col-2 p-0" style={{ height: "calc(100vh - 60px)",backgroundColor: "#f6f6f6" }}>
            <Sidebar />
          </div>

          {/* Main content on right */}
          {/* backgroundColor: "rgb(225 225 225)"  */}
          <div className="col-10" style={{ overflow: "hidden", height: "calc(100vh - 60px)"}}>
            <Routes>
              <Route path="/" element={<MaterialTableFormData />} />
              <Route path="/AddFormDataList" element={<MaterialCardFormData />} />
              <Route path="/employee/index/:id" element={<EIndex />} />
              <Route path="/employee/addFormData/:id" element={<VerticalLinearStepper />} />
              <Route path="/allGrid/:id" element={<SparePartSaleInvoiceTable />} />
              <Route
                path='/viewDetails/:id'
                element={<ViewDetails />} /> ,
              <Route
                path='/welcomepage'
                element={<WelcomePage />} /> ,

            </Routes>
          </div>
        </div>
      </div>
    </Router>

  );
}

export default App;
