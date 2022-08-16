---
title: 'LD #31 - Coloring'
aliases: /work/ld31.html
---

<style type="text/css">
    @font-face {
        font-family: pixelade;
        src: url("RobotoCondensed-Regular.ttf");
    }

    #game {
        width: 350px;
        background-color: #a1d5d3;
    }
</style>

> <a href="/coloring.html">Check out the new mobile version</a>

<p>
    The theme was <strong>Entire Game on One Screen</strong>. You can find the source code <a href="https://github.com/po8rewq/LD31">here</a> and vote <a href="http://ludumdare.com/compo/ludum-dare-31/?action=preview&uid=4401">here</a>.
</p>

<div class="grid">
    <div>
        <div id="game"></div>
    </div>
    <div>
        <h3>How to play ?</h3>
        <div>
          Select a column to drop the card in it.
          <br /><br />Two cards of the same color will merge into the next color (see the list below).
          <br /><br />Two red cards will disappear.
        </div>
        <br />
        <div>
            <div class="col-md-6">A card can remove cards only if they collide directly and are of the same color :</div>
            <div class="col-md-6"><img src="rules-collisions.png" width="100" height="100" /></div>
        </div>
        <br />
        <div>Colors will appear in this order: </div>
        <br />
        <div>
            <img src="card-seashell3.png" width="30" />
            <img src="card-yellow.png" width="30" />
            <img src="card-green.png" width="30" />
            <img src="card-green4.png" width="30" />
            <img src="card-blue.png" width="30" />
            <img src="card-pink.png" width="30" />
            <img src="card-orange.png" width="30" />
            <img src="card-red.png" width="30" />
        </div>
        <br />
        <div>
            You can't remove the black <img src="card-black.png" width="30" /> ones, but they have a limited time on the board.
        </div>
    </div>
</div>
<br />
<div class="row">
    <div class="col-md-6">
        <div class="alert alert-success" role="alert">
            Got ranked <strong>240</strong> out of <strong>1365</strong>.<br />Check out the results:
        </div>
    </div>
    <div class="grid">
        <img src="ld31-results.png" />
    </div>
</div>

<script type="text/javascript" src="ld31.js"></script>