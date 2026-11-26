// Each row pairs a schematic part with its plain-language function.
const envelope = ['Lipid envelope', 'A thin fatty membrane encloses the particle and holds its surface proteins in place.'];
const matrix = ['Matrix layer', 'This supporting layer lines the envelope and helps the particle keep its shape.'];
const nucleocapsid = ['Nucleocapsid', 'Proteins wrap around the RNA, organizing and protecting the long strand inside the particle.'];
const rna = ['RNA genome', 'This strand carries the genetic instructions of the virus. Its path is simplified in the drawing.'];
const dna = ['DNA genome', 'DNA carries the virus’s genetic instructions inside the protective protein shell.'];
const spike = ['Surface glycoprotein', 'These proteins project from the envelope and help the virus attach to a host cell.'];
const capsid = ['Capsid', 'Repeating protein units form a protective shell around the genetic material.'];
const who = 'https://www.who.int/news-room/fact-sheets/detail/';
const cdc = 'https://www.cdc.gov/';
export const specimens = [
 {id:'sars-cov-2', name:'SARS-CoV-2', family:'Coronaviridae', shape:'Crowned sphere', genome:'Single-stranded RNA', disease:'COVID-19',
 intro:'A fringe of club-shaped spikes gives coronaviruses their name. Beneath the envelope, a long RNA strand folds into protein-bound bundles.',
 symptoms:'Fever, chills and sore throat are common. Some people also develop a cough or fatigue, while others have no symptoms.',
 effects:'Severe illness can affect breathing. After the initial infection, some people have ongoing fatigue, breathlessness or difficulty concentrating (long COVID).',
 source:who+'coronavirus-disease-(covid-19)',parts:[['Spike protein','These club-shaped projections give the particle its crown-like outline and help it attach to a host cell.'],envelope,nucleocapsid,rna]},
 {id:'ebola', name:'Ebola virus', family:'Filoviridae',shape:'Curved filament',genome:'Single-stranded RNA',disease:'Ebola virus disease',
 intro:'A long, flexible envelope bends into threads and loops. A coiled nucleocapsid runs along the length of the filament.',
 symptoms:'Illness often begins with fever, marked tiredness, headache and muscle pain. Vomiting and diarrhea can follow.',
 effects:'Severe illness can damage the kidneys and liver and can be fatal. Some people develop bleeding later in the illness.',
 source:who+'ebola-disease',parts:[spike,envelope,nucleocapsid,rna]},
 {id:'influenza',name:'Influenza A virus',family:'Orthomyxoviridae',shape:'Variable envelope',genome:'Eight RNA segments',disease:'Influenza (flu)',
 intro:'Two kinds of projection stud the envelope. Inside, the genome is divided into eight pieces, each packaged with protein.',
 symptoms:'Fever often starts suddenly, with dry cough, sore throat, headache, muscle aches and exhaustion.',
 effects:'Most people recover within about a week. Complications include pneumonia, sepsis and worsening of existing heart or lung disease.',
 source:who+'influenza-(seasonal)',parts:[['Hemagglutinin','This surface protein helps the particle attach to a host cell.'],['Neuraminidase','This second type of surface protein helps newly formed particles separate from the cell.'],envelope,['RNA segments','Eight separate lengths of RNA together carry the virus’s genetic information. Each is packaged with protein.']]},
 {id:'rabies',name:'Rabies virus',family:'Rhabdoviridae',shape:'Bullet-shaped',genome:'Single-stranded RNA',disease:'Rabies',
 intro:'One end is rounded and the other is flatter, giving this particle its bullet-like profile. A helical core sits inside the envelope.',
 symptoms:'Early signs can include fever, pain and tingling near the wound. Later illness may cause swallowing spasms, agitation or progressive paralysis.',
 effects:'Rabies inflames the brain and spinal cord and is almost always fatal once symptoms appear. A possible exposure needs urgent medical assessment before symptoms start.',
 source:who+'rabies',parts:[spike,envelope,matrix,nucleocapsid]},
 {id:'dengue',name:'Dengue virus',family:'Flaviviridae',shape:'Tiled sphere',genome:'Single-stranded RNA',disease:'Dengue',
 intro:'On a mature dengue particle, envelope proteins lie close to the surface in paired tiles. They form a smoother outline than the long spikes of a coronavirus.',
 symptoms:'Many infections cause no symptoms. When illness develops, fever may come with pain behind the eyes, joint or muscle aches, nausea or a rash.',
 effects:'Severe dengue can cause shock or internal bleeding. It can worsen rapidly, sometimes as the fever subsides.',
 source:cdc+'dengue/signs-symptoms/index.html',parts:[['Envelope protein','Pairs of these proteins lie flat against the mature particle and help it interact with a host cell.'],envelope,['Capsid protein','This protein associates with the RNA to package it inside the envelope.'],rna]},
 {id:'measles',name:'Measles virus',family:'Paramyxoviridae',shape:'Variable envelope',genome:'Single-stranded RNA',disease:'Measles',
 intro:'The flexible outer membrane can take several shapes. The long protein-wrapped genome coils and folds within it.',
 symptoms:'Fever, cough, runny nose and watery red eyes often come first. A rash begins on the face or upper neck and spreads downward.',
 effects:'Complications include ear infections, pneumonia, severe diarrhea and, more rarely, brain inflammation.',
 source:who+'measles',parts:[['Attachment protein','This projection helps the virus recognize and attach to a host cell.'],envelope,matrix,nucleocapsid]},
 {id:'adenovirus',name:'Human adenovirus',family:'Adenoviridae',shape:'Faceted shell',genome:'Double-stranded DNA',disease:'Adenovirus infections',
 intro:'A geometric shell protects the DNA. A long fiber ending in a knob projects from each of the shell’s twelve corners.',
 symptoms:'Symptoms vary by virus type. A sore throat, fever, cold-like illness or pink eye are common presentations. Some types cause diarrhea and vomiting.',
 effects:'Some infections cause pneumonia. People with weakened immune systems or existing heart or lung disease have a higher risk of severe illness.',
 source:cdc+'adenovirus/about/index.html',parts:[['Fiber knob','The tip of the fiber helps the particle attach to a cell.'],['Fiber shaft','This slender stalk holds the knob out from a vertex of the capsid.'],capsid,dna]},
 {id:'norovirus',name:'Norovirus',family:'Caliciviridae',shape:'Dimpled shell',genome:'Single-stranded RNA',disease:'Acute gastroenteritis',
 intro:'A compact protein shell surrounds the genome. Paired projections give the surface its uneven, sculpted appearance.',
 symptoms:'Vomiting, watery diarrhea, nausea and stomach cramps are typical. Fever or body aches can also occur.',
 effects:'Fluid loss can lead to dehydration, especially in young children, older adults and people who are already ill.',
 source:cdc+'norovirus/about/index.html',parts:[['Protruding domain','Paired projections extend from the main capsid protein and help the particle interact with cells.'],['Shell domain','The lower portions of the capsid proteins fit together to form a continuous protective wall.'],rna]},
 {id:'rotavirus',name:'Rotavirus A',family:'Sedoreoviridae',shape:'Layered shell',genome:'Eleven RNA segments',disease:'Rotavirus gastroenteritis',
 intro:'Three concentric protein layers surround eleven segments of double-stranded RNA. The particle has a wheel-like appearance in electron micrographs.',
 symptoms:'Vomiting and watery diarrhea are typical, often with fever or stomach pain. Infants and young children can become especially ill.',
 effects:'Loss of water and salts can cause severe dehydration. Some children need hospital treatment to replace lost fluids.',
 source:cdc+'rotavirus/about/index.html',parts:[['Surface spike','These projecting proteins help the virus attach to cells.'],['Outer capsid','A layer of proteins covers and protects the middle shell.'],['Middle capsid','This ordered protein layer gives the particle much of its wheel-like appearance.'],['Inner core','The innermost protein layer houses the eleven RNA segments.']]},
 {id:'hepatitis-b',name:'Hepatitis B virus',family:'Hepadnaviridae',shape:'Enveloped sphere',genome:'Partly double-stranded DNA',disease:'Hepatitis B',
 intro:'Inside the round lipid envelope is an angular protein core. It holds a small circular DNA genome with a partially double-stranded structure.',
 symptoms:'A new infection often causes no symptoms. When present, symptoms can include tiredness, nausea, abdominal pain, dark urine and yellowing of the skin or eyes.',
 effects:'Infection can persist for years. Chronic hepatitis B can scar the liver (cirrhosis) and increase the risk of liver cancer.',
 source:who+'hepatitis-b',parts:[['Surface antigen','These proteins are embedded in the envelope and are recognized by the immune system.'],envelope,capsid,['Circular DNA','The genome forms a small ring. One DNA strand is shorter, leaving part of the ring single-stranded.']]}
];
