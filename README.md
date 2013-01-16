CanvasRPG
=========

A framework for creating HTML5 Canvas RPG-type games, build on top of EaselJS

....very much a work in progress. The idea is to build a framework that could be reused for any game that uses an RPG-style world map. Mostly, this is an opportuntiy for me to learn how to use the HTML5 Canvas API, EaselJS, and show off some javascript OOP skills. Plus, I just love watching the mario guy walk around.

I make no claims to be a game developer, so I would love to hear feedback on how this framework could be restructured, or to hand it off to someone smarter than I to run with.

High on my to-do list are:
* Cache all passive objects (pipes, flowers, hills) to increase performace
* Learn about other ways to increase performance (you can see if you start upping the number of entities on the map, things slow down very quickly)
* Break-up the createjs.Entity hierarchy, to differentiate between
** Passive objects (pipes, flowers, hills)
** Active Objects
*** Hero (user controlled)
*** AI (computer controlled)

Of course, the fun part will be creating the AI entities, and making some sort of fighting interaction. But all in good time...
