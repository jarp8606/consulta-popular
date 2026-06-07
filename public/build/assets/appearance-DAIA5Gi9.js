import{r as o,j as e,L as h}from"./app-DEpNC5qE.js";import{a as c,c as p}from"./app-logo-icon-INfT8oJt.js";import{S as u,H as y}from"./layout-D2rqrUs0.js";import{A as g}from"./app-layout-OUuoOS4n.js";import"./index-BaAwVv4X.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21",key:"1svkeh"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21",key:"vw1qmm"}]],k=c("Monitor",x);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]],b=c("Moon",f);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],v=c("Sun",j),A=()=>window.matchMedia("(prefers-color-scheme: dark)").matches,i=t=>{const n=t==="dark"||t==="system"&&A();document.documentElement.classList.toggle("dark",n)},M=window.matchMedia("(prefers-color-scheme: dark)"),S=()=>{const t=localStorage.getItem("appearance");i(t||"system")};function w(){const[t,n]=o.useState("system"),s=a=>{n(a),localStorage.setItem("appearance",a),i(a)};return o.useEffect(()=>{const a=localStorage.getItem("appearance");return s(a||"system"),()=>M.removeEventListener("change",S)},[]),{appearance:t,updateAppearance:s}}function L({className:t="",...n}){const{appearance:s,updateAppearance:a}=w(),l=[{value:"light",icon:v,label:"Light"},{value:"dark",icon:b,label:"Dark"},{value:"system",icon:k,label:"System"}];return e.jsx("div",{className:p("inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800",t),...n,children:l.map(({value:r,icon:d,label:m})=>e.jsxs("button",{onClick:()=>a(r),className:p("flex items-center rounded-md px-3.5 py-1.5 transition-colors",s===r?"bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100":"text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60"),children:[e.jsx(d,{className:"-ml-1 h-4 w-4"}),e.jsx("span",{className:"ml-1.5 text-sm",children:m})]},r))})}const N=[{title:"Appearance settings",href:"/settings/appearance"}];function q(){return e.jsxs(g,{breadcrumbs:N,children:[e.jsx(h,{title:"Appearance settings"}),e.jsx(u,{children:e.jsxs("div",{className:"space-y-6",children:[e.jsx(y,{title:"Appearance settings",description:"Update your account's appearance settings"}),e.jsx(L,{})]})})]})}export{q as default};
