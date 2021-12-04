# But why...?
Well... I had to do a really basic project for my studies. The main issue is - in plain javascript. So I did it. 

First I've updated my DOM manipulation lib from 2015 to meet current ES standards. Then I've realised why I stopped using it. It was due to Vue 1. Soooo.. I decided to stay with the framework I most enjoy writing apps in.

I couldn't simply start the project in vue as I had to do it in plain js. I've implemented a reactivity system based on the information about the reactivity system of Vue 3. Then I decided to play with customElements or create a custom module based components. I chose the latter. 

The first implementation was quite simple: export all the things I want to use in the template and export the template as a string. Then I realized that writing `export` everytime I want to use something in the template is a pain in the ass. So I used eval to transform and execute the script.

It worked, but soon I realized: I can implement Vue's SFCs just like that! So I did it :) And here I am writing Vue components just like every day but in plain js :)