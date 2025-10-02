function fmt(x, d=6){ if(!isFinite(x))return String(x);
  const a=Math.abs(x); return (a!==0&&(a<1e-3||a>=1e4))?x.toExponential(3):Number(x.toFixed(d)).toString(); }

function regimeFromK(K,K1,K2){ if(K<K1) return {name:"Stokes",b1:24,n:1};
  if(K<K2) return {name:"Intermédiaire",b1:18.5,n:0.6}; return {name:"Newton",b1:0.44,n:0}; }

function compute(){
  const D=parseFloat(D_.value), rho_p=parseFloat(rho_p_.value),
        rho=parseFloat(rho_.value), mu=parseFloat(mu_.value),
        g=parseFloat(g_.value), ae=parseFloat(aK_.value||1),
        K1=parseFloat(K1_.value||3.3), K2=parseFloat(K2_.value||43.6),
        Kmax=parseFloat(Kmax_.value||2360);

  if([D,rho_p,rho,mu,g].some(v=>!isFinite(v)||v<=0)){ results.textContent="Enter positive numbers."; return; }
  const delta=rho_p-rho; if(delta<=0){ results.textContent="ρp must be > ρ."; return; }

  // --- K EXACTLY AS SLIDE ---
  const K = D * Math.cbrt( ae * rho * delta / (mu*mu) );

  const reg=regimeFromK(K,K1,K2), b1=reg.b1, n=reg.n;

  // --- vt EXACTLY AS SLIDE ---
  // vt = [ 4 ae D^(1+n) (rho_p - rho) / (3 b1 mu^n rho^(1-n)) ]^(1/(2-n))
  const vt = Math.pow(
      (4*ae*Math.pow(D,1+n)*delta) / (3*b1*Math.pow(mu,n)*Math.pow(rho,1-n)),
      1/(2-n)
    );

  // Reynolds & Cd
  const Re = rho*vt*D/mu;
  const Cd = b1/Math.pow(Re,n);

  // --- Ft EXACTLY AS SLIDE ---
  // Ft = (pi/8) * b1 * mu^n * rho^(1-n) * (D*vt)^(2-n)
  const Ft = (Math.PI/8) * b1 * Math.pow(mu,n) * Math.pow(rho,1-n) * Math.pow(D*vt,2-n);

  const note = K> Kmax ? ` (K>${fmt(Kmax)}; still Newton correlation applied)` : "";
  results.textContent = [
    `INPUTS`,
    `D = ${fmt(D)} m`,
    `ρp = ${fmt(rho_p)} kg/m³,  ρ = ${fmt(rho)} kg/m³`,
    `μ = ${fmt(mu)} Pa·s,  g = ${fmt(g)} m/s²,  a_e = ${fmt(ae)}`,
    ``,
    `K = D * [ a_e ρ(ρp−ρ) / μ² ]^(1/3) = ${fmt(K)}${note}`,
    `Regime = ${reg.name}  ⇒  b₁=${b1}, n=${n}`,
    ``,
    `v_t = ${fmt(vt)} m/s`,
    `Re = ${fmt(Re)}`,
    `C_d = ${fmt(Cd)}`,
    `F_t = ${fmt(Ft)} N  (π/8 · b₁ μ^n ρ^(1−n) (D v_t)^(2−n))`
  ].join("\n");
}

// wiring
const D_=document.getElementById('D'), rho_p_=document.getElementById('rho_p'),
      rho_=document.getElementById('rho'), mu_=document.getElementById('mu'),
      g_=document.getElementById('g'), aK_=document.getElementById('aK'),
      K1_=document.getElementById('K1'), K2_=document.getElementById('K2'),
      Kmax_=document.getElementById('Kmax'), results=document.getElementById('results');

document.getElementById('calc-form').addEventListener('submit', e=>{ e.preventDefault(); compute(); });
document.getElementById('demo').addEventListener('click', ()=>{ D_.value=0.001; rho_p_.value=2650; rho_.value=1000; mu_.value=0.001; g_.value=9.81; aK_.value=1; compute(); });
