# Cahier des charges — application d’entraînement à la lecture des kana

**Version :** brouillon 0.2  
**Périmètre :** besoins fonctionnels et expérience utilisateur. Les choix techniques sont volontairement exclus pour être définis plus tard.

## 1. Objectif

Créer une application qui aide les débutants complets à apprendre à lire les kana japonais par la répétition et la frappe au clavier. L’exercice doit aussi leur faire découvrir du vocabulaire fréquent.

La première version se concentre sur les hiragana et les katakana. Les kanji pourront être envisagés dans une version ultérieure.

## 2. Public et plateformes

- L’application s’adresse d’abord aux débutants complets.
- Elle est conçue principalement pour être utilisée sur ordinateur, au clavier.
- Elle doit rester suffisamment responsive pour être utilisable sur mobile.
- Elle doit être disponible dans un navigateur et sous forme d’application à télécharger pour Windows et Linux.
- L’interface sera proposée en français et en anglais, avec priorité au français.

## 3. Déroulement d’une séance

1. L’utilisateur choisit le nombre de mots de la séance, pas les mots eux-mêmes.
2. L’application génère une suite de mots japonais fréquents, sans chercher à former des phrases.
3. Les mots sont affichés en kana ; l’utilisateur saisit leur lecture en romaji.
4. Une erreur doit être corrigée avant que l’utilisateur puisse poursuivre.
5. À la fin de chaque mot, sa traduction courte apparaît sous l’exercice.
6. La prononciation audio n’est pas prévue dans la V1.

Les mots ne doivent pas se répéter pendant une séance tant qu’il reste suffisamment de mots admissibles. Si le vocabulaire disponible est trop restreint, des répétitions sont permises.

## 4. Vocabulaire et sélection des mots

- Le vocabulaire comprend des mots fréquents du japonais écrit courant.
- Les mots habituellement écrits en kanji peuvent être présentés uniquement en kana.
- Les particules sont incluses. Leur fiche explicative doit préciser qu’il s’agit d’une particule et décrire sa fonction plutôt que de leur attribuer une traduction trompeusement simple.
- La sélection d’un mot est limitée aux kana déjà débloqués.
- **Priorité d’entraînement :** les séquences doivent favoriser les mots qui contiennent le dernier kana débloqué et les kana débloqués mais pas encore maîtrisés. La génération maximise leur présence lorsque le vocabulaire disponible le permet ; elle peut utiliser d’autres mots admissibles si ce vocabulaire ne suffit pas.
- Les mots fréquents qui deviennent accessibles avec un nouveau kana doivent contribuer à l’ordre de progression.

La traduction courte suit la langue choisie dans les options. Une fiche plus détaillée est accessible au survol, au focus clavier et au toucher. Elle peut notamment préciser le sens, l’usage ou la fonction grammaticale d’un mot.

## 5. Progression des kana

- La V1 comprend les hiragana et les katakana, chacun avec une progression et une mesure de maîtrise distinctes.
- Le parcours par défaut commence par les hiragana ; les katakana correspondants sont ensuite introduits.
- Les séances peuvent mélanger des mots en hiragana et en katakana dès que les kana nécessaires ont été appris.
- Les kana sont débloqués un par un.
- Le premier groupe de hiragana est choisi pour permettre de former rapidement des mots fréquents, plutôt que de suivre uniquement un ordre conventionnel.
- Le kana suivant est choisi selon les mots fréquents qu’il permet de pratiquer ; l’ordre gojūon sert de repère en cas d’égalité.
- La progression inclut les formes de base et étendues : kana avec marques de voisement, combinaisons telles que `きゃ`, petit `っ` et `ー` en katakana.
- Le déblocage tient compte de la vitesse et de la précision observées sur plusieurs essais. Le détail exact des seuils et du calcul reste à définir.

## 6. Vitesse, précision et erreurs

La vitesse est exprimée en **kana correctement saisis par minute**. Son seuil est personnalisable : l’utilisateur peut saisir une valeur précise ou choisir un preset — « facile / easy », « normal », « difficile / hard » — puis ajuster la valeur.

La précision et les erreurs sont également prises en compte pour la progression et le bilan. Les erreurs doivent être corrigées avant de passer à la suite et rester visibles dans les statistiques.

**Définition à confirmer :** une mesure possible de la précision serait le pourcentage de kana correctement saisis, en comptabilisant les erreurs corrigées. Le seuil de précision nécessaire au déblocage n’est pas encore fixé.

## 7. Interface d’entraînement et bilan

- Une table de référence des kana est placée en bas de l’écran, à l’emplacement du clavier virtuel de Keybr.
- La table montre les caractères et leur correspondance en romaji.
- Tous les kana sont visibles dès le départ ; ceux qui ne sont pas débloqués apparaissent grisés.
- Le bilan de fin de séance affiche la vitesse, la précision, les erreurs fréquentes, les kana débloqués et les mots rencontrés.
- Aucun historique détaillé des séances n’est nécessaire.

## 8. Saisie en romaji

Hepburn sert de forme de référence affichée, mais les variantes courantes doivent être acceptées. Par exemple, `し` peut être saisi `shi` ou `si`, et `ち` comme `chi` ou `ti`.

La liste complète des variantes acceptées et les règles de saisie des sons particuliers restent à préciser.

## 9. Données et fonctionnement hors ligne

- Aucun compte utilisateur n’est prévu.
- La progression est conservée sur l’appareil.
- L’utilisateur peut exporter et importer sa progression manuellement, notamment pour la transférer entre navigateur et application installée.
- Les exercices ne doivent pas dépendre d’une API et doivent être utilisables hors ligne.
- La prononciation audio est reportée à la V2.

## 10. Hors périmètre de la V1

- Exercices sur les kanji.
- Prononciation audio.
- Comptes et synchronisation automatique.
- Historique détaillé des séances.

## Points à préciser plus tard

- La définition exacte de la précision et le seuil requis pour débloquer un kana.
- Les valeurs proposées par les presets de vitesse.
- La liste exhaustive des variantes de saisie romaji acceptées.
- La quantité et les sources du vocabulaire, ainsi que ses informations de fréquence
