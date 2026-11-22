import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import CharacterSelection from "./pages/CharacterSelection";
import Dashboard from "./pages/Dashboard";
import { useMember } from "./context/MemberContext";

function ProtectedDashboard() {
  const { selectedMember } = useMember();

  if (!selectedMember) {
    return (
      <Navigate
        to="/select-character"
        replace
      />
    );
  }

  return <Dashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to="/select-character"
              replace
            />
          }
        />

        <Route
          path="/select-character"
          element={<CharacterSelection />}
        />

        <Route
          path="/dashboard"
          element={<ProtectedDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;