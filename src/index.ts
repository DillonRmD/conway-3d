import { Game } from './Game';

const game = new Game();

document.addEventListener('DOMContentLoaded', function() {
    const nextGenerationButton = document.getElementById("next-generation-button-id");

    if (nextGenerationButton) {
        nextGenerationButton.addEventListener('click', function() {
            game.nextGeneration();
        });
    } else {
        alert('fuck')
    }
})

game.run();