import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Form1 from "./pages/Form1";
import Form2 from "./pages/Form2";
import About from "./pages/About"; // Import About Page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/Form1" element={<Form1 />} />
        <Route path="/Form2" element={<Form2 />} />
        <Route path="/about" element={<About />} /> {/* Add About Route */}
      </Routes>
    </Router>
  );
}

export default App;
