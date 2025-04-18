async function getCsv(){
    let res= await fetch('joueurs.csv');
    let text=  await res.text();
    let doc = []
    let lignes = text.split("\r\n");
    const headers = lignes[0].split(",");
    for (var i = 1 ; i<lignes.length ; i++) {
        var obj = {};
        var current = lignes[i].split(",");
        for (var j = 0; j < current.length; j++) {
            obj[headers[j]] = current[j];
        }
        doc.push(obj);
    }
    if (getPageName()==='Classique'){
        let nb = Math.floor(Math.random()*doc.length)
        document.getElementById('joueurdujour').innerText = doc[nb]['Nom']
    }
    else{
        do{
            var nb = Math.floor(Math.random()*doc.length)
            document.getElementById('joueurdujour').innerText = doc[nb]['Nom']
            console.log(doc[nb][getPageName()])
        }
        while(!doc[nb][getPageName()])
    }
    getJoueurInfo()
    return doc
}
const csv = getCsv();
var joueurDuJour;
function getJoueurInfo(){
    joueurDuJour = document.getElementById('joueurdujour').innerText
    console.log(joueurDuJour)
    csv.then((s)=>{
        for (let joueur of s){
            if (joueur['Nom']===joueurDuJour){
                if(getPageName()==='Classique'){
                    document.getElementById('indiceApparition').getElementsByTagName('p')[1].innerText = joueur['Episode'].replaceAll(';',',')
                    let descriptions = joueur['Description'].split('-')
                    document.getElementById('indiceDescription').getElementsByTagName('p')[1].innerText = descriptions[Math.floor(Math.random()*descriptions.length)].replace(';',',')
                }
                else if (getPageName()==='Description'){
                    let descriptions = joueur['Description'].split('-')
                    document.getElementById('description').innerText = '"'+descriptions[Math.floor(Math.random()*descriptions.length)].replaceAll(';',',')+'"'
                    document.getElementById('indicePoste').getElementsByTagName('p')[1].innerText = joueur['Poste']
                    document.getElementById('indiceEquipe').getElementsByTagName('p')[1].innerText = joueur['Equipe']
                }
                else if(getPageName()==='Supertechniques'){
                    let techniques = joueur['Supertechniques'].split('-')
                    let img = document.getElementById('video')
                    img.setAttribute('alt','video de la technique normalement')
                    img.setAttribute('src','images/techniques/solo/'+techniques[Math.floor(Math.random()*techniques.length)])
                    let imgClaire = document.getElementById('videoClaire')
                    imgClaire.setAttribute('alt',img.getAttribute('alt'))
                    imgClaire.setAttribute('src',img.getAttribute('src'))
                    console.log(img.src)
                }
                else if (getPageName()===Multi)
                break
            }

        }
    })
}

const dejaVu =[];

function getPageName(){
    return document.getElementsByTagName('title')[0].innerText.replaceAll(" ","").split('-')[1]
}
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

function afficheComparaison(nom1){
    csv.then((s)=>{
        let j1;
        let j2;
        for (let joueur1 in s){
            joueur1=s[joueur1]
            if (joueur1['Nom'].toLowerCase()===nom1.toLowerCase()){
                j1=joueur1;
            }
            if (joueur1['Nom']===joueurDuJour){
                j2=joueur1;
            }
            if (j1 && j2)
                break //on quitte la boucle si les deux personnages sont trouvés
        }
        if (!j1){/*Si le nom ne correspond a aucun perso*/
            return
        }
        /*On reboot la liste de perso et le zone de texte*/
        let text = document.getElementById('guess')
        text.value = ""
        afficherPersos()
        dejaVu.push(j1['Nom']);
        let row;
        let table = document.getElementById('comp');
        if (getPageName()==='Classique'){
            row = table.insertRow(1)
            for (let cle in j1){
                compareClassique(cle,j1[cle],j2[cle],row);
            }
        }
        else{
            row = table.insertRow(0)
            compare(row,j1['Nom']);
        }
        row.children[row.children.length-1].onanimationend = () => {
            console.log("Animation ended");
            win(j1['Nom'])
        };
        etatIndice()
        console.log(j1['Nom']+" vs "+j2['Nom'])
    })
}

function compare(row,nom) {
    let td = document.createElement('td');
    td.style.padding = '1%'
    let img = document.createElement('img');
    img.setAttribute('src','images/personnages/'+nom.replaceAll(' ','-')+".jpg")
    img.setAttribute('class','photoDescription');
    img.setAttribute('alt','photo');
    let p = document.createElement('p');
    p.appendChild(document.createTextNode(nom))
    p.style.marginTop = '0'
    td.appendChild(img);
    td.appendChild(p)
    if (nom===joueurDuJour){
        td.style.backgroundColor='green'
        td.setAttribute('class','correct')
    }
    else{
        td.style.backgroundColor='red'
        td.setAttribute('class','incorrect')
    }
    row.appendChild(td);

    if(document.getElementById('blurred')&&document.getElementById('blurred').checked){
        if ((18-blur)>12)
            blur+=2
        else if ((18-blur)>6)
            blur+=1
        deblur()
    }
}

function win(nom1){
    if(nom1===joueurDuJour){
        console.log('fini')
        csv.then((s)=>{
            let perso;
            for (let joueur of s){
                if (joueur['Nom']===nom1){
                    perso=joueur
                    break
                }
            }
            let img = document.getElementById('photoVictoire')
            img.setAttribute('src','images/personnages/'+perso['Photo'])
            document.getElementById('NbEssais').innerText = document.getElementById('NbEssais').innerText.replaceAll("X",dejaVu.length)
            document.getElementById('NomPerso').innerText = nom1
            document.getElementById('victoire').style.display = 'flex'
            document.getElementById('formulaire').style.display = 'none'
            etatIndice()
            document.getElementById('victoire').scrollIntoView({block:"center",inline:"nearest",behavior:"smooth"})
        })
        if (getPageName()==="Classique"){
            let table = document.getElementById("comp")
            let rows = table.getElementsByTagName('tr')
            let historique = document.getElementById('historique')
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
                historique.innerHTML+=emojis+"<br>"
                if (compt<=5)
                    compt++
                else{
                    historique.innerHTML+="+"+(rows.length-1-compt)+" de plus"
                    break
                }
            }
        }
    }
}
function compareClassique(cle,val1,val2,row){
    let cles = ["Photo","Genre","Equipe","Poste","Element","Origine","Classe","Apparition"]
    if (cles.includes(cle)){
        if (dejaVu.length===1)//On retire les instructions si un premier joueur a été cherché
            document.getElementById('instructions').style.display = 'none'
        let td = document.createElement('td');
        td.style.animationDelay = (cles.indexOf(cle)*0.6-0.6)+"s"
        td.setAttribute('class','classique')
        if (cle==="Photo"){
            let img = document.createElement('img');
            img.setAttribute('src','images/personnages/'+val1)
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
                img.setAttribute('src','images/personnages/'+joueur["Photo"]);
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
function revele(id){
    if (id.style.transform==='rotateY(180deg)')
        id.removeAttribute('style');
    else
        id.style.transform='rotateY(180deg)';
}