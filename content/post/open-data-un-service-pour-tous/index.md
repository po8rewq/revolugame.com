---
title: "[FR] L'Open Data : un service pour tous"
date: 2013-06-02
aliases: ["/open-data-un-service-pour-tous/"]
tags:
- Haxe
- open data
---

<script src="https://code.jquery.com/jquery-3.6.0.slim.min.js" integrity="sha256-u7e5khyithlIdTpu22PHhENmPcRdFiHRjhAuHcs05RI=" crossorigin="anonymous"></script>

<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5.1/leaflet.css" />

<img alt="opendata1" src="img/opendata1-300x56.png" class="img-responsive" />

Malgré les efforts de l'État (<a href="http://etalab.gouv.fr">etalab</a>, <a href="http://www.data.gouv.fr/">data.gouv.fr</a>), nous pouvons observer une grande disparité entre les initiatives des différentes communes françaises concernant l'<a href="http://fr.wikipedia.org/wiki/Donn%C3%A9es_ouvertes">open data</a>.

De grandes villes ouvrent des portails accessibles par tous et mis à jour très régulièrement (pour ne pas tous les citer, on peut trouver <a href="http://data.nantes.fr">Nantes</a>, <a href="http://opendata.montpelliernumerique.fr">Montpellier</a>, <a href="http://data.grandtoulouse.fr">Toulouse</a> et même <a href="http://opendata.paris.fr">Paris</a>) alors que d'autres sont relativement en retard (non non, je ne parlerai pas de Lille...).

De mon point de vue, le <strong>partage de données</strong> publiques peut être d'une très grande utilité pour la collectivité. Des particuliers, voire même des entreprises, développent, depuis une initiative personnelle ou par le biais de concours (<a href="http://bemyapp.com/devkings2013/">Dev'Kings</a>, <a href="http://www.etalab.gouv.fr/pages/Presentation-6371441.html">Dataconnexions</a>...), des applications qui peuvent <strong>rendre la vie</strong> de tous les jours beaucoup <strong>plus simple</strong>.

Par exemple via des applications indiquant les emplacements de parking, les vélos en libre service, les transports en commun, etc. (la <a href="http://data.sncf.com">SNCF</a>, la <a href="http://data.ratp.fr/">RATP</a>, ou <a href="https://developer.jcdecaux.com/">JC Decaux</a> ayant ouvert leurs données récemment). Voire des applications touristiques, mais encore et surtout des statistiques.

Par exemple, voici une petite démo de ce qui peut être fait rapidement et qui pourrait être très utile dans certains cas, même si bien sûr je ne vous souhaite pas que ce genre de service vous soit un jour utile ;). J'ai décidé de prendre les informations concernant <a href="http://opendata.montpelliernumerique.fr/Defibrillateurs">les défibrillateurs de la ville de Montpellier</a> et de les afficher sur une carte, en y ajoutant la géolocalisation de l'utilisateur. Service tout bête qui ne m'a pas pris plus d'<strong>une heure</strong> (en comptant le nettoyage des données) pour afficher les positions des défibrillateurs sur une carte (via <a href="http://leafletjs.com">Leaflet</a>).

Et pourquoi ne pas en faire une application mobile, et en y ajoutant un <strong>guide</strong> sur l'utilisation d'un défibrillateur, et un bouton pour <strong>appeler rapidement les secours</strong> ?
Voilà ce qu'il serait possible de faire, simplement en partant d'une liste de coordonnées GPS mis à disposition par la ville de Montpellier.

Pour prendre un exemple concret, récemment j'ai développé une application permettant aux utilisateurs du réseau <a href="http://vlille.fr">V'Lille</a> de vérifier la disponibilité de vélos proches de leur position (<a href="http://revolugame.com/lille-aux-velos/">Lille Aux Vélos</a>).
Il m'a été difficile de me procurer les informations dont j'avais besoin. A aucun moment <a href="http://transpole.fr">Transpole</a> ne fait mention de son API ni même de ses données alors que tout est accessible sans restrictions...

Pourquoi développer cette application me direz-vous ? Pour la simple et bonne raison que Transpole a jugé utile de développer une application sur <a href="https://itunes.apple.com/fr/app/vlille/id500047408?mt=8">iPhone</a>, mais de simplement faire une application qui contient le site mobile (lent et pas vraiment utilisable) sur <a href="https://play.google.com/store/apps/details?id=com.transpole.vlille">Android</a>... Et puis, comme on dit : "on n'est jamais mieux servi que par soi-même" ;).

Alors on peut se demander pourquoi de grandes villes ou grands groupes ne font pas un petit effort qui irait certainement dans leur sens, en permettant à d'autres personnes de développer des services annexes aux leurs et donc de faciliter la vie de tous les jours à tant de gens ...

<div id="map_canvas" style="width: 690px; height: 400px; border: 3px solid #757575;">F5 if nothing shows</div>

* <a id="locateOnMap" href="#map_canvas">Trouver ma position (si inaccessible le centre de Montpellier est utilisé comme référence)</a>
* <a id="closerOnMap" href="#map_canvas">Trouver le défibrillateur le plus proche</a>

<script type="text/javascript" src="http://cdn.leafletjs.com/leaflet-0.5.1/leaflet.js"></script>
<script type="text/javascript" src="defibApp.js"></script>
