<?php


function liste(){
    $csv=fopen("joueurs.csv","r");
    fgetcsv($csv);
    echo "<div id='liste_carte'><table id='tableau'>";

    while ($perso=fgetcsv($csv)) {

        echo "<tr><td><div id='carte'><img src='images/personnages/".$perso[0]."' alt='photo' id='photo_carte'>";
        echo "<p>".$perso[1]."</p></div></td></tr>";
    }

    echo "</table></div>";
}


echo "<head>
        <meta charset='utf-8'>
        <title>QUIESTCE</title>
        <link rel='stylesheet' type='text/css' href='style/style.css'>
</head>
<body>";
echo "<div> 
        <h1>Devinez le personnage d'inazuma d'aujourd'hui</h1>
       </div>";

echo "<form method='post' action='' id='formulaire'>
        <input type='text' name='guess' id='guess' placeholder='Nom de personnage, alias' onkeyup='ok()'>
        <input type='submit' value='Envoyer'>
       </form>
       <p id='caca'></p>
        ";
liste();
echo "<script>
    function ok(){
        var caca = document.getElementById('caca');
        caca.innerHTML = document.getElementById('guess').value;
    }
</script>";







echo "</body>";

