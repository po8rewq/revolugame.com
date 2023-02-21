---
title: Sauvegarder une liste d'entiers dans un shared object
date: 2011-10-30
aliases: ['/sauvegarder-une-liste-dentiers-dans-un-shared-object/']
categories:
  - tutorials
---

Voici une petite astuce qui peut vous simplifier la vie. Dans un grand nombre de jeux, nous avons besoin de stocker la liste des niveaux terminés par le joueur, et de pouvoir y accéder rapidement. La méthode la plus simple est de stocker cette donnée dans un **SharedObject** que nous retrouverons à chaque lancement de session.

## Sauvegarde des données

Pour stocker une **liste d'entiers** dans un **SharedObject** sous la forme d'**un entier seul**, il faut sauvegarder la somme des puissances de 2 des valeurs souhaitées.

{{< highlight ActionScript >}}
var mySo:SharedObject = SharedObject.getLocal("myApplication");
var dataToSave : Array = [2, 5, 4];
var somme : int = 0;
for each(var data : int in dataToSave)
{
somme += Math.pow(2, data);
}
mySo.data.savedValue = somme;
{{< /highlight >}}

## Récupération des données

Et pour récupérer les données :

{{< highlight ActionScript >}}
var intValue : int = mySo.data.savedValue;
var currentIndex : int; // identifiant du niveau à tester
if( ( Math.pow(2, currentIndex) & intValue) > 0 )
{
// L'entier est bien présent dans la liste
}
{{< /highlight >}}
