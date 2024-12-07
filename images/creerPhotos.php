<?php
function creerphoto(){
    $csv=fopen("joueurs.csv","r");
    fgetcsv($csv);
    while ($perso=fgetcsv($csv)) {
        if (!file_exists("personnages/".$perso[0])) {
            copy("personnages/inconnu.jpg","personnages/".$perso[0]);
        }
    }
    fclose($csv);
}
//creerphoto();
?>
