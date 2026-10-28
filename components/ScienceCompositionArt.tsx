import React,{useId} from 'react';
import {compositionIllustration,type CompositionCategory} from '../utils/science-illustrations';
const atmosphere=new URL('../assets/ui/science/cards/atmosphere-sample.png',import.meta.url).href;
const fluid=new URL('../assets/ui/science/cards/hydrosphere-sample.png',import.meta.url).href;
const crystal=new URL('../assets/ui/science/cards/mineral-sample.png',import.meta.url).href;
const rock=new URL('../assets/ui/terrain/rock.webp',import.meta.url).href;
const ice=new URL('../assets/ui/terrain/ice.webp',import.meta.url).href;
/** Conventional molecular sketches distinguish reported compounds. They are
 * illustrations of identity, not claims of remotely measured bond geometry. */
function molecule(name:string){
 const atom=(label:string,x:number,y:number,color:string)=>({label,x,y,color});
 const h=(x:number,y:number)=>atom('H',x,y,'#e6f6ff');
 switch(name){
  case 'Water':return [atom('O',60,38,'#d86d67'),h(31,64),h(89,64)];
  case 'Methane':return [atom('C',60,50,'#9caab7'),h(60,14),h(24,55),h(89,77),h(87,34)];
  case 'Ammonia':return [atom('N',60,43,'#7da4dc'),h(31,67),h(89,67),h(60,15)];
  case 'Carbon Dioxide':return [atom('C',60,50,'#9caab7'),atom('O',23,50,'#d86d67'),atom('O',97,50,'#d86d67')];
  case 'Carbon Monoxide':return [atom('C',43,50,'#9caab7'),atom('O',77,50,'#d86d67')];
  case 'Hydrogen':return [h(43,50),h(77,50)];
  case 'Nitrogen':return [atom('N',43,50,'#7da4dc'),atom('N',77,50,'#7da4dc')];
  case 'Oxygen':return [atom('O',43,50,'#d86d67'),atom('O',77,50,'#d86d67')];
  case 'Fluorine':return [atom('F',43,50,'#cfdf9a'),atom('F',77,50,'#cfdf9a')];
  case 'Chlorine':return [atom('Cl',43,50,'#aace91'),atom('Cl',77,50,'#aace91')];
  case 'Argon':return [atom('Ar',60,50,'#b8bbdf')];
  case 'Helium':return [atom('He',60,50,'#e1c6a2')];
  default:return null;
 }
}
export default function ScienceCompositionArt({category,names,revealed,confirmedSurface=null}:{category:CompositionCategory;names:readonly string[];revealed:boolean;confirmedSurface?:string|null}){
 const v=compositionIllustration(category,names,revealed,confirmedSurface),id=useId().replaceAll(':','');
 const atoms=v.names.length?molecule(v.names[0]):null;
 const image=v.texture==='gas'?atmosphere:v.texture==='ice'?ice:v.texture==='liquid'?fluid:v.texture==='crystal'?crystal:v.texture==='rock'?rock:null;
 return <figure aria-hidden="true" className={'science-composition-art science-material-'+v.kind} data-science-visual={v.kind} data-science-materials={v.names.join('|')} data-science-symbols={v.symbols.join('|')} style={{'--sample-accent':v.accent} as React.CSSProperties}>
  {image&&v.kind!=='none'&&<img className="science-sample-scene" src={image} alt=""/>}
  <span className="science-sample-tint"/>
  {v.kind==='unresolved'?<span className="science-sample-unknown">?</span>:v.kind==='vacuum'?<span className="science-vacuum-orbit"/>:v.kind==='none'?<span className="science-dry-sample">∅</span>:<>
   {atoms?<svg className="science-molecule" viewBox="0 0 120 100"><defs><radialGradient id={id+'-shine'} cx="30%" cy="25%"><stop offset="0" stopColor="white" stopOpacity=".8"/><stop offset=".6" stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="#00111f" stopOpacity=".65"/></radialGradient></defs>
    <ellipse cx="60" cy="78" rx="42" ry="9" fill="none" stroke="currentColor" opacity=".25"/>
    {atoms.slice(1).map((a,i)=><line key={i} x1={atoms[0].x} y1={atoms[0].y} x2={a.x} y2={a.y} stroke="#9bb8ce" strokeWidth="5"/>)}
    {atoms.map((a,i)=><g key={i}><circle cx={a.x} cy={a.y} r={a.label==='H'?9:14} fill={a.color}/><circle cx={a.x} cy={a.y} r={a.label==='H'?9:14} fill={'url(#'+id+'-shine)'}/><text x={a.x} y={a.y+3} textAnchor="middle" fill="#082232" fontSize={a.label==='H'?9:11} fontWeight="bold">{a.label}</text></g>)}
   </svg>:<div className="science-specimen-seal"><span>{v.symbols[0]}</span><i/><i/><i/></div>}
   <div className="science-sample-signatures">{v.symbols.map((symbol,i)=><span key={i}>{symbol}</span>)}</div>
  </>}
 </figure>;
}
