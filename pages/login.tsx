import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { postEstablishSession } from "../endpoints/auth/establish_session_POST.schema";
import styles from "./login.module.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { onLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await postEstablishSession({ email, password });
      if ("error" in result) { setError(result.error); setLoading(false); return; }
      onLogin(result.user);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login error");
      setLoading(false);
    }
  };

  const h = React.createElement;
  const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" };
  return h("div", { className: styles.pageContainer },
           h("div", { className: styles.loginCard },
             h("h1", { className: styles.title }, "Admin Login"),
             h("p", { className: styles.subtitle }, "Sign in with your email and password."),
             h("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: "12px" } },
               h("label", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                 h("span", null, "Email"),
                 h("input", { type: "email", value: email, onChange: (e: any) => setEmail(e.target.value), required: true, autoComplete: "username", style: inputStyle })
                 ),
               h("label", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                 h("span", null, "Password"),
                 h("input", { type: "password", value: password, onChange: (e: any) => setPassword(e.target.value), required: true, autoComplete: "current-password", style: inputStyle })
                 ),
               error ? h("p", { style: { color: "#c0392b", margin: 0 } }, error) : null,
               h("button", { type: "submit", disabled: loading, style: { padding: "12px", borderRadius: "8px", border: "none", background: "#8a6d4a", color: "white", fontSize: "16px", cursor: "pointer", marginTop: "8px" } }, loading ? "..." : "Sign in")
               ),
             h("p", { style: { fontSize: "13px", color: "#888", marginTop: "16px" } }, "First time? The password you enter will become your permanent password.")
             )
           );
};

export default LoginPage;
