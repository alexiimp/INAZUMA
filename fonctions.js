// ===== Choix déterministe du joueur du jour =====

function createSeededRandom(seed) {
    let value = seed >>> 0;
    return function () {
        value += 0x6D2B79F5;
        let result = value;
        result = Math.imul(result ^ result >>> 15, result | 1);
        result ^= result + Math.imul(result ^ result >>> 7, result | 61);
        return ((result ^ result >>> 14) >>> 0) / 4294967296;
    };
}

function hashSeed(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function seededShuffle(array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getDayNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor(start.getTime() / 86400000);
}

function getEligiblePlayers(doc, pageName) {
    if (pageName === 'Classique') {
        return doc.map(joueur => joueur['Nom']);
    }
    return doc.filter(joueur => joueur[pageName]).map(joueur => joueur['Nom']);
}

function getJoueurDuJourStorageKey(pageName) {
    return 'inazumadle_joueurDuJour_' + pageName;
}

function pickExtraForPlayer(joueur, pageName, random) {
    if (pageName === 'Classique' || pageName === 'Description') {
        const descriptions = joueur['Description'].split('-');
        return descriptions[Math.floor(random() * descriptions.length)];
    }
    if (pageName === 'Supertechniques') {
        const techniques = joueur['Supertechniques'].split('-');
        return techniques[Math.floor(random() * techniques.length)];
    }
    if (pageName === 'Multi') {
        const techniques = joueur['Multi'].split('-');
        return techniques[Math.floor(random() * techniques.length)];
    }
    return null;
}

function buildWeeklySchedule(doc, pageName, weekId) {
    const random = createSeededRandom(hashSeed(pageName + ':' + weekId));
    const eligibleNoms = getEligiblePlayers(doc, pageName);
    const shuffledNoms = seededShuffle([...eligibleNoms], random).slice(0, Math.min(7, eligibleNoms.length));
    const days = shuffledNoms.map(nom => {
        const joueur = doc.find(j => j['Nom'] === nom);
        return { nom, extra: pickExtraForPlayer(joueur, pageName, random) };
    });
    return { version: 2, weekId, days };
}

function isValidSchedule(schedule, weekId) {
    return schedule
        && schedule.version === 2
        && schedule.weekId === weekId
        && Array.isArray(schedule.days)
        && schedule.days.length > 0
        && schedule.days.every(day => day.nom && day.extra);
}

function getOrCreateWeeklySchedule(doc, pageName) {
    const weekId = Math.floor(getDayNumber() / 7);
    const storageKey = getJoueurDuJourStorageKey(pageName);
    const eligible = getEligiblePlayers(doc, pageName);

    if (eligible.length === 0) {
        return null;
    }

    let schedule = null;
    try {
        schedule = JSON.parse(localStorage.getItem(storageKey));
    } catch (e) {
        schedule = null;
    }

    if (!isValidSchedule(schedule, weekId)) {
        schedule = buildWeeklySchedule(doc, pageName, weekId);
        localStorage.setItem(storageKey, JSON.stringify(schedule));
    }

    const dayIndex = getDayNumber() % 7;
    return schedule.days[dayIndex % schedule.days.length];
}

function selectJoueurDuJour(doc) {
    const pageName = getPageName();
    const entry = getOrCreateWeeklySchedule(doc, pageName);
    if (entry) {
        const el = document.getElementById('joueurdujour');
        el.innerText = entry.nom;
        if (entry.extra) {
            el.dataset.extra = entry.extra;
        } else {
            delete el.dataset.extra;
        }
    }
}

// ===== Chargement du CSV et préparation des informations =====

async function getCsv(){
    let res= await fetch('joueurs.csv');
    let text=  await res.text();
    let doc = []
    let lignes = text.split(/\r?\n/).filter(ligne => ligne.length > 0);
    const headers = lignes[0].split(",");
    for (var i = 1 ; i<lignes.length ; i++) {
        var obj = {};
        var current = lignes[i].split(",");
        for (var j = 0; j < current.length; j++) {
            obj[headers[j]] = current[j];
        }
        doc.push(obj);
    }
    selectJoueurDuJour(doc);
    getJoueurInfo()
    return doc
}
const csv = getCsv();
var joueurDuJour;
function getJoueurInfo(){
    const joueurDuJourEl = document.getElementById('joueurdujour');
    joueurDuJour = joueurDuJourEl.innerText;
    const extra = joueurDuJourEl.dataset.extra;
    console.log(joueurDuJour)
    csv.then((s)=>{
        for (let joueur of s){
            if (joueur['Nom']===joueurDuJour){
                if(getPageName()==='Classique'){
                    document.getElementById('indiceApparition').getElementsByTagName('p')[1].innerText = joueur['Episode'].replaceAll(';',',')
                    document.getElementById('indiceDescription').getElementsByTagName('p')[1].innerText = extra.replace(';',',')
                    initGameState();
                }
                else if (getPageName()==='Description'){
                    document.getElementById('description').innerText = '"'+extra.replaceAll(';',',')+'"'
                    document.getElementById('indicePoste').getElementsByTagName('p')[1].innerText = joueur['Poste']
                    document.getElementById('indiceEquipe').getElementsByTagName('p')[1].innerText = joueur['Equipe']
                    initGameState();
                }
                else if(getPageName()==='Supertechniques'){
                    let img = document.getElementById('video')
                    img.setAttribute('alt','video de la technique normalement')
                    img.setAttribute('src',cache+'techniques/solo/'+extra.replaceAll(' ','%20'))
                    let imgClaire = document.getElementById('videoClaire')
                    imgClaire.setAttribute('alt',img.getAttribute('alt'))
                    imgClaire.setAttribute('src',img.getAttribute('src'))
                    console.log(img.src)
                    initGameState();
                }
                else if (getPageName()==='Multi'){
                    let img = document.getElementById('video')
                    img.setAttribute('alt','video de la technique normalement')
                    img.setAttribute('src',cache+'techniques/multi/'+extra.replaceAll(' ','%20'))
                    let imgClaire = document.getElementById('videoClaire')
                    imgClaire.setAttribute('alt',img.getAttribute('alt'))
                    imgClaire.setAttribute('src',img.getAttribute('src'))
                    getJoueursTechnique(extra, initGameState)
                    console.log(joueurDuJour)
                    console.log(extra)
                }

            }

        }
    })
}
const cache = 'https://raw.githubusercontent.com/alexiimp/cache_inazumadle/refs/heads/main/images/';

const dejaVu =[];
const trouve=[];

// ===== Sauvegarde et restauration de la progression =====

function getProgressStorageKey(pageName) {
    return 'inazumadle_progress_' + pageName + '_' + getDayNumber();
}

function resetInazumadleSave(reload = true) {
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith('inazumadle_joueurDuJour_') || key.startsWith('inazumadle_progress_')) {
            localStorage.removeItem(key);
        }
    }
    if (reload) {
        location.reload();
    }
}

function getDefaultProgress(joueurNom) {
    return { joueurNom, dejaVu: [], trouve: [], won: false, indicesReveles: [], blur: 0 };
}

function loadProgress(joueurNom) {
    try {
        const saved = JSON.parse(localStorage.getItem(getProgressStorageKey(getPageName())));
        if (saved && saved.joueurNom === joueurNom) {
            return saved;
        }
    } catch (e) {}
    return getDefaultProgress(joueurNom);
}

function getRevealedIndices() {
    const indices = document.getElementById('indices');
    if (!indices) {
        return [];
    }
    return [...indices.children]
        .filter(indice => indice.style.transform === 'rotateY(180deg)')
        .map(indice => indice.id);
}

function saveProgress() {
    const victoire = document.getElementById('victoire');
    const progress = {
        joueurNom: document.getElementById('joueurdujour').innerText,
        dejaVu: [...dejaVu],
        trouve: [...trouve],
        won: victoire && victoire.style.display === 'flex',
        indicesReveles: getRevealedIndices(),
        blur: typeof blur !== 'undefined' ? blur : 0,
    };
    localStorage.setItem(getProgressStorageKey(getPageName()), JSON.stringify(progress));
}

function restoreIndices(ids) {
    if (!ids || !ids.length) {
        return;
    }
    for (const id of ids) {
        const indice = document.getElementById(id);
        if (indice) {
            indice.classList.add('disponible');
            indice.style.transform = 'rotateY(180deg)';
        }
    }
}

function initGameState() {
    const joueurNom = document.getElementById('joueurdujour').innerText;
    const progress = loadProgress(joueurNom);

    dejaVu.push(...progress.dejaVu);
    trouve.push(...progress.trouve);

    if (progress.blur && typeof blur !== 'undefined') {
        blur = progress.blur;
        const blurred = document.getElementById('blurred');
        if (blurred && blurred.checked) {
            deblur();
        }
    }

    if (progress.dejaVu.length > 0) {
        const instructions = document.getElementById('instructions');
        if (instructions) {
            instructions.style.display = 'none';
        }
    }

    if (!progress.dejaVu.length && !progress.won) {
        return;
    }

    csv.then(() => {
        for (const nom of progress.dejaVu) {
            afficheComparaison(nom, true);
        }
        if (getPageName() === 'Multi') {
            for (const nom of trouve) {
                revealMultiJoueur(nom, cache + "personnages/" + nom.replaceAll(' ', '-') + ".jpg");
            }
        }
        etatIndice();
        restoreIndices(progress.indicesReveles);
        if (progress.won) {
            const winNom = getPageName() === 'Multi'
                ? progress.dejaVu[progress.dejaVu.length - 1]
                : joueurDuJour;
            win(winNom, true);
        }
    });
}

function getPageName(){
    return document.getElementsByTagName('title')[0].innerText.replaceAll(" ","").split('-')[1]
}

// ===== Vérification et recherche des noms =====

function VerifNom(nom,char){
    let noms = nom.split(' ');
    let chars = char.split(' ');
    if (chars.length>noms.length){
        return false
    }
    for (var x = 0;x < noms.length-(chars.length-1);x++){
        for (var y= 0 ; y < chars.length;y++){
            if (!noms[x+y].toLowerCase().startsWith(chars[y].toLowerCase())){
                break
            }
            if (y===chars.length-1){
                return true
            }
        }
    }
    return false;
}
function VerifSurnoms(surnoms,char){
    let listeSurnoms = surnoms.split('-');
    for (let surnom in listeSurnoms){

        if (VerifNom(listeSurnoms[surnom],char)){
            return [true,listeSurnoms[surnom]];
        }
    }
    return [false];
}

// ===== Comparaison des réponses avec le joueur du jour =====

function afficheComparaison(nom1, isRestore = false){
    csv.then((s)=>{
        let j1;
        let j2;
        for (let joueur1 in s){
            joueur1=s[joueur1]
            if (joueur1['Nom'].toLowerCase()===nom1.toLowerCase()){
                j1=joueur1;
            }
            if (joueur1['Nom']===joueurDuJour || joueurDuJour.includes(joueur1['Nom'])){
                j2=joueur1;
            }
            if (j1 && j2)
                break //on quitte la boucle si les deux personnages sont trouvés
        }
        if (!j1){/*Si le nom ne correspond a aucun perso*/
            return
        }
        if (!isRestore) {
            /*On reboot la liste de perso et le zone de texte*/
            let text = document.getElementById('guess')
            text.value = ""
            afficherPersos()
            dejaVu.push(j1['Nom']);
        }
        let row;
        let table = document.getElementById('comp');
        if (getPageName()==='Classique'){
            row = table.insertRow(1)
            for (let cle in j1){
                compareClassique(cle,j1[cle],j2[cle],row,isRestore);
            }
        }
        else{
            row = table.insertRow(0)
            compare(row,j1['Nom'],isRestore);
        }
        if (!isRestore) {
            row.children[row.children.length-1].onanimationend = () => {
                console.log("Animation ended");
                win(j1['Nom'])
            };
            etatIndice()
            saveProgress()
        }
        console.log(j1['Nom']+" vs "+j2['Nom'])
    })
}

function compare(row,nom,isRestore = false) {
    let td = document.createElement('td');
    td.style.padding = '1%'
    let img = document.createElement('img');
    img.setAttribute('src',cache+"personnages/"+nom.replaceAll(' ','-')+".jpg")
    img.setAttribute('class','photoDescription');
    img.setAttribute('alt','photo');
    let p = document.createElement('p');
    p.appendChild(document.createTextNode(nom))
    p.style.marginTop = '0'
    td.appendChild(img);
    td.appendChild(p)
    if (nom===joueurDuJour || joueurDuJour.includes(nom)){
        td.style.backgroundColor='green'
        td.setAttribute('class','correct')
        if (getPageName()==="Multi"){
            if (!trouve.includes(nom)) {
                trouve.push(nom);
                revealMultiJoueur(nom, img.getAttribute("src"));
            }
        }
    }
    else{
        td.style.backgroundColor='red'
        td.setAttribute('class','incorrect')
    }
    row.appendChild(td);

    if(!isRestore && document.getElementById('blurred')&&document.getElementById('blurred').checked){
        if ((18-blur)>12)
            blur+=2
        else if ((18-blur)>6)
            blur+=1
        deblur()
    }
}

function win(nom1, isRestore = false){
    if(nom1===joueurDuJour || tousTrouves()){
        console.log('fini')
        csv.then((s)=>{
            let perso;
            for (let joueur of s){
                if (joueur['Nom']===nom1){
                    perso=joueur
                    break
                }
            }
            if (getPageName()==='Multi'){
                document.getElementById('NbEssais').innerText = document.getElementById('NbEssais').innerText.replaceAll("X",dejaVu.length-joueurDuJour.length)
                let joueurs = document.getElementById('winPersos');
                joueurs.className = "multi-win-roster";
                joueurs.innerHTML = "";
                document.querySelectorAll("#joueurs .multi-slot").forEach(function (slot) {
                    let img = document.createElement('img');
                    img.setAttribute('src', slot.querySelector("img").src);
                    img.setAttribute('class', 'photosVictoire');
                    img.setAttribute('alt', slot.getAttribute("data-nom"));
                    joueurs.appendChild(img);
                });
            }
            else{
                let img = document.getElementById('photoVictoire')
                img.setAttribute('src',cache+"personnages/"+perso['Photo'])
                document.getElementById('NbEssais').innerText = document.getElementById('NbEssais').innerText.replaceAll("X",dejaVu.length)
                document.getElementById('NomPerso').innerText = nom1
            }
            document.getElementById('victoire').style.display = 'flex'
            document.getElementById('formulaire').style.display = 'none'
            etatIndice()
            const scrollToVictoire = () => {
                document.getElementById('victoire').scrollIntoView({block:"center",inline:"nearest",behavior:"smooth"})
            }
            if (isRestore) {
                setTimeout(scrollToVictoire, 900)
            } else {
                requestAnimationFrame(scrollToVictoire)
            }
            if (getPageName()==="Classique"){
                buildClassiqueHistorique()
            }
            saveProgress()
        })
    }
}

// ===== Affichage de l'historique du mode classique =====

function buildClassiqueHistorique(){
    let table = document.getElementById("comp")
    let rows = table.getElementsByTagName('tr')
    let historique = document.getElementById('historique')
    historique.innerHTML = ""
    let compt=0
    for (let row of rows){
        let tds = row.getElementsByTagName("td")
        let emojis = ""
        for (let td of tds){
            if (td.classList.contains('classique')){
                if (td.style.backgroundColor==="orange")
                    emojis+="🟨"
                else if (td.style.backgroundColor==="green")
                    emojis+="🟩"
                else if (td.style.backgroundColor==="red"){
                    if (td.getElementsByClassName('sup').length!==0)
                        emojis+="⬆️"
                    else if(td.getElementsByClassName('inf').length!==0)
                        emojis+="⬇️"
                    else
                        emojis+="🟥"
                }
            }
        }
        if (emojis) {
            historique.innerHTML+=emojis+"<br>"
        }
        if (compt<=5)
            compt++
        else{
            historique.innerHTML+="+"+(rows.length-1-compt)+" de plus"
            break
        }
    }
}

// ===== Comparaison détaillée du mode classique =====

function compareClassique(cle,val1,val2,row,isRestore = false){
    let cles = ["Photo","Genre","Equipe","Poste","Element","Origine","Classe","Apparition"]
    if (cles.includes(cle)){
        if (!isRestore && dejaVu.length===1)//On retire les instructions si un premier joueur a été cherché
            document.getElementById('instructions').style.display = 'none'
        let td = document.createElement('td');
        if (!isRestore) {
            td.style.animationDelay = (cles.indexOf(cle)*0.6-0.6)+"s"
        }
        td.setAttribute('class','classique')
        if (cle==="Photo"){
            let img = document.createElement('img');
            img.setAttribute('src',cache+"personnages/"+val1)
            img.setAttribute('class','photo_comp');
            img.setAttribute('alt','photo');
            td.setAttribute('class','divPhoto')
            let divNom = document.createElement('div');
            divNom.setAttribute('class','divNom');
            divNom.appendChild(document.createTextNode(val1.slice(0,-4).replace('-',' ')))
            td.appendChild(img);
            td.appendChild(divNom)
        }
        else {
            td.appendChild(document.createTextNode(val1))
            if(cle==="Genre" || cle==="Element"){
                if (val1===val2){
                    td.style.backgroundColor= 'green'
                }
                else{
                    td.style.backgroundColor = 'red';
                }
            }
            else if (["Poste","Origine","Equipe"].includes(cle)){
                let nb= 0;
                let eq1= val1.split('-');
                let eq2 = val2.split('-');
                for (let eq in eq1){
                    eq = eq1[eq];
                    if (eq2.includes(eq)){
                        nb++;
                    }
                }
                if(nb===0){
                    td.style.backgroundColor = 'red';
                }

                else if (nb===eq2.length && nb===eq1.length){
                    td.style.backgroundColor = 'green';
                }
                else{
                    td.style.backgroundColor = 'orange';
                }
            }
            else if(["Classe","Apparition"].includes(cle)){
                if (val1===val2){
                    td.style.backgroundColor = 'green';
                }
                else{
                    td.style.backgroundColor = 'red';
                    if (cle==='Apparition'){
                        if (val1!=='Film'){
                            let j1Saison = val1.split(' ')[1];
                            let j2Saison = val2.split(' ')[1];
                            if (parseInt(j1Saison)>parseInt(j2Saison)){
                                let fleche = document.createElement('div');
                                fleche.setAttribute('class','inf');
                                td.appendChild(fleche)
                            }
                            else{
                                let fleche = document.createElement('div');
                                fleche.setAttribute('class','sup');
                                td.appendChild(fleche)
                            }
                        }
                    }
                    else{
                        let listeClasse = ["Poussin","6e","5e","4e","3e","Adulte"];
                        if (val1!=='Inconnue' && val2!=='Inconnue'){
                            let index1 = listeClasse.indexOf(val1);
                            let index2 = listeClasse.indexOf(val2);
                            if (index1>index2){
                                let fleche = document.createElement('div');
                                fleche.setAttribute('class','inf');
                                td.appendChild(fleche)
                            }
                            else{
                                let fleche = document.createElement('div');
                                fleche.setAttribute('class','sup');
                                td.appendChild(fleche)
                            }
                        }
                    }
                }
            }
        }
        row.appendChild(td);
        adjust(td)
    }


}

var precedent;

// ===== Recherche des personnages =====

function afficherPersos(){
    var ancien = document.getElementById('liste_carte');
    let nom = document.getElementById('guess').value;
    if (nom===precedent){
        return
    }
    else{
        precedent=nom
    }
    if (ancien){
        ancien.remove();
    }
    if (nom===""){
        return
    }

    let racine = document.getElementById('racine');
    let div = document.createElement('div');
    div.setAttribute('id','liste_carte');
    let table = document.createElement('table');
    table.setAttribute('id','table_carte')
    csv.then((s)=>{
        let vide = true;
        for (let joueur of s){
            let verifsurnom = VerifSurnoms(joueur['Surnoms'],nom)
            if ((VerifNom(joueur['Nom'],nom) || verifsurnom[0]) && !dejaVu.includes(joueur["Nom"])){
                let tr = document.createElement('tr');
                let td = document.createElement('td');
                td.setAttribute('class','row');
                td.setAttribute('id',joueur["Nom"]);
                if(vide){
                    td.classList.add('selected')
                }
                let carte = document.createElement('div');
                carte.setAttribute('class','carte');
                carte.setAttribute('name',joueur['Nom']);
                carte.setAttribute('onclick','afficheComparaison("'+joueur["Nom"]+'")');
                let img = document.createElement('img');
                img.setAttribute('src',cache+"personnages/"+joueur["Photo"]);
                img.setAttribute('alt','photoperso');
                img.setAttribute('class','photo_carte');
                carte.appendChild(img);
                let p = document.createElement('p');
                let texte = document.createTextNode(joueur['Nom']);
                p.appendChild(texte);
                if (verifsurnom[0]){
                    let surnom = document.createElement('p');
                    let texte2 = document.createTextNode('Alias : '+verifsurnom[1]);
                    surnom.appendChild(texte2);
                    let div = document.createElement('div');
                    surnom.setAttribute('class','surnom');
                    div.setAttribute('class','nomcontain');
                    div.appendChild(p);
                    div.appendChild(surnom);
                    carte.appendChild(div);

                }
                else{
                    carte.appendChild(p);
                }
                td.appendChild(carte);
                tr.appendChild(td);
                table.appendChild(tr);
                vide = false;
            }
        }
        if (vide){
            let tr = document.createElement('tr');
            let td = document.createElement('td');
            td.setAttribute('id','vide');
            let p = document.createElement('p');
            let texte = document.createTextNode("Aucun personnage n'a été trouvé.");
            p.appendChild(texte);
            td.appendChild(p);
            tr.appendChild(td);
            table.appendChild(tr);
        }
        div.appendChild(table);
        racine.appendChild(div);
    })
}

function adjust(td){
    let nb=100
    while (td.offsetHeight!==td.offsetWidth && nb>=50){
        td.style.fontSize = nb+"%"
        nb-=5
    }
}

function etatIndice(){
    let indices = document.getElementById('indices')
    if (!indices)
        return
    if (dejaVu.length>=2 || document.getElementById("victoire").style.display==='flex'){
        indices.style.display = 'flex';
    }
    else
        return
    for (let i=0;i<indices.children.length;i++){
        let indice = indices.children[i];
        let compt;
        if(document.getElementById('victoire').style.display==='flex')
            compt=0
        else if(i===0)
            compt = 6-dejaVu.length
        else
            compt = 9-dejaVu.length
        let p = indice.getElementsByTagName('p')[0]
        if (compt>0){
            p.innerText = p.innerText.slice(0,-9)+" "+compt+" essais"
            if(compt===1)
                p.innerText = p.innerText.slice(0,-1)
        }
        else if (compt===0 && !indice.classList.contains('disponible')){
            let logo =indice.getElementsByTagName('img')[0]
            logo.style.width = '27%'
            p.innerText = p.innerText.slice(0,-13)
            indice.classList.add('disponible')
            indice.setAttribute('onclick','revele('+indice.id+')')
        }

    }
}

// ===== Indices et éléments spécifiques au mode Multi =====

function revele(id){
    if (id.style.transform==='rotateY(180deg)')
        id.removeAttribute('style');
    else
        id.style.transform='rotateY(180deg)';
    saveProgress();
}

function updateMultiProgress(found, total) {
    var progress = document.getElementById("multi-progress");
    if (progress) {
        progress.textContent = found + " / " + total;
    }
}

function revealMultiJoueur(nom, photoSrc) {
    var slot = document.querySelector('#joueurs .multi-slot[data-nom="' + nom + '"]');
    if (!slot || slot.classList.contains("multi-slot--found")) {
        return;
    }

    slot.classList.add("multi-slot--found");
    slot.querySelector("img").setAttribute("src", photoSrc);
    slot.querySelector(".multi-slot-name").textContent = nom;
    slot.querySelector(".multi-slot-badge").textContent = "✓";

    var total = document.querySelectorAll("#joueurs .multi-slot").length;
    updateMultiProgress(trouve.length, total);
}

function getJoueursTechnique(technique, onReady){
    let joueurs = []
    csv.then((s)=>{
        let roster = document.getElementById('joueurs');
        roster.innerHTML = "";

        for (let joueur of s){
            let techniques = joueur['Multi'].split("-")
            if (techniques.includes(technique)){
                joueurs.push(joueur['Nom']);

                let slot = document.createElement("div");
                slot.className = "multi-slot";
                slot.setAttribute("data-nom", joueur["Nom"]);

                let avatar = document.createElement("div");
                avatar.className = "multi-slot-avatar";

                let img = document.createElement("img");
                img.setAttribute("alt", "Personnage mystère");
                img.setAttribute("class", "photoMulti");
                img.setAttribute("src", cache + "personnages/inconnu.jpg");

                let badge = document.createElement("span");
                badge.className = "multi-slot-badge";
                badge.textContent = "?";

                avatar.appendChild(img);
                avatar.appendChild(badge);

                let name = document.createElement("p");
                name.className = "multi-slot-name";
                name.textContent = "???";

                slot.appendChild(avatar);
                slot.appendChild(name);
                roster.appendChild(slot);
            }
        }

        joueurDuJour = joueurs;
        updateMultiProgress(trouve.length, joueurs.length);
        if (onReady) {
            onReady();
        }
    })
    return joueurs
}

function tousTrouves() {
    if (getPageName()!=="Multi")
        return false
    for (let joueur of joueurDuJour){
        if (!trouve.includes(joueur))
            return false
    }
    return true
}
