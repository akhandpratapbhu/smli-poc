import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import { motion } from "framer-motion";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6">
      <motion.h1
        className="text-5xl font-bold mb-4 drop-shadow-lg text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{color: "black", marginTop: "4px"}}
      >
        Welcome to <span className="text-yellow-300">SMLI DEMO</span>
      </motion.h1>

      <div style={{display: "flex", justifyContent: "center"}}>
        <motion.img
        
        src="https://images.jdmagicbox.com/quickquotes/images_main/sml-isuzu-prestige-gs-2515-pickup-truck-271956192-ufeha.png"
        alt="Demo"
        className="rounded-2xl shadow-xl w-full max-w-lg mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <Card className="bg-white text-gray-800 p-6 rounded-2xl shadow-2xl max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Experience the Future</h2>
          <p className="mb-6">Explore the cutting-edge features and seamless user experience of our demo platform.</p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button>
        </Card>
      </motion.div>
    </div>
  );
}
