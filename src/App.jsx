import { JokeProvider } from "./contexts/JokeContext";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import JokeList from "./components/JokeList";
import Footer from "./components/Footer";

export default function App() {
  return (
    <JokeProvider>
      <div className="app">
        <Header />
        <main className="main">
          <div className="container">
            <SearchForm />
          </div>
        </main>
        <Footer />
      </div>
    </JokeProvider>
  );
}
