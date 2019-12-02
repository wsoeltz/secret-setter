// Elements
const $gameControlsNavButton = document.querySelector('#gameControlsNavButton');
const $currentGameNavButton = document.querySelector('#currentGameNavButton');

$gameControlsNavButton.addEventListener('click', () => {
  $pregameContainer.classList.remove('hidden');
  $activeGameContainer.classList.add('hidden');
});
$currentGameNavButton.addEventListener('click', () => {
  $pregameContainer.classList.add('hidden');
  $activeGameContainer.classList.remove('hidden');
});
