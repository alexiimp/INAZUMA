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
?>
