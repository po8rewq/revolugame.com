---
title: "AGE project setup"
date: 2012-07-01
tags:
- AGE
- Haxe
- NME
aliases: ["/age-project-setup/"]
---

Since the 0.2 version, you can quickly and easily install **AGE** in haxelib, just by using the ant task :

{{< highlight Bash shell scripts >}}
git clone https://github.com/po8rewq/AGE.git
ant
{{< /highlight >}}

For now, you can run the following command to setup a new project :

{{< highlight Bash shell scripts >}}
haxelib run AGE
{{< /highlight >}}

This will generate a **basic structure** for your project, with the **nmml** file, and the <a href="http://monodevelop.com/">MonoDevelop</a> - <a href="http://www.flashdevelop.org/">FlashDevelop</a> project files.

Here is the list of all arguments you can use :

 * **-help** : the help screen
 * **-output** : /your/project/directory (default: the current directory)
 * **-name** : Your Project Name
 * **-main** : MainProjectClass (default: Main)
 * **-size** : WIDTH HEIGHT (default: 800x600)
 * **-fps** : FPS (default: 30)
 * **-bgColor** : COLOR (default: 0xCECECE, you can use both 0xFF0000 and #FF0000 syntax)

> This tool has only been tested on Linux ...