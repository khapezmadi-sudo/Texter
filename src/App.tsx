import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Home } from "@/pages/Home";
import { Texts } from "@/pages/Texts";
import { NewText } from "@/pages/NewText";
import { TextDetail } from "@/pages/TextDetail";
import { Reading } from "@/pages/Reading";
import { ReadingDetail } from "@/pages/ReadingDetail";
import { Phrases } from "@/pages/Phrases";
import { PhrasePractice } from "@/pages/PhrasePractice";
import { Words } from "@/pages/Words";
import { WordDetail } from "@/pages/WordDetail";
import { WordPractice } from "@/pages/WordPractice";
import { Stats } from "@/pages/Stats";
import { Settings } from "@/pages/Settings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/texts"
            element={
              <ProtectedRoute>
                <Texts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/texts/new"
            element={
              <ProtectedRoute>
                <NewText />
              </ProtectedRoute>
            }
          />
          <Route
            path="/texts/:id"
            element={
              <ProtectedRoute>
                <TextDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reading"
            element={
              <ProtectedRoute>
                <Reading />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reading/:id"
            element={
              <ProtectedRoute>
                <ReadingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/phrases"
            element={
              <ProtectedRoute>
                <Phrases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/phrases/practice"
            element={
              <ProtectedRoute>
                <PhrasePractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/words"
            element={
              <ProtectedRoute>
                <Words />
              </ProtectedRoute>
            }
          />
          <Route
            path="/words/:id"
            element={
              <ProtectedRoute>
                <WordDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/words/practice"
            element={
              <ProtectedRoute>
                <WordPractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
