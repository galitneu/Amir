import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { postEstablishSession } from "../endpoints/auth/establish_session_POST.schema";
import styles from "./login.module.css";

const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" };
const btnStyle = { padding: "12px", borderRadius: "8px", border: "none", background: "#8a6d4a", color: "white", fontSize: "16px", cursor: "pointer", marginTop: "8px" };
const linkStyle = { background: "none", border: "none", color: "#8a6d4a", cursor: "pointer", fontSize: "14px", marginTop: "12px", textDecoration: "underline" };

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const { onLogin } = useAuth();
  const navigate = useNavigate();
  const h = React.createElement;

  const doLogin = async (e: any) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const result = await postEstablishSession({ email, password });
      if ("error" in result) { setError(result.error); setLoading(false); return; }
      onLogin((result as any).user); navigate("/admin");
    } catch (err) { setError(err instanceof Error ? err.message : "Login error"); setLoading(false); }
  };

  const doChange = async (e: any) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const result = await postEstablishSession({ email, currentPassword, newPassword });
      if ("error" in result) { setError(result.error); setLoading(false); return; }
      setInfo("Password updated. Sign in with your new password.");
      setMode("login"); setPassword(""); setCurrentPassword(""); setNewPassword(""); setLoading(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); setLoading(false); }
  };

  const field = (label: string, type: string, value: string, setter: (v: string) => void, ac: string) =>
    h("label", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
      h("span", null, label),
      h("input", { type, value, onChange: (e: any) => setter(e.target.value), required: true, autoComplete: ac, style: inputStyle }));

  const msgs = [
    error ? h("p", { key: "e", style: { color: "#c0392b", margin: 0 } }, error) : null,
    info ? h("p", { key: "i", style: { color: "#2e7d32", margin: 0 } }, info) : null,
    ];

  const body = mode === "login"
  ? h("form", { onSubmit: doLogin, style: { display: "flex", flexDirection: "column", gap: "12px" } },
      field("Email", "email", email, setEmail, "username"),
      field("Password", "password", password, setPassword, "current-password"),
      ...msgs,
      h("button", { type: "submit", disabled: loading, style: btnStyle }, loading ? "..." : "Sign in"),
      h("button", { type: "button", onClick: () => { setMode("change"); setError(""); setInfo(""); }, style: linkStyle }, "Change password"))
    : h("form", { onSubmit: doChange, style: { display: "flex", flexDirection: "column", gap: "12px" } },
        field("Email", "email", email, setEmail, "username"),
        field("Current password", "password", currentPassword, setCurrentPassword, "current-password"),
        field("New password", "password", newPassword, setNewPassword, "new-password"),
        ...msgs,
        h("button", { type: "submit", disabled: loading, style: btnStyle }, loading ? "..." : "Update password"),
        h("button", { type: "button", onClick: () => { setMode("login"); setError(""); setInfo(""); }, style: linkStyle }, "Back to sign in"));

  return h("div", { className: styles.pageContainer },
           h("div", { className: styles.loginCard },
             h("h1", { className: styles.title }, mode === "login" ? "Admin Login" : "Change Password"),
             h("p", { className: styles.subtitle }, mode === "login" ? "Sign in with your email and password." : "Enter your email, current password, and a new password."),
             body,
             mode === "login" ? h("p", { style: { fontSize: "13px", color: "#888", marginTop: "16px" } }, "First time? The password you enter will become your permanent password.") : null
             )
           );
};

export default LoginPage;
