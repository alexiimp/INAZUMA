<?php
function creerphoto(){
    $csv=fopen("../joueurs.csv","r");
    fgetcsv($csv);
    $i = 0;
    while ($perso=fgetcsv($csv)) {
        if (!file_exists("personnages/".$perso[0])) {
            $i+=1;
            copy("personnages/inconnu.jpg","personnages/".$perso[0]);
        }
    }
    fclose($csv);
    echo "Ajout de ".$i." personnages avec succes";
}
creerphoto();

function nomsVideos(){
    $fichiers = scandir("techniques/");
    $i=0;
    foreach ($fichiers as $fichier) {
        if (strpos($fichier, "Clipchamp")){
            $i+=1;
            rename($fichier,substr($fichier,-26));
        }
    }
    echo "Changement de ".$i." noms de video avec succes";
}
nomsVideos();
?>
