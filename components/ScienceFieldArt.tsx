import React from 'react';
const textures={Rock:new URL('../assets/ui/terrain/rock.webp',import.meta.url).href,Ice:new URL('../assets/ui/terrain/ice.webp',import.meta.url).href,Liquid:new URL('../assets/ui/terrain/ocean.webp',import.meta.url).href,Molten:new URL('../assets/ui/terrain/lava.webp',import.meta.url).href,Gas:new URL('../assets/images/planet_map_gas_a.png',import.meta.url).href};
type Props={field:'object'|'surface'|'gravity'|'density'|'temperature'|'weather';known:boolean;value:string;planetImage?:string;confirmedSurface?:string|null};
/** These cards only receive a value once that particular analysis field is
 * confirmed. A hidden field cannot select a revealing image or CSS class. */
export default function ScienceFieldArt({field,known,value,planetImage,confirmedSurface}:Props){
 if(!known||value==='Unknown')return <span className="science-field-art science-field-unresolved" data-science-field-art="unresolved" aria-hidden="true">?</span>;
 const surface=confirmedSurface&&textures[confirmedSurface as keyof typeof textures];
 const image=field==='surface'?textures[value as keyof typeof textures]:field==='temperature'?surface:undefined;
 const hot=field==='temperature'&&/Inferno|Searing/.test(value),cold=field==='temperature'&&/Arctic/.test(value);
 const storm=field==='weather'&&/Violent/.test(value),clouds=field==='weather'&&!['None','Calm'].includes(value);
 return <span aria-hidden="true" className={'science-field-art science-field-'+field+(hot?' science-thermal-hot':cold?' science-thermal-cold':'')} data-science-field-art={field} data-science-field-value={value}>
  {image&&<img className="science-field-landscape" src={image} alt=""/>}
  {['object','gravity','density','weather'].includes(field)&&planetImage&&<span className="science-instrument-planet"><img src={planetImage} alt=""/><i/></span>}
  {field==='gravity'&&<svg viewBox="0 0 240 180" className="science-gravity-grid"><g fill="none" stroke="currentColor" strokeWidth="1.2">{[0,1,2,3,4].map(i=><ellipse key={i} cx="132" cy="100" rx={47+i*14} ry={24+i*9} transform={'rotate(-25 132 100)'}/>)}<path d="M35 150L210 35M50 155L215 63M70 163L223 95" opacity=".45"/></g></svg>}
  {field==='density'&&value!=='None'&&<span className={'science-atmosphere-limb '+(value.includes('Thin')?'science-atmosphere-thin':'science-atmosphere-dense')}/>}
  {field==='temperature'&&<svg viewBox="0 0 160 200" className="science-thermal-instrument"><g fill="none" stroke="#9bc8de" strokeWidth="3"><path d="M66 127V36a18 18 0 0136 0v91a32 32 0 11-36 0Z"/><path d="M84 44v104" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/><circle cx="84" cy="157" r="16" fill="currentColor" stroke="none"/>{[50,70,90,110].map(y=><path key={y} d={'M111 '+y+'h16'}/>)}</g></svg>}
  {clouds&&<img className={'science-weather-clouds '+(storm?'science-weather-storm':'')} src={textures.Gas} alt=""/>}
  {storm&&<svg className="science-weather-flash" viewBox="0 0 100 100"><path d="M60 8L28 53h22L39 91l35-49H52Z" fill="#b7ecff"/></svg>}
 </span>;
}
