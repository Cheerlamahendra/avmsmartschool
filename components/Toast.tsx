'use client';
import {createContext,useCallback,useContext,useState,ReactNode} from 'react';
type Toast={id:number;message:string;kind:'success'|'error'|'info'}; const C=createContext<{show:(message:string,kind?:Toast['kind'])=>void}>({show:()=>{}});
export function ToastProvider({children}:{children:ReactNode}){const [items,setItems]=useState<Toast[]>([]);const show=useCallback((message:string,kind:Toast['kind']='success')=>{const id=Date.now();setItems(x=>[...x,{id,message,kind}]);setTimeout(()=>setItems(x=>x.filter(t=>t.id!==id)),2800)},[]);return <C.Provider value={{show}}>{children}{items.map(t=><div key={t.id} className="toast">{t.message}</div>)}</C.Provider>}
export const useToast=()=>useContext(C);
