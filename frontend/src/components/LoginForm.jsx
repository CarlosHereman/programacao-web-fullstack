import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

/**
 * Componente de formulário de login.
 * Autentica o usuário via API do backend e armazena o token JWT em memória.
 */
export default function LoginForm() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(data) {
    setServerError(null);
    try {
      await login(data.username, data.password);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Erro ao conectar com o servidor. Verifique sua conexão.";
      setServerError(msg);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-card__header">
          <h1 className="login-card__title">Piadocas</h1>
          <p className="login-card__subtitle">Faça login para acessar o buscador de piadas</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && (
            <div className="login-error" role="alert">
              {serverError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Usuário <span className="required">*</span>
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Digite seu usuário"
              className={`form-control ${errors.username ? "form-control--error" : ""}`}
              {...register("username", {
                required: "O nome de usuário é obrigatório.",
                maxLength: { value: 50, message: "Nome de usuário muito longo." },
              })}
            />
            {errors.username && (
              <span className="error-msg">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha <span className="required">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              className={`form-control ${errors.password ? "form-control--error" : ""}`}
              {...register("password", {
                required: "A senha é obrigatória.",
                minLength: { value: 4, message: "Senha muito curta." },
              })}
            />
            {errors.password && (
              <span className="error-msg">{errors.password.message}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>

        <p className="login-card__hint">
          Usuários disponíveis: <strong>abner</strong>, <strong>carlos</strong> ou <strong>admin</strong> (senha: <em>senha123</em> / <em>admin123</em>)
        </p>
      </div>
    </div>
  );
}
