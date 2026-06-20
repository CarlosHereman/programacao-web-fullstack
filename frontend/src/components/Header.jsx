import { useAuth } from "../contexts/AuthContext";

/**
 * Cabeçalho da aplicação.
 * Exibe o nome do usuário logado e o botão de logout quando autenticado.
 */
export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="header__inner">
        <div>
          <h1 className="header__title">Piadocas</h1>
          <p className="header__subtitle">Buscador de piadas com backend próprio</p>
        </div>
        {isAuthenticated && (
          <div className="header__user">
            <span className="header__username">Olá, <strong>{user?.username}</strong></span>
            <button className="btn btn--logout" onClick={logout}>
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
