<?php


function liste(){
    $csv=fopen("joueurs.csv","r");
    fgetcsv($csv);
    echo "<div id='liste_carte'><table id='tableau'>";

    while ($perso=fgetcsv($csv)) {

        echo "<tr><td id='".$perso[0]."' style='display: none;'><div id='carte'><img src='images/personnages/".$perso[0]."' alt='photo' id='photo_carte'>";
        echo "<p>".$perso[1]."</p></div></td></tr>";
    }
    fclose($csv);
    echo "</table></div>";
}

function recherche($string){
    $liste = array();
    $csv=fopen("joueurs.csv","r");
    fgetcsv($csv);
    while ($perso=fgetcsv($csv)) {
        if (stripos($perso[1],$string)!==false || stripos($perso[2],$string)!==false) {
            $liste[] = $perso[1];

        }
    }
    fclose($csv);
    return $liste;

}

function creerphoto(){
    $csv=fopen("joueurs.csv","r");
    fgetcsv($csv);
    while ($perso=fgetcsv($csv)) {
        if (!file_exists("images/personnages/".$perso[0])) {
            copy("images/personnages/inconnu.jpg","images/personnages/".$perso[0]);
        }
    }
    fclose($csv);
}

creerphoto();

echo "<head>
        <meta charset='utf-8'>
        <title>QUIESTCE</title>
        <link rel='stylesheet' type='text/css' href='style/style.css'>
        <script src='https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
        
</head>
<body>";

echo '<script>
    fetch ("joueurs.csv").then((res) =>res.text()).then((text) => {
        
        var lignes = text.split("\r\n");
        var csv = [];
        var headers = lignes[0].split(",");
        for (var i = 1 ; i<lignes.length ; i++) {
            var obj = {};
            var current = lignes[i].split(",");
            for (var j = 0; j < current.length; j++) {
                obj[headers[j]] = current[j];
            }
            csv.push(obj);
        }
        console.log(csv[12]["Nom"]);
    })
    
</script>';


echo "<div> 
        <h1>Devinez le personnage d'inazuma d'aujourd'hui</h1>
       </div>";

echo "<form method='post' action='' id='formulaire'>
        <input type='text' name='guess' id='guess' placeholder='Nom de personnage, alias' onkeyup=''>
        <input type='submit' value='Envoyer'>
       </form>
        ";
liste();
foreach(recherche("mark") as $perso){
    echo $perso;
}








echo "</body>";

