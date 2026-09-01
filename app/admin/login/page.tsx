"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AUTH_TOAST_KEY } from "@/components/AuthToast";
import "./login.css";

export default function AdminLoginPage(){
  const router=useRouter();
  const [showPassword,setShowPassword]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState("");

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=new FormData(event.currentTarget),email=String(form.get("email")||""),password=String(form.get("password")||"");
    if(!email.includes("@")||password.length<6){setError("Enter a valid email and a password with at least 6 characters.");return}
    setError("");setLoading(true);
    try{
      const response=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,remember:form.get("remember")==="on"})});
      const result=await response.json() as {error?:string};
      if(!response.ok){setError(result.error||"Unable to sign in.");setLoading(false);return}
      const requestedPath=new URLSearchParams(window.location.search).get("next");
      sessionStorage.setItem(AUTH_TOAST_KEY,JSON.stringify({message:"Logged in successfully.",type:"success"}));
      router.replace(requestedPath?.startsWith("/admin")?requestedPath:"/admin");router.refresh();
    }catch{setError("Could not reach the server. Please try again.");setLoading(false)}
  }

  return <main className="admin-login">
    <section className="login-visual">
      <Link href="/" className="login-logo"><Image src="/images/logo.png" alt="Eye Champ" width={175} height={58} priority/></Link>
      <div className="login-art"><span className="ring one"/><span className="ring two"/><div className="glasses-mark">⌁</div></div>
      <div className="login-message"><small>Eye Champ Administration</small><h1>Clarity for every<br/>part of your business.</h1><p>Manage products, orders, inventory, and customers from one focused workspace.</p><div><span><ShieldCheck size={17}/></span><p><strong>Secure administration</strong><small>Your workspace is protected with secure, server-side authentication.</small></p></div></div>
      <footer>© 2026 Eye Champ. All rights reserved.</footer>
    </section>
    <section className="login-panel">
      <div className="login-mobile-logo"><Link href="/"><Image src="/images/logo.png" alt="Eye Champ" width={145} height={48}/></Link></div>
      <div className="login-box">
        <div className="login-heading"><span>Admin portal</span><h1>Welcome back</h1><p>Sign in to manage your Eye Champ store.</p></div>
        <form onSubmit={submit} noValidate>
          <label><span>Email address</span><div><Mail size={17}/><input name="email" type="email" autoComplete="email" placeholder="admin@eyechamp.com" required/></div></label>
          <label><span><b>Password</b><a href="#">Forgot password?</a></span><div><LockKeyhole size={17}/><input name="password" type={showPassword?"text":"password"} autoComplete="current-password" placeholder="Enter your password" required/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
          <label className="remember"><input name="remember" type="checkbox" defaultChecked/><span>Keep me signed in on this device</span></label>
          {error&&<p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" disabled={loading}>{loading?<><i/> Signing in...</>:<>Sign in <ArrowRight size={16}/></>}</button>
        </form>
        <div className="login-divider"><span>or continue with</span></div>
        <button className="google-button" type="button" disabled title="Google Workspace sign-in is not configured"><span>G</span> Sign in with Google Workspace</button>
        <p className="login-help">Having trouble signing in? <a href="mailto:support@eyechamp.com">Contact support</a></p>
      </div>
      <footer><a href="#">Privacy policy</a><span>•</span><a href="#">Terms of use</a><span>•</span><a href="#">Help center</a></footer>
    </section>
  </main>
}
