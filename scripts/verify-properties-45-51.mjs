import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { localTsLoader } from './lib/load-local-ts.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const reference=read('data/property-reference-45-51.json');
const covers=read('data/property-covers.json'),watermarks=read('data/property-watermarks.json');
const load=localTsLoader(root);
const {properties45To51:listings}=load(path.join(root,'src/lib/data/properties-45-51.ts'));
const pending=new Set(reference.pendingClarifications.map(p=>p.property));
const sources=reference.properties.filter(p=>!pending.has(p.number));
const numeric=value=>Number(String(value).replace(/[^\d.]/g,''));
const norm=value=>String(value).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const fields={
 'PROPERTY ADDRESS':'address','PROPERTY TYPE':'type','PROPERTY SIZE':'floorAreaSqm',
 CONDITION:'condition',FURNISHING:'furnishing',BEDROOM:'bedrooms',BATHROOMS:'bathrooms',TOILET:'toilets',
 'ASKING PRICE':'askingPrice','PROPERTY STYLE':'style',DISTRICT:'district','ECO RATING':'ecoRating',
 TENURE:'tenure','REMAINING LEASE TERMS':'remainingLeaseTerm',STATUS:'status',
};
const numerical=new Set(['PROPERTY SIZE','BEDROOM','BATHROOMS','TOILET','ASKING PRICE']);
assert.deepEqual(reference.properties.map(p=>p.number),[45,46,47,48,49,50,51]);
assert.equal(listings.length,sources.length);
assert.equal(new Set(listings.map(p=>p.id)).size,listings.length);
let photos=0,phones=0;
for(const source of reference.properties){
 assert.equal(Object.keys(source.fields).length,20,'Source field count '+source.number);
 assert.equal(new Set(source.images.map(i=>i.filename)).size,source.images.length);
 assert.equal(source.proposedImageOrder.length,source.images.length,'All selected source photographs');
 assert.equal(source.proposedImageOrder[0],source.proposedCover.filename,'Exterior first');
 const property=listings.find(p=>p.id===source.id);
 if(pending.has(source.number)){assert.equal(property,undefined,'Unresolved listing must remain unpublished');continue;}
 assert(property,'Missing property '+source.number);
 const value=key=>source.confirmedFields?.[key]?.value??source.fields[key];
 for(const [field,key] of Object.entries(fields)){const compare=numerical.has(field)?numeric:norm;assert.equal(compare(property[key]),compare(value(field)),source.number+': '+field);}
 assert.equal(property.storey,/single/i.test(value('STOREY'))?'Single Storey':'Multi Storey');
 assert.equal(property.agent.name,source.fields.AGENT);
 const expectedPhones=value('CONTACT').match(/\+233\d{9}/g);
 assert.deepEqual([property.agent.phone,property.agent.secondaryPhone].filter(Boolean),expectedPhones,'Exact documented contacts');
 phones+=expectedPhones.length;
 assert.deepEqual(property.facilities,source.normalizedFacilities,'Reviewed source amenity cleanup');
 assert.deepEqual(property.greenFeatures.map(f=>f.label),source.fields['GREEN FEATURES']==='Not specified'?[]:source.fields['GREEN FEATURES'].split(',').map(s=>s.trim()));
 for(const key of ['selfContained','coords','yearBuilt','listedDate','leaseYearsRemaining'])assert(!Object.hasOwn(property,key),'Undocumented '+key);
 const gallery=read('data/property-photo-galleries/'+property.id+'.json');
 assert.deepEqual(property.images,gallery.images);
 assert.equal(covers[property.id],gallery.exterior);
 assert.equal(gallery.images[0],gallery.exterior);
 assert.equal(gallery.images.length,source.proposedImageOrder.length);
 assert.equal(fs.readdirSync(path.join(root,'public/properties',property.id)).length,gallery.images.length);
 for(const [index,filename] of source.proposedImageOrder.entries()){
  const original=source.images.find(i=>i.filename===filename),url=gallery.images[index],edit=watermarks.images[url];
  assert(edit,'Unregistered photo '+url);
  assert.equal(hash(path.join(root,'public',url)),original.sha256,'Source association');
  assert.equal(edit.sourceSha256,original.sha256);
  assert.equal(hash(path.join(root,'public',edit.url)),edit.sha256);
  assert.equal(edit.width,original.width);assert.equal(edit.height,original.height);
  assert.equal(edit.changedOutsideMask,0);photos++;
 }
}
const result={importedProperties:listings.length,withheldProperties:[...pending],verifiedSourceFields:sources.length*20,documentedContactNumbers:phones,associatedPhotos:photos,exteriorCovers:listings.length};
function flightValue(html,key){
 const text=[...html.matchAll(/self\.__next_f\.push\((.*?)\)<\/script>/g)].map(m=>JSON.parse(m[1])).filter(r=>typeof r[1]==='string').map(r=>r[1]).join('');
 const start=text.indexOf('"'+key+'":');assert(start>=0,'Missing '+key);const offset=start+key.length+3;
 let depth=0,quoted=false,escaped=false;
 for(let i=offset;i<text.length;i++){const c=text[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='['||c==='{')depth++;else if(c===']'||c==='}'){depth--;if(!depth)return JSON.parse(text.slice(offset,i+1),(_k,v)=>v==='$undefined'?undefined:v);}}
 throw Error('Incomplete '+key);
}
const site=process.argv.find(a=>a.startsWith('--site='))?.slice(7);
if(site){
 const origin=new URL(site).origin;
 async function request(url){const response=await fetch(origin+url,{signal:AbortSignal.timeout(60000)});assert.equal(response.status,200,url);return response;}
 const catalog=flightValue(await(await request('/search')).text(),'properties');
 assert.equal(new Set(catalog.map(p=>p.id)).size,catalog.length);
 const {orderPropertyImages}=load(path.join(root,'src/lib/data/property-images.ts'));
 for(const property of listings){
  const expected={...property,images:orderPropertyImages(property.id,property.images)};
  assert.deepEqual(catalog.find(p=>p.id===property.id),expected,'Served fields '+property.id);
  const html=await(await request('/property/'+property.id)).text();
  assert.deepEqual(flightValue(html,'images'),expected.images,'Full detail gallery');
  for(const phone of [property.agent.phone,property.agent.secondaryPhone].filter(Boolean))assert(html.includes('tel:'+phone),'Missing contact');
  const thumbnail=await request('/_next/image?'+new URLSearchParams({url:expected.images[0],w:'1080',q:'90'}));
  assert(thumbnail.headers.get('content-type')?.startsWith('image/'));await thumbnail.arrayBuffer();
 }
 for(const source of reference.properties.filter(p=>pending.has(p.number)))assert(!catalog.some(p=>p.id===source.id),'Unresolved entry exposed');
 const assets=listings.flatMap(p=>p.images.map(url=>watermarks.images[url]));let next=0;
 await Promise.all(Array.from({length:4},async()=>{while(next<assets.length){const image=assets[next++],response=await request(image.url);assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),image.sha256,'Served photo');}}));
 Object.assign(result,{site:origin,catalogListings:catalog.length,servedPhotosVerified:assets.length,optimizedExteriorThumbnails:listings.length});
}
console.log(JSON.stringify(result,null,2));
