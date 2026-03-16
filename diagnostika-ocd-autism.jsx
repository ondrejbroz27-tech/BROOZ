import { useState, useEffect } from "react";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:"#F7F4EF", surface:"#FFFFFF", surface2:"#F2EEE8", border:"#E8E1D9",
  text:"#1A1915", textMid:"#5C574F", textMuted:"#9C9489",
  ocd:"#C96442",  ocdLight:"#FBF0EB",  ocdBorder:"#F0C4B4",
  asd:"#3B6EA8",  asdLight:"#EBF1FB",  asdBorder:"#B4CDF0",
  adhd:"#6A42C9", adhdLight:"#F2EBFB", adhdBorder:"#C4B4F0",
  green:"#3A7D5C", greenLight:"#EBF6F1", greenBorder:"#B4DECE",
  yellow:"#8A6A1A", yellowLight:"#FBF5E6", yellowBorder:"#EDD89A",
  red:"#B03A2E", redLight:"#FBF0EE", redBorder:"#F0B4B0",
};
const LETTERS = ["A","B","C","D"];
const Q_PER_TEST = 15;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function pick(arr, n) { return shuffle(arr).slice(0,n); }

// ══════════════════════════════════════════════════════════════════════════════
//  OCD BANK – 100 otázek  (Y-BOCS, OCI-R, DSM-5, OCCWG)  scores 0–3
// ══════════════════════════════════════════════════════════════════════════════
const OCD_BANK = [
  {text:"Jak často se vám vkrádají nežádoucí, rušivé myšlenky?",context:"Např. obavy ze znečištění, agrese, pochybnosti.",options:["Téměř nikdy","Někdy, méně než 1 h denně","Pravidelně, 1–3 h denně","Téměř neustále, >3 h denně"],scores:[0,1,2,3]},
  {text:"Jak dlouho celkem trvají vaše vtíravé myšlenky za typický den?",context:"",options:["Méně než 30 minut","30 min – 1 hodina","1–3 hodiny","Více než 3 hodiny"],scores:[0,1,2,3]},
  {text:"Jak rychle se vám obsedantní myšlenka vrátí poté, co ji odežene?",context:"",options:["Vrátí se vzácně nebo vůbec","Vrátí se po hodině nebo déle","Vrátí se do 30 minut","Vrátí se okamžitě"],scores:[0,1,2,3]},
  {text:"Jak obtížné je soustředit se na práci kvůli vtíravým myšlenkám?",context:"",options:["Vůbec ne obtížné","Mírně obtížné","Výrazně obtížné","Prakticky nemožné"],scores:[0,1,2,3]},
  {text:"Jak často přichází rušivá myšlenka v nevhodný moment?",context:"",options:["Vzácně","Příležitostně","Často","Téměř vždy"],scores:[0,1,2,3]},
  {text:"Jakou úzkost ve vás vyvolávají vtíravé myšlenky?",context:"",options:["Žádnou nebo minimální","Mírnou, ale zvládnutelnou","Střední, obtížně zvládnutelnou","Extrémní, zdrcující"],scores:[0,1,2,3]},
  {text:"Cítíte vinu nebo stud v důsledku svých obsedantních myšlenek?",context:"",options:["Vůbec","Mírně","Výrazně","Velmi silně"],scores:[0,1,2,3]},
  {text:"Způsobují vám vtíravé myšlenky fyzické příznaky (bušení srdce, pocení)?",context:"",options:["Ne","Výjimečně","Někdy","Pravidelně"],scores:[0,1,2,3]},
  {text:"Jak moc vás trápí strach, že byste mohli ublížit sobě nebo druhým?",context:"",options:["Vůbec","Mírně","Středně","Velmi silně"],scores:[0,1,2,3]},
  {text:"Máte obsedantní myšlenky spojené s obavami ze znečištění nebo nemoci?",context:"",options:["Ne","Příležitostně","Pravidelně","Téměř neustále"],scores:[0,1,2,3]},
  {text:"Jak intenzivní jsou vaše pochybnosti (zda jste zavřeli dveře, vypnuli sporák)?",context:"",options:["Žádné nebo minimální","Mírné","Výrazné","Extrémní"],scores:[0,1,2,3]},
  {text:"Trápí vás myšlenky náboženského nebo morálního obsahu (rouhání, hřích)?",context:"",options:["Vůbec","Mírně","Středně","Silně"],scores:[0,1,2,3]},
  {text:"Máte nutkavé sexuální nebo agresivní myšlenky, které vám vadí?",context:"",options:["Ne","Příležitostně","Pravidelně","Velmi často"],scores:[0,1,2,3]},
  {text:"Jak silný je váš strach z odpovědnosti za katastrofu?",context:"",options:["Žádný","Mírný","Výrazný","Extrémní"],scores:[0,1,2,3]},
  {text:"Trápí vás nutkání k symetrii nebo pořádku?",context:"",options:["Vůbec","Mírně","Výrazně","Silně"],scores:[0,1,2,3]},
  {text:"Snažíte se svým obsedantním myšlenkám aktivně vzdorovat?",context:"",options:["Vždy vzdoruji","Většinou vzdoruji","Podlehuji ve více než polovině případů","Vzdávám bez boje"],scores:[0,1,2,3]},
  {text:"Jak silnou kontrolu máte nad vtíravými myšlenkami?",context:"",options:["Úplnou kontrolu","Dobrou kontrolu","Slabou kontrolu","Žádnou kontrolu"],scores:[0,1,2,3]},
  {text:"Dokážete myšlenku potlačit nebo odvrátit pozornost jinam?",context:"",options:["Snadno","Většinou ano","Jen s velkým úsilím","Vůbec"],scores:[0,1,2,3]},
  {text:"Narušují obsedantní myšlenky vaše vztahy nebo rodinný život?",context:"",options:["Ne","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Kolik času strávíte rituály nebo opakovaným chováním za den?",context:"Mytí rukou, kontrolování, počítání apod.",options:["Méně než 30 minut","30 min – 1 hodina","1–3 hodiny","Více než 3 hodiny"],scores:[0,1,2,3]},
  {text:"Jak často si myjete ruce nebo se sprchujete více, než je nutné?",context:"",options:["Normálně","Mírně více","Výrazně více","Mnohem více – zabere hodiny"],scores:[0,1,2,3]},
  {text:"Jak často kontrolujete věci (zámky, sporák, světla) opakovaně?",context:"",options:["Nikdy nebo vzácně","Příležitostně","Pravidelně","Téměř pokaždé"],scores:[0,1,2,3]},
  {text:"Uspořádáváte věci do přesného pořádku nebo symetrie?",context:"",options:["Ne","Občas","Pravidelně","Vždy, zabere hodně času"],scores:[0,1,2,3]},
  {text:"Opakujete v mysli nebo nahlas slova, modlitby nebo fráze?",context:"",options:["Ne","Výjimečně","Pravidelně","Každý den dlouho"],scores:[0,1,2,3]},
  {text:"Hromadíte věci, které nepotřebujete, ze strachu z vyhazování?",context:"",options:["Ne","Mírně","Výrazně","Silně"],scores:[0,1,2,3]},
  {text:"Počítáte věci nebo provádíte mentální počty jako rituál?",context:"",options:["Ne","Výjimečně","Pravidelně","Každý den"],scores:[0,1,2,3]},
  {text:"Musíte věci dělat přesně určitým způsobem, jinak to nelze dokončit?",context:"",options:["Ne","Vzácně","Pravidelně","Vždy"],scores:[0,1,2,3]},
  {text:"Vyhýbáte se určitým místům kvůli obsedantním obavám?",context:"",options:["Ne","Mírně","Výrazně","Téměř zcela"],scores:[0,1,2,3]},
  {text:"Žádáte druhé o ujištění, že jste neudělali chybu nebo nezpůsobili škodu?",context:"",options:["Ne","Příležitostně","Pravidelně","Velmi často"],scores:[0,1,2,3]},
  {text:"Co se stane, když rituál nevykonáte? Jak velká je úzkost?",context:"",options:["Žádná úzkost","Mírná úzkost","Výrazná úzkost","Extrémní, nesnesitelná úzkost"],scores:[0,1,2,3]},
  {text:"Vykonáváte rituály, i když víte, že jsou nesmyslné?",context:"",options:["Ne","Výjimečně","Pravidelně","Téměř vždy"],scores:[0,1,2,3]},
  {text:"Cítíte silnou potřebu dokončit rituál 'správně', jinak začnete znovu?",context:"",options:["Ne","Mírně","Výrazně","Vždy – opakuji mnohokrát"],scores:[0,1,2,3]},
  {text:"Snažíte se rituálům odolat nebo je omezit?",context:"",options:["Vždy se snažím","Většinou se snažím","Jen někdy","Vůbec"],scores:[0,1,2,3]},
  {text:"Narušují rituály váš pracovní nebo školní výkon?",context:"",options:["Ne","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Do jaké míry OCD příznaky narušují váš pracovní nebo studijní život?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela mi brání pracovat"],scores:[0,1,2,3]},
  {text:"Jak moc OCD ovlivňuje váš sociální život a přátelství?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela mi brání v sociálním kontaktu"],scores:[0,1,2,3]},
  {text:"Jak moc OCD narušuje váš spánek?",context:"",options:["Vůbec","Mírně – usínám o něco déle","Výrazně – trvá hodinu nebo více","Zcela – spím velmi špatně"],scores:[0,1,2,3]},
  {text:"Cítíte, že OCD kontroluje váš život spíše než vy jeho?",context:"",options:["Ne","Občas","Většinou ano","Vždy"],scores:[0,1,2,3]},
  {text:"Stydíte se za své OCD příznaky natolik, že je skrýváte?",context:"",options:["Ne","Mírně","Výrazně","Zcela – nikdo o nich neví"],scores:[0,1,2,3]},
  {text:"Cítíte úlevu ihned po provedení rituálu?",context:"",options:["Ne – rituály vůbec nedělám","Mírnou úlevu","Výraznou úlevu","Okamžitou silnou úlevu"],scores:[0,1,2,3]},
  {text:"Jak rychle po rituálu se vrátí původní úzkost?",context:"",options:["Nevracívá se","Za hodinu nebo déle","Do 30 minut","Téměř okamžitě"],scores:[0,1,2,3]},
  {text:"Jak moc OCD narušuje vaši schopnost cestovat?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Prožíváte záchvaty paniky v důsledku OCD obsesí?",context:"",options:["Ne","Výjimečně","Pravidelně","Velmi často"],scores:[0,1,2,3]},
  {text:"Jak moc OCD narušuje vaše koníčky?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Opakovaně přepisujete text, dokud to nevypadá 'perfektně'?",context:"",options:["Ne","Příležitostně","Pravidelně","Vždy"],scores:[0,1,2,3]},
  {text:"Procházíte v mysli minulé události, zda jste neudělali chybu?",context:"",options:["Ne","Příležitostně","Pravidelně","Každý den hodiny"],scores:[0,1,2,3]},
  {text:"Jak často odkládáte úkoly kvůli obavám z nedokonalosti?",context:"",options:["Vzácně","Příležitostně","Pravidelně","Téměř vždy"],scores:[0,1,2,3]},
  {text:"Máte potřebu 'neutralizovat' špatnou myšlenku dobrou myšlenkou?",context:"",options:["Ne","Výjimečně","Pravidelně","Vždy"],scores:[0,1,2,3]},
  {text:"Pociťujete fyzický diskomfort, dokud rituál neprovedete?",context:"",options:["Ne","Mírný","Výrazný","Silný – rituál musím provést pro úlevu"],scores:[0,1,2,3]},
  {text:"Věříte, že pouhé pomyšlení na špatnou věc ji může způsobit?",context:"Tzv. myšlenka-čin fúze.",options:["Ne","Výjimečně","Někdy","Ano, věřím tomu"],scores:[0,1,2,3]},
  {text:"Cítíte nadměrnou odpovědnost za předcházení škodám?",context:"",options:["Ne","Mírně","Výrazně","Silně – cítím se zodpovědný/á za vše"],scores:[0,1,2,3]},
  {text:"Jak moc vám vadí nejistota – potřebujete mít vždy 100% jistotu?",context:"",options:["Nejistotu snáším dobře","Mírně mi vadí","Výrazně mi vadí","Nemohu fungovat bez jistoty"],scores:[0,1,2,3]},
  {text:"Máte pocit, že nejste 'normální', protože máte tyto myšlenky?",context:"",options:["Ne","Občas","Většinou","Vždy"],scores:[0,1,2,3]},
  {text:"Jak moc se stydíte za obsah svých vtíravých myšlenek?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Věříte, že musíte mít věci 'pod kontrolou', jinak se stane něco hrozného?",context:"",options:["Ne","Mírně","Výrazně","Silně"],scores:[0,1,2,3]},
  {text:"Jak moc vám vadí 'imperfekce' – věci, které nejsou zcela symetrické?",context:"",options:["Vůbec mi to nevadí","Mírně","Výrazně","Nemohu to snést"],scores:[0,1,2,3]},
  {text:"Způsobuje vám OCD problémy se zdravím (dermatitida z mytí)?",context:"",options:["Ne","Mírné","Výrazné","Závažné zdravotní problémy"],scores:[0,1,2,3]},
  {text:"Jak moc OCD ovlivňuje vaši náladu?",context:"",options:["Vůbec","Mírně","Výrazně","Silně – trpím výraznou depresí"],scores:[0,1,2,3]},
  {text:"Zhoršily se vaše příznaky OCD v průběhu posledního roku?",context:"",options:["Ne, jsou stabilní nebo lepší","Mírně","Výrazně","Silně se zhoršily"],scores:[0,1,2,3]},
  {text:"Trpíte strachem z toho, že necháte doma rozsvícená světla nebo spuštěné spotřebiče?",context:"",options:["Ne","Příležitostně","Pravidelně","Každý den"],scores:[0,1,2,3]},
  {text:"Máte strach z kontaminace běžnými předměty (kliky, peníze)?",context:"",options:["Ne","Mírný","Výrazný","Silný – vyhýbám se dotyku"],scores:[0,1,2,3]},
  {text:"Hledáte opakovaně ujištění od blízkých nebo internetu?",context:"",options:["Ne","Příležitostně","Pravidelně","Každý den"],scores:[0,1,2,3]},
  {text:"Máte potřebu věci 'dělat znovu', dokud to 'nepocítíte správně'?",context:"",options:["Ne","Výjimečně","Pravidelně","Vždy – zabere to hodně času"],scores:[0,1,2,3]},
  {text:"Trápí vás strach z toho, že jste neúmyslně někoho poranili?",context:"",options:["Ne","Mírně","Výrazně","Silně – pravidelně se vracím zkontrolovat"],scores:[0,1,2,3]},
  {text:"Trpíte mentálními rituály (opakování slov v mysli)?",context:"",options:["Ne","Výjimečně","Pravidelně","Denně – zabere to hodně mentální energie"],scores:[0,1,2,3]},
  {text:"Jak moc vám OCD brání v dosahování osobních cílů?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Vyčleňujete rituálům čas v denním programu?",context:"",options:["Ne","Příležitostně","Pravidelně","Vždy – přizpůsobuji tomu celý den"],scores:[0,1,2,3]},
  {text:"Jak moc OCD ovlivňuje váš celkový pocit pohody a štěstí?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela mi bere radost ze života"],scores:[0,1,2,3]},
  {text:"Máte potřebu hromadit informace ze strachu, že je budete potřebovat?",context:"",options:["Ne","Mírně","Výrazně","Silně"],scores:[0,1,2,3]},
  {text:"Trávíte příliš mnoho času tříděním nebo organizováním věcí?",context:"",options:["Ne","Příležitostně","Pravidelně – hodinu nebo více denně","Každý den – je to hlavní aktivita"],scores:[0,1,2,3]},
  {text:"Jak moc OCD zasahuje do vašeho intimního nebo partnerského života?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela narušuje"],scores:[0,1,2,3]},
  {text:"Uvědomujete si, že vaše obsedantní myšlenky jsou přehnané nebo iracionální?",context:"",options:["Plně si to uvědomuji","Většinou ano","Někdy pochybuji","Ne, zdají se mi reálné"],scores:[3,2,1,0]},
  {text:"Mění se intenzita OCD příznaků v závislosti na stresu?",context:"",options:["Ne nebo jen mírně","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak dlouho trpíte příznaky, které jste popsali?",context:"",options:["Méně než 3 měsíce","3–12 měsíců","1–5 let","Více než 5 let"],scores:[0,1,2,3]},
  {text:"Jak moc se snažíte kontrolovat nebo potlačovat myšlenky?",context:"",options:["Vůbec","Mírně","Výrazně","Neustále"],scores:[0,1,2,3]},
  {text:"Přeceňujete pravděpodobnost negativních událostí?",context:"",options:["Ne","Mírně","Výrazně","Vždy – katastrofické myšlení"],scores:[0,1,2,3]},
  {text:"Vyhýbáte se nebo odkládáte rozhodnutí ze strachu z chyby?",context:"",options:["Ne","Mírně","Výrazně","Vždy – rozhodování mi trvá hodiny"],scores:[0,1,2,3]},
  {text:"Cítíte se nuceni kontrolovat e-maily nebo práci opakovaně?",context:"",options:["Ne","Občas","Pravidelně","Vždy"],scores:[0,1,2,3]},
  {text:"Máte potřebu se zpovídat nebo přiznávat věci, které nejsou přečiny?",context:"",options:["Ne","Výjimečně","Pravidelně","Velmi často"],scores:[0,1,2,3]},
  {text:"Cítíte nutkání dotknout se nebo uspořádat věci, dokud to 'nepůsobí správně'?",context:"",options:["Ne","Mírně","Výrazně","Silně"],scores:[0,1,2,3]},
  {text:"Jak moc vás trápí myšlenky na to, že jste morálně špatná osoba?",context:"",options:["Vůbec","Mírně","Výrazně","Velmi silně"],scores:[0,1,2,3]},
  {text:"Jak moc OCD narušuje vaši schopnost vykonávat denní povinnosti?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Jak rychle se myšlenka vrátí i po úspěšném potlačení?",context:"",options:["Obvykle ne","Do hodiny","Do 15 minut","Ihned"],scores:[0,1,2,3]},
  {text:"Jak moc OCD narušuje vaši schopnost relaxovat?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Jak dlouho trvá úzkost, pokud rituál neprovedete?",context:"",options:["Mizí během minut","Mizí do hodiny","Trvá hodiny","Trvá celý den nebo déle"],scores:[0,1,2,3]},
  {text:"Jak moc OCD ovlivňuje vaše sebevědomí?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela podkopává mé sebevědomí"],scores:[0,1,2,3]},
  {text:"Máte pocit zbytečnosti nebo beznaděje kvůli OCD příznakům?",context:"",options:["Ne","Občas","Pravidelně","Velmi často"],scores:[0,1,2,3]},
  {text:"Jak moc OCD ovlivňuje vaši chuť k jídlu nebo tělesnou hmotnost?",context:"",options:["Ne","Mírně","Výrazně","Silně"],scores:[0,1,2,3]},
  {text:"Jak moc OCD narušuje vaši schopnost soustředit se na čtení nebo sledování?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Cítíte potřebu věci opakovat, dokud se 'necítí dobře'?",context:"",options:["Ne","Vzácně","Pravidelně","Vždy"],scores:[0,1,2,3]},
  {text:"Obáváte se, že ztratíte kontrolu a uděláte něco hrozného?",context:"",options:["Ne","Mírně","Výrazně","Silně – je to stálá obava"],scores:[0,1,2,3]},
  {text:"Jak moc vás trápí myšlenka, že vaše myšlenky prozradí ostatní?",context:"",options:["Vůbec","Mírně","Výrazně","Silně"],scores:[0,1,2,3]},
  {text:"Trávíte čas analyzováním, zda jsou vaše myšlenky 'normální'?",context:"",options:["Ne","Občas","Pravidelně","Téměř neustále"],scores:[0,1,2,3]},
  {text:"Jak moc vás trápí strach z kontaminace vlastními tělesnými tekutinami?",context:"",options:["Vůbec","Mírně","Výrazně","Silně"],scores:[0,1,2,3]},
  {text:"Vyhýbáte se ostrým předmětům nebo jiným věcem ze strachu ze sebepoškození?",context:"",options:["Ne","Mírně","Výrazně","Silně"],scores:[0,1,2,3]},
  {text:"Jak moc OCD ovlivňuje vaši schopnost řídit nebo cestovat?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela mi to znemožňuje"],scores:[0,1,2,3]},
  {text:"Trápí vás vtíravé obrazy nebo vizuální představy?",context:"",options:["Ne","Příležitostně","Pravidelně","Denně – jsou velmi intenzivní"],scores:[0,1,2,3]},
  {text:"Jak moc OCD narušuje vaši schopnost plánovat nebo rozhodovat?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás opustit dům bez opakované kontroly, zda jste vše vypnuli?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – odchod trvá hodinu a více"],scores:[0,1,2,3]},
  {text:"Jak moc vás trápí obavy, že byste mohli způsobit požár nebo záplavu nepozorností?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – ovlivňuje to každý můj odchod z domova"],scores:[0,1,2,3]},
];

// ══════════════════════════════════════════════════════════════════════════════
//  ASD BANK – 100 otázek  (AQ-50, RAADS-R, SRS-2, DSM-5)  scores 0 nebo 1
// ══════════════════════════════════════════════════════════════════════════════
const ASD_BANK = [
  {text:"Je pro mě obtížné rozumět neverbálním signálům (výraz tváře, gesta).",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Rozhovory s neznámými lidmi jsou pro mě stresující.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže s udržením očního kontaktu v rozhovoru.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Lidé mi říkají, že mluvím příliš formálně nebo strojně.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Snadno si všimnu, když si někdo přeje ukončit rozhovor.",context:"",options:["Rozhodně souhlasím","Souhlasím","Nesouhlasím","Rozhodně nesouhlasím"],scores:[0,0,1,1]},
  {text:"Dokážu snadno číst mezi řádky konverzace.",context:"",options:["Rozhodně souhlasím","Souhlasím","Nesouhlasím","Rozhodně nesouhlasím"],scores:[0,0,1,1]},
  {text:"Je pro mě obtížné porozumět vtipům nebo ironii.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Cítím se ztracen/a, pokud skupina změní téma rozhovoru náhle.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Dokážu si představit, co druhý člověk prožívá nebo cítí.",context:"",options:["Rozhodně souhlasím","Souhlasím","Nesouhlasím","Rozhodně nesouhlasím"],scores:[0,0,1,1]},
  {text:"Mám tendenci brát věci doslovně a nechápu přenesené významy.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Je pro mě těžké začít konverzaci bez jasného tématu.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Lidé mi říkají, že skáču do řeči nebo nerespektuji pauzy.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Dokážu se snadno vcítit do situace druhého člověka.",context:"",options:["Rozhodně souhlasím","Souhlasím","Nesouhlasím","Rozhodně nesouhlasím"],scores:[0,0,1,1]},
  {text:"Přizpůsobuji svůj způsob komunikace různým lidem.",context:"",options:["Rozhodně souhlasím","Souhlasím","Nesouhlasím","Rozhodně nesouhlasím"],scores:[0,0,1,1]},
  {text:"Nedokážu snadno poznat, zda se osoba, se kterou mluvím, nudí.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Dávám přednost aktivitám o samotě před aktivitami ve skupině.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Raději dělám věci se stejnými lidmi než se stále novými skupinami.",context:"AQ-10",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Nové sociální situace jsou pro mě stresující nebo vyčerpávající.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Po sociálních setkáních se cítím vyčerpán/a a potřebuji být sám/sama.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Dokážu si snadno udělat nové přátele.",context:"",options:["Rozhodně souhlasím","Souhlasím","Nesouhlasím","Rozhodně nesouhlasím"],scores:[0,0,1,1]},
  {text:"Cítím se pohodlně na oslavách nebo večírcích s více lidmi.",context:"",options:["Rozhodně souhlasím","Souhlasím","Nesouhlasím","Rozhodně nesouhlasím"],scores:[0,0,1,1]},
  {text:"Mám pocit, že si s vrstevníky nerozumím nebo jsem 'jiný/á'.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Vztahy s druhými lidmi jsou pro mě složité nebo matoucí.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Těžko rozumím nepsaným sociálním pravidlům a normám.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Raději si povídám o konkrétních tématech než o pocitech nebo vztazích.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže s rozpoznáním, zda jsou lidé upřímní nebo přetvářejí se.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mívám konflikty s lidmi proto, že nerozumím jejich emocím.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Je pro mě těžké vyjádřit soucit nebo sympatie, i když je cítím.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám jeden nebo více zájmů, o které se zajímám mnohem intenzivněji než ostatní.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Lidé mi říkají, že o svých oblíbených tématech mluvím příliš dlouho.",context:"AQ-10",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Sbírám informace o specifickém tématu do velké hloubky.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Obtížně se soustředím na témata, která mě nezajímají.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Rád/a se soustředím na jednu věc najednou.",context:"AQ-10",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Moje zájmy se v čase příliš nemění – trvám na stejných oblíbených věcech.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Fascinuje mě fungování systémů – strojů, počítačů, procesů.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám tendenci sbírat informace o konkrétní oblasti (doprava, příroda, čísla).",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Změny v plánech nebo rutině mě rozrušují nebo stresují.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Raději chodím na stejná oblíbená místa než zkouším nová.",context:"AQ-10",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám pevné rutiny a rozrušuje mě, když je musím změnit.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Opakuji pohyby nebo gesta (kývání, třepání rukou, chůze v kruzích).",context:"Tzv. stimming.",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Musím věci dělat vždy ve stejném pořadí, jinak se cítím nepříjemně.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Obtížně se přizpůsobuji neplánovaným změnám (zpoždění, zrušení plánů).",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Nevím, co dělat, pokud je plánovaná aktivita náhle přerušena.",context:"AQ-10",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Opakuji určité fráze nebo zvuky pro vlastní potěšení nebo uklidnění.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže s přechodem mezi různými aktivitami během dne.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Silné zvuky (tleskání, alarm) jsou pro mě nepříjemně rušivé.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Konkrétní textury oblečení nebo potravin mi způsobují výraznou nepohodu.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Silná světla (fluorescenční, sluneční) mi způsobují diskomfort.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Intenzivní vůně nebo pachy mě výrazně ruší.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Neplánovaný fyzický dotek (poplácání po rameni) je pro mě nepříjemný.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Hluční nebo přeplnění prostory mě silně přetěžují.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Poruší-li někdo mou osobní zónu, cítím výrazné nepohodlí.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Smyslové přetížení mě vede k úniku nebo izolaci ze situace.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Snadno si všimnu detailů, které ostatní přehlédnou.",context:"AQ-10",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Dokážu si okamžitě vybavit čísla jako telefonní čísla nebo SPZ.",context:"AQ-10",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám výbornou paměť na fakta, ale hůře si pamatuji tváře.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Preferuji přesné a konkrétní instrukce před obecnými pokyny.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Dokážu se velmi hluboce soustředit na jedno téma (hyperfokus).",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mívám potíže s rozpoznáním tváří v davu nebo na fotografiích.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Lépe se učím, pokud jsou informace strukturované a logické.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám tendenci přemýšlet ve vzorcích, kategoriích nebo systémech.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže s rozpoznáním vlastních emocí v daný moment.",context:"Alexithymie.",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Intenzivní emoce vyjadřuji netypicky nebo nevhodně.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže se zklidněním po silném emočním zážitku.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Cítím silnou frustraci, pokud věci nejdou přesně podle plánu.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám tendenci mít intenzivní záchvaty vzteku nebo zklamání.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Obtížně rozpoznávám, kdy jsem unavený/á nebo hladový/á.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Po náročném dni se cítím zcela vyčerpán/a – sociální nebo smyslové přetížení.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám tendenci maskovat nebo skrývat své obtíže, abych zapadl/a.",context:"Tzv. masking.",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Po sociálních situacích si v mysli přehrávám, co jsem řekl/a.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže s organizací každodenních úkolů nebo plánováním.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Je pro mě obtížné odhadnout, kolik času mi zabere úkol.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže se spánkem – usínáním nebo probouzením.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže s přechodem z jedné aktivity na druhou.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Zapomínám na povinnosti, pokud nejsou v rutině nebo seznamu.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Je pro mě obtížné navigovat v neznámém prostředí.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Obtížně se mi dodržují společenské konvence jako zdvořilostní fráze.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám pocit, že jsem jiný/á než ostatní, aniž bych plně chápal/a proč.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Nechápu, proč by lidé mluvili o věcech, které nevíme jistě (drby, pomluvy).",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám silnou tendenci vnímat celky skrze jejich části a detaily.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Preferuji rutinní aktivity před experimentováním s novým.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám zvýšenou nebo sníženou citlivost na bolest.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Je pro mě přirozené sledovat, co druzí dělají, a přizpůsobit se jejich rytmu.",context:"",options:["Rozhodně souhlasím","Souhlasím","Nesouhlasím","Rozhodně nesouhlasím"],scores:[0,0,1,1]},
  {text:"Mám tendenci regulovat své emoce pomocí opakujících se pohybů nebo zvuků.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Obtížně chápu humor nebo sarkasmus v textu (zprávy, e-mail).",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže s regulací hlasitosti nebo tónu svého hlasu.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám zájem o témata, která ostatní považují za neobvyklá nebo příliš specifická.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Jak moc vás sociální situace vyčerpávají ve srovnání s ostatními?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,0,1,1]},
  {text:"Mám potíže s péčí o sebe (hygiena, oblékání) pokud to není v rutině.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Vyhýbám se skupinovým projektům nebo týmové práci.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže s improvizací nebo spontánní změnou plánu.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Cítím se pohodlněji v 1:1 komunikaci než ve skupinách.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám potíže s rozpoznáváním sociálních hierarchií nebo statusu.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám problémy s koordinací nebo obratností (špatná motorika).",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Obtížně rozumím, když mi někdo dá nepřímou instrukci nebo narážku.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám tendenci přerušovat ostatní, protože nemohu dočkat svého vstupu do hovoru.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Je pro mě obtížné sdílet zájem s druhými a vzájemně se přizpůsobovat tématu.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Mám rád/a přesná pravidla a nelíbí se mi, když jsou pravidla nejednoznačná.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Cítím se lépe ve strukturovaném prostředí než v prostředí se spoustou volnosti.",context:"",options:["Rozhodně nesouhlasím","Nesouhlasím","Souhlasím","Rozhodně souhlasím"],scores:[0,0,1,1]},
  {text:"Nemám problém sdílet emoce nebo intimní informace s druhými.",context:"",options:["Rozhodně souhlasím","Souhlasím","Nesouhlasím","Rozhodně nesouhlasím"],scores:[0,0,1,1]},
];

// ══════════════════════════════════════════════════════════════════════════════
//  ADHD BANK – 100 otázek  (ASRS-v1.1, Conners, Brown ADD, DSM-5)  scores 0–3
// ══════════════════════════════════════════════════════════════════════════════
const ADHD_BANK = [
  // ── Nepozornost ──
  {text:"Jak často děláte chyby z nepozornosti v práci nebo škole?",context:"ASRS – nepozornostní doména.",options:["Nikdy nebo vzácně","Příležitostně","Pravidelně","Velmi často nebo vždy"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás udržet pozornost při dlouhých úkolech?",context:"",options:["Vůbec obtížné","Mírně obtížné","Výrazně obtížné","Extrémně obtížné"],scores:[0,1,2,3]},
  {text:"Jak často ztrácíte věci potřebné k práci (klíče, telefon, doklady)?",context:"",options:["Vzácně","Příležitostně","Pravidelně","Téměř každý den"],scores:[0,1,2,3]},
  {text:"Jak snadno vás rozptyluje okolní prostředí nebo myšlenky?",context:"",options:["Vůbec snadno","Mírně","Výrazně","Extrémně – nedokážu se soustředit"],scores:[0,1,2,3]},
  {text:"Jak často zapomínáte na denní povinnosti nebo schůzky?",context:"",options:["Vzácně","Příležitostně","Pravidelně","Téměř vždy"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás poslouchat, co vám říkají, i když mluví přímo na vás?",context:"",options:["Vůbec obtížné","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak často nedokončujete úkoly nebo projekty, které jste začali?",context:"",options:["Vzácně","Příležitostně","Pravidelně","Téměř vždy"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás organizovat úkoly a aktivity?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – nedokážu se zorganizovat"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás soustředit se na čtení delšího textu?",context:"",options:["Vůbec obtížné","Mírně","Výrazně","Extrémně – musím číst znovu a znovu"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás sledovat pokyny nebo instrukce?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak snadno se vám toulají myšlenky při rozhovoru s někým?",context:"",options:["Vzácně","Příležitostně","Pravidelně","Velmi často"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás věnovat pozornost detailům?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak snadno procrastinujete (odkládáte) úkoly, které vyžadují soustředění?",context:"",options:["Vzácně","Příležitostně","Pravidelně","Téměř vždy"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás přepínat pozornost z jedné věci na druhou?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás pracovat na nudných nebo opakujících se úkolech?",context:"",options:["Vůbec","Mírně","Výrazně","Prakticky nemožné"],scores:[0,1,2,3]},
  // ── Hyperaktivita ──
  {text:"Jak obtížné je pro vás sedět klidně při setkáních nebo výuce?",context:"ASRS – hyperaktivní doména.",options:["Vůbec obtížné","Mírně","Výrazně","Extrémně – nemohu sedět klidně"],scores:[0,1,2,3]},
  {text:"Jak často vstáváte nebo opouštíte místo, když byste měli sedět?",context:"",options:["Vzácně","Příležitostně","Pravidelně","Velmi často"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás zůstat v klidu a nevrtět se?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás provádět tiché aktivity (čtení, puzzle)?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás zpomalit a jednat rozvážně?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – vždy jednám impulzivně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás čekat, až na vás přijde řada?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás mluvit příliš nahlas nebo příliš rychle?",context:"",options:["Nemám tento problém","Mírně","Výrazně","Silně – ostatní si na to stěžují"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás sedět klidně při jídle nebo filmech?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás přestat mluvit nebo přerušit aktivitu?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás čekat na odpovědi nebo výsledky?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  // ── Impulzivita ──
  {text:"Jak obtížné je pro vás neodpovídat dříve, než je otázka dokončena?",context:"ASRS – impulzivní doména.",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás nepřerušovat ostatní v rozhovoru?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – stále přerušuji"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás odolat impulzu nakupovat nebo utrácet?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás přemýšlet před mluvením nebo jednáním?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – vždy jednám bez rozmyslu"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás ovládnout emoční reakce (vztek, nadšení)?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás odolat impulzu dělat věci, které mohou mít negativní důsledky?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás neříkat věci, které mohou ublížit ostatním?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás dokončit věci, které jste začali, než přejdete k dalším?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – neustále přeskakuji"],scores:[0,1,2,3]},
  // ── Výkonné funkce ──
  {text:"Jak obtížné je pro vás plánovat a organizovat složité úkoly?",context:"Brown ADD – výkonné funkce.",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás odhadnout čas potřebný na úkoly?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – vždy se mýlím"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás začít úkol, i když víte, co máte dělat?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – nedokážu začít"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás prioritizovat úkoly podle důležitosti?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás přizpůsobit se změnám plánů nebo pravidel?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás udržet v pracovní paměti více informací najednou?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás začít pracovat bez vnějšího tlaku nebo deadlinu?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – potřebuji silný tlak"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás dokončit administrativní úkoly (formuláře, e-maily)?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – odkládám je donekonečna"],scores:[0,1,2,3]},
  // ── Regulace emocí ──
  {text:"Jak obtížné je pro vás ovládat vztek nebo frustraci?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – moje reakce jsou nepřiměřené"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás přijmout kritiku bez silné emoční reakce?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás stabilizovat náladu během dne?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – nálada se mění velmi rychle"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás neprožívat silné zklamání z malých překážek?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Cítíte se citlivý/á na odmítnutí nebo kritiku více než ostatní?",context:"Tzv. rejection sensitive dysphoria.",options:["Ne","Mírně","Výrazně","Extrémně – je to pro mě zdrcující"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás udržet motivaci pro úkoly bez okamžité odměny?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás přerušit zábavnou aktivitu a přejít na povinnosti?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás zvládat každodenní stres bez přetížení?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  // ── Hyperfokus ──
  {text:"Jak obtížné je pro vás přestat s aktivitou, která vás baví, i když je čas přestat?",context:"Hyperfokus – typický pro ADHD.",options:["Vůbec","Mírně","Výrazně","Extrémně – ztratím pojem o čase"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás všímat si okolí, když jste pohrouženi do zajímavé aktivity?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – nevidím nic okolo"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás přestat procházet internet nebo sociální sítě?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  // ── Dopad na život ──
  {text:"Do jaké míry ADHD příznaky narušují váš pracovní nebo studijní výkon?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela mi brání normálně fungovat"],scores:[0,1,2,3]},
  {text:"Jak moc ADHD příznaky ovlivňují vaše vztahy s ostatními?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela narušují"],scores:[0,1,2,3]},
  {text:"Jak moc ADHD ovlivňuje vaše finanční hospodaření?",context:"",options:["Vůbec","Mírně – občas utrácím zbytečně","Výrazně","Silně – mám finanční problémy"],scores:[0,1,2,3]},
  {text:"Jak moc ADHD narušuje váš spánek (usínání, probouzení)?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Jak moc ADHD ovlivňuje vaše sebevědomí nebo sebeúctu?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela podkopává mé sebevědomí"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás dokončit vzdělávání nebo kariérní cíle?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – nedokážu dokončit"],scores:[0,1,2,3]},
  {text:"Jak moc ADHD ovlivňuje vaši schopnost řídit auto nebo jiné dopravní prostředky?",context:"",options:["Vůbec","Mírně","Výrazně","Silně – je to nebezpečné"],scores:[0,1,2,3]},
  {text:"Jak moc ADHD narušuje vaši schopnost relaxovat nebo odpočívat?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela – nemohu se vypnout"],scores:[0,1,2,3]},
  {text:"Jak moc ADHD ovlivňuje vaši schopnost udržet zaměstnání?",context:"",options:["Vůbec","Mírně","Výrazně","Silně – měnil/a jsem práci kvůli tomu"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás dodržovat rutinu nebo harmonogram?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – rutina neexistuje"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás zvládat domácnost (úklid, vaření, nákupy)?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – domácnost je chaos"],scores:[0,1,2,3]},
  {text:"Jak moc vás ADHD příznaky stresují nebo trápí?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  // ── Spánek & energie ──
  {text:"Jak obtížné je pro vás uklidnit mysl a usnout?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – hovoří se o závodních myšlenkách"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás vstát ráno a začít den?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás udržet konstantní úroveň energie přes den?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – zhroutím se odpoledne"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás usnout bez obrazovky nebo stimulace?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – bez stimulace nemohu spát"],scores:[0,1,2,3]},
  // ── Paměť ──
  {text:"Jak obtížné je pro vás zapamatovat si to, co jste právě slyšeli?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás udržet v paměti seznam úkolů bez poznámek?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – bez poznámek zapomenu vše"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás pamatovat si, kde jste nechali věci?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás pamatovat si jména nových lidí?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – zapomenu okamžitě"],scores:[0,1,2,3]},
  // ── Sebedůvěra & vhled ──
  {text:"Trpíte pocitem, že jste méně schopní než ostatní, přestože máte talent?",context:"",options:["Ne","Mírně","Výrazně","Silně – je to trvalý pocit"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás věřit, že zvládnete dokončit projekt?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Stydíte se za ADHD příznaky natolik, že je skrýváte?",context:"",options:["Ne","Mírně","Výrazně","Zcela – nikdo o nich neví"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás neporovnávat se neustále s ostatními?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak moc ADHD příznaky ovlivňují váš celkový pocit pohody?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela mi bere radost ze života"],scores:[0,1,2,3]},
  {text:"Jak dlouho trpíte příznaky, které jste popsali?",context:"",options:["Méně než rok","1–3 roky","3–10 let","Celý život"],scores:[0,1,2,3]},
  {text:"Zhoršily se vaše příznaky ADHD v posledním roce?",context:"",options:["Ne, jsou stabilní","Mírně","Výrazně","Velmi se zhoršily"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás dodržet sliby nebo závazky vůči ostatním?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – sliby neplním"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás sledovat více konverzací nebo diskusí najednou?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak moc ADHD narušuje vaši schopnost číst nebo studovat?",context:"",options:["Vůbec","Mírně","Výrazně","Zcela"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás neodbíhat od tématu při psaní nebo mluvení?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – neustále odbíhám"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás zvládat více projektů najednou?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – vše zůstane nedokončeno"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás neprožívat pocit 'vnitřního neklidu'?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – nemohu být v klidu ani mentálně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás uhasit zájem o nový projekt po prvním nadšení?",context:"",options:["Vůbec","Mírně – zájem udrží po kratší dobu","Výrazně","Extrémně – projekt opustím po dnech"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás udržet pozornost při sledování filmů nebo přednášek?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – vždy přeskočím nebo odejdu"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás vyhnout se prokrastinaci i u důležitých úkolů?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – vše odkládám na poslední chvíli"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás dávat pozor na detaily při opakujících se úkolech?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – dělám stále stejné chyby"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás sledovat delší instrukce bez ztráty niti?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás dokončit papírování nebo administrativu včas?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – vždy pozdě nebo vůbec"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás vyhýbat se rizikové nebo impulzivní jízdě?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – mám za sebou nehody nebo pokuty"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás ovládat impulz ke koupi věcí, které nepotřebujete?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – mám finanční problémy z impulzivního nákupu"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás udržet pozornost při telefonních hovorech?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – vždy mi ujde část hovoru"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás neztratit trpělivost v dlouhých frontách nebo čekárnách?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – je to pro mě nesnesitelné"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás pracovat v tichém prostředí bez rozptýlení?",context:"Paradox ADHD – tiché prostředí může být rušivé.",options:["Vůbec","Mírně","Výrazně","Extrémně – potřebuji hluk nebo hudbu"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás dokončit konverzaci bez odbočení k jinému tématu?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – vždy odbočím"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás nereagovat emotivně na kritiku nebo odmítnutí?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – kritika mě zdrtí"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás soustředit se na rutinní každodenní chores?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – nemohu se přinutit"],scores:[0,1,2,3]},
  {text:"Jak obtížné je pro vás nepřerušovat vlastní práci kvůli novým nápadům nebo impulzům?",context:"",options:["Vůbec","Mírně","Výrazně","Extrémně – neustále odbíhám od rozpracovaných úkolů"],scores:[0,1,2,3]},
];

// ─── Scoring ──────────────────────────────────────────────────────────────────
function getResult(s, type) {
  const max = type === "ocd" ? Q_PER_TEST*3 : type === "adhd" ? Q_PER_TEST*3 : Q_PER_TEST;
  const pct = s / max;
  if (type === "ocd") {
    if (pct < 0.27) return {label:"Subklinická",     color:C.green,  bg:C.greenLight,  border:C.greenBorder,  text:"Skóre naznačuje, že obsedantně-kompulzivní příznaky jsou v normálním nebo subklinickém rozsahu.", rec:"Žádná intervence není doporučena. Pokud se příznaky zhorší, zvažte konzultaci s odborníkem."};
    if (pct < 0.53) return {label:"Mírná",           color:C.yellow, bg:C.yellowLight, border:C.yellowBorder, text:"Mírné OCD příznaky. Mohou způsobovat lehké nepohodlí, ale neznemožňují každodenní fungování.", rec:"Zvažte konzultaci s psychologem nebo psychiatrem."};
    if (pct < 0.80) return {label:"Středně závažná", color:C.ocd,    bg:C.ocdLight,    border:C.ocdBorder,    text:"Středně závažné příznaky, které pravděpodobně výrazně ovlivňují kvalitu každodenního života.", rec:"Doporučena odborná pomoc — CBT terapie nebo farmakoterapie (SSRI)."};
    return               {label:"Závažná",           color:C.red,    bg:C.redLight,    border:C.redBorder,    text:"Závažné OCD příznaky způsobující výrazné omezení každodenního fungování.", rec:"Doporučena okamžitá odborná pomoc psychiatra nebo klinického psychologa."};
  }
  if (type === "asd") {
    if (pct <= 0.27) return {label:"Pod prahem",        color:C.green,  bg:C.greenLight,  border:C.greenBorder,  text:"Skóre je pod klinickým prahem. Výsledky nenaznačují klinicky významné rysy autistického spektra.", rec:"Žádná intervence není indikována."};
    if (pct <  0.60) return {label:"Hraniční",          color:C.yellow, bg:C.yellowLight, border:C.yellowBorder, text:"Hraniční skóre — některé rysy autistického spektra jsou přítomny, ale nedosahují klinického prahu.", rec:"Zvažte konzultaci s odborníkem, pokud příznaky ovlivňují každodenní život."};
    if (pct <= 0.80) return {label:"Nad klinický práh", color:C.ocd,    bg:C.ocdLight,    border:C.ocdBorder,    text:"Skóre překračuje klinický práh. Výsledky naznačují přítomnost rysů autistického spektra.", rec:"Doporučena komplexní diagnostická evaluace odborníkem na ASD."};
    return                  {label:"Výrazně nad práh",  color:C.red,    bg:C.redLight,    border:C.redBorder,    text:"Výrazně nadprahové skóre naznačující výraznější rysy autistického spektra.", rec:"Doporučena urgentní diagnostická evaluace specialistou na ASD."};
  }
  // adhd
  if (pct < 0.27) return {label:"Subklinická",     color:C.green,  bg:C.greenLight,  border:C.greenBorder,  text:"Skóre naznačuje, že příznaky ADHD jsou v normálním nebo subklinickém rozsahu.", rec:"Žádná intervence není doporučena. Pokud se příznaky zhorší, zvažte konzultaci."};
  if (pct < 0.53) return {label:"Mírná",           color:C.yellow, bg:C.yellowLight, border:C.yellowBorder, text:"Mírné příznaky ADHD. Mohou ovlivňovat výkon, ale každodenní fungování je zachováno.", rec:"Zvažte konzultaci s psychiatrem nebo psychologem specializovaným na ADHD."};
  if (pct < 0.80) return {label:"Středně závažná", color:C.adhd,   bg:C.adhdLight,   border:C.adhdBorder,   text:"Středně závažné příznaky ADHD, které pravděpodobně výrazně ovlivňují každodenní život a výkon.", rec:"Doporučena odborná pomoc — psychiatrická evaluace, behaviorální terapie nebo farmakoterapie."};
  return               {label:"Závažná",           color:C.red,    bg:C.redLight,    border:C.redBorder,    text:"Závažné příznaky ADHD způsobující výrazné omezení fungování v práci, škole i osobním životě.", rec:"Doporučena okamžitá psychiatrická evaluace a zahájení léčby (farmakoterapie + CBT)."};
}

// ─── Components ───────────────────────────────────────────────────────────────
function Pill({children, color, bg, border}) {
  return <span style={{display:"inline-flex",alignItems:"center",fontSize:11,fontWeight:600,padding:"3px 11px",borderRadius:99,background:bg,color,border:`1px solid ${border}`}}>{children}</span>;
}

function DonutChart({score, maxScore, color}) {
  const [dash, setDash] = useState(0);
  const r=52, circ=2*Math.PI*r;
  useEffect(()=>{const t=setTimeout(()=>setDash((score/maxScore)*circ),150);return()=>clearTimeout(t);},[score]);
  const pct=Math.round((score/maxScore)*100);
  return (
    <div style={{position:"relative",width:136,height:136,flexShrink:0}}>
      <svg width="136" height="136" viewBox="0 0 136 136" style={{transform:"rotate(-90deg)"}}>
        <circle cx="68" cy="68" r={r} fill="none" stroke={C.surface2} strokeWidth="14"/>
        <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 1.1s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:27,fontWeight:800,color,lineHeight:1,letterSpacing:"-0.02em"}}>{pct}%</span>
        <span style={{fontSize:10,color:C.textMuted,marginTop:3,letterSpacing:"0.06em",textTransform:"uppercase"}}>skóre</span>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState("home");
  const [testType, setTestType]   = useState(null);
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [hovCard, setHovCard]     = useState(null);
  const [sessionQs, setSessionQs] = useState([]);

  const cfg = {
    ocd:  {accent:C.ocd,  light:C.ocdLight,  border:C.ocdBorder,  max:Q_PER_TEST*3, bank:OCD_BANK,  label:"OCD · Y-BOCS"},
    asd:  {accent:C.asd,  light:C.asdLight,  border:C.asdBorder,  max:Q_PER_TEST,   bank:ASD_BANK,  label:"ASD · AQ"},
    adhd: {accent:C.adhd, light:C.adhdLight, border:C.adhdBorder, max:Q_PER_TEST*3, bank:ADHD_BANK, label:"ADHD · ASRS"},
  };
  const t = testType && cfg[testType];
  const accent = t ? t.accent : C.ocd;
  const accentLight = t ? t.light : C.ocdLight;
  const accentBorder = t ? t.border : C.ocdBorder;
  const maxScore = t ? t.max : 45;
  const totalScore = answers.reduce((a,b)=>a+b,0);
  const result = screen==="results" && testType ? getResult(totalScore, testType) : null;

  function startTest(type) {
    const qs = pick(cfg[type].bank, Q_PER_TEST);
    setSessionQs(qs); setTestType(type); setCurrentQ(0); setAnswers([]); setSelected(null); setScreen("quiz");
  }
  function handleNext() {
    if (selected===null) return;
    const na=[...answers, sessionQs[currentQ].scores[selected]];
    setAnswers(na); setSelected(null);
    if (currentQ+1>=Q_PER_TEST) setScreen("results"); else setCurrentQ(currentQ+1);
  }
  function goHome() { setScreen("home"); setTestType(null); setCurrentQ(0); setAnswers([]); setSelected(null); setSessionQs([]); }

  const wrap={minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"-apple-system,'Segoe UI',sans-serif",maxWidth:430,margin:"0 auto",paddingBottom:48};

  // ── HOME ───────────────────────────────────────────────────────────────────
  if (screen==="home") return (
    <div style={wrap}>
      <div style={{padding:"18px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#C96442,#6A42C9)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
            <span style={{fontSize:15}}>🧠</span>
          </div>
          <span style={{fontWeight:800,fontSize:16,letterSpacing:"-0.02em"}}>MindScope</span>
        </div>
        <span style={{fontSize:11,color:C.textMuted,background:C.surface,padding:"4px 11px",borderRadius:99,border:`1px solid ${C.border}`,fontWeight:500}}>Beta</span>
      </div>

      <div style={{padding:"30px 20px 24px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.surface,border:`1px solid ${C.border}`,borderRadius:99,padding:"5px 12px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:C.green,display:"inline-block"}}/>
          <span style={{fontSize:11,color:C.textMuted,fontWeight:600,letterSpacing:"0.05em"}}>KLINICKÝ SCREENING</span>
        </div>
        <h1 style={{fontSize:36,fontWeight:900,letterSpacing:"-0.035em",lineHeight:1.08,marginBottom:12,color:C.text}}>
          Zjistěte více<br/>
          <span style={{background:"linear-gradient(90deg,#C96442,#6A42C9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>o své mysli</span>
        </h1>
        <p style={{fontSize:14,color:C.textMid,lineHeight:1.7,maxWidth:310}}>
          Tři screeningové dotazníky — OCD, autismus a ADHD. Každý test vybere náhodně {Q_PER_TEST} otázek z databáze 100+ — výsledky jsou pokaždé jiné.
        </p>
      </div>

      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:12}}>
        {[
          {key:"ocd",  emoji:"🔁", label:"Obsedantní porucha",   title:"OCD Screen",  color:C.ocd,  light:C.ocdLight,  border:C.ocdBorder,  grad:"linear-gradient(90deg,#C96442,#E8956A)", desc:"Adaptace Y-BOCS, OCI-R a DSM-5 — mezinárodně uznávané klinické nástroje pro hodnocení závažnosti OCD příznaků.", tags:[["15 otázek",C.ocdLight,C.ocdBorder,C.ocd],["~7 min",C.surface2,C.border,C.textMid],["Y-BOCS / OCI-R",C.surface2,C.border,C.textMid]]},
          {key:"asd",  emoji:"🧩", label:"Autistické spektrum",  title:"ASD Screen",  color:C.asd,  light:C.asdLight,  border:C.asdBorder,  grad:"linear-gradient(90deg,#3B6EA8,#6A9EE8)", desc:"Adaptace AQ-50, RAADS-R a SRS-2 — validované screeningové nástroje pro dospělé (Baron-Cohen, Ritvo et al.).", tags:[["15 otázek",C.asdLight,C.asdBorder,C.asd],["~6 min",C.surface2,C.border,C.textMid],["AQ / RAADS-R",C.surface2,C.border,C.textMid]]},
          {key:"adhd", emoji:"⚡", label:"Porucha pozornosti",   title:"ADHD Screen", color:C.adhd, light:C.adhdLight, border:C.adhdBorder, grad:"linear-gradient(90deg,#6A42C9,#9A72E8)", desc:"Adaptace ASRS-v1.1, Brown ADD Scales a DSM-5 kritérií — klinicky validované nástroje pro diagnostiku ADHD u dospělých.", tags:[["15 otázek",C.adhdLight,C.adhdBorder,C.adhd],["~7 min",C.surface2,C.border,C.textMid],["ASRS / Brown ADD",C.surface2,C.border,C.textMid]]},
        ].map(card=>(
          <div key={card.key}
            onClick={()=>startTest(card.key)}
            onMouseEnter={()=>setHovCard(card.key)}
            onMouseLeave={()=>setHovCard(null)}
            style={{background:C.surface,border:`1px solid ${hovCard===card.key?card.border:C.border}`,borderRadius:20,padding:"20px 22px 18px",cursor:"pointer",
              boxShadow:hovCard===card.key?"0 8px 28px rgba(0,0,0,0.1)":"0 2px 10px rgba(0,0,0,0.055)",
              transform:hovCard===card.key?"translateY(-2px)":"translateY(0)",
              transition:"all 0.2s ease",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:card.grad,borderRadius:"20px 20px 0 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <Pill color={card.color} bg={card.light} border={card.border}>{card.label}</Pill>
              <div style={{width:32,height:32,borderRadius:9,background:card.light,border:`1px solid ${card.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{card.emoji}</div>
            </div>
            <div style={{fontSize:23,fontWeight:800,letterSpacing:"-0.02em",color:C.text,marginBottom:7}}>{card.title}</div>
            <div style={{fontSize:12.5,color:C.textMid,lineHeight:1.65,marginBottom:16}}>{card.desc}</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {card.tags.map(([lbl,bg,brd,clr])=>(
                <span key={lbl} style={{fontSize:11,fontWeight:500,padding:"4px 10px",borderRadius:99,background:bg,color:clr,border:`1px solid ${brd}`}}>{lbl}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{margin:"18px 16px 0",padding:"13px 16px",background:"#FFFBF0",border:`1px solid ${C.yellowBorder}`,borderRadius:12,fontSize:12.5,color:"#7A6010",lineHeight:1.75}}>
        <b>⚠️ Upozornění: </b>Tato aplikace slouží pouze pro orientační screening a nenahrazuje odborné lékařské vyšetření. V případě obav navštivte psychiatra nebo psychologa.
      </div>
    </div>
  );

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (screen==="quiz" && sessionQs.length>0) {
    const q=sessionQs[currentQ], pct=((currentQ+1)/Q_PER_TEST)*100;
    return (
      <div style={wrap}>
        <div style={{padding:"18px 20px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <button onClick={goHome} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",border:`1px solid ${C.border}`,borderRadius:99,background:C.surface,color:C.textMid,fontSize:13,fontWeight:500,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>← Zpět</button>
            <Pill color={accent} bg={accentLight} border={accentBorder}>{t.label}</Pill>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textMuted,marginBottom:8,fontWeight:600}}>
            <span>Otázka {currentQ+1} z {Q_PER_TEST}</span><span>{Math.round(pct)}%</span>
          </div>
          <div style={{height:6,background:C.surface2,borderRadius:99,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${accent},${accent}BB)`,borderRadius:99,transition:"width 0.35s ease"}}/>
          </div>
        </div>

        <div style={{padding:"24px 20px 14px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Otázka {currentQ+1}</div>
          <div style={{fontSize:19,fontWeight:700,lineHeight:1.42,color:C.text,marginBottom:10,letterSpacing:"-0.01em"}}>{q.text}</div>
          {q.context&&<div style={{fontSize:12.5,color:C.textMuted,lineHeight:1.6,fontStyle:"italic",padding:"9px 13px",background:C.surface2,borderRadius:10,border:`1px solid ${C.border}`}}>{q.context}</div>}
        </div>

        <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:9}}>
          {q.options.map((opt,i)=>{
            const sel=selected===i;
            return (
              <div key={i} onClick={()=>setSelected(i)} style={{
                background:sel?accentLight:C.surface,border:`1.5px solid ${sel?accent:C.border}`,
                borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:13,
                boxShadow:sel?`0 0 0 3px ${accent}22`:"0 1px 3px rgba(0,0,0,0.04)",transition:"all 0.17s ease"}}>
                <div style={{width:30,height:30,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,
                  background:sel?accent:C.surface2,color:sel?"#fff":C.textMuted,border:`1px solid ${sel?accent:C.border}`,transition:"all 0.17s"}}>{LETTERS[i]}</div>
                <span style={{fontSize:13.5,color:sel?C.text:C.textMid,lineHeight:1.45,fontWeight:sel?600:400}}>{opt}</span>
                {sel&&<span style={{marginLeft:"auto",color:accent,fontSize:15,flexShrink:0,fontWeight:700}}>✓</span>}
              </div>
            );
          })}
        </div>

        <div style={{padding:"18px 16px 0"}}>
          <button onClick={handleNext} disabled={selected===null} style={{
            width:"100%",padding:"15px 20px",border:"none",borderRadius:14,fontSize:14,fontWeight:700,letterSpacing:"0.01em",
            background:selected!==null?`linear-gradient(135deg,${accent},${accent}CC)`:C.surface2,
            color:selected!==null?"#fff":C.textMuted,cursor:selected!==null?"pointer":"not-allowed",
            boxShadow:selected!==null?`0 4px 16px ${accent}44`:"none",transition:"all 0.2s ease"}}>
            {currentQ===Q_PER_TEST-1?"Zobrazit výsledky →":"Další otázka →"}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (screen==="results"&&result) {
    const pct=Math.round((totalScore/maxScore)*100);
    const isASD = testType==="asd";
    const ranges = isASD
      ? [["0–27 %","Pod klinickým prahem",C.green,C.greenLight,C.greenBorder],["28–59 %","Hraniční pásmo",C.yellow,C.yellowLight,C.yellowBorder],["60–80 %","Nad klinický práh",C.ocd,C.ocdLight,C.ocdBorder],["81–100 %","Výrazně nad práh",C.red,C.redLight,C.redBorder]]
      : [["0–27 %","Subklinická",C.green,C.greenLight,C.greenBorder],["28–52 %","Mírná",C.yellow,C.yellowLight,C.yellowBorder],["53–79 %","Středně závažná",testType==="adhd"?C.adhd:C.ocd,testType==="adhd"?C.adhdLight:C.ocdLight,testType==="adhd"?C.adhdBorder:C.ocdBorder],["80–100 %","Závažná",C.red,C.redLight,C.redBorder]];
    const titleMap = {ocd:"OCD Screening",asd:"ASD Screening",adhd:"ADHD Screening"};
    const subtitleMap = {ocd:"Y-BOCS / OCI-R – 15 náhodných otázek z banky 100+",asd:"AQ / RAADS-R – 15 náhodných otázek z banky 100+",adhd:"ASRS-v1.1 / Brown ADD – 15 náhodných otázek z banky 100+"};

    return (
      <div style={wrap}>
        <div style={{padding:"18px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={goHome} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",border:`1px solid ${C.border}`,borderRadius:99,background:C.surface,color:C.textMid,fontSize:13,fontWeight:500,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>← Nový test</button>
          <Pill color={accent} bg={accentLight} border={accentBorder}>{t.label}</Pill>
        </div>

        <div style={{padding:"22px 20px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Výsledek screeningu</div>
          <h2 style={{fontSize:28,fontWeight:900,letterSpacing:"-0.025em",color:C.text,marginBottom:6,lineHeight:1.12}}>{titleMap[testType]}</h2>
          <p style={{fontSize:13,color:C.textMid,lineHeight:1.6}}>{subtitleMap[testType]}</p>
        </div>

        {/* Donut */}
        <div style={{margin:"0 16px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,boxShadow:"0 2px 10px rgba(0,0,0,0.055)",padding:22,display:"flex",alignItems:"center",gap:22}}>
          <DonutChart score={totalScore} maxScore={maxScore} color={accent}/>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.textMuted,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Celkové skóre</div>
            <div style={{fontSize:36,fontWeight:900,letterSpacing:"-0.03em",color:accent,lineHeight:1}}>{totalScore}<span style={{fontSize:16,color:C.textMuted,fontWeight:400}}> / {maxScore}</span></div>
            <div style={{margin:"10px 0 8px"}}><Pill color={result.color} bg={result.bg} border={result.border}>{result.label}</Pill></div>
            <div style={{height:5,background:C.surface2,borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:accent,borderRadius:99,transition:"width 1s ease"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              {["0","50%","100%"].map(v=><span key={v} style={{fontSize:10,color:C.textMuted}}>{v}</span>)}
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div style={{margin:"0 16px 12px",background:C.surface,border:`1px solid ${C.border}`,borderLeft:`3px solid ${result.color}`,borderRadius:16,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",padding:20}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Interpretace</div>
          <p style={{fontSize:13.5,color:C.textMid,lineHeight:1.7,margin:0}}>{result.text}</p>
        </div>

        {/* Ranges */}
        <div style={{margin:"0 16px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",padding:20}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>Interpretační tabulka</div>
          {ranges.map(([range,label,color,bg,brd])=>(
            <div key={range} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12.5,color:C.textMid,fontWeight:500}}>{range}</span>
              <Pill color={color} bg={bg} border={brd}>{label}</Pill>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div style={{margin:"0 16px 12px",background:result.bg,border:`1px solid ${result.border}`,borderRadius:16,padding:20}}>
          <div style={{fontSize:11,fontWeight:700,color:result.color,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>💡 Doporučení</div>
          <p style={{fontSize:13.5,color:C.text,lineHeight:1.7,margin:0}}>{result.rec}</p>
        </div>

        {/* Disclaimer */}
        <div style={{margin:"0 16px 16px",padding:"13px 16px",background:"#FFFBF0",border:`1px solid ${C.yellowBorder}`,borderRadius:12,fontSize:12,color:"#7A6010",lineHeight:1.75}}>
          <b>Důležité: </b>Tento screening je orientační a není lékařskou diagnózou. Přesné stanovení diagnózy vyžaduje klinické vyšetření psychiatrem nebo psychologem.
        </div>

        <div style={{padding:"0 16px 4px"}}>
          <button onClick={()=>startTest(testType)} style={{width:"100%",marginBottom:10,padding:"14px 20px",border:"none",borderRadius:14,fontSize:14,fontWeight:700,background:`linear-gradient(135deg,${accent},${accent}CC)`,color:"#fff",cursor:"pointer",boxShadow:`0 4px 16px ${accent}44`}}>
            🔀 Zopakovat test (nové otázky)
          </button>
          <button onClick={goHome} style={{width:"100%",padding:"14px 20px",border:`1px solid ${C.border}`,borderRadius:14,fontSize:14,fontWeight:600,background:C.surface,color:C.textMid,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
            ← Zpět na hlavní stránku
          </button>
        </div>
      </div>
    );
  }
  return null;
}
