import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { JokeProvider } from "./contexts/JokeContext";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import JokeList from "./components/JokeList";
import InsertForm from "./components/InsertForm";
import LoginForm from "./components/LoginForm";
import Footer from "./components/Footer";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("search");

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <JokeProvider>
      <div className="app">
        <Header />
        <main className="main">
          <div className="container">
            <nav className="tab-nav">
              <button
                className={`tab-btn ${activeTab === "search" ? "tab-btn--active" : ""}`}
                onClick={() => setActiveTab("search")}
              >
                Buscar Piadas
              </button>
              <button
                className={`tab-btn ${activeTab === "insert" ? "tab-btn--active" : ""}`}
                onClick={() => setActiveTab("insert")}
              >
                Inserir Piada
              </button>
            </nav>

            {activeTab === "search" ? (
              <>
                <SearchForm />
                <JokeList />
              </>
            ) : (
              <InsertForm />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </JokeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
