import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { localTsLoader } from './lib/load-local-ts.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const reference=read('data/property-reference-adom.json');
const covers=read('data/property-covers.json'),watermarks=read('data/property-watermarks.json');
const load=localTsLoader(root);
const {adomProperties:listings}=load(path.join(root,'src/lib/data/adom-properties.ts'));
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const numeric=value=>Number(String(value).replace(/[^\d.]/g,''));
const norm=value=>String(value).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const fieldMap={
 'PROPERTY ADDRESS':'address','PROPERTY SIZE':'floorAreaSqm',CONDITION:'condition',FURNISHING:'furnishing',
 BEDROOM:'bedrooms',BATHROOMS:'bathrooms',TOILET:'toilets','ASKING PRICE':'askingPrice','PROPERTY STYLE':'style',
 DISTRICT:'district',TENURE:'tenure','REMAINING LEASE TERMS':'remainingLeaseTerm',STATUS:'status','ECO RATING':'ecoRating',
};
const numericFields=new Set(['PROPERTY SIZE','BEDROOM','BATHROOMS','TOILET','ASKING PRICE']);
assert.equal(listings.length,9);assert.equal(reference.properties.length,10);
assert.equal(new Set(listings.map(p=>p.id)).size,9);
let photos=0,phones=0,rotations=0;
for(const source of reference.properties){
 assert.equal(Object.keys(source.sourceFields).length,20,'Twenty original source fields');
 assert.equal(source.sourceFields['ECO RATING'],'','Source ratings were blank');
 const property=listings.find(p=>p.id===source.id);
 if(source.number===9){assert.equal(property,undefined,'Property 9 is on hold');assert(!covers[source.id],'Held property must have no published cover');continue;}
 assert(property,'Missing Adom property '+source.number);
 const f=source.fields;
 for(const [field,original] of Object.entries(source.sourceFields))assert.equal(f[field],source.confirmedFields?.[field]?.value??original,'Only owner-confirmed source changes: '+source.number+' '+field);
 for(const [field,key] of Object.entries(fieldMap)){const compare=numericFields.has(field)?numeric:norm;assert.equal(compare(property[key]),compare(f[field]),source.number+': '+field);}
 assert.equal(property.type,source.normalizedType);assert.equal(property.storey,source.normalizedStorey);
 assert.equal(property.agent.name,f.AGENT);
 const originalPhones=f.CONTACT.match(/\b0\d{9}\b/g).map(phone=>'+233'+phone.slice(1));
 assert.deepEqual([property.agent.phone,property.agent.secondaryPhone].filter(Boolean),originalPhones,'Only documented phone numbers');phones+=originalPhones.length;
 assert.deepEqual(property.facilities,source.normalizedFacilities);
 assert.deepEqual(property.greenFeatures.map(feature=>feature.label),f['GREEN FEATURES'].split(',').map(s=>s.trim()));
 for(const key of ['selfContained','coords','yearBuilt','listedDate','leaseYearsRemaining'])assert(!Object.hasOwn(property,key),'Undocumented '+key);
 assert.equal(property.ecoRating,source.number===3?'C':'D','Owner-confirmed eco rating');
 const gallery=read('data/property-photo-galleries/'+source.id+'.json');
 assert.deepEqual(property.images,gallery.images);assert.equal(covers[source.id],gallery.exterior);assert.equal(gallery.images[0],gallery.exterior);
 assert.equal(gallery.images.length,source.selectedImageCount);
 assert.equal(source.preparedPhotos[0].sourceFilename,source.proposedCover.filename,'Reviewed exterior first');
 assert.equal(fs.readdirSync(path.join(root,'public/properties',source.id)).length,source.selectedImageCount);
 for(const [index,prepared] of source.preparedPhotos.entries()){
  const original=source.images.find(i=>i.filename===prepared.sourceFilename),url=gallery.images[index],registration=watermarks.images[url];
  assert(original&&registration,'Source image and registration exist');
  assert.equal(url,prepared.originalUrl);assert.equal(prepared.rawSourceSha256,original.sha256);
  assert.equal(hash(path.join(root,'public',url)),prepared.registeredSourceSha256,'Registered source hash');
  assert.equal(registration.sourceSha256,prepared.registeredSourceSha256);assert.equal(hash(path.join(root,'public',registration.url)),registration.sha256);
  assert.equal(registration.width,prepared.width);assert.equal(registration.height,prepared.height);assert.equal(registration.changedOutsideMask,0);
  if(prepared.rotationClockwiseDegrees){
   assert.equal(source.number,4);assert.equal(prepared.rotationClockwiseDegrees,90);
   const archive=path.resolve(root,prepared.rawSourceArchive);assert(archive.startsWith(path.join(root,'data/property-source-originals')+path.sep));assert.equal(hash(archive),original.sha256,'Raw sideways original preserved');
   const [rotated,canonical]=await Promise.all([sharp(archive).rotate(90).removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true}),sharp(path.join(root,'public',url)).removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true})]);
   assert.equal(rotated.info.width,canonical.info.width);assert.equal(rotated.info.height,canonical.info.height);assert(rotated.data.equals(canonical.data),'Upright source must be an exact pixel rotation without resizing');rotations++;
  }else{assert.equal(prepared.registeredSourceSha256,original.sha256);assert.equal(prepared.width,original.width);assert.equal(prepared.height,original.height);}
  photos++;
 }
}
assert.equal(photos,54);assert.equal(phones,10);assert.equal(rotations,6);
const villa=listings.find(p=>p.id==='kwashieman-villa-emmanuelappiah');assert.equal(villa.type,'Villa');assert.deepEqual(villa.greenFeatures.map(f=>f.label),['Balcony','Private garden','Mature trees','Landscaped compound']);
const result={importedProperties:9,heldSourceProperties:[9],sourceFieldsVerified:180,confirmedEcoRatings:9,documentedContactNumbers:phones,associatedPhotos:photos,exteriorCovers:9,exactPixelRotations:rotations};
function flightValue(html,key){
 const text=[...html.matchAll(/self\.__next_f\.push\((.*?)\)<\/script>/g)].map(m=>JSON.parse(m[1])).filter(r=>typeof r[1]==='string').map(r=>r[1]).join('');const start=text.indexOf('"'+key+'":');assert(start>=0,'Missing '+key);const offset=start+key.length+3;let depth=0,quoted=false,escaped=false;
 for(let i=offset;i<text.length;i++){const c=text[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='['||c==='{')depth++;else if(c===']'||c==='}'){depth--;if(!depth)return JSON.parse(text.slice(offset,i+1),(_k,v)=>v==='$undefined'?undefined:v);}}throw Error('Incomplete '+key);
}
const site=process.argv.find(a=>a.startsWith('--site='))?.slice(7);
if(site){
 const origin=new URL(site).origin;async function request(url){const response=await fetch(origin+url,{signal:AbortSignal.timeout(60000)});assert.equal(response.status,200,url);return response;}
 const catalog=flightValue(await(await request('/search')).text(),'properties');assert.equal(new Set(catalog.map(p=>p.id)).size,catalog.length);assert(!catalog.some(p=>p.id===reference.properties.find(p=>p.number===9).id),'Held listing is absent');
 const {orderPropertyImages}=load(path.join(root,'src/lib/data/property-images.ts'));
 for(const property of listings){const expected={...property,images:orderPropertyImages(property.id,property.images)};assert.deepEqual(catalog.find(p=>p.id===property.id),expected,'Served fields '+property.id);const html=await(await request('/property/'+property.id)).text();assert.deepEqual(flightValue(html,'images'),expected.images,'Full detail gallery');for(const phone of [property.agent.phone,property.agent.secondaryPhone].filter(Boolean))assert(html.includes('tel:'+phone),'Documented contact');const thumbnail=await request('/_next/image?'+new URLSearchParams({url:expected.images[0],w:'1080',q:'90'}));assert(thumbnail.headers.get('content-type')?.startsWith('image/'));await thumbnail.arrayBuffer();}
 const assets=listings.flatMap(p=>p.images.map(url=>watermarks.images[url]));let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<assets.length){const image=assets[next++],response=await request(image.url);assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),image.sha256,'Served reviewed photograph');}}));
 Object.assign(result,{site:origin,catalogListings:catalog.length,servedPhotosVerified:assets.length,optimizedExteriorThumbnails:9});
}
console.log(JSON.stringify(result,null,2));
